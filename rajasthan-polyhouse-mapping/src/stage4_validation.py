"""
Stage 4 — Validation sampling.

Two modes:
  1. `--reference <points.csv>` : cross-check detections against known points
     you supply (e.g. a dealer-network dataset), matching within a distance
     threshold and reporting precision/recall against that reference set.
  2. Default: draw a random `sample_fraction` of detections (config.yaml) and
     write a review sheet with a direct Google Maps link per point, so you
     can eyeball each one against Google Earth / QGIS and fill in a
     `verified` column by hand.

Neither mode is a substitute for the other — reference-point matching tells
you about recall against places you already knew about; random sampling
tells you about precision (false-positive rate) across the whole output.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import geopandas as gpd
import pandas as pd
import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent


def make_review_sheet(detections_path: Path, cfg: dict, out_path: Path) -> None:
    gdf = gpd.read_file(detections_path)
    frac = cfg["stage4_validation"]["sample_fraction"]
    sample = gdf.sample(frac=frac, random_state=42) if len(gdf) else gdf

    sample = sample.copy()
    sample["maps_link"] = [
        f"https://www.google.com/maps/@{geom.y},{geom.x},19z/data=!3m1!1e3" for geom in sample.geometry
    ]
    sample["verified"] = ""  # fill in by hand: true_positive / false_positive / unsure
    sample["notes"] = ""

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sample.drop(columns="geometry").to_csv(out_path, index=False)
    print(f"Wrote {len(sample)}/{len(gdf)} ({frac:.0%}) review sample -> {out_path}")


def match_reference(detections_path: Path, reference_csv: Path, match_radius_m: float, out_path: Path) -> None:
    detections = gpd.read_file(detections_path).to_crs(epsg=7755)
    ref_df = pd.read_csv(reference_csv)
    ref = gpd.GeoDataFrame(
        ref_df, geometry=gpd.points_from_xy(ref_df["longitude"], ref_df["latitude"]), crs="EPSG:4326"
    ).to_crs(epsg=7755)

    matched = gpd.sjoin_nearest(ref, detections, how="left", max_distance=match_radius_m, distance_col="dist_m")
    n_matched = matched["id"].notna().sum()
    recall = n_matched / len(ref) if len(ref) else float("nan")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    matched.drop(columns="geometry").to_csv(out_path, index=False)
    print(f"Reference match: {n_matched}/{len(ref)} reference points matched (recall={recall:.1%})")
    print(f"Wrote match detail -> {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("district")
    parser.add_argument("--detections", default=None)
    parser.add_argument("--config", default=str(REPO_ROOT / "config.yaml"))
    parser.add_argument("--reference", default=None, help="CSV with latitude,longitude columns of known structures")
    parser.add_argument("--match-radius-m", type=float, default=30.0)
    args = parser.parse_args()

    with open(args.config) as f:
        cfg = yaml.safe_load(f)

    detections_path = Path(args.detections) if args.detections else REPO_ROOT / "data" / "outputs" / f"{args.district}_detections_deduped.geojson"

    if args.reference:
        out = REPO_ROOT / "data" / "outputs" / f"{args.district}_reference_match.csv"
        match_reference(detections_path, Path(args.reference), args.match_radius_m, out)
    else:
        out = REPO_ROOT / "data" / "outputs" / f"{args.district}_review_sample.csv"
        make_review_sheet(detections_path, cfg, out)

"""
Stage 3 — Dedup detections across overlapping tiles and attach district/tehsil.

Input: the raw per-tile detection list from Stage 2 (data/outputs/<district>_detections_raw.json).
Output: data/outputs/<district>_detections_deduped.geojson

Dedup rule: two detections whose centroids are within `dedup_radius_m` of each
other are treated as the same structure re-detected from adjacent/overlapping
tiles; the higher-confidence one is kept. This is deliberately simple —
if you start seeing merged/split structures at scale, switch to an IoU-based
polygon merge instead of a centroid-distance rule.

Tehsil-level join is a documented gap: the free boundary source used in
Stage 0 only has district-level (ADM2) polygons. Until a tehsil (ADM3)
source is wired in, the `tehsil` output column stays empty.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

REPO_ROOT = Path(__file__).resolve().parent.parent
DEDUP_RADIUS_M = 15  # ~ one structure's width; tune once real detections exist


def dedup(detections: list[dict]) -> list[dict]:
    if not detections:
        return []
    gdf = gpd.GeoDataFrame(
        detections,
        geometry=[Point(d["centroid_lon"], d["centroid_lat"]) for d in detections],
        crs="EPSG:4326",
    ).to_crs(epsg=7755)  # metres

    kept, dropped = [], set()
    sorted_idx = gdf.sort_values("confidence", ascending=False).index
    for i in sorted_idx:
        if i in dropped:
            continue
        kept.append(i)
        nearby = gdf.geometry.distance(gdf.geometry.loc[i]) <= DEDUP_RADIUS_M
        dropped.update(gdf.index[nearby & (gdf.index != i)])

    return [detections[i] for i in kept]


def attach_admin(detections: list[dict], districts_path: Path) -> gpd.GeoDataFrame:
    points = gpd.GeoDataFrame(
        detections,
        geometry=[Point(d["centroid_lon"], d["centroid_lat"]) for d in detections],
        crs="EPSG:4326",
    )
    districts = gpd.read_file(districts_path)[["district", "geometry"]]
    joined = gpd.sjoin(points, districts, how="left", predicate="within").drop(columns=["index_right"])
    joined["tehsil"] = None  # see module docstring — no free tehsil-level source wired in yet
    return joined


def run(district_name: str, detections_path: Path, districts_path: Path, out_path: Path) -> None:
    with open(detections_path) as f:
        detections = json.load(f)

    deduped = dedup(detections)
    print(f"{district_name}: {len(detections)} raw -> {len(deduped)} after dedup")

    gdf = attach_admin(deduped, districts_path)
    gdf.insert(0, "id", [f"{district_name.lower()}-{i:05d}" for i in range(len(gdf))])

    out_path.parent.mkdir(parents=True, exist_ok=True)
    gdf.to_file(out_path, driver="GeoJSON")
    print(f"Wrote {len(gdf)} deduped, geocoded detections -> {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("district")
    parser.add_argument("--detections", default=None)
    parser.add_argument("--districts", default=str(REPO_ROOT / "data" / "boundaries" / "rajasthan_districts.geojson"))
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    detections_path = Path(args.detections) if args.detections else REPO_ROOT / "data" / "outputs" / f"{args.district}_detections_raw.json"
    out = Path(args.out) if args.out else REPO_ROOT / "data" / "outputs" / f"{args.district}_detections_deduped.geojson"
    run(args.district, detections_path, Path(args.districts), out)

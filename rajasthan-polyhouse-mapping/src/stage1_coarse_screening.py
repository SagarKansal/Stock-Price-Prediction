"""
Stage 1 — Coarse statewide/district screening on Sentinel-2 (~10 m, free).

Requires:
  - `earthengine-api` + `geemap` installed (see requirements.txt)
  - A Google Earth Engine Cloud project registered for either noncommercial
    or commercial use (see README "Google Earth Engine setup" for exact
    steps and which tier applies to this project)
  - `earthengine authenticate` run once per machine/container, OR a service
    account key referenced via GOOGLE_APPLICATION_CREDENTIALS

This will raise immediately on import/init if you haven't done the above —
that's intentional, it's cheaper to fail loudly here than to silently
produce an empty candidate list.

Method: build a cloud-masked Sentinel-2 median composite over the date range,
compute NDVI and a brightness index, flag pixels that are simultaneously
bright (plastic/net sheeting) and NDVI-suppressed (the cover hides the crop
signal beneath it) relative to the local neighborhood, then cluster flagged
pixels into candidate zones sized well above single-pixel noise. This is a
recall-favoring screen, not a classifier — it exists to shrink the search
area before Stage 2's higher-resolution, higher-precision pass.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent


def load_config(path: Path) -> dict:
    with open(path) as f:
        return yaml.safe_load(f)


def mask_s2_clouds(image):
    import ee

    qa = image.select("QA60")
    cloud_bit_mask = 1 << 10
    cirrus_bit_mask = 1 << 11
    mask = (
        qa.bitwiseAnd(cloud_bit_mask)
        .eq(0)
        .And(qa.bitwiseAnd(cirrus_bit_mask).eq(0))
    )
    return image.updateMask(mask).divide(10000)


def build_candidate_zones(district_name: str, cfg: dict):
    """Returns an ee.FeatureCollection of candidate zone polygons for one district."""
    import ee
    import geemap

    ee.Initialize(project=cfg["gee"]["project"])

    boundary_path = REPO_ROOT / cfg["pilot"]["boundary_dir"] / f"{district_name.lower()}.geojson"
    if not boundary_path.exists():
        raise FileNotFoundError(
            f"{boundary_path} not found — run src/stage0_boundaries.py first, "
            f"or add '{district_name}' to PILOT_DISTRICTS there."
        )
    district_geom = geemap.geojson_to_ee(str(boundary_path))
    region = district_geom.geometry()

    s1 = cfg["stage1_coarse_screening"]
    start, end = cfg["gee"]["date_range"]

    s2 = (
        ee.ImageCollection(cfg["gee"]["sentinel2_collection"])
        .filterBounds(region)
        .filterDate(start, end)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", cfg["gee"]["max_cloud_pct"]))
        .map(mask_s2_clouds)
    )
    composite = s2.median().clip(region)

    ndvi = composite.normalizedDifference(["B8", "B4"]).rename("NDVI")
    # Brightness: mean reflectance across visible + NIR, a proxy for
    # plastic-sheet / net-fabric glare relative to surrounding bare soil/crop.
    brightness = composite.select(["B2", "B3", "B4", "B8"]).reduce(ee.Reducer.mean()).rename("BRIGHT")

    bright_thresh = brightness.reduceRegion(
        reducer=ee.Reducer.percentile([s1["brightness_percentile_threshold"]]),
        geometry=region,
        scale=10,
        maxPixels=1e9,
    )
    bright_thresh_value = ee.Number(bright_thresh.values().get(0))

    candidate_mask = (
        brightness.gte(bright_thresh_value)
        .And(ndvi.lte(s1["ndvi_max_threshold"]))
        .And(ndvi.gte(s1["exclude"]["thar_desert_ndvi_min"]))
        .selfMask()
    )

    # Morphological open to drop single/double-pixel salt noise before vectorizing.
    cleaned = candidate_mask.focal_min(1).focal_max(1)

    zones = cleaned.reduceToVectors(
        geometry=region,
        scale=10,
        geometryType="polygon",
        eightConnected=True,
        maxPixels=1e9,
    )

    def add_area(f):
        return f.set("area_sqm", f.geometry().area(1))

    zones = zones.map(add_area).filter(
        ee.Filter.gte("area_sqm", s1["min_cluster_pixels"] * 100)  # 10m pixels = 100 sqm each
    )
    return zones


def run(district_name: str, cfg_path: Path, out_path: Path) -> None:
    import ee

    cfg = load_config(cfg_path)
    zones = build_candidate_zones(district_name, cfg)
    geojson = zones.getInfo()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(geojson))
    print(f"{district_name}: {len(geojson['features'])} candidate zones -> {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("district", help="e.g. jaipur or sikar (must match a file in data/boundaries/)")
    parser.add_argument("--config", default=str(REPO_ROOT / "config.yaml"))
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    out = Path(args.out) if args.out else REPO_ROOT / "data" / "outputs" / f"{args.district}_candidate_zones.geojson"
    run(args.district, Path(args.config), out)

"""
Stage 0 — Administrative boundaries for Rajasthan.

Downloads district-level (GADM-derived, ADM2) boundaries for all of India from a
GitHub-hosted mirror, filters to Rajasthan, and writes:
  - data/boundaries/rajasthan_state.geojson    (dissolved state outline)
  - data/boundaries/rajasthan_districts.geojson (32 districts)
  - data/boundaries/<district>.geojson          (one file per pilot district)

Source: https://github.com/geohacker/india (district/india_district.geojson),
a long-standing community mirror of GADM level-2 boundaries for India. It is
NOT an official Survey of India product — treat district edges as approximate
(a few hundred metres) rather than legally authoritative. For anything that
needs to be legally precise (subsidy jurisdiction boundaries, tehsil-level
cadastral work), swap in Bhuvan / Survey of India data once you have access
to those portals from an environment that isn't network-restricted the way
this one is (see README "Environment constraints found").

Tehsil-level boundaries are NOT available from this free source for Rajasthan
at usable quality — that gap is called out explicitly in the README.
"""

import json
from pathlib import Path

import geopandas as gpd

INDIA_DISTRICTS_URL = (
    "https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson"
)

REPO_ROOT = Path(__file__).resolve().parent.parent
BOUNDARIES_DIR = REPO_ROOT / "data" / "boundaries"

PILOT_DISTRICTS = ["Jaipur", "Sikar"]


def fetch_india_districts(cache_path: Path) -> gpd.GeoDataFrame:
    if not cache_path.exists():
        import requests

        cache_path.parent.mkdir(parents=True, exist_ok=True)
        resp = requests.get(INDIA_DISTRICTS_URL, timeout=60)
        resp.raise_for_status()
        cache_path.write_bytes(resp.content)
    return gpd.read_file(cache_path)


def build_rajasthan_boundaries() -> None:
    BOUNDARIES_DIR.mkdir(parents=True, exist_ok=True)
    raw_cache = BOUNDARIES_DIR / "_india_districts_raw.geojson"

    india = fetch_india_districts(raw_cache)
    raj_districts = india[india["NAME_1"] == "Rajasthan"].copy()
    if raj_districts.empty:
        raise RuntimeError("No Rajasthan features found — source schema may have changed.")

    raj_districts = raj_districts[["NAME_1", "NAME_2", "geometry"]].rename(
        columns={"NAME_1": "state", "NAME_2": "district"}
    )
    raj_districts.set_crs(epsg=4326, inplace=True, allow_override=True)

    districts_path = BOUNDARIES_DIR / "rajasthan_districts.geojson"
    raj_districts.to_file(districts_path, driver="GeoJSON")
    print(f"Wrote {len(raj_districts)} districts -> {districts_path}")

    state_geom = raj_districts.union_all()
    state_gdf = gpd.GeoDataFrame({"state": ["Rajasthan"]}, geometry=[state_geom], crs="EPSG:4326")
    state_path = BOUNDARIES_DIR / "rajasthan_state.geojson"
    state_gdf.to_file(state_path, driver="GeoJSON")
    print(f"Wrote state outline -> {state_path}")

    for name in PILOT_DISTRICTS:
        subset = raj_districts[raj_districts["district"] == name]
        if subset.empty:
            print(f"WARNING: pilot district '{name}' not found in source data")
            continue
        out_path = BOUNDARIES_DIR / f"{name.lower()}.geojson"
        subset.to_file(out_path, driver="GeoJSON")
        area_sqkm = subset.to_crs(epsg=7755).area.sum() / 1e6  # EPSG:7755 = India LCC, metres
        print(f"Wrote pilot district {name} ({area_sqkm:,.0f} sq km) -> {out_path}")

    raw_cache.unlink(missing_ok=True)


if __name__ == "__main__":
    build_rajasthan_boundaries()

"""
Stage 5 — Final outputs: CSV / GeoJSON / KML, an interactive folium map, and
a summary report (statewide/district-wise count, size histogram).

CSV schema (per the spec): id, latitude, longitude, district, tehsil,
estimated_area_sqm, structure_type, confidence, imagery_date, imagery_source,
detection_method
"""

from __future__ import annotations

import argparse
from pathlib import Path

import folium
import geopandas as gpd
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent

CSV_COLUMNS = [
    "id",
    "latitude",
    "longitude",
    "district",
    "tehsil",
    "estimated_area_sqm",
    "structure_type",
    "confidence",
    "imagery_date",
    "imagery_source",
    "detection_method",
]


def to_output_frame(gdf: gpd.GeoDataFrame, imagery_date: str, imagery_source: str) -> pd.DataFrame:
    df = pd.DataFrame(
        {
            "id": gdf["id"],
            "latitude": gdf.geometry.y,
            "longitude": gdf.geometry.x,
            "district": gdf.get("district"),
            "tehsil": gdf.get("tehsil"),
            "estimated_area_sqm": gdf.get("area_sqm"),
            "structure_type": gdf.get("structure_type"),
            "confidence": gdf.get("confidence"),
            "imagery_date": imagery_date,
            "imagery_source": imagery_source,
            "detection_method": gdf.get("method"),
        }
    )
    return df[CSV_COLUMNS]


def build_map(df: pd.DataFrame, out_path: Path) -> None:
    if df.empty:
        center = [26.9, 75.8]  # Jaipur fallback
    else:
        center = [df["latitude"].mean(), df["longitude"].mean()]
    m = folium.Map(location=center, zoom_start=11, tiles="CartoDB positron")
    for _, row in df.iterrows():
        folium.CircleMarker(
            location=[row["latitude"], row["longitude"]],
            radius=4,
            color="#c1440e",
            fill=True,
            fill_opacity=0.7,
            popup=(
                f"{row['id']}<br>type: {row['structure_type']}<br>"
                f"area: {row['estimated_area_sqm']:.0f} sqm<br>confidence: {row['confidence']:.2f}"
                if pd.notna(row.get("estimated_area_sqm"))
                else row["id"]
            ),
        ).add_to(m)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    m.save(str(out_path))
    print(f"Wrote interactive map -> {out_path}")


def build_summary(df: pd.DataFrame, out_path: Path) -> None:
    lines = ["# Detection Summary", ""]
    lines.append(f"Total detections: {len(df)}")
    lines.append("")
    lines.append("## By district")
    lines.append(df.groupby("district").size().sort_values(ascending=False).to_markdown() if len(df) else "(no detections)")
    lines.append("")
    lines.append("## Size distribution (sqm)")
    if len(df) and df["estimated_area_sqm"].notna().any():
        lines.append(df["estimated_area_sqm"].describe().to_markdown())
    else:
        lines.append("(no area data)")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(str(x) for x in lines))
    print(f"Wrote summary report -> {out_path}")


def run(district_name: str, detections_path: Path, imagery_date: str, imagery_source: str, out_dir: Path) -> None:
    gdf = gpd.read_file(detections_path)
    df = to_output_frame(gdf, imagery_date, imagery_source)

    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = out_dir / f"{district_name}_detections.csv"
    df.to_csv(csv_path, index=False)
    print(f"Wrote {len(df)} rows -> {csv_path}")

    geojson_path = out_dir / f"{district_name}_detections.geojson"
    gdf.to_file(geojson_path, driver="GeoJSON")
    print(f"Wrote GeoJSON -> {geojson_path}")

    try:
        import simplekml

        kml = simplekml.Kml()
        for _, row in df.iterrows():
            pnt = kml.newpoint(name=str(row["id"]), coords=[(row["longitude"], row["latitude"])])
            pnt.description = f"type={row['structure_type']} area={row['estimated_area_sqm']} conf={row['confidence']}"
        kml_path = out_dir / f"{district_name}_detections.kml"
        kml.save(str(kml_path))
        print(f"Wrote KML -> {kml_path}")
    except ImportError:
        print("simplekml not installed — skipping KML export (pip install simplekml)")

    build_map(df, out_dir / f"{district_name}_map.html")
    build_summary(df, out_dir / f"{district_name}_summary.md")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("district")
    parser.add_argument("--detections", default=None)
    parser.add_argument("--imagery-date", default="unknown")
    parser.add_argument("--imagery-source", default="ESRI World Imagery")
    parser.add_argument("--out-dir", default=str(REPO_ROOT / "data" / "outputs"))
    args = parser.parse_args()

    detections_path = Path(args.detections) if args.detections else REPO_ROOT / "data" / "outputs" / f"{args.district}_detections_deduped.geojson"
    run(args.district, detections_path, args.imagery_date, args.imagery_source, Path(args.out_dir))

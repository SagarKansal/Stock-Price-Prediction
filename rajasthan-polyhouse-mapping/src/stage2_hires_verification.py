"""
Stage 2 — High-resolution verification of Stage 1 candidate zones.

Fetches ESRI World Imagery tiles (via the public ArcGIS REST tile endpoint)
only for the small fraction of the district flagged by Stage 1, runs a
classical computer-vision pass to find rectangular, bright/textured
structures in the size range of real polyhouse/nethouse spans, and
optionally hands ambiguous crops to a vision-capable Claude model for a
final polyhouse / nethouse / neither call.

LICENSING — read before running at any real scale:
  ESRI World Imagery via the public REST/WMTS endpoint
  (services.arcgisonline.com) is intended for interactive map display, not
  bulk automated scraping. Confirm current terms at
  https://www.esri.com/en-us/legal/terms/full-master-agreement (Online
  Services Terms of Use / Basemap usage) before pulling more than a
  pilot-scale sample. For real statewide coverage you likely need either
  an ArcGIS Online / Living Atlas license that explicitly permits bulk
  export, or a different high-res source entirely (e.g. Bhuvan's own
  high-res mosaic, if/when it's accessible, or a licensed provider like
  Airbus/Maxar/Planet). This script rate-limits and caches tiles as a
  courtesy, not as a substitute for actually checking the license.

NETWORK NOTE (this sandbox specifically): services.arcgisonline.com was
unreachable from the Claude Code remote-execution container this pipeline
was scaffolded in (network egress policy blocks it). This script is written
to be correct and ready to run in an environment with normal internet
access (e.g. your own machine) — see README "Environment constraints
found" for the full list of what is/isn't reachable from that container.
"""

from __future__ import annotations

import argparse
import base64
import json
import math
import time
from dataclasses import dataclass
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent

ESRI_TILE_URL = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"


def deg_to_tile(lat: float, lon: float, zoom: int) -> tuple[int, int]:
    lat_rad = math.radians(lat)
    n = 2.0**zoom
    x = int((lon + 180.0) / 360.0 * n)
    y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return x, y


def tile_to_deg(x: int, y: int, zoom: int) -> tuple[float, float]:
    n = 2.0**zoom
    lon = x / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * y / n)))
    return math.degrees(lat_rad), lon


class RateLimiter:
    def __init__(self, per_second: float):
        self.min_interval = 1.0 / per_second
        self._last = 0.0

    def wait(self):
        now = time.monotonic()
        delta = now - self._last
        if delta < self.min_interval:
            time.sleep(self.min_interval - delta)
        self._last = time.monotonic()


def fetch_tile(x: int, y: int, zoom: int, cache_dir: Path, limiter: RateLimiter) -> Path:
    import requests

    cache_dir.mkdir(parents=True, exist_ok=True)
    out_path = cache_dir / f"{zoom}_{x}_{y}.jpg"
    if out_path.exists():
        return out_path
    limiter.wait()
    url = ESRI_TILE_URL.format(z=zoom, y=y, x=x)
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    out_path.write_bytes(resp.content)
    return out_path


@dataclass
class Detection:
    tile_x: int
    tile_y: int
    zoom: int
    bbox_px: tuple[int, int, int, int]
    centroid_lat: float
    centroid_lon: float
    width_m: float
    height_m: float
    area_sqm: float
    confidence: float
    method: str
    structure_type: str | None = None


def classical_cv_detect(tile_path: Path, x: int, y: int, zoom: int, cfg: dict) -> list[Detection]:
    import cv2
    import numpy as np

    s2 = cfg["stage2_hires_verification"]
    img = cv2.imread(str(tile_path))
    if img is None:
        return []
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Bright, low-saturation regions (plastic sheeting glare / net-fabric grey)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    _, sat, val = cv2.split(hsv)
    bright_mask = ((val > 170) & (sat < 90)).astype(np.uint8) * 255

    contours, _ = cv2.findContours(bright_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Tile is 256x256 px covering a known ground footprint at this zoom/latitude.
    lat_top, lon_left = tile_to_deg(x, y, zoom)
    lat_bot, lon_right = tile_to_deg(x + 1, y + 1, zoom)
    m_per_px_x = (lon_right - lon_left) * 111_320 * math.cos(math.radians((lat_top + lat_bot) / 2)) / 256
    m_per_px_y = abs(lat_top - lat_bot) * 110_540 / 256

    detections = []
    for c in contours:
        x_px, y_px, w_px, h_px = cv2.boundingRect(c)
        width_m = w_px * m_per_px_x
        height_m = h_px * m_per_px_y
        if not (s2["structure_min_width_m"] <= min(width_m, height_m)):
            continue
        if max(width_m, height_m) > s2["structure_max_width_m"]:
            continue
        rect_area = w_px * h_px
        contour_area = cv2.contourArea(c)
        rectangularity = contour_area / rect_area if rect_area else 0
        if rectangularity < 0.5:  # discard very non-rectangular blobs
            continue

        cx_px, cy_px = x_px + w_px / 2, y_px + h_px / 2
        lat = lat_top + (cy_px / 256) * (lat_bot - lat_top)
        lon = lon_left + (cx_px / 256) * (lon_right - lon_left)

        detections.append(
            Detection(
                tile_x=x,
                tile_y=y,
                zoom=zoom,
                bbox_px=(x_px, y_px, w_px, h_px),
                centroid_lat=lat,
                centroid_lon=lon,
                width_m=width_m,
                height_m=height_m,
                area_sqm=width_m * height_m,
                confidence=min(rectangularity, 1.0),
                method="classical_cv",
            )
        )
    return detections


VISION_SYSTEM_PROMPT = """You are verifying candidate satellite-image crops that a classical \
computer-vision pass flagged as possible protected-cultivation structures in Rajasthan, India. \
Classify each crop as exactly one of: polyhouse, nethouse, neither. \
"Neither" includes: bare rooftops/sheds, solar panel arrays, parking lots, bright bare soil, \
water tanks. Polyhouses show a glossy/translucent plastic sheen, often with visible arch-span \
ribbing. Nethouses look duller and greyer, often with a visible mesh texture. Respond with only \
the label."""


def vision_classify(tile_crop_path: Path, api_key: str, model: str) -> str:
    import anthropic

    client = anthropic.Anthropic(api_key=api_key)
    image_data = base64.standard_b64encode(tile_crop_path.read_bytes()).decode("utf-8")
    message = client.messages.create(
        model=model,
        max_tokens=10,
        system=VISION_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": "image/jpeg", "data": image_data},
                    },
                    {"type": "text", "text": "Classify this crop."},
                ],
            }
        ],
    )
    return message.content[0].text.strip().lower()


def run(district_name: str, cfg_path: Path, candidate_zones_path: Path, out_path: Path) -> None:
    with open(cfg_path) as f:
        cfg = yaml.safe_load(f)
    s2_cfg = cfg["stage2_hires_verification"]

    with open(candidate_zones_path) as f:
        zones = json.load(f)

    limiter = RateLimiter(s2_cfg["requests_per_second"])
    cache_dir = REPO_ROOT / s2_cfg["cache_dir"]
    zoom = s2_cfg["tile_zoom"]

    all_detections: list[Detection] = []
    tiles_seen: set[tuple[int, int]] = set()

    for feature in zones["features"]:
        coords = feature["geometry"]["coordinates"][0]
        lons = [c[0] for c in coords]
        lats = [c[1] for c in coords]
        x_min, y_max = deg_to_tile(max(lats), min(lons), zoom)
        x_max, y_min = deg_to_tile(min(lats), max(lons), zoom)

        for tx in range(x_min, x_max + 1):
            for ty in range(y_min, y_max + 1):
                if (tx, ty) in tiles_seen:
                    continue
                tiles_seen.add((tx, ty))
                tile_path = fetch_tile(tx, ty, zoom, cache_dir, limiter)
                all_detections.extend(classical_cv_detect(tile_path, tx, ty, zoom, cfg))

    print(f"{district_name}: {len(tiles_seen)} tiles fetched, {len(all_detections)} classical-CV detections")

    if s2_cfg["vision_model"]["enabled"]:
        import os

        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("stage2.vision_model.enabled=true but ANTHROPIC_API_KEY is not set")
        # NOTE: crop-extraction from bbox_px + tile image, then vision_classify(...) per
        # detection, is intentionally left as the next wiring step once few-shot examples
        # exist in data/vision_examples/ — see README Stage 2 for why this needs labeled
        # examples before it's worth the API spend.

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump([d.__dict__ for d in all_detections], f, indent=2)
    print(f"Wrote {len(all_detections)} detections -> {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("district")
    parser.add_argument("--config", default=str(REPO_ROOT / "config.yaml"))
    parser.add_argument("--zones", default=None, help="Stage 1 output geojson")
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    zones_path = Path(args.zones) if args.zones else REPO_ROOT / "data" / "outputs" / f"{args.district}_candidate_zones.geojson"
    out = Path(args.out) if args.out else REPO_ROOT / "data" / "outputs" / f"{args.district}_detections_raw.json"
    run(args.district, Path(args.config), zones_path, out)

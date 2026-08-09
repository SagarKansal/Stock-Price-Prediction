"""
Orchestrator CLI for the full pilot-district pipeline.

    python src/pipeline.py boundaries
    python src/pipeline.py run jaipur
    python src/pipeline.py run sikar --skip-stage1   # reuse existing candidate zones

Each stage is also independently runnable (see src/stageN_*.py --help) —
this just chains them with sane defaults for a single district end to end.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SRC = REPO_ROOT / "src"


def sh(*args: str) -> None:
    print(f"$ {' '.join(args)}")
    subprocess.run([sys.executable, *args], check=True, cwd=REPO_ROOT)


def run_district(district: str, skip_stage1: bool, skip_stage2: bool) -> None:
    if not skip_stage1:
        sh(str(SRC / "stage1_coarse_screening.py"), district)
    if not skip_stage2:
        sh(str(SRC / "stage2_hires_verification.py"), district)
    sh(str(SRC / "stage3_dedup_geocode.py"), district)
    sh(str(SRC / "stage4_validation.py"), district)
    sh(str(SRC / "stage5_export.py"), district)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("boundaries", help="Fetch Rajasthan state/district boundaries (Stage 0)")

    run_p = sub.add_parser("run", help="Run the full pipeline for one district")
    run_p.add_argument("district")
    run_p.add_argument("--skip-stage1", action="store_true")
    run_p.add_argument("--skip-stage2", action="store_true")

    args = parser.parse_args()

    if args.command == "boundaries":
        sh(str(SRC / "stage0_boundaries.py"))
    elif args.command == "run":
        run_district(args.district, args.skip_stage1, args.skip_stage2)

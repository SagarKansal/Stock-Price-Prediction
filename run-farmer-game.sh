#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8080}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

printf "\n🌾 Starting Farm Shield Challenge...\n"
printf "Open this URL on your device browser:\n"
printf "http://localhost:%s/farmer-engagement-game/index.html\n\n" "$PORT"
printf "Press Ctrl+C to stop the server.\n\n"

python -m http.server "$PORT" --directory "$ROOT_DIR"

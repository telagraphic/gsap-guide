#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8000}"
BASE="http://localhost:${PORT}"
echo "Serving split-text at ${BASE}/"
echo ""
echo "  Index:              ${BASE}/"
echo "  Basics — headlines: ${BASE}/basics/index.html"
echo "  Basics — body copy: ${BASE}/basics/body.html"
echo ""
echo "Shift+C toggles the typography playground on demo pages."
exec python3 -m http.server "$PORT"

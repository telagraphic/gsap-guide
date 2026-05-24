#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8000}"
BASE="http://localhost:${PORT}"
echo "Serving split-text at ${BASE}/"
echo ""
echo "  Index:              ${BASE}/"
echo "  Playground v2:      ${BASE}/playground-v2/tuner/index.html"
echo "  Basics — headlines: ${BASE}/basics/index.html"
echo "  Basics — body copy: ${BASE}/basics/body.html"
echo ""
echo "  v2 tuner: Cmd+K panel · v1 demos: Shift+C typography"
exec python3 -m http.server "$PORT"

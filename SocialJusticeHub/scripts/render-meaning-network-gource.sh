#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

node "$SCRIPT_DIR/generate-gource-meaning-log.cjs"

OUTPUT="$ROOT_DIR/client/public/meaning-network-gource.mp4"

gource "$SCRIPT_DIR/meaning-network.gource.log" \
  --log-format custom \
  --background-colour 0B0F1A \
  --font-colour C9D3E0 \
  --filename-colour E2E8F0 \
  --dir-colour 64748B \
  --highlight-users \
  --auto-skip-seconds 0.3 \
  --seconds-per-day 0.7 \
  --file-idle-time 16 \
  --max-files 0 \
  --camera-mode overview \
  --padding 1.2 \
  --bloom-multiplier 1.5 \
  --bloom-intensity 0.9 \
  --user-scale 1.1 \
  --elasticity 0.15 \
  --file-font-size 13 \
  --filename-time 6 \
  --hide progress,mouse,date,usernames \
  --output-ppm-stream - \
  --output-framerate 30 \
  --viewport 1280x720 \
| ffmpeg -y -r 30 -f image2pipe -vcodec ppm -i - \
  -vcodec libx264 -preset veryfast -profile:v high -pix_fmt yuv420p -crf 20 \
  -movflags +faststart "$OUTPUT"

echo "Saved: $OUTPUT"

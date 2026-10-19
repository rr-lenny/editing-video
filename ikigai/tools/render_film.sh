#!/bin/bash
# Linux port of the skill's render_film.sh: parallel headless-Chromium capture (capture.mjs) → ffmpeg H.264 + voice-over.
# usage: tools/render_film.sh [draft|final] [audio] [out.mp4]
set -e
P="$(cd "$(dirname "$0")/.." && pwd)"; MODE="${1:-draft}"; AUD="${2:-$P/audio/voix-off.mp3}"; OUT="${3:-$P/ikigai_$MODE.mp4}"
export HFT_BROWSER="${HFT_BROWSER:-/opt/pw-browsers/chromium}"
FR="$P/.frames_$MODE"; rm -rf "$FR"; mkdir -p "$FR"
DUR=$(node -e "const s=require('fs').readFileSync('$P/comp/scenes.js','utf8');const m=s.match(/dur:\s*([0-9.]+)/);console.log(m?m[1]:30)")
N=4; EXT=$([ "$MODE" = final ] && echo "" || echo "--jpg"); CRF=$([ "$MODE" = final ] && echo 14 || echo 18)
for i in $(seq 0 $((N-1))); do A=$(python3 -c "print(round($DUR*$i/$N,4))"); B=$(python3 -c "print(round($DUR*($i+1)/$N,4))"); node "$P/tools/capture.mjs" "$P/comp/index.html" "$FR" --from $A --to $B $EXT > "$FR.log$i" 2>&1 & sleep 1.5; done; wait
TOTAL=$(python3 -c "import math;print(math.ceil($DUR*24-1e-6))"); CNT=$(ls "$FR" | wc -l)
echo "captured $CNT/$TOTAL frames"; [ "$CNT" -lt "$TOTAL" ] && { echo "missing frames, see $FR.log*"; exit 1; }
PAT=$([ "$MODE" = final ] && echo 'f_%05d.png' || echo 'f_%05d.jpg')
ffmpeg -hide_banner -loglevel error -y -framerate 24 -i "$FR/$PAT" -i "$AUD" -map 0:v -map 1:a -c:v libx264 -preset slow -crf $CRF -pix_fmt yuv420p -c:a aac -b:a 192k -t "$DUR" -movflags +faststart "$OUT"
rm -f "$FR".log*; echo "$OUT"

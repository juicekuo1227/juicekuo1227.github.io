#!/usr/bin/env bash
# 用法: scripts/gen-illustration.sh "<主體描述(英文)>" <輸出路徑.png>
# 依賴: GEMINI_API_KEY、jq、python3
set -euo pipefail
SUBJECT="${1:?需要主體描述}"
OUT="${2:?需要輸出路徑}"
: "${GEMINI_API_KEY:?GEMINI_API_KEY 未設定}"
STYLE="flat illustration, pastel colors, soft shadows, rounded shapes, centered composition, warm and friendly atmosphere, no text, no letters"
PROMPT="${SUBJECT}, ${STYLE}"
mkdir -p "$(dirname "$OUT")"
BODY="$(jq -n --arg p "$PROMPT" '{contents:[{parts:[{text:$p}]}]}')"
RESP="$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}" -H 'Content-Type: application/json' -d "$BODY")"
printf '%s' "$RESP" | python3 -c '
import sys,json,base64
d=json.load(sys.stdin)
if "error" in d:
    sys.stderr.write("API ERROR: "+str(d["error"].get("message",""))[:300]+"\n"); sys.exit(1)
img=None
for p in d.get("candidates",[{}])[0].get("content",{}).get("parts",[]):
    if "inlineData" in p: img=p["inlineData"]["data"]
if not img:
    sys.stderr.write("回應無圖像\n"); sys.exit(1)
open(sys.argv[1],"wb").write(base64.b64decode(img))
' "$OUT"
echo "✅ 產出 $OUT"

#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Install jq and rerun." >&2
  exit 1
fi

API_BASE="${WALLET_API_URL:-https://www.bizcurrency.com:20500/api/v1}"
CALLER_ID="${WALLET_CALLER_ID:-12FDEC27-6E1F-4EC5-BF15-1C7E75A99117}"

LOGIN_USERNAME="${DOWNLOAD_USERNAME:-pocuser325812410}"
LOGIN_PASSWORD="${DOWNLOAD_PASSWORD:-TestPass123}"
FILE_ATTACHMENT_ID="${FILE_ATTACHMENT_ID:-}"
OUTPUT_FILE="${OUTPUT_FILE:-}"
SHOW_BASE64=false
SHOW_FULL_BASE64=false

usage() {
  cat <<'EOF'
Usage:
  bash scripts/download_selfie_curl.sh --id <fileAttachmentId> [--username USER] [--password PASS] [--out selfie_out.jpg] [--show-base64] [--show-full-base64]

Options:
  --id                Required. FileAttachmentId to download
  --username          End-user username (default: DOWNLOAD_USERNAME or pocuser325812410)
  --password          End-user password (default: DOWNLOAD_PASSWORD or TestPass123)
  --out               Optional output file to write decoded binary
  --show-base64       Print first 200 chars of base64
  --show-full-base64  Print full base64 (can be very large)
  -h, --help          Show this help

Env overrides (scripts/.env supported):
  WALLET_API_URL, WALLET_CALLER_ID
  DOWNLOAD_USERNAME, DOWNLOAD_PASSWORD, FILE_ATTACHMENT_ID, OUTPUT_FILE
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --id)
      FILE_ATTACHMENT_ID="$2"
      shift 2
      ;;
    --username)
      LOGIN_USERNAME="$2"
      shift 2
      ;;
    --password)
      LOGIN_PASSWORD="$2"
      shift 2
      ;;
    --out)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    --show-base64)
      SHOW_BASE64=true
      shift
      ;;
    --show-full-base64)
      SHOW_FULL_BASE64=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$FILE_ATTACHMENT_ID" ]]; then
  echo "Error: --id is required." >&2
  usage
  exit 1
fi

RESP_BODY=""
RESP_CODE=""

request_json() {
  local method="$1"
  local url="$2"
  local token="${3:-}"
  local body="${4:-}"

  local args=(-sS -X "$method" "$url" -H "Content-Type: application/json")
  if [[ -n "$token" ]]; then
    args+=(-H "Authorization: Bearer $token")
  fi
  if [[ -n "$body" ]]; then
    args+=(--data "$body")
  fi

  local combined
  combined="$(curl "${args[@]}" -w $'\n%{http_code}')"
  RESP_CODE="${combined##*$'\n'}"
  RESP_BODY="${combined%$'\n'*}"
}

first_error_message() {
  jq -r '
    .ErrorMessages[0] //
    .errorMessages[0] //
    .Problems[0].message //
    .Problems[0].Message //
    .Problems[0].messageDetails //
    .Problems[0].MessageDetails //
    .problems[0].message //
    .problems[0].Message //
    .problems[0].messageDetails //
    .problems[0].MessageDetails //
    .message //
    .Message //
    .detail //
    .Detail //
    .title //
    .Title //
    empty
  ' <<<"$1"
}

assert_http_ok() {
  local context="$1"
  if [[ ! "$RESP_CODE" =~ ^2 ]]; then
    local msg
    msg="$(first_error_message "$RESP_BODY")"
    echo "❌ ${context} failed (HTTP ${RESP_CODE})" >&2
    [[ -n "$msg" ]] && echo "   ${msg}" >&2
    echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
    exit 1
  fi
}

assert_no_problems_if_present() {
  local context="$1"

  local has_errors
  has_errors="$(jq -r '
    ((.Problems // .problems // [])
      | map(((.ProblemType // .problemType // -1) | tonumber) == 1)
      | any) // false
  ' <<<"$RESP_BODY")"

  if [[ "$has_errors" == "true" ]]; then
    local msg
    msg="$(first_error_message "$RESP_BODY")"
    echo "❌ ${context} returned API errors" >&2
    [[ -n "$msg" ]] && echo "   ${msg}" >&2
    echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
    exit 1
  fi
}

echo "== Download selfie test =="
echo "API_BASE: ${API_BASE}"
echo "USER: ${LOGIN_USERNAME}"
echo "FILE_ATTACHMENT_ID: ${FILE_ATTACHMENT_ID}"

# 1) Authenticate as end-user
AUTH_BODY="$(jq -n \
  --arg loginId "$LOGIN_USERNAME" \
  --arg password "$LOGIN_PASSWORD" \
  --arg callerId "$CALLER_ID" \
  '{loginId:$loginId, password:$password, callerId:$callerId, includeUserSettingsInResponse:true, includeAccessRightsWithUserSettings:false}'
)"

request_json POST "${API_BASE}/Authenticate" "" "$AUTH_BODY"
assert_http_ok "Authenticate user"
assert_no_problems_if_present "Authenticate user"

USER_TOKEN="$(jq -r '.tokens.accessToken // empty' <<<"$RESP_BODY")"
if [[ -z "$USER_TOKEN" ]]; then
  echo "❌ User auth returned no access token." >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
  exit 1
fi

echo "✅ User authenticated"

# 2) Download attachment by ID
request_json GET "${API_BASE}/FileAttachment/${FILE_ATTACHMENT_ID}" "$USER_TOKEN"
assert_http_ok "Download file attachment"
assert_no_problems_if_present "Download file attachment"

FILE_DATA_B64="$(jq -r '.FileAttachment.FileData // .fileAttachment.fileData // empty' <<<"$RESP_BODY")"
FILE_NAME="$(jq -r '.FileAttachment.FileName // .fileAttachment.fileName // empty' <<<"$RESP_BODY")"
ATTACHMENT_TYPE_ID="$(jq -r '.FileAttachment.FileAttachmentTypeId // .fileAttachment.fileAttachmentTypeId // empty' <<<"$RESP_BODY")"

if [[ -z "$FILE_DATA_B64" || "$FILE_DATA_B64" == "null" ]]; then
  echo "❌ No FileData found in response." >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
  exit 1
fi

echo "✅ File attachment downloaded"
[[ -n "$FILE_NAME" ]] && echo "FileName: $FILE_NAME"
[[ -n "$ATTACHMENT_TYPE_ID" ]] && echo "FileAttachmentTypeId: $ATTACHMENT_TYPE_ID"
echo "Base64 length: ${#FILE_DATA_B64}"

if [[ "$SHOW_FULL_BASE64" == "true" ]]; then
  echo
  echo "--- FULL BASE64 START ---"
  echo "$FILE_DATA_B64"
  echo "--- FULL BASE64 END ---"
elif [[ "$SHOW_BASE64" == "true" ]]; then
  echo
  echo "Base64 preview (first 200 chars):"
  echo "${FILE_DATA_B64:0:200}"
fi

if [[ -n "$OUTPUT_FILE" ]]; then
  if base64 --help 2>/dev/null | grep -q -- '--decode'; then
    printf '%s' "$FILE_DATA_B64" | base64 --decode > "$OUTPUT_FILE"
  else
    printf '%s' "$FILE_DATA_B64" | base64 -d > "$OUTPUT_FILE"
  fi

  echo "✅ Decoded file written to: $OUTPUT_FILE"
fi

echo

echo "🎉 Download test complete"

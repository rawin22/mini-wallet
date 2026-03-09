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

# Defaults for quick PoC testing (override via args/env)
LOGIN_USERNAME="${UPLOAD_USERNAME:-pocuser325812410}"
LOGIN_PASSWORD="${UPLOAD_PASSWORD:-TestPass123}"
SELFIE_FILE="${SELFIE_FILE:-}"
CAPTURE_WEBCAM=false

usage() {
  cat <<'EOF'
Usage:
  bash scripts/upload_selfie_curl.sh [--username USER] [--password PASS] [--file /path/to/selfie.jpg] [--capture-webcam]

Options:
  --username        End-user username (not bank user)
  --password        End-user password
  --file            Image file to upload (.jpg/.jpeg/.png)
  --capture-webcam  Capture selfie from webcam (requires fswebcam)
  -h, --help        Show this help

Env overrides (scripts/.env supported):
  WALLET_API_URL, WALLET_CALLER_ID
  UPLOAD_USERNAME, UPLOAD_PASSWORD, SELFIE_FILE
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --username)
      LOGIN_USERNAME="$2"
      shift 2
      ;;
    --password)
      LOGIN_PASSWORD="$2"
      shift 2
      ;;
    --file)
      SELFIE_FILE="$2"
      shift 2
      ;;
    --capture-webcam)
      CAPTURE_WEBCAM=true
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

if [[ "$CAPTURE_WEBCAM" == "true" ]]; then
  if ! command -v fswebcam >/dev/null 2>&1; then
    echo "Error: --capture-webcam requires fswebcam. Install it or use --file." >&2
    exit 1
  fi

  TMP_SELFIE="${SCRIPT_DIR}/.tmp_selfie_$(date +%s).jpg"
  echo "Capturing webcam image -> ${TMP_SELFIE}"
  fswebcam -r 1280x720 --no-banner "$TMP_SELFIE"
  SELFIE_FILE="$TMP_SELFIE"
fi

if [[ -z "$SELFIE_FILE" ]]; then
  echo "Error: provide --file <path> or --capture-webcam." >&2
  exit 1
fi

if [[ ! -f "$SELFIE_FILE" ]]; then
  echo "Error: selfie file not found: $SELFIE_FILE" >&2
  exit 1
fi

EXT="${SELFIE_FILE##*.}"
EXT_LOWER="$(echo "$EXT" | tr '[:upper:]' '[:lower:]')"
case "$EXT_LOWER" in
  jpg|jpeg|png) ;;
  *)
    echo "Error: selfie must be .jpg/.jpeg/.png" >&2
    exit 1
    ;;
esac

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

request_json_from_file() {
  local method="$1"
  local url="$2"
  local token="${3:-}"
  local body_file="$4"

  local args=(-sS -X "$method" "$url" -H "Content-Type: application/json")
  if [[ -n "$token" ]]; then
    args+=(-H "Authorization: Bearer $token")
  fi

  args+=(--data-binary "@${body_file}")

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
    empty
  ' <<<"$1"
}

assert_http_ok() {
  local context="$1"
  if [[ ! "$RESP_CODE" =~ ^2 ]]; then
    local msg
    msg="$(first_error_message "$RESP_BODY")"
    echo "❌ ${context} failed (HTTP ${RESP_CODE})" >&2
    if [[ -n "$msg" ]]; then
      echo "   ${msg}" >&2
    fi
    echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
    exit 1
  fi
}

assert_success_if_present() {
  local context="$1"
  local is_success
  is_success="$(jq -r 'if has("IsSuccessful") then .IsSuccessful elif has("isSuccessful") then .isSuccessful else "__missing__" end' <<<"$RESP_BODY")"

  if [[ "$is_success" != "__missing__" && "$is_success" != "true" ]]; then
    local msg
    msg="$(first_error_message "$RESP_BODY")"
    echo "❌ ${context} rejected by API" >&2
    [[ -n "$msg" ]] && echo "   ${msg}" >&2
    echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
    exit 1
  fi
}

echo "== Selfie upload test =="
echo "API_BASE: ${API_BASE}"
echo "USER: ${LOGIN_USERNAME}"
echo "FILE: ${SELFIE_FILE}"

# 1) Authenticate as end-user
AUTH_BODY="$(jq -n \
  --arg loginId "$LOGIN_USERNAME" \
  --arg password "$LOGIN_PASSWORD" \
  --arg callerId "$CALLER_ID" \
  '{loginId:$loginId, password:$password, callerId:$callerId, includeUserSettingsInResponse:true, includeAccessRightsWithUserSettings:false}'
)"

request_json POST "${API_BASE}/Authenticate" "" "$AUTH_BODY"
assert_http_ok "Authenticate user"
assert_success_if_present "Authenticate user"

USER_TOKEN="$(jq -r '.tokens.accessToken // empty' <<<"$RESP_BODY")"
CUSTOMER_ID="$(jq -r '.userSettings.organizationId // .userSettings.OrganizationId // empty' <<<"$RESP_BODY")"

if [[ -z "$USER_TOKEN" ]]; then
  echo "❌ User auth returned no access token." >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
  exit 1
fi

if [[ -z "$CUSTOMER_ID" ]]; then
  echo "❌ User auth returned no organizationId (customerId)." >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
  exit 1
fi

echo "✅ User authenticated"
echo "CustomerId: ${CUSTOMER_ID}"

# 2) Base64-encode selfie into temp file (avoids argv limits)
B64_FILE="${SCRIPT_DIR}/.tmp_selfie_b64_$(date +%s).txt"

if base64 --help 2>/dev/null | grep -q -- '--wrap'; then
  base64 --wrap=0 "$SELFIE_FILE" > "$B64_FILE"
else
  base64 "$SELFIE_FILE" | tr -d '\n' > "$B64_FILE"
fi

FILE_NAME="$(basename "$SELFIE_FILE")"

# 3) Upload selfie (FileAttachmentTypeId=3, ParentObjectTypeId=21)
UPLOAD_BODY_FILE="${SCRIPT_DIR}/.tmp_selfie_upload_body_$(date +%s).json"
jq -n \
  --rawfile fileData "$B64_FILE" \
  --arg parentObjectId "$CUSTOMER_ID" \
  --arg fileName "$FILE_NAME" \
  '{
    ParentObjectId:$parentObjectId,
    ParentObjectTypeId:21,
    SourceIP:"",
    FileAttachmentTypeId:3,
    FileAttachmentSubTypeId:0,
    SumSubTypeId:0,
    FileName:$fileName,
    GroupName:"",
    Properties:null,
    IsPrimary:true,
    ContainsFront:false,
    ContainsBack:false,
    ViewableByBanker:true,
    ViewableByCustomer:true,
    DeletableByCustomer:false,
    Description:"documentType: Selfie",
    BypassFileAnalysis:true,
    FileData:$fileData
  }' > "$UPLOAD_BODY_FILE"

request_json_from_file POST "${API_BASE}/FileAttachment" "$USER_TOKEN" "$UPLOAD_BODY_FILE"
assert_http_ok "Upload selfie"
assert_success_if_present "Upload selfie"

FILE_ATTACHMENT_ID="$(jq -r '.FileAttachment.FileAttachmentId // .fileAttachment.fileAttachmentId // empty' <<<"$RESP_BODY")"
if [[ -z "$FILE_ATTACHMENT_ID" ]]; then
  echo "⚠️ Upload accepted but FileAttachmentId not found in response." >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
else
  echo "✅ Selfie uploaded. FileAttachmentId: ${FILE_ATTACHMENT_ID}"
fi

echo

echo "🎉 Selfie upload flow completed for ${LOGIN_USERNAME}"

if [[ -n "${TMP_SELFIE:-}" && -f "${TMP_SELFIE}" ]]; then
  rm -f "${TMP_SELFIE}"
fi

if [[ -n "${B64_FILE:-}" && -f "${B64_FILE}" ]]; then
  rm -f "${B64_FILE}"
fi

if [[ -n "${UPLOAD_BODY_FILE:-}" && -f "${UPLOAD_BODY_FILE}" ]]; then
  rm -f "${UPLOAD_BODY_FILE}"
fi

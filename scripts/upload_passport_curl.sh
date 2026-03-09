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

LOGIN_USERNAME="${UPLOAD_USERNAME:-pocuser325812410}"
LOGIN_PASSWORD="${UPLOAD_PASSWORD:-TestPass123}"
PASSPORT_FILE="${PASSPORT_FILE:-${SCRIPT_DIR}/Passport-Datapage.jpg}"
# Optional: exact CountryIdentificationTypeId (SumSubTypeId) if you already know it
ID_SUM_SUBTYPE_ID="${ID_SUM_SUBTYPE_ID:-0}"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/upload_passport_curl.sh [--username USER] [--password PASS] [--file /path/to/passport.jpg] [--sum-subtype-id ID]

Options:
  --username        End-user username
  --password        End-user password
  --file            Passport image (.jpg/.jpeg/.png)
  --sum-subtype-id  CountryIdentificationTypeId (optional, default 0)
  -h, --help        Show help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --username)
      LOGIN_USERNAME="$2"; shift 2 ;;
    --password)
      LOGIN_PASSWORD="$2"; shift 2 ;;
    --file)
      PASSPORT_FILE="$2"; shift 2 ;;
    --sum-subtype-id)
      ID_SUM_SUBTYPE_ID="$2"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1 ;;
  esac
done

if [[ ! -f "$PASSPORT_FILE" ]]; then
  echo "Error: file not found: $PASSPORT_FILE" >&2
  exit 1
fi

EXT="${PASSPORT_FILE##*.}"
EXT_LOWER="$(echo "$EXT" | tr '[:upper:]' '[:lower:]')"
case "$EXT_LOWER" in
  jpg|jpeg|png) ;;
  *)
    echo "Error: passport file must be .jpg/.jpeg/.png" >&2
    exit 1 ;;
esac

RESP_BODY=""
RESP_CODE=""

request_json() {
  local method="$1"; local url="$2"; local token="${3:-}"; local body="${4:-}"
  local args=(-sS -X "$method" "$url" -H "Content-Type: application/json")
  [[ -n "$token" ]] && args+=(-H "Authorization: Bearer $token")
  [[ -n "$body" ]] && args+=(--data "$body")
  local combined
  combined="$(curl "${args[@]}" -w $'\n%{http_code}')"
  RESP_CODE="${combined##*$'\n'}"
  RESP_BODY="${combined%$'\n'*}"
}

request_json_from_file() {
  local method="$1"; local url="$2"; local token="$3"; local body_file="$4"
  local args=(-sS -X "$method" "$url" -H "Content-Type: application/json")
  [[ -n "$token" ]] && args+=(-H "Authorization: Bearer $token")
  args+=(--data-binary "@${body_file}")
  local combined
  combined="$(curl "${args[@]}" -w $'\n%{http_code}')"
  RESP_CODE="${combined##*$'\n'}"
  RESP_BODY="${combined%$'\n'*}"
}

first_error_message() {
  jq -r '
    .ErrorMessages[0] // .errorMessages[0] //
    .Problems[0].message // .Problems[0].Message // .Problems[0].messageDetails // .Problems[0].MessageDetails //
    .problems[0].message // .problems[0].Message // .problems[0].messageDetails // .problems[0].MessageDetails //
    .message // .Message // .detail // .Detail // .title // .Title // empty
  ' <<<"$1"
}

assert_http_ok() {
  local context="$1"
  if [[ ! "$RESP_CODE" =~ ^2 ]]; then
    local msg
    msg="$(first_error_message "$RESP_BODY")"
    echo "❌ ${context} failed (HTTP ${RESP_CODE})" >&2
    [[ -n "$msg" ]] && echo "   $msg" >&2
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
    [[ -n "$msg" ]] && echo "   $msg" >&2
    echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
    exit 1
  fi
}

echo "== Passport upload test =="
echo "API_BASE: ${API_BASE}"
echo "USER: ${LOGIN_USERNAME}"
echo "FILE: ${PASSPORT_FILE}"

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
[[ -z "$USER_TOKEN" ]] && { echo "❌ No access token" >&2; exit 1; }
[[ -z "$CUSTOMER_ID" ]] && { echo "❌ No customerId" >&2; exit 1; }

echo "✅ User authenticated"
echo "CustomerId: ${CUSTOMER_ID}"

B64_FILE="${SCRIPT_DIR}/.tmp_passport_b64_$(date +%s).txt"
if base64 --help 2>/dev/null | grep -q -- '--wrap'; then
  base64 --wrap=0 "$PASSPORT_FILE" > "$B64_FILE"
else
  base64 "$PASSPORT_FILE" | tr -d '\n' > "$B64_FILE"
fi

UPLOAD_BODY_FILE="${SCRIPT_DIR}/.tmp_passport_upload_$(date +%s).json"
FILE_NAME="$(basename "$PASSPORT_FILE")"

jq -n \
  --rawfile fileData "$B64_FILE" \
  --arg parentObjectId "$CUSTOMER_ID" \
  --arg fileName "$FILE_NAME" \
  --argjson sumSubTypeId "$ID_SUM_SUBTYPE_ID" \
  '{
    ParentObjectId:$parentObjectId,
    ParentObjectTypeId:21,
    SourceIP:"",
    FileAttachmentTypeId:1,
    FileAttachmentSubTypeId:0,
    SumSubTypeId:$sumSubTypeId,
    FileName:$fileName,
    GroupName:"",
    Properties:null,
    IsPrimary:true,
    ContainsFront:true,
    ContainsBack:false,
    ViewableByBanker:true,
    ViewableByCustomer:true,
    DeletableByCustomer:false,
    Description:"documentType: Proof of Identity",
    BypassFileAnalysis:false,
    FileData:$fileData
  }' > "$UPLOAD_BODY_FILE"

request_json_from_file POST "${API_BASE}/FileAttachment" "$USER_TOKEN" "$UPLOAD_BODY_FILE"
assert_http_ok "Upload passport (front ID)"
assert_success_if_present "Upload passport (front ID)"

FILE_ATTACHMENT_ID="$(jq -r '.FileAttachment.FileAttachmentId // .fileAttachment.fileAttachmentId // empty' <<<"$RESP_BODY")"
if [[ -n "$FILE_ATTACHMENT_ID" ]]; then
  echo "✅ Passport uploaded. FileAttachmentId: ${FILE_ATTACHMENT_ID}"
else
  echo "⚠️ Upload accepted but FileAttachmentId missing in response"
  echo "$RESP_BODY" | jq . 2>/dev/null || true
fi

[[ -f "$B64_FILE" ]] && rm -f "$B64_FILE"
[[ -f "$UPLOAD_BODY_FILE" ]] && rm -f "$UPLOAD_BODY_FILE"

echo "🎉 Passport upload flow completed"

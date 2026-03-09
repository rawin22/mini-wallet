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
BANK_USERNAME="${WIN_BETA_BANK_USERNAME:-4kycmig}"
BANK_PASSWORD="${WIN_BETA_BANK_USER_PASSWORD:-Wkycmig@88}"

TARGET_USERNAME="${1:-${CHECK_USERNAME:-}}"
if [[ -z "${TARGET_USERNAME}" ]]; then
  echo "Usage: bash scripts/check_uysername.sh <username>" >&2
  echo "Or set CHECK_USERNAME in scripts/.env" >&2
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
    .problems[0].message //
    .problems[0].Message //
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

echo "API_BASE: ${API_BASE}"
echo "Checking username: ${TARGET_USERNAME}"

AUTH_BODY="$(jq -n \
  --arg loginId "$BANK_USERNAME" \
  --arg password "$BANK_PASSWORD" \
  --arg callerId "$CALLER_ID" \
  '{loginId:$loginId, password:$password, callerId:$callerId, includeUserSettingsInResponse:true, includeAccessRightsWithUserSettings:false}'
)"

request_json POST "${API_BASE}/Authenticate" "" "$AUTH_BODY"
assert_http_ok "Authenticate bank user"
BANK_TOKEN="$(jq -r '.tokens.accessToken // empty' <<<"$RESP_BODY")"
if [[ -z "$BANK_TOKEN" ]]; then
  echo "❌ Authentication succeeded but no access token returned." >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
  exit 1
fi

echo "✅ Bank user authenticated"

request_json GET "${API_BASE}/User/DoesUsernameExist/${TARGET_USERNAME}" "$BANK_TOKEN"
assert_http_ok "Check username availability"

IS_SUCCESSFUL="$(jq -r 'if has("IsSuccessful") then .IsSuccessful elif has("isSuccessful") then .isSuccessful else "__missing__" end' <<<"$RESP_BODY")"
if [[ "$IS_SUCCESSFUL" != "__missing__" && "$IS_SUCCESSFUL" != "true" ]]; then
  msg="$(first_error_message "$RESP_BODY")"
  echo "❌ Username check rejected by API" >&2
  [[ -n "$msg" ]] && echo "   $msg" >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
  exit 1
fi

EXISTS="$(jq -r '.Exists // .exists // false' <<<"$RESP_BODY")"
if [[ "$EXISTS" == "true" ]]; then
  echo "ℹ️ Username exists: ${TARGET_USERNAME}"
else
  echo "✅ Username is available: ${TARGET_USERNAME}"
fi

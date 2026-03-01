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

# PoC defaults from Signup.md (can be overridden in scripts/.env)
BANK_USERNAME="${WIN_BETA_BANK_USERNAME:-4kycmig}"
BANK_PASSWORD="${WIN_BETA_BANK_USER_PASSWORD:-Wkycmig@88}"
ACCOUNT_REP_ID="${WIN_BETA_ACCOUNT_REPRESENTATIVE_ID:-9469c6b2-ebed-ec11-915b-3ee1a118192f}"
CUSTOMER_TEMPLATE_ID="${WIN_BETA_CUSTOMER_TEMPLATE_ID:-b3cccc87-4317-ef11-8541-002248afce03}"
ACCESS_RIGHT_TEMPLATE_ID="${WIN_BETA_ACCESS_RIGHT_TEMPLATE_ID:-dba74278-a2e8-4503-b59c-8ab8cd458841}"
DEFAULT_COUNTRY_CODE="${WIN_BETA_DEFAULT_COUNTRY_CODE:-HK}"
DEFAULT_REGISTERING_EMAIL="${WIN_BETA_DEFAULT_REGISTERING_EMAIL:-register@worldkyc.com}"
REFERRED_BY_PLATFORM="${WIN_BETA_REFERRED_BY_PLATFORM:-WorldKYC Signup}"

# Optional notary node defaults
NOTARY_BRANCH_ID="${WIN_BETA_NOTARY_NODE_1_BRANCH_ID:-82b42669-ac24-e911-9109-3ee1a118192f}"
NOTARY_COUNTRY_CODE="${WIN_BETA_NOTARY_NODE_1_COUNTRY_CODE:-HK}"

# Signup payload defaults (override via env or args)
SIGNUP_USERNAME="${SIGNUP_USERNAME:-pocuser$RANDOM$RANDOM}"
SIGNUP_PASSWORD="${SIGNUP_PASSWORD:-TestPass123}"
SIGNUP_FIRST_NAME="${SIGNUP_FIRST_NAME:-PoC}"
SIGNUP_LAST_NAME="${SIGNUP_LAST_NAME:-User}"
SIGNUP_EMAIL="${SIGNUP_EMAIL:-$DEFAULT_REGISTERING_EMAIL}"
SIGNUP_CELLPHONE="${SIGNUP_CELLPHONE:-}"
SIGNUP_REFERRED_BY="${SIGNUP_REFERRED_BY:-}"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/signup_curls.sh [--username USER] [--password PASS] [--first-name NAME] [--last-name NAME] [--email EMAIL]

Options:
  --username      Signup username
  --password      Signup password
  --first-name    First name
  --last-name     Last name
  --email         Email address

Environment overrides (scripts/.env supported):
  WALLET_API_URL, WALLET_CALLER_ID
  WIN_BETA_BANK_USERNAME, WIN_BETA_BANK_USER_PASSWORD
  WIN_BETA_ACCOUNT_REPRESENTATIVE_ID, WIN_BETA_CUSTOMER_TEMPLATE_ID, WIN_BETA_ACCESS_RIGHT_TEMPLATE_ID
  WIN_BETA_DEFAULT_COUNTRY_CODE, WIN_BETA_DEFAULT_REGISTERING_EMAIL, WIN_BETA_REFERRED_BY_PLATFORM
  WIN_BETA_NOTARY_NODE_1_BRANCH_ID, WIN_BETA_NOTARY_NODE_1_COUNTRY_CODE
  SIGNUP_USERNAME, SIGNUP_PASSWORD, SIGNUP_FIRST_NAME, SIGNUP_LAST_NAME, SIGNUP_EMAIL, SIGNUP_CELLPHONE, SIGNUP_REFERRED_BY
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --username)
      SIGNUP_USERNAME="$2"
      shift 2
      ;;
    --password)
      SIGNUP_PASSWORD="$2"
      shift 2
      ;;
    --first-name)
      SIGNUP_FIRST_NAME="$2"
      shift 2
      ;;
    --last-name)
      SIGNUP_LAST_NAME="$2"
      shift 2
      ;;
    --email)
      SIGNUP_EMAIL="$2"
      shift 2
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

assert_success_flag_if_present() {
  local context="$1"
  local is_success
  is_success="$(jq -r 'if has("IsSuccessful") then .IsSuccessful elif has("isSuccessful") then .isSuccessful else "__missing__" end' <<<"$RESP_BODY")"

  if [[ "$is_success" != "__missing__" && "$is_success" != "true" ]]; then
    local msg
    msg="$(first_error_message "$RESP_BODY")"
    echo "❌ ${context} rejected by API" >&2
    if [[ -n "$msg" ]]; then
      echo "   ${msg}" >&2
    fi
    echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
    exit 1
  fi
}

echo "== Signup CURL flow test =="
echo "API_BASE: ${API_BASE}"
echo "USERNAME: ${SIGNUP_USERNAME}"

# 1) Authenticate bank user
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
  echo "❌ Bank auth succeeded but no access token returned." >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
  exit 1
fi

echo "✅ Bank user authenticated"

# 2) Check username availability
request_json GET "${API_BASE}/User/DoesUsernameExist/${SIGNUP_USERNAME}" "$BANK_TOKEN"
assert_http_ok "Check username availability"
assert_success_flag_if_present "Check username availability"
USERNAME_EXISTS="$(jq -r '.Exists // .exists // false' <<<"$RESP_BODY")"
if [[ "$USERNAME_EXISTS" == "true" ]]; then
  echo "❌ Username already exists: ${SIGNUP_USERNAME}" >&2
  exit 1
fi

echo "✅ Username available"

# 3) Create customer from template
CREATE_CUSTOMER_BODY="$(jq -n \
  --arg branchId "$NOTARY_BRANCH_ID" \
  --arg accountRepresentativeId "$ACCOUNT_REP_ID" \
  --arg customerTemplateId "$CUSTOMER_TEMPLATE_ID" \
  --arg firstName "$SIGNUP_FIRST_NAME" \
  --arg lastName "$SIGNUP_LAST_NAME" \
  --arg email "$SIGNUP_EMAIL" \
  --arg cellPhone "$SIGNUP_CELLPHONE" \
  --arg countryCode "${NOTARY_COUNTRY_CODE:-$DEFAULT_COUNTRY_CODE}" \
  --arg referredByPlatform "$REFERRED_BY_PLATFORM" \
  --arg referredByName "$SIGNUP_REFERRED_BY" \
  '{
    BranchId:$branchId,
    AccountRepresentativeId:$accountRepresentativeId,
    CustomerTemplateId:$customerTemplateId,
    CustomerTypeId:1,
    FirstName:$firstName,
    LastName:$lastName,
    Email:$email,
    CellPhone:$cellPhone,
    CountryCode:$countryCode,
    ReferredByPlatform:$referredByPlatform,
    ReferredByName:$referredByName,
    CustomerName:"",
    MiddleName:"",
    MailingAddressLine1:"",
    MailingAddressLine2:"",
    MailingAddressLine3:"",
    MailingAddressCity:"",
    MailingAddressStateProvince:"",
    MailingAddressCountryCode:"",
    MailingAddressZipCode:""
  }'
)"

request_json POST "${API_BASE}/Customer/FromTemplate" "$BANK_TOKEN" "$CREATE_CUSTOMER_BODY"
assert_http_ok "Create customer profile"
assert_success_flag_if_present "Create customer profile"
CUSTOMER_ID="$(jq -r '.Customer.CustomerId // .customer.customerId // empty' <<<"$RESP_BODY")"
if [[ -z "$CUSTOMER_ID" ]]; then
  echo "❌ Customer created but CustomerId missing." >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
  exit 1
fi

echo "✅ Customer created: ${CUSTOMER_ID}"

# 4) Create customer user
CREATE_USER_BODY="$(jq -n \
  --arg customerId "$CUSTOMER_ID" \
  --arg userName "$SIGNUP_USERNAME" \
  --arg password "$SIGNUP_PASSWORD" \
  --arg emailAddress "$SIGNUP_EMAIL" \
  --arg firstName "$SIGNUP_FIRST_NAME" \
  --arg lastName "$SIGNUP_LAST_NAME" \
  '{
    CustomerId:$customerId,
    UserName:$userName,
    Password:$password,
    EmailAddress:$emailAddress,
    FirstName:$firstName,
    LastName:$lastName,
    IsApproved:true,
    UserMustChangePassword:false,
    EmailPasswordToUser:false,
    WKYCId:""
  }'
)"

request_json POST "${API_BASE}/CustomerUser" "$BANK_TOKEN" "$CREATE_USER_BODY"
assert_http_ok "Create customer user"
assert_success_flag_if_present "Create customer user"
USER_ID="$(jq -r '.User.UserId // .user.userId // empty' <<<"$RESP_BODY")"
if [[ -z "$USER_ID" ]]; then
  echo "❌ Customer user created but UserId missing." >&2
  echo "$RESP_BODY" | jq . 2>/dev/null || echo "$RESP_BODY" >&2
  exit 1
fi

echo "✅ Customer user created: ${USER_ID}"

# 5) Link access right template
LINK_TEMPLATE_BODY="$(jq -n \
  --arg userId "$USER_ID" \
  --arg accessRightTemplateId "$ACCESS_RIGHT_TEMPLATE_ID" \
  '{UserId:$userId, AccessRightTemplateId:$accessRightTemplateId}'
)"

request_json PATCH "${API_BASE}/User/LinkAccessRightTemplate" "$BANK_TOKEN" "$LINK_TEMPLATE_BODY"
assert_http_ok "Link access right template"
assert_success_flag_if_present "Link access right template"

echo "✅ Access rights linked"
echo
echo "🎉 Signup flow completed successfully for username: ${SIGNUP_USERNAME}"

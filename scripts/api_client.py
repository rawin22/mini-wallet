"""Shared API client for the BizCurrency Mini-Wallet API.

Handles configuration, authentication, and common HTTP interactions
so individual scripts stay focused on their specific tasks.
"""

import os
import sys

import requests

BASE_URL = os.environ.get("WALLET_API_URL", "https://www.bizcurrency.com:20200/api/v1")
CALLER_ID = os.environ.get("WALLET_CALLER_ID", "819640E9-8DF1-4DB9-B13B-E9DCDDEEBA58")


def get_credentials() -> tuple[str, str]:
    """Read username and password from environment variables."""
    username = os.environ.get("WALLET_USERNAME")
    password = os.environ.get("WALLET_PASSWORD")
    if not username or not password:
        print("Error: Set WALLET_USERNAME and WALLET_PASSWORD environment variables.", file=sys.stderr)
        sys.exit(1)
    return username, password


def authenticate() -> tuple[str, str]:
    """Authenticate against the API and return (access_token, customer_id)."""
    username, password = get_credentials()

    auth_body = {
        "loginId": username,
        "password": password,
        "callerId": CALLER_ID,
        "includeUserSettingsInResponse": True,
        "includeAccessRightsWithUserSettings": False,
    }

    print(f"Authenticating with {BASE_URL}...")
    response = requests.post(f"{BASE_URL}/authenticate", json=auth_body, timeout=30)
    response.raise_for_status()

    data = response.json()
    token = data.get("tokens", {}).get("accessToken")
    customer_id = data.get("userSettings", {}).get("organizationId")

    if not token:
        print("Error: Authentication failed — no access token received.", file=sys.stderr)
        sys.exit(1)

    print("Login successful.")
    return token, customer_id


def auth_headers(token: str) -> dict[str, str]:
    """Return the Authorization header dict for authenticated requests."""
    return {"Authorization": f"Bearer {token}"}


def get_balances(token: str, customer_id: str) -> list[dict]:
    """Fetch account balances for a customer. Returns the balances list."""
    url = f"{BASE_URL}/CustomerAccountBalance/{customer_id}"
    response = requests.get(url, headers=auth_headers(token), timeout=30)
    response.raise_for_status()

    balances = response.json().get("balances", [])
    if not balances:
        print("Error: No balances found.", file=sys.stderr)
        sys.exit(1)

    return balances

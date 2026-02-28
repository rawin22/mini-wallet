"""Authenticate against the BizCurrency API and display user settings.

Usage:
    python scripts/login.py
"""

import sys

import requests

from api_client import BASE_URL, CALLER_ID, get_credentials


def main() -> None:
    username, password = get_credentials()

    auth_body = {
        "loginId": username,
        "password": password,
        "callerId": CALLER_ID,
        "includeUserSettingsInResponse": True,
        "includeAccessRightsWithUserSettings": False,
    }

    print(f"Authenticating with {BASE_URL}...")
    try:
        response = requests.post(f"{BASE_URL}/authenticate", json=auth_body, timeout=30)
        response.raise_for_status()
    except requests.RequestException as exc:
        print(f"Authentication error: {exc}", file=sys.stderr)
        sys.exit(1)

    data = response.json()
    token = data.get("tokens", {}).get("accessToken")
    if not token:
        print("Error: Authentication failed — no access token received.", file=sys.stderr)
        sys.exit(1)

    settings = data.get("userSettings", {})
    print("\nLogin successful!")
    print(f"  User:         {settings.get('userName')}")
    print(f"  Name:         {settings.get('firstName')} {settings.get('lastName')}")
    print(f"  Organization: {settings.get('organizationName')}")
    print(f"  Customer ID:  {settings.get('organizationId')}")
    print(f"  Email:        {settings.get('emailAddress')}")
    print(f"  Branch:       {settings.get('branchName')}")
    print(f"  Base Currency:{settings.get('baseCurrencyCode')}")
    print(f"  Token Expires:{data.get('tokens', {}).get('accessTokenExpiresInMinutes')} min")


if __name__ == "__main__":
    main()

"""Retrieve and display wallet account balances.

Usage:
    export WALLET_USERNAME="your_user"
    export WALLET_PASSWORD="your_pass"
    python scripts/account_balances.py
"""

import sys

import requests

from api_client import authenticate, auth_headers, get_balances, BASE_URL


def main() -> None:
    token, customer_id = authenticate()

    print("\nRetrieving balances...")
    try:
        balances = get_balances(token, customer_id)
    except requests.HTTPError as exc:
        print(f"Failed to retrieve balances: {exc}", file=sys.stderr)
        sys.exit(1)

    print("\n--- Current Wallet Balances ---")
    print(f"{'Currency':<12}{'Available':>14}{'Reserved':>14}{'Total':>14}")
    print("-" * 54)

    for bal in balances:
        currency = bal.get("currencyCode", "N/A")
        available = bal.get("balanceAvailable", 0)
        reserved = bal.get("activeHoldsTotal", 0)
        total = bal.get("balance", 0)
        print(f"{currency:<12}{available:>14,.2f}{reserved:>14,.2f}{total:>14,.2f}")


if __name__ == "__main__":
    main()

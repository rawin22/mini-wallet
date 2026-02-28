"""Fetch and display available payment currencies.

Usage:
    python scripts/currency_list.py
"""

import sys

import requests

from api_client import BASE_URL, auth_headers, authenticate


def main() -> None:
    token, _customer_id = authenticate()

    print("\nFetching payment currencies...")
    try:
        response = requests.get(f"{BASE_URL}/PaymentCurrencyList", headers=auth_headers(token), timeout=30)
        response.raise_for_status()
    except requests.HTTPError as exc:
        print(f"Failed to retrieve currency list: {exc}", file=sys.stderr)
        sys.exit(1)

    data = response.json()
    currencies = data.get("currencies", [])

    if not currencies:
        print("No currencies available.")
        return

    print(f"\n{'Code':<8}{'Symbol':<8}{'Name':<20}{'Scale':>6}{'Rate Scale':>12}{'Cutoff':>10}{'Settle +':>10}")
    print("-" * 74)

    for cur in currencies:
        print(
            f"{cur.get('currencyCode', ''):<8}"
            f"{cur.get('symbol', ''):<8}"
            f"{cur.get('currencyName', ''):<20}"
            f"{cur.get('currencyAmountScale', ''):>6}"
            f"{cur.get('currencyRateScale', ''):>12}"
            f"{cur.get('paymentCutoffTime', ''):>10}"
            f"{cur.get('settlementDaysToAdd', ''):>10}"
        )

    print(f"\nTotal: {len(currencies)} currency(ies)")


if __name__ == "__main__":
    main()

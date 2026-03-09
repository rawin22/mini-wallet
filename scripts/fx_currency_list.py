"""Fetch and display available FX currencies for buying and selling.

Usage:
    python scripts/fx_currency_list.py
"""

import sys

import requests

from api_client import BASE_URL, auth_headers, authenticate


def fetch_fx_currencies(token: str, side: str) -> list[dict]:
    """Fetch FX currency list for a given side (Buy or Sell)."""
    response = requests.get(f"{BASE_URL}/FXCurrencyList/{side}", headers=auth_headers(token), timeout=30)
    response.raise_for_status()
    return response.json().get("currencies", [])


def print_currency_table(currencies: list[dict]) -> None:
    """Print a formatted table of currencies."""
    if not currencies:
        print("  No currencies available.")
        return

    print(f"  {'Code':<8}{'Symbol':<8}{'Name':<20}{'Scale':>6}{'Rate Scale':>12}{'Cutoff':>10}{'Settle +':>10}")
    print(f"  {'-' * 74}")

    for cur in currencies:
        print(
            f"  {cur.get('currencyCode', ''):<8}"
            f"{cur.get('symbol', ''):<8}"
            f"{cur.get('currencyName', ''):<20}"
            f"{cur.get('currencyAmountScale', ''):>6}"
            f"{cur.get('currencyRateScale', ''):>12}"
            f"{cur.get('paymentCutoffTime', ''):>10}"
            f"{cur.get('settlementDaysToAdd', ''):>10}"
        )


def main() -> None:
    token, _customer_id = authenticate()

    for side in ("Buy", "Sell"):
        print(f"\n=== FX CURRENCIES — {side.upper()} ===")
        try:
            currencies = fetch_fx_currencies(token, side)
        except requests.HTTPError as exc:
            print(f"  Failed to retrieve {side} list: {exc}", file=sys.stderr)
            continue

        print_currency_table(currencies)
        print(f"  Total: {len(currencies)} currency(ies)")


if __name__ == "__main__":
    main()

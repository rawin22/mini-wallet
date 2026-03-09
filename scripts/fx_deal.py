"""Execute an FX deal: get a quote, review it, and optionally book it.

Two-step flow:
  1. Request a quote (POST /FXDealQuote)
  2. Review the quote and confirm booking (PATCH /FXDealQuote/{quoteId}/BookAndInstantDeposit)

Note: The amount must be specified in a currency that is part of the FX deal pair.

Usage:
    python scripts/fx_deal.py
"""

import sys

import requests

from api_client import BASE_URL, auth_headers, authenticate


def get_quote(token: str, buy_ccy: str, sell_ccy: str, amount: float, amount_ccy: str) -> dict:
    """Request an FX deal quote from the API."""
    payload = {
        "buyCurrencyCode": buy_ccy,
        "sellCurrencyCode": sell_ccy,
        "amount": amount,
        "amountCurrencyCode": amount_ccy,
        "dealType": "SPOT",
        "windowOpenDate": "",
        "finalValueDate": "",
        "isForCurrencyCalculator": False,
    }

    response = requests.post(f"{BASE_URL}/FXDealQuote", json=payload, headers=auth_headers(token), timeout=30)
    response.raise_for_status()
    return response.json()


def book_deal(token: str, quote_id: str) -> dict:
    """Book an FX deal and instant deposit using the quote ID."""
    url = f"{BASE_URL}/FXDealQuote/{quote_id}/BookAndInstantDeposit"
    response = requests.patch(url, headers=auth_headers(token), timeout=30)
    response.raise_for_status()
    return response.json()


def fetch_fx_currencies(token: str, side: str) -> list[dict]:
    """Fetch FX currency list for a given side (Buy or Sell)."""
    response = requests.get(f"{BASE_URL}/FXCurrencyList/{side}", headers=auth_headers(token), timeout=30)
    response.raise_for_status()
    return response.json().get("currencies", [])


def display_fx_currencies(token: str) -> tuple[list[str], list[str]]:
    """Fetch and display available Buy and Sell FX currencies. Returns (buy_codes, sell_codes)."""
    buy_currencies = fetch_fx_currencies(token, "Buy")
    sell_currencies = fetch_fx_currencies(token, "Sell")

    print("\n=== AVAILABLE FX CURRENCIES ===")

    print("\n  Buy currencies:")
    for cur in buy_currencies:
        print(f"    {cur.get('currencyCode', ''):<8} {cur.get('currencyName', '')}")

    print("\n  Sell currencies:")
    for cur in sell_currencies:
        print(f"    {cur.get('currencyCode', ''):<8} {cur.get('currencyName', '')}")

    buy_codes = [c.get("currencyCode", "") for c in buy_currencies]
    sell_codes = [c.get("currencyCode", "") for c in sell_currencies]
    return buy_codes, sell_codes


def main() -> None:
    token, _customer_id = authenticate()

    buy_codes, sell_codes = display_fx_currencies(token)

    print("\n=== FX DEAL ===")
    buy_ccy = input("Buy currency code: ").strip().upper()
    if buy_ccy not in buy_codes:
        print(f"Error: {buy_ccy} is not available for buying. Choose from: {', '.join(buy_codes)}", file=sys.stderr)
        sys.exit(1)

    sell_ccy = input("Sell currency code: ").strip().upper()
    if sell_ccy not in sell_codes:
        print(f"Error: {sell_ccy} is not available for selling. Choose from: {', '.join(sell_codes)}", file=sys.stderr)
        sys.exit(1)

    amount_str = input("Amount: ").strip()
    try:
        amount = float(amount_str)
        if amount <= 0:
            raise ValueError
    except ValueError:
        print("Error: Amount must be a positive number.", file=sys.stderr)
        sys.exit(1)

    amount_ccy = input(f"Amount currency ({buy_ccy}/{sell_ccy}): ").strip().upper()
    if amount_ccy not in (buy_ccy, sell_ccy):
        print(f"Error: Amount currency must be either {buy_ccy} or {sell_ccy}.", file=sys.stderr)
        sys.exit(1)

    # Step 1: Get quote
    print("\nRequesting quote...")
    try:
        result = get_quote(token, buy_ccy, sell_ccy, amount, amount_ccy)
    except requests.HTTPError as exc:
        print(f"Failed to get quote: {exc}", file=sys.stderr)
        sys.exit(1)

    problems = result.get("problems")
    if problems:
        print(f"Error: {problems}", file=sys.stderr)
        sys.exit(1)

    quote = result.get("quote", {})
    if not quote:
        print("Error: No quote returned.", file=sys.stderr)
        sys.exit(1)

    quote_id = quote.get("quoteId")

    print("\n--- FX QUOTE ---")
    print(f"  Quote Ref:    {quote.get('quoteReference')}")
    print(f"  Symbol:       {quote.get('symbol')}")
    print(f"  Rate:         {quote.get('rate')}")
    print(f"  Buy:          {quote.get('buyAmount')} {quote.get('buyCurrencyCode')}")
    print(f"  Sell:         {quote.get('sellAmount')} {quote.get('sellCurrencyCode')}")
    print(f"  Deal Type:    {quote.get('dealType')}")
    print(f"  Deal Date:    {quote.get('dealDate')}")
    print(f"  Value Date:   {quote.get('valueDate')}")
    print(f"  Expires:      {quote.get('expirationTime')}")

    # Step 2: Confirm booking
    confirm = input("\nBook this deal? (y/N): ").strip().lower()
    if confirm != "y":
        print("Deal cancelled.")
        sys.exit(0)

    print("\nBooking deal...")
    try:
        book_result = book_deal(token, quote_id)
    except requests.HTTPError as exc:
        print(f"Failed to book deal: {exc}", file=sys.stderr)
        sys.exit(1)

    book_problems = book_result.get("problems")
    if book_problems:
        print(f"Error: {book_problems}", file=sys.stderr)
        sys.exit(1)

    fx_data = book_result.get("fxDepositData", {})
    print("\nDeal booked successfully!")
    print(f"  Deal ID:          {fx_data.get('fxDealId')}")
    print(f"  Deal Reference:   {fx_data.get('fxDealReference')}")
    print(f"  Deposit ID:       {fx_data.get('depositId')}")
    print(f"  Deposit Reference:{fx_data.get('depositReference')}")
    print("\n=== COMPLETE ===")


if __name__ == "__main__":
    main()

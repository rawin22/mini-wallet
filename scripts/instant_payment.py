"""Send an instant payment to another customer.

Two-step flow:
  1. Create the payment (POST /InstantPayment)
  2. Confirm/post the payment (PATCH /InstantPayment/Post)

Usage:
    python scripts/instant_payment.py
"""

import sys
from datetime import datetime, timezone

import requests

from api_client import BASE_URL, auth_headers, authenticate


def create_payment(token: str, from_customer: str, to_customer: str, amount: float, currency: str) -> dict:
    """Create an instant payment and return the API response."""
    payload = {
        "fromCustomer": from_customer,
        "toCustomer": to_customer,
        "paymentTypeId": 1,
        "amount": amount,
        "currencyCode": currency,
        "valueDate": datetime.now(tz=timezone.utc).strftime("%Y-%m-%d"),
        "reasonForPayment": "Instant Payment",
        "externalReference": "",
        "memo": "",
    }

    response = requests.post(f"{BASE_URL}/InstantPayment", json=payload, headers=auth_headers(token), timeout=30)
    response.raise_for_status()
    return response.json()


def confirm_payment(token: str, payment_id: str, timestamp: str) -> dict:
    """Confirm/post a previously created instant payment."""
    payload = {
        "instantPaymentId": payment_id,
        "timestamp": timestamp,
    }

    response = requests.patch(f"{BASE_URL}/InstantPayment/Post", json=payload, headers=auth_headers(token), timeout=30)
    response.raise_for_status()
    return response.json()


def main() -> None:
    token, _customer_id = authenticate()

    print("\n=== INSTANT PAYMENT ===")
    to_customer = input("Receiver PayID: ").strip()
    if not to_customer:
        print("Error: Receiver PayID is required.", file=sys.stderr)
        sys.exit(1)

    amount_str = input("Amount: ").strip()
    try:
        amount = float(amount_str)
        if amount <= 0:
            raise ValueError
    except ValueError:
        print("Error: Amount must be a positive number.", file=sys.stderr)
        sys.exit(1)

    currency = input("Currency [USD]: ").strip().upper() or "USD"

    print(f"\n  To:       {to_customer}")
    print(f"  Amount:   {amount:,.2f} {currency}")

    confirm = input("\nProceed? (y/N): ").strip().lower()
    if confirm != "y":
        print("Payment cancelled.")
        sys.exit(0)

    # Step 1: Create the payment
    print("\nCreating payment...")
    try:
        from api_client import get_credentials
        from_customer, _ = get_credentials()
        result = create_payment(token, from_customer, to_customer, amount, currency)
    except requests.HTTPError as exc:
        print(f"Failed to create payment: {exc}", file=sys.stderr)
        sys.exit(1)

    payment = result.get("payment", {})
    problems = result.get("problems")

    if problems:
        print(f"Error: {problems}", file=sys.stderr)
        sys.exit(1)

    payment_id = payment.get("paymentId")
    payment_ref = payment.get("paymentReference")
    timestamp = payment.get("timestamp")

    if not payment_id or not timestamp:
        print("Error: Missing paymentId or timestamp in response.", file=sys.stderr)
        sys.exit(1)

    print(f"  Payment ID:  {payment_id}")
    print(f"  Reference:   {payment_ref}")

    # Step 2: Confirm/post the payment
    print("\nConfirming payment...")
    try:
        post_result = confirm_payment(token, payment_id, timestamp)
    except requests.HTTPError as exc:
        print(f"Failed to confirm payment: {exc}", file=sys.stderr)
        sys.exit(1)

    post_problems = post_result.get("problems")
    if post_problems:
        print(f"Error: {post_problems}", file=sys.stderr)
        sys.exit(1)

    print(f"\nPayment of {amount:,.2f} {currency} to {to_customer} completed successfully.")
    print(f"  Reference: {payment_ref}")
    print("\n=== COMPLETE ===")


if __name__ == "__main__":
    main()

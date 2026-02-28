"""Fetch and display account statements with interactive account and date selection.

Usage:
    export WALLET_USERNAME="your_user"
    export WALLET_PASSWORD="your_pass"
    python scripts/account_statement.py
"""

import sys
from datetime import datetime, timedelta

import requests

from api_client import BASE_URL, auth_headers, authenticate, get_balances


def select_account(balances: list[dict]) -> dict:
    """Display available accounts and prompt the user to pick one."""
    print("\nAvailable Accounts:")
    for idx, bal in enumerate(balances, start=1):
        currency = bal.get("currencyCode", "N/A")
        account_number = bal.get("accountNumber", "N/A")
        available = bal.get("balanceAvailable", 0)
        print(f"  {idx}. {currency:<8} (Account: {account_number}) - Balance: {available:,.2f}")

    print("\n=== SELECT ACCOUNT ===")
    raw = input(f"Enter account number (1-{len(balances)}): ")
    try:
        index = int(raw) - 1
        if index < 0 or index >= len(balances):
            raise ValueError
    except ValueError:
        print("Error: Invalid selection.", file=sys.stderr)
        sys.exit(1)

    selected = balances[index]
    print(f"Selected: {selected.get('currencyCode')} (Account ID: {selected.get('accountId')})")
    return selected


def select_date_range() -> tuple[datetime, datetime]:
    """Prompt the user for a date range and return (start, end) datetimes."""
    print("\n=== SELECT DATE RANGE ===")
    print("Options:")
    print("  1. Last 7 days")
    print("  2. Last 30 days")
    print("  3. Last 90 days")
    print("  4. Custom date range")

    option = input("Select option (1-4): ")
    end_date = datetime.now()

    if option == "1":
        start_date = end_date - timedelta(days=7)
        print("Date Range: Last 7 days")
    elif option == "2":
        start_date = end_date - timedelta(days=30)
        print("Date Range: Last 30 days")
    elif option == "3":
        start_date = end_date - timedelta(days=90)
        print("Date Range: Last 90 days")
    elif option == "4":
        try:
            start_str = input("  Start Date (yyyy-MM-dd): ")
            end_str = input("  End Date (yyyy-MM-dd): ")
            start_date = datetime.strptime(start_str, "%Y-%m-%d")
            end_date = datetime.strptime(end_str, "%Y-%m-%d")
            if start_date > end_date:
                print("Error: Start date cannot be after end date.", file=sys.stderr)
                sys.exit(1)
            print(f"Custom Date Range: {start_date:%Y-%m-%d} to {end_date:%Y-%m-%d}")
        except ValueError:
            print("Error: Invalid date format. Use yyyy-MM-dd.", file=sys.stderr)
            sys.exit(1)
    else:
        print("Error: Invalid option selected.", file=sys.stderr)
        sys.exit(1)

    return start_date, end_date


def display_statement(data: dict, start_date: datetime, end_date: datetime) -> None:
    """Pretty-print the account statement response."""
    print("\n" + "=" * 60)
    print("              ACCOUNT STATEMENT")
    print("=" * 60)

    account_info = data.get("accountInfo", {})
    if account_info:
        currency = account_info.get("accountCurrencyCode", "")
        print("\nAccount Details:")
        print(f"  Account ID:       {account_info.get('accountId')}")
        print(f"  Account Number:   {account_info.get('accountNumber')}")
        print(f"  Account Name:     {account_info.get('accountName')}")
        print(f"  Currency:         {currency}")
        print(f"  Currency Scale:   {account_info.get('accountCurrencyScale')}")
        print(f"\n  Beginning Balance: {account_info.get('beginningBalance', 0):,.2f} {currency}")
        print(f"  Ending Balance:    {account_info.get('endingBalance', 0):,.2f} {currency}")

    entries = data.get("entries", [])
    if not entries:
        print("\n  No transactions found for this period.")
        return

    print(f"\nStatement Entries ({start_date:%d %b %Y} - {end_date:%d %b %Y}):")
    print(f"  Total Entries: {len(entries)}\n")

    header = f"{'Date':<18}{'Type':<16}{'Description':<30}{'Debit':>12}{'Credit':>12}{'Balance':>12}"
    print(header)
    print("-" * len(header))

    total_debit = 0.0
    total_credit = 0.0

    for entry in entries:
        txn_time = entry.get("transactionTime")
        if txn_time:
            try:
                dt = datetime.fromisoformat(txn_time)
                date_str = dt.strftime("%Y-%m-%d %H:%M")
            except (ValueError, TypeError):
                date_str = "N/A"
        else:
            date_str = "N/A"

        txn_type = entry.get("transactionType", "")
        description = entry.get("description", "")
        debit = entry.get("debitAmount", 0) or 0
        credit = entry.get("creditAmount", 0) or 0
        balance = entry.get("runningBalance", 0)

        total_debit += debit
        total_credit += credit

        debit_str = f"{debit:,.2f}" if debit > 0 else ""
        credit_str = f"{credit:,.2f}" if credit > 0 else ""

        print(f"{date_str:<18}{txn_type:<16}{description:<30}{debit_str:>12}{credit_str:>12}{balance:>12,.2f}")

    currency = account_info.get("accountCurrencyCode", "")
    print(f"\nSummary:")
    print(f"  Total Debits:  {total_debit:,.2f} {currency}")
    print(f"  Total Credits: {total_credit:,.2f} {currency}")
    print(f"  Net Change:    {total_credit - total_debit:,.2f} {currency}")


def main() -> None:
    print("\n=== AUTHENTICATING ===")
    token, customer_id = authenticate()

    print("\n=== FETCHING AVAILABLE ACCOUNTS ===")
    try:
        balances = get_balances(token, customer_id)
    except requests.HTTPError as exc:
        print(f"Failed to retrieve balances: {exc}", file=sys.stderr)
        sys.exit(1)

    selected_account = select_account(balances)
    start_date, end_date = select_date_range()

    account_id = selected_account.get("accountId")
    currency = selected_account.get("currencyCode")
    print(f"\n=== FETCHING ACCOUNT STATEMENT ===")
    print(f"  Currency: {currency}")
    print(f"  Period: {start_date:%Y-%m-%d} to {end_date:%Y-%m-%d}\n")

    url = f"{BASE_URL}/CustomerAccountStatement"
    params = {
        "accountId": account_id,
        "strStartDate": start_date.strftime("%Y-%m-%d"),
        "strEndDate": end_date.strftime("%Y-%m-%d"),
    }

    try:
        response = requests.get(url, params=params, headers=auth_headers(token), timeout=30)
        response.raise_for_status()
        statement_data = response.json()
    except requests.HTTPError as exc:
        print(f"Failed to retrieve statement: {exc}", file=sys.stderr)
        print(f"\nAPI URL attempted: {url}", file=sys.stderr)
        sys.exit(1)

    display_statement(statement_data, start_date, end_date)
    print("\nStatement retrieved successfully.")
    print("\n=== COMPLETE ===")


if __name__ == "__main__":
    main()

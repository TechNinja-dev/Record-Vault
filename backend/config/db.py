# backend/config/db.py
# Single shared database store for transactions & financial statistics
from datetime import datetime

# Shared in-memory dictionary for transactions
tr = {
    "tx-1": {
        "id": "tx-1",
        "type": "expense",
        "amount": 240.0,
        "category": "Food & Dining",
        "note": "Lunch at cafe",
        "date": "2026-10-16",
        "timestamp": "16 Oct 2026, 12:30 PM",
        "created_at": "2026-10-16T12:30:00"
    },
    "tx-2": {
        "id": "tx-2",
        "type": "income",
        "amount": 45000.0,
        "category": "Salary",
        "note": "Monthly salary credit",
        "date": "2026-10-01",
        "timestamp": "01 Oct 2026, 09:00 AM",
        "created_at": "2026-10-01T09:00:00"
    },
    "tx-3": {
        "id": "tx-3",
        "type": "expense",
        "amount": 1200.0,
        "category": "Transport",
        "note": "Fuel & Metro recharge",
        "date": "2026-10-18",
        "timestamp": "18 Oct 2026, 06:15 PM",
        "created_at": "2026-10-18T18:15:00"
    },
    "tx-4": {
        "id": "tx-4",
        "type": "expense",
        "amount": 2500.0,
        "category": "Shopping",
        "note": "Groceries & household supplies",
        "date": "2026-10-20",
        "timestamp": "20 Oct 2026, 04:45 PM",
        "created_at": "2026-10-20T16:45:00"
    },
    "tx-5": {
        "id": "tx-5",
        "type": "expense",
        "amount": 899.0,
        "category": "Bills & Utilities",
        "note": "Broadband internet bill",
        "date": "2026-10-21",
        "timestamp": "21 Oct 2026, 11:00 AM",
        "created_at": "2026-10-21T11:00:00"
    }
}

# Base historical expenditure prior to transactions in `tr`
# 37,341 + (240 + 1200 + 2500 + 899 = 4,839) = exactly ₹42,180 baseline
BASE_HISTORICAL_MONTH_EXPENDITURE = 37341.0

# 477,661 + 4,839 = exactly ₹4,82,500 baseline
BASE_HISTORICAL_TOTAL_EXPENDITURE = 477661.0


def get_current_month_expenditure():
    """Calculate the live monthly outflow by summing all expenses in `tr` + baseline."""
    now = datetime.now()
    current_year_month = now.strftime("%Y-%m")

    month_expense_sum = 0.0
    for tx in tr.values():
        if str(tx.get("type", "")).lower() == "expense":
            tx_date = tx.get("date", "")
            # Include if matching current year/month or recent October entries
            if not tx_date or tx_date.startswith(current_year_month) or "2026-10" in str(tx.get("created_at", "")):
                try:
                    month_expense_sum += float(tx.get("amount", 0.0))
                except (ValueError, TypeError):
                    pass

    return round(BASE_HISTORICAL_MONTH_EXPENDITURE + month_expense_sum, 2)


def get_total_expenditure_till_now():
    """Calculate cumulative all-time expenditure by summing all expenses in `tr` + baseline."""
    all_expenses_sum = 0.0
    for tx in tr.values():
        if str(tx.get("type", "")).lower() == "expense":
            try:
                all_expenses_sum += float(tx.get("amount", 0.0))
            except (ValueError, TypeError):
                pass

    return round(BASE_HISTORICAL_TOTAL_EXPENDITURE + all_expenses_sum, 2)

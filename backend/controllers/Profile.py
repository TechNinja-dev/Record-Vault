# backend/controllers/Profile.py
from datetime import datetime
from config.db import cursor

# In-memory Profile & Financial Records for User
user_profile = {
    "personal": {
        "id": "usr-101",
        "name": "Prakhar Srivastava",
        "email": "prakharsrivastava019@gmail.com",
        "phone": "+91 98765 43210",
        "occupation": "Senior Software Architect & Consultant",
        "location": "Bengaluru, Karnataka, India",
        "avatar_initials": "PS",
        "pan_number": "ABCDE1234F",
        "tax_regime": "New Tax Regime (FY 2026-27)",
        "joined_date": "January 2026" 
    },
    "finances": {
        "annual_income": 1800000.0,
        "monthly_income": 150000.0,
        "current_month_expenditure": 42180.0,
        "total_expenditure_till_now": 482500.0,
        "total_savings_investments": 765000.0,
        "net_worth_estimate": 2450000.0
    },
    "bills_overview": {
        "total_bills_count": 8,
        "paid_bills_count": 5,
        "left_bills_count": 3,
        "total_paid_amount": 34500.0,
        "total_pending_amount": 12850.0
    },
    "bills": [
        {
            "id": "bill-1",
            "title": "Electricity & Power (BESCOM)",
            "category": "Bills & Utilities",
            "amount": 3200.0,
            "due_date": "2026-10-28",
            "status": "pending",
            "due_days_left": 6,
            "icon": "⚡"
        },
        {
            "id": "bill-2",
            "title": "Airtel Xstream Fiber Broadband",
            "category": "Bills & Utilities",
            "amount": 1499.0,
            "due_date": "2026-11-02",
            "status": "pending",
            "due_days_left": 11,
            "icon": "🌐"
        },
        {
            "id": "bill-3",
            "title": "HDFC Regalia Credit Card",
            "category": "Finance",
            "amount": 8151.0,
            "due_date": "2026-11-05",
            "status": "pending",
            "due_days_left": 14,
            "icon": "💳"
        },
        {
            "id": "bill-4",
            "title": "Apartment Monthly Rent",
            "category": "Housing",
            "amount": 25000.0,
            "due_date": "2026-10-01",
            "paid_on": "2026-10-01",
            "status": "paid",
            "icon": "🏠"
        },
        {
            "id": "bill-5",
            "title": "Piped Natural Gas (GAIL)",
            "category": "Bills & Utilities",
            "amount": 850.0,
            "due_date": "2026-10-04",
            "paid_on": "2026-10-03",
            "status": "paid",
            "icon": "🔥"
        },
        {
            "id": "bill-6",
            "title": "Mobile Postpaid Family Plan",
            "category": "Bills & Utilities",
            "amount": 999.0,
            "due_date": "2026-10-08",
            "paid_on": "2026-10-07",
            "status": "paid",
            "icon": "📱"
        },
        {
            "id": "bill-7",
            "title": "Society Water & Maintenance",
            "category": "Housing",
            "amount": 2200.0,
            "due_date": "2026-10-10",
            "paid_on": "2026-10-09",
            "status": "paid",
            "icon": "💧"
        },
        {
            "id": "bill-8",
            "title": "Cloud Services & Developer Tooling",
            "category": "Work & Subscriptions",
            "amount": 5451.0,
            "due_date": "2026-10-15",
            "paid_on": "2026-10-14",
            "status": "paid",
            "icon": "☁️"
        }
    ],
    "advance_tax": {
        "financial_year": "FY 2026-27 (AY 2027-28)",
        "gross_taxable_income": 1800000.0,
        "standard_deduction": 75000.0,
        "net_taxable_income": 1725000.0,
        "estimated_total_tax": 215800.0,
        "tds_credits_deducted": 100000.0,
        "net_advance_tax_payable": 115800.0,
        "total_advance_tax_paid_so_far": 52110.0,
        "remaining_advance_tax_to_pay": 63690.0,
        "schedule": [
            {
                "installment": "1st Installment (15%)",
                "due_date": "2026-06-15",
                "percentage": "15%",
                "cumulative_target": 17370.0,
                "installment_amount": 17370.0,
                "amount_paid": 17370.0,
                "status": "paid",
                "paid_on": "2026-06-12",
                "notes": "Payment Challan #ITX-48291"
            },
            {
                "installment": "2nd Installment (45%)",
                "due_date": "2026-09-15",
                "percentage": "45%",
                "cumulative_target": 52110.0,
                "installment_amount": 34740.0,
                "amount_paid": 34740.0,
                "status": "paid",
                "paid_on": "2026-09-14",
                "notes": "Payment Challan #ITX-93102"
            },
            {
                "installment": "3rd Installment (75%)",
                "due_date": "2026-12-15",
                "percentage": "75%",
                "cumulative_target": 86850.0,
                "installment_amount": 34740.0,
                "amount_paid": 0.0,
                "status": "upcoming",
                "days_remaining": 54,
                "notes": "Next critical statutory tax deadline"
            },
            {
                "installment": "4th Installment (100%)",
                "due_date": "2027-03-15",
                "percentage": "100%",
                "cumulative_target": 115800.0,
                "installment_amount": 28950.0,
                "amount_paid": 0.0,
                "status": "upcoming",
                "days_remaining": 144,
                "notes": "Final FY installment"
            }
        ]
    }
}


def get_user_profile():
    """Retrieve full user profile with live dynamic monthly & total expenditure."""
    try:
        cursor.execute("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE LOWER(type) = 'expense' AND (date LIKE '2026-10%' OR date LIKE '2026-11%');")
        row = cursor.fetchone()
        user_profile["finances"]["current_month_expenditure"] = round(37341.0 + float(row["total"] if row else 0), 2)

        cursor.execute("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE LOWER(type) = 'expense';")
        row2 = cursor.fetchone()
        user_profile["finances"]["total_expenditure_till_now"] = round(477661.0 + float(row2["total"] if row2 else 0), 2)
    except Exception as e:
        print(f"Error querying expenditure for profile: {e}")

    return {
        "status": "success",
        "data": user_profile
    }


def update_user_profile(data):
    """Update editable personal or financial fields."""
    if hasattr(data, "dict"):
        data = data.dict()
    elif not isinstance(data, dict):
        data = dict(data) if data else {}

    if "name" in data:
        user_profile["personal"]["name"] = data["name"]
    if "occupation" in data:
        user_profile["personal"]["occupation"] = data["occupation"]
    if "phone" in data:
        user_profile["personal"]["phone"] = data["phone"]
    if "monthly_income" in data:
        try:
            m_inc = float(data["monthly_income"])
            user_profile["finances"]["monthly_income"] = m_inc
            user_profile["finances"]["annual_income"] = m_inc * 12
        except (ValueError, TypeError):
            pass

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "data": user_profile
    }


def mark_bill_paid(data):
    """Mark a specific pending bill as paid and recompute overview totals."""
    if hasattr(data, "dict"):
        data = data.dict()
    elif not isinstance(data, dict):
        data = dict(data) if data else {}

    bill_id = data.get("bill_id")
    if not bill_id:
        return {"status": "error", "message": "bill_id is required"}

    for bill in user_profile["bills"]:
        if bill["id"] == bill_id:
            if bill["status"] != "paid":
                bill["status"] = "paid"
                bill["paid_on"] = datetime.now().strftime("%Y-%m-%d")
                user_profile["bills_overview"]["paid_bills_count"] += 1
                user_profile["bills_overview"]["left_bills_count"] = max(0, user_profile["bills_overview"]["left_bills_count"] - 1)
                user_profile["bills_overview"]["total_paid_amount"] += bill["amount"]
                user_profile["bills_overview"]["total_pending_amount"] = max(0.0, user_profile["bills_overview"]["total_pending_amount"] - bill["amount"])
            return {
                "status": "success",
                "message": f"Bill '{bill['title']}' marked as paid",
                "data": user_profile["bills_overview"]
            }

    return {"status": "error", "message": f"Bill '{bill_id}' not found"}

from datetime import datetime
import calendar
from config.db import cursor


def get_user_profile(uid):
    try:
        cursor.execute("SELECT * FROM users WHERE uid = %s;", (uid,))
        row = cursor.fetchone()
        if not row:
            return {"message": "User not found", "data": None}

        # Calculate actual current month outflow and total expenditure from transactions
        now = datetime.now()
        y, m = now.year, now.month
        first_day = f"{y}-{m:02d}-01"
        last_day = f"{y}-{m:02d}-{calendar.monthrange(y, m)[1]:02d}"

        cursor.execute("""
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'expense' AND date >= %s AND date <= %s THEN amount ELSE 0 END), 0) AS current_month_expenditure,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenditure_till_now
            FROM transactions 
            WHERE uid = %s;
        """, (first_day, last_day, uid))

        exp_stats = cursor.fetchone() or {}
        row["current_month_expenditure"] = float(exp_stats.get("current_month_expenditure", 0.0))
        row["total_expenditure_till_now"] = float(exp_stats.get("total_expenditure_till_now", 0.0))

        return {"message": "Success", "data": row}
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return {"message": "Failed to fetch", "data": None}


def update_user_profile(data):
    try:
        uid = data.get("uid")
        cursor.execute("""
            UPDATE users 
            SET name=%s, phone=%s, occupation=%s, location=%s, avatar_url=%s, pan_number=%s, 
                tax_regime=%s, monthly_income=%s, annual_income=%s, total_savings_investments=%s, net_worth_estimate=%s
            WHERE uid=%s;
        """, (
            data.get("name"),
            data.get("phone"),
            data.get("occupation"),
            data.get("location"),
            data.get("avatar_url"),
            data.get("pan_number"),
            data.get("tax_regime"),
            data.get("monthly_income"),
            data.get("annual_income"),
            data.get("total_savings_investments"),
            data.get("net_worth_estimate"),
            uid
        ))
        return {"message": "Profile updated successfully", "data": data}
    except Exception as e:
        print(f"Error updating profile: {e}")
        return {"message": "Failed to update profile", "data": None}

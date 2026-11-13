import uuid
from datetime import datetime
from config.db import cursor


def add_transaction(data):
    if hasattr(data, "dict"):
        data = data.dict()
    elif not isinstance(data, dict):
        data = dict(data) if data else {}

    tx_id = data.get("id") or f"tx-{uuid.uuid4().hex[:8]}"
    now = datetime.now()

    try:
        amount = float(data.get("amount", 0.0))
    except (ValueError, TypeError):
        amount = 0.0

    tx_type = str(data.get("type", "expense")).lower()
    category = data.get("category", "Other")
    note = str(data.get("note", "")).strip()

    date_str = data.get("date") or now.strftime("%Y-%m-%d")
    timestamp_str = data.get("timestamp") or now.strftime("%d %b %Y, %I:%M %p")
    created_at = data.get("created_at") or now.strftime("%Y-%m-%d %H:%M:%S")

    record = {
        "id": tx_id,
        "type": tx_type,
        "amount": amount,
        "category": category,
        "note": note,
        "date": date_str,
        "timestamp": timestamp_str,
        "created_at": created_at
    }

    try:
        cursor.execute("""
            INSERT INTO transactions (id, uid, type, amount, category, note, date, timestamp, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (
            tx_id, data.get("uid") or data.get("user_id", "usr-101"), tx_type, amount, category,
            note, date_str, timestamp_str, created_at
        ))
    except Exception as e:
        print(f"Error inserting transaction: {e}")

    return {
        "status": "success",
        "message": "Transaction added successfully",
        "data": record
    }


def get_transaction(data=None):
    try:
        cursor.execute("SELECT * FROM transactions ORDER BY created_at DESC, date DESC;")
        tx_list = cursor.fetchall() or []
        for r in tx_list:
            r["amount"] = float(r["amount"])
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        tx_list = []

    if data:
        if isinstance(data, dict):
            filter_type = data.get("type")
            category = data.get("category")
            tx_id = data.get("id")
            if tx_id:
                single = next((t for t in tx_list if t.get("id") == tx_id), None)
                return {"status": "success", "data": [single] if single else []}
            if filter_type:
                tx_list = [t for t in tx_list if t.get("type") == filter_type]
            if category:
                tx_list = [t for t in tx_list if t.get("category") == category]
        elif isinstance(data, str) and data.strip():
            query = data.strip().lower()
            tx_list = [
                t for t in tx_list
                if query in str(t.get("note", "")).lower()
                or query in str(t.get("category", "")).lower()
                or query in str(t.get("type", "")).lower()
                or query == str(t.get("id", "")).lower()
            ]

    return {
        "status": "success",
        "total": len(tx_list),
        "data": tx_list
    }


def delete_transaction(data):
    if hasattr(data, "dict"):
        data = data.dict()
    elif not isinstance(data, dict):
        data = {"id": str(data)} if data else {}

    tx_id = data.get("id")
    if not tx_id:
        return {"status": "error", "message": "Transaction ID is required"}

    try:
        cursor.execute("SELECT * FROM transactions WHERE id = %s;", (tx_id,))
        removed = cursor.fetchone()
        cursor.execute("DELETE FROM transactions WHERE id = %s;", (tx_id,))
        if removed:
            removed["amount"] = float(removed["amount"])
            return {
                "status": "success",
                "message": "Transaction deleted successfully",
                "data": removed
            }
    except Exception as e:
        print(f"Error deleting transaction: {e}")

    return {
        "status": "error",
        "message": f"Transaction with id '{tx_id}' not found"
    }


def update_transaction(data):
    if hasattr(data, "dict"):
        data = data.dict()
    elif not isinstance(data, dict):
        data = dict(data) if data else {}

    tx_id = data.get("id")
    if not tx_id:
        return {"status": "error", "message": "Transaction ID is required"}

    try:
        set_clauses = []
        values = []
        for k in ("type", "amount", "category", "note", "date"):
            if k in data:
                set_clauses.append(f"`{k}` = %s")
                values.append(float(data[k]) if k == "amount" else data[k])

        if set_clauses:
            values.append(tx_id)
            query = f"UPDATE transactions SET {', '.join(set_clauses)} WHERE id = %s;"
            cursor.execute(query, tuple(values))

        cursor.execute("SELECT * FROM transactions WHERE id = %s;", (tx_id,))
        record = cursor.fetchone()
        if record:
            record["amount"] = float(record["amount"])
            return {
                "status": "success",
                "message": "Transaction updated successfully",
                "data": record
            }
    except Exception as e:
        print(f"Error updating transaction: {e}")

    return {"status": "error", "message": f"Transaction with id '{tx_id}' not found"}

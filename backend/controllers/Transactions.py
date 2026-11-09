import uuid
from datetime import datetime

# Import single shared transaction store and calculation helpers
from config.db import tr, get_current_month_expenditure, get_total_expenditure_till_now


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
    created_at = data.get("created_at") or now.isoformat()

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

    tr[tx_id] = record
    return {
        "status": "success",
        "message": "Transaction added successfully",
        "data": record
    }


def get_transaction(data=None):
    tx_list = list(tr.values())

    # Sort latest first by date/created_at
    try:
        tx_list.sort(key=lambda x: x.get("created_at", x.get("date", "")), reverse=True)
    except Exception:
        pass

    if data:
        if isinstance(data, dict):
            filter_type = data.get("type")
            category = data.get("category")
            tx_id = data.get("id")
            if tx_id:
                single = tr.get(tx_id)
                return {"status": "success", "data": [single] if single else []}
            if filter_type:
                tx_list = [t for t in tx_list if t.get("type") == filter_type]
            if category:
                tx_list = [t for t in tx_list if t.get("category") == category]
        elif isinstance(data, str) and data.strip():
            query = data.strip().lower()
            if query in tr:
                return {"status": "success", "data": [tr[query]]}
            tx_list = [
                t for t in tx_list
                if query in t.get("note", "").lower()
                or query in t.get("category", "").lower()
                or query in t.get("type", "").lower()
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

    if tx_id in tr:
        removed = tr.pop(tx_id)
        return {
            "status": "success",
            "message": "Transaction deleted successfully",
            "data": removed
        }

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
    if not tx_id or tx_id not in tr:
        return {"status": "error", "message": f"Transaction with id '{tx_id}' not found"}

    record = tr[tx_id]
    if "amount" in data:
        try:
            record["amount"] = float(data["amount"])
        except (ValueError, TypeError):
            pass
    if "type" in data:
        record["type"] = str(data["type"]).lower()
    if "category" in data:
        record["category"] = data["category"]
    if "note" in data:
        record["note"] = str(data["note"]).strip()
    if "date" in data:
        record["date"] = data["date"]

    tr[tx_id] = record
    return {
        "status": "success",
        "message": "Transaction updated successfully",
        "data": record
    }

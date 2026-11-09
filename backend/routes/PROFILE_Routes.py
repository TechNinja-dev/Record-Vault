from fastapi import APIRouter, Body
from typing import Dict, Any
from controllers.Profile import get_user_profile, update_user_profile, mark_bill_paid

profile_router = APIRouter(prefix="/profile", tags=["Profile"])


@profile_router.get("/")
def get_profile():
    return get_user_profile()


@profile_router.post("/update")
def update_profile(data: Dict[str, Any] = Body(...)):
    return update_user_profile(data)


@profile_router.post("/bills/mark-paid")
def pay_bill(data: Dict[str, Any] = Body(...)):
    return mark_bill_paid(data)

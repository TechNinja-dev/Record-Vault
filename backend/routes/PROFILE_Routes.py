from fastapi import APIRouter, Body
from typing import Dict, Any, Optional
from controllers.Profile import get_user_profile, update_user_profile

profile_router = APIRouter(prefix="/profile", tags=["Profile"])


@profile_router.get("/")
def get_profile(uid: Optional[str] = None):
    return get_user_profile(uid)


@profile_router.post("/update")
def update_profile(data: Dict[str, Any] = Body(...)):
    return update_user_profile(data)

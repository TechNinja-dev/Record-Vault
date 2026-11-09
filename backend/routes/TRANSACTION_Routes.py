from fastapi import APIRouter, Body
from typing import Optional, Dict, Any
from controllers.Transactions import *

tr_router = APIRouter(prefix="/tran", tags=['Transaction'])


@tr_router.post("/add")  
def add(data: Dict[str, Any] = Body(...)):
    return add_transaction(data)


@tr_router.post('/delete')
def delete(data: Dict[str, Any] = Body(...)):
    return delete_transaction(data)


@tr_router.get('/fetch')
def get(data: Optional[str] = None):
    return get_transaction(data)


@tr_router.post('/update')
def update(data: Dict[str, Any] = Body(...)):
    return update_transaction(data)

from fastapi import APIRouter
from models.Auth_Models import RegisterUser,LoginUser,GoogleAuth
from controllers.Authentication import register,login,google_authentication 

auth_router=APIRouter(prefix="/auth",tags=["Authentication"]) 

@auth_router.post('/register')
def register_user(data:RegisterUser):
    rel=register(data)
    return rel

@auth_router.post('/login')
def login_user(data:LoginUser):
    rel=login(data)
    return rel

@auth_router.post('/google_auth')
def google_auth(data:GoogleAuth):
    rel=google_authentication(data)
    return rel
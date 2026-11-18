from fastapi import APIRouter
from models.Auth_Models import RegisterUser, LoginUser, GoogleAuth, CreatePassword
from controllers.Authentication import register, login, google_authentication, create_password 

auth_router = APIRouter(prefix="/auth", tags=["Authentication"]) 

@auth_router.post('/register')
def register_user(data: RegisterUser):
    rel = register(data)
    return rel

@auth_router.post('/login')
def login_user(data: LoginUser):
    rel = login(data)
    return rel

@auth_router.post('/google_auth')
def google_auth(data: GoogleAuth):
    rel = google_authentication(data)
    return rel

@auth_router.post('/create_pwd')
def create_pwd(data: CreatePassword):
    res = create_password(data)
    return res

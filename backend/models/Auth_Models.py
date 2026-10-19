from pydantic import BaseModel

class RegisterUser(BaseModel):
    user_name: set
    user_email:str
    password:str

class LoginUser(BaseModel):
    user_name:str
    password:str

class GoogleAuth(BaseModel):
    token:str

from fastapi import FastAPI
from fastapi.middleware import CORSMiddleware
from routes.AUTH_Routes import auth_router
import firebase_admin
from config.firebase import cred
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
firebase_admin.initialize_app(cred)
app.include_router(auth_router)





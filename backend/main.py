from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.AUTH_Routes import auth_router
from routes.TRANSACTION_Routes import tr_router
from routes.PROFILE_Routes import profile_router
import firebase_admin
from config.firebase import cred

app = FastAPI(title="Record Vault API")

origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5501",
    "http://127.0.0.1:5501",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional Firebase Init
try:
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
        print(">>> [FIREBASE INIT] Firebase Admin SDK initialized successfully with credentials!", flush=True)
    else:
        print(">>> [FIREBASE INIT] Firebase Admin SDK already initialized.", flush=True)
except Exception as e:
    print(f">>> [FIREBASE INIT ERROR] Failed to initialize Firebase Admin SDK: {e}", flush=True)

app.include_router(auth_router)
app.include_router(tr_router)
app.include_router(profile_router)

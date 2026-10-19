import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("backend/config/service-key.json") 
# rel=firebase_admin.initialize_app(cred)
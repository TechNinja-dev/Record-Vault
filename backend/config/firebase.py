import os
import firebase_admin
from firebase_admin import credentials

# Resolve service-key.json path relative to this file (config/service-key.json)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_KEY_PATH = os.path.join(CURRENT_DIR, "service-key.json")

cred = credentials.Certificate(SERVICE_KEY_PATH)
# rel = firebase_admin.initialize_app(cred)
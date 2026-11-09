from firebase_admin import auth

def register(data):
    pass

def login(data):
    pass

def google_authentication(data):
    try:
        res = auth.verify_id_token(data.token, clock_skew_seconds=60)
        if res:
            uid = res.get("uid")
            name = res.get("name") or (res.get("email", "").split("@")[0] if res.get("email") else "User")
            email = res.get("email", "")
            picture = res.get("picture", "")
            print(f"Uid : {uid} | Name : {name} | Email : {email}")
            return {
                "message": "Success",
                "data": {
                    "uid": uid,
                    "name": name,
                    "email": email,
                    "picture": picture
                }
            }
        else:
            print("Invalid token response")
            return {"message": "Invalid", "data": None}
    except Exception as e:
        print("Google Auth Verification Error:", str(e))
        return {"message": f"Verification failed: {str(e)}", "data": None}

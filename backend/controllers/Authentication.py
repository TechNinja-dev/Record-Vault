from firebase_admin import auth
from config.db import cursor


# Register
def register(data):
    try:
        user_email = data.user_email
        user_name = data.user_name
        password = data.password

        if not user_email or not password:
            return {"message": "Email and password are required", "data": None}

        # Check if user already exists by email
        cursor.execute("SELECT * FROM users WHERE email = %s;", (user_email,))
        existing_user = cursor.fetchone()
        if existing_user:
            return {"message": "User already exists", "data": None}

        # Create user in Firebase Auth
        try:
            firebase_user = auth.create_user(
                email=user_email,
                password=password,
                display_name=user_name
            )
            uid = firebase_user.uid
            picture = firebase_user.photo_url or ""
        except Exception as fb_err:
            print("Firebase Error:", fb_err)
            return {"message": f"Firebase user creation failed: {str(fb_err)}", "data": None}

        # Insert user into MySQL database with password
        cursor.execute(
            "INSERT INTO users (uid, name, email, password, avatar_url) VALUES (%s, %s, %s, %s, %s);",
            (uid, user_name, user_email, password, picture)
        )

        return {
            "message": "Success",
            "data": {
                "uid": uid,
                "name": user_name,
                "email": user_email,
                "picture": picture
            }
        }
    except Exception as e:
        print("Register Error:", e)
        return {"message": f"Registration failed: {str(e)}", "data": None}


# Login
def login(data):
    try:
        mail = data.user_email or data.user_name
        pwd = data.password

        if not mail or not pwd:
            return {"message": "Email and password are required", "data": None}

        cursor.execute("SELECT * FROM users WHERE email = %s;", (mail,))
        user = cursor.fetchone()

        if not user:
            return {"message": "User Not Found", "data": None}

        user_pwd = user.get("password")
        if not user_pwd:
            return {"message": "This account was signed up via Google. Please log in with Google or create a password.", "data": None}

        if user_pwd != pwd:
            return {"message": "Invalid Credentials", "data": None}

        uid = user.get("uid")
        name = user.get("name") or (mail.split("@")[0] if mail else "User")
        avatar = user.get("avatar_url") or ""

        return {
            "message": "Success",
            "data": {
                "uid": uid,
                "email": mail,
                "name": name,
                "avatar": avatar,
                "picture": avatar
            }
        }
    except Exception as e:
        print("Login Error:", e)
        return {"message": f"Login Error: {str(e)}", "data": None}


# Google Authentication
def google_authentication(data):
    try:
        res = auth.verify_id_token(data.token, clock_skew_seconds=60)
        if res:
            uid = res.get("uid")
            name = res.get("name") or (res.get("email", "").split("@")[0] if res.get("email") else "User")
            email = res.get("email", "")
            picture = res.get("picture", "")
            print(f"Uid : {uid} | Name : {name} | Email : {email}")

            # Check if user already exists
            cursor.execute("SELECT * FROM users WHERE uid = %s;", (uid,))
            existing_user = cursor.fetchone()

            if not existing_user:
                # First time Google sign-in: insert into database with NULL password
                cursor.execute(
                    "INSERT INTO users (uid, name, email, password, avatar_url) VALUES (%s, %s, %s, %s, %s);",
                    (uid, name, email, None, picture)
                )
                needs_password = True
            else:
                needs_password = False

            return {
                "message": "Success",
                "data": {
                    "uid": uid,
                    "name": name,
                    "email": email,
                    "picture": picture,
                    "needs_password": needs_password
                }
            }
        else:
            print("Invalid token response")
            return {"message": "Invalid token", "data": None}
    except Exception as e:
        print("Google Auth Verification Error:", str(e))
        return {"message": f"Verification failed: {str(e)}", "data": None}


# Create / Set Password for Google User
def create_password(data):
    try:
        uid = data.uid
        password = data.password

        if not uid or not password:
            return {"message": "UID and password are required", "status": "error"}

        # 1. Update password in MySQL
        cursor.execute("UPDATE users SET password = %s WHERE uid = %s;", (password, uid))

        # 2. Sync password with Firebase Auth
        try:
            auth.update_user(uid, password=password)
        except Exception as fb_e:
            print("Firebase password update note:", fb_e)

        return {"message": "Password created successfully", "status": "success"}
    except Exception as e:
        print("Create Password Error:", e)
        return {"message": f"Failed to create password: {str(e)}", "status": "error"}

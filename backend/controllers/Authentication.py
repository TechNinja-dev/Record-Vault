from firebase_admin import auth
from config.db import cursor


# Register
def register(data):
    try:
        # Check if user already exists by email
        cursor.execute("SELECT * FROM users WHERE email = %s;", (data.user_email,))
        existing_user = cursor.fetchone()
        if existing_user:
            return {"message": "User already exists", "data": None}

        # Create user in Firebase Auth
        try:
            firebase_user = auth.create_user(
                email=data.user_email,
                password=data.password,
                display_name=data.user_name
            )
            uid = firebase_user.uid
            picture = getattr(firebase_user, "photo_url", "") or ""
        except Exception as fb_err:
            try:
                fb_user = auth.get_user_by_email(data.user_email)
                uid = fb_user.uid
                picture = getattr(fb_user, "photo_url", "") or ""
            except Exception:
                return {"message": f"Firebase user creation failed: {str(fb_err)}", "data": None}

        name = data.user_name or (data.user_email.split("@")[0] if data.user_email else "User")
        email = data.user_email

        # Insert user into MySQL database with password
        cursor.execute(
            "INSERT INTO users (uid, name, email, password, avatar_url) VALUES (%s, %s, %s, %s, %s);",
            (uid, name, email, data.password, picture)
        )

        return {
            "message": "Success",
            "data": {
                "uid": uid,
                "name": name,
                "email": email,
                "picture": picture
            }
        }
    except Exception as e:
        print("Register Error:", e)
        return {"message": f"Registration failed: {str(e)}", "data": None}


# Login
def login(data):
    try:
        identifier = getattr(data, 'user_email', None) or getattr(data, 'user_name', None)
        password = getattr(data, 'password', None)
        if not identifier or not password:
            return {"message": "Email and password are required", "data": None}

        # Check credentials in MySQL database
        cursor.execute(
            "SELECT * FROM users WHERE email = %s AND password = %s;",
            (identifier, password)
        )
        user = cursor.fetchone()
        if not user:
            return {"message": "User Not Found or Invalid Credentials", "data": None}

        uid = user.get("uid")
        name = user.get("name") or (user.get("email", "").split("@")[0] if user.get("email") else "User")
        email = user.get("email", "")
        picture = user.get("avatar_url") or ""

        # If picture is not stored in DB, attempt to fetch from Firebase
        if not picture and uid:
            try:
                fb_user = auth.get_user(uid)
                picture = getattr(fb_user, "photo_url", "") or ""
            except Exception:
                pass

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
    except Exception as e:
        print("Login Error:", e)
        return {"message": f"Login failed: {str(e)}", "data": None}


# Google Authentication
def google_authentication(data):
    try:
        res = auth.verify_id_token(data.token, clock_skew_seconds=60)
        if res:
            uid = res.get("uid")
            name = res.get("name") or (res.get("email", "").split("@")[0] if res.get("email") else "User")
            email = res.get("email", "")
            password="g_user"
            picture = res.get("picture", "")
            print(f"Uid : {uid} | Name : {name} | Email : {email}")

            # Check if user already exists
            cursor.execute("SELECT * FROM users WHERE uid = %s OR email = %s;", (uid, email))
            existing_user = cursor.fetchone()
            if existing_user:
                # Existing user - retain database profile without updating avatar
                uid = existing_user.get("uid") or uid
                name = existing_user.get("name") or name
                email = existing_user.get("email") or email

                picture = existing_user.get("avatar_url") or picture
            else:
                # First time Google sign-in: insert new user into MySQL
                cursor.execute(
                    "INSERT INTO users (uid, name, email,password, avatar_url) VALUES (%s, %s, %s,%s, %s);",
                    (uid, name, email,password, picture)
                )

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
            return {"message": "Invalid token", "data": None}
    except Exception as e:
        print("Google Auth Verification Error:", str(e))
        return {"message": f"Verification failed: {str(e)}", "data": None}

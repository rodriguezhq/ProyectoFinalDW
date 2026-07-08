from flask import jsonify
from flask_jwt_extended import set_access_cookies, set_refresh_cookies, unset_jwt_cookies
from app.services.auth_service import login_user


def login(body):
    """Autentica un usuario y devuelve tokens JWT + datos del usuario."""
    result = login_user(body.username, body.password)
    if not result:
        return jsonify({"msg": "Credenciales inválidas"}), 401
    
    # Extract access and refresh tokens from the service result
    access_token = result["access_token"]
    refresh_token = result["refresh_token"]
    
    # Build JSON response containing message and user info (without raw tokens)
    response = jsonify({"msg": "Login exitoso", **result})
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200


def logout():
    """Cierra la sesión del usuario."""
    response = jsonify({"msg": "Logout exitoso"})
    unset_jwt_cookies(response)
    return response, 200

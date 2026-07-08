from flask import jsonify, request
from flask_jwt_extended import set_access_cookies, set_refresh_cookies, unset_jwt_cookies
from app.services.auth_service import login_user


def login(body):
    """Autentica un usuario. Los tokens JWT van SOLO en cookies httpOnly,
    nunca en el body de la respuesta (si no, cualquier script/extension que
    lea la respuesta los puede robar igual, y de nada sirve httpOnly)."""
    result = login_user(body.username, body.password, ip=request.remote_addr)
    if not result:
        return jsonify({"msg": "Credenciales inválidas"}), 401

    access_token = result["access_token"]
    refresh_token = result["refresh_token"]

    response = jsonify({"msg": "Login exitoso", "user": result["user"]})
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200


def logout():
    """Cierra la sesión del usuario."""
    response = jsonify({"msg": "Logout exitoso"})
    unset_jwt_cookies(response)
    return response, 200

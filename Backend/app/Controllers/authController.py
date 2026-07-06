from app.services.auth_service import login_user


def login(body):
    """Autentica un usuario y devuelve tokens JWT + datos del usuario."""
    result = login_user(body.username, body.password)
    if not result:
        return {"msg": "Credenciales inválidas"}, 401
    return {"msg": "Login exitoso", **result}, 200


def logout():
    """Cierra la sesión del usuario."""
    return {"msg": "Logout exitoso"}, 200

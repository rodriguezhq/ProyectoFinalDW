from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("rol") not in roles:
                return (
                    jsonify({"msg": "No tienes permiso para acceder a este recurso"}),
                    403,
                )
            return f(*args, **kwargs)

        return wrapper

    return decorator

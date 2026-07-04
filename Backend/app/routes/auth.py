from flask import Blueprint, request, jsonify
from app.services.auth_service import login_user

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Nombre de usuario y contraseña son requeridos"}), 400

    user = login_user(username, password)
    if not user:
        return jsonify({"msg": "Credenciales inválidas"}), 401

    return jsonify({"msg": "Login exitoso", "user": user}), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"msg": "Logout exitoso"}), 200
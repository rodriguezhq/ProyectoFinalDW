"""Documentación OpenAPI + Scalar UI para el API."""
from flask import Blueprint, jsonify, render_template_string

docs_bp = Blueprint("docs", __name__)


@docs_bp.route("/openapi.json")
def openapi_spec():
    """Devuelve la especificación OpenAPI en JSON."""
    spec = {
        "openapi": "3.0.3",
        "info": {
            "title": "Sistema Académico API",
            "version": "1.0.0",
            "description": "API del Sistema de Gestión Académica - UNCP",
        },
        "servers": [{"url": "http://localhost:5000", "description": "Local"}],
        "paths": {
            "/api/auth/login": {
                "post": {
                    "summary": "Iniciar sesión",
                    "tags": ["Auth"],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "username": {"type": "string"},
                                        "password": {"type": "string"},
                                    },
                                    "required": ["username", "password"],
                                }
                            }
                        },
                    },
                    "responses": {
                        "200": {"description": "Login exitoso, devuelve tokens JWT"},
                        "401": {"description": "Credenciales inválidas"},
                    },
                }
            },
            "/api/auth/logout": {
                "post": {
                    "summary": "Cerrar sesión",
                    "tags": ["Auth"],
                    "responses": {
                        "200": {"description": "Sesión cerrada exitosamente"}
                    },
                }
            },
        },
    }
    return jsonify(spec)


SCALAR_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>API - Sistema Académico</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
    <script id="api-reference" data-url="/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
"""


@docs_bp.route("/scalar")
def scalar_ui():
    """Sirve la UI de Scalar para probar los endpoints."""
    return render_template_string(SCALAR_HTML)

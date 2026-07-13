import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


class Config:
    # Los defaults son solo para que arranque sin .env configurado. En produccion
    # SIEMPRE deben venir de variables de entorno reales (>= 32 bytes para HMAC-SHA256).
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-not-for-production-32b")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key-not-for-production-32b")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "mysql+pymysql://root:@localhost:3306/sistema_academico"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # JWT Cookie configuration
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_COOKIE_SECURE = False
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_SESSION_COOKIE = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
    # En produccion el frontend (Vercel) y el backend viven en dominios
    # distintos: la cookie JWT debe poder viajar cross-site (SameSite=None)
    # y eso obliga a enviarla solo por HTTPS (Secure).
    JWT_COOKIE_SECURE = True
    JWT_COOKIE_SAMESITE = "None"


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-jwt-secret-key-32-bytes-long-ok"


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}

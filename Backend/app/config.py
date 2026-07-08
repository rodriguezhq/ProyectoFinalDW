import os

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
    
    # JWT Cookie configuration
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_COOKIE_SECURE = False
    JWT_COOKIE_CSRF_PROTECT = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-jwt-secret-key-32-bytes-long-ok"


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}

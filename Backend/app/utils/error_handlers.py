from werkzeug.exceptions import HTTPException


def registrar_manejador_de_errores(app):
    """Convierte cualquier excepcion no controlada en JSON en vez de HTML.

    Se registra una sola vez en create_app() y cubre todos los modulos:
    - Errores HTTP normales (404, 429 de rate limit, etc.) mantienen su
      codigo y mensaje real.
    - Cualquier otra excepcion (un bug no previsto) se loguea completa en
      el servidor y se responde con un 500 generico, sin filtrar detalles
      internos al cliente.
    """

    @app.errorhandler(Exception)
    def manejar_error_no_controlado(e):
        if isinstance(e, HTTPException):
            return {"msg": e.description}, e.code

        app.logger.exception("Error no controlado")
        return {"msg": "Ocurrió un error interno"}, 500

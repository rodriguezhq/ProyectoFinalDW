def paginar_query(query, page=1, per_page=10):
    """Aplica paginacion a un query de SQLAlchemy ya ordenado/filtrado.

    Devuelve (items_de_la_pagina, total_de_registros_sin_paginar).
    """
    page = max(1, page)
    per_page = max(1, per_page)
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total

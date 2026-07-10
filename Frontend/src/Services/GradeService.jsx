const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

const GradeService = {
    async getMisSecciones() {
        const response = await fetch(`${BASE_URL}/api/courses/mis-secciones`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("No se pudieron cargar las secciones.");
        }
        return await response.json();
    },

    async getNotasSeccion(idSeccion) {
        const response = await fetch(`${BASE_URL}/api/grades/seccion/${idSeccion}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("No se pudieron cargar las notas de la sección.");
        }
        return await response.json();
    },

    async saveNotasBulk(notas) {
        const csrfToken = getCookie('csrf_access_token');
        const response = await fetch(`${BASE_URL}/api/grades/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken || ''
            },
            body: JSON.stringify({ notas }),
            credentials: 'include'
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.msg || "No se pudieron guardar las notas.");
        }
        return await response.json();
    },

    async saveNotaIndividual(idMatriculaDetalle, data) {
        const csrfToken = getCookie('csrf_access_token');
        const response = await fetch(`${BASE_URL}/api/grades/${idMatriculaDetalle}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken || ''
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.msg || "No se pudo guardar la nota del estudiante.");
        }
        return await response.json();
    },
    async getMisNotas() {
        const response = await fetch(`${BASE_URL}/api/grades/mis-notas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("No se pudieron cargar las notas del estudiante.");
        }
        return await response.json();
    },
    async getPeriodos() {
        const response = await fetch(`${BASE_URL}/api/courses/periodos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("No se pudieron cargar los periodos académicos.");
        }
        return await response.json();
    },
    async getEspecialidades() {
        const response = await fetch(`${BASE_URL}/api/courses/especialidades`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("No se pudieron cargar las especialidades.");
        }
        return await response.json();
    },
    async getSecciones(idPeriodo) {
        // Si viene idPeriodo lo añadimos como query parameter
        const url = idPeriodo
            ? `${BASE_URL}/api/courses/secciones?id_periodo=${idPeriodo}`
            : `${BASE_URL}/api/courses/secciones`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("No se pudieron cargar las secciones.");
        }
        return await response.json();
    },
    async updateSeccionEstado(idSeccion, estado) {
        const csrfToken = getCookie('csrf_access_token');
        const response = await fetch(`${BASE_URL}/api/courses/secciones/${idSeccion}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken || ''
            },
            body: JSON.stringify({ estado }),
            credentials: 'include'
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.msg || "No se pudo actualizar el estado de la sección.");
        }
        return await response.json();
    },
    async getConsolidado(idEspecialidad) {
        const response = await fetch(`${BASE_URL}/api/records/consolidado?id_especialidad=${idEspecialidad}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("No se pudo cargar el reporte consolidado.");
        }
        return await response.json();
    }
};

export default GradeService;

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

const CursoService = {
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
    async getPlanesEstudio() {
        const response = await fetch(`${BASE_URL}/api/courses/planes-estudio`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("No se pudieron cargar los planes de estudio.");
        }
        return await response.json();
    },
    async getCumplimientoPlan(idPlan, idPeriodo) {
        const response = await fetch(`${BASE_URL}/api/courses/secciones/cumplimiento?id_plan=${idPlan}&id_periodo=${idPeriodo}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("No se pudo cargar el reporte de cumplimiento de plan.");
        }
        return await response.json();
    }
};

export default CursoService;

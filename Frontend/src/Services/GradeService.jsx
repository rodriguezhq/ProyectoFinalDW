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
    }
};

export default GradeService;

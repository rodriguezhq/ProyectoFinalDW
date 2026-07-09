const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/profile`

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

const PerfilService = {
    async getProfilePropio() {
        try {
            const response = await fetch(`${API_URL}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error("Perfil no encontrado");
            }
            const data = await response.json();
            return data;
        } catch (e) {
            throw e;
        }
    },
    async updateProfile(telefono, password) {
        const body = {}
        if (telefono) body.telefono = telefono
        if (password) body.password = password
        const csrfToken = getCookie('csrf_access_token');
        try {
            const response = await fetch(`${API_URL}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error("Perfil no actualizado");
            }
            const data = await response.json();
            return data;
        } catch (e) {
            throw e;
        }
    }
}

export default PerfilService;
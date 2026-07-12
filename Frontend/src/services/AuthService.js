const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;
const AuthService = {
    async Login(correo, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password }),
                credentials: 'include' // Obligatorio para cookies JWT httpOnly
            });
            if (!response.ok) {
                throw new Error("Credenciales incorrectas");
            }
            const data = await response.json();
            localStorage.setItem('sga_user', JSON.stringify(data.user));
            return data;
        } catch (e) {
            localStorage.removeItem('sga_user');
            throw e;
        }
    },
    async Logout() {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            localStorage.removeItem('sga_user');
        } catch (e) {
            localStorage.removeItem('sga_user');
            throw e;
        }
    }
}

export default AuthService;

import { consultarApi } from './clienteApi';

const AuthService = {
    Login: async (email, password) => {
        // El backend espera el nombre de usuario (puede ser el prefijo del correo o correo completo)
        const username = email.includes('@') ? email.split('@')[0] : email;

        const respuesta = await consultarApi('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!respuesta.ok) {
            const error = await respuesta.json();
            throw new Error(error.msg || 'Credenciales incorrectas');
        }

        const datos = await respuesta.json();
        // datos contiene { user, msg }
        localStorage.setItem('sga_user', JSON.stringify(datos.user));
        return datos;
    },

    Logout: async () => {
        try {
            await consultarApi('/api/auth/logout', {
                method: 'POST'
            });
        } finally {
            localStorage.removeItem('sga_user');
        }
    }
};

export default AuthService;

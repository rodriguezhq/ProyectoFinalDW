import { consultarApi } from './clienteApi';

const PerfilService = {
    getProfilePropio: async () => {
        const respuesta = await consultarApi('/api/auth/profile', {
            method: 'GET'
        });
        if (!respuesta.ok) {
            throw new Error('Error al cargar la información del perfil.');
        }
        return respuesta.json();
    },

    updateProfile: async (telefono, password, currentPassword) => {
        const respuesta = await consultarApi('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                telefono: telefono || null,
                password: password || null,
                currentPassword: currentPassword || null
            })
        });

        if (!respuesta.ok) {
            const error = await respuesta.json();
            throw new Error(error.msg || 'Error al actualizar el perfil.');
        }

        return respuesta.json();
    }
};

export default PerfilService;

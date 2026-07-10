const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SeguridadService = {
    async getAuditorias(idUsuario = null, accion = null) {
        const params = new URLSearchParams();
        if (idUsuario) params.append('id_usuario', idUsuario);
        if (accion) params.append('accion', accion);

        const queryString = params.toString();
        const url = queryString
            ? `${BASE_URL}/api/admin/auditoria?${queryString}`
            : `${BASE_URL}/api/admin/auditoria`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application-json',
            },
            credentials: 'include'
        })
        if (!response.ok){
            throw new Error("no se puede cargar la bitacora de auditoria");
        }
        return await response.json()
    }
}
export default SeguridadService;
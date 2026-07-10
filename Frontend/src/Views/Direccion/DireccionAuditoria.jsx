import { useState, useEffect } from "react";
import SeguridadService from "../../Services/SeguridadService";
import { Loader2, RefreshCw, Search } from "lucide-react";
import AuditoriaTable from "../../components/direccion/AuditoriaTable";

export default function DireccionAuditoria() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [filtroAccion, setFiltroAccion] = useState('');

    useEffect(() => {
        loadAuditorias();
    }, [])

    const loadAuditorias = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await SeguridadService.getAuditorias();
            // Asegurarse de ordenar por fecha descendente (más reciente primero)
            const sortedLogs = (data.auditorias || []).sort(
                (a, b) => new Date(b.fecha) - new Date(a.fecha)
            );
            setLogs(sortedLogs);
        } catch (err) {
            setError(err.message || "Ocurrió un error al cargar la bitácora de auditoría.");
        } finally {
            setLoading(false);
        }
    }
    // Filtrar los logs en memoria
    const logsFiltrados = logs.filter(log => {
        const matchesUser = (log.usuario_nombre || '').toLowerCase().includes(filtroUsuario.toLowerCase()) ||
            (log.id_usuario?.toString() || '').includes(filtroUsuario);
        const matchesAction = (log.accion || '').toLowerCase().includes(filtroAccion.toLowerCase());
        return matchesAction && matchesUser;
    })

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="border-b border-border pb-3 flex flex-col md:items-center justify-between gap-2">

                <h2 className="text-2xl text-text-heading mt-0.5">
                    Monitoreo de Seguridad y acciones de sistema con registro de IP
                </h2>
                <button
                    onClick={loadAuditorias}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold text-xs uppercase tracking-wider cursor-pointer self-start md:self-auto"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </div>
            {/* banner de error  */}
            {error && (
                <div className="w-full p-2 bg-red-100 border border-red-200 text-red-700 text-2xl">
                    {error}
                </div>
            )}
            {/* filtras de Busquedas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 border border-border p-2">
                <div className="flex flex-col gap-1">
                    <label htmlFor="filtro-user" className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Buscar por Usuario / ID:
                    </label>
                    <div className="relative">
                        <input
                            id="filtro-user"
                            type="text"
                            value={filtroUsuario}
                            onChange={(e) => setFiltroUsuario(e.target.value)}
                            placeholder="Ej. admin, cmartinez, 1..."
                            className="w-full bg-white border border-border text-xs p-2 pr-8 outline-none focus:border-primary"
                        />
                        <Search className="absolute right-2.5 top-2.5 text-text-muted" size={14} />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="filtro-action" className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Filtrar por Acción:
                    </label>
                    <div className="relative">
                        <input
                            id="filtro-action"
                            type="text"
                            value={filtroAccion}
                            onChange={(e) => setFiltroAccion(e.target.value)}
                            placeholder="Ej. LOGIN, CREATE, UPDATE, Cierre..."
                            className="w-full bg-white border border-border text-xs p-2 pr-8 outline-none focus:border-primary"
                        />
                        <Search className="absolute right-2.5 top-2.5 text-text-muted" size={14} />
                    </div>
                </div>
            </div>
            {/* tabla con */}
            {loading ? (
                <div className="w-full text-center py-2 text-sm text-text-muted">
                    <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                    Cargandobitácora...
                </div>
            ) : (
                <div className="w-full min-w-0 overflow-hidden">
                    <AuditoriaTable logs={logsFiltrados} />
                </div>
            )}s
        </div>
    )
}
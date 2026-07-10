import { useEffect, useMemo, useState } from "react";
import GradeService from "../../Services/GradeService";
import { RefreshCw } from "lucide-react";
import SeccionesTable from "../../components/administrador/SeccionesTable";
import ConsolidadoTable from "../../components/administrador/ConsolidadoTable";
import Dialog from "../../components/Ui/Dialog";
export function AdminActasNotas() {
    const [activeTab, setActiveTab] = useState('actas');
    //estados 
    const [periodos, setPeriodos] = useState([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [especialidades, setEspecialidades] = useState([]);
    const [selectedEspecialidad, setSelectedEspecialidad] = useState('');

    const [secciones, setSecciones] = useState([]);
    const [alumnosConsolidado, setAlumnosConsolidado] = useState([]);

    const [loadingSecciones, setLoadingSecciones] = useState(false);
    const [loadingConsolidado, setLoadingConsolidado] = useState(false);
    const [error, setError] = useState(null);

    // Estados para la previsualización del Acta (Modal Dialog)
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewSeccionId, setPreviewSeccionId] = useState(null);
    const [previewCursoNombre, setPreviewCursoNombre] = useState('');
    const [previewNotas, setPreviewNotas] = useState([]);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // cargar periodos y especialidades
    useEffect(() => {
        const initData = async () => {
            try {
                setError(null);
                const perData = await GradeService.getPeriodos();
                const listPeriodos = perData.periodos || [];
                setPeriodos(listPeriodos);
                if (listPeriodos.length > 0) {
                    setSelectedPeriodo(listPeriodos[listPeriodos.length - 1].id_periodo);
                }

                //cargar especialidades
                const espData = await GradeService.getEspecialidades();
                const listEspecialidades = espData.especialidades || [];
                setEspecialidades(listEspecialidades);
                if (listEspecialidades.length > 0) {
                    setSelectedEspecialidad(listEspecialidades[0].id_especialidad);
                }
            } catch (error) {
                setError(error.message || "Error al cargar la informacion inicial")
            }
        }
        initData()
    }, [])
    // Cargar secciones cuando cambia el periodo seleccionado
    useEffect(() => {
        if (selectedPeriodo) {
            loadSecciones(selectedPeriodo)
        }
    }, [selectedPeriodo])

    useEffect(() => {
        if (selectedEspecialidad) {
            loadConsolidado(selectedEspecialidad);
        }
    }, [selectedEspecialidad]);

    const loadSecciones = async (idPeriodo) => {
        try {
            setLoadingSecciones(true);
            setError(null);
            const data = await GradeService.getSecciones(idPeriodo);
            setSecciones(data.secciones || []);
        } catch (err) {
            setError(err.message || "Error al cargar las secciones.");
        } finally {
            setLoadingSecciones(false);
        }
    }
    const loadConsolidado = async (idEspecialidad) => {
        try {
            setLoadingConsolidado(true);
            setError(null);
            const data = await GradeService.getConsolidado(idEspecialidad);
            setAlumnosConsolidado(data.reporte || []);
        } catch (err) {
            setError(err.message || "Error al cargar el reporte consolidado.");
        } finally {
            setLoadingConsolidado(false);
        }
    };
    const handlePreviewActa = async (idSeccion, cursoNombre) => {
        setPreviewCursoNombre(cursoNombre);
        setPreviewSeccionId(idSeccion);
        setPreviewOpen(true);
        setLoadingPreview(true);
        try {
            const data = await GradeService.getNotasSeccion(idSeccion);
            setPreviewNotas(data.notas || []);
        } catch (err) {
            alert(err.message || "Error al cargar las notas del acta.");
            setPreviewOpen(false);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleCloseActa = async (idSeccion) => {
        const confirmar = window.confirm(
            "¿Está seguro de que desea CERRAR Y VALIDAR esta acta de notas?\n\n" +
            "Una vez cerrada:\n" +
            "- Las calificaciones se registrarán como definitivas en las actas del sistema.\n" +
            "- El docente asignado ya no podrá realizar modificaciones a las calificaciones."
        );

        if (!confirmar) return;

        try {
            setError(null);
            await GradeService.updateSeccionEstado(idSeccion, 'cerrada');
            alert("El acta de notas ha sido validada y cerrada de forma exitosa.");
            // Recargar la lista de secciones
            if (selectedPeriodo) {
                loadSecciones(selectedPeriodo);
            }
        } catch (err) {
            setError(err.message || "Ocurrió un error al cerrar el acta.");
        }
    };
    return (
        <div className="w-full flex flex-col gap-4">
            <div className="border-b border-border pb-3">
                <h1 className="text-xl font-bold tracking-tight text-text-heading">Actas y Consolidación de Notas</h1>
                <p className="text-xs text-text-muted mt-0.5">
                    Gestione las actas oficiales de secciones y consulte reportes consolidados académicos globales.
                </p>
            </div>
            {/* baner de error */}
            {error && (
                <div className="w-full p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex justify-between items-center rounded-sm">
                    <span>{error}</span>
                    <button onClick={() => {
                        if (activeTab == 'actas' && selectedPeriodo) loadSecciones(selectedPeriodo);
                        else if (selectedEspecialidad) loadConsolidado(selectedEspecialidad)
                    }}
                        className="font-bold uppercase tracking-wider text-10px text-red-800  hover:underline"
                    >
                        Reintentar
                    </button>
                </div>
            )}
            {/* {selector de pestañas} */}
            <div className="flex border-border bg-slate-100 gap-1 p-1">
                <button
                    onClick={() => setActiveTab('actas')}
                    className={`px-2 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-b-2 cursor-pointer ${activeTab === 'actas'
                        ? 'bg-white border-primary text-primary font-extrabold shadow-sm'
                        : 'bg-transparent border-transparent text-text-muted hover:text-text-main'
                        }`}
                >
                    Validar Actas
                </button>
                <button
                    onClick={() => setActiveTab('consolidado')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-b-2 cursor-pointer ${activeTab === 'consolidado'
                        ? 'bg-white border-primary text-primary font-extrabold shadow-sm'
                        : 'bg-transparent border-transparent text-text-muted hover:text-text-main'
                        }`}
                >
                    Consolidar Notas
                </button>
            </div>
            {/* Pestaña: Validar Actas */}
            {activeTab === 'actas' && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border-border p-3 gap-2">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label htmlFor="periodo-select" className="text-xs font-bold uppercase tracking-wider text-text-muted shrink-0">
                                Ciclo Académico:
                            </label>
                            <select
                                id="periodo-select"
                                value={selectedPeriodo}
                                onChange={(e) => setSelectedPeriodo(e.target.value)}
                                className="bg-white border border-border text-sm p-1.5 outline-none focus:border-primary grow sm:grow-0 min-w-[150px]"
                            >
                                <option value={""}>Seleccione Periodo</option>
                                {periodos.map(per => (
                                    <option key={per.id_periodo} value={per.id_periodo}>{per.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => selectedPeriodo && loadSecciones(selectedPeriodo)}
                            disabled={loadingSecciones || !selectedPeriodo}
                            className="flex items-center justify-center gap-1.5 py-1 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                            <RefreshCw size={12} className={loadingSecciones ? 'animate-spin' : ''} />
                            <span>Actualizar</span>
                        </button>
                    </div>
                    {loadingSecciones ? (
                        <div className="w-full text-center py-8 text-sm text-text-muted">Cargando secciones...</div>
                    ) : (
                        <div className="w-full min-w-0 overflow-hidden">
                            <SeccionesTable
                                secciones={secciones}
                                onPreview={handlePreviewActa}
                                onCloseActa={handleCloseActa}
                                disableClose={false}
                            />
                        </div>
                    )}
                </div>
            )}
            {/* Pestaña: Consolidar Notas */}
            {activeTab === 'consolidado' && (
                <div className="flex flex-col gap-3">
                    {/* filtros */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-border p-3 gap-2">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label htmlFor="especialidad-select" className="text-xs font-bold uppercase tracking-wider text-text-muted shrink-0">
                                Especialidad:
                            </label>
                            <select
                                id="especialidad-select"
                                value={selectedEspecialidad}
                                onChange={(e) => setSelectedEspecialidad(e.target.value)}
                                className="bg-white border border-border text-sm p-1.5 outline-none focus:border-primary grow sm:grow-0 min-w-[200px]"
                            >
                                <option value="">Seleccione Especialidad</option>
                                {especialidades.map(esp => (
                                    <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => selectedEspecialidad && loadConsolidado(selectedEspecialidad)}
                            disabled={loadingConsolidado || !selectedEspecialidad}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                            <RefreshCw size={12} className={loadingConsolidado ? 'animate-spin' : ''} />
                            Actualizar
                        </button>
                    </div>
                    {/* tabla */}
                    {loadingConsolidado ? (
                        <div className="w-full text-center py-8 text-sm text-text-muted">Cargando reporte consolidado...</div>
                    ) : (
                        <div className="w-full min-w-0 overflow-hidden">
                            <ConsolidadoTable alumnos={alumnosConsolidado} />
                        </div>
                    )}
                </div>
            )}
            <Dialog isOpen={previewOpen} onClose={() => setPreviewOpen(false)} size="3xl">
                <Dialog.Header onClose={() => setPreviewOpen(false)}>
                    Previsualizar Acta: {previewCursoNombre}
                </Dialog.Header>
                <Dialog.Content className="p-0 max-h-[60vh] overflow-y-auto min-w-0">
                    {loadingPreview ? (
                        <div className="text-center py-10 text-sm text-text-muted">Cargando calificaciones del acta...</div>
                    ) : previewNotas.length === 0 ? (
                        <div className="text-center py-10 text-sm text-text-muted">No hay estudiantes matriculados en esta sección.</div>
                    ) : (
                        <div className="w-full overflow-x-auto min-w-0">
                            <table className="w-full border-collapse text-left text-xs text-text-main">
                                <thead>
                                    <tr className="bg-primary-light text-primary font-bold uppercase tracking-wider border-b border-border sticky top-0 bg-[#E8F5E9] z-10">
                                        <th className="p-2 border-r border-border/60 text-center w-28">Código</th>
                                        <th className="p-2 border-r border-border/60 text-left min-w-[180px]">Estudiante</th>
                                        <th className="p-2 border-r border-border/60 text-center w-20">Parcial 1</th>
                                        <th className="p-2 border-r border-border/60 text-center w-20">Parcial 2</th>
                                        <th className="p-2 border-r border-border/60 text-center w-20">Final</th>
                                        <th className="p-2 border-r border-border/60 text-center w-20">Susti</th>
                                        <th className="p-2 border-r border-border/60 text-center w-24">Promedio</th>
                                        <th className="p-2 text-center w-24">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewNotas.map((row, idx) => {
                                        const isEven = idx % 2 === 0;
                                        const hasAverage = row.promedio !== null
                                        return (
                                            <tr key={row.id_nota || row.id_matricula_detalle} className={`border-b border-border ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                                                <td className="p-2 border-r border-border/60 text-center font-mono font-medium text-text-heading">
                                                    {row.estudiante_codigo}
                                                </td>
                                                <td className="p-2 border-r border-border/60 font-semibold text-text-heading">
                                                    {row.estudiante_nombre}
                                                </td>
                                                <td className="p-2 border-r border-border/60 text-center font-medium text-text-heading">
                                                    {row.parcial1 !== null ? row.parcial1.toFixed(1) : '-'}
                                                </td>
                                                <td className="p-2 border-r border-border/60 text-center font-medium text-text-heading">
                                                    {row.parcial2 !== null ? row.parcial2.toFixed(1) : '-'}
                                                </td>
                                                <td className="p-2 border-r border-border/60 text-center font-medium text-text-heading">
                                                    {row.final !== null ? row.final.toFixed(1) : '-'}
                                                </td>
                                                <td className="p-2 border-r border-border/60 text-center font-medium text-text-heading">
                                                    {row.sustitutorio !== null ? row.sustitutorio.toFixed(1) : '-'}
                                                </td>
                                                <td className="p-2 border-r border-border/60 text-center font-bold text-text-heading">
                                                    {hasAverage ? row.promedio.toFixed(2) : '-'}
                                                </td>
                                                <td className="p-2 text-center font-bold">
                                                    {row.estado === 'aprobada' && <span className="text-green-700">Aprobado</span>}
                                                    {row.estado === 'desaprobada' && <span className="text-red-700">Desaprobado</span>}
                                                    {row.estado === 'registrada' && <span className="text-blue-700">Registrada</span>}
                                                    {row.estado === 'sin_nota' && <span className="text-text-muted font-normal">Sin Nota</span>}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Dialog.Content>
                <Dialog.Footer>
                    <button
                        onClick={() => setPreviewOpen(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Cerrar
                    </button>
                </Dialog.Footer>
            </Dialog>
        </div>
    )
}
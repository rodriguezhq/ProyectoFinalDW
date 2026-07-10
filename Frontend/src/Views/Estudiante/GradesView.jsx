import { useEffect, useMemo, useState } from "react"
import GradeService from "../../Services/GradeService";
import { RefreshCcw } from "lucide-react";
import StudentSummary from "../../components/Estudiante/StudentSummary";
import GradesTable from "../../components/Estudiante/GradesTable";

export function GradesView() {
    const [notas, setNotas] = useState([]);
    const [estudiante, setEstudiante] = useState(null);
    const [periodos, setPeriodos] = useState([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await GradeService.getMisNotas();
            setEstudiante(data.estudiante);
            const notasList = data.notas || [];
            setNotas(notasList);
            const uniquePeriodos = [...new Set(notasList.map(n => n.periodo_nombre))].filter(Boolean);
            setPeriodos(uniquePeriodos);
            // seleccionar el periodo mas reciente
            if (uniquePeriodos.length > 0) {
                setSelectedPeriodo(uniquePeriodos[uniquePeriodos.length - 1])
            }
            console.log(data)
        } catch (error) {
            setError(error.message || 'Ocurrió un error al cargar sus notas.');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadData();
    }, [])

    // Filtrar las notas por el periodo seleccionado
    const notasFiltradas = notas.filter(n => n.periodo_nombre === selectedPeriodo);
    // Calcular el promedio general de las asignaturas calificadas en el ciclo actual
    const promediosValidos = notasFiltradas
        .map(n => n.promedio)
        .filter(p => p !== null && p !== undefined);
    const promedioCiclo = promediosValidos.length > 0
        ? (promediosValidos.reduce((acc, curr) => acc + curr, 0) / promediosValidos.length).toFixed(2)
        : null;

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-6 text-sm text-text-muted">
                Cargando su récord de notas...
            </div>
        )
    }
    if (error) {
        return (
            <div className="w-full p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                <span>{error}</span>
                <button
                    onClick={loadData}
                    className="p-1 hover:bg-red-100 rounded text-red-800 font-bold uppercase tracking-wider text-[10px]"
                >
                    Reintentar
                </button>
            </div>
        );
    }
    return (
        <div className="w-full min-w-0 flex flex-col gap-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-3 gap-2">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-text-heading">Hoja de Calificaciones</h1>
                    <p className="text-xs text-text-muted mt-0.5">Consulte su progreso académico agrupado por ciclo.</p>
                </div>
                {/* filtros */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <label htmlFor="periodo-select" className="text-xs font-bold uppercase tracking-wider text-text-muted">Ciclo Académico:</label>
                    <div className="flex items-center gap-2 grow sm:grow-0 w-full sm:w-auto">
                        <select
                            name="periodo-select"
                            id="periodo-select"
                            value={selectedPeriodo}
                            onChange={(e) => setSelectedPeriodo(e.target.value)}
                            className="bg-white border border-border text-sm p-1.5 outline-none focus:border-primary min-w-[150px] flex-1 sm:flex-none"
                        >
                            {periodos.length === 0 ? (
                                <option value="">Sin periodos</option>
                            ) : (
                                periodos.map(per => (
                                    <option key={per} value={per}>{per}</option>
                                ))
                            )}
                        </select>
                        <button
                            onClick={loadData}
                            title="Actualizar notas"
                            className="p-2 bg-slate-100 hover:bg-slate-200 border border-border text-text-main focus:outline-none shrink-0"
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-full">
                {estudiante && <StudentSummary estudiante={estudiante} />}
            </div>
            <div className="w-full min-w-0 overflow-hidden">
                <GradesTable notas={notasFiltradas} />
            </div>
            {promedioCiclo && (
                <div className="w-full flex justify-end mt-2">
                    <div className="w-full sm:w-auto bg-slate-50 border border-border px-4 py-2 flex items-center justify-between sm:justify-start gap-3 text-xs">
                        <span className="font-bold text-text-muted uppercase tracking-wider text-[10px] sm:text-xs">Promedio Ponderado del Ciclo:</span>
                        <span className="text-sm font-extrabold text-text-heading bg-white border border-border px-2.5 py-0.5 shrink-0">
                            {promedioCiclo}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
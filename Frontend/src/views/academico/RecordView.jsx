import React, { useState, useEffect, useContext } from 'react';
import { obtenerRecordEstudiante } from '../../services/servicioRecords';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AuthContext } from '../../Context/AuthContext';
import RecordKpis from '../../components/estudiante/RecordKpis';
import PeriodoBlock from '../../components/estudiante/PeriodoBlock';



export default function RecordView() {
    const { user } = useContext(AuthContext);
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.id_estudiante) {
            cargarRecord();
        } else {
            setError("No se pudo identificar la sesión del estudiante.");
            setLoading(false);
        }
    }, [user]);

    const cargarRecord = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await obtenerRecordEstudiante(user.id_estudiante);
            setRecord(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "Ocurrió un error al cargar tu récord académico.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm text-text-muted font-semibold">Generando tu historial académico completo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-none text-red-700 text-sm font-medium flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        );
    }

    if (!record) return null;

    const { estudiante, resumen, periodos } = record;
    const ppa = resumen.promedio_ponderado_acumulado;

    return (
        <div className="w-full flex flex-col gap-6 animate-slide-up">

            {/* Resumen Académico PPA y Créditos */}
            <RecordKpis
                ppa={ppa}
                creditosMatriculados={resumen.total_creditos_matriculados}
                creditosAprobados={resumen.total_creditos_aprobados}
            />


            {/* Listado Cronológico por Semestre */}
            <div className="flex flex-col gap-6 mt-2">
                <h2 className="text-lg font-black text-text-heading tracking-tight flex items-center gap-2">
                    Detalle de Semestres y Calificaciones Cursadas
                </h2>

                {periodos.length === 0 ? (
                    <div className="bg-slate-50 border border-border rounded-none p-8 text-center text-sm text-text-muted">
                        No hay matrículas registradas en tu historial académico.
                    </div>
                ) : (
                    periodos.map((periodo) => (
                        <PeriodoBlock key={periodo.periodo_nombre} periodo={periodo} />
                    ))
                )}
            </div>
        </div>
    );
}

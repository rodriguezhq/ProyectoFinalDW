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
            {/* Cabecera del Récord */}
            <div className="bg-white border border-border rounded-none p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-primary-light text-primary uppercase tracking-wider mb-1">
                        Historial Académico
                    </span>
                    <h1 className="text-2xl font-black text-text-heading leading-tight">
                        {estudiante.nombres} {estudiante.apellidos}
                    </h1>
                    <div className="text-xs text-text-muted font-medium flex flex-wrap gap-x-4 gap-y-1">
                        <span>Código: <strong className="text-text-heading font-semibold">{estudiante.codigo}</strong></span>
                        <span>DNI: <strong className="text-text-heading font-semibold">{estudiante.dni}</strong></span>
                        <span>Correo: <strong className="text-text-heading font-semibold">{estudiante.correo || '-'}</strong></span>
                    </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 flex flex-col justify-center min-w-[200px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Especialidad</span>
                    <span className="text-sm font-bold text-text-heading block">{estudiante.especialidad_nombre}</span>
                    <span className="text-[10px] text-text-muted font-medium uppercase mt-1">Facultad de {estudiante.facultad_nombre}</span>
                </div>
            </div>

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

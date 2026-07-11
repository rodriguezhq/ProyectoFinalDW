import React from 'react';
import { Award, BookOpen, CheckCircle } from 'lucide-react';

export default function RecordKpis({ ppa = 0, creditosMatriculados = 0, creditosAprobados = 0 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* KPI 1: Promedio Ponderado Acumulado */}
            <div className="bg-white border border-border p-5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-primary">
                <div className="p-3 bg-primary-light text-primary rounded-none">
                    <Award size={24} />
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Promedio PPA</span>
                    <span className="text-2xl font-black text-text-heading leading-none">
                        {ppa !== null && ppa !== undefined ? ppa.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            {/* KPI 2: Créditos Matriculados */}
            <div className="bg-white border border-border p-5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-blue-500">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-none">
                    <BookOpen size={24} />
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Créditos Matriculados</span>
                    <span className="text-2xl font-black text-text-heading leading-none">
                        {creditosMatriculados}
                    </span>
                </div>
            </div>

            {/* KPI 3: Créditos Aprobados */}
            <div className="bg-white border border-border p-5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-emerald-500">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none">
                    <CheckCircle size={24} />
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Créditos Aprobados</span>
                    <span className="text-2xl font-black text-emerald-700 leading-none">
                        {creditosAprobados}
                    </span>
                </div>
            </div>
        </div>
    );
}

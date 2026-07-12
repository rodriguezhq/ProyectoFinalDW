import React from 'react';
import { Users, Award, BookOpen } from 'lucide-react';

export default function TarjetasResumenConsolidado({
    totalAlumnos,
    promedioPpaGlobal,
    promCreditosAprobados
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-border p-4.5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-blue-500">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-none">
                    <Users size={20} />
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider font-sans font-black">Estudiantes</span>
                    <span className="text-xl font-black text-text-heading leading-tight">{totalAlumnos}</span>
                </div>
            </div>

            <div className="bg-white border border-border p-4.5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-primary">
                <div className="p-2.5 bg-primary-light text-primary rounded-none">
                    <Award size={20} />
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider font-sans font-black">Promedio PPA Global</span>
                    <span className="text-xl font-black text-text-heading leading-tight">{promedioPpaGlobal}</span>
                </div>
            </div>

            <div className="bg-white border border-border p-4.5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-emerald-500">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-none">
                    <BookOpen size={20} />
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider font-sans font-black">Créditos Aprobados Prom.</span>
                    <span className="text-xl font-black text-text-heading leading-tight">{promCreditosAprobados}</span>
                </div>
            </div>
        </div>
    );
}

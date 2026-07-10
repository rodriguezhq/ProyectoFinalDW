export default function StudentSummary({ estudiante }) {
    if (!estudiante) return null;
    return (
        <div className="w-full bg-slate-50 border border-border p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-text-main">
            <div>
                <span className="block font-bold text-text-muted uppercase tracking-wider mb-0.5">Estudiante</span>
                <span className="text-xs font-semibold text-text-heading">
                    {estudiante.nombres} {estudiante.apellidos}
                </span>
            </div>
            <div>
                <span className="block font-bold text-text-muted uppercase tracking-wider mb-0.5">Código</span>
                <span className="text-xs font-mono font-semibold text-text-heading">
                    {estudiante.codigo}
                </span>
            </div>
            <div>
                <span className="block font-bold text-text-muted uppercase tracking-wider mb-0.5">Correo Electrónico</span>
                <span className="text-xs font-semibold text-text-heading">
                    {estudiante.correo || '-'}
                </span>
            </div>
            <div>
                <span className="block font-bold text-text-muted uppercase tracking-wider mb-0.5">DNI</span>
                <span className="text-xs font-semibold text-text-heading">
                    {estudiante.dni || '-'}
                </span>
            </div>
        </div>
    );
}
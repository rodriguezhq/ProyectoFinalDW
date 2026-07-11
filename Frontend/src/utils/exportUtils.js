// Utilitarios de exportación de reportes académicos en formato CSV (Excel) e Impresión (PDF)

// --- 1. EXPORTAR CONSOLIDADO DE ALUMNOS A EXCEL (CSV) ---
export function exportarConsolidadoCSV(alumnos, especialidadNombre) {
    if (!alumnos || alumnos.length === 0) return;

    const headers = ['Codigo', 'Apellidos y Nombres', 'Especialidad', 'Creditos Matriculados', 'Creditos Aprobados', 'Promedio PPA', 'Semestres Cursados'];
    const rows = alumnos.map(a => [
        a.codigo,
        `"${a.apellidos}, ${a.nombres}"`,
        `"${a.especialidad_nombre}"`,
        a.total_creditos_matriculados,
        a.total_creditos_aprobados,
        a.promedio_ponderado_acumulado !== null && a.promedio_ponderado_acumulado !== undefined ? a.promedio_ponderado_acumulado.toFixed(2) : '-',
        a.periodos_matriculados
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    descargarArchivo(csvContent, `Consolidado_${especialidadNombre.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
}

// --- 2. EXPORTAR CONSOLIDADO DE ALUMNOS A PDF (PRINT VIEW) ---
export function exportarConsolidadoPDF(alumnos, especialidadNombre, kpis = {}) {
    if (!alumnos || alumnos.length === 0) return;

    const { totalAlumnos = 0, promedioPpaGlobal = '0.00', promCreditosAprobados = '0.0' } = kpis;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Reporte Consolidado Académico</title>
            <style>
                body { font-family: sans-serif; padding: 25px; color: #334155; }
                .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
                h1 { font-size: 22px; color: #1e293b; margin: 0; }
                .meta { font-size: 11px; color: #64748b; margin-top: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
                th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .footer { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Reporte Consolidado Académico - UNCP</h1>
                <div class="meta">
                    <span>Carrera: <strong>${especialidadNombre}</strong></span> | 
                    <span>Alumnos Listados: <strong>${totalAlumnos}</strong></span> | 
                    <span>PPA Promedio: <strong>${promedioPpaGlobal}</strong></span> | 
                    <span>Créditos Aprobados Prom.: <strong>${promCreditosAprobados}</strong></span> | 
                    <span>Fecha: <strong>${new Date().toLocaleDateString('es-PE')}</strong></span>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 100px;">Código</th>
                        <th>Estudiante (Apellidos, Nombres)</th>
                        <th style="text-align: center; width: 90px;">Créditos Mat.</th>
                        <th style="text-align: center; width: 90px;">Créditos Aprob.</th>
                        <th style="text-align: center; width: 90px;">Promedio PPA</th>
                        <th style="text-align: center; width: 80px;">Semestres</th>
                    </tr>
                </thead>
                <tbody>
                    ${alumnos.map(a => `
                        <tr>
                            <td>${a.codigo}</td>
                            <td>${a.apellidos}, ${a.nombres}</td>
                            <td class="text-center">${a.total_creditos_matriculados}</td>
                            <td class="text-center">${a.total_creditos_aprobados}</td>
                            <td class="text-center font-bold" style="color: #2563eb;">${a.promedio_ponderado_acumulado !== null && a.promedio_ponderado_acumulado !== undefined ? a.promedio_ponderado_acumulado.toFixed(2) : '-'}</td>
                            <td class="text-center">${a.periodos_matriculados}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="footer">
                Sistema de Gestión Académica - Universidad Nacional del Centro del Perú (UNCP)
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// --- 3. EXPORTAR DESEMPEÑO POR COHORTE A EXCEL (CSV) ---
export function exportarCohortesCSV(datos, especialidadNombre) {
    if (!datos || datos.length === 0) return;

    const headers = ['Cohorte', 'Especialidad', 'Total Estudiantes', 'Promedio PPA', 'Creditos Aprobados Promedio', 'Tasa Aprobacion (%)', 'Tasa Desaprobacion (%)'];
    const rows = datos.map(row => [
        row.cohorte,
        `"${row.especialidad_nombre}"`,
        row.total_estudiantes,
        row.promedio_ponderado_promedio !== null && row.promedio_ponderado_promedio !== undefined ? row.promedio_ponderado_promedio.toFixed(2) : '-',
        row.total_creditos_aprobados_promedio !== null && row.total_creditos_aprobados_promedio !== undefined ? row.total_creditos_aprobados_promedio.toFixed(1) : '-',
        row.tasa_aprobacion !== null && row.tasa_aprobacion !== undefined ? row.tasa_aprobacion.toFixed(1) : '-',
        row.tasa_aprobacion !== null && row.tasa_aprobacion !== undefined ? (100 - row.tasa_aprobacion).toFixed(1) : '-'
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    descargarArchivo(csvContent, `Desempeno_Cohortes_${especialidadNombre.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
}

// --- 4. EXPORTAR DESEMPEÑO POR COHORTE A PDF (PRINT VIEW) ---
export function exportarCohortesPDF(datos, especialidadNombre, kpis = {}) {
    if (!datos || datos.length === 0) return;

    const { totalEstudiantes = 0, promedioGlobal = '-', tasaAprobacionGlobal = '-' } = kpis;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Reporte de Desempeño por Cohorte</title>
            <style>
                body { font-family: sans-serif; padding: 25px; color: #334155; }
                .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
                h1 { font-size: 22px; color: #1e293b; margin: 0; }
                .meta { font-size: 11px; color: #64748b; margin-top: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
                th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .footer { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Reporte Desempeño por Cohorte y Programa - UNCP</h1>
                <div class="meta">
                    <span>Especialidad: <strong>${especialidadNombre}</strong></span> | 
                    <span>Total Estudiantes: <strong>${totalEstudiantes}</strong></span> | 
                    <span>Promedio PPA Carrera: <strong>${promedioGlobal}</strong></span> | 
                    <span>Tasa Aprobación Global: <strong>${tasaAprobacionGlobal}%</strong></span> | 
                    <span>Fecha: <strong>${new Date().toLocaleDateString('es-PE')}</strong></span>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center; width: 80px;">Cohorte</th>
                        <th>Programa Académico</th>
                        <th style="text-align: center; width: 100px;">Total Alumnos</th>
                        <th style="text-align: center; width: 100px;">Promedio (PPA)</th>
                        <th style="text-align: center; width: 110px;">Créditos Prom.</th>
                        <th style="text-align: center; width: 100px;">Tasa Aprob.</th>
                        <th style="text-align: center; width: 100px;">Tasa Desaprob.</th>
                    </tr>
                </thead>
                <tbody>
                    ${datos.map(d => `
                        <tr>
                            <td class="text-center font-bold">${d.cohorte}</td>
                            <td>${d.especialidad_nombre}</td>
                            <td class="text-center">${d.total_estudiantes}</td>
                            <td class="text-center font-bold">${d.promedio_ponderado_promedio !== null && d.promedio_ponderado_promedio !== undefined ? d.promedio_ponderado_promedio.toFixed(2) : '-'}</td>
                            <td class="text-center">${d.total_creditos_aprobados_promedio !== null && d.total_creditos_aprobados_promedio !== undefined ? d.total_creditos_aprobados_promedio.toFixed(1) : '-'}</td>
                            <td class="text-center" style="color: #059669; font-weight: bold;">${d.tasa_aprobacion !== null && d.tasa_aprobacion !== undefined ? d.tasa_aprobacion.toFixed(1) : '0.0'}%</td>
                            <td class="text-center" style="color: #dc2626;">${d.tasa_aprobacion !== null && d.tasa_aprobacion !== undefined ? (100 - d.tasa_aprobacion).toFixed(1) : '0.0'}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="footer">
                Sistema de Gestión Académica - Universidad Nacional del Centro del Perú (UNCP)
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Helper interno para descargar archivos en el cliente
function descargarArchivo(contenido, nombreArchivo, mimeType) {
    const blob = new Blob([contenido], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

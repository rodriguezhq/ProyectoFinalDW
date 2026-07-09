import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import EstudianteDashboard from './Views/Estudiante/EstudianteDashboard';
import { EnrollmentView } from './Views/Estudiante/EnrollmentView';
import { GradesView } from './Views/Estudiante/GradesView';
import { ScheduleView } from './Views/Estudiante/ScheduleView';
import PublicOnlyRoute from './components/publicOnlyRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* ruta del login */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<App />} />
      </Route>

      {/* rutas del estudiante */}
      <Route path="/estudiante" element={<EstudianteDashboard />}>
        <Route index element={<ScheduleView />} /> {/* Carga por defecto en /estudiante */}
        <Route path="matricula" element={<EnrollmentView />} /> {/* Carga en /estudiante/matricula */}
        <Route path="notas" element={<GradesView />} /> {/* Carga en /estudiante/notas */}
      </Route>
    </Routes>
  );
}
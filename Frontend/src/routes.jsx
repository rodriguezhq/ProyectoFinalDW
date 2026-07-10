import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import EstudianteDashboard from './Views/Estudiante/EstudianteDashboard';
import { EnrollmentView } from './Views/Estudiante/EnrollmentView';
import { GradesView } from './Views/Estudiante/GradesView';
import { ScheduleView } from './Views/Estudiante/ScheduleView';
import DocenteDashboard from './Views/Docente/DocenteDashboard';
import { DocenteHomeView } from './Views/Docente/DocenteHomeView';
import AdministradorDashboard from './Views/Administrador/AdministradorDashboard';
import { AdministradorHomeView } from './Views/Administrador/AdministradorHomeView';
import DireccionDashboard from './Views/Direccion/DireccionDashboard';
import { DireccionHomeView } from './Views/Direccion/DireccionHomeView';
import ProfileView from './Views/ProfileView';
import PublicOnlyRoute from './components/publicOnlyRoute';
import ProtectedRoute from './components/protectedRoute';
import NotFound from './components/notFound';
import { ROLES } from './constants/roles';
import DocenteNotas from './Views/Docente/DocenteNotas';
import { AdminActasNotas } from './Views/Administrador/AdminActasNotas';
import DireccionReportes from './Views/Direccion/DireccionReportes';

export function AppRoutes() {
  return (
    <Routes>
      {/* ruta del login */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<App />} />
      </Route>

      {/* rutas del estudiante: exige sesión + rol Estudiante */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ESTUDIANTE]} />}>
        <Route path="/estudiante" element={<EstudianteDashboard />}>
          <Route index element={<ScheduleView />} /> {/* Carga por defecto en /estudiante */}
          <Route path="matricula" element={<EnrollmentView />} /> {/* Carga en /estudiante/matricula */}
          <Route path="notas" element={<GradesView />} /> {/* Carga en /estudiante/notas */}
          <Route path="perfil" element={<ProfileView />} />
        </Route>
      </Route>

      {/* rutas del docente */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCENTE]} />}>
        <Route path="/docente" element={<DocenteDashboard />}>
          <Route index element={<DocenteHomeView />} />
          <Route path="perfil" element={<ProfileView />} />
          <Route path="notas" element={<DocenteNotas />} />
        </Route>
      </Route>

      {/* rutas del administrador */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]} />}>
        <Route path="/admin" element={<AdministradorDashboard />}>
          <Route index element={<AdministradorHomeView />} />
          <Route path="perfil" element={<ProfileView />} />
          <Route path="actas-notas" element={<AdminActasNotas />} />
        </Route>
      </Route>

      {/* rutas de dirección */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.DIRECCION]} />}>
        <Route path="/direccion" element={<DireccionDashboard />}>
          <Route index element={<DireccionHomeView />} />
          <Route path="perfil" element={<ProfileView />} />
          <Route path="reportes" element={<DireccionReportes />} /> 
        </Route>
      </Route>

      {/* cualquier ruta no definida (o de un rol sin dashboard todavía) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
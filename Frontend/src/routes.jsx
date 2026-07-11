import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes del Shell y Seguridad
import ProtectedRoute from './components/protectedRoute';
import PublicOnlyRoute from './components/publicOnlyRoute';
import NotFound from './components/notFound';
import { 
    EstudianteDashboard, 
    DocenteDashboard, 
    AdministradorDashboard, 
    DireccionDashboard 
} from './components/dashBoardShell';

// Constantes
import { ROLES } from './constants/roles';

// Vistas Públicas
import Login from './Login';

// Vistas Generales
import VistaHorario from './views/horarios/VistaHorario';
import VistaPanel from './views/estadisticas/VistaPanel';

// Vistas de Mantenimiento Académico (Administrador)
import MantenimientoAcademico from './views/academico/MantenimientoAcademico';
import DisenoHorario from './views/academico/DisenoHorario';
import UsuariosRoles from './views/usuarios/UsuariosRoles';

// Vistas de Dirección
import Auditoria from './views/direccion/Auditoria';
import ProfileView from './views/compartidos/ProfileView';
import RegistrarNotasDocente from './views/academico/RegistrarNotasDocente';

const EnrollmentView = () => (
    <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-text-heading mb-2">Matrícula en Línea</h2>
        <p className="text-text-muted">Proceso de matrícula para asignaturas del ciclo lectivo.</p>
    </div>
);

const GradesView = () => (
    <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-text-heading mb-2">Hoja de Notas por Ciclo</h2>
        <p className="text-text-muted">Consulta de calificaciones parciales y consolidadas del semestre actual.</p>
    </div>
);

const RecordView = () => (
    <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-text-heading mb-2">Récord Académico Histórico</h2>
        <p className="text-text-muted">Historial completo de asignaturas cursadas, créditos y promedios ponderados.</p>
    </div>
);



const AdminActasNotas = () => (
    <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-text-heading mb-2">Validación y Consolidación de Notas</h2>
        <p className="text-text-muted">Validación oficial de actas de cursos y cierre de ciclo académico.</p>
    </div>
);

const DireccionReportes = () => (
    <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-text-heading mb-2">Rendimiento por Cohorte</h2>
        <p className="text-text-muted">Análisis comparativo de deserción, promedios y tasas de aprobación por programa de estudio.</p>
    </div>
);

export function AppRoutes() {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route element={<PublicOnlyRoute />}>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
            </Route>

            {/* Rutas de Estudiante */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ESTUDIANTE]} />}>
                <Route path="/estudiante" element={<EstudianteDashboard />}>
                    <Route index element={<VistaHorario isTeacher={false} />} />
                    <Route path="matricula" element={<EnrollmentView />} />
                    <Route path="notas" element={<GradesView />} />
                    <Route path="record" element={<RecordView />} />
                    <Route path="perfil" element={<ProfileView />} />
                </Route>
            </Route>

            {/* Rutas de Docente */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCENTE]} />}>
                <Route path="/docente" element={<DocenteDashboard />}>
                    <Route index element={<VistaHorario isTeacher={true} />} />
                    <Route path="notas" element={<RegistrarNotasDocente />} />
                    <Route path="perfil" element={<ProfileView />} />
                </Route>
            </Route>

            {/* Rutas de Administrador */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]} />}>
                <Route path="/admin" element={<AdministradorDashboard />}>
                    <Route index element={<VistaPanel isDirection={false} />} />
                    <Route path="mantenimiento" element={<MantenimientoAcademico />} />
                    <Route path="horarios" element={<DisenoHorario />} />
                    <Route path="usuarios" element={<UsuariosRoles />} />
                    <Route path="actas-notas" element={<AdminActasNotas />} />
                    <Route path="perfil" element={<ProfileView />} />
                </Route>
            </Route>

            {/* Rutas de Dirección */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.DIRECCION]} />}>
                <Route path="/direccion" element={<DireccionDashboard />}>
                    <Route index element={<VistaPanel isDirection={true} />} />
                    <Route path="reportes" element={<DireccionReportes />} />
                    <Route path="auditoria" element={<Auditoria />} />
                    <Route path="perfil" element={<ProfileView />} />
                </Route>
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
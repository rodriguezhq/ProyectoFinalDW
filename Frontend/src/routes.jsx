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
import DireccionReportes from './views/direccion/DireccionReportes';
import SupervisarMatriculasDireccion from './views/direccion/SupervisarMatriculasDireccion';
import SupervisarAcademicoDireccion from './views/direccion/SupervisarAcademicoDireccion';

import ProfileView from './views/compartidos/ProfileView';
import RegistrarNotasDocente from './views/academico/RegistrarNotasDocente';
import GradesView from './views/academico/GradesView';
import RecordView from './views/academico/RecordView';
import AdminActasNotas from './views/academico/AdminActasNotas';

// Vistas de Docentes (Cursos y Notas)
import CursosAsignadosDocente from './views/academico/CursosAsignadosDocente';
import DetalleCursoDocente from './views/academico/DetalleCursoDocente';
import IngresarCalificacionesDocente from './views/academico/IngresarCalificacionesDocente';




// Vistas de Certificados y Documentos
import MisCertificados from './views/certificados/MisCertificados';
import GestionCertificados from './views/certificados/GestionCertificados';
import VerificarDocumento from './views/certificados/VerificarDocumento';

import MatriculaEstudiante from './views/matricula/MatriculaEstudiante';
import ValidarMatriculasAdmin from './views/matricula/ValidarMatriculasAdmin';
import DetalleMatriculaAdmin from './views/matricula/DetalleMatriculaAdmin';


export function AppRoutes() {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route element={<PublicOnlyRoute />}>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
            </Route>

            {/* Verificación pública de documentos (accesible sin login, vía QR) */}
            <Route path="/verificar/:codigoQr" element={<VerificarDocumento />} />

            {/* Rutas de Estudiante */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ESTUDIANTE]} />}>
                <Route path="/estudiante" element={<EstudianteDashboard />}>
                    <Route index element={<VistaHorario isTeacher={false} />} />
                    <Route path="matricula" element={<MatriculaEstudiante />} />
                    <Route path="notas" element={<GradesView />} />
                    <Route path="record" element={<RecordView />} />
                    <Route path="certificados" element={<MisCertificados />} />
                    <Route path="perfil" element={<ProfileView />} />
                </Route>
            </Route>

            {/* Rutas de Docente */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCENTE]} />}>
                <Route path="/docente" element={<DocenteDashboard />}>
                    <Route index element={<VistaHorario isTeacher={true} />} />
                    <Route path="cursos" element={<CursosAsignadosDocente />} />
                    <Route path="cursos/:id_curso" element={<DetalleCursoDocente />} />
                    <Route path="cursos/:id_curso/calificaciones" element={<IngresarCalificacionesDocente />} />
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
                    <Route path="validar-matriculas" element={<ValidarMatriculasAdmin />} />
                    <Route path="validar-matriculas/:id_matricula" element={<DetalleMatriculaAdmin />} />
                    <Route path="actas-notas" element={<AdminActasNotas />} />
                    <Route path="certificados" element={<GestionCertificados esDireccion={false} />} />
                    <Route path="perfil" element={<ProfileView />} />
                </Route>
            </Route>

            {/* Rutas de Dirección */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.DIRECCION]} />}>
                <Route path="/direccion" element={<DireccionDashboard />}>
                    <Route index element={<VistaPanel isDirection={true} />} />
                    <Route path="reportes" element={<DireccionReportes />} />
                    <Route path="matriculas" element={<SupervisarMatriculasDireccion />} />
                    <Route path="supervision" element={<SupervisarAcademicoDireccion />} />
                    <Route path="auditoria" element={<Auditoria />} />
                    <Route path="certificados" element={<GestionCertificados esDireccion={true} />} />
                    <Route path="perfil" element={<ProfileView />} />
                </Route>
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
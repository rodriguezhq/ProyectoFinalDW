import React from 'react';
import { datosModulos } from '../../constants/academico';

export default function PaginaInicio({ activeTab, setActiveTab, navigate }) {
  const moduloActivo = datosModulos.find(m => m.id === activeTab);

  return (
    <main>
      {/* Sección Hero */}
      <section className="relative bg-[radial-gradient(circle_at_80%_20%,var(--color-primary-light)_0%,transparent_45%)] py-20 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="animate-slide-up text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary text-[0.85rem] font-semibold py-1.5 px-3.5 rounded-full mb-5 border border-primary/12">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-gold"></span>
              Plataforma Digital Académica 2026
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-text-heading mb-5 leading-[1.15]">
              Sistema de Gestión <span className="text-primary relative after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-full after:h-2 after:bg-accent/25 after:-z-10">Académica</span>
            </h1>
            <p className="text-[1.125rem] text-text-main mb-9 max-w-[580px] mx-auto md:mx-0 leading-relaxed">
              Gestión integral, segura e interactiva para toda la comunidad académica de la Universidad Nacional del Centro del Perú. Diseñado para optimizar procesos de matrícula, control de notas y certificación.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <button 
                id="btn-hero-login"
                type="button" 
                className="bg-primary text-white py-2.5 px-6 font-semibold rounded-md transition-all duration-300 inline-flex items-center gap-2 shadow-[0_4px_14px_rgba(13,82,44,0.18)] hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(13,82,44,0.25)]" 
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </button>
              <a 
                href="#modulos" 
                className="text-primary border-2 border-primary py-2 px-5 font-semibold rounded-md transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(13,82,44,0.15)]"
                onClick={(e) => { e.preventDefault(); document.getElementById('modulos').scrollIntoView(); }}
              >
                Explorar Módulos
              </a>
            </div>
          </div>
          
          <div className="relative flex justify-center items-center animate-fade-in">
            <div className="absolute w-[380px] h-[380px] rounded-full border-2 border-dashed border-primary/15 animate-spin-slow z-0"></div>
            <div className="absolute w-[440px] h-[440px] rounded-full border border-dashed border-accent/25 animate-spin-slow-reverse z-0"></div>
            <div className="relative z-10 animate-float">
              <img src="/Escudo_UNCP.png" alt="Escudo UNCP Animado" className="max-w-[320px] w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Estadísticas */}
      <section className="py-10 px-6 bg-bg-alt border-t border-b border-border">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 relative after:hidden md:after:block after:absolute after:right-0 after:top-[20%] after:h-[60%] after:w-[1px] after:bg-border last:after:hidden">
            <div className="font-heading text-[2.5rem] font-extrabold text-primary leading-none mb-1.5">6</div>
            <div className="text-[0.9rem] font-semibold text-text-muted uppercase tracking-wider">Módulos Core</div>
          </div>
          <div className="text-center p-4 relative after:hidden md:after:block after:absolute after:right-0 after:top-[20%] after:h-[60%] after:w-[1px] after:bg-border last:after:hidden">
            <div className="font-heading text-[2.5rem] font-extrabold text-primary leading-none mb-1.5">18</div>
            <div className="text-[0.9rem] font-semibold text-text-muted uppercase tracking-wider">Tablas Integradas</div>
          </div>
          <div className="text-center p-4 relative after:hidden md:after:block after:absolute after:right-0 after:top-[20%] after:h-[60%] after:w-[1px] after:bg-border last:after:hidden">
            <div className="font-heading text-[2.5rem] font-extrabold text-primary leading-none mb-1.5">4</div>
            <div className="text-[0.9rem] font-semibold text-text-muted uppercase tracking-wider">Perfiles de Rol</div>
          </div>
          <div className="text-center p-4 relative after:hidden md:after:block after:absolute after:right-0 after:top-[20%] after:h-[60%] after:w-[1px] after:bg-border last:after:hidden">
            <div className="font-heading text-[2.5rem] font-extrabold text-primary leading-none mb-1.5">100%</div>
            <div className="text-[0.9rem] font-semibold text-text-muted uppercase tracking-wider">Procesos Digitales</div>
          </div>
        </div>
      </section>

      {/* Explorador de Módulos Interactivo */}
      <section id="modulos" className="py-24 px-6 max-w-[1200px] mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-primary block text-[0.9rem] font-bold uppercase tracking-[1.5px] mb-3">Arquitectura Funcional</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-heading tracking-tight max-w-[600px] mx-auto">Nuestros Módulos de Gestión Académica</h2>
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-bg-alt p-2 rounded-xl border border-border mb-10 flex gap-1 overflow-x-auto scrollbar-none" role="tablist">
          {datosModulos.map(m => (
            <button
              id={`tab-btn-${m.id}`}
              key={m.id}
              role="tab"
              aria-selected={activeTab === m.id}
              aria-controls={`panel-${m.id}`}
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-md text-[0.95rem] font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === m.id ? 'text-white bg-primary shadow-[0_4px_12px_rgba(13,82,44,0.15)]' : 'text-text-muted hover:text-primary hover:bg-primary/5'}`}
              onClick={() => setActiveTab(m.id)}
            >
              <span className="text-[1.1rem]">{m.icono}</span>
              {m.nombre}
            </button>
          ))}
        </div>

        {/* Contenido dinámico de las pestañas */}
        <div className="animate-slide-up" id={`panel-${moduloActivo.id}`} role="tabpanel">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-6 md:p-10 grid grid-cols-1 md:grid-cols-[1fr_1.8fr] gap-10 items-start">
            <div className="flex flex-col gap-4">
              <span className="self-start text-[0.75rem] font-bold uppercase tracking-wider py-1 px-2.5 rounded bg-primary-light text-primary">Módulo Académico</span>
              <h3 className="text-2xl md:text-[1.85rem] font-bold text-text-heading">{moduloActivo.icono} {moduloActivo.nombre}</h3>
              <p className="text-text-muted text-base leading-relaxed">{moduloActivo.lema}</p>
            </div>
            
            <div className="flex flex-col gap-5">
              {moduloActivo.roles.map((r, idx) => (
                <div key={idx} className="bg-bg-alt rounded-md p-5 border border-border transition-all duration-300 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-5 items-center hover:translate-x-1.5 hover:border-primary/20 hover:bg-white hover:shadow-md">
                  <div className="flex flex-col items-center">
                    <span className={`text-[0.75rem] font-bold uppercase tracking-wider py-1 px-3 rounded-full text-center w-full ${r.nombre === 'Estudiante' ? 'bg-blue-500/10 text-blue-600' : r.nombre === 'Docente' ? 'bg-purple-500/10 text-purple-600' : r.nombre === 'Administrador' ? 'bg-amber-500/10 text-amber-600' : r.nombre === 'Dirección' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-600'}`}>
                      {r.nombre}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {r.tareas.map((tarea, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2.5 text-[0.95rem] text-text-main justify-center md:justify-start">
                        <span className="text-primary font-bold text-base leading-none mt-0.5">✓</span>
                        <span>{tarea}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accesos rápidos por Rol */}
      <section id="roles" className="py-20 px-6 bg-bg-alt border-t border-b border-border">
        <div className="text-center mb-14">
          <span className="text-primary block text-[0.9rem] font-bold uppercase tracking-[1.5px] mb-3">Accesos Personalizados</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-heading tracking-tight max-w-[600px] mx-auto">Un Portal Adaptado a Cada Rol</h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="group bg-white rounded-xl p-8 px-6 border border-border transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg hover:border-primary">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 bg-primary-light text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">👨‍🎓</div>
            <h3 className="text-lg font-bold mb-2 text-text-heading">Estudiantes</h3>
            <p className="text-[0.88rem] text-text-muted leading-relaxed">Gestiona matrículas, consulta notas parciales/finales, récord académico y solicita certificados.</p>
          </div>
          <div className="group bg-white rounded-xl p-8 px-6 border border-border transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg hover:border-primary">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 bg-primary-light text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">👩‍🏫</div>
            <h3 className="text-lg font-bold mb-2 text-text-heading">Docentes</h3>
            <p className="text-[0.88rem] text-text-muted leading-relaxed">Visualiza cursos asignados, carga de sílabos estructurados y registro de notas oficiales.</p>
          </div>
          <div className="group bg-white rounded-xl p-8 px-6 border border-border transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg hover:border-primary">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 bg-primary-light text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">🛠️</div>
            <h3 className="text-lg font-bold mb-2 text-text-heading">Administrativos</h3>
            <p className="text-[0.88rem] text-text-muted leading-relaxed">Configuración de accesos, validación de actas, registro de pagos y control de horarios.</p>
          </div>
          <div className="group bg-white rounded-xl p-8 px-6 border border-border transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg hover:border-primary">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 bg-primary-light text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">💼</div>
            <h3 className="text-lg font-bold mb-2 text-text-heading">Dirección</h3>
            <p className="text-[0.88rem] text-text-muted leading-relaxed">Supervisión estratégica, análisis de cohortes, auditorías generales y métricas de desempeño.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

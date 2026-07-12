import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

// Selector con búsqueda para listas largas (ej. usuarios) donde un <select>
// nativo se vuelve inusable con cientos/miles de opciones.
export default function ComboboxUsuario({ usuarios = [], valor, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const contenedorRef = useRef(null);

  const usuarioSeleccionado = usuarios.find(u => String(u.id_usuario) === String(valor));

  const usuariosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return usuarios;
    return usuarios.filter(u => u.nombre.toLowerCase().includes(termino));
  }, [busqueda, usuarios]);

  useEffect(() => {
    const manejarClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
        setBusqueda('');
      }
    };
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  const seleccionar = (idUsuario) => {
    onChange(idUsuario ? String(idUsuario) : '');
    setAbierto(false);
    setBusqueda('');
  };

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between gap-2 p-2.5 border border-border rounded-none focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer font-medium text-left"
      >
        <span className={usuarioSeleccionado ? 'text-text-heading' : 'text-text-muted'}>
          {usuarioSeleccionado ? usuarioSeleccionado.nombre : '-- Todos los Usuarios --'}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {usuarioSeleccionado && (
            <X
              size={14}
              className="text-text-muted hover:text-primary"
              onClick={(e) => { e.stopPropagation(); seleccionar(''); }}
            />
          )}
          <ChevronDown size={14} className="text-text-muted" />
        </span>
      </button>

      {abierto && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-none shadow-lg max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border relative shrink-0">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              autoFocus
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar usuario por nombre..."
              className="w-full pl-7 pr-2 py-1.5 text-[0.85rem] border border-border rounded-none focus:outline-none focus:border-primary"
            />
          </div>
          <div className="overflow-y-auto">
            <button
              type="button"
              onClick={() => seleccionar('')}
              className="w-full text-left px-3 py-2 text-[0.85rem] font-semibold text-text-muted hover:bg-primary-light hover:text-primary cursor-pointer"
            >
              -- Todos los Usuarios --
            </button>
            {usuariosFiltrados.length === 0 ? (
              <div className="px-3 py-4 text-[0.82rem] text-text-muted text-center italic">
                Sin resultados para "{busqueda}"
              </div>
            ) : (
              usuariosFiltrados.map(u => (
                <button
                  key={u.id_usuario}
                  type="button"
                  onClick={() => seleccionar(u.id_usuario)}
                  className={`w-full text-left px-3 py-2 text-[0.85rem] font-medium hover:bg-primary-light hover:text-primary cursor-pointer ${
                    String(u.id_usuario) === String(valor) ? 'bg-primary-light text-primary' : 'text-text-heading'
                  }`}
                >
                  {u.nombre}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================================
   components/FiltrosUsuarios.tsx
   Filtros de búsqueda para la tabla de usuarios
   Responsabilidad única: Renderizar y gestionar filtros
   ====================================== */

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { OPCIONES_ROLES } from '../hooks/useGestionUsuarios';
import type { FiltrosUsuarios } from '../types';

interface FiltrosUsuariosProps {
  filtros: FiltrosUsuarios;
  onActualizarFiltro: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onLimpiarFiltros: () => void;
}

const FiltrosUsuarios: React.FC<FiltrosUsuariosProps> = ({
  filtros,
  onActualizarFiltro,
  onLimpiarFiltros,
}) => {
  return (
    <div className="gestion-usuarios-filtros">
      <div className="gestion-usuarios-filtros-grid">
        <div className="gestion-usuarios-filtro-grupo">
          <label className="gestion-usuarios-filtro-label" htmlFor="usr-username">
            Usuario
          </label>
          <div className="gestion-usuarios-filtro-input-wrapper">
            <Search size={14} className="gestion-usuarios-filtro-icono" />
            <input
              id="usr-username"
              name="username"
              type="text"
              className="gestion-usuarios-filtro-input"
              placeholder="Buscar por usuario..."
              value={filtros.username}
              onChange={onActualizarFiltro}
            />
          </div>
        </div>
        <div className="gestion-usuarios-filtro-grupo">
          <label className="gestion-usuarios-filtro-label" htmlFor="usr-nombre">
            Nombre
          </label>
          <input
            id="usr-nombre"
            name="nombreCompleto"
            type="text"
            className="gestion-usuarios-filtro-input"
            placeholder="Buscar por nombre..."
            value={filtros.nombreCompleto}
            onChange={onActualizarFiltro}
          />
        </div>
        <div className="gestion-usuarios-filtro-grupo">
          <label className="gestion-usuarios-filtro-label" htmlFor="usr-role">
            Rol
          </label>
          <select
            id="usr-role"
            name="role"
            className="gestion-usuarios-filtro-input"
            value={filtros.role}
            onChange={onActualizarFiltro}
          >
            <option value="">Todos los roles</option>
            {OPCIONES_ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="gestion-usuarios-filtros-acciones">
        <button
          type="button"
          className="gestion-usuarios-btn-limpiar"
          onClick={onLimpiarFiltros}
        >
          <RotateCcw size={14} />
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default FiltrosUsuarios;
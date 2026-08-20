/* ======================================
   components/FiltrosBusqueda.tsx
   Panel de filtros avanzados para la búsqueda de reportes
   ====================================== */

import React from 'react';
import { FiltrosBusqueda as FiltrosBusquedaType } from '../types';
import { useOpcionesBusqueda } from '../hooks/useOpcionesBusqueda';
import { OPCIONES_CANTIDAD_REPORTES } from '../constants/opcionesBusqueda';

interface FiltrosBusquedaProps {
  filtros: FiltrosBusquedaType;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAplicar: () => void;
  onLimpiar: () => void;
  visible: boolean;
}

const FiltrosBusqueda: React.FC<FiltrosBusquedaProps> = ({
  filtros,
  onChange,
  onAplicar,
  onLimpiar,
  visible,
}) => {
  const { etiquetas, tecnicos, repuestos } = useOpcionesBusqueda();

  if (!visible) return null;

  return (
    <div className="busqueda-panel-filtros">
      <div className="busqueda-filtros-grid">
        {/* Número de reporte */}
        <div className="busqueda-filtro-grupo">
          <label className="busqueda-filtro-label" htmlFor="filtro-numero">
            N° Reporte
          </label>
          <input
            id="filtro-numero"
            name="numeroReporte"
            type="text"
            className="busqueda-filtro-input"
            placeholder="Ej: REP-001"
            value={filtros.numeroReporte}
            onChange={onChange}
          />
        </div>

        {/* Etiqueta */}
        <div className="busqueda-filtro-grupo">
          <label className="busqueda-filtro-label" htmlFor="filtro-etiqueta">
            Etiqueta
          </label>
          <select
            id="filtro-etiqueta"
            name="etiqueta"
            className="busqueda-filtro-select"
            value={filtros.etiqueta}
            onChange={onChange}
          >
            {etiquetas.map((opcion) => (
              <option key={opcion.value || 'vacio'} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cantidad de reportes */}
        <div className="busqueda-filtro-grupo">
          <label className="busqueda-filtro-label" htmlFor="filtro-cantidad">
            Cantidad de Reportes
          </label>
          <select
            id="filtro-cantidad"
            name="cantidadReportes"
            className="busqueda-filtro-select"
            value={filtros.cantidadReportes}
            onChange={onChange}
          >
            {OPCIONES_CANTIDAD_REPORTES.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Repuesto */}
        <div className="busqueda-filtro-grupo">
          <label className="busqueda-filtro-label" htmlFor="filtro-repuesto">
            Repuesto
          </label>
          <select
            id="filtro-repuesto"
            name="repuesto"
            className="busqueda-filtro-select"
            value={filtros.repuesto}
            onChange={onChange}
          >
            {repuestos.map((opcion) => (
              <option key={opcion.value || 'vacio'} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de tiempo - Desde */}
        <div className="busqueda-filtro-grupo">
          <label className="busqueda-filtro-label" htmlFor="filtro-fecha-desde">
            Fecha Desde
          </label>
          <input
            id="filtro-fecha-desde"
            name="fechaDesde"
            type="date"
            className="busqueda-filtro-input"
            value={filtros.fechaDesde}
            onChange={onChange}
          />
        </div>

        {/* Rango de tiempo - Hasta */}
        <div className="busqueda-filtro-grupo">
          <label className="busqueda-filtro-label" htmlFor="filtro-fecha-hasta">
            Fecha Hasta
          </label>
          <input
            id="filtro-fecha-hasta"
            name="fechaHasta"
            type="date"
            className="busqueda-filtro-input"
            value={filtros.fechaHasta}
            onChange={onChange}
          />
        </div>

        {/* Técnico */}
        <div className="busqueda-filtro-grupo">
          <label className="busqueda-filtro-label" htmlFor="filtro-tecnico">
            Técnico
          </label>
          <select
            id="filtro-tecnico"
            name="tecnico"
            className="busqueda-filtro-select"
            value={filtros.tecnico}
            onChange={onChange}
          >
            {tecnicos.map((opcion) => (
              <option key={opcion.value || 'vacio'} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="busqueda-filtros-acciones">
        <button
          type="button"
          className="busqueda-btn-limpiar"
          onClick={onLimpiar}
        >
          Limpiar filtros
        </button>
        <button
          type="button"
          className="busqueda-btn-aplicar"
          onClick={onAplicar}
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
};

export default FiltrosBusqueda;
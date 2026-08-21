/* ======================================
   components/DetalleReporte.tsx
   Vista detallada expandible de un reporte con botón de edición
   ====================================== */

import React from 'react';
import { Edit3 } from 'lucide-react';
import { ReporteResumen } from '../types';

interface DetalleReporteProps {
  reporte: ReporteResumen;
  onEditar: (reporte: ReporteResumen) => void;
}

const DetalleReporte: React.FC<DetalleReporteProps> = ({ reporte, onEditar }) => {
  return (
    <div className="busqueda-detalle">
      <div className="busqueda-detalle-grid">
        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">N° Reporte</span>
          <span className="busqueda-detalle-campo-valor">{reporte.numeroReporte}</span>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Cliente</span>
          <span className="busqueda-detalle-campo-valor">{reporte.cliente}</span>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Equipo</span>
          <span className="busqueda-detalle-campo-valor">{reporte.equipo}</span>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Plantilla</span>
          <span className="busqueda-detalle-campo-valor">{reporte.plantilla}</span>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Fecha Reporte</span>
          <span className="busqueda-detalle-campo-valor">{reporte.fechaReporte}</span>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Fecha Atención</span>
          <span className="busqueda-detalle-campo-valor">{reporte.fechaAtencion}</span>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Hora Inicio</span>
          <span className="busqueda-detalle-campo-valor">{reporte.horaInicio}</span>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Hora Finalización</span>
          <span className="busqueda-detalle-campo-valor">{reporte.horaFinalizacion}</span>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Declaración</span>
          <span className="busqueda-detalle-campo-valor">{reporte.declaracion}</span>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Repuestos</span>
          <div className="busqueda-detalle-tags">
            {reporte.repuestos.length > 0 ? (
              reporte.repuestos.map((repuesto) => (
                <span key={repuesto.id || repuesto.nombre} className="busqueda-detalle-tag">
                  {repuesto.cantidad > 1 ? `${repuesto.cantidad}x ` : ''}{repuesto.nombre}
                </span>
              ))
            ) : (
              <span className="busqueda-detalle-campo-valor">Sin repuestos</span>
            )}
          </div>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Etiquetas</span>
          <div className="busqueda-detalle-tags">
            {reporte.etiquetas.length > 0 ? (
              reporte.etiquetas.map((etiqueta) => (
                <span key={etiqueta} className="busqueda-detalle-tag">
                  {etiqueta}
                </span>
              ))
            ) : (
              <span className="busqueda-detalle-campo-valor">Sin etiquetas</span>
            )}
          </div>
        </div>

        <div className="busqueda-detalle-campo">
          <span className="busqueda-detalle-campo-label">Técnicos</span>
          <div className="busqueda-detalle-tags">
            {reporte.tecnicos.length > 0 ? (
              reporte.tecnicos.map((tecnico) => (
                <span key={tecnico} className="busqueda-detalle-tag">
                  {tecnico}
                </span>
              ))
            ) : (
              <span className="busqueda-detalle-campo-valor">Sin técnicos asignados</span>
            )}
          </div>
        </div>

        <div className="busqueda-detalle-campo busqueda-detalle-campo-descripcion">
          <span className="busqueda-detalle-campo-label">Descripción de la Falla</span>
          <span className="busqueda-detalle-campo-valor">{reporte.descripcionFalla}</span>
        </div>

        <div className="busqueda-detalle-campo busqueda-detalle-campo-descripcion">
          <span className="busqueda-detalle-campo-label">Trabajo Realizado</span>
          <span className="busqueda-detalle-campo-valor">{reporte.trabajoRealizado}</span>
        </div>
      </div>

      <div className="busqueda-detalle-acciones">
        <button
          type="button"
          className="busqueda-btn-editar"
          onClick={() => onEditar(reporte)}
        >
          <Edit3 size={16} />
          Editar Reporte
        </button>
      </div>
    </div>
  );
};

export default DetalleReporte;
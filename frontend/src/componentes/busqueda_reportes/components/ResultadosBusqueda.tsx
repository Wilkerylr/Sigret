/* ======================================
   components/ResultadosBusqueda.tsx
   Sección de resultados de la búsqueda con detalle expandible y paginación
   ====================================== */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ReporteResumen } from '../types';
import DetalleReporte from './DetalleReporte';
import Paginacion from './Paginacion';

interface ResultadosBusquedaProps {
  resultados: ReporteResumen[];
  resultadosTotal: number;
  busquedaRealizada: boolean;
  onEditarReporte: (reporte: ReporteResumen) => void;
  paginaActual: number;
  totalPaginas: number;
  itemsPorPagina: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarItemsPorPagina: (items: number) => void;
}

const ResultadosBusqueda: React.FC<ResultadosBusquedaProps> = ({
  resultados,
  resultadosTotal,
  busquedaRealizada,
  onEditarReporte,
  paginaActual,
  totalPaginas,
  itemsPorPagina,
  onCambiarPagina,
  onCambiarItemsPorPagina,
}) => {
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const toggleExpandir = (id: string) => {
    setExpandidoId((prev) => (prev === id ? null : id));
  };

  if (!busquedaRealizada) {
    return (
      <div className="busqueda-sin-resultados">
        <p>Realiza una búsqueda para ver resultados</p>
      </div>
    );
  }

  if (resultados.length === 0) {
    return (
      <div className="busqueda-sin-resultados">
        <p>No se encontraron reportes con los criterios de búsqueda especificados</p>
      </div>
    );
  }

  return (
    <div className="busqueda-resultados">
      <p className="busqueda-resultados-info">
        Se encontraron {resultadosTotal} reporte{resultadosTotal !== 1 ? 's' : ''}
      </p>

      {resultados.map((reporte) => (
        <div key={reporte.id} className="busqueda-resultado-card">
          <div
            className="busqueda-resultado-header"
            onClick={() => toggleExpandir(reporte.id)}
          >
            <div className="busqueda-resultado-info">
              <span className="busqueda-resultado-titulo">
                {reporte.numeroReporte} — {reporte.cliente}
              </span>
              <span className="busqueda-resultado-subtitulo">
                {reporte.equipo}
              </span>
              <div className="busqueda-resultado-meta">
                <span>📅 {reporte.fechaReporte}</span>
                <span>🏷️ {reporte.etiquetas.join(', ') || 'Sin etiquetas'}</span>
                <span>👤 {reporte.tecnicos.join(', ') || 'Sin técnicos'}</span>
              </div>
            </div>
            <button
              type="button"
              className={`busqueda-btn-expandir ${expandidoId === reporte.id ? 'abierto' : ''}`}
              aria-label={expandidoId === reporte.id ? 'Cerrar detalle' : 'Ver detalle'}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {expandidoId === reporte.id && (
            <DetalleReporte
              reporte={reporte}
              onEditar={onEditarReporte}
            />
          )}
        </div>
      ))}

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={resultadosTotal}
        itemsPorPagina={itemsPorPagina}
        onCambiarPagina={onCambiarPagina}
        onCambiarItemsPorPagina={onCambiarItemsPorPagina}
      />
    </div>
  );
};

export default ResultadosBusqueda;
/**
 * Componente para mostrar estado vacío (sin resultados)
 */
import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  mensaje: string;
  descripcion?: string;
  icono?: React.ReactNode;
  accion?: {
    etiqueta: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  mensaje,
  descripcion,
  icono,
  accion,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-contenido">
        <div className="empty-state-icono">
          {icono || <Inbox size={48} />}
        </div>
        <p className="empty-state-mensaje">{mensaje}</p>
        {descripcion && (
          <p className="empty-state-descripcion">{descripcion}</p>
        )}
        {accion && (
          <button
            type="button"
            className="empty-state-btn"
            onClick={accion.onClick}
          >
            {accion.etiqueta}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
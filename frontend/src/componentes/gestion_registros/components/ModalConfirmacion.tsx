/* ======================================
   components/ModalConfirmacion.tsx
   Modal genérico de confirmación para acciones destructivas
   ====================================== */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ModalConfirmacion.css';

interface ModalConfirmacionProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variant = 'danger',
  onConfirmar,
  onCancelar,
  cargando = false,
}) => {
  if (!abierto) return null;

  const colores = {
    danger: {
      icono: '#ef4444',
      fondo: '#fee2e2',
      boton: '#ef4444',
      botonHover: '#dc2626',
    },
    warning: {
      icono: '#f59e0b',
      fondo: '#fef3c7',
      boton: '#f59e0b',
      botonHover: '#d97706',
    },
    info: {
      icono: '#3b82f6',
      fondo: '#dbeafe',
      boton: '#3b82f6',
      botonHover: '#2563eb',
    },
  };

  const color = colores[variant];

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div
        className="modal-contenido modal-confirmacion"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-cerrar"
          onClick={onCancelar}
          aria-label="Cerrar"
          disabled={cargando}
        >
          <X size={18} />
        </button>

        <div className="modal-confirmacion-icono" style={{ background: color.fondo }}>
          <AlertTriangle size={32} color={color.icono} />
        </div>

        <h3 className="modal-confirmacion-titulo">{titulo}</h3>
        <p className="modal-confirmacion-mensaje">{mensaje}</p>

        <div className="modal-confirmacion-acciones">
          <button
            type="button"
            className="modal-btn-cancelar"
            onClick={onCancelar}
            disabled={cargando}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className="modal-btn-confirmar"
            style={{ background: color.boton }}
            onClick={onConfirmar}
            disabled={cargando}
            onMouseEnter={(e) => (e.currentTarget.style.background = color.botonHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = color.boton)}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
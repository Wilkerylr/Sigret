import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ModalEliminarAdmin.css';

interface ModalEliminarAdminProps {
  abierto: boolean;
  nombreUsuario: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

const ModalEliminarAdmin: React.FC<ModalEliminarAdminProps> = ({
  abierto,
  nombreUsuario,
  onConfirmar,
  onCancelar,
  cargando = false,
}) => {
  const [textoIngresado, setTextoIngresado] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (abierto) {
      setTextoIngresado('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [abierto]);

  if (!abierto) return null;

  const coincide = textoIngresado.trim() === nombreUsuario;

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-contenido modal-eliminar-admin" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-cerrar"
          onClick={onCancelar}
          aria-label="Cerrar"
          disabled={cargando}
        >
          <X size={18} />
        </button>

        <div className="modal-eliminar-admin-icono">
          <AlertTriangle size={32} color="#ef4444" />
        </div>

        <h3 className="modal-eliminar-admin-titulo">Eliminar Usuario Administrador</h3>
        <p className="modal-eliminar-admin-mensaje">
          Esta acción eliminará al usuario administrador <strong>{nombreUsuario}</strong> y no se puede deshacer.
        </p>

        <div className="modal-eliminar-admin-campo">
          <label className="modal-eliminar-admin-label" htmlFor="confirmar-nombre">
            Escriba <strong>{nombreUsuario}</strong> para confirmar:
          </label>
          <input
            ref={inputRef}
            id="confirmar-nombre"
            type="text"
            className="modal-eliminar-admin-input"
            placeholder={nombreUsuario}
            value={textoIngresado}
            onChange={(e) => setTextoIngresado(e.target.value)}
            disabled={cargando}
            autoComplete="off"
          />
        </div>

        <div className="modal-eliminar-admin-acciones">
          <button
            type="button"
            className="modal-btn-cancelar"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal-btn-confirmar modal-btn-confirmar--danger"
            onClick={onConfirmar}
            disabled={!coincide || cargando}
          >
            {cargando ? 'Procesando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarAdmin;

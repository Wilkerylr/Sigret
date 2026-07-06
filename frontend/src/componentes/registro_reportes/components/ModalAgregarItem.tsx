import React, { useState } from 'react';

interface ModalAgregarItemProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (nombre: string) => void;
  tipo: 'repuesto' | 'etiqueta';
}

const ModalAgregarItem: React.FC<ModalAgregarItemProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tipo,
}) => {
  const [nombre, setNombre] = useState('');

  const handleConfirm = () => {
    if (nombre.trim()) {
      onConfirm(nombre.trim());
      setNombre('');
      onClose();
    }
  };

  const handleClose = () => {
    setNombre('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nombre.trim()) {
      e.preventDefault();
      handleConfirm();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const titulo = tipo === 'repuesto' ? 'Nuevo repuesto' : 'Nueva etiqueta';
  const label = tipo === 'repuesto' ? 'Nombre del repuesto' : 'Nombre de la etiqueta';
  const placeholder = tipo === 'repuesto' ? 'Ej: Disco Duro 1TB' : 'Ej: Urgente';

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{titulo}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="modal-body" onKeyDown={handleKeyDown}>
          <label htmlFor="nuevo-item-nombre">{label}</label>
          <input
            id="nuevo-item-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="modal-input"
          />
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn-cancelar"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal-btn-confirmar"
            onClick={handleConfirm}
            disabled={!nombre.trim()}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarItem;
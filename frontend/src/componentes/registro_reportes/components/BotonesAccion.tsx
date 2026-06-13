import React from 'react';

interface BotonesAccionProps {
  onCancelar: () => void;
  onGuardar: () => void;
  deshabilitado: boolean;
}

const BotonesAccion: React.FC<BotonesAccionProps> = ({
  onCancelar,
  onGuardar,
  deshabilitado,
}) => {
  return (
    <div className="form-acciones-contenedor">
      <div className="form-acciones">
        <button
          type="button"
          className="btn-cancelar"
          onClick={onCancelar}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn-guardar"
          onClick={onGuardar}
          disabled={deshabilitado}
        >
          Guardar Reporte
        </button>
      </div>
    </div>
  );
};

export default BotonesAccion;
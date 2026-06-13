import React from 'react';
import { GrupoRadioProps } from '../types';

const GrupoRadio: React.FC<GrupoRadioProps> = ({
  label,
  name,
  valor,
  onChange,
  opciones,
}) => {
  return (
    <div className="campo-grupo">
      <label htmlFor={name} className="requerido">
        {label}
      </label>
      <div className="declaracion-radio-grupo">
        {opciones.map((opcion) => (
          <label key={opcion.value}>
            <input
              type="radio"
              name={name}
              value={opcion.value}
              checked={valor === opcion.value}
              onChange={onChange}
            />
            {opcion.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default GrupoRadio;
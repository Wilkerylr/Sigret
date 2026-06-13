import React from 'react';
import { CampoFormularioProps } from '../types';

const CampoFormulario: React.FC<CampoFormularioProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  opciones = [],
  min,
}) => {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="campo-input"
          />
        );
      
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="campo-input"
          >
            {opciones.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            className="campo-input"
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="campo-input"
          />
        );
      
      case 'time':
        return (
          <input
            type="time"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="campo-input"
          />
        );
      
      default:
        return (
          <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="campo-input"
          />
        );
    }
  };

  return (
    <div className="campo-grupo">
      <label htmlFor={name} className={required ? 'requerido' : ''}>
        {label}
      </label>
      {renderInput()}
    </div>
  );
};

export default CampoFormulario;
import React from 'react';
import { SelectConBotonesProps } from '../types';

const SelectConBotones: React.FC<SelectConBotonesProps> = ({
  label,
  name,
  seleccionado,
  opciones,
  onChange,
  onAgregar,
  onEliminar,
  items,
  botonNuevo = false,
  tipo = 'simple',
  inputCantidad,
}) => {
  const esRepuestos = tipo === 'conCantidad';

  return (
    <div className="campo-grupo">
      <label htmlFor="select-item" className="requerido">
        {label}
      </label>
      
      <select
        id="select-item"
        name={name}
        value={seleccionado}
        onChange={(e) => {
          if (onChange) {
            onChange(e);
          }
        }}
        className="campo-input"
      >
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>
      
      {esRepuestos ? (
        <div className="grupo-repuestos-linea">
          <button
            type="button"
            className="agregar-repuesto"
            onClick={onAgregar}
            aria-label="Agregar repuesto seleccionado"
          >
            Add
          </button>
          
          {botonNuevo && (
            <button
              type="button"
              className="Nuevo-repuesto"
              aria-label="Crear nuevo repuesto"
            >
              New
            </button>
          )}
          
          {inputCantidad && (
            <input
              type="text"
              className="input-cantidad"
              name={inputCantidad.name}
              placeholder="Cantidad"
              value={inputCantidad.value}
              onChange={inputCantidad.onChange}
              inputMode="numeric"
            />
          )}
        </div>
      ) : (
        <div className="grupo-etiquetas-linea">
          <button
            type="button"
            className="agregar-etiqueta"
            onClick={onAgregar}
            aria-label="Agregar item seleccionado"
          >
            Add
          </button>
          
          {botonNuevo && (
            <button
              type="button"
              className="Nueva-etiqueta"
              aria-label="Crear nuevo item"
            >
              New
            </button>
          )}
        </div>
      )}
      
      {items.length > 0 && (
        <div className="tabla-items">
          <table className={esRepuestos ? 'tabla-repuestos' : 'tabla-etiquetas'}>
            <thead>
              <tr>
                {esRepuestos ? (
                  <>
                    <th>Repuesto</th>
                    <th>Cantidad</th>
                    <th>Acciones</th>
                  </>
                ) : (
                  <>
                    <th>{label}</th>
                    <th>Acciones</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  {esRepuestos ? (
                    <>
                      <td>{(item as any).repuesto}</td>
                      <td>{(item as any).cantidad}</td>
                    </>
                  ) : (
                    <td>{opciones.find(op => op.value === item)?.label || item as string}</td>
                  )}
                  <td>
                    <button
                      type="button"
                      className="btn-eliminar"
                      onClick={() => onEliminar(index)}
                      aria-label={`Eliminar ${label.toLowerCase()}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SelectConBotones;
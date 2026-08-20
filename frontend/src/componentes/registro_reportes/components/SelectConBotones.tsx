import React, { useState } from 'react';
import { SelectConBotonesProps } from '../types';
import ModalAgregarItem from './ModalAgregarItem';
import './modal-agregar-item.css';

const SelectConBotones: React.FC<SelectConBotonesProps> = ({
  label,
  name,
  seleccionado,
  opciones,
  onChange,
  onAgregar,
  onEliminar,
  onNuevo,
  items,
  botonNuevo = false,
  tipo = 'simple',
  requerido = true,
  inputCantidad,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [opcionesExtra, setOpcionesExtra] = useState<Array<{ value: string; label: string }>>([]);
  const esRepuestos = tipo === 'conCantidad';

  const todasLasOpciones = [...opciones, ...opcionesExtra]
    .filter((opcion, index, arr) => arr.findIndex(o => o.value === opcion.value) === index);

  const handleNuevoConfirm = async (nombre: string) => {
    let nuevaOpcion: { value: string; label: string };

    if (onNuevo) {
      try {
        nuevaOpcion = await onNuevo(nombre);
      } catch (err) {
        const msg = (err as any)?.response?.data?.error || 'Error al crear el item';
        alert(msg);
        return;
      }
    } else {
      const value = nombre.toLowerCase().replace(/\s+/g, '_');
      nuevaOpcion = { value, label: nombre };
    }

    // Agregar la nueva opción a las opciones extra
    setOpcionesExtra(prev => [...prev, nuevaOpcion]);

    // Seleccionar la nueva opción en el dropdown
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name,
          value: nuevaOpcion.value,
        },
      } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
      onChange(syntheticEvent);
    }

    // Auto-agregar solo para etiquetas (tipo simple), no para repuestos que requieren cantidad
    if (!esRepuestos) {
      onAgregar(nuevaOpcion.value);
    }
  };

  return (
    <div className="campo-grupo">
      <label htmlFor="select-item" className={requerido ? 'requerido' : ''}>
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
        <option value="">Seleccione...</option>
        {todasLasOpciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>
      
      {esRepuestos ? (
        <div className="grupo-repuestos-linea">
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
          <button
            type="button"
            className="btn-agregar"
            onClick={() => onAgregar()}
            aria-label="Agregar repuesto seleccionado"
          >
            Agregar
          </button>
          
          {botonNuevo && (
            <button
              type="button"
              className="btn-nuevo-item"
              onClick={() => setModalOpen(true)}
              aria-label="Crear nuevo repuesto"
            >
              Nuevo
            </button>
          )}
          
        </div>
      ) : (
        <div className="grupo-etiquetas-linea">
          <button
            type="button"
            className="btn-agregar"
            onClick={() => onAgregar()}
            aria-label="Agregar item seleccionado"
          >
            Agregar
          </button>
          
          {botonNuevo && (
            <button
              type="button"
              className="btn-nuevo-item"
              onClick={() => setModalOpen(true)}
              aria-label="Crear nuevo item"
            >
              Nuevo
            </button>
          )}
        </div>
      )}
      
      {items.length > 0 ? (
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
                      <td>
                        {todasLasOpciones.find(op => op.value === (item as any).repuesto)?.label || (item as any).repuesto}
                      </td>
                      <td>{(item as any).cantidad}</td>
                    </>
                  ) : (
                    <td>{todasLasOpciones.find(op => op.value === item)?.label || item as string}</td>
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
      ) : (
        <div className="tabla-items-vacia">
          No hay {label.toLowerCase()} agregados
        </div>
      )}

      <ModalAgregarItem
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleNuevoConfirm}
        tipo={esRepuestos ? 'repuesto' : 'etiqueta'}
      />
    </div>
  );
};

export default SelectConBotones;
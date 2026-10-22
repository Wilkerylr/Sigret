/* ======================================
   components/CampoGenerico.tsx
   Renderiza cualquier tipo de campo según su configuración
   ====================================== */

import React from 'react';
import { CampoConfig, EntidadEditable } from '../types';
import ComboboxConBuscador from '@/componentes/ui/combobox-con-buscador';

interface CampoGenericoProps {
  config: CampoConfig;
  valor: any;
  datosCompletos: EntidadEditable;
  error: string | null;
  onChange: (nombre: string, valor: any) => void;
}

const CampoGenerico: React.FC<CampoGenericoProps> = ({
  config,
  valor,
  error,
  onChange,
}) => {
  const {
    nombre,
    etiqueta,
    tipo,
    requerido = false,
    opciones = [],
    placeholder,
    min,
    max,
    deshabilitado = false,
  } = config;

  const classes = [
    'edicion-campo',
    `edicion-campo--${config.ancho || 'completo'}`,
    error ? 'edicion-campo--error' : '',
    requerido ? 'edicion-campo--requerido' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleSimpleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onChange(nombre, e.target.value);
  };

  const renderCampo = () => {
    switch (tipo) {
      case 'textarea':
        return (
          <textarea
            id={`campo-${nombre}`}
            className="edicion-input edicion-input--textarea"
            value={valor ?? ''}
            onChange={handleSimpleChange}
            placeholder={placeholder}
            disabled={deshabilitado}
            rows={3}
          />
        );

      case 'numero':
        return (
          <input
            type="number"
            id={`campo-${nombre}`}
            className="edicion-input"
            value={valor ?? ''}
            onChange={handleSimpleChange}
            placeholder={placeholder}
            disabled={deshabilitado}
            min={min as number | undefined}
            max={max as number | undefined}
          />
        );

      case 'fecha':
        return (
          <input
            type="date"
            id={`campo-${nombre}`}
            className="edicion-input"
            value={valor ?? ''}
            onChange={handleSimpleChange}
            disabled={deshabilitado}
            min={min as string | undefined}
            max={max as string | undefined}
          />
        );

      case 'hora':
        return (
          <input
            type="time"
            id={`campo-${nombre}`}
            className="edicion-input"
            value={valor ?? ''}
            onChange={handleSimpleChange}
            disabled={deshabilitado}
          />
        );

      case 'select':
        return (
          <select
            id={`campo-${nombre}`}
            className="edicion-input"
            value={valor ?? ''}
            onChange={handleSimpleChange}
            disabled={deshabilitado}
          >
            <option value="">Seleccione...</option>
            {opciones.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        );

      case 'combobox':
        return (
          <ComboboxConBuscador
            opciones={opciones}
            valor={valor ?? ''}
            onChange={(newVal) => onChange(nombre, newVal)}
            placeholder={placeholder}
            requerido={requerido}
            deshabilitado={deshabilitado}
          />
        );

      case 'radio':
        return (
          <div className="edicion-radio-grupo">
            {opciones.map((op) => (
              <label key={op.value} className="edicion-radio-item">
                <input
                  type="radio"
                  name={nombre}
                  value={op.value}
                  checked={valor === op.value}
                  onChange={handleSimpleChange}
                  disabled={deshabilitado}
                />
                <span>{op.label}</span>
              </label>
            ))}
          </div>
        );

      case 'lista-items':
        return (
          <CampoListaItems
            nombre={nombre}
            etiqueta={etiqueta}
            valor={valor ?? []}
            opciones={opciones}
            onChange={onChange}
            deshabilitado={deshabilitado}
          />
        );

      case 'lista-items-cantidad':
        return (
          <CampoListaItemsCantidad
            nombre={nombre}
            etiqueta={etiqueta}
            valor={valor ?? []}
            opciones={opciones}
            onChange={onChange}
            deshabilitado={deshabilitado}
          />
        );

      // texto (default)
      default:
        return (
          <input
            type="text"
            id={`campo-${nombre}`}
            className="edicion-input"
            value={valor ?? ''}
            onChange={handleSimpleChange}
            placeholder={placeholder}
            disabled={deshabilitado}
          />
        );
    }
  };

  return (
    <div className={classes}>
      <label htmlFor={`campo-${nombre}`} className="edicion-label">
        {etiqueta}
        {requerido && <span className="edicion-requerido">*</span>}
      </label>
      {renderCampo()}
      {error && <span className="edicion-error">{error}</span>}
    </div>
  );
};

// ─── Subcomponente interno: CampoListaItems ────────────────────────────────
interface CampoListaItemsProps {
  nombre: string;
  etiqueta: string;
  valor: string[];
  opciones: Array<{ value: string; label: string }>;
  onChange: (nombre: string, valor: any) => void;
  deshabilitado?: boolean;
}

const CampoListaItems: React.FC<CampoListaItemsProps> = ({
  nombre,
  etiqueta,
  valor,
  opciones,
  onChange,
  deshabilitado = false,
}) => {
  const [seleccionado, setSeleccionado] = React.useState('');

  const agregarItem = () => {
    if (seleccionado && !valor.includes(seleccionado)) {
      onChange(nombre, [...valor, seleccionado]);
      setSeleccionado('');
    }
  };

  const eliminarItem = (index: number) => {
    const nuevos = valor.filter((_, i) => i !== index);
    onChange(nombre, nuevos);
  };

  return (
    <div className="edicion-lista-items">
      <div className="edicion-lista-items-input">
        <select
          className="edicion-input"
          value={seleccionado}
          onChange={(e) => setSeleccionado(e.target.value)}
          disabled={deshabilitado}
        >
          <option value="">Seleccione {etiqueta.toLowerCase()}...</option>
          {opciones
            .filter((op) => !valor.includes(op.value))
            .map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
        </select>
        <button
          type="button"
          className="edicion-btn-agregar"
          onClick={agregarItem}
          disabled={!seleccionado || deshabilitado}
          aria-label={`Agregar ${etiqueta.toLowerCase()}`}
        >
          + Agregar
        </button>
      </div>

      {valor.length > 0 && (
        <div className="edicion-lista-items-tags">
          {valor.map((item, index) => (
            <span key={index} className="edicion-tag">
              {opciones.find((op) => op.value === item)?.label || item}
              {!deshabilitado && (
                <button
                  type="button"
                  className="edicion-tag-eliminar"
                  onClick={() => eliminarItem(index)}
                  aria-label={`Eliminar ${item}`}
                >
                  ✕
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Subcomponente interno: CampoListaItemsCantidad ─────────────────────────
interface CampoListaItemsCantidadProps {
  nombre: string;
  etiqueta: string;
  valor: Array<{ id: number; cantidad: number }>;
  opciones: Array<{ value: string; label: string }>;
  onChange: (nombre: string, valor: any) => void;
  deshabilitado?: boolean;
}

const CampoListaItemsCantidad: React.FC<CampoListaItemsCantidadProps> = ({
  nombre,
  etiqueta,
  valor,
  opciones,
  onChange,
  deshabilitado = false,
}) => {
  const [seleccionado, setSeleccionado] = React.useState('');
  const [cantidad, setCantidad] = React.useState('1');

  const lista = Array.isArray(valor) ? valor : [];

  const agregarItem = () => {
    const id = Number(seleccionado);
    const cant = Math.max(1, Number(cantidad) || 1);
    if (!seleccionado || isNaN(id) || id < 1) return;
    if (lista.some((it) => Number(it.id) === id)) return;
    onChange(nombre, [...lista, { id, cantidad: cant }]);
    setSeleccionado('');
    setCantidad('1');
  };

  const eliminarItem = (id: number) => {
    onChange(nombre, lista.filter((it) => Number(it.id) !== id));
  };

  const cambiarCantidad = (id: number, cant: string) => {
    const valorNum = Math.max(1, Number(cant) || 1);
    onChange(
      nombre,
      lista.map((it) => (Number(it.id) === id ? { ...it, cantidad: valorNum } : it))
    );
  };

  return (
    <div className="edicion-lista-items">
      <div className="edicion-lista-items-input">
        <select
          className="edicion-input"
          value={seleccionado}
          onChange={(e) => setSeleccionado(e.target.value)}
          disabled={deshabilitado}
        >
          <option value="">Seleccione {etiqueta.toLowerCase()}...</option>
          {opciones
            .filter((op) => !lista.some((it) => String(it.id) === op.value))
            .map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
        </select>
        <input
          type="number"
          className="edicion-input edicion-input--cantidad"
          value={cantidad}
          min={1}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Cant."
          disabled={deshabilitado}
        />
        <button
          type="button"
          className="edicion-btn-agregar"
          onClick={agregarItem}
          disabled={!seleccionado || deshabilitado}
          aria-label={`Agregar ${etiqueta.toLowerCase()}`}
        >
          + Agregar
        </button>
      </div>

      {lista.length > 0 && (
        <div className="edicion-lista-items-tags">
          {lista.map((item) => {
            const label = opciones.find((op) => op.value === String(item.id))?.label || String(item.id);
            return (
              <span key={item.id} className="edicion-tag edicion-tag--cantidad">
                {label}
                <input
                  type="number"
                  className="edicion-tag-cantidad"
                  value={item.cantidad}
                  min={1}
                  onChange={(e) => cambiarCantidad(Number(item.id), e.target.value)}
                  disabled={deshabilitado}
                  aria-label={`Cantidad de ${label}`}
                />
                {!deshabilitado && (
                  <button
                    type="button"
                    className="edicion-tag-eliminar"
                    onClick={() => eliminarItem(Number(item.id))}
                    aria-label={`Eliminar ${label}`}
                  >
                    ✕
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampoGenerico;
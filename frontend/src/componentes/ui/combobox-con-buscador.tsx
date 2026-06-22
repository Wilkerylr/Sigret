/* ======================================
   combobox-con-buscador.tsx
   Componente reutilizable Combobox con buscador
   Filtrado manual mientras el usuario escribe
   ====================================== */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, X } from 'lucide-react';
import './combobox-con-buscador.css';

export interface OpcionCombobox {
  value: string;
  label: string;
}

interface ComboboxConBuscadorProps {
  opciones: OpcionCombobox[];
  valor: string;
  onChange: (value: string) => void;
  placeholder?: string;
  requerido?: boolean;
  label?: string;
  nombre?: string;
  className?: string;
  deshabilitado?: boolean;
}

const ComboboxConBuscador: React.FC<ComboboxConBuscadorProps> = ({
  opciones,
  valor,
  onChange,
  placeholder = 'Buscar...',
  requerido = false,
  label,
  nombre,
  className = '',
  deshabilitado = false,
}) => {
  const [abierto, setAbierto] = useState(false);
  const [textoInput, setTextoInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const itemHighlightRef = useRef<number>(-1);

  const opcionSeleccionada = opciones.find((op) => op.value === valor);

  // Filtrar opciones según lo que el usuario escribe
  const opcionesFiltradas = opciones.filter((opcion) => {
    if (!textoInput) return true;
    return opcion.label.toLowerCase().includes(textoInput.toLowerCase());
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cuando se abre el dropdown, enfocar input
  useEffect(() => {
    if (abierto && inputRef.current) {
      inputRef.current.focus();
    }
  }, [abierto]);

  // Controlar el texto del input: si hay selección, mostrar label
  useEffect(() => {
    if (!abierto && opcionSeleccionada) {
      setTextoInput(opcionSeleccionada.label);
    }
    if (!abierto && !opcionSeleccionada) {
      setTextoInput('');
    }
  }, [abierto, opcionSeleccionada]);

  const toggleDropdown = () => {
    if (!deshabilitado) {
      setAbierto((prev) => !prev);
      if (!abierto) {
        setTextoInput('');
      }
    }
  };

  const seleccionar = useCallback((opcion: OpcionCombobox) => {
    onChange(opcion.value);
    setTextoInput(opcion.label);
    setAbierto(false);
  }, [onChange]);

  const limpiar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setTextoInput('');
    setAbierto(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTextoInput(val);
    if (!abierto) setAbierto(true);
    // Si el usuario borra el texto, limpiar selección
    if (val === '' && valor !== '') {
      onChange('');
    }
    itemHighlightRef.current = -1;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      itemHighlightRef.current = Math.min(itemHighlightRef.current + 1, opcionesFiltradas.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      itemHighlightRef.current = Math.max(itemHighlightRef.current - 1, -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (itemHighlightRef.current >= 0 && itemHighlightRef.current < opcionesFiltradas.length) {
        seleccionar(opcionesFiltradas[itemHighlightRef.current]);
      } else if (opcionesFiltradas.length > 0) {
        seleccionar(opcionesFiltradas[0]);
      }
    } else if (e.key === 'Escape') {
      setAbierto(false);
    }
  };

  const inputValue = textoInput;
  const mostrarDropdown = abierto && !deshabilitado;

  return (
    <div className={`combobox-con-buscador-grupo ${className}`} ref={contenedorRef}>
      {label && (
        <label className={`combobox-con-buscador-label ${requerido ? 'requerido' : ''}`}>
          {label}
        </label>
      )}
      <div
        className="combobox-con-buscador-input-wrapper"
        onClick={toggleDropdown}
      >
        <input
          ref={inputRef}
          type="text"
          className="combobox-con-buscador-input"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => { if (!abierto) setAbierto(true); }}
          onKeyDown={handleKeyDown}
          disabled={deshabilitado}
          autoComplete="off"
        />
        <div className="combobox-con-buscador-acciones">
          {valor && (
            <button
              type="button"
              className="combobox-con-buscador-clear"
              onClick={limpiar}
              tabIndex={-1}
              aria-label="Limpiar selección"
            >
              <X size={16} />
            </button>
          )}
          <span className="combobox-con-buscador-separador" />
          <button
            type="button"
            className={`combobox-con-buscador-trigger ${abierto ? 'abierto' : ''}`}
            onClick={toggleDropdown}
            tabIndex={-1}
            aria-label={abierto ? 'Cerrar lista' : 'Abrir lista'}
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {mostrarDropdown && (
        <div className="combobox-con-buscador-dropdown">
          {opcionesFiltradas.length === 0 ? (
            <div className="combobox-con-buscador-sin-resultados">
              Sin resultados
            </div>
          ) : (
            opcionesFiltradas.map((opcion, idx) => (
              <div
                key={opcion.value}
                className={`combobox-con-buscador-item ${idx === itemHighlightRef.current ? 'resaltado' : ''} ${opcion.value === valor ? 'seleccionado' : ''}`}
                onClick={() => seleccionar(opcion)}
                onMouseEnter={() => { itemHighlightRef.current = idx; }}
              >
                {opcion.label}
                {opcion.value === valor && (
                  <span className="combobox-con-buscador-check">✓</span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {nombre && <input type="hidden" name={nombre} value={valor} />}
    </div>
  );
};

export default ComboboxConBuscador;
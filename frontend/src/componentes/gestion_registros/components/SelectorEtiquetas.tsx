/* ======================================
   components/SelectorEtiquetas.tsx
   Selector visual de etiquetas con colores
   ====================================== */

import React from 'react';
import { X } from 'lucide-react';
import type { Etiqueta } from '../types';
import './SelectorEtiquetas.css';

interface SelectorEtiquetasProps {
  etiquetasDisponibles: Etiqueta[];
  etiquetasSeleccionadas: string[];
  onChange: (etiquetas: string[]) => void;
  /** Si se permite seleccionar múltiples */
  multiple?: boolean;
}

const SelectorEtiquetas: React.FC<SelectorEtiquetasProps> = ({
  etiquetasDisponibles,
  etiquetasSeleccionadas,
  onChange,
  multiple = true,
}) => {
  const toggleEtiqueta = (nombre: string) => {
    if (multiple) {
      if (etiquetasSeleccionadas.includes(nombre)) {
        onChange(etiquetasSeleccionadas.filter((e) => e !== nombre));
      } else {
        onChange([...etiquetasSeleccionadas, nombre]);
      }
    } else {
      onChange(etiquetasSeleccionadas.includes(nombre) ? [] : [nombre]);
    }
  };

  const removerEtiqueta = (nombre: string) => {
    onChange(etiquetasSeleccionadas.filter((e) => e !== nombre));
  };

  return (
    <div className="selector-etiquetas">
      {/* Etiquetas seleccionadas */}
      {etiquetasSeleccionadas.length > 0 && (
        <div className="selector-etiquetas-seleccionadas">
          {etiquetasSeleccionadas.map((nombre) => {
            const etiqueta = etiquetasDisponibles.find((e) => e.nombre === nombre);
            return (
              <span
                key={nombre}
                className="selector-etiqueta-tag"
                style={{
                  background: etiqueta?.color ? `${etiqueta.color}20` : '#e5e7eb',
                  color: etiqueta?.color || '#374151',
                  borderColor: etiqueta?.color || '#d1d5db',
                }}
              >
                {nombre}
                <button
                  type="button"
                  className="selector-etiqueta-remover"
                  onClick={() => removerEtiqueta(nombre)}
                  aria-label={`Remover etiqueta ${nombre}`}
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Lista de etiquetas disponibles */}
      <div className="selector-etiquetas-lista">
        {etiquetasDisponibles.map((etiqueta) => {
          const seleccionada = etiquetasSeleccionadas.includes(etiqueta.nombre);
          return (
            <button
              key={etiqueta.id}
              type="button"
              className={`selector-etiqueta-opcion ${seleccionada ? 'seleccionada' : ''}`}
              style={{
                '--etiqueta-color': etiqueta.color || '#6b7280',
                background: seleccionada
                  ? `${etiqueta.color || '#6b7280'}20`
                  : 'transparent',
                borderColor: seleccionada
                  ? etiqueta.color || '#6b7280'
                  : '#d1d5db',
                color: seleccionada
                  ? etiqueta.color || '#374151'
                  : '#374151',
              } as React.CSSProperties}
              onClick={() => toggleEtiqueta(etiqueta.nombre)}
            >
              <span
                className="selector-etiqueta-indicador"
                style={{ background: etiqueta.color || '#6b7280' }}
              />
              {etiqueta.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectorEtiquetas;
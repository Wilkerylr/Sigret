/* ======================================
   components/TablaGenerica.tsx
   Tabla reutilizable con columnas configurables, acciones y paginación
   ====================================== */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnaTabla, AccionFila } from '../types';
import './TablaGenerica.css';

interface TablaGenericaProps<T> {
  /** Datos a mostrar */
  datos: T[];
  /** Configuración de columnas */
  columnas: ColumnaTabla<T>[];
  /** Acciones disponibles por fila */
  acciones?: AccionFila<T>[];
  /** Clave única para cada fila (default: 'id') */
  keyExtractor?: keyof T | ((item: T) => string);
  /** Mensaje cuando no hay datos */
  mensajeVacio?: string;
  /** Paginación */
  paginaActual?: number;
  totalPaginas?: number;
  totalItems?: number;
  itemsPorPagina?: number;
  onCambiarPagina?: (pagina: number) => void;
  onCambiarItemsPorPagina?: (items: number) => void;
  /** Si está cargando */
  cargando?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

function TablaGenerica<T extends Record<string, any>>({
  datos,
  columnas,
  acciones,
  keyExtractor = 'id',
  mensajeVacio = 'No se encontraron registros',
  paginaActual,
  totalPaginas,
  totalItems,
  itemsPorPagina,
  onCambiarPagina,
  onCambiarItemsPorPagina,
  cargando = false,
  className = '',
}: TablaGenericaProps<T>) {
  const getKey = (item: T, index: number): string => {
    if (typeof keyExtractor === 'function') return keyExtractor(item);
    return String(item[keyExtractor] ?? index);
  };

  if (cargando) {
    return (
      <div className="tabla-generica-vacio">
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="tabla-generica-vacio">
        <p>{mensajeVacio}</p>
      </div>
    );
  }

  return (
    <div className={`tabla-generica-contenedor ${className}`}>
      <div className="tabla-generica-scroll">
        <table className="tabla-generica">
          <thead>
            <tr>
              {columnas.map((col) => (
                <th
                  key={col.key}
                  className={`tabla-generica-th ${col.className || ''}`}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                >
                  {col.titulo}
                </th>
              ))}
              {acciones && acciones.length > 0 && (
                <th className="tabla-generica-th tabla-generica-th-acciones">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, index) => (
              <tr key={getKey(fila, index)} className="tabla-generica-tr">
                {columnas.map((col) => (
                  <td
                    key={col.key}
                    className={`tabla-generica-td ${col.className || ''}`}
                  >
                    {col.render
                      ? col.render(fila[col.key], fila)
                      : String(fila[col.key] ?? '—')}
                  </td>
                ))}
                {acciones && acciones.length > 0 && (
                  <td className="tabla-generica-td tabla-generica-td-acciones">
                    <div className="tabla-generica-acciones">
                      {acciones
                        .filter((acc) => !acc.visible || acc.visible(fila))
                        .map((acc, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`tabla-generica-btn-accion tabla-generica-btn-${acc.variant || 'primary'}`}
                            onClick={() => acc.onClick(fila)}
                            title={acc.etiqueta}
                          >
                            {acc.icono}
                            <span className="tabla-generica-btn-texto">
                              {acc.etiqueta}
                            </span>
                          </button>
                        ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas !== undefined && totalPaginas > 0 && onCambiarPagina && (
        <div className="tabla-generica-paginacion">
          <div className="tabla-generica-paginacion-info">
            <span>
              Mostrando {datos.length} de {totalItems} registros
            </span>
            {itemsPorPagina && onCambiarItemsPorPagina && (
              <div className="tabla-generica-paginacion-selector">
                <label htmlFor="items-por-pagina-tabla">Por página:</label>
                <select
                  id="items-por-pagina-tabla"
                  className="tabla-generica-paginacion-select"
                  value={itemsPorPagina}
                  onChange={(e) => onCambiarItemsPorPagina(Number(e.target.value))}
                >
                  {[5, 10, 15, 20, 30].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="tabla-generica-paginacion-controles">
            <button
              type="button"
              className="tabla-generica-paginacion-btn"
              disabled={paginaActual! <= 1}
              onClick={() => onCambiarPagina(paginaActual! - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPaginas <= 7) return true;
                if (p === 1 || p === totalPaginas) return true;
                if (Math.abs(p - paginaActual!) <= 1) return true;
                return false;
              })
              .map((p, idx, arr) => {
                const items: React.ReactNode[] = [];
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  items.push(
                    <span key={`dots-${p}`} className="tabla-generica-paginacion-dots">
                      ...
                    </span>
                  );
                }
                items.push(
                  <button
                    key={p}
                    type="button"
                    className={`tabla-generica-paginacion-numero ${p === paginaActual ? 'activo' : ''}`}
                    onClick={() => onCambiarPagina(p)}
                    aria-label={`Página ${p}`}
                    aria-current={p === paginaActual ? 'page' : undefined}
                  >
                    {p}
                  </button>
                );
                return items;
              })}

            <button
              type="button"
              className="tabla-generica-paginacion-btn"
              disabled={paginaActual! >= totalPaginas}
              onClick={() => onCambiarPagina(paginaActual! + 1)}
              aria-label="Página siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TablaGenerica;
/* ======================================
   components/Paginacion.tsx
   Componente de paginación con selector de items por página
   ====================================== */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalItems: number;
  itemsPorPagina: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarItemsPorPagina: (items: number) => void;
}

const OPCIONES_ITEMS = [10, 20, 30];

const Paginacion: React.FC<PaginacionProps> = ({
  paginaActual,
  totalPaginas,
  totalItems,
  itemsPorPagina,
  onCambiarPagina,
  onCambiarItemsPorPagina,
}) => {
  if (totalPaginas <= 0) return null;

  // Calcular qué números de página mostrar
  const generarNumerosPagina = (): (number | '...')[] => {
    const numeros: (number | '...')[] = [];
    const maxVisibles = 5;

    if (totalPaginas <= maxVisibles + 2) {
      for (let i = 1; i <= totalPaginas; i++) numeros.push(i);
    } else {
      numeros.push(1);
      let inicio = Math.max(2, paginaActual - 1);
      let fin = Math.min(totalPaginas - 1, paginaActual + 1);

      if (paginaActual <= 3) {
        inicio = 2;
        fin = Math.min(4, totalPaginas - 1);
      } else if (paginaActual >= totalPaginas - 2) {
        inicio = totalPaginas - 3;
        fin = totalPaginas - 1;
      }

      if (inicio > 2) numeros.push('...');
      for (let i = inicio; i <= fin; i++) numeros.push(i);
      if (fin < totalPaginas - 1) numeros.push('...');
      numeros.push(totalPaginas);
    }
    return numeros;
  };

  const rangoInicio = (paginaActual - 1) * itemsPorPagina + 1;
  const rangoFin = Math.min(paginaActual * itemsPorPagina, totalItems);

  return (
    <div className="busqueda-paginacion">
      <div className="busqueda-paginacion-info">
        <span className="busqueda-paginacion-texto">
          Mostrando {rangoInicio}–{rangoFin} de {totalItems} reportes
        </span>
        <div className="busqueda-paginacion-selector">
          <label htmlFor="items-por-pagina">Por página:</label>
          <select
            id="items-por-pagina"
            className="busqueda-paginacion-select"
            value={itemsPorPagina}
            onChange={(e) => onCambiarItemsPorPagina(Number(e.target.value))}
          >
            {OPCIONES_ITEMS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="busqueda-paginacion-controles">
        <button
          type="button"
          className="busqueda-paginacion-btn"
          disabled={paginaActual <= 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {generarNumerosPagina().map((item, idx) =>
          item === '...' ? (
            <span key={`dots-${idx}`} className="busqueda-paginacion-dots">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`busqueda-paginacion-numero ${item === paginaActual ? 'activo' : ''}`}
              onClick={() => onCambiarPagina(item)}
              aria-label={`Página ${item}`}
              aria-current={item === paginaActual ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className="busqueda-paginacion-btn"
          disabled={paginaActual >= totalPaginas}
          onClick={() => onCambiarPagina(paginaActual + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Paginacion;
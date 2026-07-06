/* ======================================
   hooks/useHistorialCambios.ts
   Hook para gestionar el historial de cambios (auditoría)
   ====================================== */

import { useState, useMemo, useCallback } from 'react';
import { HISTORIAL_PRUEBA } from '@/data/historial';
import type { EntradaHistorial, FiltrosHistorial } from '../types';

/** Filtros iniciales vacíos */
const FILTROS_INICIALES: FiltrosHistorial = {
  numeroReporte: '',
  accion: '',
  usuario: '',
  fechaDesde: '',
  fechaHasta: '',
};

export function useHistorialCambios() {
  const [historial] = useState<EntradaHistorial[]>(HISTORIAL_PRUEBA);
  const [filtros, setFiltros] = useState<FiltrosHistorial>({ ...FILTROS_INICIALES });
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(15);
  const [entradaExpandida, setEntradaExpandida] = useState<string | null>(null);

  /** Actualizar un filtro específico */
  const actualizarFiltro = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
  }, []);

  /** Limpiar todos los filtros */
  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...FILTROS_INICIALES });
    setPaginaActual(1);
  }, []);

  /** Aplicar filtros al historial */
  const historialFiltrado = useMemo(() => {
    let resultado = [...historial];

    if (filtros.numeroReporte.trim()) {
      const term = filtros.numeroReporte.toLowerCase().trim();
      resultado = resultado.filter(e =>
        e.numeroReporte.toLowerCase().includes(term)
      );
    }

    if (filtros.accion) {
      resultado = resultado.filter(e => e.accion === filtros.accion);
    }

    if (filtros.usuario.trim()) {
      const term = filtros.usuario.toLowerCase().trim();
      resultado = resultado.filter(e =>
        e.usuario.toLowerCase().includes(term)
      );
    }

    if (filtros.fechaDesde) {
      resultado = resultado.filter(e => e.fecha >= filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      resultado = resultado.filter(e => e.fecha <= filtros.fechaHasta);
    }

    return resultado;
  }, [historial, filtros]);

  /** Calcular paginación */
  const totalPaginas = useMemo(() => {
    return Math.max(1, Math.ceil(historialFiltrado.length / itemsPorPagina));
  }, [historialFiltrado.length, itemsPorPagina]);

  /** Página actual asegurada dentro de límites */
  const paginaSegura = useMemo(() => {
    if (paginaActual > totalPaginas) return totalPaginas;
    return paginaActual;
  }, [paginaActual, totalPaginas]);

  /** Slice de resultados para la página actual */
  const historialPagina = useMemo(() => {
    const inicio = (paginaSegura - 1) * itemsPorPagina;
    return historialFiltrado.slice(inicio, inicio + itemsPorPagina);
  }, [historialFiltrado, paginaSegura, itemsPorPagina]);

  /** Cambiar página */
  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
  }, []);

  /** Cambiar items por página */
  const cambiarItemsPorPagina = useCallback((items: number) => {
    setItemsPorPagina(items);
    setPaginaActual(1);
  }, []);

  /** Expandir/colapsar una entrada del historial */
  const toggleExpandir = useCallback((id: string) => {
    setEntradaExpandida(prev => prev === id ? null : id);
  }, []);

  /** Obtener etiqueta de color para la acción */
  const getColorAccion = useCallback((accion: EntradaHistorial['accion']): string => {
    switch (accion) {
      case 'creacion': return '#10b981'; // verde
      case 'edicion': return '#3b82f6';  // azul
      case 'eliminacion': return '#ef4444'; // rojo
      default: return '#6b7280';
    }
  }, []);

  /** Obtener texto legible para la acción */
  const getTextoAccion = useCallback((accion: EntradaHistorial['accion']): string => {
    switch (accion) {
      case 'creacion': return 'Creación';
      case 'edicion': return 'Edición';
      case 'eliminacion': return 'Eliminación';
      default: return accion;
    }
  }, []);

  return {
    // Estado
    filtros,
    historialFiltrado,
    historialPagina,
    paginaActual: paginaSegura,
    totalPaginas,
    itemsPorPagina,
    entradaExpandida,

    // Acciones
    actualizarFiltro,
    limpiarFiltros,
    cambiarPagina,
    cambiarItemsPorPagina,
    toggleExpandir,
    getColorAccion,
    getTextoAccion,
  };
}
/* ======================================
   hooks/useGestionReportes.ts
   Hook para CRUD de reportes técnicos con filtros y paginación
   ====================================== */

import { useState, useMemo, useCallback } from 'react';
import { REPORTES_PRUEBA } from '@/data/reportes';
import type { ReporteResumen } from '@/data/reportes';
import type { FiltrosReportes } from '../types';

const FILTROS_INICIALES: FiltrosReportes = {
  numeroReporte: '',
  cliente: '',
  equipo: '',
  etiqueta: '',
  fechaDesde: '',
  fechaHasta: '',
};

export function useGestionReportes() {
  const [reportes, setReportes] = useState<ReporteResumen[]>(REPORTES_PRUEBA);
  const [filtros, setFiltros] = useState<FiltrosReportes>({ ...FILTROS_INICIALES });
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [reporteEditando, setReporteEditando] = useState<ReporteResumen | null>(null);
  const [reporteEliminar, setReporteEliminar] = useState<ReporteResumen | null>(null);
  const [cargando, setCargando] = useState(false);

  const actualizarFiltro = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...FILTROS_INICIALES });
    setPaginaActual(1);
  }, []);

  const reportesFiltrados = useMemo(() => {
    let resultado = [...reportes];

    if (filtros.numeroReporte.trim()) {
      const term = filtros.numeroReporte.toLowerCase().trim();
      resultado = resultado.filter(r => r.numeroReporte.toLowerCase().includes(term));
    }
    if (filtros.cliente.trim()) {
      const term = filtros.cliente.toLowerCase().trim();
      resultado = resultado.filter(r => r.cliente.toLowerCase().includes(term));
    }
    if (filtros.equipo.trim()) {
      const term = filtros.equipo.toLowerCase().trim();
      resultado = resultado.filter(r => r.equipo.toLowerCase().includes(term));
    }
    if (filtros.etiqueta.trim()) {
      const term = filtros.etiqueta.toLowerCase().trim();
      resultado = resultado.filter(r =>
        r.etiquetas.some(e => e.toLowerCase().includes(term))
      );
    }
    if (filtros.fechaDesde) {
      resultado = resultado.filter(r => r.fechaReporte >= filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      resultado = resultado.filter(r => r.fechaReporte <= filtros.fechaHasta);
    }

    return resultado;
  }, [reportes, filtros]);

  const totalPaginas = useMemo(() => {
    return Math.max(1, Math.ceil(reportesFiltrados.length / itemsPorPagina));
  }, [reportesFiltrados.length, itemsPorPagina]);

  const paginaSegura = useMemo(() => {
    if (paginaActual > totalPaginas) return totalPaginas;
    return paginaActual;
  }, [paginaActual, totalPaginas]);

  const reportesPagina = useMemo(() => {
    const inicio = (paginaSegura - 1) * itemsPorPagina;
    return reportesFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [reportesFiltrados, paginaSegura, itemsPorPagina]);

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
  }, []);

  const cambiarItemsPorPagina = useCallback((items: number) => {
    setItemsPorPagina(items);
    setPaginaActual(1);
  }, []);

  /** Iniciar edición de un reporte */
  const iniciarEdicion = useCallback((reporte: ReporteResumen) => {
    setReporteEditando(reporte);
  }, []);

  /** Guardar cambios de edición */
  const guardarEdicion = useCallback(async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      setReportes(prev =>
        prev.map(r =>
          r.id === datos.id
            ? ({ ...r, ...datos } as ReporteResumen)
            : r
        )
      );
      setReporteEditando(null);
      return true;
    } finally {
      setCargando(false);
    }
  }, []);

  /** Cancelar edición */
  const cancelarEdicion = useCallback(() => {
    setReporteEditando(null);
  }, []);

  /** Solicitar confirmación para eliminar */
  const solicitarEliminar = useCallback((reporte: ReporteResumen) => {
    setReporteEliminar(reporte);
  }, []);

  /** Confirmar eliminación */
  const confirmarEliminar = useCallback(async (): Promise<boolean> => {
    if (!reporteEliminar) return false;
    setCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReportes(prev => prev.filter(r => r.id !== reporteEliminar.id));
      setReporteEliminar(null);
      return true;
    } finally {
      setCargando(false);
    }
  }, [reporteEliminar]);

  /** Cancelar eliminación */
  const cancelarEliminar = useCallback(() => {
    setReporteEliminar(null);
  }, []);

  return {
    reportes: reportesPagina,
    reportesTotal: reportesFiltrados.length,
    filtros,
    paginaActual: paginaSegura,
    totalPaginas,
    itemsPorPagina,
    reporteEditando,
    reporteEliminar,
    cargando,

    actualizarFiltro,
    limpiarFiltros,
    cambiarPagina,
    cambiarItemsPorPagina,
    iniciarEdicion,
    guardarEdicion,
    cancelarEdicion,
    solicitarEliminar,
    confirmarEliminar,
    cancelarEliminar,
  };
}
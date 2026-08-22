/* ======================================
   hooks/useGestionReportes.ts
   Hook para CRUD de reportes técnicos con filtros y paginación
   Conectado al backend real (/api/reportes)
   ====================================== */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import queryClient from '@/lib/queryClient';
import type { ReporteResumen, FiltrosReportes } from '../types';

const FILTROS_INICIALES: FiltrosReportes = {
  numeroReporte: '',
  cliente: '',
  equipo: '',
  etiqueta: '',
  fechaDesde: '',
  fechaHasta: '',
};

export function useGestionReportes() {
  const [reportes, setReportes] = useState<ReporteResumen[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosReportes>({ ...FILTROS_INICIALES });
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [reporteEditando, setReporteEditando] = useState<ReporteResumen | null>(null);
  const [reporteEliminar, setReporteEliminar] = useState<ReporteResumen | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  const cargarReportes = async () => {
    try {
      if (totalItems === 0) setCargandoInicial(true);
      else setCargando(true);

      const params: Record<string, any> = {
        pagina: paginaActual,
        items: itemsPorPagina,
      };

      if (filtros.numeroReporte.trim()) params.numero = filtros.numeroReporte.trim();
      if (filtros.cliente.trim()) params.cliente = filtros.cliente.trim();
      if (filtros.equipo.trim()) params.equipo = filtros.equipo.trim();
      if (filtros.etiqueta.trim()) params.etiqueta = filtros.etiqueta.trim();
      if (filtros.fechaDesde) params.desde = filtros.fechaDesde;
      if (filtros.fechaHasta) params.hasta = filtros.fechaHasta;

      const { data } = await apiClient.get(ENDPOINTS.REPORTES.BASE, { params });

      setReportes(data.reportes || []);
      setTotalItems(data.paginacion?.totalItems || 0);
      setTotalPaginas(data.paginacion?.totalPaginas || 1);
    } catch (error) {
      console.error('[REPORTES] Error al cargar:', error);
    } finally {
      setCargando(false);
      setCargandoInicial(false);
    }
  };

  // Cargar reportes al montar
  useEffect(() => {
    cargarReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar cuando cambian filtros, página o items por página
  useEffect(() => {
    cargarReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, paginaActual, itemsPorPagina]);

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

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
  }, []);

  const cambiarItemsPorPagina = useCallback((items: number) => {
    setItemsPorPagina(items);
    setPaginaActual(1);
  }, []);

  const iniciarEdicion = useCallback((reporte: ReporteResumen) => {
    setReporteEditando(reporte);
  }, []);

  const guardarEdicion = async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      await apiClient.put(ENDPOINTS.REPORTES.BY_ID(String(datos.id)), {
        clienteId: datos.clienteId,
        equipo: datos.equipo,
        fechaReporte: datos.fechaReporte,
        fechaAtencion: datos.fechaAtencion,
        horaInicio: datos.horaInicio,
        horaFinalizacion: datos.horaFinalizacion,
        descripcionFalla: datos.descripcionFalla,
        trabajoRealizado: datos.trabajoRealizado,
        etiquetaId: datos.etiquetaId,
        tecnicoId: datos.tecnicoId,
        estadoId: datos.estadoId,
        repuestoId: datos.repuestoId,
        posibleCausa: datos.posibleCausa,
        anotaciones: datos.anotaciones,
        reportadoPor: datos.reportadoPor,
        motivoModificacion: datos.motivoModificacion,
      });
      await cargarReportes();
      setReporteEditando(null);
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al guardar el reporte';
      console.error('[REPORTES] Error al guardar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cancelarEdicion = useCallback(() => {
    setReporteEditando(null);
  }, []);

  const solicitarEliminar = useCallback((reporte: ReporteResumen) => {
    setReporteEliminar(reporte);
  }, []);

  const confirmarEliminar = async (): Promise<boolean> => {
    if (!reporteEliminar) return false;
    setCargando(true);
    try {
      await apiClient.delete(ENDPOINTS.REPORTES.BY_ID(String(reporteEliminar.id)));
      await cargarReportes();
      setReporteEliminar(null);
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al eliminar el reporte';
      console.error('[REPORTES] Error al eliminar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cancelarEliminar = useCallback(() => {
    setReporteEliminar(null);
  }, []);

  const recuperar = async (id: string): Promise<boolean> => {
    setCargando(true);
    try {
      await apiClient.patch(ENDPOINTS.REPORTES.RESTORE(id));
      await cargarReportes();
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al recuperar el reporte';
      console.error('[REPORTES] Error al recuperar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  return {
    reportes,
    reportesTotal: totalItems,
    filtros,
    paginaActual,
    totalPaginas,
    itemsPorPagina,
    reporteEditando,
    reporteEliminar,
    cargando,
    cargandoInicial,

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
    recuperar,
  };
}

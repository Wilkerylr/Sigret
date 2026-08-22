/* ======================================
   hooks/useHistorialCambios.ts
   Hook para gestionar el historial de cambios (auditoría)
   Conectado al backend real (/api/modificaciones)
   ====================================== */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import queryClient from '@/lib/queryClient';
import type { EntradaHistorial, FiltrosHistorial } from '../types';

const FILTROS_INICIALES: FiltrosHistorial = {
  numeroReporte: '',
  accion: '',
  usuario: '',
  fechaDesde: '',
  fechaHasta: '',
};

export function useHistorialCambios() {
  const [historial, setHistorial] = useState<EntradaHistorial[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosHistorial>({ ...FILTROS_INICIALES });
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(15);
  const [entradaExpandida, setEntradaExpandida] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const cargarHistorial = async () => {
    try {
      setCargando(true);

      const params: Record<string, any> = {
        pagina: paginaActual,
        items: itemsPorPagina,
      };

      if (filtros.numeroReporte.trim()) params.numero = filtros.numeroReporte.trim();
      if (filtros.accion) params.accion = filtros.accion;
      if (filtros.usuario.trim()) params.usuario = filtros.usuario.trim();
      if (filtros.fechaDesde) params.desde = filtros.fechaDesde;
      if (filtros.fechaHasta) params.hasta = filtros.fechaHasta;

      const { data } = await apiClient.get(ENDPOINTS.HISTORIAL.BASE, { params });

      setHistorial(data.historial || []);
      setTotalItems(data.paginacion?.totalItems || 0);
      setTotalPaginas(data.paginacion?.totalPaginas || 1);
    } catch (error) {
      console.error('[HISTORIAL] Error al cargar:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
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

  const toggleExpandir = useCallback((id: string) => {
    setEntradaExpandida(prev => prev === id ? null : id);
  }, []);

  const getColorAccion = useCallback((accion: EntradaHistorial['accion']): string => {
    switch (accion) {
      case 'creacion': return '#10b981';
      case 'edicion': return '#3b82f6';
      case 'eliminacion': return '#ef4444';
      default: return '#6b7280';
    }
  }, []);

  const getTextoAccion = useCallback((accion: EntradaHistorial['accion']): string => {
    switch (accion) {
      case 'creacion': return 'Creación';
      case 'edicion': return 'Edición';
      case 'eliminacion': return 'Eliminación';
      case 'restauracion': return 'Restauración';
      default: return accion;
    }
  }, []);

  const recuperarEntrada = async (entrada: EntradaHistorial): Promise<boolean> => {
    setCargando(true);
    try {
      if (entrada.accion !== 'eliminacion') return false;

      // Si tiene reporteId, restaurar reporte
      if (entrada.reporteId) {
        await apiClient.patch(ENDPOINTS.REPORTES.RESTORE(String(entrada.reporteId)));
        await cargarHistorial();
        queryClient.invalidateQueries({ queryKey: ['opciones'] });
        queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
        return true;
      }

      // Si no tiene reporteId, es una eliminación de cliente u otra entidad
      // No se puede restaurar desde el historial sin el ID de la entidad
      console.warn('[HISTORIAL] No se puede restaurar: entrada sin reporteId');
      return false;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al restaurar';
      console.error('[HISTORIAL] Error al restaurar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  return {
    filtros,
    historialFiltrado: historial,
    historialPagina: historial,
    paginaActual,
    totalPaginas,
    totalItems,
    itemsPorPagina,
    entradaExpandida,
    cargando,

    actualizarFiltro,
    limpiarFiltros,
    cambiarPagina,
    cambiarItemsPorPagina,
    toggleExpandir,
    getColorAccion,
    getTextoAccion,
    recuperarEntrada,
  };
}

/* ======================================
   hooks/useGestionEtiquetas.ts
   Hook para gestionar el sistema de etiquetas (tags)
   Conectado al backend real (/api/etiquetas)
   ====================================== */

import { useState, useMemo, useCallback, useEffect } from 'react';
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import queryClient from '@/lib/queryClient';
import type { Etiqueta, FiltrosEtiquetas } from '../types';

const FILTROS_INICIALES: FiltrosEtiquetas = {
  nombre: '',
};

export function useGestionEtiquetas() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [filtros, setFiltros] = useState<FiltrosEtiquetas>({ ...FILTROS_INICIALES });
  const [etiquetaEditando, setEtiquetaEditando] = useState<Etiqueta | null>(null);
  const [modoCrear, setModoCrear] = useState(false);
  const [etiquetaEliminar, setEtiquetaEliminar] = useState<Etiqueta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  const cargarEtiquetas = async () => {
    try {
      setCargandoInicial(true);
      const { data } = await apiClient.get(ENDPOINTS.ETIQUETAS.BASE);
      setEtiquetas(data);
    } catch (error) {
      console.error('[ETIQUETAS] Error al cargar:', error);
    } finally {
      setCargandoInicial(false);
    }
  };

  useEffect(() => {
    cargarEtiquetas();
     
  }, []);

  const actualizarFiltro = useCallback((
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...FILTROS_INICIALES });
  }, []);

  const etiquetasFiltradas = useMemo(() => {
    if (!filtros.nombre.trim()) return etiquetas;
    const term = filtros.nombre.toLowerCase().trim();
    return etiquetas.filter(e => e.nombre.toLowerCase().includes(term));
  }, [etiquetas, filtros]);

  const iniciarEdicion = useCallback((etiqueta: Etiqueta) => {
    setEtiquetaEditando(etiqueta);
    setModoCrear(false);
  }, []);

  const iniciarCreacion = useCallback(() => {
    setEtiquetaEditando({ id: 0, nombre: '' });
    setModoCrear(true);
  }, []);

  const guardarEdicion = async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      if (modoCrear) {
        await apiClient.post(ENDPOINTS.ETIQUETAS.BASE, { nombre: datos.nombre });
      } else {
        await apiClient.put(ENDPOINTS.ETIQUETAS.BY_ID(String(datos.id)), { nombre: datos.nombre });
      }
      await cargarEtiquetas();
      setEtiquetaEditando(null);
      setModoCrear(false);
      queryClient.invalidateQueries({ queryKey: ['opciones'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al guardar la etiqueta';
      console.error('[ETIQUETAS] Error al guardar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cancelarEdicion = useCallback(() => {
    setEtiquetaEditando(null);
    setModoCrear(false);
  }, []);

  const solicitarEliminar = useCallback((etiqueta: Etiqueta) => {
    setEtiquetaEliminar(etiqueta);
  }, []);

  const confirmarEliminar = async (): Promise<boolean> => {
    if (!etiquetaEliminar) return false;
    setCargando(true);
    try {
      await apiClient.delete(ENDPOINTS.ETIQUETAS.BY_ID(String(etiquetaEliminar.id)));
      await cargarEtiquetas();
      setEtiquetaEliminar(null);
      queryClient.invalidateQueries({ queryKey: ['opciones'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al eliminar la etiqueta';
      console.error('[ETIQUETAS] Error al eliminar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cancelarEliminar = useCallback(() => {
    setEtiquetaEliminar(null);
  }, []);

  return {
    etiquetas: etiquetasFiltradas,
    filtros,
    etiquetaEditando,
    etiquetaEliminar,
    cargando,
    cargandoInicial,
    modoCrear,

    actualizarFiltro,
    limpiarFiltros,
    iniciarEdicion,
    iniciarCreacion,
    guardarEdicion,
    cancelarEdicion,
    solicitarEliminar,
    confirmarEliminar,
    cancelarEliminar,
  };
}

/* ======================================
   hooks/useGestionPlantillas.ts
   Hook para administrar plantillas predefinidas de reportes
   Conectado al backend real (/api/plantillas)
   ====================================== */

import { useState, useMemo, useCallback, useEffect } from 'react';
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import queryClient from '@/lib/queryClient';
import type { Plantilla, FiltrosPlantillas } from '../types';

const FILTROS_INICIALES: FiltrosPlantillas = {
  nombre: '',
  descripcion: '',
};

export function useGestionPlantillas() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [filtros, setFiltros] = useState<FiltrosPlantillas>({ ...FILTROS_INICIALES });
  const [plantillaEditando, setPlantillaEditando] = useState<Plantilla | null>(null);
  const [modoCrear, setModoCrear] = useState(false);
  const [plantillaEliminar, setPlantillaEliminar] = useState<Plantilla | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  const cargarPlantillas = async () => {
    try {
      setCargandoInicial(true);
      const { data } = await apiClient.get(ENDPOINTS.PLANTILLAS.BASE);
      setPlantillas(data);
    } catch (error) {
      console.error('[PLANTILLAS] Error al cargar:', error);
    } finally {
      setCargandoInicial(false);
    }
  };

  useEffect(() => {
    cargarPlantillas();
     
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

  const plantillasFiltradas = useMemo(() => {
    let resultado = [...plantillas];

    if (filtros.nombre.trim()) {
      const term = filtros.nombre.toLowerCase().trim();
      resultado = resultado.filter(p => p.nombre.toLowerCase().includes(term));
    }
    if (filtros.descripcion.trim()) {
      const term = filtros.descripcion.toLowerCase().trim();
      resultado = resultado.filter(p => p.descripcion?.toLowerCase().includes(term));
    }

    return resultado;
  }, [plantillas, filtros]);

  const iniciarEdicion = useCallback((plantilla: Plantilla) => {
    setPlantillaEditando(plantilla);
    setModoCrear(false);
  }, []);

  const iniciarCreacion = useCallback(() => {
    setPlantillaEditando({
      id: 0, nombre: '', descripcion: '', equipo: '',
      descripcionFalla: '', trabajoRealizado: '',
      estado: null, etiqueta: null,
    });
    setModoCrear(true);
  }, []);

  const guardarEdicion = async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      const payload = {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        equipo: datos.equipo,
        descripcionFalla: datos.descripcionFalla,
        trabajoRealizado: datos.trabajoRealizado,
        estadoId: datos.estadoId || datos.estado?.id,
        etiquetaId: datos.etiquetaId || datos.etiqueta?.id,
      };

      if (modoCrear) {
        await apiClient.post(ENDPOINTS.PLANTILLAS.BASE, payload);
      } else {
        await apiClient.put(ENDPOINTS.PLANTILLAS.BY_ID(String(datos.id)), payload);
      }
      await cargarPlantillas();
      setPlantillaEditando(null);
      setModoCrear(false);
      queryClient.invalidateQueries({ queryKey: ['opciones'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al guardar la plantilla';
      console.error('[PLANTILLAS] Error al guardar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cancelarEdicion = useCallback(() => {
    setPlantillaEditando(null);
    setModoCrear(false);
  }, []);

  const solicitarEliminar = useCallback((plantilla: Plantilla) => {
    setPlantillaEliminar(plantilla);
  }, []);

  const confirmarEliminar = async (): Promise<boolean> => {
    if (!plantillaEliminar) return false;
    setCargando(true);
    try {
      await apiClient.delete(ENDPOINTS.PLANTILLAS.BY_ID(String(plantillaEliminar.id)));
      await cargarPlantillas();
      setPlantillaEliminar(null);
      queryClient.invalidateQueries({ queryKey: ['opciones'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al eliminar la plantilla';
      console.error('[PLANTILLAS] Error al eliminar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cancelarEliminar = useCallback(() => {
    setPlantillaEliminar(null);
  }, []);

  return {
    plantillas: plantillasFiltradas,
    filtros,
    plantillaEditando,
    plantillaEliminar,
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

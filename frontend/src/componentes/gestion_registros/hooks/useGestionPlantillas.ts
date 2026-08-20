/* ======================================
   hooks/useGestionPlantillas.ts
   Hook para administrar plantillas predefinidas de reportes
   ====================================== */

import { useState, useMemo, useCallback } from 'react';
import { PLANTILLAS } from '@/data/plantillas';
import type { Plantilla } from '@/data/plantillas';
import type { FiltrosPlantillas } from '../types';

const FILTROS_INICIALES: FiltrosPlantillas = {
  nombre: '',
  descripcion: '',
};

/** Plantilla para nueva plantilla */
const PLANTILLA_VACIA: Plantilla = {
  id: '',
  nombre: '',
  descripcion: '',
  equipo: '',
  descripcionFalla: '',
  trabajoRealizado: '',
  posibleCausa: '',
  anotaciones: '',
  declaracion: '',
  etiquetasPredefinidas: [],
};

let siguienteId = PLANTILLAS.length + 1;

export function useGestionPlantillas() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>(PLANTILLAS);
  const [filtros, setFiltros] = useState<FiltrosPlantillas>({ ...FILTROS_INICIALES });
  const [plantillaEditando, setPlantillaEditando] = useState<Plantilla | null>(null);
  const [modoCrear, setModoCrear] = useState(false);
  const [plantillaEliminar, setPlantillaEliminar] = useState<Plantilla | null>(null);
  const [cargando, setCargando] = useState(false);

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
    setPlantillaEditando({ ...PLANTILLA_VACIA, id: `PLT-NEW-${siguienteId++}` });
    setModoCrear(true);
  }, []);

  const guardarEdicion = useCallback(async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (modoCrear) {
        setPlantillas(prev => [...prev, datos as Plantilla]);
      } else {
        setPlantillas(prev =>
          prev.map(p =>
            p.id === datos.id
              ? ({ ...p, ...datos } as Plantilla)
              : p
          )
        );
      }
      setPlantillaEditando(null);
      setModoCrear(false);
      return true;
    } finally {
      setCargando(false);
    }
  }, [modoCrear]);

  const cancelarEdicion = useCallback(() => {
    setPlantillaEditando(null);
    setModoCrear(false);
  }, []);

  const solicitarEliminar = useCallback((plantilla: Plantilla) => {
    setPlantillaEliminar(plantilla);
  }, []);

  const confirmarEliminar = useCallback(async (): Promise<boolean> => {
    if (!plantillaEliminar) return false;
    setCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPlantillas(prev => prev.filter(p => p.id !== plantillaEliminar.id));
      setPlantillaEliminar(null);
      return true;
    } finally {
      setCargando(false);
    }
  }, [plantillaEliminar]);

  const cancelarEliminar = useCallback(() => {
    setPlantillaEliminar(null);
  }, []);

  return {
    plantillas: plantillasFiltradas,
    filtros,
    plantillaEditando,
    plantillaEliminar,
    cargando,
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
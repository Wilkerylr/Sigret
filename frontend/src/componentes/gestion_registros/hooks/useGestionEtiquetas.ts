/* ======================================
   hooks/useGestionEtiquetas.ts
   Hook para gestionar el sistema de etiquetas (tags)
   ====================================== */

import { useState, useMemo, useCallback } from 'react';
import { ETIQUETAS } from '@/data/etiquetas';
import type { Etiqueta } from '@/data/etiquetas';
import type { FiltrosEtiquetas } from '../types';

const FILTROS_INICIALES: FiltrosEtiquetas = {
  nombre: '',
};

/** Plantilla para nueva etiqueta */
const ETIQUETA_VACIA: Etiqueta = {
  id: '',
  nombre: '',
  color: '#3b82f6',
  descripcion: '',
};

let siguienteId = ETIQUETAS.length + 1;

export function useGestionEtiquetas() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>(ETIQUETAS);
  const [filtros, setFiltros] = useState<FiltrosEtiquetas>({ ...FILTROS_INICIALES });
  const [etiquetaEditando, setEtiquetaEditando] = useState<Etiqueta | null>(null);
  const [modoCrear, setModoCrear] = useState(false);
  const [etiquetaEliminar, setEtiquetaEliminar] = useState<Etiqueta | null>(null);
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

  const etiquetasFiltradas = useMemo(() => {
    let resultado = [...etiquetas];

    if (filtros.nombre.trim()) {
      const term = filtros.nombre.toLowerCase().trim();
      resultado = resultado.filter(e => e.nombre.toLowerCase().includes(term));
    }

    return resultado;
  }, [etiquetas, filtros]);

  const iniciarEdicion = useCallback((etiqueta: Etiqueta) => {
    setEtiquetaEditando(etiqueta);
    setModoCrear(false);
  }, []);

  const iniciarCreacion = useCallback(() => {
    setEtiquetaEditando({ ...ETIQUETA_VACIA, id: `ETQ-NEW-${siguienteId++}` });
    setModoCrear(true);
  }, []);

  const guardarEdicion = useCallback(async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (modoCrear) {
        setEtiquetas(prev => [...prev, datos as Etiqueta]);
      } else {
        setEtiquetas(prev =>
          prev.map(e =>
            e.id === datos.id
              ? ({ ...e, ...datos } as Etiqueta)
              : e
          )
        );
      }
      setEtiquetaEditando(null);
      setModoCrear(false);
      return true;
    } finally {
      setCargando(false);
    }
  }, [modoCrear]);

  const cancelarEdicion = useCallback(() => {
    setEtiquetaEditando(null);
    setModoCrear(false);
  }, []);

  const solicitarEliminar = useCallback((etiqueta: Etiqueta) => {
    setEtiquetaEliminar(etiqueta);
  }, []);

  const confirmarEliminar = useCallback(async (): Promise<boolean> => {
    if (!etiquetaEliminar) return false;
    setCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEtiquetas(prev => prev.filter(e => e.id !== etiquetaEliminar.id));
      setEtiquetaEliminar(null);
      return true;
    } finally {
      setCargando(false);
    }
  }, [etiquetaEliminar]);

  const cancelarEliminar = useCallback(() => {
    setEtiquetaEliminar(null);
  }, []);

  return {
    etiquetas: etiquetasFiltradas,
    filtros,
    etiquetaEditando,
    etiquetaEliminar,
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
/* ======================================
   hooks/useGestionClientes.ts
   Hook para consultar, crear y editar datos de clientes
   ====================================== */

import { useState, useMemo, useCallback } from 'react';
import { CLIENTES } from '@/data/clientes';
import type { Cliente } from '@/data/clientes';
import type { FiltrosClientes } from '../types';

const FILTROS_INICIALES: FiltrosClientes = {
  nombre: '',
  rif: '',
  telefono: '',
};

/** Plantilla para nuevo cliente */
const CLIENTE_VACIO: Cliente = {
  id: '',
  nombre: '',
  rif: '',
  telefono: '',
  direccion: '',
  email: '',
};

let siguienteId = CLIENTES.length + 1;

export function useGestionClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(CLIENTES);
  const [filtros, setFiltros] = useState<FiltrosClientes>({ ...FILTROS_INICIALES });
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [modoCrear, setModoCrear] = useState(false);
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

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes];

    if (filtros.nombre.trim()) {
      const term = filtros.nombre.toLowerCase().trim();
      resultado = resultado.filter(c => c.nombre.toLowerCase().includes(term));
    }
    if (filtros.rif.trim()) {
      const term = filtros.rif.toLowerCase().trim();
      resultado = resultado.filter(c => c.rif?.toLowerCase().includes(term));
    }
    if (filtros.telefono.trim()) {
      const term = filtros.telefono.toLowerCase().trim();
      resultado = resultado.filter(c => c.telefono?.toLowerCase().includes(term));
    }

    return resultado;
  }, [clientes, filtros]);

  const iniciarEdicion = useCallback((cliente: Cliente) => {
    setClienteEditando(cliente);
    setModoCrear(false);
  }, []);

  const iniciarCreacion = useCallback(() => {
    setClienteEditando({ ...CLIENTE_VACIO, id: `CLI-NEW-${siguienteId++}` });
    setModoCrear(true);
  }, []);

  const guardarEdicion = useCallback(async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (modoCrear) {
        setClientes(prev => [...prev, datos as Cliente]);
      } else {
        console.log('📝 Cliente actualizado:', datos);
      }
      setClienteEditando(null);
      setModoCrear(false);
      return true;
    } finally {
      setCargando(false);
    }
  }, [modoCrear]);

  const cancelarEdicion = useCallback(() => {
    setClienteEditando(null);
    setModoCrear(false);
  }, []);

  return {
    clientes: clientesFiltrados,
    filtros,
    clienteEditando,
    cargando,
    modoCrear,

    actualizarFiltro,
    limpiarFiltros,
    iniciarEdicion,
    iniciarCreacion,
    guardarEdicion,
    cancelarEdicion,
  };
}
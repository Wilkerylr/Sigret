/* ======================================
   hooks/useGestionClientes.ts
   Hook para consultar, crear y editar datos de clientes
   Conectado al backend real (/api/clientes)
   ====================================== */

import { useState, useMemo, useCallback, useEffect } from 'react';
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import queryClient from '@/lib/queryClient';
import type { Cliente, FiltrosClientes } from '../types';

const FILTROS_INICIALES: FiltrosClientes = {
  nombre: '',
  rif: '',
  telefono: '',
  estado: 'todos',
  ordenarPor: 'id',
  ordenDireccion: 'asc',
};

export function useGestionClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtros, setFiltros] = useState<FiltrosClientes>({ ...FILTROS_INICIALES });
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [modoCrear, setModoCrear] = useState(false);
  const [clienteEliminar, setClienteEliminar] = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [mostrarModalInactivos, setMostrarModalInactivos] = useState(false);
  const [cargandoLimpieza, setCargandoLimpieza] = useState(false);
  const [resultadoLimpieza, setResultadoLimpieza] = useState<{ eliminados: number; nombres: string[] } | null>(null);

  const cargarClientes = async () => {
    try {
      setCargandoInicial(true);
      const { data } = await apiClient.get(ENDPOINTS.CLIENTES.BASE);
      setClientes(data);
    } catch (error) {
      console.error('[CLIENTES] Error al cargar:', error);
    } finally {
      setCargandoInicial(false);
    }
  };

  // Cargar clientes al montar
  useEffect(() => {
    cargarClientes();
     
  }, []);

  const actualizarFiltro = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFiltro = useCallback((name: string, value: string) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
  }, []);

  const toggleOrden = useCallback(() => {
    setFiltros(prev => ({
      ...prev,
      ordenDireccion: prev.ordenDireccion === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...FILTROS_INICIALES });
  }, []);

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes];

    // Excluir inactivos por defecto (a menos que se pida mostrarlos)
    if (!mostrarInactivos) {
      resultado = resultado.filter(c => c.activo);
    }

    // Filtro por estado (solo aplica cuando se muestran inactivos)
    if (filtros.estado === 'activos') {
      resultado = resultado.filter(c => c.activo);
    } else if (filtros.estado === 'inactivos') {
      resultado = resultado.filter(c => !c.activo);
    }

    // Filtros de texto
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

    // Orden
    const dir = filtros.ordenDireccion === 'asc' ? 1 : -1;
    if (filtros.ordenarPor === 'nombre') {
      resultado.sort((a, b) => dir * a.nombre.localeCompare(b.nombre));
    } else {
      resultado.sort((a, b) => dir * (a.id - b.id));
    }

    return resultado;
  }, [clientes, filtros, mostrarInactivos]);

  const iniciarEdicion = useCallback((cliente: Cliente) => {
    setClienteEditando(cliente);
    setModoCrear(false);
  }, []);

  const iniciarCreacion = useCallback(() => {
    setClienteEditando({ id: 0, nombre: '', rif: '', telefono: '', direccion: '', email: '', activo: true });
    setModoCrear(true);
  }, []);

  const guardarEdicion = async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      const nombreLimpio = datos.nombre?.trim();
      const rif = datos.rif ? String(datos.rif).trim().toUpperCase() : null;
      const telefono = datos.telefono ? String(datos.telefono).trim().replace(/\s+/g, ' ') : null;

      // Validación local de unicidad antes de enviar al backend
      const clienteIdActual = modoCrear ? null : Number(datos.id);
      const duplicadoNombre = clientes.some(
        c => c.id !== clienteIdActual && c.nombre.toLowerCase() === nombreLimpio.toLowerCase()
      );
      if (duplicadoNombre) {
        console.error('[CLIENTES] Nombre duplicado:', nombreLimpio);
        return false;
      }
      if (rif) {
        const duplicadoRif = clientes.some(
          c => c.id !== clienteIdActual && c.rif?.toUpperCase() === rif
        );
        if (duplicadoRif) {
          console.error('[CLIENTES] RIF duplicado:', rif);
          return false;
        }
      }

      if (modoCrear) {
        await apiClient.post(ENDPOINTS.CLIENTES.BASE, {
          nombre: datos.nombre?.trim(),
          rif,
          telefono,
          direccion: datos.direccion?.trim() || null,
          email: datos.email?.trim().toLowerCase() || null,
        });
      } else {
        await apiClient.put(ENDPOINTS.CLIENTES.BY_ID(String(datos.id)), {
          nombre: datos.nombre?.trim(),
          rif,
          telefono,
          direccion: datos.direccion?.trim() || null,
          email: datos.email?.trim().toLowerCase() || null,
        });
      }
      await cargarClientes();
      setClienteEditando(null);
      setModoCrear(false);
      queryClient.invalidateQueries({ queryKey: ['opciones'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al guardar el cliente';
      console.error('[CLIENTES] Error al guardar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cancelarEdicion = useCallback(() => {
    setClienteEditando(null);
    setModoCrear(false);
  }, []);

  const solicitarEliminar = useCallback((cliente: Cliente) => {
    setClienteEliminar(cliente);
  }, []);

  const confirmarEliminar = async (): Promise<boolean> => {
    if (!clienteEliminar) return false;
    setCargando(true);
    try {
      await apiClient.delete(ENDPOINTS.CLIENTES.BY_ID(String(clienteEliminar.id)));
      await cargarClientes();
      setClienteEliminar(null);
      queryClient.invalidateQueries({ queryKey: ['opciones'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al desactivar el cliente';
      console.error('[CLIENTES] Error al desactivar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cancelarEliminar = useCallback(() => {
    setClienteEliminar(null);
  }, []);

  const toggleMostrarInactivos = useCallback(() => {
    setMostrarInactivos(prev => !prev);
  }, []);

  const solicitarLimpiezaInactivos = useCallback(() => {
    setMostrarModalInactivos(true);
    setResultadoLimpieza(null);
  }, []);

  const cancelarLimpiezaInactivos = useCallback(() => {
    setMostrarModalInactivos(false);
    setResultadoLimpieza(null);
  }, []);

  const ejecutarLimpiezaInactivos = async (): Promise<boolean> => {
    setCargandoLimpieza(true);
    try {
      const { data } = await apiClient.delete(ENDPOINTS.CLIENTES.LIMPIEZA);
      setResultadoLimpieza({ eliminados: data.eliminados, nombres: data.nombres });
      if (data.eliminados > 0) {
        await cargarClientes();
        queryClient.invalidateQueries({ queryKey: ['opciones'] });
        queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      }
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al eliminar clientes inactivos';
      console.error('[CLIENTES] Error en limpieza:', msg);
      return false;
    } finally {
      setCargandoLimpieza(false);
    }
  };

  const recuperar = async (id: string): Promise<boolean> => {
    setCargando(true);
    try {
      await apiClient.patch(ENDPOINTS.CLIENTES.RESTORE(id));
      await cargarClientes();
      queryClient.invalidateQueries({ queryKey: ['opciones'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al reactivar el cliente';
      console.error('[CLIENTES] Error al reactivar:', msg);
      return false;
    } finally {
      setCargando(false);
    }
  };

  return {
    clientes: clientesFiltrados,
    filtros,
    clienteEditando,
    clienteEliminar,
    cargando,
    cargandoInicial,
    modoCrear,
    mostrarInactivos,
    mostrarModalInactivos,
    cargandoLimpieza,
    resultadoLimpieza,

    actualizarFiltro,
    setFiltro,
    toggleOrden,
    limpiarFiltros,
    toggleMostrarInactivos,
    solicitarLimpiezaInactivos,
    cancelarLimpiezaInactivos,
    ejecutarLimpiezaInactivos,
    iniciarEdicion,
    iniciarCreacion,
    guardarEdicion,
    cancelarEdicion,
    solicitarEliminar,
    confirmarEliminar,
    cancelarEliminar,
    recuperar,
  };
}

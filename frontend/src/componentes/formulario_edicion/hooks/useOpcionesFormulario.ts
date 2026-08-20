/* ======================================
   hooks/useOpcionesFormulario.ts
   Opciones para el formulario de edición obtenidas desde la API real
   ====================================== */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface OpcionFormulario {
  value: string;
  label: string;
}

export interface OpcionesFormulario {
  clientes: OpcionFormulario[];
  repuestos: OpcionFormulario[];
  etiquetas: OpcionFormulario[];
  tecnicos: OpcionFormulario[];
  plantillas: OpcionFormulario[];
  estados: OpcionFormulario[];
}

export interface PlantillaDataFormulario {
  id: number;
  nombre: string;
  descripcion?: string;
  equipo?: string;
  descripcionFalla?: string;
  trabajoRealizado?: string;
  estado?: { id: number; nombre: string } | null;
  etiqueta?: { id: number; nombre: string } | null;
}

interface ReferenciaItem {
  id: number;
  nombre?: string;
  nombre_cliente?: string;
  nombre_repuesto?: string;
  nombre_etiqueta?: string;
  nombre_usuario?: string;
  apellido_usuario?: string;
  activo?: boolean;
}

function toOpcion(item: ReferenciaItem): OpcionFormulario {
  const nombre = item.nombre
    || item.nombre_cliente
    || item.nombre_repuesto
    || item.nombre_etiqueta
    || [item.nombre_usuario, item.apellido_usuario].filter(Boolean).join(' ')
    || '';
  return { value: String(item.id), label: nombre };
}

function toOpcionSimple(item: ReferenciaItem): OpcionFormulario {
  return { value: String(item.id), label: item.nombre || '' };
}

export function useOpcionesFormulario() {
  const clientes = useQuery({
    queryKey: ['opciones-formulario', 'clientes'],
    queryFn: () =>
      apiClient
        .get<ReferenciaItem[]>('/clientes', { params: { activos: 'true' } })
        .then((r) => r.data.map(toOpcion)),
    staleTime: 5 * 60 * 1000,
  });

  const repuestos = useQuery({
    queryKey: ['opciones-formulario', 'repuestos'],
    queryFn: () =>
      apiClient
        .get<ReferenciaItem[]>('/repuestos', { params: { activos: 'true' } })
        .then((r) => r.data.map(toOpcion)),
    staleTime: 5 * 60 * 1000,
  });

  const etiquetas = useQuery({
    queryKey: ['opciones-formulario', 'etiquetas'],
    queryFn: () =>
      apiClient
        .get<ReferenciaItem[]>('/etiquetas')
        .then((r) => r.data.map(toOpcion)),
    staleTime: 5 * 60 * 1000,
  });

  const tecnicos = useQuery({
    queryKey: ['opciones-formulario', 'tecnicos'],
    queryFn: () =>
      apiClient
        .get<ReferenciaItem[]>('/usuarios')
        .then((r) =>
          r.data.filter((u) => u.activo !== false).map(toOpcion),
        ),
    staleTime: 5 * 60 * 1000,
  });

  const plantillas = useQuery({
    queryKey: ['opciones-formulario', 'plantillas'],
    queryFn: () =>
      apiClient
        .get<ReferenciaItem[]>('/plantillas')
        .then((r) => r.data.map(toOpcionSimple)),
    staleTime: 5 * 60 * 1000,
  });

  const plantillasRaw = useQuery({
    queryKey: ['opciones-formulario', 'plantillas-raw'],
    queryFn: () => apiClient.get<PlantillaDataFormulario[]>('/plantillas').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const estados = useQuery({
    queryKey: ['opciones-formulario', 'estados'],
    queryFn: () =>
      apiClient
        .get<ReferenciaItem[]>('/estados-equipos')
        .then((r) => r.data.map(toOpcion)),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    clientes.isLoading || repuestos.isLoading || etiquetas.isLoading ||
    tecnicos.isLoading || plantillas.isLoading || estados.isLoading;

  const error =
    clientes.error || repuestos.error || etiquetas.error ||
    tecnicos.error || plantillas.error || estados.error;

  return {
    isLoading,
    error,
    opciones: {
      clientes: clientes.data || [],
      repuestos: repuestos.data || [],
      etiquetas: etiquetas.data || [],
      tecnicos: tecnicos.data || [],
      plantillas: plantillas.data || [],
      estados: estados.data || [],
    } as OpcionesFormulario,
    plantillasData: plantillasRaw.data || [],
  };
}

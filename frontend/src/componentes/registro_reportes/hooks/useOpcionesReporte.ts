import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import type { Opcion } from '../constants/opciones';

interface ReferenciaItem {
  id: number;
  nombre?: string;
  nombre_cliente?: string;
  nombre_repuesto?: string;
  nombre_etiqueta?: string;
  nombre_usuario?: string;
  apellido_usuario?: string;
}

function toOpcion(item: ReferenciaItem): Opcion {
  const nombre = item.nombre
    || item.nombre_cliente
    || item.nombre_repuesto
    || item.nombre_etiqueta
    || [item.nombre_usuario, item.apellido_usuario].filter(Boolean).join(' ')
    || '';
  return { value: String(item.id), label: nombre };
}

function toOpcionPlantilla(item: any): Opcion {
  return { value: String(item.id), label: item.nombre || '' };
}

export interface OpcionesReporte {
  clientes: Opcion[];
  repuestos: Opcion[];
  etiquetas: Opcion[];
  tecnicos: Opcion[];
  plantillas: Opcion[];
  estados: Opcion[];
}

export interface PlantillaData {
  id: number;
  nombre: string;
  descripcion?: string;
  equipo?: string;
  descripcionFalla?: string;
  trabajoRealizado?: string;
  estado?: { id: number; nombre: string } | null;
  etiqueta?: { id: number; nombre: string } | null;
}

export function useOpcionesReporte() {
  const clientes = useQuery({
    queryKey: ['opciones', 'clientes'],
    queryFn: () =>
      apiClient.get<ReferenciaItem[]>('/clientes', { params: { activos: 'true' } })
        .then(r => r.data.map(toOpcion)),
    staleTime: 5 * 60 * 1000,
  });

  const repuestos = useQuery({
    queryKey: ['opciones', 'repuestos'],
    queryFn: () =>
      apiClient.get<ReferenciaItem[]>('/repuestos', { params: { activos: 'true' } })
        .then(r => r.data.map(toOpcion)),
    staleTime: 5 * 60 * 1000,
  });

  const etiquetas = useQuery({
    queryKey: ['opciones', 'etiquetas'],
    queryFn: () =>
      apiClient.get<ReferenciaItem[]>('/etiquetas')
        .then(r => r.data.map(toOpcion)),
    staleTime: 5 * 60 * 1000,
  });

  const tecnicos = useQuery({
    queryKey: ['opciones', 'tecnicos'],
    queryFn: () =>
      apiClient.get<any[]>('/usuarios')
        .then(r => r.data
          .filter((u: any) => u.activo !== false)
          .map(toOpcion)
        ),
    staleTime: 5 * 60 * 1000,
  });

  const plantillasOpt = useQuery({
    queryKey: ['opciones', 'plantillas'],
    queryFn: () =>
      apiClient.get<any[]>('/plantillas')
        .then(r => r.data.map(toOpcionPlantilla)),
    staleTime: 5 * 60 * 1000,
  });

  const plantillasRaw = useQuery({
    queryKey: ['opciones', 'plantillas-raw'],
    queryFn: () =>
      apiClient.get<PlantillaData[]>('/plantillas').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const estados = useQuery({
    queryKey: ['opciones', 'estados'],
    queryFn: () =>
      apiClient.get<ReferenciaItem[]>('/estados-equipos')
        .then(r => r.data.map(toOpcion)),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = clientes.isLoading || repuestos.isLoading
    || etiquetas.isLoading || tecnicos.isLoading
    || plantillasOpt.isLoading || estados.isLoading;

  const error = clientes.error || repuestos.error || etiquetas.error
    || tecnicos.error || plantillasOpt.error || estados.error;

  return {
    isLoading,
    error,
    opciones: {
      clientes: clientes.data || [],
      repuestos: repuestos.data || [],
      etiquetas: etiquetas.data || [],
      tecnicos: tecnicos.data || [],
      plantillas: plantillasOpt.data || [],
      estados: estados.data || [],
    } as OpcionesReporte,
    plantillasData: plantillasRaw.data || [],
  };
}

/* ======================================
   hooks/useOpcionesBusqueda.ts
   Opciones para los filtros de búsqueda obtenidas desde la API real
   ====================================== */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import type { OpcionCombobox } from '../types';

interface ItemOpcion {
  id: number;
  nombre?: string;
  nombre_usuario?: string;
  apellido_usuario?: string;
  activo?: boolean;
}

function conPlaceholder(opciones: OpcionCombobox[], placeholder: string): OpcionCombobox[] {
  return [{ value: '', label: placeholder }, ...opciones];
}

function aOpcion(nombre: string | undefined): OpcionCombobox | null {
  const texto = (nombre || '').trim();
  return texto ? { value: texto, label: texto } : null;
}

export function useOpcionesBusqueda() {
  const etiquetas = useQuery({
    queryKey: ['opciones-busqueda', 'etiquetas'],
    queryFn: () =>
      apiClient.get<ItemOpcion[]>('/etiquetas').then((r) =>
        r.data.map((item) => aOpcion(item.nombre)).filter((o): o is OpcionCombobox => o !== null),
      ),
    staleTime: 5 * 60 * 1000,
  });

  const tecnicos = useQuery({
    queryKey: ['opciones-busqueda', 'tecnicos'],
    queryFn: () =>
      apiClient.get<ItemOpcion[]>('/usuarios').then((r) =>
        r.data
          .filter((u) => u.activo !== false)
          .map((u) => aOpcion([u.nombre_usuario, u.apellido_usuario].filter(Boolean).join(' ')))
          .filter((o): o is OpcionCombobox => o !== null),
      ),
    staleTime: 5 * 60 * 1000,
  });

  const repuestos = useQuery({
    queryKey: ['opciones-busqueda', 'repuestos'],
    queryFn: () =>
      apiClient
        .get<ItemOpcion[]>('/repuestos', { params: { activos: 'true' } })
        .then((r) =>
          r.data.map((item) => aOpcion(item.nombre)).filter((o): o is OpcionCombobox => o !== null),
        ),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = etiquetas.isLoading || tecnicos.isLoading || repuestos.isLoading;
  const error = etiquetas.error || tecnicos.error || repuestos.error;

  return {
    isLoading,
    error,
    etiquetas: conPlaceholder(etiquetas.data || [], 'Todas las etiquetas'),
    tecnicos: conPlaceholder(tecnicos.data || [], 'Todos los técnicos'),
    repuestos: conPlaceholder(repuestos.data || [], 'Todos los repuestos'),
  };
}

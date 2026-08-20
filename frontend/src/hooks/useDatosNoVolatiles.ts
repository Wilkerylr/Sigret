import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

const STALE_TIME = 30 * 60 * 1000; // 30 min — datos que casi no cambian
const GC_TIME = 60 * 60 * 1000;    // 1 hora — mantener en memoria

// ============================================================
// Clientes
// ============================================================
export function useClientes(activos = false) {
  return useQuery({
    queryKey: ["datos", "clientes", { activos }],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.CLIENTES.BASE, {
        params: activos ? { activos: true } : {},
      });
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

// ============================================================
// Etiquetas
// ============================================================
export function useEtiquetas() {
  return useQuery({
    queryKey: ["datos", "etiquetas"],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.ETIQUETAS.BASE);
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

// ============================================================
// Estados de equipos
// ============================================================
export function useEstados() {
  return useQuery({
    queryKey: ["datos", "estados"],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.ESTADOS_EQUIPOS.BASE);
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

// ============================================================
// Plantillas
// ============================================================
export function usePlantillas() {
  return useQuery({
    queryKey: ["datos", "plantillas"],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.PLANTILLAS.BASE);
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

// ============================================================
// Repuestos
// ============================================================
export function useRepuestos() {
  return useQuery({
    queryKey: ["datos", "repuestos"],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.REPUESTOS.BASE, {
        params: { activos: true },
      });
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

// ============================================================
// Usuarios (técnico/empleados)
// ============================================================
export function useUsuarios() {
  return useQuery({
    queryKey: ["datos", "usuarios"],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.USUARIOS.BASE);
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

// ============================================================
// Roles
// ============================================================
export function useRoles() {
  return useQuery({
    queryKey: ["datos", "roles"],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.USUARIOS.ROLES);
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

// ============================================================
// Preguntas de seguridad
// ============================================================
export function usePreguntasSeguridad() {
  return useQuery({
    queryKey: ["datos", "preguntas-seguridad"],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.AUTH.PREGUNTAS_SEGURIDAD);
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

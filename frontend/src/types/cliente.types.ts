/**
 * Tipos para el módulo de Clientes
 */
export interface Cliente {
  id: string;
  nombre: string;
  rif?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
}

export interface CreateClienteRequest {
  nombre: string;
  rif?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
}

export type UpdateClienteRequest = Partial<CreateClienteRequest>;
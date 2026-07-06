export interface Equipo {
  id: string;
  nombre: string;
}

export interface CreateEquipoRequest {
  nombre: string;
}

export type UpdateEquipoRequest = Partial<CreateEquipoRequest>;
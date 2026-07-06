export interface Tecnico {
  id: string;
  nombre: string;
  telefono?: string;
}

export interface CreateTecnicoRequest {
  nombre: string;
  telefono?: string;
}

export type UpdateTecnicoRequest = Partial<CreateTecnicoRequest>;
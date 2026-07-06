export interface RepuestoItem {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface CreateRepuestoRequest {
  nombre: string;
  descripcion?: string;
}

export type UpdateRepuestoRequest = Partial<CreateRepuestoRequest>;
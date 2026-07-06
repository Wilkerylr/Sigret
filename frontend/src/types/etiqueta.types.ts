export interface Etiqueta {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface CreateEtiquetaRequest {
  nombre: string;
  descripcion?: string;
}

export type UpdateEtiquetaRequest = Partial<CreateEtiquetaRequest>;
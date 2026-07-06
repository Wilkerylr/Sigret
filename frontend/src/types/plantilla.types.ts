export interface Plantilla {
  id: string;
  nombre: string;
  descripcion?: string;
  camposPredefinidos?: string[];
  etiquetasPredefinidas?: string[];
}

export interface CreatePlantillaRequest {
  nombre: string;
  descripcion?: string;
  camposPredefinidos?: string[];
  etiquetasPredefinidas?: string[];
}

export type UpdatePlantillaRequest = Partial<CreatePlantillaRequest>;
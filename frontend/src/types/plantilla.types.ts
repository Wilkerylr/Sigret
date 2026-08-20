export interface Plantilla {
  id: string;
  nombre: string;
  /** Descripción de la plantilla */
  descripcion?: string;
  /** Equipo predeterminado (opcional) */
  equipo?: string;
  /** Texto predefinido para descripción de la falla */
  descripcionFalla?: string;
  /** Texto predefinido para trabajo realizado */
  trabajoRealizado?: string;
  /** Texto predefinido para posible causa */
  posibleCausa?: string;
  /** Anotaciones predefinidas */
  anotaciones?: string;
  /** Estado predeterminado: 'operativo' | 'inoperativo' */
  declaracion?: string;
  /** Etiquetas predefinidas que se agregarán automáticamente */
  etiquetasPredefinidas?: string[];
}

export interface CreatePlantillaRequest {
  nombre: string;
  descripcion?: string;
  equipo?: string;
  descripcionFalla?: string;
  trabajoRealizado?: string;
  posibleCausa?: string;
  anotaciones?: string;
  declaracion?: string;
  etiquetasPredefinidas?: string[];
}

export type UpdatePlantillaRequest = Partial<CreatePlantillaRequest>;

export interface Opcion {
  value: string;
  label: string;
}

export const CAMPOS_REQUERIDOS: Array<keyof import('../types').FormReporteData> = [
  'cliente',
  'descripcionFalla',
  'trabajoRealizado',
  'equipo',
  'declaracion',
  'numeroReporte',
  'fechaReporte',
  'fechaAtencion',
  'horaInicio',
  'horaFinalizacion',
];

// Constantes para las opciones de los selects en el formulario

export const CLIENTES = [
  { value: '', label: 'Selecciona un cliente' },
  { value: 'cliente1', label: 'Cliente 1' },
  { value: 'cliente2', label: 'Cliente 2' },
  { value: 'cliente3', label: 'Cliente 3' },
];

export const REPUESTOS = [
  { value: '', label: 'Selecciona los repuestos empleados' },
  { value: 'repuesto1', label: 'Repuesto 1' },
  { value: 'repuesto2', label: 'Repuesto 2' },
  { value: 'repuesto3', label: 'Repuesto 3' },
];

export const ETIQUETAS = [
  { value: '', label: 'Seleccione las etiquetas correspondientes' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'reparacion', label: 'Reparación' },
  { value: 'inspeccion', label: 'Inspección' },
  { value: 'mantenimiento_esporadico', label: 'Mantenimiento esporádico' },
];

export const TECNICOS = [
  { value: '', label: 'Seleccione los técnicos correspondientes' },
  { value: 'tecnico1', label: 'Técnico 1' },
  { value: 'tecnico2', label: 'Técnico 2' },
  { value: 'tecnico3', label: 'Técnico 3' },
];

export const PLANTILLAS = [
  { value: '', label: 'Selecciona una plantilla' },
  { value: 'plantilla1', label: 'Plantilla 1' },
  { value: 'plantilla2', label: 'Plantilla 2' },
  { value: 'plantilla3', label: 'Plantilla 3' },
];

export const DECLARACIONES = [
  { value: 'operativo', label: 'Operativo' },
  { value: 'inoperativo', label: 'Inoperativo' },
  { value: 'no aplica', label: 'No aplica' },
  { value: 'operativo bajo observacion', label: 'Operativo, bajo observación' },
];

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
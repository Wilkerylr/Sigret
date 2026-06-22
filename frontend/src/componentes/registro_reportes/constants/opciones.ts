// Constantes para las opciones de los selects en el formulario

export const CLIENTES = [
  { value: '', label: 'Selecciona un cliente' },
  { value: 'Admin 951', label: 'Admin 951' },
  { value: 'Parking paraiso', label: 'Parking paraiso' },
  { value: 'Admin maralva', label: 'Admin maralva' },
  { value: 'Condominio torre la noria', label: 'Condominio torre la noria' },
  { value: 'Altamira tennis club', label: 'Altamira tennis club' },
  { value: 'Inv kk 2002', label: 'Inv kk 2002' },
  { value: 'Admin omiwi', label: 'Admin omiwi' },
  { value: 'Inv clamarxui', label: 'Inv clamarxui' },
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
  { value: 'Victor', label: 'Victor' },
  { value: 'Wilker', label: 'Wilker' },
  { value: 'Alexis', label: 'Alexis' },
];

export const PLANTILLAS = [
  { value: '', label: 'Selecciona una plantilla' },
  { value: 'plantilla1', label: 'Mantenimiento' },
  { value: 'plantilla2', label: 'Inspección' },
  { value: 'plantilla3', label: 'Reparación' },
];

export const DECLARACIONES = [
  { value: 'operativo', label: 'Operativo' },
  { value: 'inoperativo', label: 'Inoperativo' },
  { value: 'no aplica', label: 'No aplica' },
  { value: 'operativo bajo observacion', label: 'Operativo, bajo observación' },
];

export const EMPLEADOS = [
  { value: 'Encargado1', label: 'Encargado 1' },
  { value: 'Encargado2', label: 'Encargado 2' },
  { value: 'Parkero1', label: 'Parkero1'}]

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
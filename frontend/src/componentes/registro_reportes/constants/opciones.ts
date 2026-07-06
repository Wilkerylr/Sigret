/**
 * Constantes para las opciones de los selects en el formulario
 * Re-exporta desde la fuente de datos centralizada en @/data
 *
 * Mantiene compatibilidad con el formato { value, label } esperado por los componentes
 */

import {
  NOMBRES_CLIENTES,
  NOMBRES_REPUESTOS,
  NOMBRES_ETIQUETAS,
  NOMBRES_TECNICOS,
  NOMBRES_PLANTILLAS,
  NOMBRES_DECLARACIONES,
  NOMBRES_EMPLEADOS,
} from '@/data';

/** Convierte un string a formato value-label */
const toOpcion = (nombre: string) => ({
  value: nombre.toLowerCase().replace(/\s+/g, '_'),
  label: nombre,
});

/** Convierte un array de nombres a opciones { value, label } para selects/comboboxes */
const nombresToOpciones = (nombres: string[], placeholderLabel: string) => [
  { value: '', label: placeholderLabel },
  ...nombres.map(toOpcion),
];

export const CLIENTES = nombresToOpciones(NOMBRES_CLIENTES, 'Selecciona un cliente');

export const REPUESTOS = nombresToOpciones(NOMBRES_REPUESTOS, 'Selecciona los repuestos empleados');

export const ETIQUETAS = nombresToOpciones(NOMBRES_ETIQUETAS, 'Seleccione las etiquetas correspondientes');

export const TECNICOS = nombresToOpciones(NOMBRES_TECNICOS, 'Seleccione los técnicos correspondientes');

export const PLANTILLAS = nombresToOpciones(NOMBRES_PLANTILLAS, 'Selecciona una plantilla');

export const DECLARACIONES = NOMBRES_DECLARACIONES.map(toOpcion);

export const EMPLEADOS = NOMBRES_EMPLEADOS.map(toOpcion);

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
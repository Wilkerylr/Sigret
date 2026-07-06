/**
 * constants/opcionesBusqueda.ts
 * Opciones para los filtros de búsqueda de reportes
 * Re-exporta desde la fuente de datos centralizada en @/data
 */

import { OpcionCombobox } from '../types';
import { NOMBRES_ETIQUETAS, NOMBRES_TECNICOS, NOMBRES_REPUESTOS } from '@/data';

const toOpcionConPlaceholder = (nombres: string[], placeholder: string): OpcionCombobox[] => [
  { value: '', label: placeholder },
  ...nombres.map((nombre) => ({ value: nombre, label: nombre })),
];

export const OPCIONES_ETIQUETAS: OpcionCombobox[] = toOpcionConPlaceholder(NOMBRES_ETIQUETAS, 'Todas las etiquetas');

export const OPCIONES_TECNICOS: OpcionCombobox[] = toOpcionConPlaceholder(NOMBRES_TECNICOS, 'Todos los técnicos');

export const OPCIONES_REPUESTOS: OpcionCombobox[] = toOpcionConPlaceholder(NOMBRES_REPUESTOS, 'Todos los repuestos');

export const OPCIONES_CANTIDAD_REPORTES: OpcionCombobox[] = [
  { value: '', label: 'Cualquier cantidad' },
  { value: '10', label: '10 reportes' },
  { value: '25', label: '25 reportes' },
  { value: '50', label: '50 reportes' },
  { value: '100', label: '100 reportes' },
];
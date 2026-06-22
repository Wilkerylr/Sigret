/* ======================================
   constants/opcionesBusqueda.ts
   Opciones para los filtros de búsqueda de reportes
   ====================================== */

import { OpcionCombobox } from '../types';

export const OPCIONES_ETIQUETAS: OpcionCombobox[] = [
  { value: '', label: 'Todas las etiquetas' },
  { value: 'Mantenimiento', label: 'Mantenimiento' },
  { value: 'Reparación', label: 'Reparación' },
  { value: 'Inspección', label: 'Inspección' },
  { value: 'Mantenimiento esporádico', label: 'Mantenimiento esporádico' },
];

export const OPCIONES_TECNICOS: OpcionCombobox[] = [
  { value: '', label: 'Todos los técnicos' },
  { value: 'Victor', label: 'Victor' },
  { value: 'Wilker', label: 'Wilker' },
  { value: 'Alexis', label: 'Alexis' },
];

export const OPCIONES_REPUESTOS: OpcionCombobox[] = [
  { value: '', label: 'Todos los repuestos' },
  { value: 'Batería', label: 'Batería' },
  { value: 'Disco Duro SSD', label: 'Disco Duro SSD' },
  { value: 'Memoria RAM', label: 'Memoria RAM' },
  { value: 'Fuente de Poder', label: 'Fuente de Poder' },
  { value: 'Ventilador', label: 'Ventilador' },
  { value: 'Cable HDMI', label: 'Cable HDMI' },
  { value: 'Teclado', label: 'Teclado' },
  { value: 'Mouse', label: 'Mouse' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Router', label: 'Router' },
];

export const OPCIONES_CANTIDAD_REPORTES: OpcionCombobox[] = [
  { value: '', label: 'Cualquier cantidad' },
  { value: '10', label: '10 reportes' },
  { value: '25', label: '25 reportes' },
  { value: '50', label: '50 reportes' },
  { value: '100', label: '100 reportes' },
];
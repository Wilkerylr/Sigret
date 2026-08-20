/**
 * constants/opcionesBusqueda.ts
 * Opciones estáticas para los filtros de búsqueda de reportes.
 *
 * Las opciones de etiquetas, técnicos y repuestos ahora se obtienen
 * de la API real mediante useOpcionesBusqueda() (ver ../hooks).
 */

export const OPCIONES_CANTIDAD_REPORTES: { value: string; label: string }[] = [
  { value: '', label: 'Cualquier cantidad' },
  { value: '10', label: '10 reportes' },
  { value: '25', label: '25 reportes' },
  { value: '50', label: '50 reportes' },
  { value: '100', label: '100 reportes' },
];

/**
 * Datos de plantillas simuladas (reemplazará la llamada a la API /api/plantillas)
 *
 * Cada plantilla define valores predefinidos que se precargan en el formulario
 * de registro de reportes al seleccionarla.
 */

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

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'PLT-001',
    nombre: 'Mantenimiento',
    descripcion: 'Reporte de mantenimiento preventivo',
    equipo: '',
    descripcionFalla: 'Mantenimiento general',
    trabajoRealizado: 'Mantenimiento correspondiente al mes de',
    posibleCausa: ' ',
    anotaciones: 'Voltaje de alimentación: 120V',
    declaracion: 'operativo',
    etiquetasPredefinidas: ['mantenimiento'],
  },
  {
    id: 'PLT-002',
    nombre: 'Inspección',
    descripcion: 'Reporte de inspección técnica',
    equipo: '',
    descripcionFalla: 'Inspección técnica solicitada para evaluar ',
    trabajoRealizado: 'Se realizó inspección visual y funcional del equipo. Se verificaron conexiones, estado físico, y rendimiento general.',
    posibleCausa: ' ',
    anotaciones: 'Voltaje de alimentación: 120V. Equipo encontrado en condiciones normales de operación.',
    declaracion: 'operativo',
    etiquetasPredefinidas: ['inspeccion'],
  },
  {
    id: 'PLT-003',
    nombre: 'Reparación',
    descripcion: 'Reporte de reparación de equipo',
    equipo: '',
    descripcionFalla: 'El equipo presenta falla operativa que impide su funcionamiento normal.',
    trabajoRealizado: 'Se diagnosticó la falla, se reemplazaron los componentes dañados, se realizaron pruebas de funcionamiento y se verificó la correcta operación del equipo.',
    posibleCausa: 'Falla por componentes dañados debido a uso prolongado o condiciones adversas.',
    anotaciones: 'Voltaje de alimentación: 120V. Se procedió a reemplazar piezas dañadas. Se recomienda monitoreo continuo.',
    declaracion: 'inoperativo',
    etiquetasPredefinidas: ['reparacion'],
  },
];

export const NOMBRES_PLANTILLAS = PLANTILLAS.map((p) => p.nombre);

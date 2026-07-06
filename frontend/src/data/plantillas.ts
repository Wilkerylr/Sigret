/**
 * Datos de plantillas simuladas (reemplazará la llamada a la API /api/plantillas)
 */

export interface Plantilla {
  id: string;
  nombre: string;
  descripcion?: string;
  camposPredefinidos?: string[];
  /** Valores por defecto que se asignarán a los campos del formulario al seleccionar esta plantilla */
  valoresPorDefecto?: Record<string, string>;
  /** Etiquetas predefinidas que se agregarán automáticamente (valores) */
  etiquetasPredefinidas?: string[];
}

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'PLT-001',
    nombre: 'Mantenimiento',
    descripcion: 'Reporte de mantenimiento preventivo',
    camposPredefinidos: ['descripcionFalla', 'trabajoRealizado', 'repuestos'],
    etiquetasPredefinidas: ['mantenimiento'],
    valoresPorDefecto: {
      descripcionFalla: 'Mantenimiento general',
      trabajoRealizado: 'Mantenimiento correspondiente al mes de',
      posibleCausa: ' ',
      anotaciones: 'Voltaje de alimentación: 120V',
      declaracion: 'operativo',
    },
  },
  {
    id: 'PLT-002',
    nombre: 'Inspección',
    descripcion: 'Reporte de inspección técnica',
    camposPredefinidos: ['descripcionFalla', 'declaracion'],
    etiquetasPredefinidas: ['inspeccion'],
    valoresPorDefecto: {
      descripcionFalla: 'Inspección técnica solicitada para evaluar ',
      trabajoRealizado: 'Se realizó inspección visual y funcional del equipo. Se verificaron conexiones, estado físico, y rendimiento general.',
      posibleCausa: ' ',
      anotaciones: 'Voltaje de alimentación: 120V. Equipo encontrado en condiciones normales de operación.',
      declaracion: 'operativo',
    },
  },
  {
    id: 'PLT-003',
    nombre: 'Reparación',
    descripcion: 'Reporte de reparación de equipo',
    camposPredefinidos: ['descripcionFalla', 'trabajoRealizado', 'repuestos', 'posibleCausa'],
    etiquetasPredefinidas: ['reparacion'],
    valoresPorDefecto: {
      descripcionFalla: 'El equipo presenta falla operativa que impide su funcionamiento normal.',
      trabajoRealizado: 'Se diagnosticó la falla, se reemplazaron los componentes dañados, se realizaron pruebas de funcionamiento y se verificó la correcta operación del equipo.',
      posibleCausa: 'Falla por componentes dañados debido a uso prolongado o condiciones adversas.',
      anotaciones: 'Voltaje de alimentación: 120V. Se procedió a reemplazar piezas dañadas. Se recomienda monitoreo continuo.',
      declaracion: 'inoperativo',
    },
  },
];

export const NOMBRES_PLANTILLAS = PLANTILLAS.map((p) => p.nombre);
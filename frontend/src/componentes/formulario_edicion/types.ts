/* ======================================
   types.ts — Tipos genéricos para formulario de edición reutilizable
   ====================================== */

/** Tipos de campo soportados */
export type TipoCampo =
  | 'texto'
  | 'textarea'
  | 'numero'
  | 'fecha'
  | 'hora'
  | 'select'
  | 'combobox'
  | 'radio'
  | 'lista-items';

/** Configuración de un campo individual */
export interface CampoConfig {
  nombre: string;
  etiqueta: string;
  tipo: TipoCampo;
  requerido?: boolean;
  opciones?: Array<{ value: string; label: string }>;
  placeholder?: string;
  /** Ancho del campo: 'completo' | 'mitad' | 'tercio' */
  ancho?: 'completo' | 'mitad' | 'tercio';
  /** Función de validación: retorna null si es válido, o un string con el error */
  validacion?: (valor: any, datosCompletos?: EntidadEditable) => string | null;
  /** Valor mínimo (para number, date) */
  min?: string | number;
  /** Valor máximo (para number, date) */
  max?: string | number;
  /** Deshabilitar campo */
  deshabilitado?: boolean;
  /** Dependencias: nombre de campos que, al cambiar, re-evalúan este campo */
  dependeDe?: string[];
}

/** Configuración de una sección (grupo de campos) */
export interface SeccionConfig {
  titulo: string;
  campos: CampoConfig[];
  /** Clase CSS adicional para la sección */
  className?: string;
  /** Si la sección es colapsable */
  colapsable?: boolean;
}

/** Entidad genérica que se puede editar */
export interface EntidadEditable {
  id?: string;
  [campo: string]: any;
}

/** Modo del formulario */
export type ModoFormulario = 'crear' | 'editar';

/** Props del componente FormularioEdicion */
export interface FormularioEdicionProps {
  /** Título del formulario */
  titulo: string;
  /** Datos de la entidad a editar (vacíos para crear) */
  entidad: EntidadEditable;
  /** Configuración de secciones y campos */
  configuracion: SeccionConfig[];
  /** Callback al guardar: retorna true si fue exitoso */
  onGuardar: (datos: EntidadEditable) => Promise<boolean>;
  /** Callback al cancelar */
  onCancelar: () => void;
  /** Modo del formulario */
  modo?: ModoFormulario;
  /** Si se muestra como modal overlay */
  modal?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Texto del botón guardar */
  textoGuardar?: string;
  /** Texto del botón cancelar */
  textocancelar?: string;
}

/** Estado interno del formulario */
export interface EstadoFormulario {
  datos: EntidadEditable;
  errores: Record<string, string | null>;
  sucio: boolean;
  guardando: boolean;
}

/** Retorno del hook useFormularioDinamico */
export interface UseFormularioDinamicoRetorno {
  datos: EntidadEditable;
  errores: Record<string, string | null>;
  sucio: boolean;
  guardando: boolean;
  esValido: boolean;
  handleChange: (nombre: string, valor: any) => void;
  handleSubmit: () => Promise<boolean>;
  limpiar: () => void;
  setDatos: React.Dispatch<React.SetStateAction<EntidadEditable>>;
  reiniciar: (nuevosDatos: EntidadEditable) => void;
}
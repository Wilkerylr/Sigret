// Tipos para el formulario de registro de reportes

export interface Repuesto {
  repuesto: string;
  cantidad: string;
}

export interface FormReporteData {
  cliente: string;
  equipo: string;
  descripcionFalla: string;
  trabajoRealizado: string;
  repuestos: Repuesto[];
  repuestoSeleccionado: string;
  cantidad: string;
  posibleCausa: string;
  anotaciones: string;
  declaracion: string;
  etiquetas: string[];
  etiquetaSeleccionada: string;
  tecnicos: string[];
  tecnicoSeleccionado: string;
  numeroReporte: string;
  plantilla: string;
  fechaReporte: string;
  fechaAtencion: string;
  horaInicio: string;
  horaFinalizacion: string;
  reportadoPor: string;
}

export type FormField = keyof FormReporteData;

export interface ValidacionResultado {
  valido: boolean;
  mensaje?: string;
}

export interface CampoFormularioProps {
  label: string;
  name: FormField;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'radio' | 'combobox';
  opciones?: Array<{ value: string; label: string }>;
  min?: string | number;
  max?: string | number;
}

export interface SelectConBotonesProps {
  label: string;
  name: string;
  seleccionado: string;
  opciones: Array<{ value: string; label: string }>;
  onAgregar: (value?: string) => void;
  onEliminar: (index: number) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  items: string[] | Repuesto[];
  botonNuevo?: boolean;
  onNuevo?: (nombre: string) => Promise<{ value: string; label: string }>;
  tipo?: 'simple' | 'conCantidad';
  requerido?: boolean;
  inputCantidad?: {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

export interface TablaDinamicaProps {
  datos: Array<{ [key: string]: any }>;
  columnas: string[];
  onEliminar: (index: number) => void;
  mostrarAcciones?: boolean;
}

export interface GrupoRadioProps {
  label: string;
  name: string;
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  opciones: Array<{ value: string; label: string }>;
}
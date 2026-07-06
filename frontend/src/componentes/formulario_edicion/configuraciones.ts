/* ======================================
   configuraciones.ts
   Configuraciones predefinidas para distintos tipos de entidades
   ====================================== */

import { SeccionConfig } from './types';

// Re-exportamos las opciones desde los módulos existentes
import {
  CLIENTES,
  ETIQUETAS,
  TECNICOS,
  PLANTILLAS,
  DECLARACIONES,
  REPUESTOS,
} from '@/componentes/registro_reportes/constants/opciones';

// Filtramos la opción vacía "" para combobox y select
const CLIENTES_SIN_VACIO = CLIENTES.filter(c => c.value !== '');
const ETIQUETAS_SIN_VACIO = ETIQUETAS.filter(e => e.value !== '');
const TECNICOS_SIN_VACIO = TECNICOS.filter(t => t.value !== '');
const PLANTILLAS_SIN_VACIO = PLANTILLAS.filter(p => p.value !== '');
const DECLARACIONES_SIN_VACIO = DECLARACIONES;
const REPUESTOS_SIN_VACIO = REPUESTOS.filter(r => r.value !== '');

/**
 * Configuración para editar/crear Reportes de Servicio
 * Compatible con los campos de FormReporteData y ReporteResumen
 */
export const CONFIG_REPORTE_COMPLETO: SeccionConfig[] = [
  {
    titulo: 'Datos del Cliente',
    campos: [
      {
        nombre: 'cliente',
        etiqueta: 'Cliente',
        tipo: 'combobox',
        requerido: true,
        opciones: CLIENTES_SIN_VACIO,
        placeholder: 'Buscar cliente...',
        ancho: 'mitad',
      },
      {
        nombre: 'equipo',
        etiqueta: 'Equipo',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Ej: Servidor HP ProLiant DL380',
        ancho: 'mitad',
      },
    ],
  },
  {
    titulo: 'Descripción del Servicio',
    campos: [
      {
        nombre: 'descripcionFalla',
        etiqueta: 'Descripción de la Falla',
        tipo: 'textarea',
        requerido: true,
        placeholder: 'Describa la falla reportada...',
        ancho: 'completo',
      },
      {
        nombre: 'trabajoRealizado',
        etiqueta: 'Trabajo Realizado',
        tipo: 'textarea',
        requerido: true,
        placeholder: 'Describa el trabajo realizado...',
        ancho: 'completo',
      },
      {
        nombre: 'posibleCausa',
        etiqueta: 'Posible Causa',
        tipo: 'texto',
        placeholder: 'Causa probable de la falla',
        ancho: 'mitad',
      },
      {
        nombre: 'anotaciones',
        etiqueta: 'Anotaciones',
        tipo: 'texto',
        placeholder: 'Notas adicionales',
        ancho: 'mitad',
      },
      {
        nombre: 'reportadoPor',
        etiqueta: 'Reportado Por',
        tipo: 'texto',
        placeholder: 'Persona que reportó',
        ancho: 'mitad',
      },
    ],
  },
  {
    titulo: 'Etiquetas y Técnicos',
    campos: [
      {
        nombre: 'etiquetas',
        etiqueta: 'Etiquetas',
        tipo: 'lista-items',
        requerido: true,
        opciones: ETIQUETAS_SIN_VACIO,
        ancho: 'mitad',
      },
      {
        nombre: 'tecnicos',
        etiqueta: 'Técnicos',
        tipo: 'lista-items',
        requerido: true,
        opciones: TECNICOS_SIN_VACIO,
        ancho: 'mitad',
      },
    ],
  },
  {
    titulo: 'Declaración y Plantilla',
    campos: [
      {
        nombre: 'declaracion',
        etiqueta: 'Declaración',
        tipo: 'radio',
        requerido: true,
        opciones: DECLARACIONES_SIN_VACIO,
        ancho: 'mitad',
      },
      {
        nombre: 'plantilla',
        etiqueta: 'Plantilla',
        tipo: 'select',
        opciones: PLANTILLAS_SIN_VACIO,
        ancho: 'mitad',
      },
    ],
  },
  {
    titulo: 'Control',
    campos: [
      {
        nombre: 'numeroReporte',
        etiqueta: 'Número de Reporte',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Ej: REP-001',
        ancho: 'tercio',
        validacion: (valor) => {
          if (valor && !/^REP-\d{3}$/i.test(valor)) {
            return 'Formato: REP-001';
          }
          return null;
        },
      },
      {
        nombre: 'fechaReporte',
        etiqueta: 'Fecha de Reporte',
        tipo: 'fecha',
        requerido: true,
        ancho: 'tercio',
      },
      {
        nombre: 'fechaAtencion',
        etiqueta: 'Fecha de Atención',
        tipo: 'fecha',
        requerido: true,
        ancho: 'tercio',
        validacion: (valor, datos) => {
          if (valor && datos?.fechaReporte && valor < datos.fechaReporte) {
            return 'La fecha de atención no puede ser anterior a la fecha de reporte';
          }
          return null;
        },
        dependeDe: ['fechaReporte'],
      },
      {
        nombre: 'horaInicio',
        etiqueta: 'Hora de Inicio',
        tipo: 'hora',
        requerido: true,
        ancho: 'mitad',
      },
      {
        nombre: 'horaFinalizacion',
        etiqueta: 'Hora de Finalización',
        tipo: 'hora',
        requerido: true,
        ancho: 'mitad',
        validacion: (valor, datos) => {
          if (valor && datos?.horaInicio && valor <= datos.horaInicio) {
            return 'La hora de finalización debe ser posterior a la de inicio';
          }
          return null;
        },
        dependeDe: ['horaInicio'],
      },
    ],
  },
];

/**
 * Configuración completa para EDICIÓN de reportes desde búsqueda
 * Incluye TODOS los campos del reporte + motivo de edición obligatorio
 */
export const CONFIG_REPORTE_EDICION: SeccionConfig[] = [
  {
    titulo: 'Motivo de la Edición',
    className: 'edicion-seccion--motivo',
    campos: [
      {
        nombre: 'motivoEdicion',
        etiqueta: 'Motivo de la Edición',
        tipo: 'textarea',
        requerido: true,
        placeholder: 'Explique detalladamente por qué se está editando este reporte...',
        ancho: 'completo',
        validacion: (valor) => {
          if (!valor || valor.trim().length < 10) {
            return 'Debe describir el motivo con al menos 10 caracteres';
          }
          return null;
        },
      },
    ],
  },
  {
    titulo: 'Datos del Cliente',
    campos: [
      {
        nombre: 'cliente',
        etiqueta: 'Cliente',
        tipo: 'combobox',
        requerido: true,
        opciones: CLIENTES_SIN_VACIO,
        placeholder: 'Buscar cliente...',
        ancho: 'mitad',
      },
      {
        nombre: 'equipo',
        etiqueta: 'Equipo',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Ej: Servidor HP ProLiant DL380',
        ancho: 'mitad',
      },
    ],
  },
  {
    titulo: 'Descripción del Servicio',
    campos: [
      {
        nombre: 'descripcionFalla',
        etiqueta: 'Descripción de la Falla',
        tipo: 'textarea',
        requerido: true,
        placeholder: 'Describa la falla reportada...',
        ancho: 'completo',
      },
      {
        nombre: 'trabajoRealizado',
        etiqueta: 'Trabajo Realizado',
        tipo: 'textarea',
        requerido: true,
        placeholder: 'Describa el trabajo realizado...',
        ancho: 'completo',
      },
      {
        nombre: 'posibleCausa',
        etiqueta: 'Posible Causa',
        tipo: 'texto',
        placeholder: 'Causa probable de la falla',
        ancho: 'mitad',
      },
      {
        nombre: 'anotaciones',
        etiqueta: 'Anotaciones',
        tipo: 'texto',
        placeholder: 'Notas adicionales',
        ancho: 'mitad',
      },
      {
        nombre: 'reportadoPor',
        etiqueta: 'Reportado Por',
        tipo: 'texto',
        placeholder: 'Persona que reportó',
        ancho: 'mitad',
      },
    ],
  },
  {
    titulo: 'Repuestos Empleados',
    campos: [
      {
        nombre: 'repuestos',
        etiqueta: 'Repuestos',
        tipo: 'lista-items',
        opciones: REPUESTOS_SIN_VACIO,
        ancho: 'completo',
      },
    ],
  },
  {
    titulo: 'Etiquetas y Técnicos',
    campos: [
      {
        nombre: 'etiquetas',
        etiqueta: 'Etiquetas',
        tipo: 'lista-items',
        requerido: true,
        opciones: ETIQUETAS_SIN_VACIO,
        ancho: 'mitad',
      },
      {
        nombre: 'tecnicos',
        etiqueta: 'Técnicos',
        tipo: 'lista-items',
        requerido: true,
        opciones: TECNICOS_SIN_VACIO,
        ancho: 'mitad',
      },
    ],
  },
  {
    titulo: 'Declaración y Plantilla',
    campos: [
      {
        nombre: 'declaracion',
        etiqueta: 'Declaración',
        tipo: 'radio',
        requerido: true,
        opciones: DECLARACIONES_SIN_VACIO,
        ancho: 'mitad',
      },
      {
        nombre: 'plantilla',
        etiqueta: 'Plantilla',
        tipo: 'select',
        opciones: PLANTILLAS_SIN_VACIO,
        ancho: 'mitad',
      },
    ],
  },
  {
    titulo: 'Control',
    campos: [
      {
        nombre: 'numeroReporte',
        etiqueta: 'Número de Reporte',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Ej: REP-001',
        ancho: 'tercio',
      },
      {
        nombre: 'fechaReporte',
        etiqueta: 'Fecha de Reporte',
        tipo: 'fecha',
        requerido: true,
        ancho: 'tercio',
      },
      {
        nombre: 'fechaAtencion',
        etiqueta: 'Fecha de Atención',
        tipo: 'fecha',
        requerido: true,
        ancho: 'tercio',
        validacion: (valor, datos) => {
          if (valor && datos?.fechaReporte && valor < datos.fechaReporte) {
            return 'La fecha de atención no puede ser anterior a la fecha de reporte';
          }
          return null;
        },
        dependeDe: ['fechaReporte'],
      },
      {
        nombre: 'horaInicio',
        etiqueta: 'Hora de Inicio',
        tipo: 'hora',
        requerido: true,
        ancho: 'mitad',
      },
      {
        nombre: 'horaFinalizacion',
        etiqueta: 'Hora de Finalización',
        tipo: 'hora',
        requerido: true,
        ancho: 'mitad',
        validacion: (valor, datos) => {
          if (valor && datos?.horaInicio && valor <= datos.horaInicio) {
            return 'La hora de finalización debe ser posterior a la de inicio';
          }
          return null;
        },
        dependeDe: ['horaInicio'],
      },
    ],
  },
];

/**
 * Configuración para editar un Cliente
 */
export const CONFIG_CLIENTE: SeccionConfig[] = [
  {
    titulo: 'Datos del Cliente',
    campos: [
      {
        nombre: 'nombre',
        etiqueta: 'Nombre del Cliente',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Nombre o Razón Social',
        ancho: 'completo',
      },
      {
        nombre: 'rif',
        etiqueta: 'RIF',
        tipo: 'texto',
        placeholder: 'J-12345678-9',
        ancho: 'mitad',
      },
      {
        nombre: 'telefono',
        etiqueta: 'Teléfono',
        tipo: 'texto',
        placeholder: '+58 412-1234567',
        ancho: 'mitad',
      },
      {
        nombre: 'direccion',
        etiqueta: 'Dirección',
        tipo: 'textarea',
        placeholder: 'Dirección completa',
        ancho: 'completo',
      },
      {
        nombre: 'email',
        etiqueta: 'Correo Electrónico',
        tipo: 'texto',
        placeholder: 'cliente@ejemplo.com',
        ancho: 'mitad',
        validacion: (valor) => {
          if (valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
            return 'Correo electrónico inválido';
          }
          return null;
        },
      },
    ],
  },
];

/**
 * Configuración para editar un Técnico
 */
export const CONFIG_TECNICO: SeccionConfig[] = [
  {
    titulo: 'Datos del Técnico',
    campos: [
      {
        nombre: 'nombre',
        etiqueta: 'Nombre',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Nombre completo',
        ancho: 'completo',
      },
      {
        nombre: 'especialidad',
        etiqueta: 'Especialidad',
        tipo: 'texto',
        placeholder: 'Ej: Electrónica, Redes',
        ancho: 'mitad',
      },
      {
        nombre: 'telefono',
        etiqueta: 'Teléfono',
        tipo: 'texto',
        placeholder: '+58 412-1234567',
        ancho: 'mitad',
      },
    ],
  },
];

/**
 * Configuración para editar una Plantilla
 */
export const CONFIG_PLANTILLA: SeccionConfig[] = [
  {
    titulo: 'Datos de la Plantilla',
    campos: [
      {
        nombre: 'nombre',
        etiqueta: 'Nombre de la Plantilla',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Ej: Mantenimiento preventivo',
        ancho: 'completo',
      },
      {
        nombre: 'descripcion',
        etiqueta: 'Descripción',
        tipo: 'textarea',
        placeholder: 'Descripción de la plantilla',
        ancho: 'completo',
      },
      {
        nombre: 'camposPredefinidos',
        etiqueta: 'Campos Predefinidos',
        tipo: 'lista-items',
        opciones: [
          { value: 'descripcionFalla', label: 'Descripción de Falla' },
          { value: 'trabajoRealizado', label: 'Trabajo Realizado' },
          { value: 'posibleCausa', label: 'Posible Causa' },
          { value: 'anotaciones', label: 'Anotaciones' },
          { value: 'repuestos', label: 'Repuestos' },
          { value: 'declaracion', label: 'Declaración' },
        ],
        ancho: 'completo',
      },
      {
        nombre: 'etiquetasPredefinidas',
        etiqueta: 'Etiquetas Predefinidas',
        tipo: 'lista-items',
        opciones: [
          { value: 'Mantenimiento', label: 'Mantenimiento' },
          { value: 'Reparación', label: 'Reparación' },
          { value: 'Inspección', label: 'Inspección' },
        ],
        ancho: 'completo',
      },
    ],
  },
];

/**
 * Configuración para CREAR un Usuario (incluye contraseña)
 * Los permisos son ADICIONALES a los que ya otorga el rol por defecto
 */
export const CONFIG_USUARIO_CREAR: SeccionConfig[] = [
  {
    titulo: 'Datos de Acceso',
    campos: [
      {
        nombre: 'username',
        etiqueta: 'Nombre de Usuario',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Ej: jperez',
        ancho: 'mitad',
        validacion: (valor) => {
          if (valor && valor.length < 3) {
            return 'El nombre de usuario debe tener al menos 3 caracteres';
          }
          return null;
        },
      },
      {
        nombre: 'password',
        etiqueta: 'Contraseña',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Mínimo 6 caracteres',
        ancho: 'mitad',
        validacion: (valor) => {
          if (valor && valor.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
          }
          return null;
        },
      },
    ],
  },
  {
    titulo: 'Datos Personales (Opcional)',
    campos: [
      {
        nombre: 'nombreCompleto',
        etiqueta: 'Nombre Completo',
        tipo: 'texto',
        placeholder: 'Nombre y apellido del usuario',
        ancho: 'completo',
      },
      {
        nombre: 'email',
        etiqueta: 'Correo Electrónico',
        tipo: 'texto',
        placeholder: 'usuario@ejemplo.com',
        ancho: 'mitad',
        validacion: (valor) => {
          if (valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
            return 'Correo electrónico inválido';
          }
          return null;
        },
      },
    ],
  },
  {
    titulo: 'Rol y Permisos Adicionales',
    campos: [
      {
        nombre: 'role',
        etiqueta: 'Rol',
        tipo: 'select',
        requerido: true,
        opciones: [
          { value: 'admin', label: 'Administrador' },
          { value: 'tecnico', label: 'Técnico' },
          { value: 'administrativo', label: 'Administrativo' },
        ],
        ancho: 'mitad',
      },
      {
        nombre: 'permissions',
        etiqueta: 'Permisos Adicionales',
        tipo: 'lista-items',
        requerido: false,
        opciones: [
          { value: 'view-estadisticas', label: 'Ver Estadísticas' },
          { value: 'view-registro-reportes', label: 'Registrar Reportes' },
          { value: 'view-busqueda-reportes', label: 'Buscar Reportes' },
          { value: 'view-gestion-registros', label: 'Gestionar Registros' },
          { value: 'view-gestion-usuarios', label: 'Gestionar Usuarios' },
        ],
        ancho: 'mitad',
      },
    ],
  },
];

/**
 * Configuración para EDITAR un Usuario (SIN contraseña por seguridad)
 * Los permisos son ADICIONALES a los que ya otorga el rol por defecto
 */
export const CONFIG_USUARIO_EDITAR: SeccionConfig[] = [
  {
    titulo: 'Datos del Usuario',
    campos: [
      {
        nombre: 'username',
        etiqueta: 'Nombre de Usuario',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Ej: jperez',
        ancho: 'mitad',
        deshabilitado: true,
      },
      {
        nombre: 'nombreCompleto',
        etiqueta: 'Nombre Completo',
        tipo: 'texto',
        placeholder: 'Nombre y apellido del usuario',
        ancho: 'mitad',
      },
      {
        nombre: 'email',
        etiqueta: 'Correo Electrónico',
        tipo: 'texto',
        placeholder: 'usuario@ejemplo.com',
        ancho: 'completo',
        validacion: (valor) => {
          if (valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
            return 'Correo electrónico inválido';
          }
          return null;
        },
      },
    ],
  },
  {
    titulo: 'Rol y Permisos Adicionales',
    campos: [
      {
        nombre: 'role',
        etiqueta: 'Rol',
        tipo: 'select',
        requerido: true,
        opciones: [
          { value: 'admin', label: 'Administrador' },
          { value: 'tecnico', label: 'Técnico' },
          { value: 'administrativo', label: 'Administrativo' },
        ],
        ancho: 'mitad',
      },
      {
        nombre: 'permissions',
        etiqueta: 'Permisos Adicionales',
        tipo: 'lista-items',
        requerido: false,
        opciones: [
          { value: 'view-estadisticas', label: 'Ver Estadísticas' },
          { value: 'view-registro-reportes', label: 'Registrar Reportes' },
          { value: 'view-busqueda-reportes', label: 'Buscar Reportes' },
          { value: 'view-gestion-registros', label: 'Gestionar Registros' },
          { value: 'view-gestion-usuarios', label: 'Gestionar Usuarios' },
        ],
        ancho: 'mitad',
      },
    ],
  },
];

/**
 * Configuración para editar una Etiqueta
 */
export const CONFIG_ETIQUETA: SeccionConfig[] = [
  {
    titulo: 'Datos de la Etiqueta',
    campos: [
      {
        nombre: 'nombre',
        etiqueta: 'Nombre de la Etiqueta',
        tipo: 'texto',
        requerido: true,
        placeholder: 'Ej: Mantenimiento preventivo',
        ancho: 'completo',
      },
      {
        nombre: 'color',
        etiqueta: 'Color',
        tipo: 'texto',
        placeholder: 'Ej: #3b82f6',
        ancho: 'mitad',
      },
      {
        nombre: 'descripcion',
        etiqueta: 'Descripción',
        tipo: 'textarea',
        placeholder: 'Descripción opcional',
        ancho: 'completo',
      },
    ],
  },
];
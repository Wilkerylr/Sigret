/* ======================================
   configuraciones.ts
   Configuraciones predefinidas para distintos tipos de entidades
   ====================================== */

import { SeccionConfig } from './types';

import {
  CLIENTES,
  ETIQUETAS,
  TECNICOS,
  PLANTILLAS,
  DECLARACIONES,
  REPUESTOS,
} from '@/componentes/registro_reportes/constants/opciones';

const CLIENTES_SIN_VACIO = CLIENTES.filter(c => c.value !== '');
const ETIQUETAS_SIN_VACIO = ETIQUETAS.filter(e => e.value !== '');
const TECNICOS_SIN_VACIO = TECNICOS.filter(t => t.value !== '');
const PLANTILLAS_SIN_VACIO = PLANTILLAS.filter(p => p.value !== '');
const DECLARACIONES_SIN_VACIO = DECLARACIONES;
const REPUESTOS_SIN_VACIO = REPUESTOS.filter(r => r.value !== '');

export const OPCIONES_ROLES = [
  { value: '1', label: 'Administrador' },
  { value: '2', label: 'Técnico' },
  { value: '3', label: 'Administrativo' },
];

export const PERMISOS_SISTEMA = [
  { value: 'view-estadisticas', label: 'Inicio (Estadísticas)' },
  { value: 'view-registro-reportes', label: 'Registro de Reportes' },
  { value: 'view-busqueda-reportes', label: 'Búsqueda de Reportes' },
  { value: 'view-gestion-registros', label: 'Gestión de Registros' },
  { value: 'view-gestion-usuarios', label: 'Gestión de Usuarios' },
];

/**
 * Genera configuración para CREAR usuario
 * 
 * Campos del formulario:
 * - Nombre de usuario (obligatorio) → nombre_usuario
 * - Contraseña (obligatorio) → contraseña
 * - Apellido (obligatorio) → apellido_usuario
 * - Email (opcional) → email_usuario
 * - Rol (obligatorio) → rol_usuario
 * - Permisos de secciones (opcional) → permisos
 */
export function crearConfigUsuarioCrear(): SeccionConfig[] {
  return [
    {
      titulo: 'Datos de Acceso',
      campos: [
        {
          nombre: 'nombre_usuario',
          etiqueta: 'Nombre de Usuario',
          tipo: 'texto',
          requerido: true,
          placeholder: 'Ej: Juan',
          ancho: 'mitad',
          validacion: (valor: any) =>
            !valor || valor.trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres' : null,
        },
        {
          nombre: 'contraseña',
          etiqueta: 'Contraseña',
          tipo: 'texto',
          requerido: true,
          placeholder: 'Mínimo 6 caracteres',
          ancho: 'mitad',
          validacion: (valor: any) =>
            !valor || valor.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null,
        },
      ],
    },
    {
      titulo: 'Información Personal',
      campos: [
        {
          nombre: 'apellido_usuario',
          etiqueta: 'Apellido',
          tipo: 'texto',
          requerido: true,
          placeholder: 'Ej: Pérez García',
          ancho: 'mitad',
          validacion: (valor: any) =>
            !valor || valor.trim().length < 2 ? 'El apellido debe tener al menos 2 caracteres' : null,
        },
        {
          nombre: 'email_usuario',
          etiqueta: 'Correo Electrónico',
          tipo: 'texto',
          placeholder: 'usuario@ejemplo.com',
          ancho: 'mitad',
          validacion: (valor: any) =>
            valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
              ? 'Ingrese un correo electrónico válido'
              : null,
        },
      ],
    },
    {
      titulo: 'Rol y Permisos',
      campos: [
        {
          nombre: 'rol_usuario',
          etiqueta: 'Rol',
          tipo: 'select',
          requerido: true,
          opciones: OPCIONES_ROLES,
          ancho: 'mitad',
        },
        {
          nombre: 'permisos',
          etiqueta: 'Permisos de Acceso',
          tipo: 'lista-items',
          requerido: false,
          opciones: PERMISOS_SISTEMA,
          ancho: 'mitad',
        },
      ],
    },
  ];
}

/**
 * Genera configuración para EDITAR usuario
 * 
 * Campos del formulario:
 * - Nombre de usuario (obligatorio) → nombre_usuario
 * - Apellido (obligatorio) → apellido_usuario
 * - Email (opcional) → email_usuario
 * - Rol (obligatorio) → rol_usuario
 * - Permisos de secciones (opcional) → permisos
 * NOTA: No incluye contraseña por seguridad
 */
export function crearConfigUsuarioEditar(): SeccionConfig[] {
  return [
    {
      titulo: 'Datos del Usuario',
      campos: [
        {
          nombre: 'nombre_usuario',
          etiqueta: 'Nombre de Usuario',
          tipo: 'texto',
          requerido: true,
          placeholder: 'Ej: Juan',
          ancho: 'mitad',
          validacion: (valor: any) =>
            !valor || valor.trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres' : null,
        },
        {
          nombre: 'apellido_usuario',
          etiqueta: 'Apellido',
          tipo: 'texto',
          requerido: true,
          placeholder: 'Ej: Pérez García',
          ancho: 'mitad',
          validacion: (valor: any) =>
            !valor || valor.trim().length < 2 ? 'El apellido debe tener al menos 2 caracteres' : null,
        },
        {
          nombre: 'email_usuario',
          etiqueta: 'Correo Electrónico',
          tipo: 'texto',
          placeholder: 'usuario@ejemplo.com',
          ancho: 'completo',
          validacion: (valor: any) =>
            valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
              ? 'Ingrese un correo electrónico válido'
              : null,
        },
      ],
    },
    {
      titulo: 'Rol y Permisos',
      campos: [
        {
          nombre: 'rol_usuario',
          etiqueta: 'Rol',
          tipo: 'select',
          requerido: true,
          opciones: OPCIONES_ROLES,
          ancho: 'mitad',
        },
        {
          nombre: 'permisos',
          etiqueta: 'Permisos de Acceso',
          tipo: 'lista-items',
          requerido: false,
          opciones: PERMISOS_SISTEMA,
          ancho: 'mitad',
        },
      ],
    },
  ];
}

// Versiones por defecto (compatibilidad)
export const CONFIG_USUARIO_CREAR = crearConfigUsuarioCrear();
export const CONFIG_USUARIO_EDITAR = crearConfigUsuarioEditar();

/* ─── Configuraciones de Reportes ─── */
export const CONFIG_REPORTE_COMPLETO: SeccionConfig[] = [
  {
    titulo: 'Datos del Cliente',
    campos: [
      { nombre: 'cliente', etiqueta: 'Cliente', tipo: 'combobox', requerido: true, opciones: CLIENTES_SIN_VACIO, placeholder: 'Buscar cliente...', ancho: 'mitad' },
      { nombre: 'equipo', etiqueta: 'Equipo', tipo: 'texto', requerido: true, placeholder: 'Ej: Servidor HP ProLiant DL380', ancho: 'mitad' },
    ],
  },
  {
    titulo: 'Descripción del Servicio',
    campos: [
      { nombre: 'descripcionFalla', etiqueta: 'Descripción de la Falla', tipo: 'textarea', requerido: true, placeholder: 'Describa la falla reportada...', ancho: 'completo' },
      { nombre: 'trabajoRealizado', etiqueta: 'Trabajo Realizado', tipo: 'textarea', requerido: true, placeholder: 'Describa el trabajo realizado...', ancho: 'completo' },
      { nombre: 'posibleCausa', etiqueta: 'Posible Causa', tipo: 'texto', placeholder: 'Causa probable de la falla', ancho: 'mitad' },
      { nombre: 'anotaciones', etiqueta: 'Anotaciones', tipo: 'texto', placeholder: 'Notas adicionales', ancho: 'mitad' },
      { nombre: 'reportadoPor', etiqueta: 'Reportado Por', tipo: 'texto', placeholder: 'Persona que reportó', ancho: 'mitad' },
    ],
  },
  {
    titulo: 'Etiquetas y Técnicos',
    campos: [
      { nombre: 'etiquetas', etiqueta: 'Etiquetas', tipo: 'lista-items', requerido: true, opciones: ETIQUETAS_SIN_VACIO, ancho: 'mitad' },
      { nombre: 'tecnicos', etiqueta: 'Técnicos', tipo: 'lista-items', requerido: true, opciones: TECNICOS_SIN_VACIO, ancho: 'mitad' },
    ],
  },
  {
    titulo: 'Declaración y Plantilla',
    campos: [
      { nombre: 'declaracion', etiqueta: 'Declaración', tipo: 'radio', requerido: true, opciones: DECLARACIONES_SIN_VACIO, ancho: 'mitad' },
      { nombre: 'plantilla', etiqueta: 'Plantilla', tipo: 'select', opciones: PLANTILLAS_SIN_VACIO, ancho: 'mitad' },
    ],
  },
  {
    titulo: 'Control',
    campos: [
      { nombre: 'numeroReporte', etiqueta: 'Número de Reporte', tipo: 'texto', requerido: true, placeholder: 'Ej: REP-001', ancho: 'tercio', validacion: (v: any) => v && !/^REP-\d{3}$/i.test(v) ? 'Formato: REP-001' : null },
      { nombre: 'fechaReporte', etiqueta: 'Fecha de Reporte', tipo: 'fecha', requerido: true, ancho: 'tercio' },
      { nombre: 'fechaAtencion', etiqueta: 'Fecha de Atención', tipo: 'fecha', requerido: true, ancho: 'tercio', validacion: (v: any, d: any) => v && d?.fechaReporte && v < d.fechaReporte ? 'La fecha de atención no puede ser anterior a la fecha de reporte' : null, dependeDe: ['fechaReporte'] },
      { nombre: 'horaInicio', etiqueta: 'Hora de Inicio', tipo: 'hora', requerido: true, ancho: 'mitad' },
      { nombre: 'horaFinalizacion', etiqueta: 'Hora de Finalización', tipo: 'hora', requerido: true, ancho: 'mitad', validacion: (v: any, d: any) => v && d?.horaInicio && v <= d.horaInicio ? 'La hora de finalización debe ser posterior a la de inicio' : null, dependeDe: ['horaInicio'] },
    ],
  },
];

export const CONFIG_REPORTE_EDICION: SeccionConfig[] = [
  {
    titulo: 'Motivo de la Edición',
    className: 'edicion-seccion--motivo',
    campos: [
      { nombre: 'motivoEdicion', etiqueta: 'Motivo de la Edición', tipo: 'textarea', requerido: true, placeholder: 'Explique detalladamente por qué se está editando este reporte...', ancho: 'completo', validacion: (v: any) => !v || v.trim().length < 10 ? 'Debe describir el motivo con al menos 10 caracteres' : null },
    ],
  },
  {
    titulo: 'Datos del Cliente',
    campos: [
      { nombre: 'cliente', etiqueta: 'Cliente', tipo: 'combobox', requerido: true, opciones: CLIENTES_SIN_VACIO, placeholder: 'Buscar cliente...', ancho: 'mitad' },
      { nombre: 'equipo', etiqueta: 'Equipo', tipo: 'texto', requerido: true, placeholder: 'Ej: Servidor HP ProLiant DL380', ancho: 'mitad' },
    ],
  },
  {
    titulo: 'Descripción del Servicio',
    campos: [
      { nombre: 'descripcionFalla', etiqueta: 'Descripción de la Falla', tipo: 'textarea', requerido: true, placeholder: 'Describa la falla reportada...', ancho: 'completo' },
      { nombre: 'trabajoRealizado', etiqueta: 'Trabajo Realizado', tipo: 'textarea', requerido: true, placeholder: 'Describa el trabajo realizado...', ancho: 'completo' },
      { nombre: 'posibleCausa', etiqueta: 'Posible Causa', tipo: 'texto', placeholder: 'Causa probable de la falla', ancho: 'mitad' },
      { nombre: 'anotaciones', etiqueta: 'Anotaciones', tipo: 'texto', placeholder: 'Notas adicionales', ancho: 'mitad' },
      { nombre: 'reportadoPor', etiqueta: 'Reportado Por', tipo: 'texto', placeholder: 'Persona que reportó', ancho: 'mitad' },
    ],
  },
  {
    titulo: 'Repuestos Empleados',
    campos: [{ nombre: 'repuestos', etiqueta: 'Repuestos', tipo: 'lista-items', opciones: REPUESTOS_SIN_VACIO, ancho: 'completo' }],
  },
  {
    titulo: 'Etiquetas y Técnicos',
    campos: [
      { nombre: 'etiquetas', etiqueta: 'Etiquetas', tipo: 'lista-items', requerido: true, opciones: ETIQUETAS_SIN_VACIO, ancho: 'mitad' },
      { nombre: 'tecnicos', etiqueta: 'Técnicos', tipo: 'lista-items', requerido: true, opciones: TECNICOS_SIN_VACIO, ancho: 'mitad' },
    ],
  },
  {
    titulo: 'Declaración y Plantilla',
    campos: [
      { nombre: 'declaracion', etiqueta: 'Declaración', tipo: 'radio', requerido: true, opciones: DECLARACIONES_SIN_VACIO, ancho: 'mitad' },
      { nombre: 'plantilla', etiqueta: 'Plantilla', tipo: 'select', opciones: PLANTILLAS_SIN_VACIO, ancho: 'mitad' },
    ],
  },
  {
    titulo: 'Control',
    campos: [
      { nombre: 'numeroReporte', etiqueta: 'Número de Reporte', tipo: 'texto', requerido: true, placeholder: 'Ej: REP-001', ancho: 'tercio' },
      { nombre: 'fechaReporte', etiqueta: 'Fecha de Reporte', tipo: 'fecha', requerido: true, ancho: 'tercio' },
      { nombre: 'fechaAtencion', etiqueta: 'Fecha de Atención', tipo: 'fecha', requerido: true, ancho: 'tercio', validacion: (v: any, d: any) => v && d?.fechaReporte && v < d.fechaReporte ? 'La fecha de atención no puede ser anterior a la fecha de reporte' : null, dependeDe: ['fechaReporte'] },
      { nombre: 'horaInicio', etiqueta: 'Hora de Inicio', tipo: 'hora', requerido: true, ancho: 'mitad' },
      { nombre: 'horaFinalizacion', etiqueta: 'Hora de Finalización', tipo: 'hora', requerido: true, ancho: 'mitad', validacion: (v: any, d: any) => v && d?.horaInicio && v <= d.horaInicio ? 'La hora de finalización debe ser posterior a la de inicio' : null, dependeDe: ['horaInicio'] },
    ],
  },
];

/* ─── Clientes ─── */
export const CONFIG_CLIENTE: SeccionConfig[] = [
  {
    titulo: 'Datos del Cliente',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre del Cliente', tipo: 'texto', requerido: true, placeholder: 'Nombre o Razón Social', ancho: 'completo' },
      { nombre: 'rif', etiqueta: 'RIF', tipo: 'texto', placeholder: 'J-12345678-9', ancho: 'mitad' },
      { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'texto', placeholder: '+58 412-1234567', ancho: 'mitad' },
      { nombre: 'direccion', etiqueta: 'Dirección', tipo: 'textarea', placeholder: 'Dirección completa', ancho: 'completo' },
      { nombre: 'email', etiqueta: 'Correo Electrónico', tipo: 'texto', placeholder: 'cliente@ejemplo.com', ancho: 'mitad', validacion: (v: any) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Correo electrónico inválido' : null },
    ],
  },
];

/* ─── Técnicos ─── */
export const CONFIG_TECNICO: SeccionConfig[] = [
  {
    titulo: 'Datos del Técnico',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, placeholder: 'Nombre completo', ancho: 'completo' },
      { nombre: 'especialidad', etiqueta: 'Especialidad', tipo: 'texto', placeholder: 'Ej: Electrónica, Redes', ancho: 'mitad' },
      { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'texto', placeholder: '+58 412-1234567', ancho: 'mitad' },
    ],
  },
];

/* ─── Plantillas ─── */
export const CONFIG_PLANTILLA: SeccionConfig[] = [
  {
    titulo: 'Información General',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre de la Plantilla', tipo: 'texto', requerido: true, placeholder: 'Ej: Mantenimiento preventivo', ancho: 'completo' },
      { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', placeholder: 'Descripción de la plantilla', ancho: 'completo' },
    ],
  },
  {
    titulo: 'Valores Predefinidos del Reporte',
    className: 'edicion-seccion--valores',
    campos: [
      { nombre: 'equipo', etiqueta: 'Equipo', tipo: 'texto', placeholder: 'Ej: Servidor HP ProLiant DL380', ancho: 'completo' },
      { nombre: 'descripcionFalla', etiqueta: 'Descripción de la Falla', tipo: 'textarea', placeholder: 'Texto predefinido para la descripción de la falla...', ancho: 'completo' },
      { nombre: 'trabajoRealizado', etiqueta: 'Trabajo Realizado', tipo: 'textarea', placeholder: 'Texto predefinido para el trabajo realizado...', ancho: 'completo' },
      { nombre: 'posibleCausa', etiqueta: 'Posible Causa', tipo: 'texto', placeholder: 'Causa probable predefinida', ancho: 'mitad' },
      { nombre: 'anotaciones', etiqueta: 'Anotaciones', tipo: 'textarea', placeholder: 'Anotaciones predefinidas', ancho: 'completo' },
      { nombre: 'declaracion', etiqueta: 'Estado / Declaración', tipo: 'select', opciones: [{ value: 'operativo', label: 'Operativo' }, { value: 'inoperativo', label: 'Inoperativo' }], ancho: 'mitad' },
      { nombre: 'etiquetasPredefinidas', etiqueta: 'Etiquetas Predefinidas', tipo: 'lista-items', opciones: [{ value: 'Mantenimiento', label: 'Mantenimiento' }, { value: 'Reparación', label: 'Reparación' }, { value: 'Inspección', label: 'Inspección' }], ancho: 'completo' },
    ],
  },
];

/* ─── Etiquetas ─── */
export const CONFIG_ETIQUETA: SeccionConfig[] = [
  {
    titulo: 'Datos de la Etiqueta',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre de la Etiqueta', tipo: 'texto', requerido: true, placeholder: 'Ej: Mantenimiento preventivo', ancho: 'completo' },
      { nombre: 'color', etiqueta: 'Color', tipo: 'texto', placeholder: 'Ej: #3b82f6', ancho: 'mitad' },
      { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', placeholder: 'Descripción opcional', ancho: 'completo' },
    ],
  },
];
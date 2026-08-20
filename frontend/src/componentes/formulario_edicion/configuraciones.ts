/* ======================================
   configuraciones.ts
   Configuraciones predefinidas para distintos tipos de entidades
   Las opciones de reportes y plantillas provienen de la API (useOpcionesFormulario)
   ====================================== */

import { EntidadEditable, SeccionConfig } from './types';

type Opcion = { value: string; label: string };

export interface OpcionesReporteConfig {
  clientes: Opcion[];
  etiquetas: Opcion[];
  tecnicos: Opcion[];
  repuestos: Opcion[];
  plantillas: Opcion[];
  estados: Opcion[];
}

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
 */
export function crearConfigUsuarioCrear(): SeccionConfig[] {
  return [
    {
      titulo: 'Datos de Acceso',
      campos: [
        {
          nombre: 'email_usuario',
          etiqueta: 'Correo Electrónico',
          tipo: 'texto',
          requerido: true,
          placeholder: 'usuario@ejemplo.com',
          ancho: 'mitad',
          validacion: (valor: unknown) =>
            valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor))
              ? 'Ingrese un correo electrónico válido'
              : null,
        },
        {
          nombre: 'contraseña',
          etiqueta: 'Contraseña',
          tipo: 'texto',
          requerido: true,
          placeholder: 'Mínimo 6 caracteres',
          ancho: 'mitad',
          validacion: (valor: unknown) =>
            !valor || String(valor).length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null,
        },
      ],
    },
    {
      titulo: 'Información Personal',
      campos: [
        {
          nombre: 'nombre_usuario',
          etiqueta: 'Nombre',
          tipo: 'texto',
          requerido: true,
          placeholder: 'Ej: Juan',
          ancho: 'mitad',
          validacion: (valor: unknown) =>
            !valor || String(valor).trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres' : null,
        },
        {
          nombre: 'apellido_usuario',
          etiqueta: 'Apellido',
          tipo: 'texto',
          requerido: true,
          placeholder: 'Ej: Pérez García',
          ancho: 'mitad',
          validacion: (valor: unknown) =>
            !valor || String(valor).trim().length < 2 ? 'El apellido debe tener al menos 2 caracteres' : null,
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
          validacion: (valor: unknown) =>
            !valor || String(valor).trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres' : null,
        },
        {
          nombre: 'apellido_usuario',
          etiqueta: 'Apellido',
          tipo: 'texto',
          requerido: true,
          placeholder: 'Ej: Pérez García',
          ancho: 'mitad',
          validacion: (valor: unknown) =>
            !valor || String(valor).trim().length < 2 ? 'El apellido debe tener al menos 2 caracteres' : null,
        },
        {
          nombre: 'email_usuario',
          etiqueta: 'Correo Electrónico',
          tipo: 'texto',
          placeholder: 'usuario@ejemplo.com',
          ancho: 'completo',
          validacion: (valor: unknown) =>
            valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor))
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

/* ─── Configuraciones de Reportes (opciones desde la API) ─── */

function seccionCliente(opciones: OpcionesReporteConfig, opcionalPlantilla = false): SeccionConfig {
  void opcionalPlantilla;
  return {
    titulo: 'Datos del Cliente',
    campos: [
      { nombre: 'clienteId', etiqueta: 'Cliente', tipo: 'combobox', requerido: true, opciones: opciones.clientes, placeholder: 'Buscar cliente...', ancho: 'mitad' },
      { nombre: 'equipo', etiqueta: 'Equipo', tipo: 'texto', requerido: true, placeholder: 'Ej: Servidor HP ProLiant DL380', ancho: 'mitad' },
    ],
  };
}

function seccionServicio(): SeccionConfig {
  return {
    titulo: 'Descripción del Servicio',
    campos: [
      { nombre: 'descripcionFalla', etiqueta: 'Descripción de la Falla', tipo: 'textarea', requerido: true, placeholder: 'Describa la falla reportada...', ancho: 'completo' },
      { nombre: 'trabajoRealizado', etiqueta: 'Trabajo Realizado', tipo: 'textarea', requerido: true, placeholder: 'Describa el trabajo realizado...', ancho: 'completo' },
      { nombre: 'posibleCausa', etiqueta: 'Posible Causa', tipo: 'texto', placeholder: 'Causa probable de la falla', ancho: 'mitad' },
      { nombre: 'anotaciones', etiqueta: 'Anotaciones', tipo: 'texto', placeholder: 'Notas adicionales', ancho: 'mitad' },
      { nombre: 'reportadoPor', etiqueta: 'Reportado Por', tipo: 'texto', placeholder: 'Persona que reportó', ancho: 'mitad' },
    ],
  };
}

function seccionEtiquetaTecnico(opciones: OpcionesReporteConfig): SeccionConfig {
  return {
    titulo: 'Etiqueta y Técnico',
    campos: [
      { nombre: 'etiquetaId', etiqueta: 'Etiqueta', tipo: 'select', requerido: true, opciones: opciones.etiquetas, ancho: 'mitad' },
      { nombre: 'tecnicoId', etiqueta: 'Técnico', tipo: 'select', requerido: true, opciones: opciones.tecnicos, ancho: 'mitad' },
    ],
  };
}

function seccionDeclaracionPlantilla(opciones: OpcionesReporteConfig): SeccionConfig {
  return {
    titulo: 'Declaración y Plantilla',
    campos: [
      { nombre: 'estadoId', etiqueta: 'Declaración', tipo: 'select', requerido: true, opciones: opciones.estados, ancho: 'mitad' },
      { nombre: 'plantilla', etiqueta: 'Plantilla', tipo: 'select', opciones: opciones.plantillas, ancho: 'mitad' },
    ],
  };
}

function seccionControl(requerirNumero: boolean): SeccionConfig {
  return {
    titulo: 'Control',
    campos: [
      { nombre: 'numeroReporte', etiqueta: 'Número de Reporte', tipo: 'texto', requerido: requerirNumero, placeholder: 'Ej: REP-001', ancho: 'tercio', validacion: (v: unknown) => v && !/^REP-\d{3}$/i.test(String(v)) ? 'Formato: REP-001' : null },
      { nombre: 'fechaReporte', etiqueta: 'Fecha de Reporte', tipo: 'fecha', requerido: true, ancho: 'tercio' },
      { nombre: 'fechaAtencion', etiqueta: 'Fecha de Atención', tipo: 'fecha', requerido: true, ancho: 'tercio', validacion: (v: unknown, d?: EntidadEditable) => { const vStr = String(v ?? ''); const fr = String(d?.fechaReporte ?? ''); return vStr && fr && vStr < fr ? 'La fecha de atención no puede ser anterior a la fecha de reporte' : null; }, dependeDe: ['fechaReporte'] },
      { nombre: 'horaInicio', etiqueta: 'Hora de Inicio', tipo: 'hora', requerido: true, ancho: 'mitad' },
      { nombre: 'horaFinalizacion', etiqueta: 'Hora de Finalización', tipo: 'hora', requerido: true, ancho: 'mitad', validacion: (v: unknown, d?: EntidadEditable) => { const vStr = String(v ?? ''); const hi = String(d?.horaInicio ?? ''); return vStr && hi && vStr <= hi ? 'La hora de finalización debe ser posterior a la de inicio' : null; }, dependeDe: ['horaInicio'] },
    ],
  };
}

export function crearConfigReporteCompleto(opciones: OpcionesReporteConfig): SeccionConfig[] {
  return [
    seccionCliente(opciones),
    seccionServicio(),
    seccionEtiquetaTecnico(opciones),
    seccionDeclaracionPlantilla(opciones),
    seccionControl(true),
  ];
}

export function crearConfigReporteEdicion(opciones: OpcionesReporteConfig): SeccionConfig[] {
  return [
    seccionCliente(opciones),
    seccionServicio(),
    {
      titulo: 'Repuesto Empleado',
      campos: [
        { nombre: 'repuestoId', etiqueta: 'Repuesto', tipo: 'select', opciones: opciones.repuestos, ancho: 'completo' },
      ],
    },
    seccionEtiquetaTecnico(opciones),
    seccionDeclaracionPlantilla(opciones),
    seccionControl(false),
    {
      titulo: 'Motivo de la Modificación',
      campos: [
        {
          nombre: 'motivoModificacion',
          etiqueta: 'Motivo de la Modificación',
          tipo: 'textarea',
          requerido: true,
          placeholder: 'Indique el motivo por el cual se realiza esta modificación...',
          ancho: 'completo',
          validacion: (valor: unknown) => {
            const texto = String(valor ?? '').trim();
            if (texto.length === 0) return 'Debe indicar el motivo de la modificación';
            if (texto.length < 5) return 'El motivo debe tener al menos 5 caracteres';
            return null;
          },
        },
      ],
    },
  ];
}

/* ─── Plantillas (opciones desde la API) ─── */

export function crearConfigPlantilla(opciones: OpcionesReporteConfig): SeccionConfig[] {
  return [
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
        { nombre: 'estadoId', etiqueta: 'Estado / Declaración', tipo: 'select', opciones: opciones.estados, ancho: 'mitad' },
        { nombre: 'etiquetaId', etiqueta: 'Etiqueta', tipo: 'select', opciones: opciones.etiquetas, ancho: 'mitad' },
      ],
    },
  ];
}

/* ─── Clientes ─── */
export const CONFIG_CLIENTE: SeccionConfig[] = [
  {
    titulo: 'Datos del Cliente',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre del Cliente', tipo: 'texto', requerido: true, placeholder: 'Nombre o Razón Social', ancho: 'completo' },
      {
        nombre: 'rif',
        etiqueta: 'RIF',
        tipo: 'texto',
        requerido: true,
        placeholder: 'V-12345678, J-12345678-9',
        ancho: 'mitad',
        validacion: (valor: unknown) => {
          if (!valor || String(valor).trim() === '') return null;
          const limpio = String(valor).trim().toUpperCase();
          const PREFIJOS_RIF = /^[VJECPG]\d{5,10}(-\d{1,2})?$/;
          const PREFIJOS_SIN_GUION = /^[VJECPG]\d{5,10}$/;
          if (!PREFIJOS_RIF.test(limpio) && !PREFIJOS_SIN_GUION.test(limpio)) {
            return 'Formato inválido. Use: V-12345678, J-12345678-9, E-12345678 (letras: V, J, E, C, G, P)';
          }
          const cifros = limpio.replace(/[^0-9]/g, '');
          if (cifros.length < 5 || cifros.length > 10) {
            return 'El RIF debe tener entre 5 y 10 dígitos numéricos.';
          }
          return null;
        },
      },
      {
        nombre: 'telefono',
        etiqueta: 'Teléfono',
        tipo: 'texto',
        placeholder: '+58 412-1234567, 0412-1234567',
        ancho: 'mitad',
        validacion: (valor: unknown) => {
          if (!valor || String(valor).trim() === '') return null;
          const limpio = String(valor).trim().replace(/[\s().-]/g, '');
          if (!/^\+?\d{7,15}$/.test(limpio)) {
            return 'Teléfono inválido. Use formato: +58 412-1234567 o 0412-1234567 (7 a 15 dígitos)';
          }
          return null;
        },
      },
      { nombre: 'direccion', etiqueta: 'Dirección', tipo: 'textarea', placeholder: 'Dirección completa', ancho: 'completo' },
      { nombre: 'email', etiqueta: 'Correo Electrónico', tipo: 'texto', placeholder: 'cliente@ejemplo.com', ancho: 'mitad', validacion: (valor: unknown) => valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor)) ? 'Correo electrónico inválido' : null },
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

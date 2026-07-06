# Gestión de Usuarios - Sistema Sigret

> **Versión:** 1.0  
> **Última actualización:** Julio 2026  
> **Módulo:** `frontend/src/componentes/gestion_usuarios/`

---

## 📂 Estructura de Archivos

```
frontend/src/componentes/gestion_usuarios/
├── gestion_usuarios.tsx              ← Componente orquestador principal
├── gestion_usuarios.css              ← Estilos parametrizados con variables de Global.css
├── index.ts                          ← Punto de exportación del módulo
├── types/
│   └── index.ts                      ← Definiciones de tipos (FiltrosUsuarios, UsuarioFormData)
├── hooks/
│   └── useGestionUsuarios.ts         ← Lógica CRUD, filtros, fusión de permisos
└── components/
    ├── FiltrosUsuarios.tsx           ← Componente de filtros de búsqueda
    └── LeyendaRoles.tsx              ← Componente informativo de roles y permisos
```

### Página asociada

```
frontend/src/pages/Gestion_usuarios.tsx  ← Página wrapper para el router
```

---

## 🧩 Componentes

### `GestionUsuarios` (`gestion_usuarios.tsx`)

**Responsabilidad:** Orquestar subcomponentes y estado global de la sección.

**Props:** Ninguna (usa el hook `useGestionUsuarios` internamente).

**Estructura visual:**
1. **Header** - Título, descripción y botón "Agregar Usuario"
2. **Filtros** - Componente `FiltrosUsuarios` para búsqueda
3. **Tabla** - Componente `TablaGenerica` (reutilizable) con datos de usuarios
4. **Leyenda de Roles** - Componente `LeyendaRoles` informativo
5. **Modal de edición/creación** - `FormularioEdicion` con configuración según modo
6. **Modal de confirmación** - `ModalConfirmacion` para eliminar usuarios

### `FiltrosUsuarios` (`components/FiltrosUsuarios.tsx`)

**Responsabilidad:** Renderizar y gestionar los filtros de búsqueda.

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `filtros` | `FiltrosUsuarios` | Estado actual de los filtros |
| `onActualizarFiltro` | `(e) => void` | Callback al cambiar un filtro |
| `onLimpiarFiltros` | `() => void` | Callback para limpiar todos los filtros |

**Campos de filtro:**
- **Usuario** - Input de texto con icono de búsqueda
- **Nombre** - Input de texto
- **Rol** - Select con opciones: Todos, Administrador, Técnico, Administrativo

### `LeyendaRoles` (`components/LeyendaRoles.tsx`)

**Responsabilidad:** Mostrar tabla informativa de roles con sus permisos por defecto.

**Props:** Ninguna (usa constantes del hook internamente).

**Contenido:**
- Administrador: badge rojo + lista de 5 permisos
- Técnico: badge azul + lista de 2 permisos
- Administrativo: badge verde + lista de 4 permisos

---

## 🪝 Hook: `useGestionUsuarios`

**Archivo:** `hooks/useGestionUsuarios.ts`

**Responsabilidad:** Gestionar el estado y la lógica de negocio de los usuarios.

### Estado interno

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `usuarios` | `UsuarioData[]` | Lista completa de usuarios |
| `filtros` | `FiltrosUsuarios` | Estado de los filtros activos |
| `usuarioEditando` | `UsuarioData \| null` | Usuario siendo editado/creado |
| `modoCrear` | `boolean` | `true` si está en modo creación |
| `cargando` | `boolean` | Indicador de carga |

### Retorno del hook

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `usuarios` | `UsuarioData[]` | Usuarios filtrados |
| `todosUsuarios` | `UsuarioData[]` | Todos los usuarios sin filtrar |
| `filtros` | `FiltrosUsuarios` | Estado actual de filtros |
| `usuarioEditando` | `UsuarioData \| null` | Usuario en edición |
| `cargando` | `boolean` | Estado de carga |
| `modoCrear` | `boolean` | Modo creación activo |
| `actualizarFiltro` | `(e) => void` | Actualiza un filtro por nombre |
| `limpiarFiltros` | `() => void` | Reinicia todos los filtros |
| `iniciarEdicion` | `(usuario) => void` | Prepara un usuario para editar |
| `iniciarCreacion` | `() => void` | Prepara el formulario para crear |
| `guardarEdicion` | `(datos) => Promise<boolean>` | Guarda (crea o actualiza) |
| `eliminarUsuario` | `(usuario) => Promise<boolean>` | Elimina un usuario |
| `cancelarEdicion` | `() => void` | Cancela la edición/creación |

### Constantes exportadas

| Constante | Tipo | Descripción |
|-----------|------|-------------|
| `PERMISOS_POR_ROL` | `Record<UserRole, Permission[]>` | Mapa de permisos base por rol |
| `ETIQUETAS_PERMISOS` | `Record<Permission, string>` | Etiquetas legibles para cada permiso |
| `OPCIONES_ROLES` | `Array<{value, label}>` | Opciones para select de roles |
| `OPCIONES_PERMISOS` | `Array<{value, label}>` | Opciones para select de permisos |

---

## 🔐 Lógica de Permisos

### Fusión automática de permisos

Al guardar un usuario (crear o editar), el hook ejecuta la siguiente lógica:

```typescript
// 1. Obtener permisos base del rol seleccionado
const permisosBase = PERMISOS_POR_ROL[role]; // ej: ['view-estadisticas', 'view-busqueda-reportes']

// 2. Obtener permisos adicionales seleccionados manualmente
const permisosAdicionales = datos.permissions; // ej: ['view-registro-reportes']

// 3. Fusionar y eliminar duplicados
const permisosFinales = Array.from(new Set([...permisosBase, ...permisosAdicionales]));
// Resultado: ['view-estadisticas', 'view-busqueda-reportes', 'view-registro-reportes']
```

### Permisos base por rol

| Rol | Permisos base |
|-----|---------------|
| **Administrador** | Ver Estadísticas, Registrar Reportes, Buscar Reportes, Gestionar Registros, Gestionar Usuarios |
| **Técnico** | Ver Estadísticas, Buscar Reportes |
| **Administrativo** | Ver Estadísticas, Registrar Reportes, Buscar Reportes, Gestionar Registros |

---

## 📋 Tipos

**Archivo:** `types/index.ts`

```typescript
/** Filtros para la tabla de usuarios */
interface FiltrosUsuarios {
  username: string;
  role: UserRole | '';
  nombreCompleto: string;
}

/** Datos extendidos para formulario de usuario (incluye password) */
interface UsuarioFormData {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  permissions: Permission[];
  nombreCompleto: string;
  email: string;
}
```

Los tipos `UserRole`, `Permission` y `UsuarioData` se importan desde `@/data/usuarios`.

---

## 🎨 Configuraciones de Formulario

**Archivo:** `frontend/src/componentes/formulario_edicion/configuraciones.ts`

### `CONFIG_USUARIO_CREAR` (Crear usuario)

| Sección | Campos |
|---------|--------|
| Datos de Acceso | username (requerido), password (requerido, ≥ 6 caracteres) |
| Datos Personales (Opcional) | nombreCompleto, email (validación de formato) |
| Rol y Permisos Adicionales | role (requerido, select), permissions (opcional, lista-items) |

### `CONFIG_USUARIO_EDITAR` (Editar usuario - SIN contraseña)

| Sección | Campos |
|---------|--------|
| Datos del Usuario | username (deshabilitado), nombreCompleto, email |
| Rol y Permisos Adicionales | role (requerido, select), permissions (opcional, lista-items) |

---

## 🛡️ Seguridad

- **Contraseña oculta en edición**: El formulario de edición no incluye campo de contraseña
- **Email enmascarado en tabla**: Se muestra solo el inicio y dominio (ej: `ad**n@sistema.com`)
- **Protección de eliminación**: El usuario `admin` no puede ser eliminado
- **Acceso restringido**: Solo usuarios con rol `admin` y permiso `view-gestion-usuarios` pueden acceder (configurado en sidebar y routing)

---

## 🔌 Integración con el Sistema

### Ruta
```
/home/gestion-usuarios
```

### Permiso requerido
```typescript
requiredPermission: "view-gestion-usuarios"
```

### Roles permitidos
```typescript
allowedRoles: ["admin"]
```

### Sidebar
El menú "Gestión de Usuarios" se muestra solo para usuarios admin con el permiso `view-gestion-usuarios`.

---

## 📦 Dependencias del Módulo

| Dependencia | Propósito |
|-------------|-----------|
| `@/data/usuarios` | Tipos `UsuarioData`, `UserRole`, `Permission` y datos `USUARIOS_REGISTRADOS` |
| `@/componentes/gestion_registros` | Componentes `TablaGenerica` y `ModalConfirmacion` |
| `@/componentes/formulario_edicion` | Componente `FormularioEdicion` y configuraciones `CONFIG_USUARIO_CREAR`, `CONFIG_USUARIO_EDITAR` |
| `lucide-react` | Iconos (Plus, Edit3, Trash2, Search, RotateCcw, Info) |

---

## 🧪 Datos de Prueba

Los usuarios actualmente se cargan desde `USUARIOS_REGISTRADOS` en `@/data/usuarios.ts`:

| Usuario | Rol | Permisos |
|---------|-----|----------|
| `admin` | Administrador | Todos |
| `tecnico` | Técnico | Ver Estadísticas, Buscar Reportes |
| `administrativo` | Administrativo | Ver Estadísticas, Registrar Reportes, Buscar Reportes, Gestionar Registros |

> **Nota:** En producción, estos datos deben reemplazarse por llamadas a una API REST.
# Flujo de Trabajo y Lógica: Autenticación y Gestión de Usuarios

## Tabla de Contenidos

1. [Arquitectura General](#1-arquitectura-general)
2. [Base de Datos](#2-base-de-datos)
3. [Flujo de Inicio de Sesión (Login)](#3-flujo-de-inicio-de-sesión-login)
4. [Flujo de Registro de Usuarios](#4-flujo-de-registro-de-usuarios)
5. [Sistema de Permisos](#5-sistema-de-permisos)
6. [Sistema de Roles](#6-sistema-de-roles)
7. [Protección de Rutas (Frontend)](#7-protección-de-rutas-frontend)
8. [Middlewares de Autenticación y Autorización (Backend)](#8-middlewares-de-autenticación-y-autorización-backend)
9. [Flujo de Edición de Usuarios](#9-flujo-de-edición-de-usuarios)
10. [Flujo de Eliminación de Usuarios (Soft Delete)](#10-flujo-de-eliminación-de-usuarios-soft-delete)
11. [Refresco de Permisos](#11-refresco-de-permisos)
12. [Cierre de Sesión (Logout)](#12-cierre-de-sesión-logout)
13. [Resumen de Endpoints](#13-resumen-de-endpoints)
14. [Flujo Visual Completo](#14-flujo-visual-completo)

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│                                                     │
│  LoginPage ──► AuthContext.login() ──► fetch(API)    │
│                    │                                │
│                    ▼                                │
│              sessionStorage                        │
│              (token + user)                        │
│                    │                                │
│                    ▼                                │
│              ProtectedRoute                        │
│              (rol + permisos)                       │
│                    │                                │
│                    ▼                                │
│              AppSidebar                             │
│              (menú filtrado)                        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (Bearer token)
                       ▼
┌─────────────────────────────────────────────────────┐
│                    BACKEND (Express)                 │
│                                                     │
│  auth.js:    login, logout, perfil,                 │
│              cambiar-contraseña, refresh-permissions │
│                                                     │
│  usuarios.js: register, GET /, GET /:id,            │
│               PUT /:id, DELETE /:id                 │
│                                                     │
│  Middlewares: verificarToken (JWT)                  │
│              requiereAdmin (rol_id === 1)           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                   │
│                                                     │
│  usuarios, roles, permisos_adicionales,             │
│  permisos_usuarios                                  │
└─────────────────────────────────────────────────────┘
```

**Stack:**
- **Frontend:** React 19 + TypeScript + React Router + Axios
- **Backend:** Express + Node.js + JWT + bcrypt
- **Base de datos:** PostgreSQL (Supabase)

---

## 2. Base de Datos

### Tablas involucradas

| Tabla | Propósito | Campos clave |
|-------|-----------|--------------|
| `usuarios` | Almacena los usuarios del sistema | `id`, `nombre_usuario`, `apellido_usuario`, `email_usuario`, `contraseña_usuario` (hash bcrypt), `rol_usuario` (FK → roles.id), `is_delete` (soft delete) |
| `roles` | Catálogo de roles | `id` (1=Admin, 2=Técnico, 3=Administrativo), `nombre_rol` |
| `permisos_adicionales` | Catálogo de permisos del sistema | `id`, `nombre_permiso` (ej: `view-estadisticas`), `valor_permiso` |
| `permisos_usuarios` | Tabla intermedia (relación N:N) | `permiso_usuario` (FK → permisos_adicionales.id), `usuario_permiso` (FK → usuarios.id) |

### Diagrama de relaciones

```
roles (1) ──────< (N) usuarios
                         │
                         │
usuarios (N) >────< (N) permisos_adicionales
                    [tabla intermedia: permisos_usuarios]
```

### Reglas de integridad

- **Soft delete:** Los usuarios nunca se eliminan físicamente. Se marca `is_delete = true` para mantener referencias con otras tablas (reportes, servicios técnicos, etc.).
- **Contraseña:** Almacena siempre hash bcrypt, nunca texto plano.
- **Email único:** El email debe ser único entre usuarios activos.
- **Permisos:** Un permiso puede ser compartido por múltiples usuarios.

---

## 3. Flujo de Inicio de Sesión (Login)

### 3.1. Secuencia del Login

```
┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌────────────┐
│ Usuario  │     │  LoginPage   │     │  Auth    │     │  Supabase  │
│          │     │  (Frontend)  │     │  (API)   │     │  (DB)      │
└────┬─────┘     └──────┬──────┘     └────┬─────┘     └─────┬──────┘
     │                  │                  │                  │
     │  1. Ingresa      │                  │                  │
     │  email + pass    │                  │                  │
     │─────────────────>│                  │                  │
     │                  │                  │                  │
     │                  │  2. POST         │                  │
     │                  │  /api/auth/login │                  │
     │                  │─────────────────>│                  │
     │                  │                  │                  │
     │                  │                  │  3. Busca usuario│
     │                  │                  │  por email o     │
     │                  │                  │  nombre_usuario  │
     │                  │                  │─────────────────>│
     │                  │                  │                  │
     │                  │                  │  4. Retorna      │
     │                  │                  │  usuario + hash  │
     │                  │                  │<─────────────────│
     │                  │                  │                  │
     │                  │                  │  5. bcrypt.compare│
     │                  │                  │  (pass vs hash)  │
     │                  │                  │                  │
     │                  │                  │  6. Consulta      │
     │                  │                  │  permisos_usuarios│
     │                  │                  │─────────────────>│
     │                  │                  │                  │
     │                  │                  │  7. Retorna      │
     │                  │                  │  permisos        │
     │                  │                  │<─────────────────│
     │                  │                  │                  │
     │                  │                  │  8. Genera JWT   │
     │                  │                  │  (id, email,     │
     │                  │                  │   rol, permisos) │
     │                  │                  │                  │
     │                  │  9. Retorna      │                  │
     │                  │  {token, usuario}│                  │
     │                  │<─────────────────│                  │
     │                  │                  │                  │
     │                  │  10. Guarda en sessionStorage      │
     │                  │  (token + user data)               │
     │                  │                  │                  │
     │                  │  11. Redirige a  │                  │
     │                  │  /home           │                  │
     │<─────────────────│                  │                  │
     │                  │                  │                  │
```

### 3.2. Lógica del Backend (`auth.js` → POST `/login`)

1. **Validación de entrada:** Verifica que `email_usuario` (o `usuario`) y `contraseña` estén presentes.

2. **Búsqueda de usuario:**
   - Si el campo contiene `@` → busca por `email_usuario`
   - Si no contiene `@` → busca por `nombre_usuario`
   - Filtra por `is_delete = false` (solo usuarios activos)

3. **Verificación de contraseña:**
   - Usa `bcrypt.compare()` para comparar la contraseña enviada con el hash almacenado
   - Si no coincide → retorna 401 "Credenciales incorrectas"

4. **Obtención de permisos:**
   - Consulta la tabla `permisos_usuarios` con JOIN a `permisos_adicionales`
   - Retorna array de objetos `{ id, nombre, valor }`

5. **Generación del JWT:**
   ```javascript
   {
     id: usuario.id,
     email: usuario.email_usuario,
     rol_id: usuario.rol_usuario,
     rol_nombre: "admin" | "tecnico" | "administrativo",
     permisos: ["view-estadisticas", "view-registro-reportes", ...]
   }
   ```
   - Expiración: 8 horas (configurable via `JWT_EXPIRES_IN`)

6. **Respuesta:** `{ token, usuario: { id, nombre_usuario, apellido_usuario, email, rol, permisos } }`

### 3.3. Lógica del Frontend (`AuthContext.tsx` → `login()`)

1. **Envía credenciales** al endpoint `/api/auth/login`

2. **Guarda el token** en `sessionStorage` con clave `sigret_token`

3. **Mapea el rol** del backend al frontend:
   ```
   "admin"          → "admin"
   "tecnico"        → "tecnico"
   "administrativo" → "administrativo"
   ```

4. **Mapea permisos** del backend a permisos del frontend:
   - Si el nombre coincide con `view-*` → se acepta directamente
   - Compatibilidad con permisos antiguos: `ver_usuarios` → `view-gestion-usuarios`

5. **Agrega permisos por defecto según el rol:**

   | Rol | Permisos asignados automáticamente |
   |-----|-------------------------------------|
   | Admin | Todos (5 permisos) |
   | Técnico | `view-estadisticas`, `view-busqueda-reportes` |
   | Administrativo | `view-estadisticas`, `view-registro-reportes`, `view-busqueda-reportes`, `view-gestion-registros` |

6. **Construye el objeto `User`:**
   ```typescript
   {
     id: number,
     username: nombre_usuario,
     nombre_completo: "nombre apellido",
     email: email,
     role: "admin" | "tecnico" | "administrativo",
     permissions: Permission[]
   }
   ```

7. **Guarda en `sessionStorage`** con clave `sigret_user`

---

## 4. Flujo de Registro de Usuarios

### 4.1. Quién puede crear usuarios

Solo los usuarios con **rol de administrador** (rol_id = 1) pueden crear nuevos usuarios.

### 4.2. Secuencia del Registro

```
Admin (Frontend)         Backend (usuarios.js)         Supabase
      │                          │                          │
      │  1. POST                 │                          │
      │  /api/usuarios/register  │                          │
      │  (con Bearer token)      │                          │
      │─────────────────────────>│                          │
      │                          │                          │
      │                          │  2. verificarToken()      │
      │                          │  (valida JWT)            │
      │                          │                          │
      │                          │  3. requiereAdmin()      │
      │                          │  (rol_id === 1)          │
      │                          │                          │
      │                          │  4. Valida campos:       │
      │                          │  - nombre_usuario        │
      │                          │  - contraseña (≥6 chars) │
      │                          │  - rol_usuario (1-3)     │
      │                          │                          │
      │                          │  5. Verifica email único │
      │                          │─────────────────────────>│
      │                          │                          │
      │                          │  6. bcrypt.hash(pass)    │
      │                          │                          │
      │                          │  7. INSERT usuario       │
      │                          │─────────────────────────>│
      │                          │                          │
      │                          │  8. resolverPermisos()   │
      │                          │  (upsert en              │
      │                          │   permisos_adicionales)  │
      │                          │─────────────────────────>│
      │                          │                          │
      │                          │  9. INSERT permisos      │
      │                          │  en permisos_usuarios    │
      │                          │─────────────────────────>│
      │                          │                          │
      │  10. Retorna usuario     │                          │
      │<─────────────────────────│                          │
```

### 4.3. Lógica del Backend (`usuarios.js` → POST `/register`)

1. **Autenticación:** `verificarToken` valida el JWT del admin que crea el usuario.

2. **Autorización:** `requiereAdmin` verifica que `req.usuario.rol_id === 1`.

3. **Validación de campos obligatorios:**
   - `nombre_usuario`: string no vacío
   - `contraseña`: string con mínimo 6 caracteres
   - `rol_usuario`: número válido (1, 2 o 3)

4. **Verificación de email único:**
   - Consulta `usuarios` donde `email_usuario` = email enviado y `is_delete = false`
   - Si ya existe → retorna 409 "El email ya está registrado"

5. **Hasheo de contraseña:**
   ```javascript
   const hash = await bcrypt.hash(contraseña, 10); // 10 rondas de salt
   ```

6. **Inserción del usuario:**
   ```sql
   INSERT INTO usuarios (nombre_usuario, apellido_usuario, email_usuario,
                         contraseña_usuario, rol_usuario)
   VALUES (...)
   RETURNING id, nombre_usuario, apellido_usuario, email_usuario,
             rol_usuario, roles(id, nombre_rol)
   ```

7. **Resolución de permisos** (`resolverPermisos()`):
   - Recibe un array de permisos (strings como `"view-estadisticas"` o IDs numéricos)
   - Para cada permiso string:
     - Intenta `upsert` en `permisos_adicionales` (inserta si no existe, ignora si ya existe)
     - Si el upsert falla, busca el permiso existente
   - Retorna array de IDs resueltos

8. **Inserción de permisos en tabla intermedia:**
   ```sql
   INSERT INTO permisos_usuarios (permiso_usuario, usuario_permiso)
   VALUES (permiso_id, nuevo_usuario_id), ...
   ```

9. **Respuesta:** Usuario formateado (sin contraseña) con sus permisos.

---

## 5. Sistema de Permisos

### 5.1. Permisos del Sistema

El sistema define **5 permisos** que controlan el acceso a las secciones del menú:

| Permiso | Sección | Descripción |
|---------|---------|-------------|
| `view-estadisticas` | Inicio | Ver estadísticas y dashboard |
| `view-registro-reportes` | Registrar Reportes | Crear nuevos reportes de servicio |
| `view-busqueda-reportes` | Búsqueda de Reportes | Buscar y ver reportes existentes |
| `view-gestion-registros` | Gestión de Registros | Administrar registros del sistema |
| `view-gestion-usuarios` | Gestión de Usuarios | CRUD completo de usuarios |

### 5.2. Permisos por Rol (Por Defecto)

| Rol | view-estadisticas | view-registro-reportes | view-busqueda-reportes | view-gestion-registros | view-gestion-usuarios |
|-----|:--:|:--:|:--:|:--:|:--:|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Técnico** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Administrativo** | ✅ | ✅ | ✅ | ✅ | ❌ |

> **Nota:** Los permisos por defecto se asignan automáticamente en el frontend (`AuthContext.tsx`). Un admin puede otorgar permisos adicionales a través de la gestión de usuarios, pero los permisos base del rol siempre están presentes.

### 5.3. Flujo de Permisos

```
Backend (DB)                    Frontend (AuthContext)
      │                                │
      │  permisos_adicionales          │
      │  ┌─────────────────────┐       │
      │  │ view-estadisticas   │       │
      │  │ view-registro-...   │──────>│  Mapea a Permission[]
      │  │ view-busqueda-...   │       │  + agrega defaults
      │  │ view-gestion-...    │       │  según rol
      │  │ view-gestion-...    │       │
      │  └─────────────────────┘       │
      │                                │
      │  permisos_usuarios (N:N)       │
      │  ┌─────────────────────┐       │
      │  │ usuario → permiso   │       │
      │  └─────────────────────┘       │
      │                                │
      │                    ┌───────────┘
      │                    │
      │                    ▼
      │              ProtectedRoute
      │              verifica:
      │              1. Rol permitido
      │              2. Permiso requerido
      │                    │
      │                    ▼
      │              AppSidebar
      │              filtra menú según
      │              rol + permisos
```

---

## 6. Sistema de Roles

### 6.1. Roles Definidos

| ID | Nombre | Descripción | Acceso |
|----|--------|-------------|--------|
| 1 | Administrador | Acceso total al sistema | Todas las secciones + gestión de usuarios |
| 2 | Técnico | Técnico de campo | Inicio (estadísticas) + Búsqueda de reportes |
| 3 | Administrativo | Personal administrativo | Inicio + Registro + Búsqueda + Gestión de registros |

### 6.2. Protección de Roles en el Backend

- **Solo admin puede:** crear, editar y eliminar usuarios
- **Un admin no puede:** modificar la cuenta de otro admin
- **Un admin no puede:** eliminarse a sí mismo
- **Un admin no puede:** cambiar su propio rol

---

## 7. Protección de Rutas (Frontend)

### 7.1. Componente `ProtectedRoute`

Ubicación: `src/componentes/ProtectedRoute.tsx`

```typescript
interface ProtectedRouteProps {
  allowedRoles?: UserRole[];        // Roles permitidos
  requiredPermissions?: Permission[]; // Permisos requeridos
  requireAllPermissions?: boolean;  // true = todos, false = cualquiera
  children: ReactNode;
}
```

**Lógica de evaluación:**

```
¿El usuario está autenticado?
  ├─ NO → Redirigir a "/" (login)
  └─ SÍ → ¿Tiene un rol permitido?
            ├─ NO → Redirigir a "/home"
            └─ SÍ → ¿Tiene los permisos requeridos?
                      ├─ NO → Redirigir a "/home"
                      └─ SÍ → Renderizar el componente hijo
```

### 7.2. Rutas Protegidas

| Ruta | Roles permitidos | Permiso requerido |
|------|------------------|-------------------|
| `/` | Todos | Ninguno (es la página de login) |
| `/home` | admin, tecnico, administrativo | `view-estadisticas` |
| `/home/registro-reportes` | admin, administrativo | `view-registro-reportes` |
| `/home/busqueda-reportes` | admin, tecnico, administrativo | `view-busqueda-reportes` |
| `/home/gestion-registros` | admin, administrativo | `view-gestion-registros` |
| `/home/gestion-usuarios` | admin | `view-gestion-usuarios` |

### 7.3. Filtrado del Menú (`AppSidebar.tsx`)

El sidebar filtra los elementos del menú según:
1. El **rol** del usuario debe estar en `allowedRoles`
2. El **permiso** requerido debe estar en `user.permissions`

```typescript
const filteredItems = menuItems.filter(
  (item) =>
    user &&
    item.allowedRoles.includes(user.role) &&
    (item.requiredPermission
      ? user.permissions.includes(item.requiredPermission)
      : true)
);
```

---

## 8. Middlewares de Autenticación y Autorización (Backend)

### 8.1. `verificarToken` (auth.js)

```
Header: Authorization: Bearer <token>
         │
         ▼
¿Existe el header?
  ├─ NO → 401 "Token requerido"
  └─ SÍ → Extrae el token
           │
           ▼
           jwt.verify(token, JWT_SECRET)
           │
           ├─ TokenExpiredError → 401 "Token expirado"
           ├─ Otro error → 401 "Token inválido"
           └─ Válido → req.usuario = decoded
                       next()
```

**Contenido decodificado del JWT:**
```javascript
{
  id: number,        // ID del usuario
  email: string,     // Email del usuario
  rol_id: number,    // ID del rol (1, 2, 3)
  rol_nombre: string,// Nombre del rol
  permisos: string[] // Nombres de permisos
}
```

### 8.2. `requiereAdmin` (usuarios.js)

```
¿req.usuario existe?
  ├─ NO → 401 "Autenticación requerida"
  └─ SÍ → ¿req.usuario.rol_id === 1?
            ├─ NO → 403 "Se requieren permisos de administrador"
            └─ SÍ → next()
```

### 8.3. Aplicación de Middlewares en Endpoints

| Endpoint | Middlewares | Propósito |
|----------|-------------|-----------|
| `POST /api/auth/login` | Ninguno | Acceso público |
| `POST /api/auth/logout` | `verificarToken` | Cerrar sesión |
| `GET /api/auth/perfil` | `verificarToken` | Ver perfil propio |
| `PUT /api/auth/cambiar-contraseña` | `verificarToken` | Cambiar contraseña propia |
| `GET /api/auth/refresh-permissions` | `verificarToken` | Refrescar permisos |
| `POST /api/usuarios/register` | `verificarToken` + `requiereAdmin` | Crear usuario |
| `GET /api/usuarios` | `verificarToken` | Listar usuarios |
| `GET /api/usuarios/:id` | `verificarToken` | Ver usuario específico |
| `GET /api/usuarios/roles` | `verificarToken` | Listar roles |
| `GET /api/usuarios/permisos-adicionales` | `verificarToken` | Listar permisos disponibles |
| `PUT /api/usuarios/:id` | `verificarToken` + `requiereAdmin` | Editar usuario |
| `DELETE /api/usuarios/:id` | `verificarToken` + `requiereAdmin` | Eliminar usuario (soft delete) |

---

## 9. Flujo de Edición de Usuarios

### 9.1. Restricciones de Edición

| Escenario | Permitido |
|-----------|-----------|
| Admin edita un técnico | ✅ |
| Admin edita un administrativo | ✅ |
| Admin edita otro admin | ❌ (403 "No se permiten modificar cuentas de administrador") |
| Admin se edita a sí mismo | ✅ (solo nombre, apellido, email, contraseña) |
| Admin cambia su propio rol | ❌ (400 "No puedes cambiar tu propio rol de administrador") |

### 9.2. Secuencia de Edición

```
Admin (Frontend)         Backend (usuarios.js)         Supabase
      │                          │                          │
      │  1. PUT                  │                          │
      │  /api/usuarios/:id       │                          │
      │─────────────────────────>│                          │
      │                          │                          │
      │                          │  2. verificarToken        │
      │                          │  3. requiereAdmin         │
      │                          │                          │
      │                          │  4. Verifica que el       │
      │                          │  usuario destino existe   │
      │                          │─────────────────────────>│
      │                          │                          │
      │                          │  5. ¿Es admin el         │
      │                          │  destino? → Bloquear     │
      │                          │                          │
      │                          │  6. ¿Es auto-modificación│
      │                          │  de rol? → Bloquear      │
      │                          │                          │
      │                          │  7. Si cambia email:     │
      │                          │  verificar unicidad       │
      │                          │─────────────────────────>│
      │                          │                          │
      │                          │  8. UPDATE usuarios      │
      │                          │─────────────────────────>│
      │                          │                          │
      │                          │  9. Si cambian permisos:  │
      │                          │  DELETE + INSERT          │
      │                          │  permisos_usuarios        │
      │                          │─────────────────────────>│
      │                          │                          │
      │  10. Retorna usuario     │                          │
      │<─────────────────────────│                          │
```

---

## 10. Flujo de Eliminación de Usuarios (Soft Delete)

### 10.1. Concepto de Soft Delete

Los usuarios **nunca se eliminan físicamente** de la base de datos. En su lugar, se marca el campo `is_delete = true`. Esto es necesario porque:

- Otros registros (reportes, servicios técnicos, modificaciones) referencian al usuario
- Eliminar físicamente rompería la integridad referencial
- Permite recuperación de datos si es necesario

### 10.2. Restricciones de Eliminación

| Escenario | Permitido |
|-----------|-----------|
| Admin elimina un técnico | ✅ |
| Admin elimina un administrativo | ✅ |
| Admin elimina otro admin | ❌ (403 "No se permiten eliminar cuentas de administrador") |
| Admin se elimina a sí mismo | ❌ (400 "No puedes eliminar tu propia cuenta") |
| Usuario ya eliminado | ❌ (404 "Usuario no encontrado") |

### 10.3. Flujo de Eliminación

```
Admin (Frontend)         Backend (usuarios.js)         Supabase
      │                          │                          │
      │  1. Click "Eliminar"     │                          │
      │     (ModalConfirmación   │                          │
      │      o ModalEliminarAdmin│                          │
      │      si es admin)        │                          │
      │                          │                          │
      │  2. DELETE               │                          │
      │  /api/usuarios/:id       │                          │
      │─────────────────────────>│                          │
      │                          │                          │
      │                          │  3. verificarToken        │
      │                          │  4. requiereAdmin         │
      │                          │                          │
      │                          │  5. ¿usuarioId ===       │
      │                          │  req.usuario.id?          │
      │                          │  SÍ → 400 "No puedes     │
      │                          │  eliminar tu cuenta"      │
      │                          │                          │
      │                          │  6. Busca usuario        │
      │                          │  destino                  │
      │                          │─────────────────────────>│
      │                          │                          │
      │                          │  7. ¿Es admin? → 403     │
      │                          │  "No se permiten         │
      │                          │  eliminar admin"          │
      │                          │                          │
      │                          │  8. UPDATE usuarios       │
      │                          │  SET is_delete = true     │
      │                          │  WHERE id = :id           │
      │                          │  AND is_delete = false    │
      │                          │─────────────────────────>│
      │                          │                          │
      │  9. Retorna success      │                          │
      │<─────────────────────────│                          │
      │                          │                          │
      │  10. Frontend remueve    │                          │
      │  de la lista             │                          │
```

### 10.4. Lógica del Frontend

- **Usuarios normales:** Se muestra `ModalConfirmacion` con mensaje de confirmación
- **Usuarios admin:** Se muestra `ModalEliminarAdmin` que requiere escribir el nombre del usuario para confirmar

---

## 11. Refresco de Permisos

### 11.1. Problema que Resuelve

Cuando un admin modifica los permisos de un usuario, ese usuario no ve los cambios hasta cerrar sesión y volver a iniciar. El endpoint `refresh-permissions` permite actualizar los permisos sin re-login.

### 11.2. Flujo

```
Frontend (AuthContext)      Backend (auth.js)         Supabase
      │                          │                       │
      │  1. GET                   │                       │
      │  /api/auth/               │                       │
      │  refresh-permissions      │                       │
      │  (con Bearer token)       │                       │
      │─────────────────────────>│                       │
      │                          │                       │
      │                          │  2. verificarToken     │
      │                          │                       │
      │                          │  3. Busca usuario     │
      │                          │  actualizado           │
      │                          │──────────────────────>│
      │                          │                       │
      │                          │  4. Consulta permisos  │
      │                          │  actualizados          │
      │                          │──────────────────────>│
      │                          │                       │
      │                          │  5. Genera nuevo JWT   │
      │                          │  con permisos frescos  │
      │                          │                       │
      │  6. Retorna nuevo token   │                       │
      │  + usuario actualizado    │                       │
      │<─────────────────────────│                       │
      │                          │                       │
      │  7. Actualiza             │                       │
      │  sessionStorage           │                       │
      │  + estado React           │                       │
```

---

## 12. Cierre de Sesión (Logout)

### 12.1. Flujo

```
Frontend                   Backend
    │                         │
    │  1. Click "Cerrar       │
    │     sesión" en sidebar  │
    │                         │
    │  2. POST /api/auth/     │
    │     logout              │
    │    (con Bearer token)   │
    │────────────────────────>│
    │                         │
    │                         │  3. verificarToken()
    │                         │  (valida que el token
    │                         │   sea válido)
    │                         │
    │  4. Respuesta OK        │
    │<────────────────────────│
    │                         │
    │  5. Limpia estado:      │
    │  - user = null          │
    │  - sessionStorage.clear │
    │                         │
    │  6. Navega a "/"        │
    │  (página de login)      │
```

**Nota:** Con JWT, el logout es principalmente del lado del cliente. El token sigue siendo válido hasta que expire (8 horas). En una aplicación de producción, se debería implementar una blacklist de tokens en el servidor.

---

## 13. Resumen de Endpoints

### Autenticación (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/login` | No | Iniciar sesión |
| POST | `/logout` | Sí | Cerrar sesión |
| GET | `/perfil` | Sí | Obtener perfil del usuario autenticado |
| PUT | `/cambiar-contraseña` | Sí | Cambiar contraseña propia |
| GET | `/refresh-permissions` | Sí | Refrescar permisos desde la DB |

### Usuarios (`/api/usuarios`)

| Método | Ruta | Auth | Admin | Descripción |
|--------|------|:----:|:-----:|-------------|
| POST | `/register` | Sí | Sí | Crear nuevo usuario |
| GET | `/` | Sí | No | Listar todos los usuarios activos |
| GET | `/:id` | Sí | No | Obtener usuario por ID |
| GET | `/roles` | Sí | No | Listar roles disponibles |
| GET | `/permisos-adicionales` | Sí | No | Listar permisos disponibles |
| PUT | `/:id` | Sí | Sí | Actualizar usuario |
| DELETE | `/:id` | Sí | Sí | Soft delete de usuario |

---

## 14. Flujo Visual Completo

### Inicio de Sesión → Navegación → Cierre

```
 ┌──────────────────────────────────────────────────────────┐
 │                     PÁGINA DE LOGIN                      │
 │                                                          │
 │  ┌─────────────────────────────┐                         │
 │  │  Email: admin@ejemplo.com   │                         │
 │  │  Contraseña: ********       │                         │
 │  │                             │                         │
 │  │  [Iniciar Sesión]           │                         │
 │  └─────────────────────────────┘                         │
 │                         │                                │
 │                         ▼                                │
 │              POST /api/auth/login                        │
 │                         │                                │
 │                         ▼                                │
 │              Backend valida credenciales                 │
 │              + genera JWT + retorna permisos             │
 │                         │                                │
 │                         ▼                                │
 │              AuthContext.login()                         │
 │              Guarda token + user en sessionStorage       │
 │                         │                                │
 │                         ▼                                │
 │              Redirige a /home                            │
 └───────────────────────────┬──────────────────────────────┘
                             │
                             ▼
 ┌──────────────────────────────────────────────────────────┐
 │                    APLICACIÓN PRINCIPAL                   │
 │                                                          │
 │  ┌──────────┐  ┌──────────────────────────────────────┐  │
 │  │ SIDEBAR  │  │  CONTENIDO                           │  │
 │  │          │  │                                      │  │
 │  │ Inicio   │  │  ProtectedRoute verifica:            │  │
 │  │ Registrar│  │  1. ¿Usuario autenticado?            │  │
 │  │ Buscar   │  │  2. ¿Rol permitido?                  │  │
 │  │ Gestión  │  │  3. ¿Permiso requerido?              │  │
 │  │ Usuarios │  │                                      │  │
 │  │          │  │  Si todo OK → Renderiza componente    │  │
 │  │ ─────── │  │  Si no → Redirige a /home o /        │  │
 │  │ Cerrar  │  │                                      │  │
 │  │ sesión  │  │                                      │  │
 │  └──────────┘  └──────────────────────────────────────┘  │
 │                                                          │
 │  El sidebar solo muestra las secciones que el usuario    │
 │  tiene acceso (rol + permisos)                           │
 └───────────────────────────┬──────────────────────────────┘
                             │
                             ▼
                    POST /api/auth/logout
                    Limpia sessionStorage
                    Redirige a /
```

### Gestión de Usuarios (Solo Admin)

```
 ┌──────────────────────────────────────────────────────────┐
 │               GESTIÓN DE USUARIOS                        │
 │                                                          │
 │  ┌────────────────────────────────────────────────────┐  │
 │  │  [ + Agregar Usuario ]                             │  │
 │  │                                                    │  │
 │  │  Leyenda:  ● Admin  ● Técnico  ● Administrativo   │  │
 │  │                                                    │  │
 │  │  Filtros: [Nombre] [Rol] [Email]  [Limpiar]       │  │
 │  └────────────────────────────────────────────────────┘  │
 │                                                          │
 │  ┌────────────────────────────────────────────────────┐  │
 │  │  Nombre   │ Apellido │ Email      │ Rol   │ Acción │  │
 │  │  ─────────┼──────────┼────────────┼───────┼────────│  │
 │  │  Juan     │ Pérez    │ ju***@e.com│ Admin │ Editar │  │
 │  │           │          │            │       │Elimin. │  │
 │  │  María    │ García   │ ma***@e.com│ Téc.  │ Editar │  │
 │  │           │          │            │       │Elimin. │  │
 │  └────────────────────────────────────────────────────┘  │
 │                                                          │
 │  Al hacer clic en "Eliminar" usuario admin:              │
 │  → Se abre ModalEliminarAdmin (requiere escribir nombre) │
 │                                                          │
 │  Al hacer clic en "Eliminar" otro usuario:               │
 │  → Se abre ModalConfirmacion (confirmación simple)       │
 │                                                          │
 │  Al hacer clic en "Agregar Usuario":                     │
 │  → Se abre FormularioEdicion con campos:                 │
 │    - Nombre de usuario (obligatorio)                     │
 │    - Contraseña (obligatorio, ≥6 caracteres)             │
 │    - Apellido (obligatorio)                              │
 │    - Email (opcional)                                    │
 │    - Rol (obligatorio: Admin/Técnico/Administrativo)     │
 │    - Permisos (opcional: casillas por sección)           │
 └──────────────────────────────────────────────────────────┘
```

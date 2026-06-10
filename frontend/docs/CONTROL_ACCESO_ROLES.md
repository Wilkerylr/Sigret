# Control de Acceso por Roles (RBAC) - Sistema Sigret

## Resumen de Cambios Realizados

Se ha implementado un sistema de control de acceso basado en roles (RBAC) que permite restringir el acceso a las funcionalidades del sistema según el tipo de usuario.

---

## Roles y Credenciales

| Rol | Usuario | Contraseña | Acceso |
|-----|---------|------------|--------|
| **Admin** | `admin` | `password` | Acceso total a todas las funcionalidades |
| **Técnico** | `tecnico` | `tecnico123` | Solo Búsqueda de Reportes y Estadísticas |
| **Administrativo** | `administrativo` | `admin123` | Registrar/Gestionar Reportes, Estadísticas y Gestión de Registros |

---

## Permisos por Rol

### Admin (`admin`)
- ✅ Inicio (Estadísticas)
- ✅ Registrar Reportes
- ✅ Búsqueda de Reportes
- ✅ Gestión de Registros
- ✅ Gestión de Usuarios

### Técnico (`tecnico`)
- ✅ Inicio (Estadísticas)
- ❌ Registrar Reportes
- ✅ Búsqueda de Reportes
- ❌ Gestión de Registros
- ❌ Gestión de Usuarios

### Administrativo (`administrativo`)
- ✅ Inicio (Estadísticas)
- ✅ Registrar Reportes
- ✅ Búsqueda de Reportes
- ✅ Gestión de Registros
- ❌ Gestión de Usuarios

---

## Archivos Creados/Modificados

### Nuevos Archivos

1. **`frontend/src/context/AuthContext.tsx`**
   - Contexto de autenticación con gestión de roles
   - Almacena el usuario autenticado y su rol
   - Provee funciones: `login()`, `logout()`, `hasAccess()`
   - Define los tipos `UserRole` ("admin" | "tecnico" | "administrativo")
   - Contiene la lista de usuarios válidos (simulación)

2. **`frontend/src/componentes/ProtectedRoute.tsx`**
   - Componente que protege rutas según roles permitidos
   - Redirige al login si no hay usuario autenticado
   - Redirige al inicio si el usuario no tiene el rol requerido

### Archivos Modificados

3. **`frontend/src/hooks/useAuth.ts`**
   - Ahora re-exporta `useAuthContext` como `useAuth` desde AuthContext
   - Mantiene compatibilidad con código existente

4. **`frontend/src/componentes/AppSidebar.tsx`**
   - Cada ítem del menú ahora tiene `allowedRoles` (roles permitidos)
   - Los ítems se filtran según el rol del usuario autenticado
   - Botón de cerrar sesión ahora llama a `logout()` y redirige al login
   - Muestra mensaje de bienvenida personalizado

5. **`frontend/src/componentes/login/Login.tsx`**
   - Usa `useAuthContext()` para el login
   - Navega a `/home` tras login exitoso (en lugar de hacerlo desde el hook)

6. **`frontend/src/main.tsx`**
   - Envuelve la aplicación con `AuthProvider`
   - Cada ruta está protegida con `ProtectedRoute` y sus roles permitidos:
     - `/home` (Estadísticas): admin, tecnico, administrativo
     - `/home/busqueda-reportes`: admin, tecnico, administrativo
     - `/home/registro-reportes`: admin, administrativo
     - `/home/gestion-registros`: admin, administrativo
     - `/home/gestion-usuarios`: solo admin

---

## Flujo de Autenticación

```
Usuario ingresa credenciales
        │
        ▼
LoginForm.handleSubmit()
        │
        ▼
AuthContext.login(username, password)
        │
        ▼
¿Credenciales válidas?
   ├── Sí → Se crea sesión con { username, role }
   │         └─ Redirige a /home
   │
   └── No → Muestra error "Credenciales incorrectas"
```

## Flujo de Protección de Rutas

```
Usuario navega a /home/registro-reportes
        │
        ▼
ProtectedRoute (allowedRoles: ["admin", "administrativo"])
        │
        ▼
¿Usuario autenticado?
   ├── No → Redirige a /
   │
   └── Sí → ¿Rol permitido?
              ├── Sí → Muestra el contenido
              └── No → Redirige a /home
```

## Flujo de Sidebar

```
AppSidebar se renderiza
        │
        ▼
Obtiene usuario actual del AuthContext
        │
        ▼
Filtra menuItems según user.role
        │
        ▼
Renderiza solo los ítems permitidos
        │
        ▼
Usuario ve solo las opciones a las que tiene acceso
```

---

## Cómo Agregar Nuevos Roles o Cambiar Permisos

### Agregar un nuevo rol
1. En `AuthContext.tsx`, agregar el rol al tipo `UserRole`:
   ```typescript
   export type UserRole = "admin" | "tecnico" | "administrativo" | "nuevo-rol";
   ```
2. Agregar el usuario en `VALID_USERS`:
   ```typescript
   nuevousuario: { password: "clave", role: "nuevo-rol" },
   ```
3. Definir los permisos en `AppSidebar.tsx` (campo `allowedRoles`)
4. Definir los permisos en `main.tsx` (componente `ProtectedRoute`)

### Cambiar permisos de un rol existente
- **Sidebar**: Modificar el array `allowedRoles` del ítem en `AppSidebar.tsx`
- **Rutas**: Modificar el array `allowedRoles` del `ProtectedRoute` en `main.tsx`

---

## Nota sobre Base de Datos

Actualmente los usuarios están hardcodeados en `AuthContext.tsx` para simulación. Para producción, reemplazar la validación en `login()` con una llamada a una API real que devuelva el usuario con su rol.
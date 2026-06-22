# Sistema de Permisos Dinámicos

## Arquitectura

El sistema maneja dos capas de autorización:

1. **Roles** (`UserRole`): admin, tecnico, administrativo — agrupación general
2. **Permisos individuales** (`Permission`): control granular por vista/acción

Ambas capas coexisten. Un usuario tiene un rol y una lista de permisos individuales. Las rutas y menús verifican ambas condiciones.

## Estructura de archivos

```
frontend/src/
├── componentes/login/
│   ├── contexto/
│   │   └── usuarios.ts          # Base de datos local de usuarios + permisos
│   └── hooks/
│       └── useUserPermissions.ts # Hook para consultar usuarios/permisos
├── context/
│   └── AuthContext.tsx           # Contexto de autenticación (login/logout/permisos)
├── componentes/
│   ├── ProtectedRoute.tsx        # Guard de rutas (roles + permisos)
│   └── AppSidebar.tsx            # Sidebar filtrado por permisos
└── main.tsx                      # Definición de rutas con permisos
```

## Flujo de autenticación

1. El usuario ingresa credenciales en `Login.tsx`
2. `AuthContext.login()` busca en `usuarios.ts` con `findUsuario()`
3. Si coincide, guarda en sessionStorage: `{ username, role, permissions[] }`
4. `ProtectedRoute` y `AppSidebar` verifican `role` y `permissions` para decidir acceso

## Permisos disponibles

| Permiso | Vista |
|---|---|
| `view-estadisticas` | Inicio / Estadísticas |
| `view-registro-reportes` | Registrar Reportes |
| `view-busqueda-reportes` | Búsqueda de Reportes |
| `view-gestion-registros` | Gestión de Registros |
| `view-gestion-usuarios` | Gestión de Usuarios |

## Cómo agregar/quitar permisos a un usuario

Editar `frontend/src/componentes/login/contexto/usuarios.ts`:

```ts
{
  username: "tecnico",
  password: "tecnico123",
  role: "tecnico",
  permissions: [
    "view-estadisticas",
    "view-busqueda-reportes",
    // Agregar: "view-registro-reportes"  ← el técnico ahora ve esta vista
  ],
}
```

No es necesario modificar el rol. Los permisos son independientes.

## Cómo crear un nuevo permiso

1. Agregar el string al tipo `Permission` en `usuarios.ts`:
   ```ts
   export type Permission =
     | "view-estadisticas"
     | "view-nuevo-modulo";  // ← nuevo permiso
   ```
2. Asignarlo a los usuarios que correspondan en `permissions[]`
3. Usarlo en rutas (`main.tsx`) o menús (`AppSidebar.tsx`):
   ```tsx
   <ProtectedRoute requiredPermissions={["view-nuevo-modulo"]}>
     <NuevoModulo />
   </ProtectedRoute>
   ```

## Uso en componentes

### Verificar permiso en cualquier componente

```tsx
import { useAuthContext } from "@/context/AuthContext";

function MiComponente() {
  const { hasPermission, userPermissions } = useAuthContext();

  if (hasPermission("view-gestion-usuarios")) {
    return <AdminPanel />;
  }

  return <div>Sin acceso</div>;
}
```

### Proteger rutas (en main.tsx)

```tsx
<ProtectedRoute
  allowedRoles={["admin"]}
  requiredPermissions={["view-gestion-usuarios"]}
>
  <GestionUsuariosPage />
</ProtectedRoute>
```

### Filtrar elementos del menú (en AppSidebar)

```ts
const menuItems = [
  {
    title: "Gestión de Usuarios",
    path: "/home/gestion-usuarios",
    allowedRoles: ["admin"],
    requiredPermission: "view-gestion-usuarios",
  },
];
```

## Migración a backend

Cuando se implemente la API, los cambios necesarios son:

1. **`usuarios.ts`**: reemplazar `USUARIOS_REGISTRADOS` por llamada `fetch()`
2. **`useUserPermissions.ts`**: cambiar `findUsuario()` por `fetch(/api/usuarios/${username})`
3. **`AuthContext.tsx`**: cambiar `findUsuario()` en `login()` por llamada API

La estructura de datos (`UsuarioData`) y los tipos (`Permission`, `UserRole`) se mantienen iguales.
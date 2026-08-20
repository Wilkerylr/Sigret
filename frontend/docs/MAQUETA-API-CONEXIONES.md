# Mapa de Conexiones API - SGRT

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                      │
│                                                                     │
│  Componentes UI                                                     │
│       │                                                             │
│       ▼                                                             │
│  Hooks locales (useGestionX) ───→ Servicios (services/*.service.ts) │
│       │                                       │                     │
│       ▼                                       ▼                     │
│  Hooks React Query (useReportes) ───→ Cliente HTTP (api/client.ts)  │
│                                                 │                   │
│                                                 ▼                   │
│                                          Endpoints (api/endpoints.ts)│
└─────────────────────────────────────────────────────┬───────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (Express + TypeScript)          │
│                                                      │
│  /api/auth/*      → authRouter (por implementar)     │
│  /api/reportes/*  → reportesRouter (por implementar) │
│  /api/clientes/*  → clientesRouter (por implementar) │
│  /api/equipos/*   → equiposRouter (por implementar)  │
│  /api/repuestos/* → repuestosRouter (por implementar)│
│  /api/etiquetas/* → etiquetasRouter (por implementar)│
│  /api/tecnicos/*  → tecnicosRouter (por implementar) │
│  /api/plantillas/*→ plantillasRouter (por implementar)│
│  /api/usuarios/*  → usuariosRouter (por implementar) │
│  /api/estadisticas/*→ estadisticasRouter (por impl.) │
│  /api/historial/* → historialRouter (por implementar)│
└─────────────────────────────────────────────────────┘
```

---

## 1. CAPA DE COMUNICACIÓN BASE

### Cliente HTTP (`frontend/src/api/client.ts`)
- **URL base**: `http://localhost:3001/api` (configurable via `VITE_API_URL`)
- **Autenticación**: JWT en `sessionStorage('sigret_token')` → header `Authorization: Bearer <token>`
- **Timeout**: 15 segundos
- **Manejo de errores**: 401 → limpia sesión y redirige a login

### Tipos de respuesta genéricos (`frontend/src/api/types.ts`)
```typescript
ApiResponse<T>       → { success: true, data: T, message?, timestamp }
PaginatedResponse<T> → { success: true, data: { items: T[], pagination: { page, pageSize, totalItems, totalPages } }, timestamp }
ErrorResponse        → { success: false, error: { code, message, details? }, timestamp }
QueryParams          → { page?, pageSize?, search?, sortBy?, sortOrder?, [key]: string|number|undefined }
```

---

## 2. MAPA COMPLETO DE ENDPOINTS

### 2.1 Autenticación (`ENDPOINTS.AUTH`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/login` | Iniciar sesión | `{ username, password }` | `ApiResponse<{ token, user }>` |
| POST | `/auth/logout` | Cerrar sesión | - | `ApiResponse<void>` |
| GET | `/auth/profile` | Obtener perfil | - | `ApiResponse<User>` |

**Conecta con**: `Login.tsx` → `useAuth` → AuthContext → (aún no hay service)

### 2.2 Reportes Técnicos (`ENDPOINTS.REPORTES`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/reportes` | Listar reportes (paginado) | QueryParams | `PaginatedResponse<ReporteResumen>` |
| GET | `/reportes/:id` | Obtener reporte por ID | - | `ApiResponse<ReporteResumen>` |
| POST | `/reportes` | Crear reporte | `CreateReporteRequest` | `ApiResponse<ReporteResumen>` |
| PUT | `/reportes/:id` | Actualizar reporte | `UpdateReporteRequest` | `ApiResponse<ReporteResumen>` |
| DELETE | `/reportes/:id` | Eliminar reporte | - | `ApiResponse<void>` |

**Conecta con**:
- `reportesService` ✅ (YA IMPLEMENTADO en `services/reportes.service.ts`)
- `useReportes` hook ✅ (YA IMPLEMENTADO con React Query)
- `form_registro_reportes.tsx` → usa `useFormReporte` (hook local, aún no conectado al service)
- `gestion_registros/components/TabReportes.tsx` → usa `useGestionReportes` (hook local con datos mock)

### 2.3 Clientes (`ENDPOINTS.CLIENTES`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/clientes` | Listar clientes | QueryParams | `PaginatedResponse<Cliente>` |
| GET | `/clientes/:id` | Obtener cliente | - | `ApiResponse<Cliente>` |
| POST | `/clientes` | Crear cliente | `CreateClienteRequest` | `ApiResponse<Cliente>` |
| PUT | `/clientes/:id` | Actualizar cliente | `UpdateClienteRequest` | `ApiResponse<Cliente>` |
| DELETE | `/clientes/:id` | Eliminar cliente | - | `ApiResponse<void>` |

**Conecta con**:
- `useGestionClientes` (hook local en `gestion_registros/hooks/`) → **usa datos mock** (`@/data/clientes`)
- ❌ **No tiene service implementado** → pendiente crear `clientes.service.ts`

### 2.4 Equipos (`ENDPOINTS.EQUIPOS`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/equipos` | Listar equipos | QueryParams | `PaginatedResponse<Equipo>` |
| GET | `/equipos/:id` | Obtener equipo | - | `ApiResponse<Equipo>` |
| POST | `/equipos` | Crear equipo | `CreateEquipoRequest` | `ApiResponse<Equipo>` |
| PUT | `/equipos/:id` | Actualizar equipo | `UpdateEquipoRequest` | `ApiResponse<Equipo>` |
| DELETE | `/equipos/:id` | Eliminar equipo | - | `ApiResponse<void>` |

**Conecta con**:
- ❌ **No tiene hook ni service implementado** → usado dentro del formulario de reportes como dropdown

### 2.5 Repuestos (`ENDPOINTS.REPUESTOS`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/repuestos` | Listar repuestos | QueryParams | `PaginatedResponse<RepuestoItem>` |
| GET | `/repuestos/:id` | Obtener repuesto | - | `ApiResponse<RepuestoItem>` |
| POST | `/repuestos` | Crear repuesto | `CreateRepuestoRequest` | `ApiResponse<RepuestoItem>` |
| PUT | `/repuestos/:id` | Actualizar repuesto | `UpdateRepuestoRequest` | `ApiResponse<RepuestoItem>` |
| DELETE | `/repuestos/:id` | Eliminar repuesto | - | `ApiResponse<void>` |

**Conecta con**:
- ❌ **No tiene hook ni service implementado** → usado dentro del formulario de reportes

### 2.6 Etiquetas (`ENDPOINTS.ETIQUETAS`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/etiquetas` | Listar etiquetas | QueryParams | `PaginatedResponse<Etiqueta>` |
| GET | `/etiquetas/:id` | Obtener etiqueta | - | `ApiResponse<Etiqueta>` |
| POST | `/etiquetas` | Crear etiqueta | `CreateEtiquetaRequest` | `ApiResponse<Etiqueta>` |
| PUT | `/etiquetas/:id` | Actualizar etiqueta | `UpdateEtiquetaRequest` | `ApiResponse<Etiqueta>` |
| DELETE | `/etiquetas/:id` | Eliminar etiqueta | - | `ApiResponse<void>` |

**Conecta con**:
- `useGestionEtiquetas` (hook local en `gestion_registros/hooks/`) → **usa datos mock** (`@/data/etiquetas`)
- ❌ **No tiene service implementado** → pendiente crear `etiquetas.service.ts`

### 2.7 Técnicos (`ENDPOINTS.TECNICOS`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/tecnicos` | Listar técnicos | QueryParams | `PaginatedResponse<Tecnico>` |
| GET | `/tecnicos/:id` | Obtener técnico | - | `ApiResponse<Tecnico>` |
| POST | `/tecnicos` | Crear técnico | `CreateTecnicoRequest` | `ApiResponse<Tecnico>` |
| PUT | `/tecnicos/:id` | Actualizar técnico | `UpdateTecnicoRequest` | `ApiResponse<Tecnico>` |
| DELETE | `/tecnicos/:id` | Eliminar técnico | - | `ApiResponse<void>` |

**Conecta con**:
- ❌ **No tiene hook ni service implementado** → usado dentro del formulario de reportes

### 2.8 Plantillas (`ENDPOINTS.PLANTILLAS`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/plantillas` | Listar plantillas | QueryParams | `PaginatedResponse<Plantilla>` |
| GET | `/plantillas/:id` | Obtener plantilla | - | `ApiResponse<Plantilla>` |
| POST | `/plantillas` | Crear plantilla | `CreatePlantillaRequest` | `ApiResponse<Plantilla>` |
| PUT | `/plantillas/:id` | Actualizar plantilla | `UpdatePlantillaRequest` | `ApiResponse<Plantilla>` |
| DELETE | `/plantillas/:id` | Eliminar plantilla | - | `ApiResponse<void>` |

**Conecta con**:
- `useGestionPlantillas` (hook local en `gestion_registros/hooks/`) → **usa datos mock** (`@/data/plantillas`)
- ❌ **No tiene service implementado** → pendiente crear `plantillas.service.ts`

### 2.9 Usuarios (`ENDPOINTS.USUARIOS`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/usuarios` | Listar usuarios | QueryParams | `PaginatedResponse<Usuario>` |
| GET | `/usuarios/:id` | Obtener usuario | - | `ApiResponse<Usuario>` |
| POST | `/usuarios` | Crear usuario | `CreateUsuarioRequest` | `ApiResponse<Usuario>` |
| PUT | `/usuarios/:id` | Actualizar usuario | `UpdateUsuarioRequest` | `ApiResponse<Usuario>` |
| DELETE | `/usuarios/:id` | Eliminar usuario | - | `ApiResponse<void>` |

**Conecta con**:
- `useGestionUsuarios` (hook local en `gestion_usuarios/hooks/`) → **usa datos mock** (`@/data/usuarios`)
- ❌ **No tiene service implementado** → pendiente crear `usuarios.service.ts`

### 2.10 Estadísticas (`ENDPOINTS.ESTADISTICAS`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/estadisticas` | Dashboard completo | - | `ApiResponse<EstadisticasDashboard>` |
| GET | `/estadisticas/reportes-por-mes` | Reportes agrupados por mes | QueryParams (año) | `ApiResponse<ReportesPorMes>` |
| GET | `/estadisticas/tecnicos-top` | Técnicos con más reportes | QueryParams (limite) | `ApiResponse<TecnicoTop[]>` |

**Conecta con**:
- Componente `estadisticas/` → ❌ **No tiene hook ni service implementado**

### 2.11 Historial (`ENDPOINTS.HISTORIAL`)
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/historial` | Listar historial (paginado) | QueryParams | `PaginatedResponse<EntradaHistorial>` |
| GET | `/historial/reporte/:id` | Historial de un reporte específico | - | `ApiResponse<EntradaHistorial[]>` |

**Conecta con**:
- `useHistorialCambios` (hook local en `gestion_registros/hooks/`) → **usa datos mock** (`@/data/historial`)
- ❌ **No tiene service implementado** → pendiente crear `historial.service.ts`

---

## 3. ESTADO ACTUAL DE IMPLEMENTACIÓN

### ✅ Ya implementado (conectado a API)
| Archivo | Ubicación | Estado |
|---------|-----------|--------|
| `api/client.ts` | Capa HTTP base | ✅ Listo |
| `api/endpoints.ts` | Constantes de rutas | ✅ Listo |
| `api/types.ts` | Tipos genéricos | ✅ Listo |
| `services/reportes.service.ts` | Servicio de reportes | ✅ Listo |
| `hooks/useReportes.ts` | Hook React Query para reportes | ✅ Listo |

### 🔄 Usando datos mock (pendiente migrar a API)
| Hook | Ubicación | Fuente actual |
|------|-----------|---------------|
| `useGestionClientes` | `gestion_registros/hooks/` | `@/data/clientes` |
| `useGestionReportes` | `gestion_registros/hooks/` | `@/data/reportes` |
| `useGestionEtiquetas` | `gestion_registros/hooks/` | `@/data/etiquetas` |
| `useGestionPlantillas` | `gestion_registros/hooks/` | `@/data/plantillas` |
| `useHistorialCambios` | `gestion_registros/hooks/` | `@/data/historial` |
| `useGestionUsuarios` | `gestion_usuarios/hooks/` | `@/data/usuarios` |

### ❌ No implementado (pendiente crear)
| Servicio faltante | Hooks faltantes |
|-------------------|-----------------|
| `auth.service.ts` | `useAuth` (solo contexto, sin service) |
| `clientes.service.ts` | `useClientes` (React Query) |
| `equipos.service.ts` | `useEquipos` (React Query) |
| `repuestos.service.ts` | `useRepuestos` (React Query) |
| `etiquetas.service.ts` | `useEtiquetas` (React Query) |
| `tecnicos.service.ts` | `useTecnicos` (React Query) |
| `plantillas.service.ts` | `usePlantillas` (React Query) |
| `usuarios.service.ts` | `useUsuarios` (React Query) |
| `estadisticas.service.ts` | `useEstadisticas` (React Query) |
| `historial.service.ts` | `useHistorial` (React Query) |

---

## 4. PATRÓN PARA CREAR NUEVOS SERVICIOS

Cada nuevo servicio debe seguir el patrón de `reportes.service.ts`:

```typescript
// services/clientes.service.ts
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@/api/types';
import type { Cliente, CreateClienteRequest, UpdateClienteRequest } from '@/types/cliente.types';

export const clientesService = {
  getAll: (params?: QueryParams) =>
    apiClient.get<PaginatedResponse<Cliente>>(ENDPOINTS.CLIENTES.BASE, { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Cliente>>(ENDPOINTS.CLIENTES.BY_ID(id)),

  create: (data: CreateClienteRequest) =>
    apiClient.post<ApiResponse<Cliente>>(ENDPOINTS.CLIENTES.BASE, data),

  update: (id: string, data: UpdateClienteRequest) =>
    apiClient.put<ApiResponse<Cliente>>(ENDPOINTS.CLIENTES.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(ENDPOINTS.CLIENTES.BY_ID(id)),
};
```

## 5. PATRÓN PARA CREAR NUEVOS HOOKS (React Query)

```typescript
// hooks/useClientes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesService } from '@/services/clientes.service';
import type { QueryParams } from '@/api/types';
import type { CreateClienteRequest, UpdateClienteRequest } from '@/types/cliente.types';

const CLIENTES_KEY = 'clientes';

export function useClientes(params?: QueryParams) {
  return useQuery({
    queryKey: [CLIENTES_KEY, params],
    queryFn: () => clientesService.getAll(params),
    select: (res) => res.data,
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: [CLIENTES_KEY, id],
    queryFn: () => clientesService.getById(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCrearCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClienteRequest) => clientesService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLIENTES_KEY] }),
  });
}

export function useActualizarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClienteRequest }) =>
      clientesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLIENTES_KEY] }),
  });
}

export function useEliminarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLIENTES_KEY] }),
  });
}
```

---

## 6. FLUJO DE PETICIÓN COMPLETO (ejemplo: crear reporte)

```
form_registro_reportes.tsx
  │
  ▼ (dispara onSubmit)
useFormReporte (hook local)
  │
  ▼ (llama a la API)
reportesService.create(data)
  │
  ▼
apiClient.post('/reportes', data)
  │
  ├── Interceptor request: adjunta Bearer token
  │
  ▼
Backend: POST /api/reportes
  │
  ▼
Valida JWT → Valida body → Guarda en BD → Responde
  │
  ▼
apiClient recibe respuesta
  │
  ├── Interceptor response: verifica 401
  │
  ▼
reportesService devuelve ApiResponse<ReporteResumen>
  │
  ▼
useFormReporte procesa respuesta → muestra éxito/error
```

---

## 7. NOTAS IMPORTANTES

1. **Backend actual**: Solo tiene `index.ts` con Express básico. **No hay rutas implementadas**. Todas las rutas están comentadas (líneas 22-23 de `backend/src/index.ts`).

2. **Datos mock**: Los hooks locales (`useGestionClientes`, `useGestionReportes`, etc.) actualmente trabajan con datos mock importados de `@/data/*`. Cuando se implemente el backend, estos hooks deben migrarse para usar los services correspondientes.

3. **Único service completo**: `reportes.service.ts` es el único service que está completamente implementado y listo para conectar con el backend.

4. **Autenticación**: El flujo de login usa `AuthContext` + `useAuth`, pero no hay un `auth.service.ts` que haga las peticiones HTTP. Actualmente el contexto maneja el estado localmente.

5. **Base URL**: `http://localhost:3001/api` (configurable via `VITE_API_URL` en `.env`)

6. **Formato de fechas**: En los tipos se usa `string` para fechas. Se recomienda ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) para comunicación con la API.
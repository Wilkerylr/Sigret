# INFORME DE AUDITORÍA TÉCNICA - SGRT

## Datos del Proyecto

| Atributo | Valor |
|---|---|
| **Framework** | React 19 + Vite 8 + TypeScript 6 |
| **Estilos** | Tailwind CSS 4 + CSS Modules |
| **Enrutador** | React Router DOM v7 |
| **Manejador de Estado** | Context API (AuthContext) + Estado local con hooks |
| **UI Components** | shadcn/ui adaptado + Radix UI + Lucide Icons |
| **Gráficos** | Recharts |
| **Backend** | Proyecto Node/TypeScript (backend/src/index.ts) - esqueleto |

---

## 1. DIAGNÓSTICO DE ESTRUCTURA Y CONSISTENCIA

### Puntaje General: 7/10

### Fortalezas Detectadas

- ✅ Separación clara de responsabilidades (`pages/` como capa delgada, `componentes/` con lógica de negocio)
- ✅ Componente genérico `FormularioEdicion` con configuración declarativa (`SeccionConfig[]`)
- ✅ `TablaGenerica` reutilizable desde `gestion_registros`
- ✅ `data/index.ts` ya documenta el mapeo de rutas de API para cada archivo mock
- ✅ Hooks personalizados: `useFormReporte`, `useGestionUsuarios`, `useFormularioDinamico`
- ✅ Uso de `@/` alias para importaciones limpias

### Inconsistencias Críticas Detectadas

#### 🔴 __CRÍTICA__ INCONSISTENCIA #1: Estructura de carpetas heterogénea por sección

| Sección | components/ | hooks/ | types/ | constants/ | sections/ | utils/ |
|---|---|---|---|---|---|---|
| `registro_reportes/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `busqueda_reportes/` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `formulario_edicion/` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `gestion_registros/` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `gestion_usuarios/` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `estadisticas/` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `login/` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Problema**: No hay un estándar unificado. `estadisticas/` carece de `types/` y `hooks/`. `login/` usa `contexto/` en lugar de `hooks/`.

#### 🔴 __CRÍTICA__ INCONSISTENCIA #2: `App.tsx` raíz contiene código muerto

`frontend/src/App.tsx` (122 líneas) es el template original de Vite + React con contador e imágenes. **No se usa** porque `main.tsx` define su propio componente `App`. Código muerto.

#### 🔴 __CRÍTICA__ INCONSISTENCIA #3: Datos mock sin tipado centralizado

- `data/` tiene 11 archivos planos
- `registro_reportes/types/` define `FormReporteData`
- `data/reportes.ts` exporta `ReporteResumen` con campos similares pero no idénticos
- No existe `types/` global

#### 🟡 __MEDIA__ INCONSISTENCIA #4: No existe capa de servicios HTTP

- No hay carpeta `services/` ni `api/`
- Llamadas simuladas inline en componentes
- No hay configuración de cliente HTTP (axios/fetch)

---

## 2. PLAN DE CONEXIÓN AL BACKEND

### Stack Recomendado

| Capa | Herramienta | Justificación |
|---|---|---|
| **Cliente HTTP** | Axios | Interceptors para auth, manejo de errores, cancelación |
| **Cache/Estado** | TanStack Query v5 | Cache automático, refetch, loading/error states |
| **Estado Global** | Zustand (opcional) | Liviano, solo para UI state no-API |

### Estructura a Implementar

```
frontend/src/
├── api/
│   ├── client.ts              # Axios instance + interceptors
│   ├── endpoints.ts           # Constantes de rutas
│   └── types.ts               # ApiResponse<T>, PaginatedResponse<T>
│
├── services/
│   ├── auth.service.ts
│   ├── reportes.service.ts
│   ├── clientes.service.ts
│   ├── equipos.service.ts
│   ├── repuestos.service.ts
│   ├── etiquetas.service.ts
│   ├── tecnicos.service.ts
│   ├── plantillas.service.ts
│   ├── usuarios.service.ts
│   ├── estadisticas.service.ts
│   └── historial.service.ts
│
├── hooks/
│   ├── useReportes.ts          # React Query
│   ├── useClientes.ts
│   ├── useUsuarios.ts
│   ├── useEstadisticas.ts
│   └── ...
│
├── types/                      # Tipos globales centralizados
│   ├── index.ts
│   ├── api.types.ts
│   ├── reporte.types.ts
│   ├── usuario.types.ts
│   └── ...
│
├── componentes/
│   └── shared/
│       ├── ErrorBanner.tsx
│       ├── EmptyState.tsx
│       ├── SkeletonTable.tsx
│       └── LoadingSpinner.tsx
```

### Estrategia de Migración por Fases

#### FASE 1: Infraestructura base (Día 1-2)
1. Crear `api/client.ts` con Axios + interceptors
2. Crear `api/endpoints.ts`
3. Crear `types/api.types.ts` (ApiResponse, PaginatedResponse, ErrorResponse)
4. Instalar `@tanstack/react-query`
5. Configurar `QueryClientProvider` en `main.tsx`

#### FASE 2: Migración de servicios (Día 3-5)
1. Crear primer servicio piloto: `services/reportes.service.ts`
2. Crear `hooks/useReportes.ts`
3. Conectar `busqueda_reportes/` al hook
4. Repetir para cada dominio
5. Eliminar `data/` progresivamente

#### FASE 3: Refactorización de secciones (Día 6-8)
1. Estandarizar estructura de todas las secciones
2. Migrar `estadisticas/` a usar hooks de React Query
3. Migrar `login/` a estructura components/hooks/types
4. Eliminar `App.tsx` obsoleto
5. Unificar tipos duplicados

---

## 3. PLANTILLA DE DOCUMENTACIÓN TÉCNICA

Formato estándar Markdown para documentar cada integración:

```markdown
# Integración: [Nombre del Módulo]

## Endpoints
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/reportes` | Listar reportes | JWT |

## Contrato de Datos

### Request: Crear Reporte `POST /api/reportes`
\`\`\`typescript
interface CreateReporteRequest {
  cliente: string;             // Requerido
  equipo: string;              // Requerido
  descripcionFalla: string;    // Requerido
  trabajoRealizado: string;    // Requerido
  repuestos: Array<{
    repuesto: string;
    cantidad: number;
  }>;
  etiquetas: string[];
  tecnicos: string[];
  fechaReporte: string;        // ISO 8601
  fechaAtencion: string;       // ISO 8601
  horaInicio: string;          // HH:mm
  horaFinalizacion: string;    // HH:mm
}
\`\`\`

### Response: Éxito
\`\`\`typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: { page: number; pageSize: number; totalItems: number; totalPages: number; };
  };
}
\`\`\`

### Response: Error
\`\`\`typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;              // Ej: "VALIDATION_ERROR"
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}
\`\`\`

## Estados de Carga
| Estado | Componente |
|--------|------------|
| isLoading | `<SkeletonTable />` |
| isError | `<ErrorBanner onRetry={refetch} />` |
| isEmpty | `<EmptyState mensaje="..." />` |
| isSuccess | Componente específico |

## Variables de Entorno
\`\`\`env
VITE_API_URL=http://localhost:3001/api
VITE_API_TIMEOUT=15000
\`\`\`

## Dependencias
\`\`\`json
{
  "axios": "^1.7.0",
  "@tanstack/react-query": "^5.60.0"
}
\`\`\`
```

---

## 4. PROPUESTA DE ÁRBOL DE DIRECTORIOS IDEAL

```
frontend/
├── public/
├── src/
│   ├── api/                              # NUEVA - Cliente HTTP
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── types.ts
│   │
│   ├── services/                         # NUEVA - Llamadas HTTP por dominio
│   │   ├── auth.service.ts
│   │   ├── reportes.service.ts
│   │   ├── clientes.service.ts
│   │   ├── equipos.service.ts
│   │   ├── repuestos.service.ts
│   │   ├── etiquetas.service.ts
│   │   ├── tecnicos.service.ts
│   │   ├── plantillas.service.ts
│   │   ├── usuarios.service.ts
│   │   ├── estadisticas.service.ts
│   │   └── historial.service.ts
│   │
│   ├── types/                            # NUEVA - Tipos globales centralizados
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── reporte.types.ts
│   │   ├── usuario.types.ts
│   │   ├── cliente.types.ts
│   │   ├── equipo.types.ts
│   │   ├── repuesto.types.ts
│   │   ├── etiqueta.types.ts
│   │   ├── tecnico.types.ts
│   │   ├── plantilla.types.ts
│   │   └── estadistica.types.ts
│   │
│   ├── hooks/                            # EXPANDIDA - React Query hooks
│   │   ├── use-mobile.ts
│   │   ├── useAuth.ts
│   │   ├── useReportes.ts                # NUEVO
│   │   ├── useClientes.ts                # NUEVO
│   │   ├── useUsuarios.ts                # NUEVO
│   │   ├── useEstadisticas.ts            # NUEVO
│   │   ├── useRepuestos.ts               # NUEVO
│   │   ├── useEtiquetas.ts               # NUEVO
│   │   ├── useTecnicos.ts                # NUEVO
│   │   ├── usePlantillas.ts              # NUEVO
│   │   └── useHistorial.ts               # NUEVO
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── componentes/
│   │   ├── shared/                       # NUEVA - Estados genéricos
│   │   │   ├── ErrorBanner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── SkeletonTable.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ModalConfirmacion.tsx
│   │   │   ├── TablaGenerica.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── ui/                           # shadcn/ui components
│   │   │
│   │   ├── formulario_edicion/           # YA EXISTE - OK
│   │   │
│   │   ├── login/                        # REFACTORIZADO
│   │   │   ├── types/index.ts
│   │   │   ├── hooks/useLogin.ts
│   │   │   └── components/LoginForm.tsx
│   │   │
│   │   ├── registro_reportes/            # YA EXISTE - Modelo a seguir
│   │   │
│   │   ├── busqueda_reportes/            # REFACTORIZADO - +hooks/
│   │   │   └── hooks/useBusquedaReportes.ts
│   │   │
│   │   ├── gestion_registros/            # YA EXISTE
│   │   │
│   │   ├── gestion_usuarios/             # YA EXISTE
│   │   │
│   │   ├── estadisticas/                 # REFACTORIZADO - +types/ +hooks/
│   │   │   ├── types/index.ts
│   │   │   └── hooks/useEstadisticasTab.ts
│   │   │
│   │   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── Global.css
│   │
│   ├── pages/                            # Capa delgada de páginas
│   │
│   ├── lib/
│   │   └── utils.ts
│   │
│   ├── assets/
│   │
│   ├── main.tsx                          # Entry point (REFACTORIZADO)
│   └── vite-env.d.ts
│
├── .env / .env.example
└── config files (package.json, vite.config.ts, tsconfig.json, etc.)
```

---

## RESUMEN DE ACCIONES PRIORIZADAS

| Prioridad | Acción | Esfuerzo | Impacto |
|-----------|--------|----------|---------|
| 🔴 P0 | Eliminar `App.tsx` obsoleto (template Vite) | 5 min | Bajo |
| 🔴 P0 | Instalar Axios + React Query | 15 min | Alto |
| 🔴 P0 | Crear `api/client.ts` con interceptors | 30 min | Alto |
| 🟡 P1 | Crear `services/reportes.service.ts` (piloto) | 1 hr | Alto |
| 🟡 P1 | Crear `hooks/useReportes.ts` con React Query | 1 hr | Alto |
| 🟡 P1 | Conectar `busqueda_reportes/` al hook | 2 hr | Alto |
| 🟡 P1 | Crear `types/` global y migrar tipos duplicados | 3 hr | Alto |
| 🟢 P2 | Estandarizar `estadisticas/` (+types/ +hooks/) | 1 hr | Medio |
| 🟢 P2 | Estandarizar `login/` (components/hooks/types) | 2 hr | Medio |
| 🟢 P2 | Crear `componentes/shared/` | 2 hr | Medio |
| 🔵 P3 | Migrar `data/` → `services/` completo | 4 hr | Alto |
| ⚪ P4 | Documentar integraciones con plantilla | 2 hr | Medio |
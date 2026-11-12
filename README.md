# SGRT — Sistema de Gestión de Reportes Técnicos

Monorepo de SGRT, una aplicación para registrar, buscar y administrar reportes
técnicos: clientes, equipos, repuestos, etiquetas, técnicos, plantillas,
estadísticas y usuarios con permisos por rol.

## Stack

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript, React Router, TanStack Query, Tailwind CSS 4, Recharts |
| Backend | Node.js 20, Express 4, JavaScript (CommonJS), JWT, bcrypt, Helmet, express-rate-limit |
| Base de datos | Supabase (PostgreSQL) vía `@supabase/supabase-js` |
| Calidad | ESLint, Prettier, `node:test` (backend), GitHub Actions |

## Estructura del proyecto

```
Sgrt/
├── .github/workflows/ci.yml     # CI: lint, typecheck, build y tests
├── .prettierrc.json             # Configuración compartida de Prettier
├── .prettierignore
├── LICENSE                      # Licencia MIT
├── package.json                 # Scripts raíz (dev con concurrently)
├── docs/                        # Documentación funcional, seguridad y backups
├── frontend/
│   ├── src/
│   │   ├── api/                 # Cliente Axios y catálogo de endpoints
│   │   ├── componentes/         # Módulos de UI por dominio
│   │   │   ├── busqueda_reportes/
│   │   │   ├── estadisticas/
│   │   │   ├── formulario_edicion/
│   │   │   ├── gestion_registros/
│   │   │   ├── gestion_usuarios/
│   │   │   ├── layout/
│   │   │   ├── login/
│   │   │   ├── primer_login/
│   │   │   ├── registro_reportes/
│   │   │   ├── shared/
│   │   │   └── ui/
│   │   ├── context/             # AuthContext (sesión, rol y permisos)
│   │   ├── lib/                 # queryClient y logger
│   │   ├── pages/               # Páginas asociadas a rutas
│   │   ├── services/            # Servicios auxiliares
│   │   ├── types/               # Tipos canónicos del dominio
│   │   ├── utils/               # Mappers (API → frontend)
│   │   ├── main.tsx             # Router y providers
│   │   └── index.css
│   ├── netlify.toml             # Configuración de despliegue
│   └── vite.config.ts
└── backend/
    ├── server.js                # Entrada de Express y middlewares globales
    ├── config.js                # Validación fail-fast de variables de entorno
    ├── db/supabase.js           # Cliente Supabase y test de conexión
    ├── middlewares/             # verificarToken, requiereAdmin, caché
    ├── routes/                  # Endpoints por recurso
    ├── utils/                   # Logger (pino), validación y usuarios
    ├── db/migrations/           # Scripts SQL de la base de datos
    ├── migrations/              # Datos iniciales de repuestos
    ├── scripts/                 # check-syntax, seed-admin y backup
    ├── test/                    # Pruebas con node:test
    └── render.yaml              # Configuración de despliegue
```

## Requisitos

- Node.js >= 20
- npm >= 10
- Un proyecto de Supabase (solo para ejecutar la app completa)

## Instalación

### Monorepo (recomendado)

Desde la raíz del repositorio:

```bash
npm install            # instala concurrently
npm run install:all    # instala backend y frontend
cp backend/.env.example backend/.env    # completar credenciales
npm run dev            # levanta backend y frontend a la vez
```

El frontend queda en `http://localhost:5173` y el backend en
`http://localhost:3001`. `Ctrl+C` detiene ambos procesos.

### Por separado

```bash
# Backend
cd backend
npm install
cp .env.example .env   # completar credenciales
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

El frontend queda en `http://localhost:5173` y el backend en
`http://localhost:3001`.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `PORT` | No | Puerto del servidor. Por defecto `3001`. Render lo inyecta en producción. |
| `CORS_ORIGIN` | Sí en producción | Origen(es) permitidos, separados por coma. Obligatoria con `NODE_ENV=production`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí | Clave publishable (anon) de Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Recomendada | Clave secreta con permisos totales. Solo en el backend. |
| `JWT_SECRET` | Sí | Secreto para firmar JWT. Mínimo 16 caracteres y fijo entre desploys. |
| `JWT_EXPIRES_IN` | No | Expiración del token. Por defecto `8h`. El frontend lo renueva antes de expirar. |
| `LOG_LEVEL` | No | Nivel de logs (`debug`, `info`, `warn`, `error`, `silent`). Por defecto `debug` en desarrollo e `info` en producción. |
| `SUPABASE_DB_URL` | Solo backups | Cadena de conexión directa para `npm run backup`. Nunca se usa en la app. |
| `ADMIN_*` | Solo seed | Datos del administrador inicial para `npm run seed:admin`. Ver `docs/BACKUPS-Y-SEED.md`. |

El backend valida `JWT_SECRET` (y `CORS_ORIGIN` en producción) al arrancar y
detiene el proceso si falta alguna, para evitar tokens forjables o CORS
abierto.

### Frontend (`frontend/.env`)

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base de la API, terminada en `/api`. Por defecto `http://localhost:3001/api`. |

## Scripts disponibles

### Raíz del monorepo

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Levanta backend y frontend con `concurrently`. |
| `npm run dev:backend` | Solo el backend. |
| `npm run dev:frontend` | Solo el frontend. |
| `npm run install:all` | Instala dependencias de raíz, backend y frontend. |
| `npm run lint` | ESLint de backend y frontend. |
| `npm run typecheck` | Typecheck de backend y frontend. |
| `npm run test` | Pruebas del backend. |
| `npm run build` | Build de producción del frontend. |

### Frontend

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR. |
| `npm run build` | Typecheck (`tsc -b`) y build de producción con Vite. |
| `npm run preview` | Sirve localmente el build de producción. |
| `npm run lint` | ESLint sobre todo el proyecto. |
| `npm run typecheck` | Verificación de tipos TypeScript. |
| `npm run format` | Formatea con Prettier. |
| `npm run format:check` | Comprueba el formato sin escribir. |

### Backend

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor con recarga automática (nodemon). |
| `npm start` | Servidor en modo normal. |
| `npm run lint` | ESLint sobre todo el proyecto. |
| `npm run typecheck` | Verifica la sintaxis de todos los `.js` con `node --check`. |
| `npm test` | Ejecuta las pruebas de `test/*.test.js` con `node:test`. |
| `npm run seed:admin` | Crea el administrador inicial de forma idempotente. |
| `npm run backup` | Genera un backup del esquema `public` con `pg_dump`. |
| `npm run format` | Formatea con Prettier. |
| `npm run format:check` | Comprueba el formato sin escribir. |

## Arquitectura

### Frontend

- **Rutas** (`src/main.tsx`): login, primer login y las vistas protegidas por
  `ProtectedRoute`, que valida rol y permisos antes de renderizar.
- **Sesión** (`src/context/AuthContext.tsx`): guarda el token en
  `sessionStorage`, expone `hasPermission`, `hasAnyPermission` y
  `refreshPermissions`. Renueva el JWT automáticamente antes de que expire
  (`POST /api/auth/refresh`). Los tipos `UserRole` y `Permission` viven en
  `src/types/auth.types.ts`.
- **API** (`src/api/client.ts`): instancia única de Axios que adjunta el JWT.
  Ante un `401` de sesión limpia el almacenamiento y redirige a
  `/?sesion=expirada`, donde el login muestra el aviso.
- **Dominio**: cada módulo de `componentes/` agrupa componentes, hooks, tipos y
  estilos. Los hooks hacen las peticiones y los componentes solo renderizan.
- **Tipos y mappers**: `src/types/` es la fuente única de los modelos
  (`ReporteApi`, `ReporteResumen`, `ReporteRepuesto`, etc.) y
  `src/utils/reporteMapper.ts` centraliza la conversión de la respuesta de la
  API al modelo del frontend.
- **Errores**: `src/lib/logger.ts` expone `logError`, que solo escribe en
  consola fuera de producción (`import.meta.env.PROD`).

### Backend

- **Entrada** (`server.js`): Helmet, CORS restringido, rate limiting global y
  específico para login/recuperación, body parser con límite, logging
  estructurado con `pino-http` y montaje de routers.
- **Logging** (`utils/logger.js`): logger `pino` con salida JSON en producción
  y formato legible en desarrollo. Los niveles se controlan con `LOG_LEVEL` y
  nunca se registran tokens, cookies ni contraseñas.
- **Rutas** (`routes/`): un router por recurso (`auth`, `usuarios`,
  `reportes`, `clientes`, `repuestos`, `etiquetas`, `estadisticas`,
  `plantillas`, `estados`, `modificaciones`, `servicios-tecnicos`,
  `preguntas-seguridad`).
- **Autorización** (`middlewares/auth.js`): `verificarToken` valida el JWT y
  `requiereAdmin` restringe las operaciones administrativas. Además se usa
  `verificarPermiso(...)` para permisos granulares (por ejemplo,
  `view-registro-reportes` al crear reportes).
- **Datos**: `db/supabase.js` crea el cliente con la service role key y expone
  un test de conexión. Los reportes guardan sus repuestos en la tabla de
  detalle (`detalle_repuestos`) y mantienen `repuestos_reporte` como repuesto
  principal.

### Flujo de autenticación

1. `POST /api/auth/login` valida credenciales y devuelve un JWT con el usuario.
2. El frontend guarda el token y consulta el rol/permisos efectivos.
3. Cada petición adjunta `Authorization: Bearer <token>`.
4. El backend verifica el token, el rol y los permisos del endpoint.
5. Antes de expirar, el frontend llama a `POST /api/auth/refresh` y sustituye
   el token por uno nuevo (refresco deslizante).
6. Si el refresco falla o una petición devuelve `401`, el cliente limpia la
   sesión y redirige al login con el aviso `?sesion=expirada`.

## Pruebas

Las pruebas del backend usan `node:test` y no requieren frameworks externos:

```bash
cd backend
npm test
```

`test/api.test.js` cubre:

- Guards de autenticación y autorización (`401`/`403`) en reportes y usuarios.
- Validación de entrada del login.
- CRUD de reportes y persistencia de la cantidad de repuestos (solo si hay
  credenciales reales de Supabase; si no, esas pruebas se omiten).

`test/helpers.js` permite arrancar el servidor en un puerto libre y generar
tokens JWT firmados con el mismo secreto del backend.

## Integración continua

`.github/workflows/ci.yml` se ejecuta en cada pull request y en cada push a
`main`:

- **Frontend**: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`.
- **Backend**: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`.

## Despliegue

- **Frontend**: Netlify (`frontend/netlify.toml`) ejecuta el build y redirige
  las rutas de SPA a `index.html`.
- **Backend**: Render (`backend/render.yaml`) usa `npm start` y requiere las
  variables de entorno descritas arriba, incluida `CORS_ORIGIN` con la URL del
  frontend.

## Operaciones

- **Backups de Supabase**: estrategia, backup manual con `pg_dump` y
  restauración en [`docs/BACKUPS-Y-SEED.md`](docs/BACKUPS-Y-SEED.md).
- **Seed del administrador inicial**: `npm run seed:admin` (idempotente). Ver la
  misma guía para variables y buenas prácticas.
- **Seguridad y rotación de claves**: [`docs/SEGURIDAD-Y-OPERACIONES.md`](docs/SEGURIDAD-Y-OPERACIONES.md).
- **Flujo de autenticación y usuarios**: [`docs/FLUJO-AUTH-USUARIOS.md`](docs/FLUJO-AUTH-USUARIOS.md).

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Ver [`LICENSE`](LICENSE).

# Backups de Supabase y seed del administrador

Guía operativa para proteger los datos del proyecto y crear el primer usuario
administrador de forma reproducible.

## 1. Estrategia de backups

La base de datos vive en Supabase (PostgreSQL). Se combinan tres capas:

| Capa | Frecuencia | Retención | Responsable |
| --- | --- | --- | --- |
| Backups automáticos de Supabase | Diaria (según plan) | La del plan contratado | Supabase |
| `pg_dump` programado (script de este repo) | Diaria o semanal | 30 días recomendado | Equipo |
| Copia externa cifrada | Semanal | 3 meses recomendado | Equipo |

### Recomendaciones

- **Activa los backups automáticos** del proyecto en Supabase y verifica que
  estén disponibles en *Project Settings → Database → Backups*.
- **Programa `npm run backup`** en un equipo o job de CI con acceso a la
  cadena de conexión. Guarda los archivos fuera del repositorio (por ejemplo,
  un bucket privado con cifrado en reposo).
- **Cifra las copias** antes de subirlas a almacenamiento externo
  (`gpg --symmetric`, `age`, etc.). El `.dump` contiene datos personales.
- **Prueba una restauración** al menos una vez al trimestre en un proyecto
  Supabase de staging. Un backup que nunca se restaura no es un backup.
- **Nunca subas** archivos `.dump`, `.sql` ni cadenas de conexión al repo.
  `.gitignore` ya excluye `backups/`, `backend/backups/`, `*.dump` y
  `*.sql.gz`.

### RPO / RTO de referencia

- RPO (pérdida máxima de datos): 24 h con backup diario; 1 h si se combina con
  point-in-time recovery del plan de Supabase.
- RTO (tiempo de recuperación): 30–60 min para un `pg_restore` en un proyecto
  nuevo, dependiendo del tamaño.

## 2. Backup manual con `pg_dump`

### Requisitos

- Cliente de PostgreSQL instalado (`pg_dump` en el `PATH`) o variable
  `PG_DUMP` apuntando al binario.
- Cadena de conexión directa de Supabase
  (*Project Settings → Database → Connection string → URI*). Usa la conexión
  directa o el pooler en modo sesión; no la cadena de la API.

### Ejecución

```bash
cd backend
export SUPABASE_DB_URL='postgresql://postgres.<ref>:<password>@<host>:5432/postgres?sslmode=require'
npm run backup
```

Variables opcionales:

| Variable | Descripción | Por defecto |
| --- | --- | --- |
| `SUPABASE_DB_URL` / `DATABASE_URL` | Cadena de conexión directa. | — (obligatoria) |
| `BACKUP_DIR` | Carpeta de salida. | `backend/backups` |
| `PG_DUMP` | Ruta al binario `pg_dump`. | `pg_dump` |

El script genera `sgrt-AAAA-MM-DDTHH-mm-ss.dump` en formato custom de
PostgreSQL, solo con el esquema `public`. La contraseña nunca se imprime.

### Restauración

1. Crea un proyecto Supabase de destino (o una base local).
2. Define la cadena de conexión del destino.
3. Restaura el backup:

```bash
pg_restore \
  --clean --if-exists --no-owner --no-privileges \
  --dbname "$SUPABASE_DB_URL" \
  backups/sgrt-2026-01-01T00-00-00-000Z.dump
```

4. Verifica tablas y conteos principales (`usuarios`, `reportes`, `clientes`).
5. Rota las claves del proyecto de destino y actualiza el entorno del backend.

> `pg_restore` con `--clean` elimina los objetos existentes del esquema
> `public` antes de recrearlos. No lo ejecutes sobre producción sin una copia
> previa.

## 3. Seed del administrador inicial

El script `backend/scripts/seed-admin.js` crea el primer usuario administrador
y es **idempotente**: si el email ya existe, no lo duplica ni cambia su
contraseña salvo que se pida explícitamente.

### Ejecución

```bash
cd backend
ADMIN_EMAIL='admin@tu-dominio.com' \
ADMIN_PASSWORD='UnaClaveLargaYSegura123' \
npm run seed:admin
```

En PowerShell:

```powershell
$env:ADMIN_EMAIL='admin@tu-dominio.com'
$env:ADMIN_PASSWORD='UnaClaveLargaYSegura123'
npm run seed:admin
```

### Variables

| Variable | Obligatoria | Descripción | Por defecto |
| --- | --- | --- | --- |
| `ADMIN_EMAIL` | Sí | Email del administrador. | — |
| `ADMIN_PASSWORD` | Sí | Contraseña inicial (mínimo 8 caracteres). | — |
| `ADMIN_NOMBRE` | No | Nombre. | `Administrador` |
| `ADMIN_APELLIDO` | No | Apellido. | `SGRT` |
| `ADMIN_ROL_ID` | No | ID del rol en la tabla `roles`. | `1` |
| `ADMIN_PERMISOS` | No | Permisos adicionales separados por coma. | Vacío |
| `ADMIN_RESET_PASSWORD` | No | `true` para restablecer la contraseña si el usuario ya existe. | `false` |

Ejemplo con permisos adicionales:

```bash
ADMIN_EMAIL='admin@tu-dominio.com' \
ADMIN_PASSWORD='UnaClaveLargaYSegura123' \
ADMIN_PERMISOS='view-estadisticas,view-gestion-usuarios' \
npm run seed:admin
```

### Notas de seguridad

- Ejecuta el seed solo en el entorno deseado y con la `SUPABASE_SERVICE_ROLE_KEY`
  configurada en `backend/.env`.
- No compartas la contraseña por chat ni la dejes en el historial del shell;
  usa variables de entorno o un gestor de secretos.
- Tras el primer acceso, cambia la contraseña desde la aplicación y configura
  las preguntas de seguridad.
- El script nunca imprime la contraseña en los logs.

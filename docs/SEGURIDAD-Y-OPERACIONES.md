# Seguridad y Operaciones

Documento de referencia para el manejo de secretos, rotación de claves y
configuración segura en producción.

## 1. Variables de entorno y secretos

Los secretos **nunca** deben subirse al repositorio. Verificado:

- `backend/.env` y `frontend/.env` están en `.gitignore` y **no** están
  trackeados por git.
- Solo se versionan las plantillas `backend/.env.example` y
  `frontend/.env.example`.

Variables sensibles del backend:

| Variable | Descripción | Sensible |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada de Supabase (omite RLS). Acceso total a la BD. | **Sí** |
| `JWT_SECRET` | Firma de tokens de sesión. | **Sí** |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase. | No |
| `CORS_ORIGIN` | Lista de orígenes permitidos (separados por coma). | No |
| `PORT`, `NODE_ENV` | Configuración de ejecución. | No |

## 2. Arranque seguro (fail-fast)

El backend aborta el arranque si detecta una configuración insegura en
producción (`NODE_ENV=production`):

- `JWT_SECRET` ausente o con valor por defecto (`config.js`).
- `CORS_ORIGIN` vacío (`config.js`). Sin él, CORS quedaría abierto a cualquier
  origen.

En desarrollo se emiten advertencias en lugar de abortar, para facilitar el
trabajo local.

## 3. Rotación de claves de Supabase

Rotar la `SERVICE_ROLE_KEY` si:

- Sospecha de filtración (clave expuesta en un log, chat, captura, etc.).
- Rotación periódica de seguridad (recomendado cada 6–12 meses).
- Un colaborador con acceso a la clave deja el proyecto.

Pasos:

1. Entrar al panel de Supabase del proyecto de producción.
2. Ir a **Project Settings → API**.
3. En **Project API keys**, sección `service_role`, usar **Reset / Roll**
   para regenerar la clave.
4. Copiar la nueva clave.
5. Actualizar `SUPABASE_SERVICE_ROLE_KEY` en el entorno de despliegue
   (p. ej. Render → Environment) y en `backend/.env` local.
6. Reiniciar el servicio backend para que tome la nueva clave.
7. Verificar que la app conecta (el log debe mostrar
   `[SUPABASE] Conexión exitosa`).
8. Invalidar la clave anterior (el reset ya la desactiva).

> La `anon` key puede rotarse igual, pero solo afecta a clientes que la usen
> directamente (este proyecto no la expone en el frontend).

## 4. Rotación del `JWT_SECRET`

Cambiar `JWT_SECRET` **invalida todas las sesiones activas** (los usuarios
deben volver a iniciar sesión).

Pasos:

1. Generar un secreto nuevo y fuerte:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
2. Actualizar `JWT_SECRET` en el entorno de despliegue (Render) y en
   `backend/.env` local.
3. Reiniciar el backend.
4. Comunicar a los usuarios que deberán iniciar sesión nuevamente.

> En `render.yaml` la variable está marcada como `sync: false` precisamente
> para que Render **no** la regenere en cada deploy (lo que cerraría las
> sesiones sin avisar). Se administra manualmente.

## 5. Endurecimiento aplicado (P1)

- **CORS estricto**: solo se aceptan orígenes en `CORS_ORIGIN`. Las peticiones
  sin `Origin` (scripts de servidor) se permiten.
- **Rate limiting**:
  - Global: 300 peticiones / 15 min por IP.
  - Login: 20 intentos / 15 min.
  - Recuperación de contraseña (`/auth/verificar-preguntas` y
    `/auth/recuperar-password`): 5 intentos / 15 min.
  - El servidor configura `app.set('trust proxy', 1)` para que `req.ip` sea la
    IP real del cliente detrás del proxy de Render. Sin esto, todos los
    usuarios compartirían el mismo contador.
- **Sanitización de filtros**: los valores que se interpolan en `.or()` de
  PostgREST se citan con `escapeFiltroPostgrest` (comillas dobles), de modo
  que comas, puntos, paréntesis y comillas se tratan como texto literal y no
  como sintaxis del filtro.
- **Autorización por permiso**: los endpoints sensibles (estadísticas,
  búsqueda y creación de reportes, historial de modificaciones) exigen el
  permiso correspondiente (`verificarPermiso`), considerando los permisos por
  defecto del rol más los permisos adicionales del token.

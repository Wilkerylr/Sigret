# Checklist de Endpoints del Backend - SGRT

## Estado actual: 12/12 módulos completados

---

## ✅ Módulo 1: Autenticación (`/api/auth`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/auth/login` | Iniciar sesión (email + contraseña → JWT) | ✅ |
| POST | `/api/auth/logout` | Cerrar sesión | ✅ |
| GET | `/api/auth/perfil` | Obtener perfil del usuario autenticado | ✅ |
| PUT | `/api/auth/cambiar-contraseña` | Cambiar contraseña (requiere contraseña actual) | ✅ |
| GET | `/api/auth/refresh-permissions` | Refrescar permisos y token | ✅ |

---

## ✅ Módulo 2: Usuarios (`/api/usuarios`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/usuarios/register` | Registrar nuevo usuario | ✅ |
| GET | `/api/usuarios` | Obtener todos los usuarios activos | ✅ |
| GET | `/api/usuarios/:id` | Obtener usuario por ID | ✅ |
| GET | `/api/usuarios/roles` | Obtener lista de roles | ✅ |
| GET | `/api/usuarios/permisos-adicionales` | Obtener permisos disponibles | ✅ |
| PUT | `/api/usuarios/:id` | Actualizar usuario | ✅ |
| DELETE | `/api/usuarios/:id` | Soft delete (is_delete = true) | ✅ |
| PATCH | `/api/usuarios/:id/restaurar` | Reactivar usuario (requiereAdmin) | ✅ |

---

## ✅ Módulo 3: Clientes (`/api/clientes`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/clientes` | Crear nuevo cliente | ✅ |
| GET | `/api/clientes` | Obtener todos los clientes activos | ✅ |
| GET | `/api/clientes/:id` | Obtener cliente por ID | ✅ |
| PUT | `/api/clientes/:id` | Actualizar cliente | ✅ |
| DELETE | `/api/clientes/:id` | Soft delete (is_delete = true) | ✅ |
| PATCH | `/api/clientes/:id/restaurar` | Reactivar cliente (requiereAdmin) | ✅ |
 
---

## ✅ Módulo 4: Reportes (`/api/reportes`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/reportes` | Crear nuevo reporte (número auto-generado) | ✅ |
| GET | `/api/reportes` | Obtener reportes (filtros + paginación) | ✅ |
| GET | `/api/reportes/:id` | Obtener reporte por ID (detalle completo) | ✅ |
| PUT | `/api/reportes/:id` | Actualizar reporte (genera auditoría). Requiere `motivoModificacion` (400 si falta) | ✅ |
| DELETE | `/api/reportes/:id` | Soft delete (genera auditoría) | ✅ |
| PATCH | `/api/reportes/:id/restaurar` | Reactivar reporte (requiereAdmin) | ✅ |

---

## ✅ Módulo 5: Etiquetas (`/api/etiquetas`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/etiquetas` | Crear etiqueta | ✅ |
| GET | `/api/etiquetas` | Obtener todas las etiquetas | ✅ |
| GET | `/api/etiquetas/:id` | Obtener etiqueta por ID | ✅ |
| PUT | `/api/etiquetas/:id` | Actualizar etiqueta | ✅ |
| DELETE | `/api/etiquetas/:id` | Eliminar etiqueta | ✅ |

---

## ✅ Módulo 6: Plantillas (`/api/plantillas`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/plantillas` | Crear plantilla | ✅ |
| GET | `/api/plantillas` | Obtener todas las plantillas | ✅ |
| GET | `/api/plantillas/:id` | Obtener plantilla por ID | ✅ |
| PUT | `/api/plantillas/:id` | Actualizar plantilla | ✅ |
| DELETE | `/api/plantillas/:id` | Eliminar plantilla | ✅ |

---

## ✅ Módulo 7: Modificaciones/Auditoría (`/api/modificaciones`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/api/modificaciones` | Listar historial (filtros + paginación) | ✅ |
| GET | `/api/modificaciones/reporte/:id` | Modificaciones de un reporte | ✅ |

---

## ✅ Módulo 8: Estados de Equipos (`/api/estados-equipos`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/estados-equipos` | Crear estado | ✅ |
| GET | `/api/estados-equipos` | Obtener todos los estados | ✅ |
| GET | `/api/estados-equipos/:id` | Obtener estado por ID | ✅ |
| PUT | `/api/estados-equipos/:id` | Actualizar estado | ✅ |
| DELETE | `/api/estados-equipos/:id` | Eliminar estado (bloquea si está en uso) | ✅ |

---

## ✅ Módulo 9: Repuestos (`/api/repuestos`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/repuestos` | Crear repuesto | ✅ |
| GET | `/api/repuestos` | Obtener todos los repuestos activos | ✅ |
| GET | `/api/repuestos/:id` | Obtener repuesto por ID | ✅ |
| PUT | `/api/repuestos/:id` | Actualizar repuesto | ✅ |
| DELETE | `/api/repuestos/:id` | Soft delete | ✅ |

---

## ✅ Módulo 10: Servicios Técnicos (`/api/servicios-tecnicos`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/servicios-tecnicos` | Asignar servicio a técnico | ✅ |
| GET | `/api/servicios-tecnicos` | Obtener todos los servicios | ✅ |
| GET | `/api/servicios-tecnicos/tecnico/:tecnicoId` | Servicios por técnico | ✅ |
| DELETE | `/api/servicios-tecnicos/:id` | Desasignar servicio | ✅ |

---

## ✅ Módulo 11: Estadísticas (`/api/estadisticas`) — COMPLETADO
| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/api/estadisticas` | Métricas del dashboard (totales, pendientes, por mes) | ✅ |
| GET | `/api/estadisticas/reportes-por-mes` | Reportes agrupados por mes (gráfico de barras) | ✅ |
| GET | `/api/estadisticas/tecnicos-top` | Top de técnicos por reportes atendidos | ✅ |

---

## Resumen

| Módulo | Endpoints | Estado |
|--------|-----------|--------|
| Autenticación | 5/5 | ✅ Completado |
| Usuarios | 8/8 | ✅ Completado |
| Clientes | 6/6 | ✅ Completado |
| Reportes | 6/6 | ✅ Completado |
| Etiquetas | 5/5 | ✅ Completado |
| Plantillas | 5/5 | ✅ Completado |
| Modificaciones | 2/2 | ✅ Completado |
| Estados Equipos | 5/5 | ✅ Completado |
| Repuestos | 5/5 | ✅ Completado |
| Servicios Técnicos | 4/4 | ✅ Completado |
| Estadísticas | 3/3 | ✅ Completado |
| **Total** | **54** | **54/54 completados (100%)** |

---

## Notas de seguridad aplicadas (sección 3.1)

- 🔐 **JWT_SECRET obligatorio** — `backend/config.js` aborta el arranque si falta o es < 16 chars (B1)
- 🧹 **Validación/sanitización** en POST y PUT de reportes (tamaños máximos, fechas ≤ hoy, horas coherentes) (B2)
- 🛡️ **helmet + morgan + rate-limit** (300/15min global, 20/15min en login) + **CORS whitelist** en `server.js` (B3)
- 👤 **Auditoría con nombre completo** vía `nombreCompletoUsuario()` — corrige el bug `undefined undefined` (B4)
- 🔑 **SUPABASE_SERVICE_ROLE_KEY** preferida sobre la publishable key (B5)
- 🧱 **Middlewares centralizados** `verificarToken` / `requiereAdmin` / `verificarPermiso` en `middlewares/auth.js` (B9)
- ↩️ **Compensación** en POST reportes (deshacer creaciones parciales) y restore de permisos en PUT usuarios (B8)
- 🔢 **IDs autoincrementales** para `clientes` y `plantillas_reportes` (migración SQL) (B10)
- ✏️ **Motivo de modificación obligatorio** en `PUT /api/reportes/:id` (400 si falta) y auditoría con `| Motivo: ...`
- 🧪 **Suite de pruebas** con `npm test` (`node --test test/*.test.js`) sobre `utils/validaciones.js` (funciones puras)
- 🔧 **Infra**: ESLint configurado (`eslint.config.js`, `npm run lint` OK) · `npm start` ahora usa `node server.js` (se eliminó el servidor zombi `src/index.ts`) · CORS whitelist vía `CORS_ORIGIN` en `.env`

> **Pendiente para producción:** ejecutar `backend/db/migrations/2026-08-05_ids_autoincrement.sql` en el SQL Editor de Supabase y definir `SUPABASE_SERVICE_ROLE_KEY` en `.env`.

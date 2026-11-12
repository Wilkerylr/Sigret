/**
 * Seed idempotente del administrador inicial
 *
 * Crea el primer usuario administrador cuando la base de datos está vacía.
 * Si el email ya existe no lo modifica (salvo ADMIN_RESET_PASSWORD=true),
 * por lo que puede ejecutarse varias veces sin duplicar datos.
 *
 * Uso:
 *   cd backend
 *   ADMIN_EMAIL=admin@ejemplo.com ADMIN_PASSWORD='UnaClaveSegura123' npm run seed:admin
 *
 * Variables de entorno:
 *   ADMIN_NOMBRE           Nombre del administrador (por defecto "Administrador")
 *   ADMIN_APELLIDO         Apellido (por defecto "SGRT")
 *   ADMIN_EMAIL            Email del administrador (obligatorio)
 *   ADMIN_PASSWORD         Contraseña inicial (obligatoria, mínimo 8 caracteres)
 *   ADMIN_ROL_ID           ID del rol (por defecto 1 = administrador)
 *   ADMIN_PERMISOS         Permisos adicionales separados por coma (opcional)
 *   ADMIN_RESET_PASSWORD   "true" para restablecer la contraseña si el usuario ya existe
 *
 * Nunca imprime la contraseña en los logs.
 */

require('dotenv').config();

const bcrypt = require('bcrypt');
const { supabase } = require('../db/supabase');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;
const LONGITUD_MINIMA_PASSWORD = 8;

function leerConfiguracion() {
  const nombre = (process.env.ADMIN_NOMBRE || 'Administrador').trim();
  const apellido = (process.env.ADMIN_APELLIDO || 'SGRT').trim();
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const rolId = Number(process.env.ADMIN_ROL_ID || 1);
  const resetPassword = process.env.ADMIN_RESET_PASSWORD === 'true';
  const permisos = (process.env.ADMIN_PERMISOS || '')
    .split(',')
    .map((permiso) => permiso.trim())
    .filter(Boolean);

  const errores = [];

  if (!email || !email.includes('@')) {
    errores.push('ADMIN_EMAIL debe ser un correo electrónico válido.');
  }
  if (password.length < LONGITUD_MINIMA_PASSWORD) {
    errores.push(
      `ADMIN_PASSWORD es obligatoria y debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`
    );
  }
  if (!Number.isInteger(rolId) || rolId <= 0) {
    errores.push('ADMIN_ROL_ID debe ser un número entero positivo.');
  }

  if (errores.length > 0) {
    for (const error of errores) {
      logger.error(`[SEED] ${error}`);
    }
    process.exit(1);
  }

  return { nombre, apellido, email, password, rolId, resetPassword, permisos };
}

async function obtenerRol(rolId) {
  const { data: rol, error } = await supabase
    .from('roles')
    .select('id, nombre_rol')
    .eq('id', rolId)
    .maybeSingle();

  if (error) {
    logger.error('[SEED] Error al consultar roles:', error.message);
    process.exit(1);
  }

  if (!rol) {
    const { data: disponibles } = await supabase
      .from('roles')
      .select('id, nombre_rol')
      .order('id');

    logger.error(`[SEED] El rol ${rolId} no existe en la tabla roles.`);
    if (disponibles?.length) {
      logger.error(
        `[SEED] Roles disponibles: ${disponibles
          .map((r) => `${r.id}=${r.nombre_rol}`)
          .join(', ')}`
      );
    }
    process.exit(1);
  }

  return rol;
}

async function asignarPermisos(usuarioId, permisos) {
  if (permisos.length === 0) return;

  const ids = [];
  for (const nombre of permisos) {
    const { data, error } = await supabase
      .from('permisos_adicionales')
      .upsert(
        { nombre_permiso: nombre, valor_permiso: 1 },
        { onConflict: 'nombre_permiso', ignoreDuplicates: false }
      )
      .select('id')
      .maybeSingle();

    if (error || !data) {
      logger.warn(`[SEED] No se pudo resolver el permiso "${nombre}":`, error?.message);
      continue;
    }

    ids.push(data.id);
  }

  if (ids.length === 0) return;

  // Deja exactamente los permisos indicados para que el seed sea idempotente.
  const { error: deleteError } = await supabase
    .from('permisos_usuarios')
    .delete()
    .eq('usuario_permiso', usuarioId);

  if (deleteError) {
    logger.warn('[SEED] No se pudieron limpiar permisos previos:', deleteError.message);
    return;
  }

  const filas = ids.map((permisoId) => ({
    permiso_usuario: permisoId,
    usuario_permiso: usuarioId,
  }));

  const { error: insertError } = await supabase.from('permisos_usuarios').insert(filas);

  if (insertError) {
    logger.warn('[SEED] No se pudieron asignar los permisos:', insertError.message);
  }
}

async function main() {
  const configuracion = leerConfiguracion();
  const rol = await obtenerRol(configuracion.rolId);

  const { data: existente, error: busquedaError } = await supabase
    .from('usuarios')
    .select('id, email_usuario')
    .eq('email_usuario', configuracion.email)
    .eq('is_delete', false)
    .maybeSingle();

  if (busquedaError) {
    logger.error('[SEED] Error al buscar el administrador:', busquedaError.message);
    process.exit(1);
  }

  if (existente) {
    if (!configuracion.resetPassword) {
      logger.info(
        `[SEED] El usuario ${configuracion.email} ya existe (ID ${existente.id}). No se modifica.`
      );
      logger.info('[SEED] Usa ADMIN_RESET_PASSWORD=true para restablecer su contraseña.');
      return;
    }

    const hash = await bcrypt.hash(configuracion.password, SALT_ROUNDS);
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ contraseña_usuario: hash, rol_usuario: configuracion.rolId })
      .eq('id', existente.id);

    if (updateError) {
      logger.error('[SEED] Error al actualizar la contraseña:', updateError.message);
      process.exit(1);
    }

    await asignarPermisos(existente.id, configuracion.permisos);

    logger.info(`[SEED] Contraseña del administrador ${configuracion.email} actualizada.`);
    return;
  }

  const hash = await bcrypt.hash(configuracion.password, SALT_ROUNDS);

  const { data: nuevo, error: insertError } = await supabase
    .from('usuarios')
    .insert({
      nombre_usuario: configuracion.nombre,
      apellido_usuario: configuracion.apellido,
      email_usuario: configuracion.email,
      contraseña_usuario: hash,
      rol_usuario: configuracion.rolId,
    })
    .select('id')
    .single();

  if (insertError || !nuevo) {
    logger.error('[SEED] Error al crear el administrador:', insertError?.message);
    process.exit(1);
  }

  await asignarPermisos(nuevo.id, configuracion.permisos);

  logger.info('[SEED] Administrador inicial creado correctamente.');
  logger.info(`[SEED]   ID: ${nuevo.id}`);
  logger.info(`[SEED]   Email: ${configuracion.email}`);
  logger.info(`[SEED]   Rol: ${rol.nombre_rol} (${rol.id})`);
}

main().catch((error) => {
  logger.error('[SEED] Error inesperado:', error);
  process.exit(1);
});

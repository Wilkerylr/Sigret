/**
 * Utilidades para obtener datos del usuario autenticado.
 */

const { supabase } = require('../db/supabase');

/**
 * Devuelve el nombre completo del usuario autenticado.
 * Usa los datos del token JWT si están presentes (tokens nuevos) y
 * cae a una consulta a la BD para tokens antiguos.
 *
 * @param {import('express').Request} req - Request de Express con req.usuario
 * @returns {Promise<string>}
 */
async function nombreCompletoUsuario(req) {
  if (req?.usuario?.nombre_usuario) {
    return `${req.usuario.nombre_usuario} ${req.usuario.apellido_usuario || ''}`.trim();
  }

  try {
    const { data } = await supabase
      .from('usuarios')
      .select('nombre_usuario, apellido_usuario')
      .eq('id', req?.usuario?.id)
      .maybeSingle();

    if (data) {
      return `${data.nombre_usuario} ${data.apellido_usuario || ''}`.trim();
    }
  } catch (error) {
    console.error('[UTIL] Error al obtener nombre de usuario:', error.message);
  }

  return 'Usuario';
}

module.exports = { nombreCompletoUsuario };

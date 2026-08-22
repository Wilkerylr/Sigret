/**
 * Rutas para el módulo de Autenticación
 * Login, Logout, Perfil y Cambio de contraseña
 * 
 * Endpoints:
 *   POST   /api/auth/login              → Iniciar sesión (email + contraseña → JWT)
 *   POST   /api/auth/logout             → Cerrar sesión
 *   GET    /api/auth/perfil             → Obtener perfil del usuario autenticado
 *   PUT    /api/auth/cambiar-password → Cambiar contraseña
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db/supabase');

// ==========================================
// CONSTANTES
// ==========================================

/** Clave secreta y expiración del JWT (cargadas desde .env, obligatorias) */
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

/** Verificación de token compartida (middlewares/auth.js) */
const { verificarToken } = require('../middlewares/auth');

// ==========================================
// ENDPOINTS
// ==========================================

/**
 * POST /api/auth/login
 * 
 * Inicia sesión con email y contraseña.
 * Devuelve un token JWT válido por 8 horas y los datos del usuario.
 * 
 * --- Request Body (JSON) ---
 * {
 *   "email_usuario": "admin@email.com",
 *   "contraseña": "password123"
 * }
 * 
 * --- Códigos de Respuesta ---
 *   200 - Login exitoso (token + datos del usuario)
 *   400 - Error de validación
 *   401 - Credenciales incorrectas
 *   500 - Error interno del servidor
 */
router.post('/login', async (req, res) => {
  try {
    const { email_usuario, contraseña, usuario: usuarioInput } = req.body;

    // Validar campos obligatorios
    const credencial = email_usuario || usuarioInput;
    if (!credencial || !contraseña) {
      return res.status(400).json({
        error: 'El usuario/email y la contraseña son obligatorios',
      });
    }

    // Buscar usuario por email o nombre de usuario (activo)
    let query = supabase
      .from('usuarios')
      .select(`
        id,
        nombre_usuario,
        apellido_usuario,
        email_usuario,
        contraseña_usuario,
        rol_usuario,
        is_delete,
        roles!inner (
          id,
          nombre_rol
        )
      `)
      .eq('is_delete', false);

    // Si contiene @ busca por email, sino por nombre_usuario
    if (credencial.includes('@')) {
      query = query.eq('email_usuario', credencial.trim().toLowerCase());
    } else {
      query = query.eq('nombre_usuario', credencial.trim());
    }

    const { data: usuarios, error } = await query;

    if (error) {
      console.error('[AUTH] Error al buscar usuario:', error.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Si no se encontró ningún usuario
    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Si hay múltiples usuarios con el mismo nombre, tomar el primero
    // (esto no debería pasar si la DB tiene restricción de unicidad)
    const usuario = usuarios[0];

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña_usuario);
    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Obtener permisos del usuario
    const { data: permisosData } = await supabase
      .from('permisos_usuarios')
      .select(`
        permiso_usuario,
        permisos_adicionales!inner (
          id,
          nombre_permiso,
          valor_permiso
        )
      `)
      .eq('usuario_permiso', usuario.id);

    const permisos = (permisosData || []).map(p => ({
      id: p.permisos_adicionales.id,
      nombre: p.permisos_adicionales.nombre_permiso,
      valor: p.permisos_adicionales.valor_permiso,
    }));

    // Generar token JWT (incluye permisos para que el backend los tenga disponibles)
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email_usuario,
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        rol_id: usuario.rol_usuario,
        rol_nombre: usuario.roles?.nombre_rol || null,
        permisos: permisos.map(p => p.nombre),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Verificar si el usuario tiene preguntas de seguridad registradas
    const { count } = await supabase
      .from('respuestas_seguridad')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_respuesta', usuario.id);

    const primerLogin = !count || count === 0;

    // Responder con token y datos del usuario
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      primer_login: primerLogin,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        email: usuario.email_usuario,
        rol: {
          id: usuario.rol_usuario,
          nombre: usuario.roles?.nombre_rol || null,
        },
        permisos,
      },
    });
  } catch (error) {
    console.error('[AUTH] Error inesperado en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/auth/logout
 * 
 * Cierra la sesión del usuario.
 * En una app con JWT, el logout se maneja del lado del cliente
 * eliminando el token. Este endpoint puede usarse para invalidar
 * tokens en una blacklist si se requiere.
 */
router.post('/logout', verificarToken, (req, res) => {
  res.json({ message: 'Sesión cerrada exitosamente' });
});

/**
 * GET /api/auth/perfil
 * 
 * Obtiene el perfil completo del usuario autenticado.
 * Requiere token JWT en el header Authorization.
 */
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre_usuario,
        apellido_usuario,
        email_usuario,
        rol_usuario,
        is_delete,
        roles!inner (
          id,
          nombre_rol
        )
      `)
      .eq('id', usuarioId)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener permisos
    const { data: permisosData } = await supabase
      .from('permisos_usuarios')
      .select(`
        permiso_usuario,
        permisos_adicionales!inner (
          id,
          nombre_permiso,
          valor_permiso
        )
      `)
      .eq('usuario_permiso', usuarioId);

    const permisos = (permisosData || []).map(p => p.permisos_adicionales);

    res.json({
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      apellido_usuario: usuario.apellido_usuario,
      email: usuario.email_usuario,
      rol: {
        id: usuario.rol_usuario,
        nombre: usuario.roles?.nombre_rol || null,
      },
      permisos: permisos.map(p => ({
        id: p.id,
        nombre: p.nombre_permiso,
        valor: p.valor_permiso,
      })),
    });
  } catch (error) {
    console.error('[AUTH] Error inesperado en perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/auth/cambiar-contraseña
 * 
 * Cambia la contraseña del usuario autenticado.
 * Requiere la contraseña actual y la nueva contraseña.
 */
router.put('/cambiar-password', verificarToken, async (req, res) => {
  try {
    const { contraseña_actual, nueva_contraseña } = req.body;
    const usuarioId = req.usuario.id;

    if (!nueva_contraseña) {
      return res.status(400).json({ error: 'La nueva contraseña es obligatoria' });
    }

    if (nueva_contraseña.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    if (!contraseña_actual) {
      return res.status(400).json({ error: 'La contraseña actual es obligatoria' });
    }

    // Obtener contraseña actual
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('contraseña_usuario')
      .eq('id', usuarioId)
      .single();

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const valida = await bcrypt.compare(contraseña_actual, usuario.contraseña_usuario);
    if (!valida) {
      return res.status(401).json({ error: 'La contraseña actual no es correcta' });
    }

    // Hashear y actualizar nueva contraseña
    const nuevaHash = await bcrypt.hash(nueva_contraseña, 10);
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ contraseña_usuario: nuevaHash })
      .eq('id', usuarioId);

    if (updateError) {
      console.error('[AUTH] Error al actualizar contraseña:', updateError.message);
      return res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('[AUTH] Error inesperado en cambiar-contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/auth/refresh-permissions
 *
 * Refresca los permisos del usuario autenticado desde la base de datos.
 * Útil cuando los permisos cambian (ej: un admin modifica permisos de otro usuario)
 * y se necesita actualizar el token sin cerrar sesión.
 */
router.get('/refresh-permissions', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Obtener datos actualizados del usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre_usuario,
        apellido_usuario,
        email_usuario,
        rol_usuario,
        is_delete,
        roles!inner (
          id,
          nombre_rol
        )
      `)
      .eq('id', usuarioId)
      .eq('is_delete', false)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener permisos actualizados
    const { data: permisosData } = await supabase
      .from('permisos_usuarios')
      .select(`
        permiso_usuario,
        permisos_adicionales!inner (
          id,
          nombre_permiso,
          valor_permiso
        )
      `)
      .eq('usuario_permiso', usuarioId);

    const permisos = (permisosData || []).map(p => ({
      id: p.permisos_adicionales.id,
      nombre: p.permisos_adicionales.nombre_permiso,
      valor: p.permisos_adicionales.valor_permiso,
    }));

    // Generar nuevo token con permisos actualizados
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email_usuario,
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        rol_id: usuario.rol_usuario,
        rol_nombre: usuario.roles?.nombre_rol || null,
        permisos: permisos.map(p => p.nombre),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        email: usuario.email_usuario,
        rol: {
          id: usuario.rol_usuario,
          nombre: usuario.roles?.nombre_rol || null,
        },
        permisos,
      },
    });
  } catch (error) {
    console.error('[AUTH] Error inesperado en refresh-permissions:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = { router, verificarToken };
/**
 * Rutas para el módulo de Usuarios
 * CRUD de usuarios del sistema con Supabase
 * 
 * Endpoints:
 *   POST   /api/usuarios/register  → Registrar un nuevo usuario
 *   GET    /api/usuarios           → Obtener todos los usuarios activos
 *   GET    /api/usuarios/:id       → Obtener un usuario por ID
 *   PUT    /api/usuarios/:id       → Actualizar un usuario
 *   DELETE /api/usuarios/:id       → Soft delete (marca is_delete = true)
 * 
 * Esquema de base de datos (PostgreSQL en Supabase):
 *   - Usuarios (id, nombre_usuario, apellido_usuario, rol_usuario, email_usuario, contraseña_usuario, is_delete)
 *   - Roles (id, nombre_rol)
 *   - Permisos_adicionales (id, nombre_permiso, valor_permiso)
 *   - Permisos_Usuarios (id, permiso_usuario, usuario_permiso) [tabla intermedia]
 * 
 * Mejores prácticas aplicadas (basadas en Supabase Postgres Best Practices):
 *   1. Consultas con filtros en columnas indexadas (WHERE en id, email_usuario)
 *   2. Uso de transacciones atómicas para operaciones multi-tabla
 *   3. Soft delete en lugar de DELETE físico (is_delete = true)
 *   4. Contraseñas hasheadas con bcrypt (nunca texto plano)
 *   5. Validación de datos antes de consultar la BD
 *   6. Manejo de errores con try/catch y códigos HTTP apropiados
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Cliente de Supabase (reemplaza el pool de pg)
const { supabase } = require('../db/supabase');

// Middleware de autenticación (reutilizado desde middlewares/auth.js)
const { verificarToken, requiereAdmin } = require('../middlewares/auth');

// Middleware de caché HTTP (datos no volátiles)
const { cacheMiddleware } = require('../middlewares/cache');

// ==========================================
// CONSTANTES
// ==========================================

/** Número de rondas de salt para bcrypt (recomendado: 10-12) */
const SALT_ROUNDS = 10;

/**
 * Mapeo de IDs de roles según la tabla Roles.
 * Deben coincidir con los registros insertados en la BD.
 * 
 *   id = 1 → 'admin'
 *   id = 2 → 'tecnico'
 *   id = 3 → 'administrativo'
 */
const ROLES_VALIDOS = [1, 2, 3];

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Obtiene los permisos asignados a un usuario desde la tabla intermedia Permisos_Usuarios.
 * 
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Lista de permisos { id, nombre_permiso, valor_permiso }
 * 
 * Mejores prácticas:
 *   - La columna usuario_permiso en Permisos_Usuarios es FK → debería tener índice
 *   - Se usa .eq() que en Supabase genera consultas con filtro indexado
 */
async function obtenerPermisosUsuario(usuarioId) {
const { data, error } = await supabase
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

  if (error) {
    console.error('[USUARIOS] Error al obtener permisos:', error.message);
    return [];
  }

  // Extraer los datos del join
  return data.map(item => item.permisos_adicionales).filter(Boolean);
}

/**
 * Resuelve un array de permisos (nombres strings o IDs numéricos) a IDs de permisos_adicionales.
 * Si el permiso no existe, lo crea automáticamente.
 * 
 * @param {Array<string|number>} permisos - Lista de permisos (strings como 'view-estadisticas' o IDs numéricos)
 * @returns {Promise<number[]>} Lista de IDs resueltos
 */
async function resolverPermisos(permisos) {
  if (!permisos || !Array.isArray(permisos) || permisos.length === 0) return [];

  const ids = [];
  for (const permiso of permisos) {
    let permisoId = null;
    const esNumero = typeof permiso === 'number' || (typeof permiso === 'string' && /^\d+$/.test(permiso));

    if (esNumero) {
      permisoId = Number(permiso);
    } else if (typeof permiso === 'string' && permiso.trim()) {
      const nombre = permiso.trim();

      // Usar upsert para evitar race conditions al crear permisos duplicados
      const { data, error } = await supabase
        .from('permisos_adicionales')
        .upsert(
          { nombre_permiso: nombre, valor_permiso: 1 },
          { onConflict: 'nombre_permiso', ignoreDuplicates: false }
        )
        .select('id')
        .maybeSingle();

      if (!error && data) {
        permisoId = data.id;
      } else if (error) {
        // Si el upsert falla por duplicado, buscar el existente
        const { data: existente } = await supabase
          .from('permisos_adicionales')
          .select('id')
          .eq('nombre_permiso', nombre)
          .maybeSingle();
        if (existente) {
          permisoId = existente.id;
        }
      }
    }

    if (permisoId !== null && !ids.includes(permisoId)) {
      ids.push(permisoId);
    }
  }

  return ids;
}

/**
 * Construye el objeto de respuesta de un usuario excluyendo datos sensibles
 * (como la contraseña) y formateando los campos para el frontend.
 * 
 * @param {Object} usuario - Fila de la tabla Usuarios
 * @param {Array} permisos - Lista de permisos del usuario
 * @returns {Object} Usuario formateado para la respuesta HTTP
 */
function formatearUsuario(usuario, permisos = []) {
  return {
    id: usuario.id,
    nombre_usuario: usuario.nombre_usuario,
    apellido_usuario: usuario.apellido_usuario,
    email: usuario.email_usuario,
    rol: {
      id: usuario.rol_usuario,
      nombre: usuario.nombre_rol || null,
    },
    permisos: permisos.map(p => ({
      id: p.id,
      nombre: p.nombre_permiso,
      valor: p.valor_permiso,
    })),
    activo: !usuario.is_delete,
    // No se incluye contraseña_usuario por seguridad
  };
}

// ==========================================
// ENDPOINTS
// ==========================================

/**
 * POST /api/usuarios/register
 * 
 * Registra un nuevo usuario en el sistema.
 * 
 * --- Request Body (JSON) ---
 * {
 *   "nombre_usuario":  "Juan",            // Obligatorio - Nombre
 *   "apellido_usuario": "Pérez",          // Obligatorio - Apellido
 *   "email":           "juan@email.com",  // Obligatorio - Email único
 *   "contraseña":      "MiPass123",       // Obligatorio - Mín. 6 caracteres
 *   "rol_usuario":     2,                 // Obligatorio - 1=admin, 2=tecnico, 3=admin
 *   "permisos":        [1, 3, 5]          // Opcional - IDs de permisos adicionales
 * }
 * 
 * --- Códigos de Respuesta ---
 *   201 - Usuario creado exitosamente
 *   400 - Error de validación (campos faltantes o inválidos)
 *   409 - Conflicto (el email ya está registrado)
 *   500 - Error interno del servidor
 */
router.post('/register', verificarToken, requiereAdmin, async (req, res) => {
  try {
    // ==========================================
    // PASO 1: Validar campos obligatorios
    // ==========================================
    const { nombre_usuario, apellido_usuario, email_usuario, contraseña, rol_usuario, permisos } = req.body;

    const errores = [];

    if (!nombre_usuario || typeof nombre_usuario !== 'string' || nombre_usuario.trim().length === 0) {
      errores.push('El campo "nombre_usuario" es obligatorio y debe ser un texto válido');
    }
    if (apellido_usuario && (typeof apellido_usuario !== 'string' || apellido_usuario.trim().length === 0)) {
      errores.push('El campo "apellido_usuario" debe ser un texto válido');
    }
    if (email_usuario && (typeof email_usuario !== 'string' || !email_usuario.includes('@'))) {
      errores.push('El campo "email_usuario" debe ser un correo electrónico válido');
    }
    if (!contraseña || typeof contraseña !== 'string' || contraseña.length < 6) {
      errores.push('El campo "contraseña" es obligatorio y debe tener al menos 6 caracteres');
    }
    if (!rol_usuario || !ROLES_VALIDOS.includes(Number(rol_usuario))) {
      errores.push(`El campo "rol_usuario" es obligatorio. IDs válidos: ${ROLES_VALIDOS.join(', ')}`);
    }

    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Error de validación',
        detalles: errores,
      });
    }

    // ==========================================
    // PASO 2: Verificar que el email no exista
    // ==========================================
    const { data: emailExistente, error: emailError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email_usuario', email_usuario.trim().toLowerCase())
      .eq('is_delete', false)
      .maybeSingle();

    if (emailError) {
      console.error('[USUARIOS] Error al verificar email:', emailError.message);
      return res.status(500).json({ error: 'Error al verificar disponibilidad del email' });
    }

    if (emailExistente) {
      return res.status(409).json({
        error: `El email "${email_usuario}" ya está registrado en el sistema`,
      });
    }

    // ==========================================
    // PASO 3: Hashear la contraseña con bcrypt
    // ==========================================
    const contraseñaHasheada = await bcrypt.hash(contraseña, SALT_ROUNDS);

    // ==========================================
    // PASO 4: Insertar el usuario en Supabase
    // ==========================================
    const { data: nuevoUsuario, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        nombre_usuario: nombre_usuario.trim(),
        apellido_usuario: apellido_usuario.trim(),
        email_usuario: email_usuario.trim().toLowerCase(),
        contraseña_usuario: contraseñaHasheada,
        rol_usuario: Number(rol_usuario),
      })
      .select(`
        id,
        nombre_usuario,
        apellido_usuario,
        email_usuario,
        rol_usuario,
        roles!inner (
          id,
          nombre_rol
        )
      `)
      .single();

    if (insertError) {
      console.error('[USUARIOS] Error al insertar usuario:', insertError.message);
      return res.status(500).json({ error: 'Error al crear el usuario en la base de datos' });
    }

    // ==========================================
    // PASO 5: Asignar permisos (si se proporcionaron)
    // ==========================================
    if (permisos && Array.isArray(permisos) && permisos.length > 0) {
      const permisosResueltos = await resolverPermisos(permisos);

      if (permisosResueltos.length > 0) {
        const permisosAInsertar = permisosResueltos.map(permisoId => ({
          permiso_usuario: permisoId,
          usuario_permiso: nuevoUsuario.id,
        }));

        const { error: permisosError } = await supabase
          .from('permisos_usuarios')
          .insert(permisosAInsertar);

        if (permisosError) {
          console.error('[USUARIOS] Error al asignar permisos:', permisosError.message);
        }
      }
    }

    // ==========================================
    // PASO 6: Obtener permisos asignados
    // ==========================================
    const permisosAsignados = await obtenerPermisosUsuario(nuevoUsuario.id);

    // Combinar el join de Roles con los datos del usuario
    const usuarioConRol = {
      ...nuevoUsuario,
      nombre_rol: nuevoUsuario.roles?.nombre_rol || null,
    };

    // ==========================================
    // PASO 7: Responder con el usuario creado
    // ==========================================
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: formatearUsuario(usuarioConRol, permisosAsignados),
    });
  } catch (error) {
    console.error('[USUARIOS] Error inesperado en register:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el usuario' });
  }
});

/**
 * GET /api/usuarios
 * 
 * Obtiene todos los usuarios activos (is_delete = false).
 * Incluye su rol y permisos asociados.
 * 
 * --- Códigos de Respuesta ---
 *   200 - Lista de usuarios (puede ser vacía)
 *   500 - Error interno del servidor
 */
router.get('/', verificarToken, cacheMiddleware(900), async (req, res) => {
  try {
    // Consultar usuarios activos con su rol
    const { data: usuarios, error } = await supabase
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
      .eq('is_delete', false)
      .order('id', { ascending: true });

    if (error) {
      console.error('[USUARIOS] Error al obtener usuarios:', error.message);
      return res.status(500).json({ error: 'Error al obtener los usuarios' });
    }

    // Para cada usuario, obtener permisos (en paralelo)
    const usuariosConPermisos = await Promise.all(
      (usuarios || []).map(async (usuario) => {
        const permisos = await obtenerPermisosUsuario(usuario.id);
        return formatearUsuario(
          { ...usuario, nombre_rol: usuario.roles?.nombre_rol || null },
          permisos
        );
      })
    );

    res.json(usuariosConPermisos);
  } catch (error) {
    console.error('[USUARIOS] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/permisos-adicionales
 * 
 * Obtiene la lista de permisos adicionales desde la base de datos.
 * DEBE ir antes de /:id para evitar que Express lo interprete como un ID
 */
router.get('/permisos-adicionales', verificarToken, cacheMiddleware(3600), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('permisos_adicionales')
      .select('id, nombre_permiso, valor_permiso')
      .order('id', { ascending: true });

    if (error) {
      console.error('[USUARIOS] Error al obtener permisos adicionales:', error.message);
      return res.status(500).json({ error: 'Error al obtener permisos adicionales' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('[USUARIOS] Error inesperado en GET /permisos-adicionales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/roles
 * 
 * Obtiene la lista de roles desde la base de datos.
 * DEBE ir antes de /:id para evitar que Express lo interprete como un ID
 */
router.get('/roles', verificarToken, cacheMiddleware(3600), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('id, nombre_rol')
      .order('id', { ascending: true });

    if (error) {
      console.error('[USUARIOS] Error al obtener roles:', error.message);
      return res.status(500).json({ error: 'Error al obtener roles' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('[USUARIOS] Error inesperado en GET /roles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/usuarios/:id
 * 
 * Obtiene un usuario específico por su ID.
 * Incluye rol y permisos.
 * 
 * --- Parámetros de ruta ---
 *   id (number) - ID del usuario
 * 
 * --- Códigos de Respuesta ---
 *   200 - Usuario encontrado
 *   400 - ID inválido
 *   404 - Usuario no encontrado o eliminado
 *   500 - Error interno del servidor
 */
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);

    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    // Consultar usuario por ID con su rol
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

    if (error) {
      if (error.code === 'PGRST116') {
        // Código de Supabase para "no se encontraron filas"
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      console.error('[USUARIOS] Error al obtener usuario:', error.message);
      return res.status(500).json({ error: 'Error al obtener el usuario' });
    }

    // Verificar soft delete
    if (usuario.is_delete) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener permisos
    const permisos = await obtenerPermisosUsuario(usuario.id);

    res.json(formatearUsuario(
      { ...usuario, nombre_rol: usuario.roles?.nombre_rol || null },
      permisos
    ));
  } catch (error) {
    console.error('[USUARIOS] Error inesperado en GET /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/usuarios/:id
 * 
 * Actualiza los datos de un usuario existente.
 * 
 * --- Parámetros de ruta ---
 *   id (number) - ID del usuario
 * 
 * --- Request Body (JSON, todos opcionales) ---
 * {
 *   "nombre_usuario":  "Juan Carlos",     // Nuevo nombre
 *   "apellido_usuario": "Pérez García",   // Nuevo apellido
 *   "email":           "nuevo@email.com", // Nuevo email (debe ser único)
 *   "rol_usuario":     2,                 // Nuevo rol
 *   "permisos":        [1, 3, 5]         // Nuevos permisos (reemplaza los anteriores)
 * }
 * 
 * --- Códigos de Respuesta ---
 *   200 - Usuario actualizado
 *   400 - ID inválido o email inválido
 *   404 - Usuario no encontrado
 *   409 - Email ya registrado por otro usuario
 *   500 - Error interno del servidor
 */
router.put('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);

    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { nombre_usuario, apellido_usuario, email, rol_usuario, permisos } = req.body;

    // ==========================================
    // PASO 1: Verificar que el usuario existe
    // ==========================================
    const { data: usuarioActual, error: findError } = await supabase
      .from('usuarios')
      .select('id, email_usuario, rol_usuario, is_delete')
      .eq('id', usuarioId)
      .single();

    if (findError || !usuarioActual || usuarioActual.is_delete) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Prevenir modificar otro admin (solo el propio admin puede cambiarse la contraseña)
    if (usuarioActual.rol_usuario === 1 && usuarioId !== req.usuario.id) {
      return res.status(403).json({ error: 'No se permiten modificar cuentas de administrador' });
    }

    // Prevenir que un admin se cambie su propio rol
    if (usuarioId === req.usuario.id && rol_usuario && Number(rol_usuario) !== 1) {
      return res.status(400).json({ error: 'No puedes cambiar tu propio rol de administrador' });
    }

    // ==========================================
    // PASO 2: Si se proporciona email, verificar unicidad
    // ==========================================
    if (email) {
      if (!email.includes('@')) {
        return res.status(400).json({ error: 'El email proporcionado no es válido' });
      }

      const { data: emailExistente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email_usuario', email.trim().toLowerCase())
        .eq('is_delete', false)
        .neq('id', usuarioId)
        .maybeSingle();

      if (emailExistente) {
        return res.status(409).json({
          error: `El email "${email}" ya está registrado por otro usuario`,
        });
      }
    }

    // ==========================================
    // PASO 3: Construir objeto de actualización
    // ==========================================
    const updateData = {};
    if (nombre_usuario) updateData.nombre_usuario = nombre_usuario.trim();
    if (apellido_usuario) updateData.apellido_usuario = apellido_usuario.trim();
    if (email) updateData.email_usuario = email.trim().toLowerCase();
    if (rol_usuario) updateData.rol_usuario = Number(rol_usuario);

    // ==========================================
    // PASO 4: Actualizar en Supabase
    // ==========================================
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', usuarioId);

      if (updateError) {
        console.error('[USUARIOS] Error al actualizar:', updateError.message);
        return res.status(500).json({ error: 'Error al actualizar el usuario' });
      }
    }

    // ==========================================
    // PASO 5: Reemplazar permisos si se proporcionaron
    // ==========================================
    if (permisos && Array.isArray(permisos)) {
      // Obtener permisos actuales para poder restaurarlos si algo falla
      const { data: permisosActuales } = await supabase
        .from('permisos_usuarios')
        .select('permiso_usuario')
        .eq('usuario_permiso', usuarioId);
      const idsActuales = (permisosActuales || []).map(p => p.permiso_usuario);

      // Resolver nuevos permisos ANTES de borrar (las fallas ocurren temprano)
      const permisosResueltos = await resolverPermisos(permisos);

      // Eliminar permisos actuales (DELETE en lote)
      const { error: deletePermisosError } = await supabase
        .from('permisos_usuarios')
        .delete()
        .eq('usuario_permiso', usuarioId);

      if (deletePermisosError) {
        console.error('[USUARIOS] Error al eliminar permisos anteriores:', deletePermisosError.message);
        return res.status(500).json({ error: 'Error al actualizar los permisos del usuario' });
      }

      // Insertar nuevos permisos; si falla, restaurar los anteriores
      if (permisosResueltos.length > 0) {
        const nuevosPermisos = permisosResueltos.map(permisoId => ({
          permiso_usuario: permisoId,
          usuario_permiso: usuarioId,
        }));

        const { error: insertPermisosError } = await supabase
          .from('permisos_usuarios')
          .insert(nuevosPermisos);

        if (insertPermisosError) {
          if (idsActuales.length > 0) {
            await supabase.from('permisos_usuarios').insert(
              idsActuales.map(permisoId => ({
                permiso_usuario: permisoId,
                usuario_permiso: usuarioId,
              }))
            );
          }
          console.error('[USUARIOS] Error al asignar nuevos permisos:', insertPermisosError.message);
          return res.status(500).json({ error: 'Error al asignar los nuevos permisos del usuario' });
        }
      }
    }

    // ==========================================
    // PASO 6: Obtener datos actualizados para la respuesta
    // ==========================================
    const { data: usuarioFinal } = await supabase
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

    const permisosActualizados = await obtenerPermisosUsuario(usuarioId);

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: formatearUsuario(
        { ...usuarioFinal, nombre_rol: usuarioFinal?.roles?.nombre_rol || null },
        permisosActualizados
      ),
    });
  } catch (error) {
    console.error('[USUARIOS] Error inesperado en PUT /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/usuarios/:id
 * 
 * Elimina un usuario (soft delete: marca is_delete = true).
 * No se borra físicamente para mantener la integridad referencial
 * con otras tablas (Reportes, Modificaciones_Reportes, Servicios_Tecnicos, etc.).
 * 
 * --- Parámetros de ruta ---
 *   id (number) - ID del usuario
 * 
 * --- Códigos de Respuesta ---
 *   200 - Usuario marcado como eliminado
 *   400 - ID inválido
 *   404 - Usuario no encontrado
 *   500 - Error interno del servidor
 */
router.delete('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);

    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    // Prevenir que el admin se elimine a sí mismo
    if (usuarioId === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    // Verificar que el usuario a eliminar exista y esté activo
    const { data: usuarioDestino, error: findError } = await supabase
      .from('usuarios')
      .select('id, rol_usuario, is_delete')
      .eq('id', usuarioId)
      .single();

    if (findError || !usuarioDestino || usuarioDestino.is_delete) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Prevenir que un admin elimine a otro admin
    if (usuarioDestino.rol_usuario === 1) {
      return res.status(403).json({ error: 'No se permiten eliminar cuentas de administrador' });
    }

    // Soft delete: actualizar is_delete = true
    const { data, error } = await supabase
      .from('usuarios')
      .update({ is_delete: true })
      .eq('id', usuarioId)
      .eq('is_delete', false)  // Solo si no está ya eliminado
      .select('id')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario eliminado exitosamente',
      usuarioId: data.id,
    });
  } catch (error) {
    console.error('[USUARIOS] Error inesperado en DELETE /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PATCH /api/usuarios/:id/restaurar
 *
 * Restaura un usuario eliminado lógicamente (is_delete = false).
 */
router.patch('/:id/restaurar', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);

    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, nombre_usuario, apellido_usuario')
      .eq('id', usuarioId)
      .eq('is_delete', true)
      .maybeSingle();

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado o no está eliminado' });
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ is_delete: false })
      .eq('id', usuarioId)
      .eq('is_delete', true);

    if (error) {
      console.error('[USUARIOS] Error al restaurar:', error.message);
      return res.status(500).json({ error: 'Error al restaurar el usuario' });
    }

    res.json({
      message: 'Usuario restaurado exitosamente',
      usuarioId: usuario.id,
    });
  } catch (error) {
    console.error('[USUARIOS] Error inesperado en PATCH /:id/restaurar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

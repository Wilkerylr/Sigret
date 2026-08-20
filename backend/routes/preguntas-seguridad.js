/**
 * Rutas para el módulo de Preguntas de Seguridad
 * Recuperación de contraseña y registro de preguntas de seguridad
 *
 * Endpoints:
 *   GET  /api/auth/preguntas-seguridad    → Lista preguntas activas (requiere token)
 *   POST /api/auth/registrar-preguntas    → Registra respuestas hasheadas (requiere token)
 *   POST /api/auth/verificar-preguntas    → Verifica respuestas → token temporal (público)
 *   POST /api/auth/recuperar-password   → Establece nueva contraseña (token temporal)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db/supabase');
const { JWT_SECRET } = require('../config');
const { verificarToken } = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');

const SALT_ROUNDS = 10;

/**
 * Helper: generar un token temporal (corta duración) para recuperación.
 * Se distingue del token normal porque tiene un purpose explícito.
 */
function generarTokenTemporal(usuarioId, email) {
  return jwt.sign(
    { id: usuarioId, email, purpose: 'recuperar_contraseña' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Verifica si un token JWT tiene el purpose de recuperación de contraseña.
 */
function esTokenRecuperacion(decoded) {
  return decoded.purpose === 'recuperar_contraseña';
}

// ==========================================
// GET /api/auth/preguntas-seguridad
// ==========================================
/**
 * Retorna las preguntas de seguridad activas.
 * Cada objeto: { id, texto_pregunta }.
 */
router.get('/preguntas-seguridad', verificarToken, cacheMiddleware(3600), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('preguntas_seguridad')
      .select('id, texto_pregunta')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) {
      console.error('[AUTH] Error al obtener preguntas:', error.message);
      return res.status(500).json({ error: 'Error al obtener las preguntas de seguridad' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('[AUTH] Error inesperado en preguntas-seguridad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// POST /api/auth/registrar-preguntas
// ==========================================
/**
 * Registra las respuestas de seguridad del usuario (primer login).
 * Body: { respuestas: [{ preguntaId, respuesta }, ...] }
 * Se espera 3 respuestas como mínimo.
 */
router.post('/registrar-preguntas', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { respuestas } = req.body;

    if (!respuestas || !Array.isArray(respuestas) || respuestas.length < 3) {
      return res.status(400).json({ error: 'Debe registrar al menos 3 preguntas de seguridad' });
    }

    // Verificar si ya tiene preguntas registradas
    const { data: existentes } = await supabase
      .from('respuestas_seguridad')
      .select('id')
      .eq('usuario_respuesta', usuarioId);

    if (existentes && existentes.length > 0) {
      return res.status(400).json({ error: 'Ya tiene preguntas de seguridad registradas' });
    }

    // Validar que las preguntas existan y estén activas
    const preguntasIds = respuestas.map((r) => r.preguntaId);
    const { data: preguntasValidas } = await supabase
      .from('preguntas_seguridad')
      .select('id')
      .in('id', preguntasIds)
      .eq('is_active', true);

    if (!preguntasValidas || preguntasValidas.length !== preguntasIds.length) {
      return res.status(400).json({ error: 'Una o más preguntas seleccionadas no son válidas' });
    }

    // Hashear cada respuesta e insertar
    const inserts = [];
    for (const { preguntaId, respuesta } of respuestas) {
      if (!respuesta || typeof respuesta !== 'string' || respuesta.trim().length === 0) {
        return res.status(400).json({ error: 'Todas las respuestas deben ser obligatorias' });
      }

      const respuestaHash = await bcrypt.hash(respuesta.trim().toLowerCase(), SALT_ROUNDS);
      inserts.push({
        usuario_respuesta: usuarioId,
        pregunta_respuesta: Number(preguntaId),
        respuesta_hash: respuestaHash,
      });
    }

    const { error: insertError } = await supabase
      .from('respuestas_seguridad')
      .insert(inserts);

    if (insertError) {
      console.error('[AUTH] Error al registrar preguntas:', insertError.message);
      return res.status(500).json({ error: 'Error al registrar las preguntas de seguridad' });
    }

    res.json({ message: 'Preguntas de seguridad registradas exitosamente' });
  } catch (error) {
    console.error('[AUTH] Error inesperado en registrar-preguntas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// POST /api/auth/verificar-preguntas
// ==========================================
/**
 * Verifica las respuestas del usuario y emite un token temporal
 * para que pueda establecer una nueva contraseña.
 * Body: { email, respuestas: [{ preguntaId, respuesta }, ...] }
 */
router.post('/verificar-preguntas', async (req, res) => {
  try {
    const { email, respuestas } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'El email es obligatorio' });
    }

    // Buscar usuario por email
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email_usuario', email.trim().toLowerCase())
      .eq('is_delete', false)
      .maybeSingle();

    if (userError || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado con ese email' });
    }

    // Obtener las respuestas del usuario desde la BD
    const { data: respuestasGuardadas, error: respError } = await supabase
      .from('respuestas_seguridad')
      .select('pregunta_respuesta, respuesta_hash')
      .eq('usuario_respuesta', usuario.id);

    if (respError || !respuestasGuardadas || respuestasGuardadas.length === 0) {
      return res.status(400).json({ error: 'El usuario no tiene preguntas de seguridad registradas' });
    }

    // Si respuestas está vacío, es una verificación previa (solo confirmar existencia)
    if (!respuestas || !Array.isArray(respuestas) || respuestas.length === 0) {
      const { data: preguntasUsuario } = await supabase
        .from('respuestas_seguridad')
        .select('pregunta_respuesta')
        .eq('usuario_respuesta', usuario.id);

      if (!preguntasUsuario || preguntasUsuario.length === 0) {
        return res.status(400).json({ error: 'El usuario no tiene preguntas de seguridad registradas' });
      }

      const idsRespondidas = preguntasUsuario.map((r) => r.pregunta_respuesta);

      const { data: preguntasDetalle } = await supabase
        .from('preguntas_seguridad')
        .select('id, texto_pregunta')
        .in('id', idsRespondidas);

      // Seleccionar 2 preguntas aleatorias
      const shuffled = (preguntasDetalle || []).sort(() => Math.random() - 0.5);
      const seleccionadas = shuffled.slice(0, 2);

      return res.json({
        message: 'El usuario tiene preguntas registradas',
        tiene_preguntas: true,
        preguntas: seleccionadas,
      });
    }

    if (respuestas.length < 2) {
      return res.status(400).json({ error: 'Debe responder al menos 2 preguntas' });
    }

    // Verificar cada respuesta
    let todasCorrectas = true;
    for (const { preguntaId, respuesta } of respuestas) {
      const guardada = respuestasGuardadas.find(
        (r) => r.pregunta_respuesta === Number(preguntaId)
      );
      if (!guardada) {
        todasCorrectas = false;
        break;
      }
      const coincide = await bcrypt.compare(respuesta.trim().toLowerCase(), guardada.respuesta_hash);
      if (!coincide) {
        todasCorrectas = false;
        break;
      }
    }

    if (!todasCorrectas) {
      return res.status(401).json({ error: 'Una o más respuestas son incorrectas' });
    }

    // Generar token temporal para recuperación de contraseña
    const tokenTemporal = generarTokenTemporal(usuario.id, email.trim().toLowerCase());

    res.json({
      message: 'Verificación exitosa',
      token_temporal: tokenTemporal,
    });
  } catch (error) {
    console.error('[AUTH] Error inesperado en verificar-preguntas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// POST /api/auth/recuperar-contraseña
// ==========================================
/**
 * Establece una nueva contraseña usando el token temporal
 * que se emitió después de verificar las preguntas de seguridad.
 * Headers: Authorization: Bearer <token_temporal>
 * Body: { nueva_contraseña }
 */
router.post('/recuperar-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de recuperación requerido' });
    }

    const token = authHeader.slice(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Token de recuperación inválido o expirado' });
    }

    if (!esTokenRecuperacion(decoded)) {
      return res.status(401).json({ error: 'Token inválido para este propósito' });
    }

    const { nueva_contraseña } = req.body;

    if (!nueva_contraseña || nueva_contraseña.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const usuarioId = decoded.id;

    // Hashear y actualizar contraseña
    const nuevaHash = await bcrypt.hash(nueva_contraseña, SALT_ROUNDS);
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ contraseña_usuario: nuevaHash })
      .eq('id', usuarioId);

    if (updateError) {
      console.error('[AUTH] Error al actualizar contraseña:', updateError.message);
      return res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }

    res.json({ message: 'Contraseña actualizada exitosamente. Ya puede iniciar sesión.' });
  } catch (error) {
    console.error('[AUTH] Error inesperado en recuperar-contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

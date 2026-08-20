/**
 * Rutas para el módulo de Etiquetas de Reportes
 * CRUD de etiquetas (tags) para organizar y filtrar reportes
 *
 * Endpoints:
 *   GET    /api/etiquetas         → Obtener todas las etiquetas
 *   GET    /api/etiquetas/:id     → Obtener una etiqueta por ID
 *   POST   /api/etiquetas         → Crear nueva etiqueta (requiereAdmin)
 *   PUT    /api/etiquetas/:id     → Actualizar etiqueta (requiereAdmin)
 *   DELETE /api/etiquetas/:id     → Eliminar etiqueta (requiereAdmin)
 *
 * Esquema de BD:
 *   - etiquetas_reportes (id, nombre_etiqueta)
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { verificarToken, requiereAdmin } = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Formatea una etiqueta para la respuesta HTTP
 */
function formatearEtiqueta(etiqueta) {
  return {
    id: etiqueta.id,
    nombre: etiqueta.nombre_etiqueta,
  };
}

// ==========================================
// ENDPOINTS
// ==========================================

/**
 * GET /api/etiquetas
 *
 * Obtiene todas las etiquetas.
 * Soporta filtro por nombre via query param ?nombre=...
 */
router.get('/', verificarToken, cacheMiddleware(900), async (req, res) => {
  try {
    const { nombre } = req.query;

    let query = supabase
      .from('etiquetas_reportes')
      .select('id, nombre_etiqueta')
      .order('id', { ascending: true });

    if (nombre && nombre.trim()) {
      query = query.ilike('nombre_etiqueta', `%${nombre.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ETIQUETAS] Error al obtener etiquetas:', error.message);
      return res.status(500).json({ error: 'Error al obtener las etiquetas' });
    }

    res.json((data || []).map(formatearEtiqueta));
  } catch (error) {
    console.error('[ETIQUETAS] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/etiquetas/:id
 *
 * Obtiene una etiqueta por su ID.
 */
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const etiquetaId = Number(req.params.id);

    if (isNaN(etiquetaId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data, error } = await supabase
      .from('etiquetas_reportes')
      .select('id, nombre_etiqueta')
      .eq('id', etiquetaId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    res.json(formatearEtiqueta(data));
  } catch (error) {
    console.error('[ETIQUETAS] Error inesperado en GET /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/etiquetas
 *
 * Crea una nueva etiqueta.
 *
 * Body: { "nombre": "Mantenimiento" }
 */
router.post('/', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    // Verificar que no exista una etiqueta con el mismo nombre
    const { data: existente } = await supabase
      .from('etiquetas_reportes')
      .select('id')
      .ilike('nombre_etiqueta', nombre.trim())
      .maybeSingle();

    if (existente) {
      return res.status(409).json({
        error: `Ya existe una etiqueta con el nombre "${nombre.trim()}"`,
      });
    }

    const { data, error } = await supabase
      .from('etiquetas_reportes')
      .insert({ nombre_etiqueta: nombre.trim() })
      .select('id, nombre_etiqueta')
      .single();

    if (error) {
      console.error('[ETIQUETAS] Error al crear etiqueta:', error.message);
      return res.status(500).json({ error: 'Error al crear la etiqueta' });
    }

    res.status(201).json({
      message: 'Etiqueta creada exitosamente',
      etiqueta: formatearEtiqueta(data),
    });
  } catch (error) {
    console.error('[ETIQUETAS] Error inesperado en POST /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/etiquetas/:id
 *
 * Actualiza una etiqueta existente.
 *
 * Body: { "nombre": "Nuevo nombre" }
 */
router.put('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const etiquetaId = Number(req.params.id);

    if (isNaN(etiquetaId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { nombre } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    // Verificar que la etiqueta exista
    const { data: actual } = await supabase
      .from('etiquetas_reportes')
      .select('id')
      .eq('id', etiquetaId)
      .maybeSingle();

    if (!actual) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    // Verificar nombre duplicado (excluyendo la actual)
    const { data: duplicada } = await supabase
      .from('etiquetas_reportes')
      .select('id')
      .ilike('nombre_etiqueta', nombre.trim())
      .neq('id', etiquetaId)
      .maybeSingle();

    if (duplicada) {
      return res.status(409).json({
        error: `Ya existe otra etiqueta con el nombre "${nombre.trim()}"`,
      });
    }

    const { error } = await supabase
      .from('etiquetas_reportes')
      .update({ nombre_etiqueta: nombre.trim() })
      .eq('id', etiquetaId);

    if (error) {
      console.error('[ETIQUETAS] Error al actualizar:', error.message);
      return res.status(500).json({ error: 'Error al actualizar la etiqueta' });
    }

    // Retornar la etiqueta actualizada
    const { data: etiquetaActualizada } = await supabase
      .from('etiquetas_reportes')
      .select('id, nombre_etiqueta')
      .eq('id', etiquetaId)
      .single();

    res.json({
      message: 'Etiqueta actualizada exitosamente',
      etiqueta: formatearEtiqueta(etiquetaActualizada),
    });
  } catch (error) {
    console.error('[ETIQUETAS] Error inesperado en PUT /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/etiquetas/:id
 *
 * Elimina una etiqueta permanentemente.
 * Se verifica que ningún reporte activo esté usando esta etiqueta.
 */
router.delete('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const etiquetaId = Number(req.params.id);

    if (isNaN(etiquetaId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data: etiqueta } = await supabase
      .from('etiquetas_reportes')
      .select('id, nombre_etiqueta')
      .eq('id', etiquetaId)
      .maybeSingle();

    if (!etiqueta) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    // Verificar si hay reportes activos usando esta etiqueta
    const { count } = await supabase
      .from('reportes')
      .select('id', { count: 'exact', head: true })
      .eq('etiqueta_reporte', etiquetaId)
      .eq('soft_delete_reporte', false);

    if (count && count > 0) {
      return res.status(409).json({
        error: `No se puede eliminar: ${count} reporte(s) están usando esta etiqueta`,
      });
    }

    const { error } = await supabase
      .from('etiquetas_reportes')
      .delete()
      .eq('id', etiquetaId);

    if (error) {
      console.error('[ETIQUETAS] Error al eliminar:', error.message);
      return res.status(500).json({ error: 'Error al eliminar la etiqueta' });
    }

    res.json({
      message: 'Etiqueta eliminada exitosamente',
      etiquetaId: etiqueta.id,
    });
  } catch (error) {
    console.error('[ETIQUETAS] Error inesperado en DELETE /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

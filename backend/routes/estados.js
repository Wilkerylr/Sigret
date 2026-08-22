/**
 * Rutas para el módulo de Estados de Equipos
 * CRUD de estados de equipos (operativo, inoperativo, etc.)
 *
 * Endpoints:
 *   POST   /api/estados-equipos            → Crear estado (requiereAdmin)
 *   GET    /api/estados-equipos            → Obtener todos los estados
 *   GET    /api/estados-equipos/:id        → Obtener estado por ID
 *   PUT    /api/estados-equipos/:id        → Actualizar estado (requiereAdmin)
 *   DELETE /api/estados-equipos/:id        → Eliminar estado (requiereAdmin)
 *
 * Esquema de BD:
 *   - estados_equipos (id, nombre)
 *   - Referenciado por: reportes.estado_reporte, plantillas_reportes.estado_plantilla
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { verificarToken, requiereAdmin } = require('../middlewares/auth');


function formatearEstado(estado) {
  return {
    id: estado.id,
    nombre: estado.nombre,
  };
}

/**
 * GET /api/estados-equipos
 *
 * Obtiene todos los estados de equipos.
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('estados_equipos')
      .select('id, nombre')
      .order('id', { ascending: true });

    if (error) {
      console.error('[ESTADOS] Error al obtener estados:', error.message);
      return res.status(500).json({ error: 'Error al obtener los estados de equipo' });
    }

    res.json((data || []).map(formatearEstado));
  } catch (error) {
    console.error('[ESTADOS] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/estados-equipos/:id
 *
 * Obtiene un estado por su ID.
 */
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const estadoId = Number(req.params.id);

    if (isNaN(estadoId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data, error } = await supabase
      .from('estados_equipos')
      .select('id, nombre')
      .eq('id', estadoId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }

    res.json(formatearEstado(data));
  } catch (error) {
    console.error('[ESTADOS] Error inesperado en GET /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/estados-equipos
 *
 * Crea un nuevo estado de equipo.
 * Body: { "nombre": "Operativo" }
 */
router.post('/', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    const nombreLimpio = nombre.trim();

    const { data: existente } = await supabase
      .from('estados_equipos')
      .select('id')
      .ilike('nombre', nombreLimpio)
      .maybeSingle();

    if (existente) {
      return res.status(409).json({
        error: `Ya existe un estado con el nombre "${nombreLimpio}"`,
      });
    }

    const { data, error } = await supabase
      .from('estados_equipos')
      .insert({ nombre: nombreLimpio })
      .select('id, nombre')
      .single();

    if (error) {
      console.error('[ESTADOS] Error al crear estado:', error.message);
      return res.status(500).json({ error: 'Error al crear el estado' });
    }

    res.status(201).json({
      message: 'Estado creado exitosamente',
      estado: formatearEstado(data),
    });
  } catch (error) {
    console.error('[ESTADOS] Error inesperado en POST /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/estados-equipos/:id
 *
 * Actualiza un estado existente.
 */
router.put('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const estadoId = Number(req.params.id);

    if (isNaN(estadoId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { nombre } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    const { data: actual } = await supabase
      .from('estados_equipos')
      .select('id')
      .eq('id', estadoId)
      .maybeSingle();

    if (!actual) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }

    const nombreLimpio = nombre.trim();

    const { data: duplicado } = await supabase
      .from('estados_equipos')
      .select('id')
      .ilike('nombre', nombreLimpio)
      .neq('id', estadoId)
      .maybeSingle();

    if (duplicado) {
      return res.status(409).json({
        error: `Ya existe otro estado con el nombre "${nombreLimpio}"`,
      });
    }

    const { error } = await supabase
      .from('estados_equipos')
      .update({ nombre: nombreLimpio })
      .eq('id', estadoId);

    if (error) {
      console.error('[ESTADOS] Error al actualizar:', error.message);
      return res.status(500).json({ error: 'Error al actualizar el estado' });
    }

    const { data: actualizado } = await supabase
      .from('estados_equipos')
      .select('id, nombre')
      .eq('id', estadoId)
      .single();

    res.json({
      message: 'Estado actualizado exitosamente',
      estado: formatearEstado(actualizado),
    });
  } catch (error) {
    console.error('[ESTADOS] Error inesperado en PUT /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/estados-equipos/:id
 *
 * Elimina un estado. Se bloquea si está en uso por reportes o plantillas.
 */
router.delete('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const estadoId = Number(req.params.id);

    if (isNaN(estadoId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data: estado } = await supabase
      .from('estados_equipos')
      .select('id, nombre')
      .eq('id', estadoId)
      .maybeSingle();

    if (!estado) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }

    // Verificar que no esté en uso por reportes
    const { data: reporteEnUso } = await supabase
      .from('reportes')
      .select('id')
      .eq('estado_reporte', estadoId)
      .eq('soft_delete_reporte', false)
      .limit(1)
      .maybeSingle();

    if (reporteEnUso) {
      return res.status(409).json({
        error: 'No se puede eliminar el estado: está asignado a uno o más reportes',
      });
    }

    // Verificar que no esté en uso por plantillas
    const { data: plantillaEnUso } = await supabase
      .from('plantillas_reportes')
      .select('id')
      .eq('estado_plantilla', estadoId)
      .limit(1)
      .maybeSingle();

    if (plantillaEnUso) {
      return res.status(409).json({
        error: 'No se puede eliminar el estado: está asignado a una o más plantillas',
      });
    }

    const { error } = await supabase
      .from('estados_equipos')
      .delete()
      .eq('id', estadoId);

    if (error) {
      console.error('[ESTADOS] Error al eliminar:', error.message);
      return res.status(500).json({ error: 'Error al eliminar el estado' });
    }

    res.json({
      message: 'Estado eliminado exitosamente',
      estadoId: estado.id,
    });
  } catch (error) {
    console.error('[ESTADOS] Error inesperado en DELETE /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

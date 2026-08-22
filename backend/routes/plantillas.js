/**
 * Rutas para el módulo de Plantillas de Reportes
 * CRUD de plantillas predefinidas para reportes
 *
 * Endpoints:
 *   POST   /api/plantillas         → Crear nueva plantilla (requiereAdmin)
 *   GET    /api/plantillas         → Obtener todas las plantillas
 *   GET    /api/plantillas/:id     → Obtener plantilla por ID
 *   PUT    /api/plantillas/:id     → Actualizar plantilla (requiereAdmin)
 *   DELETE /api/plantillas/:id     → Eliminar plantilla (requiereAdmin)
 *
 * Esquema de BD:
 *   - plantillas_reportes (id, nombre_plantilla, descripcion_plantilla,
 *       equipo_plantilla, descripcion_falla_plantilla, trabajo_plantilla,
 *       estado_plantilla FK→estados_equipos, etiqueta_plantilla FK→etiquetas_reportes)
 *   - estados_equipos (id, nombre)
 *   - etiquetas_reportes (id, nombre_etiqueta)
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { verificarToken, requiereAdmin } = require('../middlewares/auth');


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Inserta una plantilla dejando que la BD asigne el id (autoincremental).
 * Si la tabla aún no tiene secuencia, calcula max+1 como respaldo.
 */
async function insertarPlantilla(data) {
  const select = `
    id,
    nombre_plantilla,
    descripcion_plantilla,
    equipo_plantilla,
    descripcion_falla_plantilla,
    trabajo_plantilla,
    estados_equipos ( id, nombre ),
    etiquetas_reportes ( id, nombre_etiqueta )
  `;

  const { data: resultado, error } = await supabase
    .from('plantillas_reportes')
    .insert(data)
    .select(select)
    .single();

  if (!error) {
    return { data: resultado };
  }

  // Si la columna id no es autoincremental, calcular max+1
  if (error.code === '23502' || /null value in column "id"/.test(error.message || '')) {
    const { data: maxId } = await supabase
      .from('plantillas_reportes')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: resultado2, error: error2 } = await supabase
      .from('plantillas_reportes')
      .insert({ ...data, id: (maxId?.id || 0) + 1 })
      .select(select)
      .single();

    return { data: resultado2, error: error2 };
  }

  return { error };
}

/**
 * Formatea una plantilla para la respuesta HTTP
 */
function formatearPlantilla(plantilla) {
  return {
    id: plantilla.id,
    nombre: plantilla.nombre_plantilla,
    descripcion: plantilla.descripcion_plantilla || null,
    equipo: plantilla.equipo_plantilla || null,
    descripcionFalla: plantilla.descripcion_falla_plantilla || null,
    trabajoRealizado: plantilla.trabajo_plantilla || null,
    estado: plantilla.estados_equipos
      ? { id: plantilla.estados_equipos.id, nombre: plantilla.estados_equipos.nombre }
      : null,
    etiqueta: plantilla.etiquetas_reportes
      ? { id: plantilla.etiquetas_reportes.id, nombre: plantilla.etiquetas_reportes.nombre_etiqueta }
      : null,
  };
}

// ==========================================
// ENDPOINTS
// ==========================================

/**
 * GET /api/plantillas
 *
 * Obtiene todas las plantillas.
 * Soporta filtros: ?nombre=...&descripcion=...
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.query;

    let query = supabase
      .from('plantillas_reportes')
      .select(`
        id,
        nombre_plantilla,
        descripcion_plantilla,
        equipo_plantilla,
        descripcion_falla_plantilla,
        trabajo_plantilla,
        estados_equipos ( id, nombre ),
        etiquetas_reportes ( id, nombre_etiqueta )
      `)
      .order('id', { ascending: true });

    if (nombre && nombre.trim()) {
      query = query.ilike('nombre_plantilla', `%${nombre.trim()}%`);
    }
    if (descripcion && descripcion.trim()) {
      query = query.ilike('descripcion_plantilla', `%${descripcion.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[PLANTILLAS] Error al obtener plantillas:', error.message);
      return res.status(500).json({ error: 'Error al obtener las plantillas' });
    }

    res.json((data || []).map(formatearPlantilla));
  } catch (error) {
    console.error('[PLANTILLAS] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/plantillas/:id
 *
 * Obtiene una plantilla por su ID.
 */
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const plantillaId = Number(req.params.id);

    if (isNaN(plantillaId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data, error } = await supabase
      .from('plantillas_reportes')
      .select(`
        id,
        nombre_plantilla,
        descripcion_plantilla,
        equipo_plantilla,
        descripcion_falla_plantilla,
        trabajo_plantilla,
        estados_equipos ( id, nombre ),
        etiquetas_reportes ( id, nombre_etiqueta )
      `)
      .eq('id', plantillaId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    res.json(formatearPlantilla(data));
  } catch (error) {
    console.error('[PLANTILLAS] Error inesperado en GET /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/plantillas
 *
 * Crea una nueva plantilla.
 *
 * Body: {
 *   "nombre": "Mantenimiento",
 *   "descripcion": "Reporte de mantenimiento preventivo",
 *   "equipo": "PC",
 *   "descripcionFalla": "Mantenimiento general",
 *   "trabajoRealizado": "Se realizó mantenimiento",
 *   "estadoId": 1,
 *   "etiquetaId": 1
 * }
 */
router.post('/', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      equipo,
      descripcionFalla,
      trabajoRealizado,
      estadoId,
      etiquetaId,
    } = req.body;

    // Validaciones
    const errores = [];

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      errores.push('El campo "nombre" es obligatorio');
    }
    if (!estadoId || isNaN(Number(estadoId))) {
      errores.push('El campo "estadoId" es obligatorio y debe ser un número');
    }
    if (!etiquetaId || isNaN(Number(etiquetaId))) {
      errores.push('El campo "etiquetaId" es obligatorio y debe ser un número');
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Error de validación', detalles: errores });
    }

    // Verificar que el estado exista
    const { data: estado } = await supabase
      .from('estados_equipos')
      .select('id')
      .eq('id', Number(estadoId))
      .maybeSingle();

    if (!estado) {
      return res.status(400).json({ error: 'El estado especificado no existe' });
    }

    // Verificar que la etiqueta exista
    const { data: etiqueta } = await supabase
      .from('etiquetas_reportes')
      .select('id')
      .eq('id', Number(etiquetaId))
      .maybeSingle();

    if (!etiqueta) {
      return res.status(400).json({ error: 'La etiqueta especificada no existe' });
    }

    // Insertar con id autoincremental (respaldo max+1 si la tabla no tiene secuencia)
    const { data, error } = await insertarPlantilla({
      nombre_plantilla: nombre.trim(),
      descripcion_plantilla: descripcion?.trim() || '',
      equipo_plantilla: equipo?.trim() || '',
      descripcion_falla_plantilla: descripcionFalla?.trim() || '',
      trabajo_plantilla: trabajoRealizado?.trim() || '',
      estado_plantilla: Number(estadoId),
      etiqueta_plantilla: Number(etiquetaId),
    });

    if (error) {
      console.error('[PLANTILLAS] Error al crear plantilla:', error.message);
      return res.status(500).json({ error: 'Error al crear la plantilla' });
    }

    res.status(201).json({
      message: 'Plantilla creada exitosamente',
      plantilla: formatearPlantilla(data),
    });
  } catch (error) {
    console.error('[PLANTILLAS] Error inesperado en POST /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/plantillas/:id
 *
 * Actualiza una plantilla existente.
 */
router.put('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const plantillaId = Number(req.params.id);

    if (isNaN(plantillaId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const {
      nombre,
      descripcion,
      equipo,
      descripcionFalla,
      trabajoRealizado,
      estadoId,
      etiquetaId,
    } = req.body;

    // Verificar que la plantilla exista
    const { data: actual } = await supabase
      .from('plantillas_reportes')
      .select('id')
      .eq('id', plantillaId)
      .maybeSingle();

    if (!actual) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    // Validar estado si se proporciona
    if (estadoId) {
      const { data: estado } = await supabase
        .from('estados_equipos')
        .select('id')
        .eq('id', Number(estadoId))
        .maybeSingle();
      if (!estado) {
        return res.status(400).json({ error: 'El estado especificado no existe' });
      }
    }

    // Validar etiqueta si se proporciona
    if (etiquetaId) {
      const { data: etiqueta } = await supabase
        .from('etiquetas_reportes')
        .select('id')
        .eq('id', Number(etiquetaId))
        .maybeSingle();
      if (!etiqueta) {
        return res.status(400).json({ error: 'La etiqueta especificada no existe' });
      }
    }

    // Construir objeto de actualización
    const updateData = {};
    if (nombre !== undefined) updateData.nombre_plantilla = nombre.trim();
    if (descripcion !== undefined) updateData.descripcion_plantilla = descripcion?.trim() || '';
    if (equipo !== undefined) updateData.equipo_plantilla = equipo?.trim() || '';
    if (descripcionFalla !== undefined) updateData.descripcion_falla_plantilla = descripcionFalla?.trim() || '';
    if (trabajoRealizado !== undefined) updateData.trabajo_plantilla = trabajoRealizado?.trim() || '';
    if (estadoId !== undefined) updateData.estado_plantilla = Number(estadoId);
    if (etiquetaId !== undefined) updateData.etiqueta_plantilla = Number(etiquetaId);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    const { error } = await supabase
      .from('plantillas_reportes')
      .update(updateData)
      .eq('id', plantillaId);

    if (error) {
      console.error('[PLANTILLAS] Error al actualizar:', error.message);
      return res.status(500).json({ error: 'Error al actualizar la plantilla' });
    }

    // Retornar plantilla actualizada
    const { data: plantillaActualizada } = await supabase
      .from('plantillas_reportes')
      .select(`
        id,
        nombre_plantilla,
        descripcion_plantilla,
        equipo_plantilla,
        descripcion_falla_plantilla,
        trabajo_plantilla,
        estados_equipos ( id, nombre ),
        etiquetas_reportes ( id, nombre_etiqueta )
      `)
      .eq('id', plantillaId)
      .single();

    res.json({
      message: 'Plantilla actualizada exitosamente',
      plantilla: formatearPlantilla(plantillaActualizada),
    });
  } catch (error) {
    console.error('[PLANTILLAS] Error inesperado en PUT /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/plantillas/:id
 *
 * Elimina una plantilla permanentemente.
 */
router.delete('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const plantillaId = Number(req.params.id);

    if (isNaN(plantillaId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data: plantilla } = await supabase
      .from('plantillas_reportes')
      .select('id')
      .eq('id', plantillaId)
      .maybeSingle();

    if (!plantilla) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    const { error } = await supabase
      .from('plantillas_reportes')
      .delete()
      .eq('id', plantillaId);

    if (error) {
      console.error('[PLANTILLAS] Error al eliminar:', error.message);
      return res.status(500).json({ error: 'Error al eliminar la plantilla' });
    }

    res.json({
      message: 'Plantilla eliminada exitosamente',
      plantillaId: plantilla.id,
    });
  } catch (error) {
    console.error('[PLANTILLAS] Error inesperado en DELETE /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

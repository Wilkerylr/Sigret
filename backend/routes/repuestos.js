const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { verificarToken, requiereAdmin } = require('../middlewares/auth');


function formatearRepuesto(repuesto) {
  return {
    id: repuesto.id,
    nombre: repuesto.nombre_repuesto,
    activo: !repuesto.is_delete,
  };
}

router.get('/', verificarToken, async (req, res) => {
  try {
    const { nombre, activos } = req.query;

    let query = supabase
      .from('repuestos')
      .select('id, nombre_repuesto, is_delete')
      .order('id', { ascending: true });

    if (activos === 'true') {
      query = query.eq('is_delete', false);
    }

    if (nombre && nombre.trim()) {
      query = query.ilike('nombre_repuesto', `%${nombre.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[REPUESTOS] Error al obtener repuestos:', error.message);
      return res.status(500).json({ error: 'Error al obtener los repuestos' });
    }

    res.json((data || []).map(formatearRepuesto));
  } catch (error) {
    console.error('[REPUESTOS] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', verificarToken, async (req, res) => {
  try {
    const repuestoId = Number(req.params.id);

    if (isNaN(repuestoId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data, error } = await supabase
      .from('repuestos')
      .select('id, nombre_repuesto, is_delete')
      .eq('id', repuestoId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Repuesto no encontrado' });
    }

    res.json(formatearRepuesto(data));
  } catch (error) {
    console.error('[REPUESTOS] Error inesperado en GET /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    const nombreLimpio = nombre.trim();

    const { data: existente } = await supabase
      .from('repuestos')
      .select('id')
      .ilike('nombre_repuesto', nombreLimpio)
      .maybeSingle();

    if (existente) {
      return res.status(409).json({
        error: `Ya existe un repuesto con el nombre "${nombreLimpio}"`,
      });
    }

    const { data, error } = await supabase
      .from('repuestos')
      .insert({ nombre_repuesto: nombreLimpio })
      .select('id, nombre_repuesto, is_delete')
      .single();

    if (error) {
      console.error('[REPUESTOS] Error al crear repuesto:', error.message);
      return res.status(500).json({ error: 'Error al crear el repuesto' });
    }

    res.status(201).json({
      message: 'Repuesto creado exitosamente',
      repuesto: formatearRepuesto(data),
    });
  } catch (error) {
    console.error('[REPUESTOS] Error inesperado en POST /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const repuestoId = Number(req.params.id);

    if (isNaN(repuestoId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { nombre } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    const { data: actual } = await supabase
      .from('repuestos')
      .select('id')
      .eq('id', repuestoId)
      .maybeSingle();

    if (!actual) {
      return res.status(404).json({ error: 'Repuesto no encontrado' });
    }

    const nombreLimpio = nombre.trim();
    const { data: duplicado } = await supabase
      .from('repuestos')
      .select('id')
      .ilike('nombre_repuesto', nombreLimpio)
      .neq('id', repuestoId)
      .maybeSingle();

    if (duplicado) {
      return res.status(409).json({
        error: `Ya existe otro repuesto con el nombre "${nombreLimpio}"`,
      });
    }

    const { error } = await supabase
      .from('repuestos')
      .update({ nombre_repuesto: nombreLimpio })
      .eq('id', repuestoId);

    if (error) {
      console.error('[REPUESTOS] Error al actualizar:', error.message);
      return res.status(500).json({ error: 'Error al actualizar el repuesto' });
    }

    const { data: actualizado } = await supabase
      .from('repuestos')
      .select('id, nombre_repuesto, is_delete')
      .eq('id', repuestoId)
      .single();

    res.json({
      message: 'Repuesto actualizado exitosamente',
      repuesto: formatearRepuesto(actualizado),
    });
  } catch (error) {
    console.error('[REPUESTOS] Error inesperado en PUT /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const repuestoId = Number(req.params.id);

    if (isNaN(repuestoId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data: repuesto } = await supabase
      .from('repuestos')
      .select('id, nombre_repuesto')
      .eq('id', repuestoId)
      .eq('is_delete', false)
      .maybeSingle();

    if (!repuesto) {
      return res.status(404).json({ error: 'Repuesto no encontrado o ya está inactivo' });
    }

    const { error } = await supabase
      .from('repuestos')
      .update({ is_delete: true })
      .eq('id', repuestoId)
      .eq('is_delete', false);

    if (error) {
      console.error('[REPUESTOS] Error al eliminar:', error.message);
      return res.status(500).json({ error: 'Error al eliminar el repuesto' });
    }

    res.json({
      message: 'Repuesto eliminado exitosamente',
      repuestoId: repuesto.id,
    });
  } catch (error) {
    console.error('[REPUESTOS] Error inesperado en DELETE /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

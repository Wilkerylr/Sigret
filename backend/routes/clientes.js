/**
 * Rutas para el módulo de Clientes
 * CRUD de clientes del sistema
 *
 * Endpoints:
 *   POST   /api/clientes              → Crear nuevo cliente (requiereAdmin)
 *   GET    /api/clientes              → Obtener todos los clientes (?activos=true para solo activos)
 *   GET    /api/clientes/:id          → Obtener cliente por ID
 *   PUT    /api/clientes/:id          → Actualizar cliente (requiereAdmin)
 *   DELETE /api/clientes/:id          → Desactivar cliente (requiereAdmin)
 *   PATCH  /api/clientes/:id/restaurar → Reactivar cliente (requiereAdmin)
 *
 * Esquema de BD:
 *   - clientes (id, nombre_cliente, direccion_cliente, rif_cliente,
 *               telefono_cliente, email_cliente, is_delete)
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { verificarToken, requiereAdmin } = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');
const { nombreCompletoUsuario } = require('../utils/usuario');

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Inserta una fila dejando que la BD asigne el id (autoincremental).
 * Si la tabla aún no tiene secuencia, calcula max+1 como respaldo.
 */
async function insertarCliente(data) {
  const select = 'id, nombre_cliente, direccion_cliente, rif_cliente, telefono_cliente, email_cliente';

  const { data: resultado, error } = await supabase
    .from('clientes')
    .insert(data)
    .select(select)
    .single();

  if (!error) {
    return { data: resultado };
  }

  // Si la columna id no es autoincremental, calcular max+1
  if (error.code === '23502' || /null value in column "id"/.test(error.message || '')) {
    const { data: maxId } = await supabase
      .from('clientes')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: resultado2, error: error2 } = await supabase
      .from('clientes')
      .insert({ ...data, id: (maxId?.id || 0) + 1 })
      .select(select)
      .single();

    return { data: resultado2, error: error2 };
  }

  return { error };
}

/**
 * Formatea un cliente para la respuesta HTTP
 */
function formatearCliente(cliente) {
  return {
    id: cliente.id,
    nombre: cliente.nombre_cliente,
    rif: cliente.rif_cliente || null,
    telefono: cliente.telefono_cliente ? String(cliente.telefono_cliente) : null,
    direccion: cliente.direccion_cliente || null,
    email: cliente.email_cliente || null,
    activo: !cliente.is_delete,
  };
}

// ==========================================
// ENDPOINTS
// ==========================================

/**
 * GET /api/clientes
 *
 * Obtiene todos los clientes (activos e inactivos).
 * Si se pasa ?activos=true, solo devuelve los activos.
 * Soporta filtros via query params: ?nombre=...&rif=...&telefono=...
 */
router.get('/', verificarToken, cacheMiddleware(900), async (req, res) => {
  try {
    const { nombre, rif, telefono, activos } = req.query;

    let query = supabase
      .from('clientes')
      .select('id, nombre_cliente, direccion_cliente, rif_cliente, telefono_cliente, email_cliente, is_delete')
      .order('id', { ascending: true });

    if (activos === 'true') {
      query = query.eq('is_delete', false);
    }

    if (nombre && nombre.trim()) {
      query = query.ilike('nombre_cliente', `%${nombre.trim()}%`);
    }
    if (rif && rif.trim()) {
      query = query.ilike('rif_cliente', `%${rif.trim()}%`);
    }
    if (telefono && telefono.trim()) {
      query = query.ilike('telefono_cliente::text', `%${telefono.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[CLIENTES] Error al obtener clientes:', error.message);
      return res.status(500).json({ error: 'Error al obtener los clientes' });
    }

    res.json((data || []).map(formatearCliente));
  } catch (error) {
    console.error('[CLIENTES] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/clientes/:id
 *
 * Obtiene un cliente por su ID.
 */
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const clienteId = Number(req.params.id);

    if (isNaN(clienteId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('id, nombre_cliente, direccion_cliente, rif_cliente, telefono_cliente, email_cliente, is_delete')
      .eq('id', clienteId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(formatearCliente(data));
  } catch (error) {
    console.error('[CLIENTES] Error inesperado en GET /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/clientes
 *
 * Crea un nuevo cliente.
 *
 * Body: {
 *   "nombre": "Admin 951",
 *   "rif": "J-12345678-1",
 *   "telefono": "+58 412-1111111",
 *   "direccion": "Calle Principal",
 *   "email": "admin@ejemplo.com"
 * }
 */
router.post('/', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const { nombre, rif, telefono, direccion, email } = req.body;

    // Validaciones
    const errores = [];

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      errores.push('El campo "nombre" es obligatorio');
    }
    if (email && (typeof email !== 'string' || !email.includes('@'))) {
      errores.push('El campo "email" debe ser un correo electrónico válido');
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Error de validación', detalles: errores });
    }

    const nombreLimpio = nombre.trim();

    // Verificar que no exista un cliente con el mismo nombre
    const { data: existenteNombre } = await supabase
      .from('clientes')
      .select('id')
      .ilike('nombre_cliente', nombreLimpio)
      .maybeSingle();

    if (existenteNombre) {
      return res.status(409).json({
        error: `Ya existe un cliente con el nombre "${nombreLimpio}"`,
      });
    }

    // Verificar que no exista un cliente con el mismo RIF
    if (rif && String(rif).trim()) {
      const rifLimpio = String(rif).trim().toUpperCase();
      const { data: existenteRif } = await supabase
        .from('clientes')
        .select('id')
        .ilike('rif_cliente', rifLimpio)
        .maybeSingle();

      if (existenteRif) {
        return res.status(409).json({
          error: `Ya existe un cliente con el RIF "${rifLimpio}"`,
        });
      }
    }

    // Insertar con id autoincremental (respaldo max+1 si la tabla no tiene secuencia)
    const { data, error } = await insertarCliente({
      nombre_cliente: nombre.trim(),
      rif_cliente: rif?.trim() || '',
      telefono_cliente: telefono ? Number(String(telefono).replace(/[^0-9]/g, '')) : null,
      direccion_cliente: direccion?.trim() || '',
      email_cliente: email?.trim() || '',
    });

    if (error) {
      console.error('[CLIENTES] Error al crear cliente:', error.message);
      return res.status(500).json({ error: 'Error al crear el cliente' });
    }

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      cliente: formatearCliente(data),
    });
  } catch (error) {
    console.error('[CLIENTES] Error inesperado en POST /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/clientes/:id
 *
 * Actualiza un cliente existente.
 */
router.put('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const clienteId = Number(req.params.id);

    if (isNaN(clienteId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { nombre, rif, telefono, direccion, email } = req.body;

    // Verificar que el cliente exista
    const { data: actual } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', clienteId)
      .maybeSingle();

    if (!actual) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Validar email si se proporciona
    if (email && (typeof email !== 'string' || !email.includes('@'))) {
      return res.status(400).json({ error: 'El campo "email" debe ser un correo electrónico válido' });
    }

    // Verificar nombre duplicado (excluyendo el actual)
    if (nombre !== undefined && String(nombre).trim()) {
      const nombreLimpio = String(nombre).trim();
      const { data: existenteNombre } = await supabase
        .from('clientes')
        .select('id')
        .ilike('nombre_cliente', nombreLimpio)
        .neq('id', clienteId)
        .maybeSingle();

      if (existenteNombre) {
        return res.status(409).json({
          error: `Ya existe otro cliente con el nombre "${nombreLimpio}"`,
        });
      }
    }

    // Verificar RIF duplicado (excluyendo el actual)
    if (rif !== undefined && String(rif).trim()) {
      const rifLimpio = String(rif).trim().toUpperCase();
      const { data: existenteRif } = await supabase
        .from('clientes')
        .select('id')
        .ilike('rif_cliente', rifLimpio)
        .neq('id', clienteId)
        .maybeSingle();

      if (existenteRif) {
        return res.status(409).json({
          error: `Ya existe otro cliente con el RIF "${rifLimpio}"`,
        });
      }
    }

    // Construir objeto de actualización
    const updateData = {};
    if (nombre !== undefined) updateData.nombre_cliente = nombre.trim();
    if (rif !== undefined) updateData.rif_cliente = rif?.trim() || '';
    if (telefono !== undefined) {
      updateData.telefono_cliente = telefono ? Number(String(telefono).replace(/[^0-9]/g, '')) : null;
    }
    if (direccion !== undefined) updateData.direccion_cliente = direccion?.trim() || '';
    if (email !== undefined) updateData.email_cliente = email?.trim() || '';

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    const { error } = await supabase
      .from('clientes')
      .update(updateData)
      .eq('id', clienteId);

    if (error) {
      console.error('[CLIENTES] Error al actualizar:', error.message);
      return res.status(500).json({ error: 'Error al actualizar el cliente' });
    }

    // Retornar cliente actualizado
    const { data: clienteActualizado } = await supabase
      .from('clientes')
      .select('id, nombre_cliente, direccion_cliente, rif_cliente, telefono_cliente, email_cliente')
      .eq('id', clienteId)
      .single();

    res.json({
      message: 'Cliente actualizado exitosamente',
      cliente: formatearCliente(clienteActualizado),
    });
  } catch (error) {
    console.error('[CLIENTES] Error inesperado en PUT /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/clientes/inactivos-sin-reportes
 *
 * Elimina físicamente todos los clientes inactivos (is_delete = true)
 * que NO tengan registros en la tabla reportes.
 * Solo accessible por administradores.
 */
router.delete('/inactivos-sin-reportes', verificarToken, requiereAdmin, async (req, res) => {
  try {
    // 1. Obtener IDs de clientes que tienen al menos un reporte
    const { data: clientesConReportes } = await supabase
      .from('reportes')
      .select('cliente_reporte');

    const idsConReportes = new Set(
      (clientesConReportes || [])
        .map(r => r.cliente_reporte)
        .filter(id => id != null)
    );

    // 2. Obtener clientes inactivos
    const { data: clientesInactivos, error: fetchError } = await supabase
      .from('clientes')
      .select('id, nombre_cliente, rif_cliente')
      .eq('is_delete', true);

    if (fetchError) {
      console.error('[CLIENTES] Error al obtener inactivos:', fetchError.message);
      return res.status(500).json({ error: 'Error al obtener clientes inactivos' });
    }

    // 3. Filtrar solo los que NO tienen reportes
    const aEliminar = (clientesInactivos || []).filter(c => !idsConReportes.has(c.id));

    if (aEliminar.length === 0) {
      return res.json({
        message: 'No hay clientes inactivos sin reportes para eliminar',
        eliminados: 0,
        nombres: [],
      });
    }

    // 4. Eliminar físicamente
    const idsEliminar = aEliminar.map(c => c.id);
    const { error: deleteError } = await supabase
      .from('clientes')
      .delete()
      .in('id', idsEliminar);

    if (deleteError) {
      console.error('[CLIENTES] Error al eliminar inactivos:', deleteError.message);
      return res.status(500).json({ error: 'Error al eliminar clientes inactivos' });
    }

    // 5. Registrar en auditoría
    const nombreUsuario = await nombreCompletoUsuario(req);
    const nombres = aEliminar.map(c => c.nombre_cliente).join(', ');
    await supabase
      .from('modificaciones_reportes')
      .insert({
        reporte_modificado: null,
        usuario_modificacion: req.usuario.id,
        descripcion_modificacion: `Eliminación masiva de ${aEliminar.length} cliente(s) inactivo(s) sin reportes: [${nombres}] por el usuario ${nombreUsuario}`,
        fecha_modificacion: new Date().toISOString().split('T')[0],
      });

    res.json({
      message: `${aEliminar.length} cliente(s) inactivo(s) sin reportes eliminado(s) exitosamente`,
      eliminados: aEliminar.length,
      nombres: aEliminar.map(c => c.nombre_cliente),
    });
  } catch (error) {
    console.error('[CLIENTES] Error inesperado en DELETE /inactivos-sin-reportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/clientes/:id
 *
 * Desactiva un cliente (soft delete, is_delete = true).
 * El cliente deja de aparecer en sugerencias de reportes pero sigue visible en la lista.
 */
router.delete('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const clienteId = Number(req.params.id);

    if (isNaN(clienteId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    // Verificar que el cliente exista y esté activo
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id, nombre_cliente, rif_cliente')
      .eq('id', clienteId)
      .eq('is_delete', false)
      .maybeSingle();

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado o ya está inactivo' });
    }

    const { error } = await supabase
      .from('clientes')
      .update({ is_delete: true })
      .eq('id', clienteId)
      .eq('is_delete', false);

    if (error) {
      console.error('[CLIENTES] Error al desactivar:', error.message);
      return res.status(500).json({ error: 'Error al desactivar el cliente' });
    }

    // Registrar en historial de auditoría
    const nombreUsuario = await nombreCompletoUsuario(req);
    const descripcion = `Desactivación del cliente "${cliente.nombre_cliente}" (RIF: ${cliente.rif_cliente || 'N/A'}) por el usuario ${nombreUsuario}`;
    await supabase
      .from('modificaciones_reportes')
      .insert({
        reporte_modificado: null,
        usuario_modificacion: req.usuario.id,
        descripcion_modificacion: descripcion,
        fecha_modificacion: new Date().toISOString().split('T')[0],
      });

    res.json({
      message: 'Cliente desactivado exitosamente',
      clienteId: cliente.id,
    });
  } catch (error) {
    console.error('[CLIENTES] Error inesperado en DELETE /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PATCH /api/clientes/:id/restaurar
 *
 * Reactiva un cliente desactivado (is_delete = false).
 */
router.patch('/:id/restaurar', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const clienteId = Number(req.params.id);

    if (isNaN(clienteId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data: cliente } = await supabase
      .from('clientes')
      .select('id, nombre_cliente, rif_cliente')
      .eq('id', clienteId)
      .eq('is_delete', true)
      .maybeSingle();

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado o no está inactivo' });
    }

    const { error } = await supabase
      .from('clientes')
      .update({ is_delete: false })
      .eq('id', clienteId)
      .eq('is_delete', true);

    if (error) {
      console.error('[CLIENTES] Error al reactivar:', error.message);
      return res.status(500).json({ error: 'Error al reactivar el cliente' });
    }

    const nombreUsuario = await nombreCompletoUsuario(req);
    const descripcion = `Reactivación del cliente "${cliente.nombre_cliente}" (RIF: ${cliente.rif_cliente || 'N/A'}) por el usuario ${nombreUsuario}`;
    await supabase
      .from('modificaciones_reportes')
      .insert({
        reporte_modificado: null,
        usuario_modificacion: req.usuario.id,
        descripcion_modificacion: descripcion,
        fecha_modificacion: new Date().toISOString().split('T')[0],
      });

    res.json({
      message: 'Cliente reactivado exitosamente',
      clienteId: cliente.id,
    });
  } catch (error) {
    console.error('[CLIENTES] Error inesperado en PATCH /:id/restaurar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

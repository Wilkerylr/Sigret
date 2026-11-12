/**
 * Pruebas mínimas de API.
 *
 * - Guards de autenticación/autorización (no requieren base de datos).
 * - Login (validación de entrada).
 * - CRUD de reportes y persistencia de la cantidad de repuestos
 *   (solo si hay credenciales reales de Supabase).
 *
 * Ejecutar con: npm test
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { iniciarServidor } = require('./helpers');

const PUERTO = Number(process.env.TEST_PORT || 3101);
const SECRETO = process.env.JWT_SECRET || 'secreto-de-prueba-con-mas-de-16-caracteres';
const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const CON_BD = Boolean(URL_SUPABASE && !URL_SUPABASE.includes('example.supabase.co'));

let servidor;

function token(usuario) {
  return jwt.sign(usuario, SECRETO, { expiresIn: '1h' });
}

const tokenAdmin = () => token({ id: 1, rol_id: 1, permisos: [] });
const tokenTecnico = () => token({ id: 2, rol_id: 2, permisos: [] });

async function req(path, { token: bearer, method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  const res = await fetch(`${servidor.base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const texto = await res.text();
  let data = null;
  try {
    data = texto ? JSON.parse(texto) : null;
  } catch {
    data = texto;
  }
  return { status: res.status, data };
}

before(async () => {
  servidor = await iniciarServidor(PUERTO, { JWT_SECRET: SECRETO });
});

after(async () => {
  if (servidor) await servidor.detener();
});

// ─── Guards de autenticación / autorización ─────────────────────────────

test('GET /reportes sin token devuelve 401', async () => {
  const r = await req('/reportes');
  assert.equal(r.status, 401);
});

test('POST /reportes sin token devuelve 401', async () => {
  const r = await req('/reportes', { method: 'POST', body: {} });
  assert.equal(r.status, 401);
});

test('POST /reportes con token de técnico devuelve 403', async () => {
  const r = await req('/reportes', { token: tokenTecnico(), method: 'POST', body: {} });
  assert.equal(r.status, 403);
});

test('DELETE /reportes/:id con token de técnico devuelve 403', async () => {
  const r = await req('/reportes/1', { token: tokenTecnico(), method: 'DELETE' });
  assert.equal(r.status, 403);
});

test('GET /usuarios sin token devuelve 401', async () => {
  const r = await req('/usuarios');
  assert.equal(r.status, 401);
});

test('POST /usuarios/register con token de técnico devuelve 403', async () => {
  const r = await req('/usuarios/register', { token: tokenTecnico(), method: 'POST', body: {} });
  assert.equal(r.status, 403);
});

test('DELETE /usuarios/:id con token de técnico devuelve 403', async () => {
  const r = await req('/usuarios/1', { token: tokenTecnico(), method: 'DELETE' });
  assert.equal(r.status, 403);
});

// ─── Login ──────────────────────────────────────────────────────────────

test('POST /auth/login sin credenciales devuelve 400', async () => {
  const r = await req('/auth/login', { method: 'POST', body: {} });
  assert.equal(r.status, 400);
});

test(
  'POST /auth/login con credenciales inválidas devuelve 401',
  { skip: !CON_BD && 'Requiere Supabase configurado' },
  async () => {
    const r = await req('/auth/login', {
      method: 'POST',
      body: { email_usuario: 'usuario-inexistente@prueba.local', contraseña: 'incorrecta' },
    });
    assert.equal(r.status, 401);
  },
);

// ─── CRUD de reportes ───────────────────────────────────────────────────

test('CRUD de reportes y cantidad de repuestos', { skip: !CON_BD && 'Requiere Supabase configurado' }, async (t) => {
  const { supabase } = require('../db/supabase');

  const [{ data: cliente }, { data: etiqueta }, { data: estado }, { data: tecnico }, { data: repuesto }, { data: ultimo }] =
    await Promise.all([
      supabase.from('clientes').select('id').eq('is_delete', false).limit(1).maybeSingle(),
      supabase.from('etiquetas_reportes').select('id').limit(1).maybeSingle(),
      supabase.from('estados_equipos').select('id').limit(1).maybeSingle(),
      supabase.from('usuarios').select('id').eq('is_delete', false).limit(1).maybeSingle(),
      supabase.from('repuestos').select('id').eq('is_delete', false).limit(1).maybeSingle(),
      supabase.from('reportes').select('numero_reporte').order('numero_reporte', { ascending: false }).limit(1).maybeSingle(),
    ]);

  if (!cliente || !etiqueta || !estado || !tecnico || !repuesto) {
    return t.skip('Faltan datos de referencia (cliente, etiqueta, estado, técnico o repuesto)');
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const numeroReporte = (ultimo?.numero_reporte || 0) + 1;
  const cuerpo = {
    numeroReporte,
    clienteId: cliente.id,
    equipo: 'Equipo de prueba automatizada',
    fechaReporte: hoy,
    fechaAtencion: hoy,
    horaInicio: '08:00',
    horaFinalizacion: '09:00',
    descripcionFalla: 'Falla de prueba automatizada',
    trabajoRealizado: 'Trabajo de prueba automatizada',
    etiquetaId: etiqueta.id,
    estadoId: estado.id,
    tecnicoId: tecnico.id,
    repuestoId: repuesto.id,
    repuestos: [{ repuestoId: repuesto.id, cantidad: 3 }],
    posibleCausa: 'Prueba',
    anotaciones: 'Creado por la suite de pruebas',
    reportadoPor: 'Test automatizado',
  };

  let reporteId = null;
  try {
    // Crear
    const creado = await req('/reportes', { token: tokenAdmin(), method: 'POST', body: cuerpo });
    assert.equal(creado.status, 201, JSON.stringify(creado.data));
    reporteId = creado.data.reporte.id;

    // La cantidad enviada debe persistir (bug de repuestos)
    assert.equal(creado.data.reporte.repuestos[0].cantidad, 3);

    // Leer
    const leido = await req(`/reportes/${reporteId}`, { token: tokenAdmin() });
    assert.equal(leido.status, 200);
    assert.equal(leido.data.repuestos[0].cantidad, 3);

    // Actualizar (incluye cambio de cantidad de repuestos)
    const actualizado = await req(`/reportes/${reporteId}`, {
      token: tokenAdmin(),
      method: 'PUT',
      body: {
        ...cuerpo,
        equipo: 'Equipo de prueba automatizada (editado)',
        repuestos: [{ repuestoId: repuesto.id, cantidad: 5 }],
        motivoModificacion: 'Prueba automatizada de edición de API',
      },
    });
    assert.equal(actualizado.status, 200, JSON.stringify(actualizado.data));
    assert.equal(actualizado.data.reporte.equipo, 'Equipo de prueba automatizada (editado)');
    assert.equal(actualizado.data.reporte.repuestos[0].cantidad, 5);

    // La cantidad editada debe persistir al volver a leer
    const releido = await req(`/reportes/${reporteId}`, { token: tokenAdmin() });
    assert.equal(releido.status, 200);
    assert.equal(releido.data.repuestos[0].cantidad, 5);

    // Eliminar (soft delete)
    const eliminado = await req(`/reportes/${reporteId}`, { token: tokenAdmin(), method: 'DELETE' });
    assert.equal(eliminado.status, 200);
    reporteId = null;
  } finally {
    if (reporteId) {
      await req(`/reportes/${reporteId}`, { token: tokenAdmin(), method: 'DELETE' });
    }
  }
});

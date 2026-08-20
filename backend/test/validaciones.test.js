/**
 * Pruebas unitarias de las utilidades de validación/sanitización
 * Ejecutar con: npm test
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizar, esHoraValida, aHoraMin, esFechaValida, hoy } = require('../utils/validaciones');

test('esHoraValida acepta HH:MM y HH:MM:SS', () => {
  assert.equal(esHoraValida('08:00'), true);
  assert.equal(esHoraValida('20:08'), true);
  assert.equal(esHoraValida('23:59'), true);
  assert.equal(esHoraValida('20:08:45'), true);
  assert.equal(esHoraValida('00:00'), true);
});

test('esHoraValida rechaza formatos inválidos', () => {
  assert.equal(esHoraValida('8:00'), false);
  assert.equal(esHoraValida('24:00'), false);
  assert.equal(esHoraValida('08:60'), false);
  assert.equal(esHoraValida('08'), false);
  assert.equal(esHoraValida('abc'), false);
  assert.equal(esHoraValida(''), false);
  assert.equal(esHoraValida(null), false);
  assert.equal(esHoraValida(undefined), false);
});

test('aHoraMin normaliza horas a HH:MM', () => {
  assert.equal(aHoraMin('20:08:00'), '20:08');
  assert.equal(aHoraMin('20:08'), '20:08');
  assert.equal(aHoraMin('8:05'), '08:05');
  assert.equal(aHoraMin(' 09:30:59 '), '09:30');
});

test('aHoraMin deja pasar valores no normalizables', () => {
  assert.equal(aHoraMin('abc'), 'abc');
  assert.equal(aHoraMin(null), null);
  assert.equal(aHoraMin(undefined), undefined);
  assert.equal(aHoraMin(123), 123);
});

test('esFechaValida valida formato YYYY-MM-DD', () => {
  assert.equal(esFechaValida('2026-08-11'), true);
  assert.equal(esFechaValida('1999-01-31'), true);
  assert.equal(esFechaValida('2026-02-30'), false);
  assert.equal(esFechaValida('2026/08/11'), false);
  assert.equal(esFechaValida('11-08-2026'), false);
  assert.equal(esFechaValida('abc'), false);
  assert.equal(esFechaValida(''), false);
});

test('hoy devuelve una fecha en formato YYYY-MM-DD', () => {
  const f = hoy();
  assert.match(f, /^\d{4}-\d{2}-\d{2}$/);
});

test('sanitizar elimina script y etiquetas HTML', () => {
  const limpiado = sanitizar('<script>alert("x")</script>Hola <b>mundo</b>');
  assert.equal(limpiado, 'Hola mundo');
});

test('sanitizar recorta a la longitud máxima', () => {
  assert.equal(sanitizar('abcdef', 3), 'abc');
  assert.equal(sanitizar('abcdef'), 'abcdef');
});

test('sanitizar deja pasar no-strings', () => {
  assert.equal(sanitizar(null), null);
  assert.equal(sanitizar(123), 123);
});

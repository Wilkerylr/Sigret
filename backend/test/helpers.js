/**
 * Utilidades compartidas para los scripts de prueba vía HTTP.
 *
 * Genera un token JWT firmado con el mismo secreto del backend
 * (JWT_SECRET de .env), evitando el 401 en endpoints protegidos.
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001/api';

function generarToken(usuario = { id: 1, rol_id: 1 }) {
  return jwt.sign(usuario, process.env.JWT_SECRET, { expiresIn: '8h' });
}

function headersConToken(usuario) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${generarToken(usuario)}`,
  };
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

module.exports = { BASE, generarToken, headersConToken, request };

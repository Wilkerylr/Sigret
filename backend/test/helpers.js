/**
 * Utilidades compartidas para los scripts de prueba vía HTTP.
 *
 * Genera un token JWT firmado con el mismo secreto del backend
 * (JWT_SECRET de .env), evitando el 401 en endpoints protegidos.
 */
require('dotenv').config();
const { spawn } = require('node:child_process');
const path = require('node:path');
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

module.exports = { BASE, generarToken, headersConToken, request, iniciarServidor };

/**
 * Arranca el backend en un puerto libre para las pruebas de API.
 * Devuelve la URL base y una función para detenerlo.
 */
async function iniciarServidor(puerto, envExtra = {}) {
  const env = {
    ...process.env,
    PORT: String(puerto),
    NODE_ENV: 'test',
    ...envExtra,
  };

  // Permite arrancar sin Supabase real para probar solo los guards
  // (401/403), que se resuelven antes de tocar la base de datos.
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  }
  if (!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY) {
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'clave-de-prueba';
  }
  if (!env.JWT_SECRET) {
    env.JWT_SECRET = 'secreto-de-prueba-con-mas-de-16-caracteres';
  }

  const raizBackend = path.resolve(__dirname, '..');
  const proceso = spawn(process.execPath, ['server.js'], {
    cwd: raizBackend,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let salida = '';
  proceso.stdout.on('data', (d) => (salida += d));
  proceso.stderr.on('data', (d) => (salida += d));

  const base = `http://localhost:${puerto}/api`;
  const raiz = `http://localhost:${puerto}`;
  const inicio = Date.now();
  while (Date.now() - inicio < 20000) {
    try {
      const res = await fetch(`${raiz}/ping`);
      if (res.ok) {
        return {
          base,
          proceso,
          salida: () => salida,
          detener: () =>
            new Promise((resolve) => {
              proceso.once('exit', resolve);
              proceso.kill();
            }),
        };
      }
    } catch {
      // El servidor todavía no está listo.
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  proceso.kill();
  throw new Error(`El servidor de pruebas no arrancó.\n${salida}`);
}

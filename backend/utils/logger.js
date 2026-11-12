/**
 * Logger estructurado del backend (pino)
 *
 * Centraliza el logging de la aplicación para que todas las líneas salgan
 * en JSON (producción) o con formato legible (desarrollo) y con los mismos
 * campos. Sustituye el uso directo de `console.*`.
 *
 * Uso:
 *   const logger = require('../utils/logger');
 *   logger.info('Servidor iniciado en el puerto %d', PUERTO);
 *   logger.error('[AUTH] Error en login:', error);
 *
 * Niveles: error > warn > info > debug.
 * Configuración:
 *   - LOG_LEVEL: fuerza el nivel (trace, debug, info, warn, error, fatal, silent).
 *   - NODE_ENV=test: silencioso por defecto.
 *   - NODE_ENV=production: info, sin `pino-pretty`.
 *   - desarrollo: debug y salida legible si `pino-pretty` está instalado.
 */

const pino = require('pino');
const util = require('node:util');

const esProduccion = process.env.NODE_ENV === 'production';
const esTest = process.env.NODE_ENV === 'test';

const nivel =
  process.env.LOG_LEVEL || (esTest ? 'silent' : esProduccion ? 'info' : 'debug');

const opciones = {
  level: nivel,
  base: { servicio: 'sgrt-backend' },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Nunca registrar credenciales ni cabeceras de sesión.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'contraseña',
      'contraseña_usuario',
      '*.password',
      '*.contraseña',
      '*.contraseña_usuario',
    ],
    censor: '[REDACTED]',
  },
};

// `pino-pretty` solo se usa en desarrollo y si está instalado. Se usa como
// stream en el mismo proceso (no como worker) para que los mensajes de
// fail-fast se impriman antes de `process.exit`.
let destino = null;
if (!esProduccion && !esTest) {
  try {
    const pretty = require('pino-pretty');
    destino = pretty({
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname,servicio',
    });
  } catch {
    // Sin pino-pretty: salida JSON.
  }
}

const pinoLogger = destino ? pino(opciones, destino) : pino(opciones);

/**
 * Normaliza los argumentos al estilo de `console.*`:
 *   logger.error('[AUTH] Error:', error)
 *   logger.info('Servidor en %s:%d', host, puerto)
 *
 * Los `Error` se adjuntan en el campo estructurado `err` y el resto se
 * formatea con `util.format`. Si el primer argumento es un objeto plano,
 * sus campos se añaden como metadatos.
 */
function normalizar(argumentos) {
  const metadatos = {};
  const paraMensaje = [];
  let errorCapturado = null;

  for (const argumento of argumentos) {
    if (argumento instanceof Error) {
      errorCapturado = argumento;
      continue;
    }

    if (
      paraMensaje.length === 0 &&
      argumento !== null &&
      typeof argumento === 'object' &&
      !Array.isArray(argumento)
    ) {
      Object.assign(metadatos, argumento);
      continue;
    }

    paraMensaje.push(argumento);
  }

  if (errorCapturado) {
    metadatos.err = errorCapturado;
  }

  const mensaje =
    paraMensaje.length > 0
      ? util.format(...paraMensaje)
      : errorCapturado?.message || '';

  return { mensaje, metadatos };
}

function crearNivel(nivelPino) {
  return (...argumentos) => {
    const { mensaje, metadatos } = normalizar(argumentos);
    pinoLogger[nivelPino](metadatos, mensaje);
  };
}

module.exports = {
  error: crearNivel('error'),
  warn: crearNivel('warn'),
  info: crearNivel('info'),
  debug: crearNivel('debug'),
  /** Instancia pino sin envoltorios (para pino-http y usos avanzados). */
  pino: pinoLogger,
};

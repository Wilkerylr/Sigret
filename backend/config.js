/**
 * Configuración central del backend
 *
 * Carga las variables de entorno y valida las credenciales obligatorias
 * al arrancar el servidor (fail-fast).
 */

require('dotenv').config();

const PUERTO = process.env.PORT || 3001;

/**
 * Clave secreta para firmar JWT.
 * OBLIGATORIA: sin ella el servidor se detiene para evitar tokens forjables.
 */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.error(
    '[CONFIG] Error: JWT_SECRET debe estar definido en .env y tener al menos 16 caracteres.\n' +
    '  Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
    '  Luego añádelo a backend/.env como: JWT_SECRET=<valor generado>'
  );
  process.exit(1);
}

/** Tiempo de expiración del JWT */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/** Orígenes permitidos para CORS (separados por coma) */
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

module.exports = {
  PUERTO,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CORS_ORIGIN,
};

/**
 * Backup lógico de la base de datos (pg_dump)
 *
 * Genera un archivo comprimido en formato custom de PostgreSQL con el
 * esquema `public` del proyecto. Requiere el cliente de PostgreSQL
 * (`pg_dump`) instalado y la cadena de conexión directa de Supabase.
 *
 * Uso:
 *   cd backend
 *   SUPABASE_DB_URL='postgresql://...' npm run backup
 *
 * Variables de entorno:
 *   SUPABASE_DB_URL / DATABASE_URL  Cadena de conexión directa (obligatoria).
 *   BACKUP_DIR                      Carpeta de salida (por defecto backend/backups).
 *   PG_DUMP                         Ruta al binario pg_dump (por defecto "pg_dump").
 *
 * La cadena de conexión nunca se imprime en los logs.
 */

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const logger = require('../utils/logger');

const cadenaConexion = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!cadenaConexion) {
  logger.error(
    '[BACKUP] Falta SUPABASE_DB_URL (o DATABASE_URL). Copia la cadena de conexión directa desde Supabase → Project Settings → Database.'
  );
  process.exit(1);
}

const carpeta = path.resolve(
  process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups')
);
fs.mkdirSync(carpeta, { recursive: true });

const marcaTiempo = new Date().toISOString().replace(/[:.]/g, '-');
const destino = path.join(carpeta, `sgrt-${marcaTiempo}.dump`);
const binario = process.env.PG_DUMP || 'pg_dump';

logger.info(`[BACKUP] Generando backup del esquema public en ${destino}`);

const resultado = spawnSync(
  binario,
  [
    '--format=custom',
    '--no-owner',
    '--no-privileges',
    '--schema=public',
    `--file=${destino}`,
    cadenaConexion,
  ],
  { stdio: 'inherit' }
);

if (resultado.error) {
  if (resultado.error.code === 'ENOENT') {
    logger.error(
      `[BACKUP] No se encontró el binario "${binario}". Instala el cliente de PostgreSQL o define PG_DUMP con la ruta completa.`
    );
  } else {
    logger.error('[BACKUP] Error al ejecutar pg_dump:', resultado.error);
  }
  process.exit(1);
}

if (resultado.status !== 0) {
  logger.error(`[BACKUP] pg_dump terminó con código ${resultado.status}.`);
  process.exit(resultado.status || 1);
}

const { size } = fs.statSync(destino);
logger.info(
  `[BACKUP] Backup completado (${(size / 1024 / 1024).toFixed(2)} MB): ${destino}`
);

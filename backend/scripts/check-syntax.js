/**
 * Verificación de sintaxis del backend (JavaScript sin build).
 *
 * Recorre los directorios del backend y ejecuta `node --check` sobre cada
 * archivo .js, excluyendo dependencias, artefactos y scripts de prueba
 * manuales.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const INCLUIR = ['server.js', 'config.js', 'db', 'middlewares', 'routes', 'utils', 'scripts'];
const EXCLUIR = new Set(['node_modules', 'dist', 'test', '.git']);

function recorrer(entrada) {
  const absoluta = path.join(ROOT, entrada);
  if (!fs.existsSync(absoluta)) return [];

  const stat = fs.statSync(absoluta);
  if (stat.isFile()) return absoluta.endsWith('.js') ? [absoluta] : [];

  return fs.readdirSync(absoluta).flatMap((hijo) => {
    if (EXCLUIR.has(hijo)) return [];
    return recorrer(path.join(entrada, hijo));
  });
}

const archivos = INCLUIR.flatMap(recorrer);
let errores = 0;

for (const archivo of archivos) {
  try {
    execFileSync(process.execPath, ['--check', archivo], { stdio: 'pipe' });
  } catch (error) {
    errores += 1;
    console.error(`[typecheck] Error de sintaxis en ${path.relative(ROOT, archivo)}`);
    console.error(String(error.stderr || error.message));
  }
}

if (errores > 0) {
  process.exit(1);
}

console.log(`[typecheck] ${archivos.length} archivos verificados sin errores de sintaxis.`);

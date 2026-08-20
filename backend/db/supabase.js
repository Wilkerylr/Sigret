/**
 * Cliente de Supabase
 * 
 * Inicializa el cliente de Supabase usando las credenciales del proyecto.
 * Este cliente reemplaza el pool de conexiones directas a PostgreSQL.
 * 
 * Uso:
 *   const supabase = require('./db/supabase');
 *   const { data, error } = await supabase.from('Usuarios').select('*');
 * 
 * Documentación: https://supabase.com/docs/reference/javascript/introduction
 */

const { createClient } = require('@supabase/supabase-js');

// --- Validar que las variables de entorno existan ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Preferir la service_role key para el backend (ignora RLS y permite
// todas las operaciones de administración). Si no está definida, se usa
// la publishable key como fallback para desarrollo.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  console.error('[SUPABASE] Error: NEXT_PUBLIC_SUPABASE_URL no está definida en .env');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('[SUPABASE] Error: SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no están definidas en .env');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[SUPABASE] Advertencia: se usa la publishable key. Se recomienda definir SUPABASE_SERVICE_ROLE_KEY en .env para el backend.');
}

// --- Crear el cliente de Supabase ---
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Prueba la conexión a Supabase consultando la tabla Roles.
 * Útil para verificar la configuración al iniciar el servidor.
 */
async function testConnection() {
  try {
    const { error } = await supabase.from('roles').select('id', { count: 'exact', head: true });
    
    if (error) {
      console.error('[SUPABASE] Error de conexión:', error.message);
      return false;
    }
    
    console.log('[SUPABASE] Conexión exitosa a Supabase Project');
    return true;
  } catch (err) {
    console.error('[SUPABASE] Error inesperado:', err.message);
    return false;
  }
}

module.exports = { supabase, testConnection };
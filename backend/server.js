// servidor coneccion frontend con base de datos
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { PUERTO, CORS_ORIGIN } = require('./config');

const app = express(); // crear una instancia de express

// ==========================================
// MIDDLEWARES DE SEGURIDAD
// ==========================================

// Cabeceras HTTP seguras (helmet)
app.use(helmet());

// Logging de peticiones (morgan)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parser con límite explícito
app.use(express.json({ limit: '1mb' }));

// CORS: solo orígenes permitidos
const origenesPermitidos = CORS_ORIGIN;
if (origenesPermitidos.length === 0) {
  console.warn('[CORS] Advertencia: CORS_ORIGIN no está configurado. Se permitirán todas las solicitudes (solo desarrollo).');
}
app.use(
  cors({
    origin(origin, callback) {
      // Permitir peticiones sin origen (curl, scripts de servidor)
      if (!origin || origenesPermitidos.length === 0 || origenesPermitidos.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  })
);

// Limitador global de peticiones (evita abuso)
const limitadorGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  message: { error: 'Demasiadas peticiones. Intenta nuevamente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limitadorGeneral);

// Limitador estricto para el login (evita fuerza bruta)
const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', limitadorLogin);

// ==========================================
// VERIFICAR CONEXIÓN CON SUPABASE
// ==========================================
const { testConnection } = require('./db/supabase');

// Probar conexión al iniciar (no bloquea el arranque)
testConnection().then((conectado) => {
    if (conectado) {
        console.log('✅ Base de datos conectada correctamente');
    } else {
        console.warn('⚠️  No se pudo conectar a Supabase. Verifica las credenciales en .env');
    }
});

// ==========================================
// RUTAS
// ==========================================

// Health check
app.get('/', (req, res) => {
    res.send('Servidor corriendo');
});

app.get('/ping', (req, res) => {
    res.send('Pong');
});

// --- Módulo de Autenticación ---
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);

// --- Módulo de Preguntas de Seguridad ---
const preguntasSeguridadRouter = require('./routes/preguntas-seguridad');
app.use('/api/auth', preguntasSeguridadRouter);

// --- Módulo de Usuarios ---
const usuariosRouter = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRouter);

// --- Módulo de Clientes ---
const clientesRouter = require('./routes/clientes');
app.use('/api/clientes', clientesRouter);

// --- Módulo de Etiquetas ---
const etiquetasRouter = require('./routes/etiquetas');
app.use('/api/etiquetas', etiquetasRouter);

// --- Módulo de Plantillas ---
const plantillasRouter = require('./routes/plantillas');
app.use('/api/plantillas', plantillasRouter);

// --- Módulo de Reportes ---
const reportesRouter = require('./routes/reportes');
app.use('/api/reportes', reportesRouter);

// --- Módulo de Repuestos ---
const repuestosRouter = require('./routes/repuestos');
app.use('/api/repuestos', repuestosRouter);

// --- Módulo de Estados de Equipo ---
const estadosRouter = require('./routes/estados');
app.use('/api/estados-equipos', estadosRouter);

// --- Módulo de Servicios Técnicos ---
const serviciosTecnicosRouter = require('./routes/servicios-tecnicos');
app.use('/api/servicios-tecnicos', serviciosTecnicosRouter);

// --- Módulo de Modificaciones (Auditoría) ---
const modificacionesRouter = require('./routes/modificaciones');
app.use('/api/modificaciones', modificacionesRouter);

// --- Módulo de Estadísticas (Dashboard) ---
const estadisticasRouter = require('./routes/estadisticas');
app.use('/api/estadisticas', estadisticasRouter);

// ==========================================
// MIDDLEWARE DE ERRORES
// ==========================================

// 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// 500 - Error interno del servidor
app.use((err, req, res, _next) => {
    // Error de CORS (origen no permitido)
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ error: err.message });
    }
    console.error('[SERVER] Error:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ==========================================
// INICIALIZAR SERVIDOR
// ==========================================
app.listen(PUERTO, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PUERTO}`);
    console.log(`📋 Endpoint de usuarios: http://localhost:${PUERTO}/api/usuarios`);
});

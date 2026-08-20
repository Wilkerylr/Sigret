// servidor coneccion frontend con base de datos
const express = require ('express');
const cors = require ('cors');
require('dotenv').config();

const app = express(); // crear una instancia de express

// -- middlewares --
app.use(express.json()); // para que el servidor pueda recibir json
app.use(cors()); // para permitir solicitudes desde cualquier origen

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

// --- Módulo de Usuarios ---
const usuariosRouter = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRouter);

// ==========================================
// MIDDLEWARE DE ERRORES
// ==========================================

// 404 - Ruta no encontrada
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// 500 - Error interno del servidor
app.use((err, req, res, next) => {
    console.error('[SERVER] Error:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ==========================================
// INICIALIZAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Endpoint de usuarios: http://localhost:${PORT}/api/usuarios`);
});

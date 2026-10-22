/**
 * Middlewares de autorización compartidos
 *
 * Centraliza la verificación de token JWT y el control de acceso por rol/permiso,
 * evitando la duplicación de lógica en cada módulo de rutas.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

/**
 * Middleware que verifica el token JWT del header Authorization: Bearer <token>.
 * Adjunta el payload decodificado a req.usuario.
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  const token = authHeader.slice(7);

  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', codigo: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware que verifica que el usuario autenticado sea administrador (rol = 1).
 */
function requiereAdmin(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }
  if (req.usuario.rol_id !== 1) {
    return res.status(403).json({ error: 'Se requieren permisos de administrador' });
  }
  next();
}

/**
 * Permisos por defecto según el rol.
 * Debe mantenerse sincronizado con el frontend (PERMISOS_POR_ROL).
 *   1 = Administrador, 2 = Técnico, 3 = Administrativo
 */
const PERMISOS_POR_ROL = {
  1: [
    'view-estadisticas',
    'view-registro-reportes',
    'view-busqueda-reportes',
    'view-gestion-registros',
    'view-gestion-usuarios',
  ],
  2: ['view-estadisticas', 'view-busqueda-reportes'],
  3: [
    'view-estadisticas',
    'view-registro-reportes',
    'view-busqueda-reportes',
    'view-gestion-registros',
  ],
};

/**
 * Devuelve los permisos efectivos de un usuario: los de su rol más los
 * permisos adicionales incluidos en el token JWT.
 */
function permisosEfectivos(usuario) {
  if (!usuario) return [];
  const porRol = PERMISOS_POR_ROL[usuario.rol_id] || [];
  const adicionales = Array.isArray(usuario.permisos) ? usuario.permisos : [];
  return Array.from(new Set([...porRol, ...adicionales]));
}

/**
 * Middleware que verifica que el usuario autenticado tenga un permiso específico.
 * El permiso puede provenir de los permisos por defecto del rol o de los
 * permisos adicionales incluidos en la lista `permisos` del token JWT.
 *
 * @param {string} nombrePermiso - Nombre del permiso requerido (ej: 'view-estadisticas')
 */
function verificarPermiso(nombrePermiso) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }
    const permisos = permisosEfectivos(req.usuario);
    if (!permisos.includes(nombrePermiso)) {
      return res.status(403).json({ error: `Se requiere el permiso "${nombrePermiso}"` });
    }
    next();
  };
}

module.exports = { verificarToken, requiereAdmin, verificarPermiso, permisosEfectivos, PERMISOS_POR_ROL };

/**
 * Middleware de caché HTTP para endpoints de datos no volátiles.
 *
 * Uso:
 *   router.get('/', cacheMiddleware(300), handler)   // 5 min
 *   router.get('/', cacheMiddleware(3600), handler)  // 1 hora
 */
function cacheMiddleware(maxAgeSeconds = 300) {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `private, max-age=${maxAgeSeconds}`);
    }
    next();
  };
}

module.exports = { cacheMiddleware };

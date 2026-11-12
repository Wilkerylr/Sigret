/**
 * Logger mínimo del frontend.
 *
 * En producción no se escriben errores internos en la consola del navegador;
 * en desarrollo se mantiene el detalle para depuración.
 */
export function logError(...args: unknown[]): void {
  if (!import.meta.env.PROD) {
    console.error(...args);
  }
}

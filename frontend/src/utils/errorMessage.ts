/**
 * Extrae un mensaje de error legible desde una respuesta de Axios o un Error.
 * Evita usar `any` en los bloques `catch` de los hooks.
 */
import axios from 'axios';

interface CuerpoError {
  error?: unknown;
  detalles?: unknown;
}

export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (axios.isAxiosError(error)) {
    const cuerpo = error.response?.data as CuerpoError | undefined;
    if (typeof cuerpo?.error === 'string' && cuerpo.error) {
      return cuerpo.error;
    }
    if (Array.isArray(cuerpo?.detalles)) {
      return cuerpo.detalles.join(', ');
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return porDefecto;
}

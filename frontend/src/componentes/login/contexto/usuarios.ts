/**
 * Re-export desde la fuente de datos centralizada en @/data
 * 
 * Mantiene compatibilidad con el código existente que importa desde
 * este módulo. Eventualmente estos exports pueden eliminarse y
 * migrar las importaciones directamente a @/data
 */

export {
  USUARIOS_REGISTRADOS,
  findUsuario,
} from '@/data';

export type {
  UserRole,
  Permission,
  UsuarioData,
} from '@/data';
import type { ModuloFuncionalidad } from '@/nucleo/modulo';
import type { IdFuncionalidad } from './catalogo';

/**
 * Crea el marcador de posición de un módulo aún no implementado.
 *
 * El gestor nunca activa funcionalidades pendientes; si ocurriera, el error
 * hace visible el fallo en lugar de aparentar que la protección funciona.
 */
export function crearModuloPendiente(id: IdFuncionalidad): ModuloFuncionalidad {
  return {
    id,
    activar() {
      throw new Error(`El módulo «${id}» está pendiente de implementación.`);
    },
    desactivar() {
      // Sin efectos que revertir.
    },
  };
}

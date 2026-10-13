import type { IdFuncionalidad } from '@/funcionalidades/catalogo';

/** Recursos que el gestor entrega a cada módulo al activarlo. */
export interface ContextoModulo {
  readonly documento: Document;
  /** Se aborta cuando el módulo se desactiva o el script de contenido se invalida. */
  readonly senal: AbortSignal;
}

/**
 * Contrato común de todas las funcionalidades.
 *
 * Cada módulo es independiente: no conoce a los demás ni accede al
 * almacenamiento. El gestor decide cuándo activarlo y desactivarlo.
 * `desactivar` debe revertir por completo cualquier cambio en la página.
 */
export interface ModuloFuncionalidad {
  readonly id: IdFuncionalidad;
  activar(contexto: ContextoModulo): void;
  desactivar(): void;
}

import { estaDisponible, type IdFuncionalidad } from '@/funcionalidades/catalogo';
import type { Preferencias } from '@/almacenamiento/preferencias';
import type { ModuloFuncionalidad } from './modulo';

/** Funcionalidades que deben estar activas: habilitadas por el usuario e implementadas. */
export function calcularFuncionalidadesActivas(
  preferencias: Preferencias,
  esDisponible: (id: IdFuncionalidad) => boolean = estaDisponible,
): ReadonlySet<IdFuncionalidad> {
  const activas = new Set<IdFuncionalidad>();
  for (const [id, habilitada] of Object.entries(preferencias.funcionalidades) as [
    IdFuncionalidad,
    boolean,
  ][]) {
    if (habilitada && esDisponible(id)) {
      activas.add(id);
    }
  }
  return activas;
}

interface ModuloActivo {
  readonly modulo: ModuloFuncionalidad;
  readonly controlador: AbortController;
}

/**
 * Activa y desactiva los módulos según las preferencias vigentes.
 * Un error en un módulo no afecta al resto.
 */
export class GestorModulos {
  readonly #modulos: ReadonlyMap<IdFuncionalidad, ModuloFuncionalidad>;
  readonly #activos = new Map<IdFuncionalidad, ModuloActivo>();
  readonly #documento: Document;
  readonly #senalGlobal: AbortSignal;
  readonly #registrarError: (mensaje: string, error: unknown) => void;
  readonly #esDisponible: (id: IdFuncionalidad) => boolean;

  constructor(opciones: {
    modulos: readonly ModuloFuncionalidad[];
    documento: Document;
    senal: AbortSignal;
    registrarError?: (mensaje: string, error: unknown) => void;
    /** Permite sustituir la consulta al catálogo (por ejemplo, en pruebas). */
    esDisponible?: (id: IdFuncionalidad) => boolean;
  }) {
    this.#modulos = new Map(opciones.modulos.map((modulo) => [modulo.id, modulo]));
    this.#documento = opciones.documento;
    this.#senalGlobal = opciones.senal;
    this.#esDisponible = opciones.esDisponible ?? estaDisponible;
    this.#registrarError =
      opciones.registrarError ??
      ((mensaje, error) => {
        console.error(`[Veilix] ${mensaje}`, error);
      });
  }

  get activos(): ReadonlySet<IdFuncionalidad> {
    return new Set(this.#activos.keys());
  }

  aplicar(preferencias: Preferencias): void {
    if (this.#senalGlobal.aborted) {
      return;
    }
    const deseadas = calcularFuncionalidadesActivas(preferencias, this.#esDisponible);

    for (const id of [...this.#activos.keys()]) {
      if (!deseadas.has(id)) {
        this.#desactivar(id);
      }
    }

    for (const id of deseadas) {
      if (!this.#activos.has(id)) {
        this.#activar(id);
      }
    }
  }

  detenerTodo(): void {
    for (const id of [...this.#activos.keys()]) {
      this.#desactivar(id);
    }
  }

  #activar(id: IdFuncionalidad): void {
    const modulo = this.#modulos.get(id);
    if (!modulo) {
      return;
    }
    const controlador = new AbortController();
    try {
      modulo.activar({
        documento: this.#documento,
        senal: AbortSignal.any([this.#senalGlobal, controlador.signal]),
      });
      this.#activos.set(id, { modulo, controlador });
    } catch (error) {
      controlador.abort();
      this.#registrarError(`No se pudo activar «${id}».`, error);
    }
  }

  #desactivar(id: IdFuncionalidad): void {
    const activo = this.#activos.get(id);
    if (!activo) {
      return;
    }
    this.#activos.delete(id);
    activo.controlador.abort();
    try {
      activo.modulo.desactivar();
    } catch (error) {
      this.#registrarError(`No se pudo desactivar «${id}».`, error);
    }
  }
}

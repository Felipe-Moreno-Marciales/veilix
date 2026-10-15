/**
 * Fábrica de módulos de difuminado.
 *
 * Cada módulo creado aquí es independiente y, al activarse:
 * 1. Inserta su propia hoja de estilos (`<style data-veilix-estilo="…">`).
 * 2. Registra el atajo de teclado de revelado temporal.
 * 3. Si necesita marcar elementos, se suscribe al observador compartido.
 *
 * Al desactivarse (o al abortarse la señal del contexto) elimina la hoja de
 * estilos, los atributos que haya añadido, las escuchas y la suscripción.
 */
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import type { ContextoModulo, ModuloFuncionalidad } from '../modulo';
import { atributoRevelado, generarHojaEstilos, type ReglaDifuminado } from './hoja-estilos';
import { suscribirMutaciones } from './observador-dom';
import { escucharAtajoRevelado } from './revelado-teclado';

/** Marca dinámicamente elementos que el CSS no puede seleccionar por sí solo. */
export interface Marcador {
  /** Marca todo lo existente en el documento. */
  marcarTodo(documento: Document): void;
  /** Marca lo afectado por un lote de mutaciones. */
  marcarCambios(registros: readonly MutationRecord[]): void;
  /** Elimina todas las marcas. */
  desmarcarTodo(documento: Document): void;
}

export interface ConfiguracionDifuminado {
  readonly id: IdFuncionalidad;
  /** Sufijo en minúsculas y con guiones para atributos y estilos. */
  readonly sufijo: string;
  readonly reglas: readonly ReglaDifuminado[];
  readonly marcador?: Marcador;
}

export const ATRIBUTO_ESTILO = 'data-veilix-estilo';

interface EstadoActivo {
  readonly documento: Document;
  readonly controlador: AbortController;
  readonly estilo: HTMLStyleElement;
}

export function crearModuloDifuminado(configuracion: ConfiguracionDifuminado): ModuloFuncionalidad {
  const { id, sufijo, reglas, marcador } = configuracion;
  const hojaEstilos = generarHojaEstilos(reglas, sufijo);
  let activo: EstadoActivo | null = null;

  function limpiar(): void {
    if (!activo) return;
    const { documento, controlador, estilo } = activo;
    activo = null;
    controlador.abort();
    estilo.remove();
    marcador?.desmarcarTodo(documento);
  }

  return {
    id,
    activar({ documento, senal }: ContextoModulo) {
      if (activo || senal.aborted) return;

      const controlador = new AbortController();
      const senalModulo = AbortSignal.any([senal, controlador.signal]);

      const estilo = documento.createElement('style');
      estilo.setAttribute(ATRIBUTO_ESTILO, sufijo);
      estilo.textContent = hojaEstilos;
      // En `document_start` puede no existir todavía <head>.
      (documento.querySelector('head') ?? documento.documentElement).append(estilo);

      activo = { documento, controlador, estilo };

      escucharAtajoRevelado(documento, atributoRevelado(sufijo), senalModulo);
      if (marcador) {
        marcador.marcarTodo(documento);
        suscribirMutaciones(documento, (registros) => {
          marcador.marcarCambios(registros);
        }, senalModulo);
      }
      senal.addEventListener('abort', limpiar, { once: true, signal: controlador.signal });
    },
    desactivar() {
      limpiar();
    },
  };
}

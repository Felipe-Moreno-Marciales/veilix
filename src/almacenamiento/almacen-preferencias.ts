/**
 * Persistencia local de las preferencias mediante `storage.local`.
 *
 * Las preferencias nunca se sincronizan ni se envían fuera del navegador.
 */
import { storage } from 'wxt/utils/storage';
import { estaDisponible, type IdFuncionalidad } from '@/funcionalidades/catalogo';
import {
  PREFERENCIAS_PREDETERMINADAS,
  normalizarPreferencias,
  type Preferencias,
  type Tema,
} from './preferencias';

export const CLAVE_PREFERENCIAS = 'local:preferencias';

export const elementoPreferencias = storage.defineItem<Preferencias>(CLAVE_PREFERENCIAS, {
  fallback: PREFERENCIAS_PREDETERMINADAS,
  version: 1,
});     

export async function leerPreferencias(): Promise<Preferencias> {
  return normalizarPreferencias(await elementoPreferencias.getValue());
}

/** Cola que serializa las escrituras para que dos cambios seguidos no se pisen. */
let colaEscrituras: Promise<unknown> = Promise.resolve();

/**
 * Lee, transforma y guarda las preferencias de forma atómica respecto a las
 * demás escrituras de este contexto. Solo cambia lo que devuelve `transformar`.
 */
function modificarPreferencias(
  transformar: (actuales: Preferencias) => Preferencias,
): Promise<Preferencias> {
  const operacion = colaEscrituras.then(async () => {
    const normalizadas = normalizarPreferencias(transformar(await leerPreferencias()));
    await elementoPreferencias.setValue(normalizadas);
    return normalizadas;
  });
  colaEscrituras = operacion.catch(() => undefined);
  return operacion;
}

export function cambiarTema(tema: Tema): Promise<Preferencias> {
  return modificarPreferencias((actuales) => ({ ...actuales, tema }));
}

/**
 * Activa o desactiva una funcionalidad. Rechaza la operación si la
 * funcionalidad aún no está implementada.
 */
export function cambiarFuncionalidad(id: IdFuncionalidad, activa: boolean): Promise<Preferencias> {
  if (!estaDisponible(id)) {
    return Promise.reject(
      new Error(`La funcionalidad «${id}» está pendiente de implementación.`),
    );
  }
  return modificarPreferencias((actuales) => ({
    ...actuales,
    funcionalidades: { ...actuales.funcionalidades, [id]: activa },
  }));
}

/** Observa cambios de preferencias. Devuelve la función para dejar de observar. */
export function observarPreferencias(alCambiar: (preferencias: Preferencias) => void): () => void {
  return elementoPreferencias.watch((nuevoValor) => {
    alCambiar(normalizarPreferencias(nuevoValor));
  });
}

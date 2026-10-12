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

async function guardarPreferencias(preferencias: Preferencias): Promise<Preferencias> {
  const normalizadas = normalizarPreferencias(preferencias);
  await elementoPreferencias.setValue(normalizadas);
  return normalizadas;
}

export async function cambiarTema(tema: Tema): Promise<Preferencias> {
  const actuales = await leerPreferencias();
  return guardarPreferencias({ ...actuales, tema });
}

/**
 * Activa o desactiva una funcionalidad. Rechaza la operación si la
 * funcionalidad aún no está implementada.
 */
export async function cambiarFuncionalidad(
  id: IdFuncionalidad,
  activa: boolean,
): Promise<Preferencias> {
  if (!estaDisponible(id)) {
    throw new Error(`La funcionalidad «${id}» está pendiente de implementación.`);
  }
  const actuales = await leerPreferencias();
  return guardarPreferencias({
    ...actuales,
    funcionalidades: { ...actuales.funcionalidades, [id]: activa },
  });
}

/** Observa cambios de preferencias. Devuelve la función para dejar de observar. */
export function observarPreferencias(alCambiar: (preferencias: Preferencias) => void): () => void {
  return elementoPreferencias.watch((nuevoValor) => {
    alCambiar(normalizarPreferencias(nuevoValor));
  });
}

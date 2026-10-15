/**
 * Observador de mutaciones compartido.
 *
 * Existe como máximo un `MutationObserver` por documento, sin importar
 * cuántos módulos lo necesiten. Se crea con el primer suscriptor y se
 * desconecta en cuanto se va el último. Solo observa `childList`: los
 * cambios de atributos que hace Veilix no generan nuevas notificaciones,
 * lo que evita bucles de mutaciones.
 */

export type AlMutar = (registros: readonly MutationRecord[]) => void;

interface Central {
  readonly observador: MutationObserver;
  readonly suscriptores: Set<AlMutar>;
}

const centrales = new WeakMap<Document, Central>();

/** Número de observadores activos en el documento (0 o 1). Útil para diagnóstico y pruebas. */
export function contarObservadores(documento: Document): number {
  return centrales.has(documento) ? 1 : 0;
}

/**
 * Suscribe una función a las mutaciones del documento. La suscripción se
 * cancela al abortar `senal`.
 */
export function suscribirMutaciones(documento: Document, alMutar: AlMutar, senal: AbortSignal): void {
  if (senal.aborted) {
    return;
  }

  let central = centrales.get(documento);
  if (!central) {
    const suscriptores = new Set<AlMutar>();
    const observador = new MutationObserver((registros) => {
      for (const suscriptor of suscriptores) {
        try {
          suscriptor(registros);
        } catch (error) {
          console.error('[Veilix] Error al procesar mutaciones.', error);
        }
      }
    });
    observador.observe(documento.documentElement, { childList: true, subtree: true });
    central = { observador, suscriptores };
    centrales.set(documento, central);
  }

  const { observador, suscriptores } = central;
  suscriptores.add(alMutar);

  senal.addEventListener(
    'abort',
    () => {
      suscriptores.delete(alMutar);
      if (suscriptores.size === 0) {
        observador.disconnect();
        centrales.delete(documento);
      }
    },
    { once: true },
  );
}

/**
 * Versionado de Veilix.
 *
 * Fuente única de verdad: el campo `version` de `package.json`, en formato
 * SemVer `MAYOR.MENOR.PARCHE` o `MAYOR.MENOR.PARCHE-<canal>.<n>`, con canal
 * `alpha`, `beta` o `rc`. A partir de ella se calculan:
 *
 * - La versión del manifiesto (`manifest.version`), que debe ser numérica:
 *   - Versión estable, en todos los navegadores: exactamente
 *     `MAYOR.MENOR.PARCHE` (por ejemplo, `0.1.0`). Es la única que se
 *     distribuye en tiendas.
 *   - Versión previa en Chromium y Firefox: `MAYOR.MENOR.PARCHE.COMPILACION`,
 *     con COMPILACION = 1000 + n (alpha), 2000 + n (beta) o 3000 + n (rc), de
 *     modo que cada compilación de prueba tiene una versión distinta.
 *   - Versión previa en Safari: `MAYOR.MENOR.PARCHE`, porque la app
 *     contenedora usa esta versión como `CFBundleShortVersionString`, que
 *     admite como máximo tres números. Las betas se distinguen por el número
 *     de compilación de la app en Xcode o App Store Connect.
 *
 *   Consecuencia aceptada (renumeración de 0.1.0, aprobada por el
 *   propietario el 2026-10-16): una versión previa queda numéricamente por
 *   encima de la estable con el mismo `MAYOR.MENOR.PARCHE` (por ejemplo,
 *   `0.1.1.2001` > `0.1.1`). Por eso las versiones previas son solo
 *   compilaciones internas de prueba y nunca se suben a una tienda. Las
 *   estables crecen estrictamente entre sí.
 * - `manifest.version_name` (solo Chromium, solo versiones previas): la
 *   versión SemVer completa. En las estables coincidiría con `version`.
 * - La versión descriptiva que se muestra en el panel.
 *
 * Solo se importa el campo `version`: Vite elimina el resto de `package.json`
 * del paquete final.
 */
import { version as VERSION_PAQUETE } from '../package.json';

export const CANALES = ['alpha', 'beta', 'rc'] as const;
export type Canal = (typeof CANALES)[number];

export interface VersionSemantica {
  readonly mayor: number;
  readonly menor: number;
  readonly parche: number;
  /** `null` en versiones estables. */
  readonly canal: Canal | null;
  /** Número de la versión previa (`beta.2` → 2); `null` en estables. */
  readonly numero: number | null;
}

/** Límite de Chrome para cada componente de `manifest.version`. */
const MAXIMO_COMPONENTE = 65_535;
/** Máximo número de versión previa por canal (`beta.999`). */
export const MAXIMO_NUMERO_PREVIO = 999;

const BASE_CANAL: Readonly<Record<Canal, number>> = { alpha: 1000, beta: 2000, rc: 3000 };
const EXPRESION_VERSION =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc)\.(0|[1-9]\d*))?$/;

export function analizarVersion(texto: string): VersionSemantica {
  const coincidencia = EXPRESION_VERSION.exec(texto);
  if (!coincidencia) {
    throw new Error(
      `Versión no válida: «${texto}». Formato esperado: MAYOR.MENOR.PARCHE o MAYOR.MENOR.PARCHE-(alpha|beta|rc).N`,
    );
  }
  const [, mayor = '', menor = '', parche = '', canal, numero] = coincidencia;
  const version: VersionSemantica = {
    mayor: Number(mayor),
    menor: Number(menor),
    parche: Number(parche),
    canal: (canal as Canal | undefined) ?? null,
    numero: numero === undefined ? null : Number(numero),
  };
  for (const componente of [version.mayor, version.menor, version.parche]) {
    if (componente > MAXIMO_COMPONENTE) {
      throw new Error(`Versión no válida: «${texto}». Cada componente debe ser ≤ ${MAXIMO_COMPONENTE}.`);
    }
  }
  if (version.numero !== null && version.numero > MAXIMO_NUMERO_PREVIO) {
    throw new Error(`Versión no válida: «${texto}». El número de versión previa debe ser ≤ ${MAXIMO_NUMERO_PREVIO}.`);
  }
  return version;
}

export function esVersionPrevia(version: VersionSemantica): boolean {
  return version.canal !== null;
}

/**
 * Cuarto componente de la versión del manifiesto en Chromium y Firefox para
 * una versión previa; `null` en las estables, que usan tres números.
 */
export function componenteCompilacion(version: VersionSemantica): number | null {
  if (version.canal === null || version.numero === null) return null;
  return BASE_CANAL[version.canal] + version.numero;
}

export type FamiliaNavegador = 'chromium' | 'firefox' | 'safari';

/** Familia del destino de compilación de WXT (`chrome`, `edge`, `opera`, `firefox`, `safari`…). */
export function familiaNavegador(navegador: string): FamiliaNavegador {
  if (navegador === 'firefox') return 'firefox';
  if (navegador === 'safari') return 'safari';
  return 'chromium';
}

/** `manifest.version` para un destino de compilación. */
export function versionManifiesto(texto: string, navegador: string): string {
  const version = analizarVersion(texto);
  const base = `${version.mayor}.${version.menor}.${version.parche}`;
  const compilacion = componenteCompilacion(version);
  return compilacion === null || familiaNavegador(navegador) === 'safari' ? base : `${base}.${compilacion}`;
}

/**
 * `manifest.version_name` para un destino de compilación. Solo Chromium lo
 * admite, y solo hace falta en las versiones previas: en las estables
 * coincide con `version`. En el resto devuelve `undefined`.
 */
export function nombreVersionManifiesto(texto: string, navegador: string): string | undefined {
  const version = analizarVersion(texto);
  return familiaNavegador(navegador) === 'chromium' && esVersionPrevia(version) ? texto : undefined;
}

const NOMBRES_CANAL: Readonly<Record<Canal, string>> = { alpha: 'alfa', beta: 'beta', rc: 'candidata' };

/** Texto para la interfaz: «0.1.0» en una estable, o por ejemplo «0.1.1-beta.0 (beta)». */
export function versionDescriptiva(texto: string): string {
  const { canal } = analizarVersion(texto);
  return canal === null ? texto : `${texto} (${NOMBRES_CANAL[canal]})`;
}

/** Versión actual de Veilix, tomada de `package.json`. */
export const VERSION: string = VERSION_PAQUETE;

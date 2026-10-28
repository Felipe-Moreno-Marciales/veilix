/**
 * Reconocimiento de los iconos SVG de estado de mensaje (✓, ✓✓…).
 *
 * WhatsApp Web indica el nombre de cada icono en un `<title>` hijo directo
 * del `<svg>`. CSS no puede seleccionar por contenido de texto, así que los
 * marcadores usan estas funciones y marcan el `<svg>` con un atributo propio.
 * Solo se lee el nombre del icono; nunca contenido de los mensajes.
 */
import { TITULOS_ICONO_ESTADO } from './selectores';

const SVG = 'http://www.w3.org/2000/svg';

/** Nombre del icono: texto del `<title>` hijo directo del `<svg>`, o `null`. */
export function nombreIcono(svg: Element): string | null {
  const titulo = [...svg.children].find((hijo) => hijo.localName === 'title' && hijo.namespaceURI === SVG);
  return titulo?.textContent.trim() ?? null;
}

/** Indica si el elemento es un `<svg>` de estado de mensaje (por nombre exacto). */
export function esIconoEstado(elemento: Element): boolean {
  if (elemento.localName !== 'svg' || elemento.namespaceURI !== SVG) return false;
  const nombre = nombreIcono(elemento);
  return nombre !== null && TITULOS_ICONO_ESTADO.includes(nombre);
}

/** Iconos de estado dentro de `raiz` (sin incluirla). */
export function iconosEstadoEn(raiz: Element): Element[] {
  return [...raiz.querySelectorAll('svg')].filter(esIconoEstado);
}

/**
 * Clasificación de los textos de cada fila de la lista de chats.
 *
 * El nombre y la vista previa del último mensaje no pueden distinguirse
 * solo con CSS sin recurrir a clases generadas dinámicamente. Por eso se
 * clasifican con una heurística estructural y se marcan con un atributo
 * `data-veilix-*` propio, que es el que usa la hoja de estilos.
 *
 * Heurística (pendiente de validar en WhatsApp Web real):
 * - Nombre: el primer `span[title]` de la fila que no sea un icono.
 * - Vista previa: el resto de `span[title]` y `span[dir]` de la fila que
 *   no formen parte del nombre ni sean solo iconos. Una vista previa puede
 *   contener iconos junto a su texto (por ejemplo, «reaccionó con 👌 a:» con
 *   el icono de una foto): entonces se protege entera, iconos incluidos.
 */
import { iconosEstadoEn } from './iconos-estado';
import type { Marcador } from './modulo-difuminado';
import { FILA_CHAT, ICONO } from './selectores';

export type TipoTexto = 'nombre' | 'vistaPrevia';

export interface ClasificacionFila {
  readonly nombre: Element | null;
  readonly vistasPrevias: readonly Element[];
}

/**
 * Regla usada para el nombre (RF-01): descarta cualquier elemento que sea un
 * icono o que contenga uno.
 */
export function contieneIcono(elemento: Element): boolean {
  return elemento.matches(`${ICONO}, ${ICONO} *`) || elemento.querySelector(`${ICONO}, svg`) !== null;
}

/** Texto visible del elemento, sin el de los `<title>` de los SVG (nombres de icono). */
export function textoVisible(elemento: Element): string {
  let texto = '';
  for (const nodo of elemento.querySelectorAll('*')) {
    if (nodo.closest('svg')) continue;
    for (const hijo of nodo.childNodes) {
      if (hijo.nodeType === Node.TEXT_NODE) texto += hijo.textContent ?? '';
    }
  }
  for (const hijo of elemento.childNodes) {
    if (hijo.nodeType === Node.TEXT_NODE) texto += hijo.textContent ?? '';
  }
  return texto.trim();
}

/**
 * Regla usada para la vista previa (RF-03): solo es icono un elemento que lo
 * sea (o esté dentro de uno) o que no tenga más contenido visible que iconos.
 * Una vista previa con texto o emojis y un icono no se descarta.
 */
export function esSoloIcono(elemento: Element): boolean {
  if (elemento.matches(`${ICONO}, ${ICONO} *`)) return true;
  if (elemento.querySelector(`${ICONO}, svg`) === null) return false;
  return textoVisible(elemento) === '' && elemento.querySelector('img') === null;
}

export function clasificarFila(fila: Element): ClasificacionFila {
  const nombre =
    [...fila.querySelectorAll('span[title]')].find((elemento) => !contieneIcono(elemento)) ?? null;

  const vistasPrevias = [...fila.querySelectorAll('span[title], span[dir]')].filter(
    (elemento) =>
      !esSoloIcono(elemento) &&
      (nombre === null || (!nombre.contains(elemento) && !elemento.contains(nombre))),
  );

  return { nombre, vistasPrevias };
}

/**
 * Solo los elementos que no están dentro de otro de la lista. Un filtro en el
 * antecesor ya difumina a sus descendientes; marcar también los interiores
 * superpondría dos filtros sobre el mismo texto.
 */
export function soloExternos(elementos: readonly Element[]): Element[] {
  return elementos.filter((elemento) => !elementos.some((otro) => otro !== elemento && otro.contains(elemento)));
}

/** Filas afectadas por un conjunto de mutaciones, sin repeticiones. */
export function filasAfectadas(registros: readonly MutationRecord[]): Set<Element> {
  const filas = new Set<Element>();
  for (const registro of registros) {
    const objetivo =
      registro.target instanceof Element ? registro.target : registro.target.parentElement;
    const filaContenedora = objetivo?.closest(FILA_CHAT);
    if (filaContenedora) {
      filas.add(filaContenedora);
      continue;
    }
    for (const nodo of registro.addedNodes) {
      if (nodo instanceof Element) {
        if (nodo.matches(FILA_CHAT)) filas.add(nodo);
        for (const fila of nodo.querySelectorAll(FILA_CHAT)) filas.add(fila);
      }
    }
  }
  return filas;
}

/**
 * Marca los textos de un tipo en las filas indicadas. Antes de marcar se
 * eliminan las marcas previas de la fila, porque WhatsApp reutiliza las
 * filas al desplazar o reordenar la lista. Solo escribe en el DOM cuando el
 * estado cambia.
 */
export function marcarFilas(filas: Iterable<Element>, tipo: TipoTexto, atributo: string): void {
  for (const fila of filas) {
    const { nombre, vistasPrevias } = clasificarFila(fila);
    const deseados = new Set<Element>(tipo === 'nombre' ? (nombre ? [nombre] : []) : soloExternos(vistasPrevias));

    for (const marcado of fila.querySelectorAll(`[${atributo}]`)) {
      if (!deseados.has(marcado)) marcado.removeAttribute(atributo);
    }
    for (const elemento of deseados) {
      if (!elemento.hasAttribute(atributo)) elemento.setAttribute(atributo, '');
    }
  }
}

export function desmarcarTodo(documento: Document, atributo: string): void {
  for (const elemento of documento.querySelectorAll(`[${atributo}]`)) {
    elemento.removeAttribute(atributo);
  }
}

/** Marcador de un tipo de texto de la lista de chats, para `crearModuloDifuminado`. */
export function crearMarcadorListaChats(tipo: TipoTexto, atributo: string): Marcador {
  return {
    marcarTodo(documento) {
      marcarFilas(documento.querySelectorAll(FILA_CHAT), tipo, atributo);
    },
    marcarCambios(registros) {
      const filas = filasAfectadas(registros);
      if (filas.size > 0) marcarFilas(filas, tipo, atributo);
    },
    desmarcarTodo(documento) {
      desmarcarTodo(documento, atributo);
    },
  };
}

/** Antecesor común más cercano de dos elementos (o `null`). */
function antecesorComun(a: Element, b: Element): Element | null {
  for (let actual: Element | null = a; actual; actual = actual.parentElement) {
    if (actual.contains(b)) return actual;
  }
  return null;
}

/**
 * Indicadores de estado (✓✓…) asociados a la vista previa de la fila.
 *
 * Un icono de estado se asocia a la vista previa si comparte con ella un
 * bloque que no contiene el nombre del chat (normalmente, la segunda línea
 * de la fila). Así no se difuminan iconos de estado situados en otras partes
 * de la fila. Heurística pendiente de validar en WhatsApp Web real.
 */
export function estadosDeVistaPrevia(fila: Element): Element[] {
  const { nombre, vistasPrevias } = clasificarFila(fila);
  if (vistasPrevias.length === 0) return [];
  return iconosEstadoEn(fila).filter((icono) =>
    vistasPrevias.some((vista) => {
      const comun = antecesorComun(icono, vista);
      return comun !== null && comun !== fila && (nombre === null || !comun.contains(nombre));
    }),
  );
}

function sincronizarFila(fila: Element, atributo: string, deseados: readonly Element[]): void {
  const conjunto = new Set(deseados);
  for (const marcado of fila.querySelectorAll(`[${atributo}]`)) {
    if (!conjunto.has(marcado)) marcado.removeAttribute(atributo);
  }
  for (const elemento of conjunto) {
    if (!elemento.hasAttribute(atributo)) elemento.setAttribute(atributo, '');
  }
}

/** Marcador de los indicadores de estado de la vista previa (RF-03). */
export function crearMarcadorEstadoVistaPrevia(atributo: string): Marcador {
  const marcar = (filas: Iterable<Element>) => {
    for (const fila of filas) {
      // Un indicador dentro de la propia vista previa ya queda difuminado con ella.
      const { vistasPrevias } = clasificarFila(fila);
      const estados = estadosDeVistaPrevia(fila).filter((icono) => !vistasPrevias.some((vista) => vista.contains(icono)));
      sincronizarFila(fila, atributo, estados);
    }
  };
  return {
    marcarTodo(documento) {
      marcar(documento.querySelectorAll(FILA_CHAT));
    },
    marcarCambios(registros) {
      const filas = filasAfectadas(registros);
      if (filas.size > 0) marcar(filas);
    },
    desmarcarTodo(documento) {
      desmarcarTodo(documento, atributo);
    },
  };
}

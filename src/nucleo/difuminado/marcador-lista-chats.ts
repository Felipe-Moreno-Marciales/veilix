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
 *   no formen parte del nombre ni sean iconos.
 */
import type { Marcador } from './modulo-difuminado';
import { FILA_CHAT, ICONO } from './selectores';

export type TipoTexto = 'nombre' | 'vistaPrevia';

export interface ClasificacionFila {
  readonly nombre: Element | null;
  readonly vistasPrevias: readonly Element[];
}

function esIcono(elemento: Element): boolean {
  return elemento.matches(`${ICONO}, ${ICONO} *`) || elemento.querySelector(`${ICONO}, svg`) !== null;
}

export function clasificarFila(fila: Element): ClasificacionFila {
  const nombre =
    [...fila.querySelectorAll('span[title]')].find((elemento) => !esIcono(elemento)) ?? null;

  const vistasPrevias = [...fila.querySelectorAll('span[title], span[dir]')].filter(
    (elemento) =>
      !esIcono(elemento) &&
      (nombre === null || (!nombre.contains(elemento) && !elemento.contains(nombre))),
  );

  return { nombre, vistasPrevias };
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
    const deseados = new Set<Element>(tipo === 'nombre' ? (nombre ? [nombre] : []) : vistasPrevias);

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

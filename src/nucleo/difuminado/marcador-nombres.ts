/**
 * Marcadores de nombres fuera de la lista de chats (RF-01) y de filas de
 * contacto (RF-01 y RF-02).
 *
 * 1. Remitentes en la conversación abierta. Los nombres se aprenden del
 *    atributo `data-pre-plain-text` de los bloques de texto («[hora, fecha]
 *    Nombre: »). Se marca el elemento más interno cuyo texto visible
 *    (incluidos los emojis en `<img alt>`) es exactamente uno de esos nombres:
 *    el nombre sobre cada mensaje de grupo, el autor de una cita o respuesta,
 *    etc. Se excluyen el propio texto del mensaje y el editor. Si el formato
 *    del atributo no coincide, no se marca nada.
 *
 * 2. Filas de contacto fuera de la lista de chats («Nuevo chat», listas de
 *    participantes…). Una fila candidata cuenta como fila de contacto si
 *    contiene exactamente un avatar (`AVATAR_SVG`) y un `span[title]`. El
 *    nombre es el primer `span[title]` que no contiene iconos, la misma regla
 *    que en la lista de chats.
 *
 * HIPÓTESIS pendientes de validar en WhatsApp Web real (ver `selectores.ts`).
 * Los textos se leen en el navegador solo para clasificar. Los nombres
 * aprendidos se guardan únicamente en memoria, mientras el módulo está
 * activo, y se descartan al cambiar de conversación o al desactivarlo.
 */
import { contieneIcono } from './marcador-lista-chats';
import type { Marcador } from './modulo-difuminado';
import {
  ACCION_NUEVO_CHAT,
  AVATAR_SVG,
  CELDA_NUEVO_CHAT,
  NO_TEXTO_DE_CONTACTO,
  BLOQUE_CON_REMITENTE,
  EDITABLE,
  FILA_CONTACTO_CANDIDATA,
  FILA_NUEVO_CHAT,
  NOMBRE_NUEVO_CHAT,
  PANEL_CONVERSACION,
  PANEL_LISTA_CHATS,
} from './selectores';

const DIRECCIONALES = /[‎‏‪-‮⁦-⁩]/g;
const EXPRESION_REMITENTE = /^\s*\[[^\]]*\]\s*(.+?):\s*$/su;
const LONGITUD_MAXIMA_NOMBRE = 100;

/** Normaliza un nombre: sin marcas de dirección, espacios simples y sin «~» inicial (contactos no guardados). */
export function normalizarNombre(texto: string): string {
  return texto.replace(DIRECCIONALES, '').replace(/\s+/g, ' ').trim().replace(/^~\s*/, '');
}

/** Nombre del remitente contenido en `data-pre-plain-text`, o `null` si el formato no coincide. */
export function remitenteDeBloque(valor: string): string | null {
  const nombre = normalizarNombre(EXPRESION_REMITENTE.exec(valor)?.[1] ?? '');
  return nombre === '' ? null : nombre;
}

/** Texto visible del elemento, con los emojis de `<img alt>` y sin el contenido de los SVG. */
export function textoConEmojis(elemento: Element): string {
  let texto = '';
  for (const nodo of elemento.childNodes) {
    if (nodo.nodeType === Node.TEXT_NODE) texto += nodo.textContent ?? '';
    else if (nodo instanceof Element && nodo.localName !== 'svg') {
      texto += nodo.localName === 'img' ? (nodo.getAttribute('alt') ?? '') : textoConEmojis(nodo);
    }
  }
  return texto;
}

function tieneTextoPropio(elemento: Element): boolean {
  return [...elemento.childNodes].some(
    (nodo) =>
      (nodo.nodeType === Node.TEXT_NODE && (nodo.textContent ?? '').trim() !== '') ||
      (nodo instanceof Element && nodo.localName === 'img' && (nodo.getAttribute('alt') ?? '') !== ''),
  );
}

/** Nombres de remitentes presentes en `raiz` (incluida). */
export function remitentesEn(raiz: Element): Set<string> {
  const nombres = new Set<string>();
  for (const bloque of [raiz, ...raiz.querySelectorAll(BLOQUE_CON_REMITENTE)]) {
    if (!bloque.matches(BLOQUE_CON_REMITENTE)) continue;
    const nombre = remitenteDeBloque(bloque.getAttribute('data-pre-plain-text') ?? '');
    if (nombre) nombres.add(nombre);
  }
  return nombres;
}

/** Elementos de `raiz` (incluida) que muestran exactamente uno de los nombres. */
export function elementosConNombre(raiz: Element, nombres: ReadonlySet<string>): Element[] {
  if (nombres.size === 0) return [];
  return [raiz, ...raiz.querySelectorAll('*')].filter((elemento) => {
    if (!tieneTextoPropio(elemento)) return false;
    if (elemento.closest(`svg, ${BLOQUE_CON_REMITENTE}, ${EDITABLE}`)) return false;
    const texto = textoConEmojis(elemento);
    if (texto.length > LONGITUD_MAXIMA_NOMBRE) return false;
    return nombres.has(normalizarNombre(texto));
  });
}

function sincronizar(raiz: Element, atributo: string, deseados: readonly Element[]): void {
  const conjunto = new Set(deseados);
  for (const marcado of [raiz, ...raiz.querySelectorAll(`[${atributo}]`)]) {
    if (marcado.hasAttribute(atributo) && !conjunto.has(marcado)) marcado.removeAttribute(atributo);
  }
  for (const elemento of conjunto) {
    if (!elemento.hasAttribute(atributo)) elemento.setAttribute(atributo, '');
  }
}

function desmarcar(documento: Document, ...atributos: readonly string[]): void {
  for (const atributo of atributos) {
    for (const elemento of documento.querySelectorAll(`[${atributo}]`)) elemento.removeAttribute(atributo);
  }
}

/** Marcador de nombres de remitentes en la conversación abierta (RF-01). */
export function crearMarcadorRemitentes(atributo: string): Marcador {
  const nombres = new Set<string>();
  let panelActual: Element | null = null;

  /** Añade los nombres de `raiz`; indica si apareció alguno nuevo. */
  const aprender = (raiz: Element): boolean => {
    let nuevos = false;
    for (const nombre of remitentesEn(raiz)) {
      if (!nombres.has(nombre)) {
        nombres.add(nombre);
        nuevos = true;
      }
    }
    return nuevos;
  };

  const panelDe = (documento: Document): Element | null => {
    const panel = documento.querySelector(PANEL_CONVERSACION);
    if (panel !== panelActual) {
      // Otra conversación: se descartan los nombres de la anterior.
      nombres.clear();
      panelActual = panel;
    }
    return panel;
  };

  const marcarPanel = (panel: Element) => {
    aprender(panel);
    sincronizar(panel, atributo, elementosConNombre(panel, nombres));
  };

  return {
    marcarTodo(documento) {
      const panel = panelDe(documento);
      if (panel) marcarPanel(panel);
    },
    marcarCambios(registros) {
      const documento = registros[0]?.target.ownerDocument;
      if (!documento) return;
      const anterior = panelActual;
      const panel = panelDe(documento);
      if (!panel) return;
      if (panel !== anterior) {
        marcarPanel(panel);
        return;
      }
      // Solo se procesan los nodos añadidos (o el elemento cuyo texto cambió),
      // no el subárbol completo del objetivo: al llegar un mensaje, el objetivo
      // es el contenedor de toda la conversación.
      const raices = new Set<Element>();
      for (const registro of registros) {
        const objetivo = registro.target instanceof Element ? registro.target : registro.target.parentElement;
        if (!objetivo) continue;
        if (!panel.contains(objetivo)) {
          if (objetivo.contains(panel)) raices.add(panel);
          continue;
        }
        for (const nodo of registro.addedNodes) {
          const raiz = nodo instanceof Element ? nodo : nodo.parentElement;
          if (raiz && panel.contains(raiz)) raices.add(raiz);
        }
      }
      let nuevos = false;
      for (const raiz of raices) nuevos = aprender(raiz) || nuevos;
      if (nuevos) {
        // Un nombre nuevo puede aparecer también en citas ya presentes.
        marcarPanel(panel);
        return;
      }
      for (const raiz of raices) sincronizar(raiz, atributo, elementosConNombre(raiz, nombres));
    },
    desmarcarTodo(documento) {
      desmarcar(documento, atributo);
      nombres.clear();
      panelActual = null;
    },
  };
}

/** Indica si el elemento es una fila de contacto fuera de la lista de chats y de la conversación. */
export function esFilaContacto(elemento: Element): boolean {
  if (!elemento.matches(FILA_CONTACTO_CANDIDATA)) return false;
  if (elemento.closest(`${PANEL_LISTA_CHATS}, ${PANEL_CONVERSACION}`)) return false;
  const avatares = [...elemento.querySelectorAll('svg')].filter((svg) => svg.matches(AVATAR_SVG));
  return avatares.length === 1 && nombreDeFilaContacto(elemento) !== null;
}

/** Nombre de una fila de contacto: el primer `span[title]` que no contiene iconos. */
export function nombreDeFilaContacto(fila: Element): Element | null {
  return [...fila.querySelectorAll('span[title]')].find((elemento) => !contieneIcono(elemento)) ?? null;
}

/** Filas candidatas afectadas por un lote de mutaciones (y sus candidatas antecesoras). */
function candidatasAfectadas(registros: readonly MutationRecord[]): Set<Element> {
  const candidatas = new Set<Element>();
  const excluidas = `${PANEL_LISTA_CHATS}, ${PANEL_CONVERSACION}`;
  const conAntecesoras = (elemento: Element | null) => {
    for (let actual = elemento?.closest(FILA_CONTACTO_CANDIDATA) ?? null; actual; ) {
      candidatas.add(actual);
      actual = actual.parentElement?.closest(FILA_CONTACTO_CANDIDATA) ?? null;
    }
  };
  for (const registro of registros) {
    const objetivo = registro.target instanceof Element ? registro.target : registro.target.parentElement;
    if (!objetivo || objetivo.closest(excluidas)) continue;
    conAntecesoras(objetivo);
    for (const nodo of registro.addedNodes) {
      if (!(nodo instanceof Element)) continue;
      // El propio nodo añadido puede ser la fila (lista virtualizada o
      // contactos cargados después de abrir el panel): `querySelectorAll`
      // solo devuelve descendientes. Corregido en 0.1.1-beta.1.
      if (nodo.matches(FILA_CONTACTO_CANDIDATA)) candidatas.add(nodo);
      for (const candidata of nodo.querySelectorAll(FILA_CONTACTO_CANDIDATA)) candidatas.add(candidata);
    }
  }
  return candidatas;
}

/**
 * Marcador de filas de contacto. Marca la fila con `atributoFila` (para el
 * revelado) y, si se indica `atributoNombre`, su nombre.
 */
export function crearMarcadorFilasContacto(atributoFila: string, atributoNombre?: string): Marcador {
  const procesar = (candidatas: Iterable<Element>) => {
    for (const candidata of candidatas) {
      if (esFilaContacto(candidata)) {
        if (!candidata.hasAttribute(atributoFila)) candidata.setAttribute(atributoFila, '');
        if (atributoNombre) {
          const nombre = nombreDeFilaContacto(candidata);
          for (const marcado of candidata.querySelectorAll(`[${atributoNombre}]`)) {
            if (marcado !== nombre && marcado.closest(`[${atributoFila}]`) === candidata) marcado.removeAttribute(atributoNombre);
          }
          if (nombre && !nombre.hasAttribute(atributoNombre)) nombre.setAttribute(atributoNombre, '');
        }
      } else if (candidata.hasAttribute(atributoFila)) {
        candidata.removeAttribute(atributoFila);
        if (atributoNombre) {
          for (const marcado of candidata.querySelectorAll(`[${atributoNombre}]`)) {
            if (!marcado.closest(`[${atributoFila}]`)) marcado.removeAttribute(atributoNombre);
          }
        }
      }
    }
  };
  return {
    marcarTodo(documento) {
      procesar(documento.querySelectorAll(FILA_CONTACTO_CANDIDATA));
    },
    marcarCambios(registros) {
      const candidatas = candidatasAfectadas(registros);
      if (candidatas.size > 0) procesar(candidatas);
    },
    desmarcarTodo(documento) {
      desmarcar(documento, atributoFila, ...(atributoNombre ? [atributoNombre] : []));
    },
  };
}

/** Indica si el elemento es la fila de un contacto en «Nuevo chat» (y no una acción). */
export function esFilaNuevoChat(elemento: Element): boolean {
  if (!elemento.matches(FILA_NUEVO_CHAT)) return false;
  if (elemento.matches(ACCION_NUEVO_CHAT) || elemento.querySelector(ACCION_NUEVO_CHAT)) return false;
  return nombreDeFilaNuevoChat(elemento) !== null;
}

/** Nombre de una fila de «Nuevo chat»: el primer `span[dir][title]` sin iconos. */
export function nombreDeFilaNuevoChat(fila: Element): Element | null {
  return [...fila.querySelectorAll(NOMBRE_NUEVO_CHAT)].find((elemento) => !contieneIcono(elemento)) ?? null;
}

/**
 * Información secundaria de una fila de «Nuevo chat»: elementos con texto
 * visible propio (o emojis en `<img alt>`) dentro de la celda de contenido,
 * distintos del nombre y de sus descendientes. Se excluyen SVG, iconos,
 * campos de entrada y botones situados dentro de la celda.
 */
export function infoDeFilaNuevoChat(fila: Element, nombre: Element | null): Element[] {
  const celda = fila.querySelector(CELDA_NUEVO_CHAT) ?? fila;
  return [...celda.querySelectorAll('*')].filter((elemento) => {
    if (!tieneTextoPropio(elemento)) return false;
    if (nombre && (elemento === nombre || nombre.contains(elemento) || elemento.contains(nombre))) return false;
    if (elemento.closest(NO_TEXTO_DE_CONTACTO)) return false;
    const boton = elemento.closest('button, [role="button"]');
    return !(boton && celda.contains(boton) && boton !== celda);
  });
}

/** Filas de «Nuevo chat» afectadas por un lote de mutaciones. */
function filasNuevoChatAfectadas(registros: readonly MutationRecord[]): Set<Element> {
  const filas = new Set<Element>();
  for (const registro of registros) {
    const objetivo = registro.target instanceof Element ? registro.target : registro.target.parentElement;
    const contenedora = objetivo?.closest(FILA_NUEVO_CHAT);
    if (contenedora) filas.add(contenedora);
    for (const nodo of registro.addedNodes) {
      if (!(nodo instanceof Element)) continue;
      // El propio nodo añadido puede ser la fila (lista virtualizada).
      if (nodo.matches(FILA_NUEVO_CHAT)) filas.add(nodo);
      // Sin el prefijo del panel y filtrando con `matches`, porque el panel
      // puede quedar fuera del subárbol añadido.
      for (const fila of nodo.querySelectorAll('[role="listitem"][data-testid^="list-item-"]')) {
        if (fila.matches(FILA_NUEVO_CHAT)) filas.add(fila);
      }
    }
  }
  return filas;
}

/**
 * Marcador de «Nuevo chat» (RF-01), basado en la estructura confirmada y sin
 * depender de avatares. Marca la fila con `atributoFila` (para el revelado),
 * su nombre con `atributoNombre` y, si se indica, su información secundaria
 * con `atributoInfo`.
 */
export function crearMarcadorNuevoChat(atributoFila: string, atributoNombre: string, atributoInfo?: string): Marcador {
  const sincronizarEnFila = (fila: Element, atributo: string, deseados: readonly Element[]) => {
    const conjunto = new Set(deseados);
    for (const marcado of fila.querySelectorAll(`[${atributo}]`)) {
      if (!conjunto.has(marcado)) marcado.removeAttribute(atributo);
    }
    for (const elemento of conjunto) {
      if (!elemento.hasAttribute(atributo)) elemento.setAttribute(atributo, '');
    }
  };
  const procesar = (filas: Iterable<Element>) => {
    for (const fila of filas) {
      const nombre = esFilaNuevoChat(fila) ? nombreDeFilaNuevoChat(fila) : null;
      sincronizarEnFila(fila, atributoNombre, nombre ? [nombre] : []);
      if (atributoInfo) sincronizarEnFila(fila, atributoInfo, nombre ? infoDeFilaNuevoChat(fila, nombre) : []);
      if (nombre) {
        if (!fila.hasAttribute(atributoFila)) fila.setAttribute(atributoFila, '');
      } else if (fila.hasAttribute(atributoFila)) {
        fila.removeAttribute(atributoFila);
      }
    }
  };
  return {
    marcarTodo(documento) {
      procesar(documento.querySelectorAll(FILA_NUEVO_CHAT));
    },
    marcarCambios(registros) {
      const filas = filasNuevoChatAfectadas(registros);
      if (filas.size > 0) procesar(filas);
    },
    desmarcarTodo(documento) {
      desmarcar(documento, atributoFila, atributoNombre, ...(atributoInfo ? [atributoInfo] : []));
    },
  };
}

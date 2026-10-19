/**
 * Clasificación de la hora y las reacciones de cada mensaje (RF-04).
 *
 * Ninguno de los dos puede seleccionarse solo con CSS sin clases generadas
 * dinámicamente. Se clasifican por estructura y por la forma de su texto, y
 * se marcan con atributos `data-veilix-*` propios.
 *
 * Heurística (HIPÓTESIS pendiente de validar en WhatsApp Web real):
 * - Hora: el elemento más interno cuyo texto completo tiene formato de hora
 *   (`10:40`, `10.40`, `10:40 p. m.`, `10:40 PM`).
 * - Reacción: el elemento más externo cuyo contenido son solo emojis (como
 *   texto o como `<img>` con `alt` de emoji) y, opcionalmente, un contador.
 *   No puede contener iconos (`[data-icon]`, `svg`) ni multimedia.
 *
 * - Indicador de estado: `<svg>` con `<title>` de estado confirmado
 *   (`wds-ic-read`) dentro de `[data-testid="msg-meta"]` (estructura
 *   confirmada en WhatsApp Web real).
 *
 * Solo se examina la fila de cada mensaje, fuera del texto y la multimedia
 * (que ya se difuminan). El texto se lee en el navegador solo para
 * clasificar: no se guarda ni se transmite.
 */
import { iconosEstadoEn } from './iconos-estado';
import type { Marcador } from './modulo-difuminado';
import {
  CONTENEDOR_MENSAJE,
  FILA_MENSAJE,
  MENSAJE,
  META_MENSAJE,
  MULTIMEDIA_MENSAJE,
  TEXTO_MENSAJE,
} from './selectores';

const EXPRESION_HORA = /^\d{1,2}[:.]\d{2}(?: ?[ap]\.? ?m\.?)?$/i;
const EMOJI = /\p{Extended_Pictographic}/u;
/**
 * Emojis, modificadores y componentes de emoji (incluidos el selector de
 * variante y la unión de anchura cero) y un contador opcional.
 */
const SOLO_EMOJIS_Y_CONTADOR =
  /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Emoji_Component}|[\s\d+.,·])+$/u;

/** Texto normalizado: espacios (`\s` incluye los no separables) reducidos a uno. */
function textoNormalizado(elemento: Element): string {
  return elemento.textContent.replace(/\s+/g, ' ').trim();
}

export function esHora(texto: string): boolean {
  return EXPRESION_HORA.test(texto.replace(/\s+/g, ' ').trim());
}

/** Indica si el contenido del elemento son solo emojis y, opcionalmente, un contador. */
export function esContenidoEmoji(elemento: Element): boolean {
  if (elemento.querySelector('[data-icon], svg, video, canvas') || elemento.matches('[data-icon]')) return false;
  const imagenes = [...elemento.querySelectorAll('img')];
  if (!imagenes.every((imagen) => EMOJI.test(imagen.getAttribute('alt') ?? ''))) return false;
  const texto = textoNormalizado(elemento);
  if (texto !== '' && !SOLO_EMOJIS_Y_CONTADOR.test(texto)) return false;
  return EMOJI.test(texto) || imagenes.length > 0;
}

/** Fila del mensaje si contiene un contenedor de mensaje; si no, el propio contenedor. */
export function ambitoDe(elemento: Element): Element | null {
  return elemento.closest(FILA_MENSAJE) ?? elemento.closest(MENSAJE);
}

const CONTENIDO_YA_DIFUMINADO = `:is(${TEXTO_MENSAJE}, ${MULTIMEDIA_MENSAJE})`;

export interface ClasificacionMensaje {
  readonly horas: readonly Element[];
  readonly reacciones: readonly Element[];
  /** Indicadores de estado dentro de `msg-meta`. */
  readonly estados: readonly Element[];
}

export function clasificarMensaje(ambito: Element): ClasificacionMensaje {
  const candidatos = [...ambito.querySelectorAll('*')].filter(
    (elemento) =>
      !elemento.matches(MENSAJE) &&
      !elemento.matches(CONTENIDO_YA_DIFUMINADO) &&
      !elemento.closest(CONTENIDO_YA_DIFUMINADO) &&
      !(elemento instanceof SVGElement),
  );

  const horas = candidatos.filter(
    (elemento) =>
      esHora(textoNormalizado(elemento)) &&
      ![...elemento.children].some((hijo) => esHora(textoNormalizado(hijo))),
  );

  const reacciones = candidatos.filter((elemento) => {
    if (!esContenidoEmoji(elemento)) return false;
    const padre = elemento.parentElement;
    return padre === null || padre === ambito || padre.matches(MENSAJE) || !esContenidoEmoji(padre);
  });

  const estados = iconosEstadoEn(ambito).filter((icono) => {
    const meta = icono.closest(META_MENSAJE);
    return meta !== null && ambito.contains(meta);
  });

  return { horas, reacciones, estados };
}

/** Ámbitos de mensaje afectados por un lote de mutaciones, sin repeticiones. */
export function ambitosAfectados(registros: readonly MutationRecord[]): Set<Element> {
  const ambitos = new Set<Element>();
  for (const registro of registros) {
    const objetivo = registro.target instanceof Element ? registro.target : registro.target.parentElement;
    const ambito = objetivo ? ambitoDe(objetivo) : null;
    if (ambito) ambitos.add(ambito);
    for (const nodo of registro.addedNodes) {
      if (!(nodo instanceof Element)) continue;
      // Se busca sin el prefijo `#main` y se filtra con `matches`, porque el
      // antecesor `#main` queda fuera del subárbol añadido.
      for (const contenedor of [nodo, ...nodo.querySelectorAll(CONTENEDOR_MENSAJE)]) {
        if (!contenedor.matches(MENSAJE)) continue;
        const ambitoNuevo = ambitoDe(contenedor);
        if (ambitoNuevo) ambitos.add(ambitoNuevo);
      }
    }
  }
  return ambitos;
}

function sincronizar(ambito: Element, atributo: string, deseados: readonly Element[]): void {
  const conjunto = new Set(deseados);
  for (const marcado of ambito.querySelectorAll(`[${atributo}]`)) {
    if (!conjunto.has(marcado)) marcado.removeAttribute(atributo);
  }
  for (const elemento of conjunto) {
    if (!elemento.hasAttribute(atributo)) elemento.setAttribute(atributo, '');
  }
}

export interface AtributosMensaje {
  readonly hora: string;
  readonly reaccion: string;
  readonly estado: string;
}

/** Marcador de hora, reacciones e indicadores de estado para `crearModuloDifuminado`. */
export function crearMarcadorMensajes(atributos: AtributosMensaje): Marcador {
  const todos = [atributos.hora, atributos.reaccion, atributos.estado];
  const marcar = (ambitos: Iterable<Element>) => {
    for (const ambito of ambitos) {
      const { horas, reacciones, estados } = clasificarMensaje(ambito);
      sincronizar(ambito, atributos.hora, horas);
      sincronizar(ambito, atributos.reaccion, reacciones);
      sincronizar(ambito, atributos.estado, estados);
    }
  };
  return {
    marcarTodo(documento) {
      const ambitos = new Set<Element>();
      for (const contenedor of documento.querySelectorAll(MENSAJE)) {
        const ambito = ambitoDe(contenedor);
        if (ambito) ambitos.add(ambito);
      }
      marcar(ambitos);
    },
    marcarCambios(registros) {
      const ambitos = ambitosAfectados(registros);
      if (ambitos.size > 0) marcar(ambitos);
    },
    desmarcarTodo(documento) {
      for (const elemento of documento.querySelectorAll(todos.map((a) => `[${a}]`).join(', '))) {
        for (const atributo of todos) elemento.removeAttribute(atributo);
      }
    },
  };
}

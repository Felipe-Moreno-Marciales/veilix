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
 * - Duración de una cita (desde 0.1.2-beta.11, estructura confirmada): el
 *   contenedor `CANDIDATO_DURACION_CITA` cuyo texto directo tiene forma de
 *   duración («0:18»). Su texto completo incluye el del icono y el del texto
 *   citado, por eso la regla de la hora no lo reconoce. Lo que contiene no se
 *   clasifica como hora ni como reacción.
 * - Encabezado de un estado citado (desde 0.1.2-beta.12): el `span`
 *   `CANDIDATO_ENCABEZADO_ESTADO` (estructura confirmada) cuyo texto completo
 *   tiene la forma «… · Estados». La etiqueta es solo un criterio
 *   complementario de la estructura, y depende del idioma: se reconocen el
 *   español («Estado», «Estados») y el inglés («Status»). En otros idiomas el
 *   encabezado no se difumina.
 *
 * Solo se examina la fila de cada mensaje, fuera del texto y la multimedia
 * (que ya se difuminan). El texto se lee en el navegador solo para
 * clasificar: no se guarda ni se transmite.
 */
import { iconosEstadoEn } from './iconos-estado';
import type { Marcador } from './modulo-difuminado';
import {
  CANDIDATO_DURACION_CITA,
  CANDIDATO_ENCABEZADO_ESTADO,
  CONTENEDOR_MENSAJE,
  DATOS_DOCUMENTO,
  ETIQUETA_ICONO_DOCUMENTO,
  FILA_MENSAJE,
  MENSAJE,
  META_MENSAJE,
  MINIATURA_CITA,
  MINIATURA_VIDEO,
  MULTIMEDIA_MENSAJE,
  TEXTO_MENSAJE,
  TEXTO_REGISTRO_LLAMADA,
} from './selectores';

const EXPRESION_HORA = /^\d{1,2}[:.]\d{2}(?: ?[ap]\.? ?m\.?)?$/i;
const EXPRESION_DURACION = /^\d{1,2}:\d{2}(?::\d{2})?$/;
/** «Tú · Estados», «You · Status»…: algo, un separador «·» o «•» y la etiqueta de estado (español o inglés). */
const EXPRESION_ENCABEZADO_ESTADO = /^\S.*\s[·•]\s(?:estados?|status)$/iu;
/** Marcas de dirección de texto que WhatsApp puede intercalar. */
const MARCAS_DIRECCION = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
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

/**
 * Contenido que ya se difumina por CSS. Se comprueba selector a selector, sin
 * unirlos en un solo `:is()`: el selector combinado superaría el límite de
 * longitud de algunos motores de selectores (el de jsdom admite 2048 caracteres).
 */
const CONTENIDO_YA_DIFUMINADO = [
  TEXTO_MENSAJE,
  MULTIMEDIA_MENSAJE,
  MINIATURA_VIDEO,
  DATOS_DOCUMENTO,
  ETIQUETA_ICONO_DOCUMENTO,
  MINIATURA_CITA,
  TEXTO_REGISTRO_LLAMADA,
];

/** Si el elemento ya se difumina por CSS, por sí mismo o por estar dentro de un contenido difuminado. */
function yaDifuminado(elemento: Element): boolean {
  return CONTENIDO_YA_DIFUMINADO.some((selector) => elemento.closest(selector) !== null);
}

export interface ClasificacionMensaje {
  readonly horas: readonly Element[];
  readonly reacciones: readonly Element[];
  /** Indicadores de estado dentro de `msg-meta`. */
  readonly estados: readonly Element[];
  /** Contenedores de la duración de una cita (con su icono y su texto citado). */
  readonly duracionesCita: readonly Element[];
  /** Encabezados de estados citados («Tú · Estados»). */
  readonly encabezadosEstado: readonly Element[];
}

export function esEncabezadoEstado(texto: string): boolean {
  return EXPRESION_ENCABEZADO_ESTADO.test(texto.replace(MARCAS_DIRECCION, '').replace(/\s+/g, ' ').trim());
}

/** Texto de los nodos de texto directos del elemento, normalizado (sin el de sus descendientes). */
function textoDirecto(elemento: Element): string {
  let texto = '';
  for (const nodo of elemento.childNodes) {
    if (nodo.nodeType === Node.TEXT_NODE) texto += nodo.textContent ?? '';
  }
  return texto.replace(/\s+/g, ' ').trim();
}

export function esDuracion(texto: string): boolean {
  return EXPRESION_DURACION.test(texto);
}

export function clasificarMensaje(ambito: Element): ClasificacionMensaje {
  const duracionesCita = [...ambito.querySelectorAll('*')].filter(
    (elemento) => elemento.matches(CANDIDATO_DURACION_CITA) && esDuracion(textoDirecto(elemento)),
  );
  const encabezadosEstado = [...ambito.querySelectorAll('*')].filter(
    (elemento) => elemento.matches(CANDIDATO_ENCABEZADO_ESTADO) && esEncabezadoEstado(elemento.textContent),
  );
  const dentroDeDuracion = (elemento: Element) =>
    [...duracionesCita, ...encabezadosEstado].some((marcado) => marcado.contains(elemento));

  const candidatos = [...ambito.querySelectorAll('*')].filter(
    (elemento) =>
      !dentroDeDuracion(elemento) &&
      !elemento.matches(MENSAJE) &&
      !yaDifuminado(elemento) &&
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

  return { horas, reacciones, estados, duracionesCita, encabezadosEstado };
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
  readonly duracionCita: string;
  readonly encabezadoEstado: string;
}

/** Marcador de hora, reacciones, indicadores de estado, duraciones de citas y encabezados de estados para `crearModuloDifuminado`. */
export function crearMarcadorMensajes(atributos: AtributosMensaje): Marcador {
  const todos = [atributos.hora, atributos.reaccion, atributos.estado, atributos.duracionCita, atributos.encabezadoEstado];
  const marcar = (ambitos: Iterable<Element>) => {
    for (const ambito of ambitos) {
      const { horas, reacciones, estados, duracionesCita, encabezadosEstado } = clasificarMensaje(ambito);
      sincronizar(ambito, atributos.hora, horas);
      sincronizar(ambito, atributos.reaccion, reacciones);
      sincronizar(ambito, atributos.estado, estados);
      sincronizar(ambito, atributos.duracionCita, duracionesCita);
      sincronizar(ambito, atributos.encabezadoEstado, encabezadosEstado);
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

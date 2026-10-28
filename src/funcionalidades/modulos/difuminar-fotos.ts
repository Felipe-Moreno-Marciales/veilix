/**
 * Módulo: difuminar fotografías de contactos (RF-02).
 *
 * Difumina con CSS, sin modificar las imágenes:
 * 1. Los avatares de las filas de la lista de chats y del encabezado de la
 *    conversación (por ubicación): `<svg>` con máscara que contiene una
 *    `<image>` o un `<foreignObject>` (estructura observada en WhatsApp Web
 *    real), `<img>` y avatares predeterminados con `data-icon`.
 * 2. Las fotos de perfil en cualquier otra zona (panel de información,
 *    remitentes en grupos, paneles laterales…), reconocidas por su origen,
 *    en `<img>`, en `<image>` dentro de un SVG o en imágenes de fondo en línea.
 * 3. Los avatares SVG con la estructura confirmada (`AVATAR_SVG`) en cualquier
 *    zona. En las filas de contacto fuera de la lista se revelan con la fila.
 * 4. Desde 0.1.2-beta.2, en «Nuevo chat»: la columna del avatar de cada fila
 *    de persona (contactos y «Tú»), por su estructura confirmada
 *    (`AVATAR_NUEVO_CHAT`). Cubre la foto y el avatar predeterminado (un SVG
 *    sobre un círculo de color, que ninguna regla anterior reconocía) como una
 *    sola unidad, y se revela con la fila. Las acciones, los encabezados y los
 *    textos quedan fuera. Las reglas anteriores no se aplican dentro de esa
 *    columna, para no difuminar dos veces la misma foto.
 * 5. Desde 0.1.2-beta.3, los avatares de participantes junto a los mensajes
 *    de un grupo (`AVATAR_PARTICIPANTE`, estructura confirmada): la foto o el
 *    círculo de color con la inicial, como una sola unidad, revelado con el
 *    propio avatar. Las reglas anteriores de fotos no se aplican dentro.
 *
 * No afecta a iconos funcionales, contadores, botones ni imágenes de los
 * mensajes. Salvo la estructura SVG de la lista, los selectores son
 * hipótesis pendientes de validar en WhatsApp Web real (ver `selectores.ts`).
 */
import { crearMarcadorFilasContacto } from '@/nucleo/difuminado/marcador-nombres';
import { crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import {
  AVATAR_EN_FILA_NUEVO_CHAT,
  AVATAR_NUEVO_CHAT,
  AVATAR_PARTICIPANTE,
  AVATAR_PREDETERMINADO,
  AVATAR_SVG,
  ENCABEZADO_CONVERSACION,
  FILA_CHAT,
  FOTO_PERFIL,
  FOTO_PERFIL_SVG,
  FOTOGRAFIA,
  FILA_PERSONA_NUEVO_CHAT,
} from '@/nucleo/difuminado/selectores';

/**
 * Excluye lo que ya cubren como unidad la columna del avatar de «Nuevo chat» y
 * el avatar de un participante en un grupo, para no aplicar dos filtros.
 * Va dentro de `:where()` para no sumar especificidad: `:not()` toma la de su
 * argumento más específico, y el `#main` de `AVATAR_PARTICIPANTE` haría que el
 * difuminado global ganara a las reglas de revelado de la lista y del
 * encabezado.
 */
const FUERA_DE_AVATAR_COMPLETO = `:not(:where(${AVATAR_EN_FILA_NUEVO_CHAT} *, ${AVATAR_PARTICIPANTE} *))`;

// Incluye también los avatares reconocidos por su origen, para que el
// revelado con la fila o el encabezado funcione con cualquier representación.
const AVATAR_POR_UBICACION = [
  AVATAR_SVG,
  FOTOGRAFIA,
  FOTO_PERFIL,
  FOTO_PERFIL_SVG,
  AVATAR_PREDETERMINADO,
].join(', ');

/** Fila de contacto fuera de la lista de chats, marcada por RF-02 (independiente de RF-01). */
export const ATRIBUTO_FILA_CONTACTO_FOTOS = 'data-veilix-fila-contacto-fotos';

export const moduloDifuminarFotos = crearModuloDifuminado({
  id: 'difuminarFotos',
  sufijo: 'fotos',
  reglas: [
    { contenedor: FILA_CHAT, objetivo: AVATAR_POR_UBICACION, revelarConFoco: true },
    { contenedor: ENCABEZADO_CONVERSACION, objetivo: AVATAR_POR_UBICACION, revelarConFoco: true },
    // Filas de contacto fuera de la lista («Nuevo chat», participantes…): se revelan con la fila.
    {
      contenedor: `[${ATRIBUTO_FILA_CONTACTO_FOTOS}]`,
      objetivo: `:is(${AVATAR_POR_UBICACION})${FUERA_DE_AVATAR_COMPLETO}`,
      revelarConFoco: true,
    },
    // «Nuevo chat»: columna del avatar de cada contacto y de «Tú» (foto o predeterminado), revelada con la fila.
    { contenedor: FILA_PERSONA_NUEVO_CHAT, objetivo: AVATAR_NUEVO_CHAT, revelarConFoco: true },
    // Grupos: avatar de cada participante junto a sus mensajes; el propio avatar delimita el revelado.
    { contenedor: AVATAR_PARTICIPANTE, objetivo: null, revelarConFoco: true },
    // Fuera de la lista y del encabezado, el propio avatar delimita el revelado.
    {
      contenedor: `:is(${FOTO_PERFIL}, ${FOTO_PERFIL_SVG}, ${AVATAR_SVG}, ${AVATAR_PREDETERMINADO})${FUERA_DE_AVATAR_COMPLETO}`,
      objetivo: null,
      revelarConFoco: true,
    },
  ],
  marcador: crearMarcadorFilasContacto(ATRIBUTO_FILA_CONTACTO_FOTOS),
});

/**
 * Módulo: difuminar nombres de contactos (RF-01).
 *
 * - Lista de chats: el nombre de cada fila se marca con
 *   `data-veilix-nombre` (ver `marcador-lista-chats.ts`) y se difumina.
 * - Encabezado de la conversación: se difuminan el nombre y el subtítulo.
 * - Conversación abierta: desde 0.1.2-beta.1, el autor de cada mensaje y de
 *   las citas se difumina por su estructura confirmada (`AUTOR`, el
 *   `[data-testid="author"]` más externo), aunque su nombre visible no
 *   coincida con `data-pre-plain-text` (participantes no guardados) o el
 *   mensaje no tenga ese bloque (multimedia sin descripción). Los demás
 *   nombres de remitentes (aviso fijado…) se siguen marcando con
 *   `data-veilix-remitente` (ver `marcador-nombres.ts`); los que ya cubre
 *   `AUTOR` se excluyen para no aplicar dos filtros. Es independiente de RF-04.
 * - «Nuevo chat» (estructura confirmada, desde 0.1.1-beta.2): cada fila
 *   `[role="listitem"][data-testid^="list-item-"]` del panel se marca con
 *   `data-veilix-fila-nuevo-chat` y su nombre con
 *   `data-veilix-nombre-nuevo-chat`. Desde 0.1.1-beta.3, la información
 *   secundaria (descripción, frase de estado…) se marca con
 *   `data-veilix-info-nuevo-chat`. Ambos se revelan con la fila. Las acciones
 *   (nuevo grupo, contacto o comunidad) quedan excluidas. No depende de los
 *   avatares.
 * - Otras filas de contacto fuera de la lista de chats (hipótesis): fila con
 *   un avatar SVG y un `span[title]`, marcada con `data-veilix-fila-contacto` y
 *   su nombre con `data-veilix-nombre-contacto`.
 *
 * - «Info. del contacto» (estructura confirmada, desde 0.1.2-beta.13): el
 *   nombre, el nombre de usuario, el teléfono y la descripción (con sus
 *   emojis), cada uno con un solo filtro y revelado por separado. Las
 *   etiquetas, los botones, el marcador de las notas y la foto (RF-02) quedan
 *   fuera. Solo CSS.
 *
 * Revelado temporal: cursor sobre la fila, el mensaje, el encabezado o el dato
 * del panel, foco de teclado en ellos, o Ctrl + Mayús + Espacio.
 */
import { crearMarcadorListaChats } from '@/nucleo/difuminado/marcador-lista-chats';
import {
  crearMarcadorFilasContacto,
  crearMarcadorNuevoChat,
  crearMarcadorRemitentes,
} from '@/nucleo/difuminado/marcador-nombres';
import { combinarMarcadores, crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import {
  AUTOR,
  AUTOR_EXTERNO,
  ENCABEZADO_CONVERSACION,
  FILA_CHAT,
  FILA_MENSAJE,
  MENSAJE,
  NOMBRE_INFO_CONTACTO,
  PANEL_CONVERSACION,
  TEXTO_ENCABEZADO,
  TEXTO_VALOR_INFO_CONTACTO,
  USUARIO_INFO_CONTACTO,
  VALOR_INFO_CONTACTO,
} from '@/nucleo/difuminado/selectores';

export const ATRIBUTO_NOMBRE = 'data-veilix-nombre';
export const ATRIBUTO_REMITENTE = 'data-veilix-remitente';
export const ATRIBUTO_FILA_CONTACTO = 'data-veilix-fila-contacto';
export const ATRIBUTO_NOMBRE_CONTACTO = 'data-veilix-nombre-contacto';
export const ATRIBUTO_FILA_NUEVO_CHAT = 'data-veilix-fila-nuevo-chat';
export const ATRIBUTO_NOMBRE_NUEVO_CHAT = 'data-veilix-nombre-nuevo-chat';
export const ATRIBUTO_INFO_NUEVO_CHAT = 'data-veilix-info-nuevo-chat';

/** Remitentes marcados por texto que no están ya cubiertos por la estructura `author`. */
const REMITENTE_SIN_AUTOR = `[${ATRIBUTO_REMITENTE}]:not(${AUTOR}, ${AUTOR} *)`;

export const moduloDifuminarNombres = crearModuloDifuminado({
  id: 'difuminarNombres',
  sufijo: 'nombres',
  reglas: [
    { contenedor: FILA_CHAT, objetivo: `[${ATRIBUTO_NOMBRE}]`, revelarConFoco: true },
    { contenedor: ENCABEZADO_CONVERSACION, objetivo: TEXTO_ENCABEZADO, revelarConFoco: true },
    // Autores y remitentes dentro de un mensaje: se revelan con el mensaje completo.
    { contenedor: `${FILA_MENSAJE}, ${MENSAJE}`, objetivo: `${AUTOR_EXTERNO}, ${REMITENTE_SIN_AUTOR}`, revelarConFoco: true },
    // Fuera de los mensajes (recuadro «Responder», aviso fijado…): el propio nombre delimita el revelado.
    {
      contenedor: `${PANEL_CONVERSACION} :is(${AUTOR_EXTERNO}, ${REMITENTE_SIN_AUTOR})`,
      objetivo: null,
      revelarConFoco: true,
    },
    { contenedor: `[${ATRIBUTO_FILA_CONTACTO}]`, objetivo: `[${ATRIBUTO_NOMBRE_CONTACTO}]`, revelarConFoco: true },
    {
      contenedor: `[${ATRIBUTO_FILA_NUEVO_CHAT}]`,
      objetivo: `[${ATRIBUTO_NOMBRE_NUEVO_CHAT}], [${ATRIBUTO_INFO_NUEVO_CHAT}]`,
      revelarConFoco: true,
    },
    // «Info. del contacto»: el nombre y el usuario se revelan con el cursor sobre sí mismos.
    { contenedor: `${NOMBRE_INFO_CONTACTO}, ${USUARIO_INFO_CONTACTO}`, objetivo: null, revelarConFoco: true },
    // Teléfono y descripción: se difumina el texto del valor (con sus emojis) y se revela con el cursor sobre el valor.
    { contenedor: VALOR_INFO_CONTACTO, objetivo: TEXTO_VALOR_INFO_CONTACTO, revelarConFoco: true },
  ],
  marcador: combinarMarcadores(
    crearMarcadorListaChats('nombre', ATRIBUTO_NOMBRE),
    crearMarcadorRemitentes(ATRIBUTO_REMITENTE),
    crearMarcadorFilasContacto(ATRIBUTO_FILA_CONTACTO, ATRIBUTO_NOMBRE_CONTACTO),
    crearMarcadorNuevoChat(ATRIBUTO_FILA_NUEVO_CHAT, ATRIBUTO_NOMBRE_NUEVO_CHAT, ATRIBUTO_INFO_NUEVO_CHAT),
  ),
});

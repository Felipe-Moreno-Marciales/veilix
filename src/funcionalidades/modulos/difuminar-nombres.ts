/**
 * Módulo: difuminar nombres de contactos (RF-01).
 *
 * - Lista de chats: el nombre de cada fila se marca con
 *   `data-veilix-nombre` (ver `marcador-lista-chats.ts`) y se difumina.
 * - Encabezado de la conversación: se difuminan el nombre y el subtítulo.
 * - Conversación abierta: los nombres de remitentes (sobre cada mensaje de
 *   grupo, en citas y respuestas…) se marcan con `data-veilix-remitente`
 *   (ver `marcador-nombres.ts`). Es independiente de RF-04.
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
 * Revelado temporal: cursor sobre la fila, el mensaje o el encabezado, foco
 * de teclado en ellos, o Ctrl + Mayús + Espacio.
 */
import { crearMarcadorListaChats } from '@/nucleo/difuminado/marcador-lista-chats';
import {
  crearMarcadorFilasContacto,
  crearMarcadorNuevoChat,
  crearMarcadorRemitentes,
} from '@/nucleo/difuminado/marcador-nombres';
import { combinarMarcadores, crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import {
  ENCABEZADO_CONVERSACION,
  FILA_CHAT,
  FILA_MENSAJE,
  MENSAJE,
  PANEL_CONVERSACION,
  TEXTO_ENCABEZADO,
} from '@/nucleo/difuminado/selectores';

export const ATRIBUTO_NOMBRE = 'data-veilix-nombre';
export const ATRIBUTO_REMITENTE = 'data-veilix-remitente';
export const ATRIBUTO_FILA_CONTACTO = 'data-veilix-fila-contacto';
export const ATRIBUTO_NOMBRE_CONTACTO = 'data-veilix-nombre-contacto';
export const ATRIBUTO_FILA_NUEVO_CHAT = 'data-veilix-fila-nuevo-chat';
export const ATRIBUTO_NOMBRE_NUEVO_CHAT = 'data-veilix-nombre-nuevo-chat';
export const ATRIBUTO_INFO_NUEVO_CHAT = 'data-veilix-info-nuevo-chat';

export const moduloDifuminarNombres = crearModuloDifuminado({
  id: 'difuminarNombres',
  sufijo: 'nombres',
  reglas: [
    { contenedor: FILA_CHAT, objetivo: `[${ATRIBUTO_NOMBRE}]`, revelarConFoco: true },
    { contenedor: ENCABEZADO_CONVERSACION, objetivo: TEXTO_ENCABEZADO, revelarConFoco: true },
    // Remitentes dentro de un mensaje: se revelan con el mensaje completo.
    { contenedor: `${FILA_MENSAJE}, ${MENSAJE}`, objetivo: `[${ATRIBUTO_REMITENTE}]`, revelarConFoco: true },
    // Remitentes fuera de los mensajes (por ejemplo, en avisos): el propio nombre delimita el revelado.
    { contenedor: `${PANEL_CONVERSACION} [${ATRIBUTO_REMITENTE}]`, objetivo: null, revelarConFoco: true },
    { contenedor: `[${ATRIBUTO_FILA_CONTACTO}]`, objetivo: `[${ATRIBUTO_NOMBRE_CONTACTO}]`, revelarConFoco: true },
    {
      contenedor: `[${ATRIBUTO_FILA_NUEVO_CHAT}]`,
      objetivo: `[${ATRIBUTO_NOMBRE_NUEVO_CHAT}], [${ATRIBUTO_INFO_NUEVO_CHAT}]`,
      revelarConFoco: true,
    },
  ],
  marcador: combinarMarcadores(
    crearMarcadorListaChats('nombre', ATRIBUTO_NOMBRE),
    crearMarcadorRemitentes(ATRIBUTO_REMITENTE),
    crearMarcadorFilasContacto(ATRIBUTO_FILA_CONTACTO, ATRIBUTO_NOMBRE_CONTACTO),
    crearMarcadorNuevoChat(ATRIBUTO_FILA_NUEVO_CHAT, ATRIBUTO_NOMBRE_NUEVO_CHAT, ATRIBUTO_INFO_NUEVO_CHAT),
  ),
});

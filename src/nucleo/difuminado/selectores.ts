/**
 * Selectores de la interfaz de WhatsApp Web.
 *
 * ADVERTENCIA: estos selectores NO se han verificado contra WhatsApp Web
 * real (la interfaz solo es accesible con una sesión iniciada y no puede
 * inspeccionarse desde el entorno de desarrollo). Son hipótesis basadas en
 * la estructura que WhatsApp Web ha mantenido de forma pública durante años
 * y deben validarse en un navegador real antes de considerar compatible
 * cada funcionalidad. Cualquier ajuste debe hacerse solo en este archivo.
 *
 * Criterios de selección:
 * - Identificadores estables de la aplicación (`#pane-side`, `#main`).
 * - Atributos semánticos y de accesibilidad (`role`, `contenteditable`,
 *   `title`, `dir`, `data-icon`).
 * - Clases semánticas no ofuscadas (`message-in`, `message-out`,
 *   `copyable-text`, `selectable-text`) solo como complemento.
 * - Nunca clases generadas dinámicamente (por ejemplo, `_ak8q` o `x1iyjqo2`).
 */

/** Panel lateral con la lista de conversaciones. */
export const PANEL_LISTA_CHATS = '#pane-side';

/** Fila de una conversación en la lista (versiones con `listitem` y con `row`). */
export const FILA_CHAT = `${PANEL_LISTA_CHATS} :is([role="listitem"], [role="row"])`;

/** Encabezado de la conversación abierta. */
export const ENCABEZADO_CONVERSACION = '#main header';

/** Burbuja de un mensaje entrante o saliente de la conversación abierta. */
export const MENSAJE = '#main :is(.message-in, .message-out)';

/** Contenido visible de un mensaje: texto, citas y elementos multimedia. */
export const CONTENIDO_MENSAJE =
  ':is(.copyable-text, .selectable-text, [data-pre-plain-text], img, video, canvas)';

/** Editor de mensajes de la conversación abierta. */
export const CAMPO_ENTRADA =
  '#main footer :is([contenteditable="true"], [contenteditable=""], [role="textbox"])';

/** Iconos funcionales de WhatsApp, que nunca se difuminan. */
export const ICONO = '[data-icon]';

/** Textos con nombre en el encabezado (nombre y subtítulo), excluidos los iconos. */
export const TEXTO_ENCABEZADO = ':is(span[dir="auto"], span[title]):not([data-icon], [data-icon] *)';

/** Fotografías de perfil o de grupo, excluidas las imágenes dentro de iconos. */
export const FOTOGRAFIA = 'img:not([data-icon] img)';

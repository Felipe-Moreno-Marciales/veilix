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

/**
 * Contenedor de un mensaje de la conversación abierta.
 *
 * CONFIRMADO con WhatsApp Web real en Chrome (diagnóstico del propietario
 * sobre 0.2.0-beta.3): dentro de `#main` existen
 * `[data-testid="msg-container"]` y no existen `.message-in` ni
 * `.message-out`. Estas clases se conservan solo como alternativa para
 * versiones anteriores de la interfaz.
 *
 * El contenedor NO se difumina entero: incluye controles (reacciones,
 * descarga, hora, indicadores de lectura) que deben seguir visibles.
 */
export const CONTENEDOR_MENSAJE = ':is([data-testid="msg-container"], .message-in, .message-out)';
export const MENSAJE = `#main ${CONTENEDOR_MENSAJE}`;

/**
 * Fila completa de un mensaje: el `[data-id]` de `#main` que contiene un
 * contenedor de mensaje. `[data-id]` está confirmado en el diagnóstico real
 * (4 elementos frente a 3 contenedores). Que sea el antecesor del contenedor
 * es una HIPÓTESIS. Se usa para delimitar el revelado y para encontrar
 * elementos del mensaje que estén fuera de `msg-container`, como las
 * reacciones.
 */
export const FILA_MENSAJE = `#main [data-id]:has(${CONTENEDOR_MENSAJE})`;

/**
 * Texto de un mensaje (recibido o enviado).
 * - `[data-pre-plain-text]`: bloque de texto del mensaje. En el diagnóstico
 *   real aparece tantas veces como contenedores de mensaje (3 y 3).
 * - `.selectable-text` fuera de ese bloque (HIPÓTESIS): texto de usuario sin
 *   bloque propio, como la descripción de una foto.
 * Se excluyen los iconos (`[data-icon]`).
 */
export const TEXTO_MENSAJE =
  ':is([data-pre-plain-text], .selectable-text:not([data-pre-plain-text] *)):not([data-icon], [data-icon] *)';

/**
 * Multimedia de un mensaje (HIPÓTESIS sobre el origen):
 * - `img[src^="blob:"]`: fotos, miniaturas de vídeo y stickers descifrados,
 *   que WhatsApp Web carga como `blob:`.
 * - `img[src^="data:image/jpeg"]`: miniatura de vista previa de una foto aún
 *   no descargada.
 * - `video`, `canvas` y fondos en línea con `blob:`.
 * No incluye emojis, avatares ni iconos, que usan otros orígenes o
 * `data-icon`. Así no se difuminan todas las `img` del mensaje.
 */
export const MULTIMEDIA_MENSAJE =
  ':is(img[src^="blob:"], img[src^="data:image/jpeg"], video, canvas, [style*="blob:"]):not([data-icon] *)';

/** Contenido visual de un mensaje que se difumina: texto y multimedia. */
export const CONTENIDO_MENSAJE = `${TEXTO_MENSAJE}, ${MULTIMEDIA_MENSAJE}`;

/** Editor de mensajes de la conversación abierta. */
export const CAMPO_ENTRADA =
  '#main footer :is([contenteditable="true"], [contenteditable=""], [role="textbox"])';

/**
 * Iconos funcionales de WhatsApp. Los marcadores los excluyen siempre. Las
 * reglas CSS solo difuminan iconos con selectores específicos, como
 * `ICONO_ESTADO_MENSAJE`.
 */
export const ICONO = '[data-icon]';

/**
 * Nombres de los iconos SVG de estado de mensaje. WhatsApp Web indica el
 * nombre de cada icono en un `<title>` interno del `<svg>` (por ejemplo,
 * `<svg><title>wds-ic-read</title>…</svg>`), no con `data-icon`.
 *
 * CONFIRMADO con WhatsApp Web real en Chrome (diagnósticos del propietario
 * sobre 0.2.0-beta.6):
 * - `wds-ic-read`: indicador de leído, en `#pane-side` y dentro de
 *   `[data-testid="msg-meta"]` en la conversación.
 *
 * SIN EVIDENCIA, y por tanto no incluidos: los nombres de los indicadores de
 * enviado, entregado y pendiente. Se añadirán cuando un diagnóstico los
 * muestre.
 *
 * Otros iconos observados que NO son de estado y nunca se difuminan:
 * `wds-ic-status`, `wds-ic-disappearing-messages`, `wds-ic-whatsapp` y
 * `wds-ic-sticker`.
 */
export const TITULOS_ICONO_ESTADO: readonly string[] = ['wds-ic-read'];

/**
 * Bloque de metadatos de un mensaje (hora e indicador de estado).
 * CONFIRMADO con WhatsApp Web real en Chrome.
 */
export const META_MENSAJE = '[data-testid="msg-meta"]';

/** Textos con nombre en el encabezado (nombre y subtítulo), excluidos los iconos. */
export const TEXTO_ENCABEZADO = ':is(span[dir="auto"], span[title]):not([data-icon], [data-icon] *)';

/**
 * Imágenes de las filas de la lista y del encabezado que se tratan como
 * fotografía. Se excluyen las imágenes dentro de iconos y las que forman
 * parte de un texto (por ejemplo, emojis en nombres o vistas previas).
 */
export const FOTOGRAFIA = 'img:not([data-icon] img, :is(span[title], span[dir]) img)';

/**
 * Origen de las fotos de perfil de contactos y grupos (HIPÓTESIS).
 * WhatsApp Web las sirve desde `pps.whatsapp.net`, y su ruta suele contener
 * `/t61.24694-24/`. Esto permite reconocer un avatar en cualquier zona de la
 * interfaz sin afectar a las imágenes de los mensajes, que usan otros
 * orígenes (`mmg.whatsapp.net` o `blob:`). Pendiente de validar.
 */
const ORIGENES_FOTO_PERFIL = ['pps.whatsapp.net', '/t61.24694-24/'] as const;

/**
 * Foto de perfil en cualquier parte de la interfaz, tanto como `<img>` como
 * con imagen de fondo en línea (`style="background-image: url(…)"`).
 */
export const FOTO_PERFIL = `:is(${ORIGENES_FOTO_PERFIL.flatMap((origen) => [
  `img[src*="${origen}"]`,
  `[style*="${origen}"]`,
]).join(', ')})`;

/**
 * Foto de perfil dentro de un SVG (`<image href="…">` o `xlink:href`), en
 * cualquier parte de la interfaz, reconocida por su origen (HIPÓTESIS sobre
 * el origen; ver `ORIGENES_FOTO_PERFIL`). Se difumina el `<svg>` completo.
 */
export const FOTO_PERFIL_SVG = `svg:not([data-icon] svg):has(${ORIGENES_FOTO_PERFIL.map(
  (origen) => `image[*|href*="${origen}"]`,
).join(', ')})`;

/**
 * Avatar dibujado como SVG. CONFIRMADO con WhatsApp Web real en Chrome
 * (diagnóstico anonimizado del propietario sobre la versión 0.2.0-beta.2):
 * en `#pane-side` cada avatar es un `<svg>` de unos 48 × 48 px con `<mask>`
 * y `<circle>`, que contiene una `<image>` (foto) o un `<foreignObject>`
 * (presumiblemente, avatar sin foto personalizada).
 *
 * Se exige la máscara y una `<image>` o un `<foreignObject>`, de modo que los
 * iconos SVG (que no tienen esa estructura) no se difuminan. Se excluyen los
 * SVG dentro de `[data-icon]`. Las etiquetas SVG distinguen mayúsculas:
 * `foreignObject` debe escribirse así.
 *
 * Se aplica en cualquier zona (desde 0.1.1-beta.0), no solo en la lista y en
 * el encabezado. En «Nuevo chat», las fotos (reconocidas por su origen) se
 * difuminaban, pero los avatares predeterminados no: ninguna regla global
 * cubría esta estructura. HIPÓTESIS pendiente de validar: que «Nuevo chat» y
 * otros paneles usen el mismo componente de avatar que la lista.
 */
export const AVATAR_SVG = 'svg:not([data-icon] svg):has(mask):has(image, foreignObject)';

/**
 * Bloque de texto de un mensaje con el remitente en `data-pre-plain-text`.
 * El atributo está CONFIRMADO en WhatsApp Web real. Su formato
 * («[hora, fecha] Nombre: ») es una HIPÓTESIS: el diagnóstico de mensajes la
 * comprueba con la marca `COINCIDE-CON-REMITENTE`.
 */
export const BLOQUE_CON_REMITENTE = '[data-pre-plain-text]';

/** Zona de la conversación abierta donde se buscan nombres de remitentes. */
export const PANEL_CONVERSACION = '#main';

/** Editor de texto, que nunca se trata como nombre (lo protege RF-05). */
export const EDITABLE = '[contenteditable]:not([contenteditable="false"])';

/**
 * Panel «Nuevo chat». CONFIRMADO con WhatsApp Web real en Chrome
 * (diagnóstico anonimizado del propietario sobre 0.1.1-beta.1):
 * `[data-testid="new-chat-drawer"]` > … `[data-testid="contact-list-key"]` >
 * `[role="listitem"][data-testid^="list-item-"]` > `[role="button"]` >
 * `[data-testid="cell-frame-container"]` > `[role="gridcell"]`. Las 18 filas
 * inspeccionadas contenían `span[dir][title]` y ninguna un avatar con la
 * estructura `AVATAR_SVG`.
 */
export const PANEL_NUEVO_CHAT = '[data-testid="new-chat-drawer"]';

/** Fila de un contacto en «Nuevo chat» (estructura confirmada). */
export const FILA_NUEVO_CHAT = `${PANEL_NUEVO_CHAT} [role="listitem"][data-testid^="list-item-"]`;

/**
 * Acciones de «Nuevo chat» que no son contactos. CONFIRMADO:
 * `new-chat-drawer-new-group-cell`, `new-chat-drawer-new-contact-cell` y
 * `new-chat-drawer-new-community-cell`.
 */
export const ACCION_NUEVO_CHAT = '[data-testid^="new-chat-drawer-new-"]';

/**
 * Celda de contenido de una fila de «Nuevo chat» (CONFIRMADO:
 * `[data-testid="cell-frame-container"]`). Dentro de ella está el texto del
 * contacto: el nombre y la información secundaria (descripción, frase de
 * estado…). La información secundaria se reconoce como cualquier texto
 * visible de la celda distinto del nombre, sin suponer sus atributos.
 */
export const CELDA_NUEVO_CHAT = '[data-testid="cell-frame-container"]';

/** Elementos que nunca se tratan como información secundaria (funcionales). */
export const NO_TEXTO_DE_CONTACTO = 'svg, [data-icon], input, textarea, select, [contenteditable]';

/**
 * Nombre dentro de una fila de «Nuevo chat»: el primer `span[dir][title]` sin
 * iconos, la misma regla validada en la lista de chats (que usa el mismo
 * componente de celda). Que sea el primero es la parte pendiente de
 * confirmar; el diagnóstico de paneles indica cuántos hay en cada fila.
 */
export const NOMBRE_NUEVO_CHAT = 'span[dir][title]';

/**
 * Fila candidata de una lista de contactos fuera de la lista de chats (por
 * ejemplo, «Nuevo chat», participantes de un grupo o reenvío). HIPÓTESIS
 * pendiente de validar: que esas filas usen los mismos roles que la lista de
 * chats. Solo se trata como fila de contacto si contiene exactamente un
 * avatar (`AVATAR_SVG`) y un `span[title]`; así no se alcanzan filas de
 * acciones ni de ajustes, que no tienen avatar.
 */
export const FILA_CONTACTO_CANDIDATA = ':is([role="listitem"], [role="row"], [role="button"])';

/**
 * Avatar predeterminado (contacto o grupo sin foto), dibujado con un icono
 * SVG (HIPÓTESIS: `data-icon` que empieza por `default-user`,
 * `default-group`, `default-contact` o `default-community`). No es un
 * control: se difumina igual que una foto para no revelar que el contacto
 * no tiene foto.
 */
export const AVATAR_PREDETERMINADO = ['default-user', 'default-group', 'default-contact', 'default-community']
  .map((prefijo) => `[data-icon^="${prefijo}"]`)
  .join(', ');

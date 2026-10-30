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
/**
 * Miniatura de un vídeo (CONFIRMADO, Chrome, diagnóstico real sobre
 * 0.1.2-beta.6): dentro de `msg-container`, el vídeo está en
 * `[data-testid="video-content"]` y su miniatura son dos capas `div` con un
 * fondo en línea `data:image/jpeg`. Una trae `filter: blur(8px)` de WhatsApp y
 * la otra, sin filtro, muestra la miniatura nítida. Ninguna es `img`, `video`
 * ni `canvas`, por eso `MULTIMEDIA_MENSAJE` no las alcanzaba.
 *
 * SIN CONFIRMAR: si las capas son hermanas o la nítida contiene a la otra (no
 * puede estar dentro de la desenfocada, porque se ve nítida). Por eso se
 * difumina solo la capa más externa de cada miniatura. Si son hermanas, cada
 * una recibe su filtro. Si están anidadas, la interior queda difuminada con la
 * exterior, con un solo filtro de Veilix.
 */
export const CONTENIDO_VIDEO = '[data-testid="video-content"]';
const CAPA_MINIATURA_VIDEO = `${CONTENIDO_VIDEO} [style*="data:image/jpeg"]`;
export const MINIATURA_VIDEO = `[data-testid="msg-container"] ${CAPA_MINIATURA_VIDEO}:not(${CAPA_MINIATURA_VIDEO} *)`;

/**
 * Miniatura de una cita dentro de un mensaje (CONFIRMADO, Chrome, diagnóstico
 * real sobre 0.1.2-beta.9): en `msg-container` › `[data-testid="quoted-message"]`,
 * la miniatura de 58 × 58 px es un `div` con un fondo en línea
 * `data:image/jpeg`, junto a un encabezado `span[dir="auto"]`, un texto con
 * forma de duración y el texto citado (`selectable-text`, ya difuminado).
 * Por las longitudes del texto anonimizado y la captura del propietario, es
 * muy probablemente una respuesta a un estado de vídeo («Tú · Estados»,
 * «0:18»), pero el diagnóstico no lo confirma.
 *
 * Se difumina la capa más externa con ese fondo, nunca la cita entera. No se
 * elige un fondo que contenga el texto citado, el encabezado, botones o
 * `[role="button"]`: eso no sería la miniatura sino un contenedor mayor.
 * SIN CONFIRMAR: si la duración o el indicador de vídeo están dentro de la
 * miniatura (entonces se difuminan con ella) o fuera (siguen visibles).
 */
const CAPA_MINIATURA_CITA = '[data-testid="quoted-message"] [style*="data:image/jpeg"]';
export const MINIATURA_CITA = [
  `[data-testid="msg-container"] ${CAPA_MINIATURA_CITA}`,
  `:not(${CAPA_MINIATURA_CITA} *)`,
  `:not(:where(${CAPA_MINIATURA_VIDEO}, ${CAPA_MINIATURA_VIDEO} *))`,
  ':not(:has([data-testid="selectable-text"], .selectable-text, span[dir="auto"], button, [role="button"]))',
].join('');

/**
 * Multimedia de un mensaje. Excluye lo que esté dentro de una miniatura de
 * vídeo o de una cita, que ya se difuminan enteras (`MINIATURA_VIDEO` y
 * `MINIATURA_CITA`), para no superponer dos filtros.
 */
export const MULTIMEDIA_MENSAJE =
  `:is(img[src^="blob:"], img[src^="data:image/jpeg"], video, canvas, [style*="blob:"]):not([data-icon] *):not(:where(${CAPA_MINIATURA_VIDEO}, ${CAPA_MINIATURA_CITA}) *)`;

/**
 * Datos de un documento adjunto (CONFIRMADO, Chrome, diagnóstico real sobre
 * 0.1.2-beta.7, con imágenes enviadas como documento PNG y JPG): la tarjeta es
 * `[data-testid="document-thumb"][role="button"]` dentro de `msg-container`, y
 * dentro de ella el nombre está en un `span[dir="auto"]`, el formato en
 * `[data-testid="type"]` y el tamaño en un `span[title]`. La descripción del
 * adjunto ya la cubre `TEXTO_MENSAJE`.
 *
 * La tarjeta no se difumina entera, porque es el control que abre o descarga
 * el archivo. Solo se difuminan esos datos, con estas salvaguardas:
 * - el más externo de cada grupo anidado, para no superponer filtros;
 * - nunca lo que ya cubre `TEXTO_MENSAJE`;
 * - nunca un elemento con iconos o imágenes, ni los controles (`button`,
 *   `[role="button"]`) que haya dentro de la tarjeta.
 *
 * SIN CONFIRMAR: si otros formatos (PDF, DOCX…) usan la misma tarjeta.
 */
export const DOCUMENTO = '[data-testid="document-thumb"]';
const CAMPO_DOCUMENTO = `${DOCUMENTO} :is(span[dir="auto"], [data-testid="type"], span[title])`;
export const DATOS_DOCUMENTO = [
  `[data-testid="msg-container"] ${CAMPO_DOCUMENTO}`,
  `:not(${CAMPO_DOCUMENTO} *)`,
  `:not(:where(${TEXTO_MENSAJE}, ${TEXTO_MENSAJE} *))`,
  ':not(:has(svg, img, canvas, video, [data-icon]))',
  `:not(:where(${DOCUMENTO} :is(button, [role="button"]), ${DOCUMENTO} :is(button, [role="button"]) *))`,
].join('');

/**
 * Etiqueta de la extensión en el icono de un documento (CONFIRMADO, Chrome,
 * diagnóstico real sobre 0.1.2-beta.7 con PNG y JPG): dentro de la tarjeta, el
 * icono es un elemento con `data-icon="document-PNG-icon"` (o `-JPG-`), con
 * su SVG, y la etiqueta es un `div` hermano suyo, en el mismo contenedor.
 *
 * Se difumina solo ese `div`, en cualquier orden respecto al icono, sin
 * depender de la extensión. El icono y su SVG siguen nítidos. Salvaguardas:
 * nunca un hermano que contenga iconos, imágenes, botones o los datos de
 * `DATOS_DOCUMENTO`, para no difuminar otra parte de la tarjeta ni superponer
 * filtros.
 */
/**
 * Contenedor de la duración de una cita dentro de un mensaje (CONFIRMADO,
 * Chrome, diagnóstico real sobre 0.1.2-beta.10, en una respuesta a un
 * estado): dentro de `quoted-message`, un `div[role="button"]` con, en orden,
 * `[data-testid="chat-msg-symbol"]` (un icono SVG), la duración como nodo de
 * texto directo («0:18») y el texto citado. El encabezado y la miniatura
 * están fuera.
 *
 * CSS no puede seleccionar un nodo de texto suelto, así que este selector
 * solo acota los candidatos: el marcador de mensajes comprueba que su texto
 * directo tenga forma de duración y lo marca, y se difumina el contenedor
 * entero, icono incluido. Salvaguardas: nunca un contenedor con un autor, un
 * encabezado (`span[dir="auto"]` que no sea el texto citado), una miniatura,
 * botones u otra cita.
 */
const TEXTO_CITADO = '[data-testid="selectable-text"], .selectable-text';
export const CANDIDATO_DURACION_CITA = [
  '[data-testid="msg-container"] [data-testid="quoted-message"] :has(> [data-testid="chat-msg-symbol"])',
  `:not(:has([data-testid="author"], span[dir="auto"]:not(${TEXTO_CITADO}), [style*="data:image/jpeg"], button, [role="button"], [data-testid="quoted-message"]))`,
].join('');

/**
 * Encabezado de un estado citado («Tú · Estados»; CONFIRMADO, Chrome,
 * diagnósticos reales sobre 0.1.2-beta.9 y 0.1.2-beta.10): dentro de
 * `quoted-message`, un `div[role=""]` › `span[dir="auto"]`, en una cita sin
 * `[data-testid="author"]`.
 *
 * Este selector solo acota los candidatos por estructura. Una cita
 * convencional podría compartirla (la de un mensaje propio no se ha
 * observado), así que el marcador de mensajes exige además que el texto
 * completo tenga la forma «… · Estados» (o «… · Estado», «… · Status»), y solo
 * entonces lo marca. El texto citado nunca es candidato.
 */
export const CANDIDATO_ENCABEZADO_ESTADO = [
  '[data-testid="msg-container"] [data-testid="quoted-message"]:not(:has([data-testid="author"])) [role=""] > span[dir="auto"]',
  `:not(${TEXTO_CITADO})`,
].join('');

const ICONO_DOCUMENTO = '[data-icon^="document-"][data-icon$="-icon"]';
export const ETIQUETA_ICONO_DOCUMENTO = [
  `[data-testid="msg-container"] ${DOCUMENTO} :has(> ${ICONO_DOCUMENTO}) > div`,
  `:not(${ICONO_DOCUMENTO})`,
  ':not(:has(svg, img, canvas, video, [data-icon], button, [role="button"], span[dir="auto"], [data-testid="type"], span[title]))',
].join('');

/** Contenido visual de un mensaje que se difumina: texto, multimedia, miniaturas de vídeo y de citas, y datos de documentos. */
export const CONTENIDO_MENSAJE = `${TEXTO_MENSAJE}, ${MULTIMEDIA_MENSAJE}, ${MINIATURA_VIDEO}, ${DATOS_DOCUMENTO}, ${ETIQUETA_ICONO_DOCUMENTO}, ${MINIATURA_CITA}`;

/**
 * Pantalla «Info. del mensaje». CONFIRMADO con WhatsApp Web real en Chrome
 * (diagnóstico de «Info. del mensaje» sobre 0.1.2-beta.3): se abre fuera de
 * `#main`, en `[data-testid="drawer-right"]`, con una copia del mensaje en
 * `[data-testid="msg-container"]` (texto en `[data-testid="selectable-text"]`
 * y metadatos en `[data-testid="msg-meta"]`) y los estados de entrega y
 * lectura en `[data-testid="kept-by-info"]`. Ese bloque de estados distingue
 * esta pantalla de otros paneles laterales derechos, que quedan fuera.
 */
export const INFO_MENSAJE = '[data-testid="drawer-right"]:has([data-testid="kept-by-info"])';

/** Copia del mensaje en «Info. del mensaje» (CONFIRMADO). */
export const MENSAJE_INFO = `${INFO_MENSAJE} [data-testid="msg-container"]`;

/**
 * Texto del mensaje en «Info. del mensaje» (CONFIRMADO): el
 * `[data-testid="selectable-text"]` más externo, sin los metadatos (hora e
 * indicadores) ni el autor, que corresponde a RF-01.
 */
export const TEXTO_MENSAJE_INFO =
  '[data-testid="selectable-text"]:not([data-testid="selectable-text"] *, [data-testid="msg-meta"] *, [data-testid="author"], [data-testid="author"] *)';

/**
 * Elementos visuales de un sticker en «Info. del mensaje». CONFIRMADO con
 * WhatsApp Web real en Chrome (diagnóstico de «Info. del mensaje» sobre
 * 0.1.2-beta.4): la copia del mensaje contiene
 * `[data-testid="sticker-container"]`, con un `div[role="button"][tabindex="0"]`,
 * un `canvas` visible (190 × 190 px) y un `img` auxiliar de origen `blob:`
 * (0 × 0 px). En la conversación, el mismo sticker usa una estructura
 * equivalente. Se difuminan solo esos nodos visuales, no el contenedor, que
 * es pulsable. Las fotos y los vídeos de esta pantalla no están observados y
 * no tienen selector.
 */
export const VISUAL_STICKER_INFO = '[data-testid="sticker-container"] :is(img[src^="blob:"], canvas)';

/** Editor de mensajes de la conversación abierta. */
export const CAMPO_ENTRADA =
  '#main footer :is([contenteditable="true"], [contenteditable=""], [role="textbox"])';

/**
 * Recuadro «Responder»: vista previa del mensaje citado encima del editor.
 * CONFIRMADO con WhatsApp Web real en Chrome (diagnóstico anonimizado del
 * propietario sobre 0.1.1, con una respuesta a un mensaje de texto):
 * `#main` › `footer` › `[data-testid="popup_panel"]` ›
 * `[data-testid="quoted-message"]`, que contiene el autor
 * (`[data-testid="author"]`) y el texto citado.
 *
 * Se limita a `#main footer` para no tocar las citas dentro de los mensajes,
 * que ya cubre `TEXTO_MENSAJE` desde su fila. La estructura de las fotos y
 * los vídeos citados no se ha observado, así que no hay selector para ellos.
 */
export const CITA_RESPUESTA = '#main footer [data-testid="quoted-message"]';

/**
 * Texto citado en el recuadro «Responder». CONFIRMADO:
 * `span.quoted-mention.selectable-text.copyable-text[data-testid="selectable-text"]`.
 * Se usa el `data-testid`, no las clases. Excluye el autor, que corresponde a
 * RF-01, para que RF-01 y RF-04 sigan siendo independientes.
 */
export const TEXTO_CITA_RESPUESTA =
  '[data-testid="selectable-text"]:not([data-testid="author"], [data-testid="author"] *)';

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

/**
 * Nombre del autor de un mensaje. CONFIRMADO con WhatsApp Web real en Chrome
 * (diagnóstico anonimizado de remitentes del propietario sobre 0.1.2-beta.0):
 * dentro de `[data-testid="msg-container"]`, como `span[data-testid="author"]`
 * o `span[role="button"][data-testid="author"]`, a veces anidados. Aparece
 * también cuando el nombre visible no coincide con `data-pre-plain-text`
 * (participantes no guardados, «~ Nombre») y en mensajes sin ese bloque
 * (multimedia sin descripción). El recuadro «Responder» usa el mismo atributo
 * (CONFIRMADO en 0.1.1).
 */
export const AUTOR = '[data-testid="author"]';

/**
 * Lista de mensajes de la conversación abierta. CONFIRMADO con WhatsApp Web
 * real en Chrome (diagnóstico de avatares en grupos sobre 0.1.2-beta.2).
 */
export const PANEL_MENSAJES = '[data-testid="conversation-panel-messages"]';

/**
 * Avatar de un participante junto a los mensajes de un grupo. CONFIRMADO con
 * WhatsApp Web real en Chrome (diagnóstico de avatares en grupos sobre
 * 0.1.2-beta.2): `[data-testid="group-chat-profile-picture"]` dentro de
 * `PANEL_MENSAJES`. Contiene la foto (`img` de `pps.whatsapp.net`, unos
 * 28 × 28 px) o un círculo de color de unos 28 × 28 px con la inicial
 * (`[data-testid="profile-first-initial"]`). HIPÓTESIS sin confirmar: que el
 * avatar con silueta predeterminada use el mismo contenedor.
 *
 * Se difumina el contenedor más externo como una sola unidad (foto, o
 * círculo e inicial), sin depender de colores, letras ni del contenido.
 */
export const AVATAR_PARTICIPANTE = `${PANEL_CONVERSACION} ${PANEL_MENSAJES} [data-testid="group-chat-profile-picture"]:not([data-testid="group-chat-profile-picture"] *)`;

/** Solo el `author` más externo, para no aplicar dos filtros a la misma información. */
export const AUTOR_EXTERNO = `${AUTOR}:not(${AUTOR} *)`;

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

/**
 * Celda de contenido de la fila «Tú» de «Nuevo chat», en lugar de
 * `cell-frame-container`. CONFIRMADO (diagnóstico de paneles sobre
 * 0.1.2-beta.1): `[role="button"]` › `[data-testid="message-yourself-row"]`,
 * con la misma columna de avatar y de texto que los demás contactos.
 */
export const CELDA_TU_NUEVO_CHAT = '[data-testid="message-yourself-row"]';

/**
 * Fila de una persona en «Nuevo chat» (contacto o «Tú»): cualquier fila
 * `list-item-*` del panel salvo las que contienen una acción. Los
 * encabezados de sección quedan fuera porque no tienen celda de contacto.
 */
export const FILA_PERSONA_NUEVO_CHAT = `${FILA_NUEVO_CHAT}:not(:has(${ACCION_NUEVO_CHAT}))`;

/**
 * Columna del avatar dentro de la celda de una fila de «Nuevo chat».
 * CONFIRMADO con WhatsApp Web real en Chrome (diagnóstico de paneles sobre
 * 0.1.2-beta.1, 17 contactos y la fila «Tú»): la celda tiene como hijos
 * directos una columna de avatar (77 × 72 px) y una de texto. La del avatar
 * contiene el círculo (49 × 49 px) con la foto (`img` de `pps.whatsapp.net`)
 * o, sin foto, un `svg` con `path` sobre un fondo de color. La de texto
 * contiene `[role="gridcell"]`, `cell-frame-title` y `cell-frame-secondary`.
 *
 * Se reconoce como el hijo directo de la celda que contiene una imagen o un
 * SVG y ningún texto de la fila ni control. No depende del `<title>` del SVG
 * (no confirmado), de clases, colores, tamaños ni de la profundidad interna.
 * Se difumina la columna entera: el SVG y su fondo circular, o la foto, como
 * una sola unidad.
 */
export const AVATAR_NUEVO_CHAT = `:is(${CELDA_NUEVO_CHAT}, ${CELDA_TU_NUEVO_CHAT}) > :not(:has([role="gridcell"], [data-testid="cell-frame-title"], [data-testid="cell-frame-secondary"], button, [role="button"], input)):has(img, svg)`;

/** Columna del avatar de las filas de persona de «Nuevo chat», con su ámbito completo. */
export const AVATAR_EN_FILA_NUEVO_CHAT = `${FILA_PERSONA_NUEVO_CHAT} ${AVATAR_NUEVO_CHAT}`;

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

/**
 * Panel «Info. del contacto» (CONFIRMADO, Chrome, diagnóstico real sobre
 * 0.1.2-beta.12, un contacto guardado de una cuenta de empresa):
 * `[data-testid="drawer-right"]` › … › `[data-testid="chat-info-drawer"]`.
 * `contact-info-header` solo contiene el título genérico, no el nombre.
 */
export const INFO_CONTACTO = '[data-testid="drawer-right"] [data-testid="chat-info-drawer"]';

/**
 * Nombre del contacto en el panel: `span[data-testid="contact-info-subtitle
 * selectable-text"]` (CONFIRMADO). El `data-testid` tiene dos palabras, por
 * eso se selecciona por palabra (`~=`).
 */
export const NOMBRE_INFO_CONTACTO = `${INFO_CONTACTO} [data-testid~="contact-info-subtitle"]`;

/**
 * Nombre de usuario (CONFIRMADO): en el bloque de perfil, el `div` hermano del
 * que contiene el nombre tiene como hijo directo un
 * `span[data-testid="selectable-text"][dir="auto"]` con el valor. Se elige por
 * esa relación, no porque el texto empiece por «@».
 */
export const USUARIO_INFO_CONTACTO = [
  `${INFO_CONTACTO} div:has(> div [data-testid~="contact-info-subtitle"])`,
  ' > div:not(:has([data-testid~="contact-info-subtitle"]))',
  ' > span[data-testid="selectable-text"][dir="auto"]',
].join('');

/**
 * Valores del teléfono y de la descripción (CONFIRMADO): `section-phone-number`
 * y `section-about` contienen solo la etiqueta («Número de teléfono»,
 * «Info.»); el valor está en el `div` hermano siguiente. La descripción
 * incluye sus emojis como `img` dentro del mismo texto.
 */
export const VALOR_INFO_CONTACTO = ['section-phone-number', 'section-about']
  .map((seccion) => `${INFO_CONTACTO} [data-testid="${seccion}"] + div`)
  .join(', ');

/**
 * Texto de un valor del panel: el `span` más externo del valor (un solo
 * filtro, que cubre también los emojis), nunca dentro de un botón.
 */
export const TEXTO_VALOR_INFO_CONTACTO = [
  'span',
  `:not(:is(${VALOR_INFO_CONTACTO}) span span)`,
  `:not(:is(${VALOR_INFO_CONTACTO}) :is(button, [role="button"]), :is(${VALOR_INFO_CONTACTO}) :is(button, [role="button"]) *)`,
].join('');

/**
 * Panel flotante de una llamada en curso (CONFIRMADO, Chrome, diagnóstico real
 * sobre 0.1.2, llamada de voz): en la ventana principal, fuera de `#main`, en
 * `[data-testid="move_resize_component"]` › `[data-testid="voip-container-audio-call"]`.
 * Contiene el nombre (`voip-call-participant-info-name`, con un `span[dir="auto"]`),
 * el estado (`voip-call-participant-info-call-state-text`) y la duración
 * (`[data-testid="voip-call-timer"][role="timer"]`). Los controles están en una
 * barra aparte, y el avatar ya lo difumina RF-02. Los `data-testid` son propios
 * de las llamadas; no se acotan a `voip-container-audio-call` para no excluir
 * variantes no observadas (vídeo, entrante). Nunca se difumina el panel entero.
 */
export const NOMBRE_LLAMADA = '[data-testid="voip-call-participant-info-name"]';
/** Texto del nombre: el `span[dir="auto"]` más externo o, si no lo hay, el propio contenedor. */
export const TEXTO_NOMBRE_LLAMADA = 'span[dir="auto"]:not(span[dir="auto"] span[dir="auto"])';
const SIN_CONTROLES = ':not(:has(button, [role="button"]))';
/** Estado y duración de la llamada (RF-04), salvo que contengan algún control. */
export const DATOS_PANEL_LLAMADA = `:is([data-testid="voip-call-participant-info-call-state-text"], [data-testid="voip-call-timer"])${SIN_CONTROLES}`;

/**
 * Tarjeta de una llamada en la conversación (CONFIRMADO, Chrome, diagnóstico
 * real sobre 0.1.2): dentro de `msg-container`, una tarjeta interactiva con
 * `[data-testid="call-log-system-message"]`, que contiene el icono
 * (`call-log-icon-chip`), un `div` con el título («Llamada»), un `span` con el
 * estado o la duración y `msg-meta`. Se difuminan sus elementos de texto finales
 * (sin hijos), en cualquier idioma, sin el icono, sin `msg-meta` (su hora ya
 * tiene su propio filtro) y sin controles. La tarjeta no se difumina entera.
 */
const REGISTRO_LLAMADA = '[data-testid="call-log-system-message"]';
export const TEXTO_REGISTRO_LLAMADA = [
  `[data-testid="msg-container"] ${REGISTRO_LLAMADA} :is(div, span)`,
  ':not(:has(*))',
  ':not(button, [role="button"])',
  `:not(:where(${REGISTRO_LLAMADA} :is([data-testid="call-log-icon-chip"], [data-testid="msg-meta"])) *)`,
  ':not([data-testid="call-log-icon-chip"], [data-testid="msg-meta"])',
].join('');


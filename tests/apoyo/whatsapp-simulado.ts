/**
 * DOM simulado de WhatsApp Web para las pruebas.
 *
 * Reproduce la estructura que suponen los selectores de
 * `src/nucleo/difuminado/selectores.ts` (identificadores, roles y atributos
 * semánticos). Es una HIPÓTESIS: que las pruebas pasen con este DOM no
 * demuestra compatibilidad con WhatsApp Web real.
 *
 * Se construye con la API del DOM (sin `innerHTML`).
 */

const FOTO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23888"/%3E%3C/svg%3E';

/**
 * Direcciones simuladas de fotos de perfil y de multimedia de mensajes. Usan
 * el dominio reservado `.invalid` (RFC 6761): contienen los patrones que
 * buscan los selectores, pero nunca generan peticiones a WhatsApp.
 */
export const URL_FOTO_PERFIL = 'https://pps.whatsapp.net.invalid/v/t61.24694-24/12345_n.jpg?ccb=prueba';
export const URL_MULTIMEDIA_MENSAJE = 'https://mmg.whatsapp.net.invalid/v/t62.7118-24/foto.enc';

/**
 * Representaciones de avatar contempladas (hipótesis):
 * - `imagen`: `<img>` con cualquier origen, ubicada en una fila o encabezado.
 * - `fotoPerfil`: `<img>` servida desde el origen de fotos de perfil.
 * - `fondo`: `<div>` con la foto de perfil como imagen de fondo en línea.
 * - `predeterminadoContacto` / `predeterminadoGrupo`: icono SVG sin foto.
 * - `svgImagen` / `svgForeignObject`: `<svg>` de 48 × 48 con `<mask>` y
 *   `<circle>` que contiene una `<image>` o un `<foreignObject>`. Es la
 *   estructura observada en `#pane-side` con WhatsApp Web real (diagnóstico
 *   anonimizado, Chrome, 0.2.0-beta.2). El contenido interno del
 *   `<foreignObject>` es una suposición.
 */
export type TipoAvatar =
  | 'svgImagen'
  | 'svgForeignObject'
  | 'imagen'
  | 'fotoPerfil'
  | 'fondo'
  | 'predeterminadoContacto'
  | 'predeterminadoGrupo';

type Hijo = Node | string;

function el(
  documento: Document,
  etiqueta: string,
  atributos: Record<string, string> = {},
  ...hijos: Hijo[]
): HTMLElement {
  const elemento = documento.createElement(etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
  elemento.append(...hijos);
  return elemento;
}

function requerir<T>(valor: T | null | undefined, descripcion: string): T {
  if (valor === null || valor === undefined) throw new Error(`No se encontró: ${descripcion}`);
  return valor;
}

const SVG = 'http://www.w3.org/2000/svg';
let contadorMascaras = 0;

function svgEl(documento: Document, etiqueta: string, atributos: Record<string, string> = {}, ...hijos: Node[]): SVGElement {
  const elemento = documento.createElementNS(SVG, etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
  elemento.append(...hijos);
  return elemento;
}

/** `<svg>` de 48 × 48 con máscara circular y el contenido indicado. */
export function crearSvgConMascara(documento: Document, contenido: Node | null): SVGElement {
  const id = `mascara-prueba-${String(++contadorMascaras)}`;
  return svgEl(
    documento,
    'svg',
    { width: '48', height: '48', viewBox: '0 0 48 48' },
    svgEl(documento, 'defs', {}, svgEl(documento, 'mask', { id }, svgEl(documento, 'circle', { cx: '24', cy: '24', r: '24', fill: 'white' }))),
    svgEl(documento, 'g', { mask: `url(#${id})` }, ...(contenido ? [contenido] : [svgEl(documento, 'circle', { cx: '24', cy: '24', r: '20', fill: 'green' })])),
  );
}

/** `<image>` SVG con la foto de perfil simulada. */
export function crearImagenSvg(documento: Document): SVGElement {
  return svgEl(documento, 'image', { href: URL_FOTO_PERFIL, width: '48', height: '48', preserveAspectRatio: 'xMidYMid slice' });
}

/** `<foreignObject>` con un contenido HTML genérico (avatar sin foto). */
export function crearForeignObject(documento: Document): SVGElement {
  const relleno = documento.createElement('div');
  relleno.style.cssText = 'width:48px;height:48px;background:#9aa';
  return svgEl(documento, 'foreignObject', { width: '48', height: '48' }, relleno);
}

function icono(documento: Document, nombre: string): HTMLElement {
  const svg = documento.createElementNS('http://www.w3.org/2000/svg', 'svg');
  return el(documento, 'span', { 'data-icon': nombre, 'aria-hidden': 'true' }, svg);
}

/**
 * Icono SVG con su nombre en un `<title>` interno, como en WhatsApp Web real
 * (CONFIRMADO en Chrome: `<svg><title>wds-ic-read</title>…</svg>`).
 */
export function iconoSvg(documento: Document, nombre: string): SVGElement {
  const svg = documento.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  const titulo = documento.createElementNS('http://www.w3.org/2000/svg', 'title');
  titulo.textContent = nombre;
  const trazo = documento.createElementNS('http://www.w3.org/2000/svg', 'path');
  trazo.setAttribute('d', 'M2 8l4 4 8-8');
  svg.append(titulo, trazo);
  return svg;
}

/**
 * Indicador de leído confirmado: `wds-ic-read`, dentro de un elemento con
 * `aria-label=" Leído "` (confirmado en la conversación; en la lista, la
 * envoltura es una suposición). El `<svg>` lleva `data-prueba="estado"`.
 */
export function iconoLeido(documento: Document): HTMLElement {
  const svg = iconoSvg(documento, 'wds-ic-read');
  svg.setAttribute('data-prueba', 'estado');
  return el(documento, 'span', { 'aria-label': ' Leído ' }, svg);
}

export interface Chat {
  readonly nombre: string;
  readonly vistaPrevia: string;
  readonly hora?: string;
  readonly noLeidos?: number;
  readonly avatar?: TipoAvatar;
  /** Añade un emoji como `<img>` dentro del nombre. */
  readonly emojiEnNombre?: boolean;
  /** El último mensaje es propio y está leído: `wds-ic-read` junto a la vista previa. */
  readonly leido?: boolean;
  /** Último mensaje de tipo sticker: `wds-ic-sticker` junto a la vista previa. */
  readonly sticker?: boolean;
  /** Chat con mensajes temporales: `wds-ic-disappearing-messages` en la línea del nombre. */
  readonly temporal?: boolean;
  /** Caso negativo: un `wds-ic-read` en la línea del nombre, no asociado a la vista previa. */
  readonly leidoEnLineaDelNombre?: boolean;
  /**
   * Vista previa especial (estructura SUPUESTA, compatible con lo observado en
   * Chrome: el texto de la reacción y el icono de foto quedaban visibles):
   * - `reaccion`: «reaccionó con 👌 a: “texto”», con el emoji como `<img>`.
   * - `imagen`: icono de foto (`<svg><title>`) y «Foto».
   * - `reaccionImagen`: «reaccionó con 👌 a:», icono de foto y «Foto».
   * El texto y los iconos están dentro del mismo `span` de vista previa.
   */
  readonly vistaPreviaEspecial?: 'reaccion' | 'imagen' | 'reaccionImagen';
  /** Añade el icono de chat fijado, que nunca debe difuminarse. */
  readonly fijado?: boolean;
}

/** Origen `blob:` simulado de una foto descifrada (no genera peticiones). */
export const URL_BLOB_MENSAJE = 'blob:https://web.whatsapp.com/00000000-0000-4000-8000-000000000000';
/** Miniatura de vista previa simulada (JPEG en `data:`). */
export const URL_MINIATURA_MENSAJE = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';
/** Emoji de una reacción (PNG en `data:`). */
const URL_EMOJI = FOTO;

/**
 * Mensaje con la estructura observada en WhatsApp Web real (Chrome,
 * diagnóstico del propietario sobre 0.2.0-beta.3): sin `.message-in` ni
 * `.message-out`, con `[data-id]`, `[data-testid="msg-container"]` y un
 * bloque `[data-pre-plain-text]` con clase `copyable-text`.
 *
 * SUPOSICIONES no observadas: la posición de la hora, los indicadores de
 * lectura, los botones, el nombre del remitente en grupos, la descripción
 * de las fotos (`.selectable-text` sin `[data-pre-plain-text]`) y el uso de
 * `blob:` para la multimedia.
 */
export interface MensajeObservado {
  readonly tipo: 'texto' | 'foto' | 'fotoConDescripcion' | 'fotoSinDescargar' | 'video' | 'videoMiniatura' | 'documento' | 'llamada';
  /**
   * Tarjeta de llamada (`tipo: 'llamada'`). OBSERVADA en WhatsApp Web real
   * (diagnóstico sobre 0.1.2): una tarjeta interactiva con
   * `[data-testid="call-log-system-message"]`, que contiene el icono
   * (`call-log-icon-chip`), un `div` con el título, un `span` con el estado o
   * la duración y `msg-meta`. SUPUESTOS: el anidamiento intermedio y que la
   * tarjeta interactiva sea un `div[role="button"]`.
   */
  readonly llamada?: { readonly titulo: string; readonly detalle: string };
  /**
   * Documento adjunto (`tipo: 'documento'`). OBSERVADO en WhatsApp Web real
   * (diagnóstico sobre 0.1.2-beta.7, imágenes PNG y JPG enviadas como
   * documento): `[data-testid="document-thumb"][role="button"]` dentro de
   * `msg-container`, con el nombre en `span[dir="auto"]`, el formato en
   * `[data-testid="type"]` y el tamaño en `span[title]`; la descripción, aparte,
   * en `.selectable-text`. El icono es un elemento con
   * `data-icon="document-<FORMATO>-icon"` y su SVG, con la etiqueta de la
   * extensión en un `div` hermano (OBSERVADO). SUPUESTOS: el orden de esos dos
   * hermanos (`etiquetaAntes`), el resto del anidamiento interno, el `title`
   * de la tarjeta, el separador y el botón de descarga dentro de la tarjeta,
   * con un `span[title]` y un icono.
   */
  readonly documento?: {
    readonly nombre: string;
    readonly formato: string;
    readonly tamano: string;
    readonly descripcion?: string;
    readonly etiquetaAntes?: boolean;
  };
  /**
   * Vídeo con miniatura (`tipo: 'videoMiniatura'`). OBSERVADO en WhatsApp Web
   * real (diagnóstico sobre 0.1.2-beta.6): `[data-testid="video-content"]` con
   * dos capas `div` con fondo en línea `data:image/jpeg`, una con
   * `filter: blur(8px)` y otra sin filtro; vertical (256 × 354) u horizontal
   * (346 × 200). SUPUESTOS: la relación entre las capas (`hermanas`, por
   * defecto, o `anidadas`, con la desenfocada dentro de la nítida), que el
   * filtro de 8 px esté en línea, y la posición del botón de reproducir y de
   * la duración (junto a las capas, dentro de `video-content`).
   */
  readonly miniaturaVideo?: { readonly orientacion: 'vertical' | 'horizontal'; readonly capas?: 'hermanas' | 'anidadas' };
  readonly direccion: 'entrante' | 'saliente';
  readonly texto?: string;
  /** Nombre del remitente (mensajes entrantes en grupos), tal como figura en `data-pre-plain-text`. */
  readonly remitente?: string;
  /** Texto visible del remitente si difiere (por ejemplo, «~ Luis» en un contacto no guardado). */
  readonly remitenteVisible?: string;
  /** Emoji del nombre, mostrado como `<img alt>` junto al remitente visible. */
  readonly emojiRemitente?: string;
  /**
   * Elemento que muestra el nombre del remitente:
   * - sin indicar: `span[dir=auto]` con color (estructura SUPUESTA, anterior a 0.1.2-beta.1);
   * - `span` o `boton`: `span[data-testid="author"]` o
   *   `span[role="button"][data-testid="author"]` (OBSERVADAS en WhatsApp Web real);
   * - `anidado`: `span[role="button"][data-testid="author"]` › `span[data-testid="author"]`.
   *   El anidamiento está OBSERVADO; el orden es SUPUESTO, por eso existe también
   * - `anidadoInverso`: el orden contrario.
   */
  readonly autor?: 'span' | 'boton' | 'anidado' | 'anidadoInverso';
  /**
   * Etiqueta de miembro («Member Tag») junto al autor.
   *
   * OBSERVADO en WhatsApp Web real (Chrome, diagnósticos e inspección sobre
   * 0.1.4-beta.0): un `span` con `class` y `style`, único texto e hijo de un
   * `div[role="button"][tabindex="0"]`, en la rama hermana inmediatamente
   * posterior a la que contiene al autor, separada del cuerpo.
   *
   * SUPUESTO: los `div` intermedios y que la cabecera (la rama del autor y la de
   * la etiqueta) sea un `div` propio dentro de `msg-container`.
   */
  readonly etiquetaMiembro?: string;
  /**
   * Avatar del remitente junto al mensaje, en `[data-testid="group-chat-profile-picture"]`
   * (OBSERVADO en WhatsApp Web real): `foto` (`img` de `pps.whatsapp.net`) o
   * `inicial` (círculo de color con `[data-testid="profile-first-initial"]`),
   * ambos OBSERVADOS; `silueta` (círculo con un SVG) es una SUPOSICIÓN pendiente
   * de validar.
   */
  readonly avatarGrupo?: 'foto' | 'inicial' | 'silueta';
  /**
   * Posición del avatar (SUPUESTA, no observada): `fila` (por defecto), junto a
   * la fila `[data-id]`; `mensaje`, dentro de ella, antes de la burbuja.
   */
  readonly posicionAvatar?: 'fila' | 'mensaje';
  /** Cita o respuesta a otro mensaje (estructura SUPUESTA): autor y texto citado. */
  readonly cita?: { readonly autor: string; readonly texto: string };
  /**
   * Cita con miniatura (OBSERVADA en WhatsApp Web real, diagnósticos sobre
   * 0.1.2-beta.9 y 0.1.2-beta.10, muy probablemente una respuesta a un estado
   * de vídeo): `[data-testid="quoted-message"]` › `div[role="button"][tabindex="0"]`
   * con dos ramas. En una, el encabezado (`div[role=""]` › `span[dir="auto"]`,
   * «Tú · Estados») y un `div[role="button"]` con, en orden,
   * `[data-testid="chat-msg-symbol"]` (icono SVG), la duración como texto
   * directo («0:18») y el texto citado (`span.quoted-mention.selectable-text`
   * con `dir="auto"`). En la otra, la miniatura de 58 × 58 en un `div` con
   * fondo en línea `data:image/jpeg`. SUPUESTOS: el título del icono, los
   * `div` intermedios y que sin duración no haya `chat-msg-symbol`.
   */
  readonly citaConMiniatura?: { readonly encabezado: string; readonly duracion?: string; readonly texto?: string };
  /**
   * Cita convencional dentro del mensaje, con la misma estructura que el
   * estado citado (`quoted-message` › … › `div[role=""]` › `span[dir="auto"]`).
   * Es el peor caso para los falsos positivos. SUPUESTA: nunca se ha observado
   * una cita convencional dentro de un mensaje. Con `conAutor`, el encabezado es
   * `[data-testid="author"]`, como en el recuadro «Responder» observado; sin
   * él, como podría ser la cita de un mensaje propio («Tú»).
   */
  readonly citaConvencional?: { readonly encabezado: string; readonly texto: string; readonly conAutor: boolean };
  /**
   * Reacción bajo el mensaje (estructura SUPUESTA):
   * - `imagen`: botón con el emoji como `<img alt>` y un contador, dentro de
   *   `msg-container`.
   * - `texto`: emoji como texto y contador, dentro de `msg-container`.
   * - `fuera`: botón con emoji de texto fuera de `msg-container`, dentro de
   *   la fila `[data-id]`.
   */
  readonly reaccion?: 'imagen' | 'texto' | 'fuera';
  /** Hora mostrada; por defecto `10:40`. */
  readonly hora?: string;
}

export interface Mensaje {
  readonly texto: string;
  readonly direccion: 'entrante' | 'saliente';
}

export class WhatsAppSimulado {
  readonly documento: Document;
  readonly app: HTMLElement;
  readonly lista: HTMLElement;
  /** Número de clics recibidos por los controles simulados, por etiqueta. */
  readonly clics = new Map<string, number>();

  constructor(documento: Document, chats: readonly Chat[], conversacion: {
    readonly nombre: string;
    readonly mensajes: readonly Mensaje[];
  }) {
    this.documento = documento;
    this.lista = el(documento, 'div', { role: 'grid', 'aria-label': 'Lista de chats' });
    for (const chat of chats) this.lista.append(this.crearFila(chat));
    this.app = el(
      documento,
      'div',
      { id: 'app' },
      el(documento, 'div', { id: 'side' }, el(documento, 'div', { id: 'pane-side' }, this.lista)),
      this.crearConversacion(conversacion.nombre, conversacion.mensajes),
    );
    documento.body.append(this.app);
  }

  get filas(): HTMLElement[] {
    return [...this.lista.querySelectorAll<HTMLElement>('[role="listitem"]')];
  }

  get principal(): HTMLElement {
    const principal = this.documento.getElementById('main');
    if (!principal) throw new Error('No hay conversación abierta.');
    return principal;
  }

  get editor(): HTMLElement {
    return requerir(
      this.principal.querySelector<HTMLElement>('footer [contenteditable="true"]'),
      'editor',
    );
  }

  control(etiqueta: string): HTMLElement {
    return requerir(
      this.documento.querySelector<HTMLElement>(`[aria-label="${etiqueta}"]`),
      etiqueta,
    );
  }

  crearAvatar(tipo: TipoAvatar): HTMLElement {
    const d = this.documento;
    const marco = el(d, 'div', { 'data-prueba': 'avatar' });
    switch (tipo) {
      case 'svgImagen':
        marco.append(crearSvgConMascara(d, crearImagenSvg(d)));
        break;
      case 'svgForeignObject':
        marco.append(crearSvgConMascara(d, crearForeignObject(d)));
        break;
      case 'imagen':
        marco.append(el(d, 'img', { src: FOTO, alt: '', width: '40', height: '40' }));
        break;
      case 'fotoPerfil':
        marco.append(el(d, 'img', { src: URL_FOTO_PERFIL, alt: '', width: '40', height: '40', draggable: 'false' }));
        break;
      case 'fondo':
        marco.append(
          el(d, 'div', {
            style: `width:40px;height:40px;background-image:url("${URL_FOTO_PERFIL}")`,
          }),
        );
        break;
      case 'predeterminadoContacto':
        marco.append(icono(d, 'default-user'));
        break;
      case 'predeterminadoGrupo':
        marco.append(icono(d, 'default-group'));
        break;
    }
    return marco;
  }

  crearFila({
    nombre,
    vistaPrevia,
    hora = '10:45',
    noLeidos,
    avatar = 'imagen',
    emojiEnNombre,
    leido,
    sticker,
    temporal,
    leidoEnLineaDelNombre,
    vistaPreviaEspecial,
    fijado,
  }: Chat): HTMLElement {
    const d = this.documento;
    const emoji = emojiEnNombre ? [el(d, 'img', { class: 'emoji', alt: '🙂', src: FOTO, width: '16', height: '16' })] : [];
    return el(
      d,
      'div',
      { role: 'listitem' },
      el(
        d,
        'div',
        { tabindex: '0', role: 'button' },
        this.crearAvatar(avatar),
        el(
          d,
          'div',
          {},
          el(
            d,
            'div',
            {},
            el(d, 'span', { dir: 'auto', title: nombre }, nombre, ...emoji),
            ...(temporal ? [iconoSvg(d, 'wds-ic-disappearing-messages')] : []),
            ...(leidoEnLineaDelNombre ? [iconoSvg(d, 'wds-ic-read')] : []),
            el(d, 'div', {}, hora),
          ),
          el(
            d,
            'div',
            {},
            ...(leido ? [iconoLeido(d)] : []),
            ...(sticker ? [iconoSvg(d, 'wds-ic-sticker')] : []),
            vistaPreviaEspecial ? this.crearVistaPreviaEspecial(vistaPreviaEspecial, vistaPrevia) : this.crearVistaPrevia(vistaPrevia),
            icono(d, 'muted'),
            ...(fijado ? [icono(d, 'pinned')] : []),
            ...(noLeidos ? [el(d, 'span', { 'aria-label': `${noLeidos} mensajes no leídos` }, String(noLeidos))] : []),
          ),
        ),
      ),
    );
  }

  crearVistaPrevia(texto: string): HTMLElement {
    const d = this.documento;
    return el(d, 'span', { title: texto }, el(d, 'span', { dir: 'ltr' }, texto));
  }

  /** Nombre de prueba del icono de foto: el nombre real no se conoce. */
  static readonly ICONO_FOTO_PRUEBA = 'prueba-icono-foto';

  crearVistaPreviaEspecial(tipo: 'reaccion' | 'imagen' | 'reaccionImagen', texto: string): HTMLElement {
    const d = this.documento;
    const emoji = () => el(d, 'img', { class: 'emoji', alt: '👌', src: FOTO, width: '16', height: '16', 'data-prueba': 'emoji-reaccion' });
    const foto = () => {
      const svg = iconoSvg(d, WhatsAppSimulado.ICONO_FOTO_PRUEBA);
      svg.setAttribute('data-prueba', 'icono-contenido');
      return svg;
    };
    const partes: Hijo[] =
      tipo === 'reaccion'
        ? ['reaccionó con ', emoji(), ' a: “', texto, '”']
        : tipo === 'imagen'
          ? [foto(), ' ', texto]
          : ['reaccionó con ', emoji(), ' a: ', foto(), ' ', texto];
    return el(d, 'span', { title: '' }, el(d, 'span', { dir: 'ltr', 'data-prueba': 'vista-especial' }, ...partes));
  }

  crearConversacion(nombre: string, mensajes: readonly Mensaje[]): HTMLElement {
    const d = this.documento;
    const boton = (etiqueta: string, nombreIcono: string) => {
      const b = el(d, 'button', { 'aria-label': etiqueta, type: 'button' }, icono(d, nombreIcono));
      b.addEventListener('click', () => {
        this.clics.set(etiqueta, (this.clics.get(etiqueta) ?? 0) + 1);
      });
      return b;
    };
    return el(
      d,
      'div',
      { id: 'main' },
      el(
        d,
        'header',
        {},
        el(d, 'div', {}, el(d, 'img', { src: FOTO, alt: '', width: '40', height: '40' })),
        el(
          d,
          'div',
          { role: 'button', tabindex: '0' },
          el(d, 'span', { dir: 'auto', title: nombre }, nombre),
          el(d, 'span', { title: 'en línea' }, 'en línea'),
        ),
        boton('Buscar', 'search'),
        boton('Menú', 'menu'),
      ),
      // `conversation-panel-messages` está OBSERVADO; que sea el propio contenedor de las filas es una SUPOSICIÓN.
      el(d, 'div', { role: 'application', 'data-testid': 'conversation-panel-messages' }, ...mensajes.map((m) => this.crearMensaje(m, boton))),
      el(
        d,
        'footer',
        {},
        boton('Adjuntar', 'plus'),
        el(
          d,
          'div',
          {
            contenteditable: 'true',
            role: 'textbox',
            'aria-label': 'Escribe un mensaje',
            spellcheck: 'true',
          },
          el(d, 'p', {}, el(d, 'br')),
        ),
        boton('Enviar', 'send'),
      ),
    );
  }

  crearMensaje(
    { texto, direccion }: Mensaje,
    boton: (etiqueta: string, icono: string) => HTMLElement = (etiqueta) =>
      el(this.documento, 'button', { 'aria-label': etiqueta, type: 'button' }),
  ): HTMLElement {
    const d = this.documento;
    const clase = direccion === 'entrante' ? 'message-in' : 'message-out';
    return el(
      d,
      'div',
      { role: 'row' },
      el(
        d,
        'div',
        { class: `${clase} focusable-list-item`, tabindex: '-1', 'data-id': crypto.randomUUID() },
        el(
          d,
          'div',
          { class: 'copyable-text', 'data-pre-plain-text': '[10:40] Contacto: ' },
          el(d, 'span', { class: 'selectable-text copyable-text', dir: 'ltr' }, el(d, 'span', {}, texto)),
        ),
        boton(`Reaccionar a «${texto}»`, 'react'),
      ),
    );
  }

  /** Simula la llegada de un chat nuevo al principio de la lista. */
  agregarChat(chat: Chat): HTMLElement {
    const fila = this.crearFila(chat);
    this.lista.prepend(fila);
    return fila;
  }

  /** Simula un mensaje nuevo: WhatsApp sustituye el nodo de la vista previa. */
  actualizarVistaPrevia(indice: number, texto: string): void {
    const fila = this.filas[indice];
    const anterior = fila?.querySelector('span[title]:not([dir])');
    anterior?.replaceWith(this.crearVistaPrevia(texto));
  }

  /** Simula que el último mensaje pasa a ser una vista previa especial (por ejemplo, una reacción). */
  actualizarVistaPreviaEspecial(indice: number, tipo: 'reaccion' | 'imagen' | 'reaccionImagen', texto: string): void {
    const fila = this.filas[indice];
    fila?.querySelector('span[title]:not([dir])')?.replaceWith(this.crearVistaPreviaEspecial(tipo, texto));
  }

  /** Simula el reordenamiento de la lista (un chat sube al principio). */
  moverAlPrincipio(indice: number): void {
    const fila = this.filas[indice];
    if (fila) this.lista.prepend(fila);
  }

  /** Simula la reutilización de una fila por la lista virtualizada. */
  reutilizarFila(indice: number, chat: Chat): void {
    this.filas[indice]?.replaceChildren(...this.crearFila(chat).childNodes);
  }

  /** Simula la carga diferida de una foto: la `<img>` recibe su origen después. */
  cargarFotoDiferida(fila: Element): HTMLImageElement {
    const imagen = this.documento.createElement('img');
    requerir(fila.querySelector('[data-prueba="avatar"]'), 'avatar').replaceChildren(imagen);
    imagen.src = URL_FOTO_PERFIL;
    return imagen;
  }

  /**
   * Simula la carga de la foto en un avatar SVG: el `<foreignObject>`
   * provisional se sustituye por una `<image>`.
   */
  cargarImagenEnSvg(fila: Element): SVGElement {
    const provisional = requerir(fila.querySelector('foreignObject'), 'foreignObject');
    const imagen = crearImagenSvg(this.documento);
    provisional.replaceWith(imagen);
    return imagen;
  }

  /**
   * Añade a la fila un SVG con máscara y círculo pero sin `<image>` ni
   * `<foreignObject>` (por ejemplo, un indicador), que no debe difuminarse.
   */
  agregarIndicadorSvg(fila: Element): SVGElement {
    const indicador = crearSvgConMascara(this.documento, null);
    indicador.setAttribute('data-prueba', 'indicador-svg');
    requerir(fila.querySelector('[data-icon="muted"]'), 'icono silenciado').after(indicador);
    return indicador;
  }

  /** Panel de información del contacto o grupo, fuera de la lista y de la conversación. */
  abrirPanelInformacion(avatar: TipoAvatar): HTMLElement {
    const d = this.documento;
    const panel = el(
      d,
      'div',
      { 'data-prueba': 'panel-informacion' },
      el(d, 'div', { role: 'button', tabindex: '0', 'aria-label': 'Ver foto' }, this.crearAvatar(avatar)),
      el(d, 'span', { dir: 'auto' }, 'Información del contacto'),
      el(d, 'button', { type: 'button', 'aria-label': 'Cerrar panel' }, icono(d, 'x')),
    );
    this.app.append(panel);
    return panel;
  }

  /** Foto de perfil propia en la cabecera del panel lateral. */
  agregarFotoPropia(): HTMLElement {
    const d = this.documento;
    const cabecera = el(d, 'header', { 'data-prueba': 'perfil-propio' }, this.crearAvatar('fotoPerfil'));
    requerir(d.getElementById('side'), 'panel lateral').prepend(cabecera);
    return cabecera;
  }

  /** Mensaje de un participante de grupo, con su avatar junto a la burbuja. */
  agregarMensajeDeGrupo(texto: string, avatar: TipoAvatar): HTMLElement {
    const fila = this.crearMensaje({ texto, direccion: 'entrante' });
    fila.prepend(this.crearAvatar(avatar));
    this.principal.querySelector('[role="application"]')?.append(fila);
    return fila;
  }

  /** Mensaje con una fotografía enviada (multimedia, no avatar). */
  agregarMensajeConImagen(): HTMLImageElement {
    const fila = this.crearMensaje({ texto: 'Mira esta foto', direccion: 'entrante' });
    const imagen = this.documento.createElement('img');
    imagen.src = URL_MULTIMEDIA_MENSAJE;
    requerir(fila.querySelector('.message-in'), 'burbuja').prepend(imagen);
    this.principal.querySelector('[role="application"]')?.append(fila);
    return imagen;
  }

  #contadorMensajes = 0;

  #botonContado(etiqueta: string, nombreIcono: string): HTMLElement {
    const boton = el(this.documento, 'button', { type: 'button', 'aria-label': etiqueta }, icono(this.documento, nombreIcono));
    boton.addEventListener('click', () => {
      this.clics.set(etiqueta, (this.clics.get(etiqueta) ?? 0) + 1);
    });
    return boton;
  }

  /** Mensaje con la estructura observada (ver `MensajeObservado`). */
  crearMensajeObservado(mensaje: MensajeObservado): HTMLElement {
    const d = this.documento;
    const { tipo, direccion, texto = '', remitente, remitenteVisible, emojiRemitente, autor, avatarGrupo, posicionAvatar = 'fila', cita, reaccion, hora = '10:40' } = mensaje;
    const numero = String(++this.#contadorMensajes);
    const saliente = direccion === 'saliente';
    const partes: Node[] = [];

    const nombreCompleto = remitente && emojiRemitente ? `${remitente} ${emojiRemitente}` : remitente;
    if (remitente) {
      const contenido = () => [
        `\u200e${remitenteVisible ?? remitente}${emojiRemitente ? ' ' : ''}`,
        ...(emojiRemitente ? [el(d, 'img', { class: 'emoji', alt: emojiRemitente, src: FOTO, width: '16', height: '16' })] : []),
      ];
      const color = 'color: #d62976';
      const boton = { 'data-testid': 'author', role: 'button', tabindex: '0' };
      switch (autor) {
        case undefined:
          // Nombre de color sobre el mensaje (estructura SUPUESTA: `span[dir=auto]` con estilo de color).
          partes.push(el(d, 'span', { dir: 'auto', 'data-prueba': 'remitente', style: color }, ...contenido()));
          break;
        case 'span':
          partes.push(el(d, 'span', { 'data-testid': 'author', dir: 'auto', 'data-prueba': 'remitente', style: color }, ...contenido()));
          break;
        case 'boton':
          partes.push(el(d, 'span', { ...boton, dir: 'auto', 'data-prueba': 'remitente', style: color }, ...contenido()));
          break;
        case 'anidado':
          partes.push(el(d, 'span', { ...boton, 'data-prueba': 'remitente', style: color },
            el(d, 'span', { 'data-testid': 'author', dir: 'auto', 'data-prueba': 'remitente-interior' }, ...contenido())));
          break;
        case 'anidadoInverso':
          partes.push(el(d, 'span', { 'data-testid': 'author', 'data-prueba': 'remitente', style: color },
            el(d, 'span', { ...boton, dir: 'auto', 'data-prueba': 'remitente-interior' }, ...contenido())));
          break;
      }
    }
    if (mensaje.etiquetaMiembro && remitente) {
      // Cabecera: la rama del autor y, justo después, la de la etiqueta de miembro.
      const autorDelMensaje = requerir(partes.pop(), 'autor');
      partes.push(
        el(d, 'div', { 'data-prueba': 'cabecera-remitente' },
          el(d, 'div', {}, autorDelMensaje),
          el(d, 'div', {},
            el(d, 'div', { role: 'button', tabindex: '0', 'data-prueba': 'control-etiqueta' },
              el(d, 'span', { class: 'x1etiqueta', style: 'color: #8696a0', 'data-prueba': 'etiqueta-miembro' }, mensaje.etiquetaMiembro)))),
      );
    }
    if (cita) {
      partes.push(
        el(d, 'div', { role: 'button', tabindex: '0', 'data-prueba': 'cita' },
          el(d, 'span', { dir: 'auto', 'data-prueba': 'autor-cita' }, cita.autor),
          el(d, 'span', { dir: 'ltr' }, cita.texto)),
      );
    }

    if (mensaje.citaConMiniatura) {
      const { encabezado, duracion, texto: textoCitado = '' } = mensaje.citaConMiniatura;
      const citado = textoCitado
        ? [el(d, 'span', { class: 'quoted-mention selectable-text copyable-text', 'data-testid': 'selectable-text', dir: 'auto', 'data-prueba': 'texto-citado' }, textoCitado)]
        : [];
      const linea = duracion
        ? el(d, 'div', { role: 'button', 'data-prueba': 'duracion-cita' },
            el(d, 'div', { 'data-testid': 'chat-msg-symbol', 'data-prueba': 'indicador-cita' }, el(d, 'span', {}, iconoSvg(d, 'status-v-ic'))),
            duracion,
            ...citado)
        : el(d, 'div', {}, ...citado);
      const boton = el(d, 'div', { role: 'button', tabindex: '0', 'aria-label': 'Cita', 'data-prueba': 'boton-cita', style: 'display: flex' },
        el(d, 'span', {}),
        el(d, 'div', { 'data-prueba': 'columna-cita', style: 'flex: 1' },
          el(d, 'div', {},
            el(d, 'div', { role: '' }, el(d, 'span', { dir: 'auto', 'data-prueba': 'encabezado-cita' }, encabezado)),
            el(d, 'div', {}),
            linea)),
        el(d, 'div', {}, el(d, 'div', {}, el(d, 'div', {},
          el(d, 'div', {
            'data-prueba': 'miniatura-cita',
            style: `background-image: url("${URL_MINIATURA_MENSAJE}"); background-size: cover; width: 58px; height: 58px`,
          })))));
      boton.addEventListener('click', () => {
        this.clics.set('Abrir cita', (this.clics.get('Abrir cita') ?? 0) + 1);
      });
      partes.push(el(d, 'div', { 'data-testid': 'quoted-message' }, boton));
    }

    if (mensaje.citaConvencional) {
      const { encabezado, texto: textoCitado, conAutor } = mensaje.citaConvencional;
      const autor = conAutor ? { 'data-testid': 'author' } : {};
      partes.push(
        el(d, 'div', { 'data-testid': 'quoted-message' },
          el(d, 'div', { role: 'button', tabindex: '0', 'aria-label': 'Cita', 'data-prueba': 'cita-convencional' },
            el(d, 'span', { 'data-prueba': 'barra-cita' }),
            el(d, 'div', {}, el(d, 'div', {},
              el(d, 'div', { role: '' }, el(d, 'span', { ...autor, dir: 'auto', 'data-prueba': 'encabezado-convencional' }, encabezado)),
              el(d, 'div', {}, el(d, 'span', { class: 'quoted-mention selectable-text copyable-text', 'data-testid': 'selectable-text', dir: 'auto', 'data-prueba': 'texto-convencional' }, textoCitado)))))),
      );
    }

    const bloqueTexto = () =>
      el(
        d,
        'div',
        { class: 'copyable-text', 'data-pre-plain-text': `[10:40, 15/10/2026] ${nombreCompleto ?? 'Yo'}: ` },
        el(d, 'div', {}, el(d, 'span', { class: 'selectable-text copyable-text', dir: 'ltr' }, el(d, 'span', {}, texto))),
      );

    switch (tipo) {
      case 'texto':
        partes.push(bloqueTexto());
        break;
      case 'foto':
      case 'fotoConDescripcion':
        partes.push(
          el(d, 'div', { role: 'button', tabindex: '0', 'aria-label': 'Abrir foto', 'data-prueba': 'multimedia' },
            el(d, 'img', { src: URL_BLOB_MENSAJE, alt: '', width: '200', height: '120' })),
        );
        if (tipo === 'fotoConDescripcion') {
          partes.push(el(d, 'div', { 'data-prueba': 'descripcion' },
            el(d, 'span', { class: 'selectable-text copyable-text', dir: 'ltr' }, el(d, 'span', {}, texto))));
        }
        break;
      case 'fotoSinDescargar':
        partes.push(
          el(d, 'div', { 'data-prueba': 'multimedia' },
            el(d, 'img', { src: URL_MINIATURA_MENSAJE, alt: '', width: '200', height: '120' }),
            this.#botonContado('Descargar', 'media-download')),
        );
        break;
      case 'documento': {
        const { nombre, formato, tamano, descripcion, etiquetaAntes = false } = mensaje.documento ?? { nombre: 'archivo.pdf', formato: 'PDF', tamano: '10 kB' };
        const dibujo = el(d, 'span', { 'data-icon': `document-${formato}-icon`, 'data-prueba': 'dibujo-documento' }, iconoSvg(d, 'document-icon'));
        const etiqueta = el(d, 'div', { 'data-prueba': 'etiqueta-icono' }, formato);
        const tarjeta = el(d, 'div', { 'data-testid': 'document-thumb', role: 'button', tabindex: '0', title: `Descargar «${nombre}»`, 'data-prueba': 'documento', style: 'display: flex; gap: 8px; width: 300px' },
          el(d, 'div', { 'data-prueba': 'icono-documento' }, ...(etiquetaAntes ? [etiqueta, dibujo] : [dibujo, etiqueta])),
          el(d, 'div', { style: 'min-width: 0; flex: 1' },
            el(d, 'div', { style: 'overflow-wrap: anywhere' }, el(d, 'span', { dir: 'auto', 'data-prueba': 'nombre-documento' }, nombre)),
            el(d, 'div', {},
              el(d, 'span', { 'data-testid': 'type', 'data-prueba': 'tipo-documento' }, formato),
              el(d, 'span', {}, ' • '),
              el(d, 'span', { title: tamano, 'data-prueba': 'tamano-documento' }, tamano))),
          el(d, 'button', { type: 'button', 'aria-label': 'Descargar documento', 'data-prueba': 'descargar-documento' },
            el(d, 'span', { title: 'Descargar' }, iconoSvg(d, 'wds-ic-download'))));
        tarjeta.addEventListener('click', (evento) => {
          const etiqueta = (evento.target as Element).closest('button') ? 'Descargar documento' : 'Abrir documento';
          this.clics.set(etiqueta, (this.clics.get(etiqueta) ?? 0) + 1);
        });
        partes.push(tarjeta);
        if (descripcion) {
          partes.push(el(d, 'div', { 'data-prueba': 'descripcion-documento' },
            el(d, 'span', { class: 'selectable-text copyable-text', dir: 'ltr' }, el(d, 'span', {}, descripcion))));
        }
        break;
      }
      case 'videoMiniatura': {
        const { orientacion, capas = 'hermanas' } = mensaje.miniaturaVideo ?? { orientacion: 'horizontal' };
        const [ancho, alto] = orientacion === 'vertical' ? [256, 354] : [346, 200];
        const fondo = `background-image: url("${URL_MINIATURA_MENSAJE}"); background-size: cover; position: absolute; inset: 0`;
        const desenfocada = el(d, 'div', { 'data-prueba': 'capa-desenfocada', style: `${fondo}; filter: blur(8px)` });
        const nitida = el(d, 'div', { 'data-prueba': 'capa-nitida', style: fondo }, ...(capas === 'anidadas' ? [desenfocada] : []));
        partes.push(
          el(d, 'div', { role: 'button', tabindex: '0', 'aria-label': 'Reproducir vídeo', 'data-prueba': 'video-miniatura' },
            el(d, 'div', { 'data-testid': 'video-content', style: `position: relative; width: ${ancho}px; height: ${alto}px` },
              ...(capas === 'anidadas' ? [nitida] : [desenfocada, nitida]),
              el(d, 'span', { 'data-icon': 'media-play', 'data-prueba': 'control-video', style: 'position: absolute; left: 45%; top: 45%' }, iconoSvg(d, 'wds-ic-play')),
              el(d, 'span', { 'data-prueba': 'duracion-video', style: 'position: absolute; left: 4px; bottom: 4px' }, '0:15'))),
        );
        break;
      }
      case 'llamada': {
        const { titulo, detalle } = mensaje.llamada ?? { titulo: 'Llamada de voz', detalle: 'Sin respuesta' };
        const tarjeta = el(d, 'div', { role: 'button', tabindex: '0', 'data-prueba': 'tarjeta-llamada' },
          el(d, 'div', { 'data-testid': 'call-log-system-message' },
            el(d, 'div', { 'data-testid': 'call-log-icon-chip', 'data-prueba': 'icono-llamada' }, iconoSvg(d, 'wds-ic-call')),
            el(d, 'div', {},
              el(d, 'div', { 'data-prueba': 'titulo-llamada' }, titulo),
              el(d, 'span', { 'data-prueba': 'detalle-llamada' }, detalle)),
            el(d, 'div', { 'data-testid': 'msg-meta' }, el(d, 'span', { 'data-prueba': 'hora' }, hora))));
        tarjeta.addEventListener('click', () => {
          this.clics.set('Volver a llamar', (this.clics.get('Volver a llamar') ?? 0) + 1);
        });
        partes.push(tarjeta);
        break;
      }
      case 'video': {
        const video = el(d, 'video', { width: '200', height: '120', 'data-prueba': 'video' });
        partes.push(el(d, 'div', { 'data-prueba': 'multimedia' }, video, this.#botonContado('Reproducir', 'media-play')));
        break;
      }
    }

    partes.push(
      // En una tarjeta de llamada, msg-meta está dentro de la propia tarjeta.
      ...(tipo === 'llamada' ? [] : [el(d, 'div', { 'data-testid': 'msg-meta' },
        el(d, 'span', { 'data-prueba': 'hora' }, hora),
        ...(saliente ? [iconoLeido(d)] : []))]),
      this.#botonContado(`Reaccionar ${numero}`, 'react'),
      this.#botonContado(`Responder ${numero}`, 'reply'),
    );
    const fuera: Node[] = [];
    if (reaccion === 'imagen') {
      partes.push(
        el(d, 'div', { 'data-prueba': 'reaccion' },
          el(d, 'button', { type: 'button', 'aria-label': `Reacciones ${numero}` },
            el(d, 'img', { src: URL_EMOJI, alt: '👍', width: '16', height: '16' }), el(d, 'span', {}, '1'))),
      );
    } else if (reaccion === 'texto') {
      partes.push(el(d, 'div', { role: 'button', tabindex: '0', 'data-prueba': 'reaccion' }, el(d, 'span', {}, '❤️'), el(d, 'span', {}, '2')));
    } else if (reaccion === 'fuera') {
      fuera.push(el(d, 'button', { type: 'button', 'aria-label': `Reacciones ${numero}`, 'data-prueba': 'reaccion' }, '😂👍🏽 3'));
    }

    const avatar = avatarGrupo ? [this.crearAvatarGrupo(avatarGrupo, remitenteVisible ?? remitente ?? '?')] : [];
    return el(
      d,
      'div',
      { role: 'row' },
      ...(posicionAvatar === 'fila' ? avatar : []),
      el(d, 'div', { 'data-id': `${saliente ? 'true' : 'false'}_prueba_${numero}` },
        ...(posicionAvatar === 'mensaje' ? avatar : []),
        el(d, 'div', { 'data-testid': 'msg-container' }, ...partes), ...fuera),
    );
  }

  /**
   * Avatar de un participante: `[data-testid="group-chat-profile-picture"]`
   * (OBSERVADO) con la foto, o con un círculo de color de 28 × 28 px y la
   * inicial en `[data-testid="profile-first-initial"]` (OBSERVADOS). La silueta
   * y el foco del avatar (`tabindex`) son SUPOSICIONES.
   */
  crearAvatarGrupo(tipo: 'foto' | 'inicial' | 'silueta', nombre: string): HTMLElement {
    const d = this.documento;
    const circulo = (contenido: Node) =>
      el(d, 'div', { style: 'width:28px;height:28px;border-radius:50%;background-color:#d6a2ff;display:flex;align-items:center;justify-content:center', 'data-prueba': 'avatar-grupo-circulo' }, contenido);
    let contenido: Node;
    if (tipo === 'foto') {
      contenido = el(d, 'img', { src: URL_FOTO_PERFIL, alt: '', width: '28', height: '28', 'data-prueba': 'avatar-grupo-foto' });
    } else if (tipo === 'inicial') {
      const inicial = nombre.replace(/^[~\s\u200e]+/, '').charAt(0).toUpperCase();
      contenido = circulo(el(d, 'span', { 'data-testid': 'profile-first-initial', 'data-prueba': 'avatar-grupo-inicial' }, inicial));
    } else {
      const svg = iconoSvg(d, 'abcdefghijklmnop');
      svg.setAttribute('data-prueba', 'avatar-grupo-silueta');
      svg.append(d.createElementNS('http://www.w3.org/2000/svg', 'path'));
      contenido = circulo(svg);
    }
    return el(d, 'div', { 'data-testid': 'group-chat-profile-picture', role: 'button', tabindex: '0', 'data-prueba': 'avatar-grupo' }, contenido);
  }

  /**
   * Abre una conversación con la estructura observada. Incluye un separador
   * de fecha. El editor lleva las clases `copyable-text selectable-text`
   * (suposición), para comprobar que RF-04 no lo difumina.
   */
  abrirConversacionObservada(
    nombre: string,
    mensajes: readonly MensajeObservado[],
    fijado?: { readonly autor: string; readonly texto: string },
  ): void {
    const conversacion = this.crearConversacion(nombre, []);
    const lista = requerir(conversacion.querySelector('[role="application"]'), 'lista de mensajes');
    if (fijado) {
      // Aviso de mensaje fijado bajo el encabezado (estructura SUPUESTA).
      lista.before(
        el(this.documento, 'div', { 'data-prueba': 'fijado', role: 'button', tabindex: '0' },
          el(this.documento, 'span', { dir: 'auto', 'data-prueba': 'autor-fijado' }, fijado.autor),
          el(this.documento, 'span', { dir: 'ltr' }, fijado.texto)),
      );
    }
    lista.append(
      el(this.documento, 'div', { role: 'row', 'data-prueba': 'separador' }, el(this.documento, 'span', {}, 'HOY')),
      ...mensajes.map((m) => this.crearMensajeObservado(m)),
    );
    requerir(conversacion.querySelector('footer [contenteditable]'), 'editor').classList.add('copyable-text', 'selectable-text');
    this.principal.replaceWith(conversacion);
  }

  agregarMensajeObservado(mensaje: MensajeObservado): HTMLElement {
    const fila = this.crearMensajeObservado(mensaje);
    requerir(this.principal.querySelector('[role="application"]'), 'lista de mensajes').append(fila);
    return fila;
  }

  /**
   * Abre el recuadro «Responder» con la estructura OBSERVADA en WhatsApp Web
   * real (diagnóstico del propietario sobre 0.1.1, respuesta a un mensaje de
   * texto): `footer` › `[data-testid="popup_panel"]` ›
   * `[data-testid="quoted-message"]`, con `[data-testid="author"]` y el texto
   * en `span.quoted-mention.selectable-text.copyable-text[data-testid="selectable-text"]`.
   * El emoji como `<img alt>` dentro del texto y la posición del botón para
   * cancelar (en `popup_panel`, fuera de la cita) son SUPOSICIONES.
   * Si ya hay una respuesta abierta, la sustituye, como al elegir otro mensaje.
   */
  responderA(cita: { readonly autor: string; readonly texto: string; readonly emoji?: boolean }): HTMLElement {
    const d = this.documento;
    this.cancelarRespuesta();
    const emoji = cita.emoji ? [' ', el(d, 'img', { class: 'emoji', alt: '😀', src: URL_EMOJI, width: '16', height: '16' })] : [];
    const cancelar = el(d, 'button', { type: 'button', 'aria-label': 'Cancelar respuesta' }, iconoSvg(d, 'wds-ic-close'));
    cancelar.addEventListener('click', () => {
      this.clics.set('Cancelar respuesta', (this.clics.get('Cancelar respuesta') ?? 0) + 1);
      this.cancelarRespuesta();
    });
    const panel = el(d, 'div', { 'data-testid': 'popup_panel' },
      el(d, 'div', { 'data-testid': 'quoted-message', role: 'button', tabindex: '0' },
        el(d, 'span', { 'data-testid': 'author', dir: 'auto' }, cita.autor),
        el(d, 'span', { class: 'quoted-mention selectable-text copyable-text', 'data-testid': 'selectable-text', dir: 'ltr' },
          cita.texto, ...emoji)),
      cancelar);
    requerir(this.principal.querySelector('footer'), 'pie').prepend(panel);
    return panel;
  }

  /**
   * Abre «Info. del mensaje» con la estructura OBSERVADA en WhatsApp Web real
   * (diagnóstico sobre 0.1.2-beta.3): fuera de `#main`,
   * `[data-testid="drawer-right"]` › `div.copyable-area` con el título, una
   * copia del mensaje en `[data-testid="msg-container"]` (texto en
   * `[data-testid="selectable-text"]`, metadatos en `[data-testid="msg-meta"]`)
   * y los estados en `[data-testid="kept-by-info"]`. El orden interno, el
   * encabezado y el botón de cierre son SUPOSICIONES. Si ya está abierta, la
   * sustituye, como al elegir otro mensaje.
   *
   * Con `sticker` (OBSERVADO sobre 0.1.2-beta.4), la copia del mensaje contiene
   * `[data-testid="sticker-container"]` › `div[role="button"][tabindex="0"]`
   * con un `img` de origen `blob:` y, en el `animado`, un `canvas` visible de
   * 190 × 190 px con el `img` a 0 × 0 px. El `estatico` (solo el `img`
   * visible) y el orden de los nodos son SUPOSICIONES.
   */
  abrirInfoMensaje(mensaje: { readonly texto?: string; readonly emoji?: boolean; readonly sticker?: 'animado' | 'estatico' }): HTMLElement {
    const d = this.documento;
    this.cerrarInfoMensaje();
    const cerrar = el(d, 'button', { type: 'button', 'aria-label': 'Cerrar', 'data-prueba': 'cerrar-info' }, iconoSvg(d, 'wds-ic-close'));
    cerrar.addEventListener('click', () => {
      this.clics.set('Cerrar info', (this.clics.get('Cerrar info') ?? 0) + 1);
      this.cerrarInfoMensaje();
    });
    const emoji = mensaje.emoji ? [' ', el(d, 'img', { class: 'emoji', alt: '🎉', src: URL_EMOJI, width: '16', height: '16', 'data-prueba': 'emoji-info' })] : [];
    const estado = (etiqueta: string, icono: string) =>
      el(d, 'div', { 'data-prueba': 'estado-info' },
        el(d, 'div', {}, iconoSvg(d, icono), el(d, 'span', {}, etiqueta)),
        el(d, 'span', { 'data-prueba': 'fecha-info' }, 'ayer 10:41'));
    const panel = el(d, 'div', { 'data-testid': 'drawer-right', 'data-prueba': 'info-mensaje' },
      el(d, 'div', { class: 'copyable-area' },
        el(d, 'header', {}, cerrar, el(d, 'span', { 'data-prueba': 'titulo-info' }, 'Info. del mensaje')),
        el(d, 'div', { 'data-testid': 'msg-container' },
          ...(mensaje.texto === undefined
            ? []
            : [el(d, 'div', { 'data-pre-plain-text': '[10:40, 15/10/2026] Yo: ' },
              el(d, 'span', { class: 'selectable-text copyable-text', 'data-testid': 'selectable-text', 'data-prueba': 'texto-info' },
                el(d, 'span', {}, mensaje.texto), ...emoji))]),
          ...(mensaje.sticker ? [this.#stickerInfo(mensaje.sticker)] : []),
          el(d, 'div', { 'data-testid': 'msg-meta' }, el(d, 'span', { 'data-prueba': 'hora-info' }, '10:40'), iconoLeido(d))),
        el(d, 'div', { 'data-testid': 'kept-by-info' }, estado('Leído', 'wds-ic-read'), estado('Entregado', 'wds-ic-delivered'))));
    this.app.append(panel);
    return panel;
  }

  #stickerInfo(tipo: 'animado' | 'estatico'): HTMLElement {
    const d = this.documento;
    const animado = tipo === 'animado';
    const imagen = el(d, 'img', {
      src: URL_BLOB_MENSAJE, alt: '', 'data-prueba': 'sticker-img',
      ...(animado ? { width: '0', height: '0', style: 'width:0;height:0' } : { width: '190', height: '190' }),
    });
    const lienzo = animado ? [el(d, 'canvas', { width: '190', height: '190', 'data-prueba': 'sticker-canvas' })] : [];
    return el(d, 'div', { 'data-testid': 'sticker-container', 'data-prueba': 'sticker-info' },
      el(d, 'div', { role: 'button', tabindex: '0', 'data-prueba': 'sticker-boton' }, imagen, ...lienzo));
  }

  cerrarInfoMensaje(): void {
    this.documento.querySelector('[data-prueba="info-mensaje"]')?.remove();
  }

  /**
   * Otro panel lateral derecho (SUPUESTO), por ejemplo «Mensajes destacados»:
   * también con una copia de un mensaje, pero sin `kept-by-info`.
   */
  abrirOtroPanelDerecho(texto: string): HTMLElement {
    const d = this.documento;
    const panel = el(d, 'div', { 'data-testid': 'drawer-right', 'data-prueba': 'otro-panel-derecho' },
      el(d, 'div', { 'data-testid': 'msg-container' },
        el(d, 'span', { class: 'selectable-text copyable-text', 'data-testid': 'selectable-text', 'data-prueba': 'texto-otro-panel' }, texto)));
    this.app.append(panel);
    return panel;
  }

  /**
   * Panel «Info. del contacto» con la estructura OBSERVADA en WhatsApp Web real
   * (diagnóstico sobre 0.1.2-beta.12, contacto guardado de una cuenta de
   * empresa): `drawer-right` › … › `chat-info-drawer`, con la cabecera
   * (`contact-info-header` con el título), el bloque de perfil (foto SVG, nombre
   * en `contact-info-subtitle selectable-text` y usuario en el `div` hermano),
   * las acciones, las notas (solo con su marcador de posición), y el teléfono y
   * la descripción con la etiqueta dentro de `section-…` y el valor en el `div`
   * hermano. SUPUESTOS: los `div` sin atributos que no constan, el texto de la
   * etiqueta del usuario ausente si no hay usuario, y la fila inferior con un
   * `selectable-text` que no se ha podido atribuir (caso negativo).
   */
  abrirInfoContacto(datos: { readonly nombre: string; readonly usuario?: string; readonly telefono: string; readonly descripcion?: string; readonly emojis?: number }): HTMLElement {
    const d = this.documento;
    this.cerrarInfoContacto();
    const boton = (etiqueta: string, ...hijos: Node[]) => {
      const elemento = el(d, 'button', { class: 'html-button', tabindex: '0', type: 'button', 'aria-label': etiqueta, 'data-prueba': `boton-${etiqueta}` }, ...hijos);
      elemento.addEventListener('click', () => {
        this.clics.set(etiqueta, (this.clics.get(etiqueta) ?? 0) + 1);
        if (etiqueta === 'Cerrar') this.cerrarInfoContacto();
      });
      return el(d, 'span', { class: 'html-span' }, el(d, 'div', {}, elemento));
    };
    const icono = (nombre: string) => el(d, 'span', {}, iconoSvg(d, nombre));
    const generico = (texto: string, prueba: string) => el(d, 'span', { style: 'min-height: 0', 'data-prueba': prueba }, texto);
    const accion = (etiqueta: string, nombreIcono: string) =>
      el(d, 'div', {}, boton(etiqueta, el(d, 'div', { class: 'html-div' }, el(d, 'div', { class: 'html-div' }, icono(nombreIcono)),
        el(d, 'div', { class: 'html-div' }, el(d, 'span', {}, el(d, 'span', { class: 'html-span' }, el(d, 'span', { class: 'html-span', 'data-prueba': 'etiqueta-panel' }, etiqueta)))))));
    // Foto de perfil: SVG con máscara e imagen de pps.whatsapp.net (la difumina RF-02).
    const svg = d.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '120');
    svg.setAttribute('height', '120');
    svg.dataset['prueba'] = 'foto-info-contacto';
    const mascara = d.createElementNS('http://www.w3.org/2000/svg', 'mask');
    const imagen = d.createElementNS('http://www.w3.org/2000/svg', 'image');
    imagen.setAttribute('href', URL_FOTO_PERFIL);
    svg.append(mascara, imagen);
    const emojis = Array.from({ length: datos.emojis ?? 0 }, () =>
      el(d, 'img', { class: 'selectable-text copyable-text', 'data-testid': 'selectable-text', tabindex: '-1', alt: '🙂', src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', style: 'width: 20px; height: 20px', 'data-prueba': 'emoji-descripcion' }));
    const seccion = (testid: string, etiqueta: string, valor: Node) =>
      el(d, 'div', {},
        el(d, 'div', { 'data-testid': testid }, el(d, 'div', {}, el(d, 'div', {}, generico(etiqueta, 'etiqueta-panel')))),
        el(d, 'div', { 'data-prueba': `valor-${testid}` }, valor));
    const fila = (testid: string, etiqueta: string, nombreIcono: string, ...extra: Node[]) =>
      el(d, 'div', {}, el(d, 'div', { role: 'none' },
        el(d, 'div', { role: 'button', 'data-testid': testid, tabindex: '0', 'data-prueba': `fila-${testid}` },
          el(d, 'div', {}, icono(nombreIcono), el(d, 'div', { style: 'flex: 1' }, generico(etiqueta, 'etiqueta-panel')), ...extra))));
    const cabecera = el(d, 'header', {},
      el(d, 'div', {},
        el(d, 'div', {}, el(d, 'div', {}, boton('Cerrar', icono('ic-close')))),
        el(d, 'div', { 'data-testid': 'contact-info-header' },
          el(d, 'h2', {}, el(d, 'span', { style: 'min-height: 0' }, el(d, 'span', { class: 'html-span' },
            el(d, 'span', { class: 'html-span', 'data-prueba': 'titulo-info-contacto' }, 'Info. del contacto'))))),
        el(d, 'div', {}, el(d, 'div', {}, boton('Editar', icono('ic-edit'))))));
    const foto = el(d, 'div', {}, el(d, 'div', {}, el(d, 'div', { style: 'width: 120px' },
      el(d, 'span', { class: 'html-span' },
        el(d, 'button', { type: 'button', 'aria-label': 'Foto', style: 'all: unset', 'data-prueba': 'boton-foto' },
          el(d, 'div', { class: 'html-div' }, el(d, 'div', { class: 'html-div' }, svg)))))));
    const nombre = el(d, 'div', {}, el(d, 'span', { style: 'min-height: 0' }, el(d, 'div', {}, el(d, 'div', {},
      el(d, 'span', { class: 'selectable-text copyable-text', 'data-testid': 'contact-info-subtitle selectable-text', dir: 'auto', style: 'min-height: 0', 'data-prueba': 'nombre-info-contacto' }, datos.nombre)))));
    const usuario = datos.usuario === undefined
      ? []
      : [el(d, 'div', {},
          el(d, 'span', { class: 'selectable-text copyable-text', 'data-testid': 'selectable-text', dir: 'auto', 'data-prueba': 'usuario-info-contacto' },
            el(d, 'div', {}, el(d, 'span', { style: 'min-height: 0' }, datos.usuario))))];
    const perfil = el(d, 'div', { 'data-prueba': 'bloque-perfil' }, nombre, ...usuario);
    const acciones = el(d, 'div', {}, el(d, 'div', { class: 'html-div', dir: 'ltr' }, accion('Llamar', 'ic-call'), accion('Video', 'ic-videocam'), accion('Buscar', 'ic-search')));
    const notas = el(d, 'span', {}, el(d, 'div', { 'data-testid': 'notes-section' }, el(d, 'div', { tabindex: '-1' }, el(d, 'div', { dir: 'ltr' },
      el(d, 'div', {}, el(d, 'div', {},
        el(d, 'span', { class: 'selectable-text copyable-text', 'data-testid': 'note-input-field-read-only selectable-text', dir: 'auto', style: 'min-height: 0' },
          el(d, 'span', { 'data-prueba': 'marcador-notas' }, 'Añade notas sobre tu cliente')))),
      el(d, 'div', {}, el(d, 'span', {}), el(d, 'span', {}, boton('Editar notas', icono('ic-edit'))))))));
    const telefono = seccion('section-phone-number', 'Número de teléfono',
      el(d, 'div', {}, el(d, 'span', { style: 'min-height: 0', 'data-prueba': 'telefono-info-contacto' }, datos.telefono)));
    const descripcion = datos.descripcion === undefined
      ? []
      : [seccion('section-about', 'Info.',
          el(d, 'span', { style: 'min-height: 0' }, el(d, 'div', {},
            el(d, 'span', { class: 'selectable-text copyable-text', 'data-testid': 'selectable-text', dir: 'auto', title: datos.descripcion, style: 'min-height: 0', 'data-prueba': 'descripcion-info-contacto' },
              datos.descripcion, ...emojis))))];
    const filas = [
      fila('block-media-links-docs', 'Archivos, enlaces y documentos', 'ic-perm-media', el(d, 'span', { style: 'min-height: 0', 'data-prueba': 'contador-panel' }, '3')),
      fila('block-starred-messages', 'Mensajes destacados', 'ic-grade'),
      fila('block-mute', 'Silenciar notificaciones', 'ic-notifications',
        el(d, 'input', { role: 'switch', tabindex: '-1', dir: 'ltr', type: 'checkbox', 'aria-label': 'Silenciar', 'data-prueba': 'interruptor-panel' })),
      // Fila inferior con un texto seleccionable que no se ha podido atribuir: no debe difuminarse.
      el(d, 'div', {}, el(d, 'span', { class: 'selectable-text copyable-text', 'data-testid': 'selectable-text', title: 'Otro texto', 'data-prueba': 'texto-sin-atribuir' }, 'Otro texto')),
    ];
    const cuerpo = el(d, 'div', {}, el(d, 'div', {},
      el(d, 'section', {}, el(d, 'div', {}, foto, perfil, acciones, el(d, 'div', {}), notas), telefono, ...descripcion, ...filas)));
    const panel = el(d, 'div', { 'data-testid': 'drawer-right', 'data-prueba': 'info-contacto' },
      el(d, 'span', {}, el(d, 'div', { tabindex: '-1', style: 'width: 400px' }, el(d, 'span', {}, el(d, 'div', {},
        el(d, 'div', { class: 'copyable-area', 'data-testid': 'chat-info-drawer' }, cabecera, cuerpo))))));
    this.app.append(panel);
    return panel;
  }

  /**
   * Panel flotante de una llamada en curso con la estructura OBSERVADA en
   * WhatsApp Web real (diagnóstico sobre 0.1.2, llamada de voz): fuera de
   * `#main`, `move_resize_component` › `voip-container-audio-call`, con el
   * avatar, el nombre (`voip-call-participant-info-name` › `span[dir="auto"]`), el
   * estado (`voip-call-participant-info-call-state-text`), la duración
   * (`voip-call-timer`, `role="timer"`) y una barra de controles aparte.
   * SUPUESTOS: el anidamiento intermedio, que el estado sea un `span`, el
   * `role="toolbar"` de la barra y sus botones.
   */
  abrirPanelLlamada(datos: { readonly nombre: string; readonly estado?: string; readonly duracion?: string }): HTMLElement {
    const d = this.documento;
    this.cerrarPanelLlamada();
    const boton = (etiqueta: string, nombreIcono: string) => {
      const elemento = el(d, 'button', { type: 'button', 'aria-label': etiqueta, 'data-prueba': `control-${etiqueta}` }, iconoSvg(d, nombreIcono));
      elemento.addEventListener('click', () => {
        this.clics.set(etiqueta, (this.clics.get(etiqueta) ?? 0) + 1);
        if (etiqueta === 'Colgar') this.cerrarPanelLlamada();
      });
      return elemento;
    };
    const panel = el(d, 'div', { 'data-testid': 'move_resize_component', 'data-prueba': 'panel-llamada', style: 'position: fixed; right: 16px; bottom: 16px; width: 320px' },
      el(d, 'div', { 'data-testid': 'voip-container-audio-call' },
        el(d, 'div', {}, el(d, 'img', { src: URL_FOTO_PERFIL, alt: '', width: '64', height: '64', 'data-prueba': 'avatar-llamada' })),
        el(d, 'div', { 'data-testid': 'voip-call-participant-info-name', 'data-prueba': 'contenedor-nombre-llamada' },
          el(d, 'span', { dir: 'auto', 'data-prueba': 'nombre-llamada' }, datos.nombre)),
        el(d, 'div', { 'data-testid': 'voip-call-participant-info-call-state-text', 'data-prueba': 'estado-llamada' },
          el(d, 'span', {}, datos.estado ?? 'Cifrada de extremo a extremo')),
        el(d, 'span', { 'data-testid': 'voip-call-timer', role: 'timer', 'data-prueba': 'duracion-llamada' }, datos.duracion ?? '00:42')),
      el(d, 'div', { role: 'toolbar', 'data-prueba': 'controles-llamada' },
        boton('Silenciar', 'wds-ic-mic'), boton('Cámara', 'wds-ic-videocam'), boton('Colgar', 'wds-ic-call-end')));
    this.app.append(panel);
    return panel;
  }

  cerrarPanelLlamada(): void {
    this.documento.querySelector('[data-prueba="panel-llamada"]')?.remove();
  }

  /** Nombres de las menciones insertadas en el editor, en orden. */
  readonly mencionesInsertadas: string[] = [];
  private controlMenciones: AbortController | null = null;

  /**
   * Lista de sugerencias de menciones (`@`) de un grupo.
   *
   * OBSERVADO en WhatsApp Web real (Chrome, diagnóstico anonimizado sobre 0.1.3):
   * - la lista está fuera de `#main`;
   * - cada participante es un `button` cuyo hijo directo es
   *   `[data-testid="contact-mention-list-item"]`, con el avatar (`img`), el
   *   nombre en `[data-testid="mention-primary"]` › `span[dir="auto"]` y
   *   `[data-testid="mention-secondary"]` sin texto;
   * - la opción «todos» es `[data-testid="mention-all-list-item"]`, con «todos»
   *   y una descripción genérica;
   * - el editor usa `aria-autocomplete`, `aria-owns` y `aria-activedescendant`.
   *
   * SUPUESTO: el contenedor (`role="listbox"`; aquí en el flujo del documento,
   * para no tapar otras zonas en las pruebas), los `id`, que
   * «todos» vaya también en un `button`, su icono, su interior (aquí, con su
   * propio `mention-primary`, el caso más desfavorable para comprobar que no se
   * difumina) y la interacción: el foco se queda en el editor; las flechas
   * cambian `aria-activedescendant` y `aria-selected`; Intro o un clic insertan
   * la mención y cierran la lista.
   */
  abrirMenciones(participantes: readonly string[]): HTMLElement {
    const d = this.documento;
    this.cerrarMenciones();
    const editor = this.editor;
    const control = new AbortController();
    this.controlMenciones = control;
    const fila = (indice: number, contenido: HTMLElement) => {
      const boton = el(d, 'button', { type: 'button', role: 'option', id: `prueba-mencion-${indice}`, tabindex: '-1', 'aria-selected': 'false', 'data-prueba': 'fila-mencion' }, contenido);
      boton.addEventListener('click', () => {
        insertar(indice);
      });
      return boton;
    };
    const todos = fila(0, el(d, 'div', { 'data-testid': 'mention-all-list-item', 'data-prueba': 'mencion-todos' },
      el(d, 'div', {}, icono(d, 'wds-ic-mention')),
      el(d, 'div', { 'data-testid': 'mention-primary', 'data-prueba': 'nombre-mencion-todos' }, el(d, 'span', { dir: 'auto' }, 'todos')),
      el(d, 'div', { 'data-testid': 'mention-secondary', 'data-prueba': 'descripcion-mencion-todos' }, el(d, 'span', { dir: 'auto' }, 'Notificar a todos los participantes'))));
    const filas = [todos, ...participantes.map((nombre, i) =>
      fila(i + 1, el(d, 'div', { 'data-testid': 'contact-mention-list-item', 'data-prueba': 'mencion-contacto' },
        el(d, 'div', {}, el(d, 'img', { src: URL_FOTO_PERFIL, alt: '', width: '32', height: '32', 'data-prueba': 'avatar-mencion' })),
        el(d, 'div', {},
          el(d, 'div', { 'data-testid': 'mention-primary', 'data-prueba': 'contenedor-nombre-mencion' }, el(d, 'span', { dir: 'auto', 'data-prueba': 'nombre-mencion' }, nombre)),
          el(d, 'div', { 'data-testid': 'mention-secondary', 'data-prueba': 'secundario-mencion' })))))];
    const lista = el(d, 'div', { role: 'listbox', id: 'prueba-menciones', 'data-prueba': 'menciones', style: 'width: 300px; display: flex; flex-direction: column' }, ...filas);
    let actual = 1;
    const seleccionar = (indice: number) => {
      actual = Math.max(0, Math.min(filas.length - 1, indice));
      filas.forEach((f, i) => {
        f.setAttribute('aria-selected', String(i === actual));
      });
      editor.setAttribute('aria-activedescendant', requerir(filas[actual], 'fila').id);
    };
    const insertar = (indice: number) => {
      const nombre = indice === 0 ? 'todos' : requerir(participantes[indice - 1], 'participante');
      this.mencionesInsertadas.push(nombre);
      requerir(editor.querySelector('p'), 'párrafo').replaceChildren(el(d, 'span', { 'data-prueba': 'mencion-insertada' }, `@${nombre}`), ' ');
      this.cerrarMenciones();
      editor.focus();
    };
    editor.addEventListener('keydown', (evento) => {
      if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
        evento.preventDefault();
        seleccionar(actual + (evento.key === 'ArrowDown' ? 1 : -1));
      } else if (evento.key === 'Enter') {
        evento.preventDefault();
        insertar(actual);
      } else if (evento.key === 'Escape') {
        this.cerrarMenciones();
      }
    }, { signal: control.signal });
    editor.setAttribute('aria-autocomplete', 'list');
    editor.setAttribute('aria-owns', lista.id);
    this.app.append(lista);
    seleccionar(1);
    return lista;
  }

  cerrarMenciones(): void {
    this.controlMenciones?.abort();
    this.controlMenciones = null;
    this.documento.querySelector('[data-prueba="menciones"]')?.remove();
    const editor = this.documento.querySelector('#main footer [contenteditable="true"]');
    for (const atributo of ['aria-owns', 'aria-activedescendant']) editor?.removeAttribute(atributo);
  }

  cerrarInfoContacto(): void {
    this.documento.querySelector('[data-prueba="info-contacto"]')?.remove();
  }

  /** Cierra el recuadro «Responder», como la X o el envío del mensaje. */
  cancelarRespuesta(): void {
    this.principal.querySelector('footer [data-testid="popup_panel"]')?.remove();
  }

  /** Simula la carga de mensajes anteriores al desplazarse hacia arriba. */
  cargarMensajesAnteriores(mensajes: readonly MensajeObservado[]): HTMLElement[] {
    const filas = mensajes.map((m) => this.crearMensajeObservado(m));
    requerir(this.principal.querySelector('[role="application"]'), 'lista de mensajes').prepend(...filas);
    return filas;
  }

  /**
   * Panel «Nuevo chat» (estructura SUPUESTA, no observada): fuera de
   * `#pane-side`, con filas `[role="listitem"] > [role="button"]` que contienen
   * un avatar SVG y el nombre en `span[dir="auto"][title]`. Incluye filas de
   * acciones con icono (sin avatar), un encabezado de sección y un buscador.
   */
  abrirNuevoChat(contactos: readonly ContactoNuevoChat[]): HTMLElement {
    const d = this.documento;
    const accion = (etiqueta: string, nombreIcono: string) =>
      el(d, 'div', { role: 'button', tabindex: '0', 'data-prueba': 'accion' },
        iconoSvg(d, nombreIcono), el(d, 'span', { dir: 'auto', title: etiqueta }, etiqueta));
    const panel = el(d, 'div', { 'data-prueba': 'nuevo-chat' },
      el(d, 'header', {}, el(d, 'button', { type: 'button', 'aria-label': 'Atrás' }, iconoSvg(d, 'wds-ic-back')),
        el(d, 'h1', {}, 'Nuevo chat')),
      el(d, 'div', {}, el(d, 'input', { type: 'text', 'aria-label': 'Buscar un nombre o un número', 'data-prueba': 'buscador' })),
      el(d, 'div', { 'data-prueba': 'lista-nuevo-chat' },
        accion('Nuevo grupo', 'wds-ic-group-add'),
        accion('Nueva comunidad', 'wds-ic-community'),
        el(d, 'div', { 'data-prueba': 'seccion' }, 'Contactos en WhatsApp'),
        ...contactos.map((c) => this.crearFilaNuevoChat(c))),
    );
    this.app.append(panel);
    return panel;
  }

  crearFilaNuevoChat({ nombre, info = 'Disponible', avatar, sinBotonInterior }: ContactoNuevoChat): HTMLElement {
    const d = this.documento;
    const contenido = avatar === 'svgImagen' ? crearImagenSvg(d) : crearForeignObject(d);
    const svg = crearSvgConMascara(d, contenido);
    svg.setAttribute('data-prueba', 'avatar-nuevo-chat');
    const interior = [
      el(d, 'div', {}, svg),
      el(d, 'div', {},
        el(d, 'span', { dir: 'auto', title: nombre, 'data-prueba': 'nombre-nuevo-chat' }, nombre),
        el(d, 'span', { title: info, 'data-prueba': 'info-nuevo-chat' }, info)),
    ];
    return sinBotonInterior
      ? el(d, 'div', { role: 'listitem', tabindex: '0', 'data-prueba': 'fila-nuevo-chat' }, ...interior)
      : el(d, 'div', { role: 'listitem', 'data-prueba': 'fila-nuevo-chat' },
        el(d, 'div', { role: 'button', tabindex: '0' }, ...interior));
  }

  /** Simula la carga posterior de contactos: cada fila se añade como un nodo independiente. */
  agregarFilasNuevoChat(contactos: readonly ContactoNuevoChat[]): HTMLElement[] {
    const lista = requerir(this.documento.querySelector('[data-prueba="lista-nuevo-chat"]'), 'lista');
    const filas = contactos.map((c) => this.crearFilaNuevoChat(c));
    for (const fila of filas) lista.append(fila);
    return filas;
  }

  #contadorFilasNuevoChat = 0;

  /**
   * «Nuevo chat» con la estructura OBSERVADA en WhatsApp Web real
   * (diagnóstico anonimizado del propietario sobre 0.1.1-beta.1):
   * `[data-testid="new-chat-drawer"]` > `[data-testid="contact-list-key"]` >
   * `[role="listitem"][data-testid^="list-item-"]` > `[role="button"]` >
   * `[data-testid="cell-frame-container"]` > `[role="gridcell"]` >
   * `span[dir][title]`, y las acciones `new-chat-drawer-new-*-cell`.
   *
   * Desde 0.1.2-beta.2, también OBSERVADO (diagnóstico de paneles sobre
   * 0.1.2-beta.1): la celda tiene dos columnas, la del avatar (círculo con la
   * foto o con un SVG predeterminado sobre fondo de color; ver
   * `crearFilaObservada`) y la del texto (`gridcell` › `cell-frame-title`, y
   * `cell-frame-secondary`); y la fila «Tú» usa `message-yourself-row`.
   *
   * No observado, representado de forma neutra: el contenido de la línea de
   * información, el encabezado y el buscador. Las acciones se colocan en el
   * peor caso: también como filas `list-item-*` con un icono en un círculo de
   * color, para comprobar que se excluyen (en el DOM real están fuera de esas
   * filas).
   */
  abrirNuevoChatObservado(contactos: readonly string[], opciones: { readonly filaTu?: AvatarObservado } = {}): HTMLElement {
    const d = this.documento;
    const accion = (testId: string, etiqueta: string, icono: string) =>
      this.#filaObservada(
        el(d, 'div', { role: 'button', tabindex: '0', 'data-testid': testId, 'data-prueba': 'accion-observada' },
          el(d, 'div', { 'data-testid': 'cell-frame-container' },
            el(d, 'div', {}, el(d, 'div', { style: 'width:49px;height:49px;border-radius:50%;background:#00a884', 'data-prueba': 'icono-accion' },
              iconoSvg(d, icono))),
            el(d, 'div', {}, el(d, 'div', { role: 'gridcell' }, el(d, 'span', { dir: 'auto', title: etiqueta }, etiqueta))))),
      );
    const panel = el(d, 'div', { 'data-testid': 'new-chat-drawer' },
      el(d, 'div', { 'data-prueba': 'encabezado-nuevo-chat' }, el(d, 'span', { dir: 'auto', title: 'Nuevo chat' }, 'Nuevo chat')),
      el(d, 'div', {}, el(d, 'input', { type: 'text', 'aria-label': 'Buscar un nombre o un número', 'data-prueba': 'buscador-observado' })),
      accion('new-chat-drawer-new-group-cell', 'Nuevo grupo', 'wds-ic-group-add'),
      accion('new-chat-drawer-new-contact-cell', 'Nuevo contacto', 'wds-ic-person-add'),
      accion('new-chat-drawer-new-community-cell', 'Nueva comunidad', 'wds-ic-communities-filled'),
      // Encabezado de sección en el peor caso: también como fila `list-item-*`, sin `span[dir][title]`.
      this.#filaObservada(el(d, 'div', { 'data-prueba': 'seccion-observada' }, 'Contactos en WhatsApp')),
      el(d, 'div', { 'data-testid': 'contact-list-key' },
        ...(opciones.filaTu ? [this.crearFilaTu(opciones.filaTu)] : []),
        ...contactos.map((c, i) => this.crearFilaObservada(c, INFOS_OBSERVADAS[i % INFOS_OBSERVADAS.length], avatarObservado(i)))),
    );
    this.app.append(panel);
    return panel;
  }

  #filaObservada(contenido: Node): HTMLElement {
    const numero = String(++this.#contadorFilasNuevoChat);
    return el(this.documento, 'div', { role: 'listitem', 'data-testid': `list-item-${numero}` }, contenido);
  }

  /**
   * Columna del avatar con la estructura OBSERVADA (0.1.2-beta.1): columna ›
   * `div` › círculo de 49 × 49 px › foto (`img` de `pps.whatsapp.net`) o, sin
   * foto, `div` › `span` › `svg` con `path` sobre un fondo de color. El valor
   * del `<title>` del SVG no se conoce (solo su longitud, 16); se usa uno
   * neutro de esa longitud.
   */
  crearColumnaAvatar(avatar: AvatarObservado): HTMLElement {
    const d = this.documento;
    const contenido =
      avatar === 'foto'
        ? el(d, 'img', { src: URL_FOTO_PERFIL, alt: '', width: '49', height: '49', tabindex: '-1', 'data-prueba': 'avatar-foto' })
        : el(d, 'div', {}, el(d, 'span', {},
          (() => {
            const svg = iconoSvg(d, 'abcdefghijklmnop');
            svg.setAttribute('width', '49');
            svg.setAttribute('height', '49');
            svg.setAttribute('style', `border-radius:50%;background-color:${COLORES_AVATAR[Number(avatar.slice(-1))] ?? '#ccc'}`);
            svg.setAttribute('data-prueba', 'avatar-predeterminado');
            svg.append(d.createElementNS('http://www.w3.org/2000/svg', 'path'));
            return svg;
          })()));
    return el(d, 'div', { style: 'width:77px;height:72px', 'data-prueba': 'avatar-columna' },
      el(d, 'div', {}, el(d, 'div', { style: 'width:49px;height:49px;border-radius:50%', 'data-prueba': 'avatar-circulo' }, contenido)));
  }

  /** Fila «Tú» con la estructura OBSERVADA: `message-yourself-row` en lugar de `cell-frame-container`. */
  crearFilaTu(avatar: AvatarObservado): HTMLElement {
    const d = this.documento;
    const fila = this.#filaObservada(
      el(d, 'div', { role: 'button', tabindex: '0' },
        el(d, 'div', { 'data-testid': 'message-yourself-row' },
          this.crearColumnaAvatar(avatar),
          el(d, 'div', {},
            el(d, 'div', { role: 'gridcell' },
              el(d, 'div', { 'data-testid': 'cell-frame-title' },
                el(d, 'div', {}, el(d, 'span', { dir: 'auto', title: 'Yo', 'data-prueba': 'nombre-tu' }, 'Yo'),
                  el(d, 'span', { 'data-testid': 'you-label' }, '(Tú)')))),
            el(d, 'div', { 'data-testid': 'cell-frame-secondary' }, el(d, 'span', {}, 'Envíate un mensaje'))))),
    );
    fila.setAttribute('data-prueba', 'fila-tu');
    return fila;
  }

  /**
   * Fila de contacto con la estructura observada: columna del avatar y
   * columna de texto (`gridcell` › `cell-frame-title` con el nombre). La
   * información secundaria no está observada: se representa con varias formas
   * (`InfoObservada`) para no suponer que usa los mismos atributos que el
   * nombre; la forma «sin atributos» va en `cell-frame-secondary`. Incluye, en
   * el peor caso, un bloque con un icono y un botón como hijo directo de la
   * celda, que nunca debe difuminarse.
   */
  crearFilaObservada(nombre: string, info: InfoObservada = 'spanTitle', avatar: AvatarObservado = 'foto'): HTMLElement {
    const d = this.documento;
    const infos: Node[] = [];
    if (info === 'spanTitle') infos.push(el(d, 'span', { title: 'Disponible', 'data-prueba': 'info-observada' }, 'Disponible'));
    if (info === 'textoSinAtributos') infos.push(el(d, 'div', {}, el(d, 'span', { 'data-prueba': 'info-observada' }, 'Hola, estoy usando WhatsApp')));
    if (info === 'emoji') {
      infos.push(el(d, 'span', { 'data-prueba': 'info-observada' }, 'De vacaciones ',
        el(d, 'img', { class: 'emoji', alt: '🏖️', src: FOTO, width: '16', height: '16' })));
    }
    const fila = this.#filaObservada(
      el(d, 'div', { role: 'button', tabindex: '0' },
        el(d, 'div', { 'data-testid': 'cell-frame-container' },
          this.crearColumnaAvatar(avatar),
          el(d, 'div', {},
            el(d, 'div', { role: 'gridcell' },
              el(d, 'div', { 'data-testid': 'cell-frame-title' },
                el(d, 'div', {}, el(d, 'span', { dir: 'auto', title: nombre, 'data-prueba': 'nombre-observado' }, nombre))),
              ...(info === 'textoSinAtributos' ? [] : infos)),
            ...(info === 'textoSinAtributos' ? [el(d, 'div', { 'data-testid': 'cell-frame-secondary' }, ...infos)] : [])),
          el(d, 'div', { 'data-prueba': 'funcional-observado' },
            iconoSvg(d, 'wds-ic-verified'),
            el(d, 'button', { type: 'button', 'aria-label': 'Más opciones' }, 'Más')))),
    );
    fila.setAttribute('data-prueba', 'fila-observada');
    return fila;
  }

  get filasObservadas(): HTMLElement[] {
    return [...this.documento.querySelectorAll<HTMLElement>('[data-prueba="fila-observada"]')];
  }

  /** Carga posterior o virtualizada: cada fila se añade como nodo independiente. */
  agregarContactosObservados(nombres: readonly string[]): HTMLElement[] {
    const lista = requerir(this.documento.querySelector('[data-testid="contact-list-key"]'), 'lista de contactos');
    const filas = nombres.map((n, i) => this.crearFilaObservada(n, INFOS_OBSERVADAS[i % INFOS_OBSERVADAS.length], avatarObservado(i)));
    for (const fila of filas) lista.append(fila);
    return filas;
  }

  /** Búsqueda: los contactos se sustituyen por los resultados. */
  buscarContactosObservados(nombres: readonly string[]): void {
    for (const fila of this.filasObservadas) fila.remove();
    this.agregarContactosObservados(nombres);
  }

  /** Desplazamiento en la lista virtualizada: la fila se reutiliza para otro contacto. */
  reutilizarFilaObservada(indice: number, nombre: string, info: InfoObservada = 'emoji', avatar: AvatarObservado = 'predeterminado0'): void {
    this.filasObservadas[indice]?.replaceChildren(...this.crearFilaObservada(nombre, info, avatar).childNodes);
  }

  cerrarNuevoChatObservado(): void {
    this.documento.querySelector('[data-testid="new-chat-drawer"]')?.remove();
  }

  get filasNuevoChat(): HTMLElement[] {
    return [...this.documento.querySelectorAll<HTMLElement>('[data-prueba="fila-nuevo-chat"]')];
  }

  cerrarNuevoChat(): void {
    this.documento.querySelector('[data-prueba="nuevo-chat"]')?.remove();
  }

  /** Simula una búsqueda: la lista de contactos se sustituye por los resultados. */
  buscarEnNuevoChat(resultados: readonly ContactoNuevoChat[]): void {
    for (const fila of this.filasNuevoChat) fila.remove();
    requerir(this.documento.querySelector('[data-prueba="lista-nuevo-chat"]'), 'lista').append(
      ...resultados.map((c) => this.crearFilaNuevoChat(c)),
    );
  }

  /** Simula el desplazamiento de la lista virtualizada: la fila se reutiliza para otro contacto. */
  reutilizarFilaNuevoChat(indice: number, contacto: ContactoNuevoChat): void {
    this.filasNuevoChat[indice]?.replaceChildren(...this.crearFilaNuevoChat(contacto).childNodes);
  }

  /** Simula la carga posterior de la foto: el avatar predeterminado pasa a ser una imagen. */
  cargarFotoNuevoChat(indice: number): void {
    this.filasNuevoChat[indice]?.querySelector('foreignObject')?.replaceWith(crearImagenSvg(this.documento));
  }

  get filasMensaje(): HTMLElement[] {
    return [...this.principal.querySelectorAll<HTMLElement>('[data-id]')];
  }

  get contenedoresMensaje(): HTMLElement[] {
    return [...this.principal.querySelectorAll<HTMLElement>('[data-testid="msg-container"]')];
  }

  abrirConversacion(nombre: string, mensajes: readonly Mensaje[]): void {
    this.principal.replaceWith(this.crearConversacion(nombre, mensajes));
  }

  agregarMensaje(mensaje: Mensaje): HTMLElement {
    const fila = this.crearMensaje(mensaje);
    this.principal.querySelector('[role="application"]')?.append(fila);
    return fila;
  }

  desmontar(): void {
    this.app.remove();
  }
}

export const CHATS_EJEMPLO: readonly Chat[] = [
  { nombre: 'Ana García', vistaPrevia: '¿Nos vemos mañana?', noLeidos: 2 },
  { nombre: 'Equipo Veilix', vistaPrevia: 'Luis: revisad la fase 2' },
  { nombre: 'Banco', vistaPrevia: 'Tu código es 123456' },
];

export const MENSAJES_EJEMPLO: readonly Mensaje[] = [
  { texto: 'Hola, ¿qué tal?', direccion: 'entrante' },
  { texto: 'Todo bien, gracias', direccion: 'saliente' },
];

export function montarWhatsAppSimulado(documento: Document = document): WhatsAppSimulado {
  return new WhatsAppSimulado(documento, CHATS_EJEMPLO, {
    nombre: 'Ana García',
    mensajes: MENSAJES_EJEMPLO,
  });
}

/** Chats con todas las representaciones de avatar contempladas. */
export const CHATS_AVATARES: readonly Chat[] = [
  { nombre: 'Contacto SVG con foto', vistaPrevia: 'Hola', avatar: 'svgImagen', noLeidos: 1 },
  { nombre: 'Grupo SVG sin foto', vistaPrevia: 'Eva: vale', avatar: 'svgForeignObject' },
  { nombre: 'Contacto con foto', vistaPrevia: 'Hola', avatar: 'fotoPerfil', noLeidos: 3 },
  { nombre: 'Grupo con foto', vistaPrevia: 'Ana: hola', avatar: 'fondo' },
  { nombre: 'Contacto sin foto', vistaPrevia: 'Adiós', avatar: 'predeterminadoContacto', emojiEnNombre: true },
  { nombre: 'Grupo sin foto', vistaPrevia: 'Luis: ok', avatar: 'predeterminadoGrupo' },
];

export function montarWhatsAppConAvatares(documento: Document = document): WhatsAppSimulado {
  return new WhatsAppSimulado(documento, CHATS_AVATARES, {
    nombre: 'Grupo con foto',
    mensajes: MENSAJES_EJEMPLO,
  });
}

/** Formas de la información secundaria en el DOM simulado (no observada en el DOM real). */
export type InfoObservada = 'spanTitle' | 'textoSinAtributos' | 'emoji' | 'ninguna';

/** Avatar de una fila de «Nuevo chat»: foto o uno de los seis avatares predeterminados (colores distintos). */
export type AvatarObservado = 'foto' | `predeterminado${0 | 1 | 2 | 3 | 4 | 5}`;
const COLORES_AVATAR = ['#d6a2ff', '#7fd3a0', '#ffb36b', '#6bc4ff', '#ff8fa3', '#c7c7c7'] as const;

/**
 * Como en el diagnóstico real (11 fotos y 6 predeterminados en 17 contactos):
 * cada tercer contacto, empezando por el segundo, tiene un avatar predeterminado.
 */
export function avatarObservado(indice: number): AvatarObservado {
  return indice % 3 === 1 ? (`predeterminado${(Math.floor(indice / 3) % 6) as 0 | 1 | 2 | 3 | 4 | 5}` as const) : 'foto';
}
export const INFOS_OBSERVADAS: readonly InfoObservada[] = ['spanTitle', 'textoSinAtributos', 'emoji', 'ninguna'];

export interface ContactoNuevoChat {
  readonly nombre: string;
  readonly info?: string;
  readonly avatar: 'svgImagen' | 'svgForeignObject';
  /**
   * Fila sin `[role="button"]` interior: el único elemento con rol es la
   * propia fila `[role="listitem"]`. Reproduce el caso en que la fila es el
   * nodo añadido (lista virtualizada o contactos cargados después de abrir).
   */
  readonly sinBotonInterior?: boolean;
}

export const CONTACTOS_NUEVO_CHAT: readonly ContactoNuevoChat[] = [
  { nombre: 'Ana García', avatar: 'svgImagen' },
  { nombre: 'Banco', avatar: 'svgForeignObject', info: 'Cuenta de empresa' },
  { nombre: 'Luis', avatar: 'svgForeignObject' },
];

/** Conversación de grupo con remitentes, citas, contacto no guardado, emoji y aviso fijado. */
export const MENSAJES_GRUPO: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Hola a todos', remitente: 'Ana' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Respondo a Ana', remitente: 'Luis', remitenteVisible: '~ Luis', cita: { autor: 'Ana', texto: 'Hola a todos' } },
  { tipo: 'texto', direccion: 'entrante', texto: 'Buenas', remitente: 'Eva', emojiRemitente: '🌸' },
  { tipo: 'texto', direccion: 'saliente', texto: 'Hola', cita: { autor: 'Luis', texto: 'Respondo a Ana' } },
];

/**
 * Grupo con los casos del diagnóstico real de remitentes (0.1.2-beta.0): autores
 * `[data-testid="author"]` en sus variantes, contactos guardados y no guardados
 * con un nombre visible distinto de `data-pre-plain-text` (que muestra un
 * teléfono), nombres con «~», emojis, símbolos y texto con forma de etiqueta
 * HTML, y multimedia sin bloque de texto.
 */
export const MENSAJES_AUTORES: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Hola, soy Ana', remitente: 'Ana', autor: 'boton' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje de un no guardado', remitente: '+57 300 0000001', remitenteVisible: '~ Pedro', emojiRemitente: '🎸', autor: 'boton' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Con símbolos', remitente: '+57 300 0000002', remitenteVisible: '~ <b>DJ</b> ★ Ñandú_99', autor: 'span' },
  { tipo: 'foto', direccion: 'entrante', remitente: 'Eva', remitenteVisible: '~ Eva', autor: 'anidado' },
  { tipo: 'video', direccion: 'entrante', remitente: '+57 300 0000003', remitenteVisible: '~ Luz ✨', autor: 'anidadoInverso' },
  // Anidado y con el mismo nombre que su metadato: el marcador por texto marca el `span` interior.
  { tipo: 'texto', direccion: 'entrante', texto: 'Guardada con autor anidado', remitente: 'Sofía', autor: 'anidado' },
  { tipo: 'texto', direccion: 'saliente', texto: 'Mi respuesta' },
];

/**
 * Grupo con avatares de participantes junto a los mensajes (diagnóstico real de
 * avatares en grupos sobre 0.1.2-beta.2): foto, inicial y silueta (supuesta),
 * en las dos posiciones supuestas, con mensajes consecutivos del mismo autor
 * (sin avatar) y multimedia.
 */
export const MENSAJES_AVATARES_GRUPO: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Hola, soy Marta', remitente: 'Marta', autor: 'boton', avatarGrupo: 'inicial' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Segundo mensaje seguido', remitente: 'Marta' },
  { tipo: 'foto', direccion: 'entrante', remitente: 'Ana', autor: 'boton', avatarGrupo: 'foto', posicionAvatar: 'mensaje' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Desde un número', remitente: '+57 300 0000004', remitenteVisible: '~ Bruno', autor: 'span', avatarGrupo: 'inicial', posicionAvatar: 'mensaje' },
  { tipo: 'video', direccion: 'entrante', remitente: '+57 300 0000005', remitenteVisible: '~ Sara', autor: 'boton', avatarGrupo: 'silueta', reaccion: 'texto' },
  { tipo: 'texto', direccion: 'saliente', texto: 'Mi mensaje' },
];

export function montarWhatsAppConAvataresGrupo(documento: Document = document): WhatsAppSimulado {
  const wa = montarWhatsAppSimulado(documento);
  wa.abrirConversacionObservada('Grupo de prueba', MENSAJES_AVATARES_GRUPO);
  return wa;
}

export function montarWhatsAppConAutores(documento: Document = document): WhatsAppSimulado {
  const wa = montarWhatsAppSimulado(documento);
  wa.abrirConversacionObservada('Grupo de prueba', MENSAJES_AUTORES);
  return wa;
}

export function montarWhatsAppConGrupo(documento: Document = document): WhatsAppSimulado {
  const wa = montarWhatsAppSimulado(documento);
  wa.abrirConversacionObservada('Grupo de prueba', MENSAJES_GRUPO, { autor: 'Ana', texto: 'Reunión el lunes' });
  return wa;
}

/** Conversación de grupo con todos los tipos de mensaje contemplados. */
export const MENSAJES_OBSERVADOS: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje recibido secreto', remitente: 'Ana' },
  { tipo: 'texto', direccion: 'saliente', texto: 'Mensaje enviado secreto', reaccion: 'imagen' },
  { tipo: 'foto', direccion: 'entrante', remitente: 'Luis' },
  { tipo: 'fotoConDescripcion', direccion: 'saliente', texto: 'Descripción secreta' },
  { tipo: 'fotoSinDescargar', direccion: 'entrante', remitente: 'Eva' },
  { tipo: 'video', direccion: 'saliente', reaccion: 'fuera', hora: '10:41\u202fp.\u00a0m.' },
  { tipo: 'texto', direccion: 'entrante', texto: '🎉', remitente: 'Ana', reaccion: 'texto', hora: '9:05 PM' },
];

/**
 * Conversación con dos vídeos dibujados como fondos `data:image/jpeg` (vertical
 * arriba, horizontal abajo), como en el diagnóstico real, además de una foto,
 * un vídeo con `<video>` y un sticker. Las capas son `hermanas` o `anidadas`.
 */
export function mensajesConVideos(capas: 'hermanas' | 'anidadas' = 'hermanas'): readonly MensajeObservado[] {
  return [
    { tipo: 'videoMiniatura', direccion: 'entrante', remitente: 'Ana', miniaturaVideo: { orientacion: 'vertical', capas } },
    { tipo: 'videoMiniatura', direccion: 'saliente', miniaturaVideo: { orientacion: 'horizontal', capas } },
    { tipo: 'foto', direccion: 'entrante', remitente: 'Luis' },
    { tipo: 'video', direccion: 'saliente' },
    { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje secreto', remitente: 'Ana' },
  ];
}

/**
 * Conversación con documentos adjuntos: PNG y JPG (OBSERVADOS), y PDF y DOCX
 * (variantes simuladas, no observadas), uno con un nombre largo y otro con
 * descripción, además de una foto, un vídeo y un texto con una tarjeta que no
 * es un documento.
 */
export const MENSAJES_DOCUMENTOS: readonly MensajeObservado[] = [
  { tipo: 'documento', direccion: 'entrante', remitente: 'Ana', documento: { nombre: 'captura-secreta.png', formato: 'PNG', tamano: '245 kB', descripcion: 'Descripción secreta' } },
  { tipo: 'documento', direccion: 'saliente', documento: { nombre: 'foto_del_contrato_privado_firmado_por_todas_las_partes_version_final_definitiva.jpg', formato: 'JPG', tamano: '1,2 MB' } },
  { tipo: 'documento', direccion: 'entrante', remitente: 'Luis', documento: { nombre: 'informe.pdf', formato: 'PDF', tamano: '3 MB' } },
  { tipo: 'documento', direccion: 'saliente', documento: { nombre: 'acta.docx', formato: 'DOCX', tamano: '18 kB', etiquetaAntes: true } },
  { tipo: 'foto', direccion: 'entrante', remitente: 'Eva' },
  { tipo: 'video', direccion: 'saliente' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje secreto', remitente: 'Ana' },
];

/**
 * Conversación con citas con miniatura (respuestas a un estado, muy
 * probablemente): dos con duración (una de más de una hora) y una sin
 * duración ni texto citado; además, una cita convencional sin miniatura, una
 * foto, un vídeo con `<video>` y una miniatura de vídeo.
 */
export const MENSAJES_CITAS_MINIATURA: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Respuesta secreta', citaConMiniatura: { encabezado: 'Tú · Estados', duracion: '0:18', texto: 'Estado secreto' } },
  { tipo: 'texto', direccion: 'entrante', texto: 'Otra respuesta', citaConMiniatura: { encabezado: 'Tú · Estados', duracion: '1:02:07', texto: 'Otro estado' } },
  { tipo: 'texto', direccion: 'entrante', texto: 'Sin texto citado', citaConMiniatura: { encabezado: 'Tú · Estados' } },
  { tipo: 'texto', direccion: 'saliente', texto: 'Respuesta normal', cita: { autor: 'Ana', texto: 'Cita normal' } },
  { tipo: 'foto', direccion: 'entrante' },
  { tipo: 'video', direccion: 'saliente' },
  { tipo: 'videoMiniatura', direccion: 'entrante', miniaturaVideo: { orientacion: 'horizontal' } },
];

/**
 * Conversación para el encabezado de los estados citados: el estado observado
 * («Tú · Estados»), dos variantes simuladas («Ana · Estado» y «You · Status»)
 * y citas convencionales que comparten su estructura (casos negativos): con
 * autor, sin autor («Tú», la cita supuesta de un mensaje propio), con un
 * texto citado que acaba en «Estados», con un autor que se llama así y con un
 * encabezado «Estados» sin separador.
 */
export const MENSAJES_ENCABEZADOS_CITA: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Respuesta secreta', citaConMiniatura: { encabezado: 'Tú · Estados', duracion: '0:18', texto: 'Hola!' } },
  { tipo: 'texto', direccion: 'saliente', texto: 'Otra respuesta', citaConMiniatura: { encabezado: 'Ana · Estado' } },
  { tipo: 'texto', direccion: 'entrante', texto: 'Reply', citaConMiniatura: { encabezado: 'You · Status' } },
  { tipo: 'texto', direccion: 'saliente', texto: 'Respuesta 1', citaConvencional: { encabezado: 'Ana', texto: 'Texto citado', conAutor: true } },
  { tipo: 'texto', direccion: 'entrante', texto: 'Respuesta 2', citaConvencional: { encabezado: 'Tú', texto: 'Mi mensaje', conAutor: false } },
  { tipo: 'texto', direccion: 'entrante', texto: 'Respuesta 3', citaConvencional: { encabezado: 'Luis', texto: 'Viaje · Estados', conAutor: false } },
  { tipo: 'texto', direccion: 'saliente', texto: 'Respuesta 4', citaConvencional: { encabezado: 'Ana · Estados', texto: 'Hola', conAutor: true } },
  { tipo: 'texto', direccion: 'entrante', texto: 'Respuesta 5', citaConvencional: { encabezado: 'Estados', texto: 'Hola', conAutor: false } },
];

/** Conversación con tarjetas de llamada (estados y duración) y, para comparar, un texto, una foto y un vídeo. */
export const MENSAJES_LLAMADAS: readonly MensajeObservado[] = [
  { tipo: 'llamada', direccion: 'entrante', llamada: { titulo: 'Llamada de voz perdida', detalle: 'Toca para volver a llamar' } },
  { tipo: 'llamada', direccion: 'saliente', llamada: { titulo: 'Llamada de voz', detalle: 'Sin respuesta' } },
  { tipo: 'llamada', direccion: 'saliente', llamada: { titulo: 'Llamada', detalle: 'Llamando…' } },
  { tipo: 'llamada', direccion: 'entrante', llamada: { titulo: 'Videollamada', detalle: '12:05' } },
  { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje secreto' },
  { tipo: 'foto', direccion: 'saliente' },
];

export function montarWhatsAppConMensajesObservados(documento: Document = document): WhatsAppSimulado {
  const wa = montarWhatsAppSimulado(documento);
  wa.abrirConversacionObservada('Grupo de prueba', MENSAJES_OBSERVADOS);
  return wa;
}

/**
 * Chats con el indicador de leído confirmado e iconos ajenos observados en el
 * DOM real (`wds-ic-sticker`, `wds-ic-disappearing-messages`), además de un
 * chat fijado y un caso negativo.
 */
export const CHATS_ESTADOS: readonly Chat[] = [
  { nombre: 'Leído', vistaPrevia: 'Te lo envío', leido: true, fijado: true },
  { nombre: 'Sticker leído', vistaPrevia: 'Sticker', leido: true, sticker: true, noLeidos: 1 },
  { nombre: 'Temporal', vistaPrevia: 'Hola', temporal: true },
  { nombre: 'Negativo', vistaPrevia: 'Recibido', leidoEnLineaDelNombre: true },
  { nombre: 'Recibido', vistaPrevia: 'Mensaje de otra persona' },
];

/**
 * Lista con indicadores de estado, conversación con la estructura observada y
 * navegación lateral con iconos ajenos observados (`wds-ic-status`,
 * `wds-ic-whatsapp`).
 */
export function montarWhatsAppConEstados(documento: Document = document): WhatsAppSimulado {
  const wa = new WhatsAppSimulado(documento, CHATS_ESTADOS, { nombre: 'Leído', mensajes: [] });
  wa.abrirConversacionObservada('Leído', MENSAJES_OBSERVADOS);
  const navegacion = el(documento, 'header', { 'data-prueba': 'navegacion' },
    iconoSvg(documento, 'wds-ic-whatsapp'), iconoSvg(documento, 'wds-ic-status'), iconoSvg(documento, 'wds-ic-read'));
  requerir(documento.getElementById('side'), 'panel lateral').prepend(navegacion);
  return wa;
}

/** Chats con vistas previas especiales, junto con casos normales y elementos que no se protegen. */
export const CHATS_VISTAS_ESPECIALES: readonly Chat[] = [
  { nombre: 'Normal', vistaPrevia: 'Texto normal secreto', leido: true },
  { nombre: 'Reacción', vistaPrevia: 'Hola secreto', vistaPreviaEspecial: 'reaccion', noLeidos: 2 },
  { nombre: 'Foto', vistaPrevia: 'Foto', vistaPreviaEspecial: 'imagen', fijado: true },
  { nombre: 'Reacción a foto', vistaPrevia: 'Foto', vistaPreviaEspecial: 'reaccionImagen', leido: true },
];

export function montarWhatsAppConVistasEspeciales(documento: Document = document): WhatsAppSimulado {
  return new WhatsAppSimulado(documento, CHATS_VISTAS_ESPECIALES, { nombre: 'Normal', mensajes: MENSAJES_EJEMPLO });
}

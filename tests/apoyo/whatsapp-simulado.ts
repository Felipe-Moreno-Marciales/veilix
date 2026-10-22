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
  readonly tipo: 'texto' | 'foto' | 'fotoConDescripcion' | 'fotoSinDescargar' | 'video';
  readonly direccion: 'entrante' | 'saliente';
  readonly texto?: string;
  /** Nombre del remitente (mensajes entrantes en grupos), tal como figura en `data-pre-plain-text`. */
  readonly remitente?: string;
  /** Texto visible del remitente si difiere (por ejemplo, «~ Luis» en un contacto no guardado). */
  readonly remitenteVisible?: string;
  /** Emoji del nombre, mostrado como `<img alt>` junto al remitente visible. */
  readonly emojiRemitente?: string;
  /** Cita o respuesta a otro mensaje (estructura SUPUESTA): autor y texto citado. */
  readonly cita?: { readonly autor: string; readonly texto: string };
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
      el(d, 'div', { role: 'application' }, ...mensajes.map((m) => this.crearMensaje(m, boton))),
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
    const { tipo, direccion, texto = '', remitente, remitenteVisible, emojiRemitente, cita, reaccion, hora = '10:40' } = mensaje;
    const numero = String(++this.#contadorMensajes);
    const saliente = direccion === 'saliente';
    const partes: Node[] = [];

    const nombreCompleto = remitente && emojiRemitente ? `${remitente} ${emojiRemitente}` : remitente;
    if (remitente) {
      // Nombre de color sobre el mensaje (estructura SUPUESTA: `span[dir=auto]` con estilo de color).
      partes.push(
        el(d, 'span', { dir: 'auto', 'data-prueba': 'remitente', style: 'color: #d62976' },
          `\u200e${remitenteVisible ?? remitente}${emojiRemitente ? ' ' : ''}`,
          ...(emojiRemitente ? [el(d, 'img', { class: 'emoji', alt: emojiRemitente, src: FOTO, width: '16', height: '16' })] : [])),
      );
    }
    if (cita) {
      partes.push(
        el(d, 'div', { role: 'button', tabindex: '0', 'data-prueba': 'cita' },
          el(d, 'span', { dir: 'auto', 'data-prueba': 'autor-cita' }, cita.autor),
          el(d, 'span', { dir: 'ltr' }, cita.texto)),
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
      case 'video': {
        const video = el(d, 'video', { width: '200', height: '120', 'data-prueba': 'video' });
        partes.push(el(d, 'div', { 'data-prueba': 'multimedia' }, video, this.#botonContado('Reproducir', 'media-play')));
        break;
      }
    }

    partes.push(
      el(d, 'div', { 'data-testid': 'msg-meta' },
        el(d, 'span', { 'data-prueba': 'hora' }, hora),
        ...(saliente ? [iconoLeido(d)] : [])),
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

    return el(
      d,
      'div',
      { role: 'row' },
      el(d, 'div', { 'data-id': `${saliente ? 'true' : 'false'}_prueba_${numero}` },
        el(d, 'div', { 'data-testid': 'msg-container' }, ...partes), ...fuera),
    );
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
   * No observado, representado de forma neutra: el avatar (un `<div>` vacío,
   * porque no es un SVG con la estructura `AVATAR_SVG`), la línea de
   * información (`span[title]` tras el nombre), el encabezado y el buscador.
   * Las acciones se colocan en el peor caso: también como filas
   * `list-item-*`, para comprobar que se excluyen.
   */
  abrirNuevoChatObservado(contactos: readonly string[]): HTMLElement {
    const d = this.documento;
    const accion = (testId: string, etiqueta: string) =>
      this.#filaObservada(
        el(d, 'div', { role: 'button', tabindex: '0', 'data-testid': testId, 'data-prueba': 'accion-observada' },
          el(d, 'div', { 'data-testid': 'cell-frame-container' },
            el(d, 'div', { role: 'gridcell' }, el(d, 'span', { dir: 'auto', title: etiqueta }, etiqueta)))),
      );
    const panel = el(d, 'div', { 'data-testid': 'new-chat-drawer' },
      el(d, 'div', { 'data-prueba': 'encabezado-nuevo-chat' }, el(d, 'span', { dir: 'auto', title: 'Nuevo chat' }, 'Nuevo chat')),
      el(d, 'div', {}, el(d, 'input', { type: 'text', 'aria-label': 'Buscar un nombre o un número', 'data-prueba': 'buscador-observado' })),
      accion('new-chat-drawer-new-group-cell', 'Nuevo grupo'),
      accion('new-chat-drawer-new-contact-cell', 'Nuevo contacto'),
      accion('new-chat-drawer-new-community-cell', 'Nueva comunidad'),
      // Encabezado de sección en el peor caso: también como fila `list-item-*`, sin `span[dir][title]`.
      this.#filaObservada(el(d, 'div', { 'data-prueba': 'seccion-observada' }, 'Contactos en WhatsApp')),
      el(d, 'div', { 'data-testid': 'contact-list-key' }, ...contactos.map((c, i) => this.crearFilaObservada(c, INFOS_OBSERVADAS[i % INFOS_OBSERVADAS.length]))),
    );
    this.app.append(panel);
    return panel;
  }

  #filaObservada(contenido: Node): HTMLElement {
    const numero = String(++this.#contadorFilasNuevoChat);
    return el(this.documento, 'div', { role: 'listitem', 'data-testid': `list-item-${numero}` }, contenido);
  }

  /**
   * Fila de contacto con la estructura observada. La información secundaria
   * no está observada: se representa con varias formas (`InfoObservada`) para
   * no suponer que usa los mismos atributos que el nombre. Incluye un icono y
   * un botón dentro de la celda, que nunca deben difuminarse.
   */
  crearFilaObservada(nombre: string, info: InfoObservada = 'spanTitle'): HTMLElement {
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
          el(d, 'div', { 'data-prueba': 'avatar-no-observado', style: 'width:40px;height:40px' }),
          el(d, 'div', { role: 'gridcell' },
            el(d, 'span', { dir: 'auto', title: nombre, 'data-prueba': 'nombre-observado' }, nombre),
            ...(info === 'textoSinAtributos' ? [] : infos)),
          ...(info === 'textoSinAtributos' ? [el(d, 'div', { role: 'gridcell' }, ...infos)] : []),
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
    const filas = nombres.map((n, i) => this.crearFilaObservada(n, INFOS_OBSERVADAS[i % INFOS_OBSERVADAS.length]));
    for (const fila of filas) lista.append(fila);
    return filas;
  }

  /** Búsqueda: los contactos se sustituyen por los resultados. */
  buscarContactosObservados(nombres: readonly string[]): void {
    for (const fila of this.filasObservadas) fila.remove();
    this.agregarContactosObservados(nombres);
  }

  /** Desplazamiento en la lista virtualizada: la fila se reutiliza para otro contacto. */
  reutilizarFilaObservada(indice: number, nombre: string, info: InfoObservada = 'emoji'): void {
    this.filasObservadas[indice]?.replaceChildren(...this.crearFilaObservada(nombre, info).childNodes);
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

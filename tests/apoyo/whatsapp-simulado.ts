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

function icono(documento: Document, nombre: string): HTMLElement {
  const svg = documento.createElementNS('http://www.w3.org/2000/svg', 'svg');
  return el(documento, 'span', { 'data-icon': nombre, 'aria-hidden': 'true' }, svg);
}

export interface Chat {
  readonly nombre: string;
  readonly vistaPrevia: string;
  readonly hora?: string;
  readonly noLeidos?: number;
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

  crearFila({ nombre, vistaPrevia, hora = '10:45', noLeidos }: Chat): HTMLElement {
    const d = this.documento;
    return el(
      d,
      'div',
      { role: 'listitem' },
      el(
        d,
        'div',
        { tabindex: '0', role: 'button' },
        el(d, 'div', {}, el(d, 'img', { src: FOTO, alt: '', width: '40', height: '40' })),
        el(
          d,
          'div',
          {},
          el(d, 'div', {}, el(d, 'span', { dir: 'auto', title: nombre }, nombre), el(d, 'div', {}, hora)),
          el(
            d,
            'div',
            {},
            this.crearVistaPrevia(vistaPrevia),
            icono(d, 'muted'),
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

  /** Simula el reordenamiento de la lista (un chat sube al principio). */
  moverAlPrincipio(indice: number): void {
    const fila = this.filas[indice];
    if (fila) this.lista.prepend(fila);
  }

  /** Simula la reutilización de una fila por la lista virtualizada. */
  reutilizarFila(indice: number, chat: Chat): void {
    this.filas[indice]?.replaceChildren(...this.crearFila(chat).childNodes);
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

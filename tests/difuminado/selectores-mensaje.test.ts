// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { esIconoEstado, nombreIcono } from '@/nucleo/difuminado/iconos-estado';
import { AUTOR_EXTERNO, CITA_RESPUESTA, DATOS_DOCUMENTO, ETIQUETA_ICONO_DOCUMENTO, MINIATURA_CITA, MINIATURA_VIDEO, MULTIMEDIA_MENSAJE, TEXTO_CITA_RESPUESTA, TEXTO_MENSAJE } from '@/nucleo/difuminado/selectores';
import {
  iconoSvg,
  URL_BLOB_MENSAJE,
  URL_FOTO_PERFIL,
  URL_MINIATURA_MENSAJE,
  montarWhatsAppConGrupo,
  montarWhatsAppConMensajesObservados,
  type WhatsAppSimulado,
} from '../apoyo/whatsapp-simulado';

function imagen(src: string): HTMLImageElement {
  const img = document.createElement('img');
  img.src = src;
  return img;
}

describe('selectores de mensajes (RF-04)', () => {
  it('MULTIMEDIA_MENSAJE reconoce fotos, miniaturas y vídeos, no emojis ni avatares', () => {
    expect(imagen(URL_BLOB_MENSAJE).matches(MULTIMEDIA_MENSAJE)).toBe(true);
    expect(imagen(URL_MINIATURA_MENSAJE).matches(MULTIMEDIA_MENSAJE)).toBe(true);
    expect(document.createElement('video').matches(MULTIMEDIA_MENSAJE)).toBe(true);
    expect(imagen('data:image/png;base64,AAAA').matches(MULTIMEDIA_MENSAJE)).toBe(false);
    expect(imagen(URL_FOTO_PERFIL).matches(MULTIMEDIA_MENSAJE)).toBe(false);
    expect(imagen('https://static.whatsapp.net/emoji.png').matches(MULTIMEDIA_MENSAJE)).toBe(false);
  });

  it('MINIATURA_VIDEO elige la capa de fondo data:image/jpeg más externa de video-content, dentro de msg-container', () => {
    const nodo = (atributos: Record<string, string>, ...hijos: Element[]) => {
      const div = document.createElement('div');
      for (const [nombre, valor] of Object.entries(atributos)) div.setAttribute(nombre, valor);
      div.append(...hijos);
      return div;
    };
    const capa = (id: string, ...hijos: Element[]) => nodo({ id, style: `background-image: url("${URL_MINIATURA_MENSAJE}")` }, ...hijos);
    const mensaje = (...hijos: Element[]) => nodo({ 'data-testid': 'msg-container' }, ...hijos);
    const video = (...hijos: Element[]) => nodo({ 'data-testid': 'video-content' }, ...hijos);
    document.body.append(
      mensaje(video(capa('a'), capa('b'))),
      mensaje(video(capa('c', capa('d')))),
      mensaje(capa('fuera-de-video'), video(nodo({ id: 'png', style: 'background-image: url(data:image/png;base64,AAAA)' }))),
      video(capa('sin-mensaje')),
    );
    expect([...document.querySelectorAll(MINIATURA_VIDEO)].map((e) => e.id)).toEqual(['a', 'b', 'c']);
    // Lo que queda dentro de una miniatura ya difuminada no se difumina otra vez como multimedia.
    const interior = imagen(URL_BLOB_MENSAJE);
    document.getElementById('c')?.append(interior);
    expect(interior.matches(MULTIMEDIA_MENSAJE)).toBe(false);
    document.body.replaceChildren();
  });

  it('DATOS_DOCUMENTO elige el nombre, el formato y el tamaño de la tarjeta, sin controles, iconos ni texto ya cubierto', () => {
    const nodo = (etiqueta: string, atributos: Record<string, string>, ...hijos: (Element | string)[]) => {
      const elemento = document.createElement(etiqueta);
      for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
      elemento.append(...hijos);
      return elemento;
    };
    const icono = () => document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const mensaje = (...hijos: Element[]) => nodo('div', { 'data-testid': 'msg-container' }, ...hijos);
    const tarjeta = (...hijos: Element[]) => nodo('div', { 'data-testid': 'document-thumb', role: 'button' }, ...hijos);
    document.body.append(
      mensaje(
        tarjeta(
          nodo('span', { dir: 'auto', id: 'nombre' }, nodo('span', { dir: 'auto', id: 'nombre-interior' }, 'a.png')),
          nodo('span', { 'data-testid': 'type', id: 'tipo' }, 'PNG'),
          nodo('span', { title: '1 kB', id: 'tamano' }, '1 kB'),
          nodo('span', { title: 'Descargar', id: 'con-icono' }, icono()),
          nodo('button', {}, nodo('span', { title: 'Descargar', id: 'en-boton' }, 'Descargar')),
          nodo('span', { dir: 'auto', class: 'selectable-text', id: 'ya-cubierto' }, 'Descripción'),
        ),
        nodo('span', { dir: 'auto', id: 'fuera-de-tarjeta' }, 'Otro'),
      ),
      tarjeta(nodo('span', { dir: 'auto', id: 'sin-mensaje' }, 'b.jpg')),
    );
    expect([...document.querySelectorAll(DATOS_DOCUMENTO)].map((e) => e.id)).toEqual(['nombre', 'tipo', 'tamano']);
    document.body.replaceChildren();
  });

  it('MINIATURA_CITA elige el fondo data:image/jpeg más externo de una cita del mensaje, nunca un contenedor de la cita', () => {
    const nodo = (etiqueta: string, atributos: Record<string, string>, ...hijos: (Element | string)[]) => {
      const elemento = document.createElement(etiqueta);
      for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
      elemento.append(...hijos);
      return elemento;
    };
    const fondo = { style: `background-image: url("${URL_MINIATURA_MENSAJE}")` };
    const cita = (...hijos: Element[]) => nodo('div', { 'data-testid': 'quoted-message' }, nodo('div', { role: 'button', tabindex: '0' }, ...hijos));
    document.body.append(
      nodo('div', { 'data-testid': 'msg-container' },
        cita(nodo('span', { dir: 'auto' }, 'Tú · Estados'), nodo('div', { ...fondo, id: 'miniatura' }, nodo('div', { ...fondo, id: 'interior' }), nodo('span', {}, '0:18'))),
        // Un fondo que envuelve el encabezado o el texto citado no es la miniatura.
        nodo('div', { 'data-testid': 'quoted-message' }, nodo('div', { ...fondo, id: 'envoltorio' }, nodo('span', { dir: 'auto' }, 'Ana'))),
        nodo('div', { ...fondo, id: 'fuera-de-cita' }),
      ),
      cita(nodo('div', { ...fondo, id: 'sin-mensaje' })),
    );
    expect([...document.querySelectorAll(MINIATURA_CITA)].map((e) => e.id)).toEqual(['miniatura']);
    // Lo que queda dentro de la miniatura no se difumina otra vez como multimedia.
    const interior = imagen(URL_MINIATURA_MENSAJE);
    document.getElementById('miniatura')?.append(interior);
    expect(interior.matches(MULTIMEDIA_MENSAJE)).toBe(false);
    document.body.replaceChildren();
  });

  it('ETIQUETA_ICONO_DOCUMENTO elige el div hermano del icono, en cualquier orden, sin el dibujo ni otras partes de la tarjeta', () => {
    const nodo = (etiqueta: string, atributos: Record<string, string>, ...hijos: (Element | string)[]) => {
      const elemento = document.createElement(etiqueta);
      for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
      elemento.append(...hijos);
      return elemento;
    };
    const dibujo = (formato: string) => nodo('span', { 'data-icon': `document-${formato}-icon` }, document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    const tarjeta = (...hijos: Element[]) => nodo('div', { 'data-testid': 'document-thumb', role: 'button' }, ...hijos);
    document.body.append(
      nodo('div', { 'data-testid': 'msg-container' },
        tarjeta(nodo('div', {}, dibujo('PNG'), nodo('div', { id: 'despues' }, 'PNG'))),
        tarjeta(nodo('div', {}, nodo('div', { id: 'antes' }, 'PDF'), dibujo('PDF'))),
        // El icono, hermano directo del bloque con el nombre y del botón: ninguno de los dos es la etiqueta.
        tarjeta(
          dibujo('JPG'),
          nodo('div', { id: 'bloque-nombre' }, nodo('span', { dir: 'auto' }, 'a.jpg')),
          nodo('div', { id: 'bloque-boton' }, nodo('button', {}, 'Descargar')),
        ),
        // Otro icono que no es de documento.
        tarjeta(nodo('div', {}, nodo('span', { 'data-icon': 'audio-download' }), nodo('div', { id: 'otro-icono' }, '1'))),
      ),
      tarjeta(nodo('div', {}, dibujo('PNG'), nodo('div', { id: 'sin-mensaje' }, 'PNG'))),
    );
    expect([...document.querySelectorAll(ETIQUETA_ICONO_DOCUMENTO)].map((e) => e.id)).toEqual(['despues', 'antes']);
    document.body.replaceChildren();
  });

  it('esIconoEstado reconoce solo el <svg> cuyo <title> es exactamente wds-ic-read', () => {
    expect(esIconoEstado(iconoSvg(document, 'wds-ic-read'))).toBe(true);
    expect(nombreIcono(iconoSvg(document, 'wds-ic-read'))).toBe('wds-ic-read');
    for (const nombre of ['wds-ic-status', 'wds-ic-disappearing-messages', 'wds-ic-whatsapp', 'wds-ic-sticker', 'wds-ic-read-more', 'read']) {
      expect(esIconoEstado(iconoSvg(document, nombre)), nombre).toBe(false);
    }
    // Sin <title>, con el <title> anidado o en un elemento HTML: no es un icono de estado.
    expect(esIconoEstado(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))).toBe(false);
    const anidado = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const grupo = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    grupo.append(iconoSvg(document, 'wds-ic-read').querySelector('title') as Node);
    anidado.append(grupo);
    expect(esIconoEstado(anidado)).toBe(false);
    const html = document.createElement('span');
    html.title = 'wds-ic-read';
    expect(esIconoEstado(html)).toBe(false);
    const icono = document.createElement('span');
    icono.setAttribute('data-icon', 'wds-ic-read');
    expect(esIconoEstado(icono)).toBe(false);
  });

  describe('con la estructura observada', () => {
    let wa: WhatsAppSimulado;
    beforeEach(() => {
      wa = montarWhatsAppConMensajesObservados();
    });
    afterEach(() => {
      wa.desmontar();
    });

    it('TEXTO_MENSAJE selecciona los bloques de texto y las descripciones, sin anidarse', () => {
      const textos = [...wa.principal.querySelectorAll(`[data-testid="msg-container"] :is(${TEXTO_MENSAJE})`)];
      // 3 bloques [data-pre-plain-text] y 1 descripción.
      expect(textos).toHaveLength(4);
      expect(textos.filter((t) => t.hasAttribute('data-pre-plain-text'))).toHaveLength(3);
      for (const texto of textos) {
        expect(textos.some((otro) => otro !== texto && otro.contains(texto))).toBe(false);
      }
    });

    it('no selecciona hora, iconos, botones, remitentes ni separadores', () => {
      const seleccion = new Set(
        wa.principal.querySelectorAll(`[data-testid="msg-container"] :is(${TEXTO_MENSAJE}, ${MULTIMEDIA_MENSAJE})`),
      );
      const excluidos = wa.principal.querySelectorAll(
        '[data-prueba="hora"], [data-icon], button, [data-prueba="remitente"], [data-prueba="separador"], [data-prueba="reaccion"] img',
      );
      for (const elemento of excluidos) {
        expect([...seleccion].some((s) => s === elemento || s.contains(elemento))).toBe(false);
      }
    });
  });
});

describe('selectores del recuadro «Responder» (RF-04, estructura observada)', () => {
  let wa: WhatsAppSimulado;

  beforeEach(() => {
    wa = montarWhatsAppConGrupo();
  });

  afterEach(() => {
    wa.desmontar();
  });

  /** Elementos que difuminaría la regla de RF-04 del recuadro. */
  const seleccion = () => [...document.querySelectorAll(CITA_RESPUESTA)].flatMap((cita) => [...cita.querySelectorAll(TEXTO_CITA_RESPUESTA)]);

  it('alcanzan solo el texto citado del recuadro del pie, sin el autor ni la X', () => {
    const panel = wa.responderA({ autor: 'Ana', texto: 'Hola a todos', emoji: true });
    expect(seleccion()).toEqual([panel.querySelector('[data-testid="selectable-text"]')]);
    for (const otro of panel.querySelectorAll('[data-testid="author"], button, svg')) {
      expect(seleccion().some((s) => s === otro || s.contains(otro))).toBe(false);
    }
  });

  it('no alcanzan las citas dentro de los mensajes ni el editor', () => {
    const cita = document.createElement('div');
    cita.dataset['testid'] = 'quoted-message';
    const texto = document.createElement('span');
    texto.dataset['testid'] = 'selectable-text';
    cita.append(texto);
    wa.principal.querySelector('[data-testid="msg-container"]')?.append(cita);
    wa.editor.dataset['testid'] = 'selectable-text';
    expect(seleccion()).toEqual([]);
    wa.responderA({ autor: 'Ana', texto: 'Hola' });
    expect(seleccion()).toHaveLength(1);
    expect(seleccion().some((s) => s === texto || s === wa.editor)).toBe(false);
  });

  it('excluye un texto marcado como autor aunque lleve también el data-testid del texto', () => {
    const panel = wa.responderA({ autor: 'Ana', texto: 'Hola' });
    const autor = panel.querySelector('[data-testid="author"]');
    const interior = document.createElement('span');
    interior.dataset['testid'] = 'selectable-text';
    autor?.append(interior);
    expect(seleccion()).toHaveLength(1);
    expect(seleccion()).not.toContain(interior);
  });
});

describe('selector de autores (RF-01, estructura observada)', () => {
  /** `span` con atributos y contenido, construido con la API del DOM. */
  const span = (atributos: Record<string, string>, ...hijos: (Node | string)[]) => {
    const elemento = document.createElement('span');
    for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
    elemento.append(...hijos);
    return elemento;
  };
  const raizCon = (...hijos: Node[]) => {
    const raiz = document.createElement('div');
    raiz.append(...hijos);
    return raiz;
  };

  it('AUTOR_EXTERNO reconoce las dos variantes observadas', () => {
    const raiz = raizCon(span({ 'data-testid': 'author' }, 'A'), span({ role: 'button', 'data-testid': 'author' }, 'B'));
    expect([...raiz.querySelectorAll(AUTOR_EXTERNO)].map((e) => e.textContent)).toEqual(['A', 'B']);
  });

  it('en autores anidados solo selecciona el exterior, en cualquier orden', () => {
    const raiz = raizCon(
      span({ role: 'button', 'data-testid': 'author', id: 'a' }, span({ 'data-testid': 'author' }, 'X')),
      span({ 'data-testid': 'author', id: 'b' }, span({ role: 'button', 'data-testid': 'author' }, 'Y')),
    );
    expect([...raiz.querySelectorAll(AUTOR_EXTERNO)].map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('no selecciona otros elementos con data-testid parecidos', () => {
    const raiz = raizCon(span({ 'data-testid': 'author-name' }, 'A'), span({ 'data-testid': 'msg-meta' }, 'B'), span({}, 'C'));
    expect(raiz.querySelectorAll(AUTOR_EXTERNO)).toHaveLength(0);
  });
});

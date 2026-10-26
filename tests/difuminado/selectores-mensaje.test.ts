// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { esIconoEstado, nombreIcono } from '@/nucleo/difuminado/iconos-estado';
import { CITA_RESPUESTA, MULTIMEDIA_MENSAJE, TEXTO_CITA_RESPUESTA, TEXTO_MENSAJE } from '@/nucleo/difuminado/selectores';
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

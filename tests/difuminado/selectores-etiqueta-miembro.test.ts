// @vitest-environment jsdom
/**
 * Selector de las etiquetas de miembro (`ETIQUETA_MIEMBRO`) sobre la réplica de
 * la estructura confirmada en WhatsApp Web real (0.1.4-beta.0), con casos
 * negativos de controles de forma parecida.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ETIQUETA_MIEMBRO } from '@/nucleo/difuminado/selectores';
import {
  MENSAJES_AUTORES,
  MENSAJES_AVATARES_GRUPO,
  MENSAJES_CITAS_MINIATURA,
  MENSAJES_DOCUMENTOS,
  MENSAJES_ENCABEZADOS_CITA,
  MENSAJES_GRUPO,
  MENSAJES_LLAMADAS,
  MENSAJES_OBSERVADOS,
  type MensajeObservado,
  montarWhatsAppSimulado,
  type WhatsAppSimulado,
} from '../apoyo/whatsapp-simulado';

const CON_ETIQUETA: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Hola', remitente: 'Ana', autor: 'boton', etiquetaMiembro: 'El crack' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Seguido', remitente: 'Ana', autor: 'boton' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Otro', remitente: '+57 300 0000001', remitenteVisible: '~ Luis', autor: 'span', etiquetaMiembro: 'La jefa' },
  { tipo: 'foto', direccion: 'entrante', remitente: 'Eva', autor: 'anidado', etiquetaMiembro: 'Fotógrafa' },
];

/** Control de forma parecida a la etiqueta: `div[role="button"][tabindex="0"]` › `span`. */
function controlParecido(texto: string): HTMLElement {
  const control = document.createElement('div');
  control.setAttribute('role', 'button');
  control.setAttribute('tabindex', '0');
  const span = document.createElement('span');
  span.textContent = texto;
  span.setAttribute('data-prueba', 'parecido');
  control.append(span);
  return control;
}

describe('selector de las etiquetas de miembro', () => {
  let wa: WhatsAppSimulado;
  beforeEach(() => {
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Grupo', CON_ETIQUETA);
  });
  afterEach(() => {
    wa.desmontar();
  });

  const elegidos = () => [...document.querySelectorAll(ETIQUETA_MIEMBRO)];

  it('elige el span de cada etiqueta, en mensajes con distintos tipos de autor', () => {
    expect(elegidos()).toEqual([...document.querySelectorAll('[data-prueba="etiqueta-miembro"]')]);
    expect(elegidos()).toHaveLength(3);
  });

  it('no elige el control de la etiqueta, el autor ni la cabecera', () => {
    for (const prueba of ['control-etiqueta', 'cabecera-remitente', 'remitente', 'remitente-interior']) {
      expect(elegidos().some((e) => e.matches(`[data-prueba="${prueba}"]`)), prueba).toBe(false);
    }
  });

  it('no elige un control parecido en la rama del cuerpo, aunque vaya justo después del autor («Leer más»)', () => {
    const cuerpo = document.querySelector('#main [data-pre-plain-text]');
    const rama = document.createElement('div');
    cuerpo?.replaceWith(rama);
    rama.append(cuerpo ?? '', controlParecido('Leer más'));
    expect(elegidos().some((e) => e.matches('[data-prueba="parecido"]'))).toBe(false);
  });

  it('no elige un control parecido que no sigue inmediatamente a la rama del autor', () => {
    const contenedor = document.querySelectorAll('#main [data-testid="msg-container"]')[1];
    contenedor?.append(controlParecido('Leer más'));
    contenedor?.querySelector('[data-pre-plain-text]')?.after(controlParecido('👍 2'));
    expect(elegidos().some((e) => e.matches('[data-prueba="parecido"]'))).toBe(false);
  });

  it('no elige un control parecido con icono, imagen, data-testid, dos textos u otro control dentro', () => {
    const variantes = [
      (c: Element) => {
        c.append(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
      },
      (c: Element) => {
        c.append(document.createElement('img'));
      },
      (c: Element) => {
        c.setAttribute('data-testid', 'reaction-bubble');
      },
      (c: Element) => {
        c.append(document.createElement('span'));
      },
      (c: Element) => {
        c.querySelector('span')?.append(document.createElement('b'));
      },
    ];
    for (const [i, variar] of variantes.entries()) {
      wa.abrirConversacionObservada('Grupo', CON_ETIQUETA);
      const etiqueta = requerirEtiqueta(document.querySelector('[data-prueba="cabecera-remitente"]'));
      expect(etiqueta.matches(ETIQUETA_MIEMBRO), `variante ${i + 1}, antes`).toBe(true);
      const control = etiqueta.parentElement;
      if (!control) throw new Error('Control no encontrado');
      variar(control);
      expect(etiqueta.matches(ETIQUETA_MIEMBRO), `variante ${i + 1}, después`).toBe(false);
    }
  });

  it('no elige nada dentro de una cita, aunque su autor vaya seguido de un control parecido', () => {
    const cita = document.createElement('div');
    cita.setAttribute('data-testid', 'quoted-message');
    const autor = document.createElement('span');
    autor.setAttribute('data-testid', 'author');
    autor.textContent = 'Marta';
    const ramaAutor = document.createElement('div');
    ramaAutor.append(autor);
    const ramaEtiqueta = document.createElement('div');
    ramaEtiqueta.append(controlParecido('Apodo citado'));
    cita.append(ramaAutor, ramaEtiqueta);
    document.querySelector('#main [data-testid="msg-container"]')?.prepend(cita);
    expect(elegidos().some((e) => e.matches('[data-prueba="parecido"]'))).toBe(false);
  });

  it('no elige nada si la rama posterior al autor contiene el cuerpo, la hora o una cita', () => {
    for (const zona of ['data-pre-plain-text', 'data-testid']) {
      wa.abrirConversacionObservada('Grupo', CON_ETIQUETA);
      const rama = requerirEtiqueta(document.querySelector('[data-prueba="cabecera-remitente"]')).closest('[data-prueba="cabecera-remitente"] > div');
      const intrusa = document.createElement('div');
      intrusa.setAttribute(zona, zona === 'data-testid' ? 'msg-meta' : '[10:40] Ana: ');
      rama?.append(intrusa);
      expect(elegidos().some((e) => rama?.contains(e)), zona).toBe(false);
    }
  });

  it('no elige nada en los mensajes ya simulados, sin etiquetas (citas, documentos, llamadas, autores, avatares…)', () => {
    for (const mensajes of [MENSAJES_GRUPO, MENSAJES_AUTORES, MENSAJES_AVATARES_GRUPO, MENSAJES_OBSERVADOS, MENSAJES_DOCUMENTOS, MENSAJES_CITAS_MINIATURA, MENSAJES_ENCABEZADOS_CITA, MENSAJES_LLAMADAS]) {
      wa.abrirConversacionObservada('Grupo', mensajes);
      expect(elegidos()).toEqual([]);
    }
  });
});

function requerirEtiqueta(cabecera: Element | null): HTMLElement {
  const etiqueta = cabecera?.querySelector<HTMLElement>('[data-prueba="etiqueta-miembro"]');
  if (!etiqueta) throw new Error('Etiqueta no encontrada');
  return etiqueta;
}

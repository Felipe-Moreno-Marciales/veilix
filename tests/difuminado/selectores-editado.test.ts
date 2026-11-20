// @vitest-environment jsdom
/**
 * Selector del indicador «Editado» (`EDITADO_MENSAJE`) sobre la réplica de la
 * estructura confirmada en WhatsApp Web real (0.1.6), con casos negativos de
 * otros metadatos de forma parecida.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EDITADO_MENSAJE } from '@/nucleo/difuminado/selectores';
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

const MENSAJES: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Recibido y editado', remitente: 'Ana', autor: 'boton', editado: true },
  { tipo: 'texto', direccion: 'saliente', texto: 'Enviado y editado', editado: true },
  { tipo: 'texto', direccion: 'entrante', texto: 'Normal recibido', remitente: 'Luis', autor: 'boton' },
  { tipo: 'texto', direccion: 'saliente', texto: 'Normal enviado' },
];

/** Crea `msg-meta` › `div` › `span` con los hijos dados, dentro del último mensaje. */
function metaConHijos(...hijos: HTMLElement[]): HTMLElement {
  const contenedores = document.querySelectorAll('#main [data-testid="msg-container"]');
  const meta = contenedores[contenedores.length - 1]?.querySelector('[data-testid="msg-meta"]');
  if (!meta) throw new Error('msg-meta no encontrado');
  const padre = document.createElement('span');
  padre.append(...hijos);
  const envoltorio = document.createElement('div');
  envoltorio.append(padre);
  meta.replaceChildren(envoltorio);
  return padre;
}
function span(texto = '', atributos: Record<string, string> = {}): HTMLElement {
  const e = document.createElement('span');
  e.textContent = texto;
  for (const [n, v] of Object.entries(atributos)) e.setAttribute(n, v);
  return e;
}

describe('selector del indicador «Editado»', () => {
  let wa: WhatsAppSimulado;
  beforeEach(() => {
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Grupo', MENSAJES);
  });
  afterEach(() => {
    wa.desmontar();
  });

  const elegidos = () => [...document.querySelectorAll(EDITADO_MENSAJE)];

  it('elige el indicador de los mensajes editados, recibidos y enviados, y nada más', () => {
    expect(elegidos()).toEqual([...document.querySelectorAll('[data-prueba="editado"]')]);
    expect(elegidos()).toHaveLength(2);
  });

  it('no elige la hora, su contenedor, msg-meta, el cuerpo ni los botones del mensaje', () => {
    const elegido = (e: Element) => elegidos().includes(e);
    for (const e of document.querySelectorAll('[data-prueba="hora"], [data-testid="msg-meta"], [data-testid="msg-meta"] *:not([data-prueba="editado"]), #main [data-pre-plain-text], #main [data-pre-plain-text] *, #main button')) {
      expect(elegido(e), e.outerHTML.slice(0, 60)).toBe(false);
    }
  });

  it('no depende del texto ni del idioma', () => {
    for (const e of document.querySelectorAll('[data-prueba="editado"]')) e.textContent = 'Edited';
    expect(elegidos()).toHaveLength(2);
  });

  it('no elige otros metadatos de forma parecida: icono, vacío, con elementos dentro, control, solo o último', () => {
    const casos: [string, () => HTMLElement][] = [
      ['icono con data-icon', () => metaConHijos(span('', { 'data-icon': 'star' }), span('10:40'))],
      ['span vacío', () => metaConHijos(span(), span('10:40'))],
      ['con un elemento dentro', () => metaConHijos((() => { const e = span(); e.append(span('★')); return e; })(), span('10:40'))],
      ['control', () => metaConHijos(span('Fijado', { role: 'button' }), span('10:40'))],
      ['único hijo', () => metaConHijos(span('Editado'))],
    ];
    for (const [nombre, crear] of casos) {
      wa.abrirConversacionObservada('Grupo', MENSAJES.slice(2));
      const padre = crear();
      expect(elegidos().some((e) => padre.contains(e)), nombre).toBe(false);
    }
  });

  it('fuera de msg-meta, la misma forma no se elige', () => {
    const cuerpo = document.querySelector('#main [data-pre-plain-text]');
    const padre = span();
    padre.append(span('Texto'), span('10:40'));
    cuerpo?.append(padre);
    expect(elegidos().some((e) => padre.contains(e))).toBe(false);
  });

  it('si la hora fuera la primera de dos span, la elegiría a ella (mismo elemento que la marca de la hora, un solo filtro)', () => {
    wa.abrirConversacionObservada('Grupo', MENSAJES.slice(2));
    const hora = span('10:40');
    metaConHijos(hora, span('', { 'data-icon': 'msg-dblcheck' }));
    expect(elegidos()).toEqual([hora]);
  });

  it('no elige nada en los mensajes ya simulados, sin indicador «Editado»', () => {
    for (const mensajes of [MENSAJES_GRUPO, MENSAJES_AUTORES, MENSAJES_AVATARES_GRUPO, MENSAJES_OBSERVADOS, MENSAJES_DOCUMENTOS, MENSAJES_CITAS_MINIATURA, MENSAJES_ENCABEZADOS_CITA, MENSAJES_LLAMADAS]) {
      wa.abrirConversacionObservada('Grupo', mensajes);
      expect(elegidos()).toEqual([]);
    }
  });
});

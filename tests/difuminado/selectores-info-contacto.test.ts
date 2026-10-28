// @vitest-environment jsdom
/**
 * Selectores del panel «Info. del contacto» sobre la réplica de la estructura
 * observada en WhatsApp Web real (diagnóstico sobre 0.1.2-beta.12).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  INFO_CONTACTO,
  NOMBRE_INFO_CONTACTO,
  TEXTO_VALOR_INFO_CONTACTO,
  USUARIO_INFO_CONTACTO,
  VALOR_INFO_CONTACTO,
} from '@/nucleo/difuminado/selectores';
import { montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const prueba = (elementos: Iterable<Element>) => [...elementos].map((e) => e.getAttribute('data-prueba') ?? e.getAttribute('data-testid') ?? e.localName);

describe('selectores de «Info. del contacto»', () => {
  let wa: WhatsAppSimulado;
  beforeEach(() => {
    wa = montarWhatsAppSimulado();
    wa.abrirInfoContacto({ nombre: 'Marta', usuario: '@marta', telefono: '+57 300 1234567', descripcion: 'Texto', emojis: 2 });
  });
  afterEach(() => {
    wa.desmontar();
  });

  it('INFO_CONTACTO es el chat-info-drawer dentro de drawer-right', () => {
    expect(prueba(document.querySelectorAll(INFO_CONTACTO))).toEqual(['chat-info-drawer']);
  });

  it('NOMBRE_INFO_CONTACTO elige el nombre por palabra del data-testid, no el título de la cabecera', () => {
    expect(prueba(document.querySelectorAll(NOMBRE_INFO_CONTACTO))).toEqual(['nombre-info-contacto']);
  });

  it('USUARIO_INFO_CONTACTO elige solo el usuario, ni el nombre, ni la descripción, ni las notas', () => {
    expect(prueba(document.querySelectorAll(USUARIO_INFO_CONTACTO))).toEqual(['usuario-info-contacto']);
  });

  it('VALOR_INFO_CONTACTO elige el div hermano de section-phone-number y section-about, sin las etiquetas', () => {
    const valores = [...document.querySelectorAll(VALOR_INFO_CONTACTO)];
    expect(prueba(valores)).toEqual(['valor-section-phone-number', 'valor-section-about']);
    expect(valores.map((v) => v.textContent)).toEqual(['+57 300 1234567', 'Texto']);
  });

  it('TEXTO_VALOR_INFO_CONTACTO elige el span más externo de cada valor', () => {
    const textos = [...document.querySelectorAll(`:is(${VALOR_INFO_CONTACTO}) :is(${TEXTO_VALOR_INFO_CONTACTO})`)];
    expect(textos.map((t) => t.textContent)).toEqual(['+57 300 1234567', 'Texto']);
    for (const texto of textos) expect(texto.parentElement?.closest(`:is(${VALOR_INFO_CONTACTO}) span`) ?? null).toBeNull();
  });

  it('ninguno elige nada fuera del panel ni sin usuario', () => {
    wa.abrirInfoContacto({ nombre: 'Sin usuario', telefono: '1' });
    expect(document.querySelectorAll(USUARIO_INFO_CONTACTO)).toHaveLength(0);
    wa.cerrarInfoContacto();
    for (const selector of [NOMBRE_INFO_CONTACTO, USUARIO_INFO_CONTACTO, VALOR_INFO_CONTACTO]) expect(document.querySelectorAll(selector)).toHaveLength(0);
  });
});

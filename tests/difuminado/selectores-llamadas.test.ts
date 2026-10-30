// @vitest-environment jsdom
/**
 * Selectores de las llamadas sobre la réplica de las estructuras observadas en
 * WhatsApp Web real (diagnóstico sobre 0.1.2): panel flotante y tarjetas.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DATOS_PANEL_LLAMADA, NOMBRE_LLAMADA, TEXTO_NOMBRE_LLAMADA, TEXTO_REGISTRO_LLAMADA } from '@/nucleo/difuminado/selectores';
import { MENSAJES_LLAMADAS, montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const prueba = (elementos: Iterable<Element>) => [...elementos].map((e) => e.getAttribute('data-prueba') ?? e.getAttribute('data-testid') ?? e.localName);

describe('selectores de las llamadas', () => {
  let wa: WhatsAppSimulado;
  beforeEach(() => {
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Ana', MENSAJES_LLAMADAS.slice(0, 2));
    wa.abrirPanelLlamada({ nombre: 'Ana', duracion: '00:10' });
  });
  afterEach(() => {
    wa.desmontar();
  });

  it('NOMBRE_LLAMADA y TEXTO_NOMBRE_LLAMADA eligen el nombre del panel', () => {
    expect(prueba(document.querySelectorAll(NOMBRE_LLAMADA))).toEqual(['contenedor-nombre-llamada']);
    expect(prueba(document.querySelectorAll(`:is(${NOMBRE_LLAMADA}) :is(${TEXTO_NOMBRE_LLAMADA})`))).toEqual(['nombre-llamada']);
  });

  it('DATOS_PANEL_LLAMADA elige el estado y la duración, nunca un contenedor con controles', () => {
    expect(prueba(document.querySelectorAll(DATOS_PANEL_LLAMADA))).toEqual(['estado-llamada', 'duracion-llamada']);
    const boton = document.createElement('button');
    document.querySelector('[data-prueba="duracion-llamada"]')?.append(boton);
    expect(prueba(document.querySelectorAll(DATOS_PANEL_LLAMADA))).toEqual(['estado-llamada']);
  });

  it('TEXTO_REGISTRO_LLAMADA elige el título y el estado de cada tarjeta, sin el icono, msg-meta ni la tarjeta', () => {
    expect(prueba(document.querySelectorAll(TEXTO_REGISTRO_LLAMADA))).toEqual(['titulo-llamada', 'detalle-llamada', 'titulo-llamada', 'detalle-llamada']);
  });

  it('TEXTO_REGISTRO_LLAMADA no elige nada fuera de una tarjeta de llamada de un mensaje', () => {
    const suelta = document.createElement('div');
    suelta.setAttribute('data-testid', 'call-log-system-message');
    suelta.append(Object.assign(document.createElement('span'), { textContent: 'Llamada' }));
    document.body.append(suelta);
    expect([...document.querySelectorAll(TEXTO_REGISTRO_LLAMADA)].some((e) => suelta.contains(e))).toBe(false);
  });
});

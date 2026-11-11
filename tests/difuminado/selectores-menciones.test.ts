// @vitest-environment jsdom
/**
 * Selectores de las sugerencias de menciones (`@`) sobre la réplica de la
 * estructura observada en WhatsApp Web real (diagnóstico sobre 0.1.3).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FILA_MENCION_CONTACTO, NOMBRE_MENCION_CONTACTO, SECUNDARIO_MENCION_CONTACTO } from '@/nucleo/difuminado/selectores';
import { montarWhatsAppConAvataresGrupo, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const prueba = (elementos: Iterable<Element>) => [...elementos].map((e) => e.getAttribute('data-prueba') ?? e.localName);

describe('selectores de las sugerencias de menciones', () => {
  let wa: WhatsAppSimulado;
  beforeEach(() => {
    wa = montarWhatsAppConAvataresGrupo();
    wa.abrirMenciones([{ nombre: 'Ana', secundario: 'Perfil de Ana' }, 'Luis', { nombre: 'Eva', secundario: '🕊️📍' }]);
  });
  afterEach(() => {
    wa.desmontar();
  });

  it('FILA_MENCION_CONTACTO elige el botón de cada participante, no el de «todos»', () => {
    const filas = [...document.querySelectorAll(FILA_MENCION_CONTACTO)];
    expect(filas).toHaveLength(3);
    expect(filas.every((f) => f.querySelector('[data-testid="contact-mention-list-item"]'))).toBe(true);
    expect(filas.some((f) => f.querySelector('[data-testid="mention-all-list-item"]'))).toBe(false);
  });

  it('NOMBRE_MENCION_CONTACTO elige solo el contenedor del nombre de cada participante', () => {
    expect(prueba(document.querySelectorAll(`:is(${FILA_MENCION_CONTACTO}) :is(${NOMBRE_MENCION_CONTACTO})`))).toEqual([
      'contenedor-nombre-mencion',
      'contenedor-nombre-mencion',
      'contenedor-nombre-mencion',
    ]);
  });

  it('no elige el «mention-primary» de «todos», «mention-secondary», el avatar ni el botón', () => {
    const elegidos = [...document.querySelectorAll(NOMBRE_MENCION_CONTACTO)];
    for (const prueba of ['nombre-mencion-todos', 'descripcion-mencion-todos', 'secundario-mencion', 'avatar-mencion', 'fila-mencion']) {
      expect(elegidos.some((e) => e.matches(`[data-prueba="${prueba}"]`)), prueba).toBe(false);
    }
  });

  it('SECUNDARIO_MENCION_CONTACTO elige la información secundaria de cada participante, también vacía, y no la descripción de «todos»', () => {
    expect(prueba(document.querySelectorAll(`:is(${FILA_MENCION_CONTACTO}) :is(${SECUNDARIO_MENCION_CONTACTO})`))).toEqual([
      'secundario-mencion',
      'secundario-mencion',
      'secundario-mencion',
    ]);
    const elegidos = [...document.querySelectorAll(SECUNDARIO_MENCION_CONTACTO)];
    for (const prueba of ['descripcion-mencion-todos', 'nombre-mencion-todos', 'contenedor-nombre-mencion', 'avatar-mencion', 'fila-mencion']) {
      expect(elegidos.some((e) => e.matches(`[data-prueba="${prueba}"]`)), prueba).toBe(false);
    }
  });

  it('si una zona estuviera dentro de la otra, solo se elige la más externa, para no aplicar dos filtros', () => {
    const primario = document.querySelector('[data-prueba="contenedor-nombre-mencion"]');
    const secundario = document.querySelector('[data-prueba="secundario-mencion"]');
    if (!primario || !secundario) throw new Error('Zonas no encontradas');
    primario.append(secundario);
    expect(secundario.matches(SECUNDARIO_MENCION_CONTACTO)).toBe(false);
    expect(primario.matches(NOMBRE_MENCION_CONTACTO)).toBe(true);
    secundario.append(primario.cloneNode(true));
    const primarioInterior = secundario.querySelector('[data-testid="mention-primary"]');
    expect(primarioInterior?.matches(NOMBRE_MENCION_CONTACTO)).toBe(false);
  });

  it('exige que el elemento del participante sea hijo directo del botón', () => {
    const boton = document.createElement('button');
    const envoltorio = document.createElement('div');
    const item = document.createElement('div');
    item.setAttribute('data-testid', 'contact-mention-list-item');
    envoltorio.append(item);
    boton.append(envoltorio);
    document.body.append(boton);
    expect(boton.matches(FILA_MENCION_CONTACTO)).toBe(false);
    boton.remove();
  });
});

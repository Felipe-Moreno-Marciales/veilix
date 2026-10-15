// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { escucharAtajoRevelado, esAtajoRevelado } from '@/nucleo/difuminado/revelado-teclado';

const ATRIBUTO = 'data-veilix-revelar-prueba';
const raiz = document.documentElement;

function pulsar(tipo: 'keydown' | 'keyup', code: string, modificadores: KeyboardEventInit = {}) {
  const evento = new KeyboardEvent(tipo, { code, bubbles: true, cancelable: true, ...modificadores });
  document.body.dispatchEvent(evento);
  return evento;
}

describe('revelado mediante teclado', () => {
  let controlador = new AbortController();

  afterEach(() => {
    controlador.abort();
    controlador = new AbortController();
  });

  it('reconoce solo Ctrl + Mayús + Espacio', () => {
    const atajo = { code: 'Space', ctrlKey: true, shiftKey: true };
    expect(esAtajoRevelado(new KeyboardEvent('keydown', atajo))).toBe(true);
    expect(esAtajoRevelado(new KeyboardEvent('keydown', { ...atajo, altKey: true }))).toBe(false);
    expect(esAtajoRevelado(new KeyboardEvent('keydown', { ...atajo, metaKey: true }))).toBe(false);
    expect(esAtajoRevelado(new KeyboardEvent('keydown', { code: 'Space', ctrlKey: true }))).toBe(false);
    expect(esAtajoRevelado(new KeyboardEvent('keydown', { code: 'KeyA', ctrlKey: true, shiftKey: true }))).toBe(false);
  });

  it('revela mientras se mantiene el atajo y restaura al soltar', () => {
    escucharAtajoRevelado(document, ATRIBUTO, controlador.signal);
    const evento = pulsar('keydown', 'Space', { ctrlKey: true, shiftKey: true });
    expect(raiz.hasAttribute(ATRIBUTO)).toBe(true);
    expect(evento.defaultPrevented).toBe(true);

    pulsar('keyup', 'ShiftLeft', { ctrlKey: true });
    expect(raiz.hasAttribute(ATRIBUTO)).toBe(false);
  });

  it('no interfiere con otras teclas', () => {
    escucharAtajoRevelado(document, ATRIBUTO, controlador.signal);
    const espacio = pulsar('keydown', 'Space');
    const tab = pulsar('keydown', 'Tab');
    expect(espacio.defaultPrevented).toBe(false);
    expect(tab.defaultPrevented).toBe(false);
    expect(raiz.hasAttribute(ATRIBUTO)).toBe(false);
  });

  it('restaura el difuminado si la ventana pierde el foco', () => {
    escucharAtajoRevelado(document, ATRIBUTO, controlador.signal);
    pulsar('keydown', 'Space', { ctrlKey: true, shiftKey: true });
    window.dispatchEvent(new Event('blur'));
    expect(raiz.hasAttribute(ATRIBUTO)).toBe(false);
  });

  it('elimina el atributo y las escuchas al abortar', () => {
    escucharAtajoRevelado(document, ATRIBUTO, controlador.signal);
    pulsar('keydown', 'Space', { ctrlKey: true, shiftKey: true });
    controlador.abort();
    expect(raiz.hasAttribute(ATRIBUTO)).toBe(false);
    pulsar('keydown', 'Space', { ctrlKey: true, shiftKey: true });
    expect(raiz.hasAttribute(ATRIBUTO)).toBe(false);
  });
});

/**
 * Crédito del desarrollador en navegadores reales (Playwright): Chromium,
 * Firefox y WebKit. Comprueba con el CSS real del panel que la bandera SVG se
 * dibuja a 12 × 8 px, alineada con el texto, en una sola línea a la anchura del
 * emergente y con los mismos colores en los temas claro y oscuro.
 */
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '@/ui/estilos/panel.css';
import { CreditoDesarrollador } from '@/ui/componentes/CreditoDesarrollador';

let contenedor: HTMLElement;
let raiz: Root;

beforeEach(() => {
  // Misma estructura y anchura útil que el pie del emergente (380 px menos el relleno).
  contenedor = document.createElement('footer');
  contenedor.className = 'panel__pie';
  contenedor.style.width = '332px';
  document.body.append(contenedor);
  raiz = createRoot(contenedor);
  flushSync(() => {
    raiz.render(createElement(CreditoDesarrollador));
  });
});

afterEach(() => {
  raiz.unmount();
  contenedor.remove();
  delete document.documentElement.dataset['tema'];
});

function partes() {
  const credito = contenedor.querySelector('.panel__credito');
  const bandera = credito?.querySelector('svg[role="img"][aria-label="Bandera de Colombia"]');
  const texto = credito?.firstChild;
  if (!credito || !bandera || texto?.nodeType !== Node.TEXT_NODE) throw new Error('Crédito incompleto');
  const rango = document.createRange();
  rango.selectNodeContents(texto);
  return { credito, bandera, cajaTexto: rango.getBoundingClientRect() };
}

describe('crédito del desarrollador', () => {
  it('muestra la bandera SVG a 12 × 8 px (3:2), después del nombre y separada de él', () => {
    const { bandera, cajaTexto } = partes();
    const caja = bandera.getBoundingClientRect();
    expect([caja.width, caja.height]).toEqual([12, 8]);
    const separacion = caja.left - cajaTexto.right;
    expect(separacion).toBeGreaterThanOrEqual(3);
    expect(separacion).toBeLessThanOrEqual(6);
  });

  it('alinea verticalmente la bandera con el texto, sin alterar la altura de la línea', () => {
    const { credito, bandera, cajaTexto } = partes();
    const caja = bandera.getBoundingClientRect();
    // Dentro de la caja de los glifos y centrada con ella (margen de 2 px).
    expect(caja.top).toBeGreaterThanOrEqual(cajaTexto.top);
    expect(caja.bottom).toBeLessThanOrEqual(cajaTexto.bottom);
    const centroBandera = (caja.top + caja.bottom) / 2;
    const centroTexto = (cajaTexto.top + cajaTexto.bottom) / 2;
    expect(Math.abs(centroBandera - centroTexto)).toBeLessThanOrEqual(2);
    // Una sola línea: la altura del párrafo es la de su `line-height`.
    expect(credito.getBoundingClientRect().height).toBeCloseTo(Number.parseFloat(getComputedStyle(credito).lineHeight), 0);
  });

  it('cabe en el ancho del emergente sin desbordar', () => {
    const { credito, bandera } = partes();
    expect(credito.scrollWidth).toBeLessThanOrEqual(credito.clientWidth);
    expect(bandera.getBoundingClientRect().right).toBeLessThanOrEqual(contenedor.getBoundingClientRect().right);
  });

  it.each(['claro', 'oscuro'])('conserva los colores de la bandera y el texto legible en el tema %s', (tema) => {
    document.documentElement.dataset['tema'] = tema;
    const { credito, bandera } = partes();
    expect([...bandera.querySelectorAll('rect')].map((r) => getComputedStyle(r).fill)).toEqual([
      'rgb(252, 209, 22)',
      'rgb(0, 56, 147)',
      'rgb(206, 17, 38)',
    ]);
    expect(getComputedStyle(credito).color).toBe(tema === 'claro' ? 'rgb(91, 97, 112)' : 'rgb(163, 169, 183)');
    expect(getComputedStyle(bandera).visibility).toBe('visible');
  });
});

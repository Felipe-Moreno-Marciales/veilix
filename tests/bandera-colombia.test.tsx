// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BanderaColombia } from '@/ui/componentes/BanderaColombia';

afterEach(() => {
  cleanup();
});

function franjas() {
  render(<BanderaColombia />);
  const bandera = screen.getByRole('img', { name: 'Bandera de Colombia' });
  return { bandera, rectangulos: [...bandera.querySelectorAll('rect')] };
}

const numero = (elemento: Element, atributo: string) => Number(elemento.getAttribute(atributo) ?? 0);

describe('BanderaColombia', () => {
  it('es una imagen accesible con la etiqueta «Bandera de Colombia» y no recibe el foco', () => {
    const { bandera } = franjas();
    expect(bandera.localName).toBe('svg');
    expect(bandera.getAttribute('aria-label')).toBe('Bandera de Colombia');
    expect(bandera.getAttribute('focusable')).toBe('false');
    expect(bandera.hasAttribute('aria-hidden')).toBe(false);
  });

  it('tiene proporción 3:2 en el viewBox y en su tamaño', () => {
    const { bandera } = franjas();
    const [x, y, ancho, alto] = (bandera.getAttribute('viewBox') ?? '').split(' ').map(Number);
    expect([x, y]).toEqual([0, 0]);
    expect((ancho ?? 0) / (alto ?? 1)).toBe(1.5);
    expect(numero(bandera, 'width') / numero(bandera, 'height')).toBe(1.5);
  });

  it('dibuja amarillo (50 %), azul (25 %) y rojo (25 %) con los colores oficiales, sin huecos', () => {
    const { bandera, rectangulos } = franjas();
    const [, , ancho, alto] = (bandera.getAttribute('viewBox') ?? '').split(' ').map(Number);
    expect(
      rectangulos.map((r) => ({
        color: r.getAttribute('fill'),
        x: numero(r, 'x'),
        y: numero(r, 'y') / (alto ?? 1),
        ancho: numero(r, 'width') / (ancho ?? 1),
        alto: numero(r, 'height') / (alto ?? 1),
      })),
    ).toEqual([
      { color: '#FCD116', x: 0, y: 0, ancho: 1, alto: 0.5 },
      { color: '#003893', x: 0, y: 0.5, ancho: 1, alto: 0.25 },
      { color: '#CE1126', x: 0, y: 0.75, ancho: 1, alto: 0.25 },
    ]);
  });

  it('no tiene sombras, degradados, animaciones, estilos ni texto', () => {
    const { bandera } = franjas();
    expect([...bandera.querySelectorAll('*')].map((e) => e.localName)).toEqual(['rect', 'rect', 'rect']);
    expect(bandera.textContent).toBe('');
    for (const elemento of [bandera, ...bandera.querySelectorAll('*')]) {
      expect(elemento.getAttributeNames().filter((a) => ['style', 'filter', 'opacity', 'stroke', 'transform'].includes(a))).toEqual([]);
    }
  });
});

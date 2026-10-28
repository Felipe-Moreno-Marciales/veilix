import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const CSS = readFileSync(join(import.meta.dirname, '../src/ui/estilos/panel.css'), 'utf8');
const MORADOS_ANTERIORES = ['#5b4bdb', '#8c7ff5', '#7c6ff0', '#a99ff8', '#ecebfd', '#2a2650'];

/** Tokens de color de un bloque de tema (`:root { … }`, tema oscuro forzado o del sistema). */
function tokens(inicio: string): Record<string, string> {
  const desde = CSS.indexOf(inicio);
  if (desde < 0) throw new Error(`Bloque no encontrado: ${inicio}`);
  const bloque = CSS.slice(desde, CSS.indexOf('}', desde));
  const resultado: Record<string, string> = {};
  for (const [, nombre = '', valor = ''] of bloque.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)) {
    resultado[nombre] = valor.toLowerCase();
  }
  return resultado;
}

/** Contraste WCAG entre dos colores hexadecimales. */
function contraste(a: string, b: string): number {
  const luminancia = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (bl ?? 0);
  };
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return ((claro ?? 0) + 0.05) / ((oscuro ?? 0) + 0.05);
}

const TEMAS = {
  claro: tokens(':root {'),
  oscuro: tokens(":root[data-tema='oscuro'] {"),
  sistemaOscuro: tokens(":root:not([data-tema='claro'], [data-tema='oscuro']) {"),
};

describe('paleta del panel', () => {
  it('no queda ningún color morado anterior', () => {
    for (const morado of MORADOS_ANTERIORES) expect(CSS.toLowerCase()).not.toContain(morado);
  });

  it.each(Object.entries(TEMAS))('usa el verde de WhatsApp Web (#00A884) como acento en el tema %s', (_, t) => {
    expect(t['acento']).toBe('#00a884');
  });

  it.each(Object.entries(TEMAS))('el interruptor activo y el foco contrastan al menos 3:1 en el tema %s', (_, t) => {
    const { acento, superficie, fondo, foco } = t;
    expect(contraste(acento ?? '', superficie ?? '')).toBeGreaterThanOrEqual(3);
    expect(contraste(foco ?? '', fondo ?? '')).toBeGreaterThanOrEqual(3);
    expect(contraste(foco ?? '', superficie ?? '')).toBeGreaterThanOrEqual(3);
  });

  it('los dos bloques del tema oscuro coinciden', () => {
    expect(TEMAS.sistemaOscuro).toEqual(TEMAS.oscuro);
  });
});

import { describe, expect, it } from 'vitest';
import { atributoRevelado, generarHojaEstilos } from '@/nucleo/difuminado/hoja-estilos';

describe('generarHojaEstilos', () => {
  it('genera una regla de difuminado y otra de revelado', () => {
    const css = generarHojaEstilos(
      [{ contenedor: '.fila', objetivo: '.nombre', revelarConFoco: true }],
      'prueba',
    );
    expect(css).toContain(':is(.fila) :is(.nombre)');
    expect(css).toMatch(/filter: blur\(\d+px\) !important/);
    expect(css).toContain(':is(.fila):is(:hover, :focus-visible, :has(:focus-visible)) :is(.nombre)');
    expect(css).toContain(`:root[${atributoRevelado('prueba')}] :is(.fila) :is(.nombre)`);
    expect(css).toContain('filter: none !important');
  });

  it('no revela con el foco cuando revelarConFoco es falso', () => {
    const css = generarHojaEstilos([{ contenedor: '.editor', objetivo: null, revelarConFoco: false }], 'x');
    expect(css).toContain(':is(.editor):is(:hover)');
    expect(css).not.toContain('focus');
  });

  it('solo anima el revelado y respeta la reducción de movimiento', () => {
    const css = generarHojaEstilos([{ contenedor: '.a', objetivo: null, revelarConFoco: true }], 'x');
    const [difuminado] = css.split('\n\n');
    expect(difuminado).not.toContain('transition');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('usa atributos de revelado distintos por módulo', () => {
    expect(atributoRevelado('nombres')).not.toBe(atributoRevelado('fotos'));
  });
});

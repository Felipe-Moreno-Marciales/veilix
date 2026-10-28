/**
 * Tarjetas de las funcionalidades con el CSS real del panel en Chromium,
 * Firefox y WebKit de Playwright: los textos del catálogo caben en la anchura
 * del emergente sin desbordar y los interruptores se recorren y alternan con
 * el teclado.
 */
import { createElement, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import '@/ui/estilos/panel.css';
import { CATALOGO_FUNCIONALIDADES, type DefinicionFuncionalidad } from '@/funcionalidades/catalogo';
import { TarjetaFuncionalidad } from '@/ui/componentes/TarjetaFuncionalidad';

const DISPONIBLES = CATALOGO_FUNCIONALIDADES.filter((f) => f.estado === 'disponible');

function TarjetaConEstado({ definicion }: { readonly definicion: DefinicionFuncionalidad }) {
  const [activa, cambiar] = useState(false);
  return createElement(TarjetaFuncionalidad, { definicion, activa, alCambiar: cambiar });
}

let contenedor: HTMLElement;
let raiz: Root;

beforeEach(() => {
  // Misma estructura que el emergente: panel de 380 px con la lista de tarjetas.
  contenedor = document.createElement('div');
  contenedor.className = 'panel';
  contenedor.dataset['variante'] = 'emergente';
  document.body.append(contenedor);
  raiz = createRoot(contenedor);
  flushSync(() => {
    raiz.render(
      createElement(
        'ul',
        { className: 'lista-tarjetas' },
        CATALOGO_FUNCIONALIDADES.map((definicion) => createElement(TarjetaConEstado, { key: definicion.id, definicion })),
      ),
    );
  });
});

afterEach(() => {
  raiz.unmount();
  contenedor.remove();
});

const interruptores = () => [...contenedor.querySelectorAll<HTMLButtonElement>('button[role="switch"]')];

describe('tarjetas de las funcionalidades', () => {
  it('ningún texto ni interruptor desborda la anchura del emergente', () => {
    const limite = contenedor.getBoundingClientRect();
    for (const elemento of contenedor.querySelectorAll('.tarjeta, .tarjeta *')) {
      const caja = elemento.getBoundingClientRect();
      expect(caja.left, elemento.className).toBeGreaterThanOrEqual(limite.left);
      expect(caja.right, elemento.className).toBeLessThanOrEqual(limite.right);
    }
    for (const parrafo of contenedor.querySelectorAll('.tarjeta__descripcion, .tarjeta__nota')) {
      expect(parrafo.scrollWidth).toBeLessThanOrEqual(parrafo.clientWidth);
    }
  });

  it('cada interruptor queda a la derecha de sus textos, sin solaparse con ellos', () => {
    for (const interruptor of interruptores()) {
      const texto = interruptor.closest('.tarjeta')?.querySelector('.tarjeta__texto');
      if (!texto) throw new Error('Tarjeta sin textos');
      expect(interruptor.getBoundingClientRect().left).toBeGreaterThanOrEqual(texto.getBoundingClientRect().right);
    }
  });

  it('el tabulador recorre los cinco interruptores en orden y Espacio o Intro los alternan', async () => {
    expect(interruptores()).toHaveLength(DISPONIBLES.length);
    document.body.focus();
    for (const [indice, interruptor] of interruptores().entries()) {
      await userEvent.tab();
      expect(document.activeElement, DISPONIBLES[indice]?.id).toBe(interruptor);
      await userEvent.keyboard(indice % 2 === 0 ? ' ' : '{Enter}');
      expect(interruptor.getAttribute('aria-checked')).toBe('true');
    }
    // Alternar uno no cambia los demás.
    const primero = interruptores()[0];
    if (!primero) throw new Error('Sin interruptores');
    primero.focus();
    await userEvent.keyboard(' ');
    expect(interruptores().map((i) => i.getAttribute('aria-checked'))).toEqual(['false', 'true', 'true', 'true', 'true']);
  });

  it('el interruptor con el foco del teclado muestra el contorno de foco', async () => {
    document.body.focus();
    await userEvent.tab();
    const interruptor = interruptores()[0];
    if (!interruptor) throw new Error('Sin interruptores');
    expect(document.activeElement).toBe(interruptor);
    expect(getComputedStyle(interruptor).outlineStyle).toBe('solid');
  });
});

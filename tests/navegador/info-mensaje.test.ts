/**
 * RF-04 en «Info. del mensaje» (`[data-testid="drawer-right"]` con
 * `[data-testid="kept-by-info"]`, fuera de `#main`; estructura observada en
 * WhatsApp Web real), en Chromium, Firefox y WebKit de Playwright. El orden
 * interno, el encabezado, el botón de cierre y el otro panel lateral son
 * suposiciones (ver `abrirInfoMensaje` en `tests/apoyo/whatsapp-simulado.ts`).
 * Los stickers (`sticker-container` con `canvas` e `img` de `blob:`) están
 * observados; el sticker estático y el orden de sus nodos son suposiciones.
 * Las fotos y los vídeos de esta pantalla no están observados y no se
 * prueban. No demuestra compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { montarWhatsAppConGrupo, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

function preferenciasCon(...ids: IdFuncionalidad[]): Preferencias {
  const funcionalidades = { ...PREFERENCIAS_PREDETERMINADAS.funcionalidades };
  for (const id of ids) funcionalidades[id] = true;
  return { ...PREFERENCIAS_PREDETERMINADAS, funcionalidades };
}

function difuminado(elemento: Element): boolean {
  for (let actual: Element | null = elemento; actual; actual = actual.parentElement) {
    if (getComputedStyle(actual).filter !== 'none') return true;
  }
  return false;
}

/** Elementos del subárbol (incluido) con su propio `filter`. */
function filtrosPropios(elemento: Element): Element[] {
  return [elemento, ...elemento.querySelectorAll('*')].filter((e) => getComputedStyle(e).filter !== 'none');
}

function requerir<T>(valor: T | null | undefined): T {
  if (valor === null || valor === undefined) throw new Error('Elemento no encontrado');
  return valor;
}

function zonaNeutra(): HTMLElement {
  let zona = document.getElementById('zona-neutra');
  if (!zona) {
    zona = document.createElement('div');
    zona.id = 'zona-neutra';
    zona.style.cssText = 'position:fixed;right:0;bottom:0;width:40px;height:40px;z-index:2147483647';
    document.body.append(zona);
  }
  return zona;
}

describe('RF-04: «Info. del mensaje» (estructura observada)', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppConGrupo();
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  const panel = () => requerir(document.querySelector('[data-prueba="info-mensaje"]'));
  const texto = () => requerir(panel().querySelector('[data-prueba="texto-info"]'));
  const copia = () => requerir(panel().querySelector('[data-testid="msg-container"]'));
  const visibles = () => [
    ...panel().querySelectorAll(
      '[data-prueba="titulo-info"], [data-prueba="cerrar-info"], [data-prueba="cerrar-info"] svg, [data-prueba="hora-info"], [data-testid="msg-meta"] svg, [data-prueba="estado-info"], [data-prueba="estado-info"] *',
    ),
  ];

  it('difumina el texto de la copia del mensaje, que antes quedaba visible', () => {
    wa.abrirInfoMensaje({ texto: 'Mensaje secreto' });
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    expect(panel().closest('#main')).toBeNull();
    expect(difuminado(texto())).toBe(true);
  });

  it('difumina también los emojis, con un único filtro en el texto', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    wa.abrirInfoMensaje({ texto: 'Con emoji', emoji: true });
    expect(difuminado(requerir(panel().querySelector('[data-prueba="emoji-info"]')))).toBe(true);
    expect(filtrosPropios(copia())).toEqual([texto()]);
  });

  it('no difumina la hora, los indicadores, «Leído», «Entregado», las fechas, el título ni el cierre, que sigue funcionando', async () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    wa.abrirInfoMensaje({ texto: 'Mensaje secreto' });
    expect(panel().querySelectorAll('[data-prueba="estado-info"]')).toHaveLength(2);
    for (const elemento of visibles()) expect(difuminado(elemento), elemento.outerHTML.slice(0, 60)).toBe(false);
    await userEvent.click(requerir(panel().querySelector<HTMLElement>('[data-prueba="cerrar-info"]')));
    expect(wa.clics.get('Cerrar info')).toBe(1);
    expect(document.querySelector('[data-prueba="info-mensaje"]')).toBeNull();
  });

  it('protege al abrir, cerrar, volver a abrir y cambiar de mensaje', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    wa.abrirInfoMensaje({ texto: 'Primero' });
    expect(difuminado(texto())).toBe(true);
    wa.cerrarInfoMensaje();
    wa.abrirInfoMensaje({ texto: 'Segundo' });
    const segundo = texto();
    expect(difuminado(segundo)).toBe(true);
    wa.abrirInfoMensaje({ texto: 'Tercero', emoji: true });
    expect(segundo.isConnected).toBe(false);
    expect(difuminado(texto())).toBe(true);
  });

  it('revela el texto con el cursor sobre la copia y con el atajo, y lo vuelve a difuminar', async () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    wa.abrirInfoMensaje({ texto: 'Mensaje secreto' });
    await userEvent.hover(copia());
    await expect.poll(() => difuminado(texto())).toBe(false);
    await userEvent.hover(zonaNeutra());
    expect(difuminado(texto())).toBe(true);

    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    await expect.poll(() => difuminado(texto())).toBe(false);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    expect(difuminado(texto())).toBe(true);
  });

  it('al desactivar RF-04 restaura el texto sin recargar', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    wa.abrirInfoMensaje({ texto: 'Mensaje secreto' });
    gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
    expect(difuminado(texto())).toBe(false);
    expect(document.querySelector('style[data-veilix-estilo="mensajes-conversacion"]')).toBeNull();
  });

  it('no alcanza otros paneles laterales derechos sin estados de entrega', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    const otro = wa.abrirOtroPanelDerecho('Copia en otro panel');
    expect(difuminado(requerir(otro.querySelector('[data-prueba="texto-otro-panel"]')))).toBe(false);
  });

  it('es independiente de RF-01, RF-02 y RF-05, y convive con ellas', () => {
    wa.abrirInfoMensaje({ texto: 'Mensaje secreto' });
    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos', 'difuminarCampoEntrada'));
    expect(filtrosPropios(panel())).toEqual([]);
    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos', 'difuminarCampoEntrada', 'difuminarMensajesConversacion'));
    expect(filtrosPropios(panel())).toEqual([texto()]);
    expect(difuminado(wa.editor)).toBe(true);
  });

  it('no cambia la conversación ni el recuadro «Responder»', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    wa.abrirInfoMensaje({ texto: 'Mensaje secreto' });
    const mensaje = requerir(wa.principal.querySelector('[data-id] [data-pre-plain-text]'));
    expect(difuminado(mensaje)).toBe(true);
    wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
    expect(difuminado(requerir(wa.principal.querySelector('footer [data-testid="selectable-text"]')))).toBe(true);
    expect(difuminado(wa.editor)).toBe(false);
  });

  describe('stickers', () => {
    const sticker = () => requerir(panel().querySelector('[data-prueba="sticker-info"]'));
    const lienzo = () => requerir(panel().querySelector('[data-prueba="sticker-canvas"]'));
    const imagen = () => requerir(panel().querySelector('[data-prueba="sticker-img"]'));
    /** Ningún antecesor del elemento dentro del panel tiene su propio filtro: el difuminado efectivo es uno solo. */
    const sinFiltroEnAntecesores = (elemento: Element) => {
      for (let actual = elemento.parentElement; actual && actual !== panel(); actual = actual.parentElement) {
        if (getComputedStyle(actual).filter !== 'none') return false;
      }
      return true;
    };

    it('difumina el sticker animado (canvas visible e img auxiliar de 0 × 0), que antes quedaba visible', () => {
      wa.abrirInfoMensaje({ sticker: 'animado' });
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      expect(lienzo().getBoundingClientRect().width).toBe(190);
      expect(imagen().getBoundingClientRect().width).toBe(0);
      expect(difuminado(lienzo())).toBe(true);
      expect(difuminado(imagen())).toBe(true);
    });

    it('difumina el sticker estático (img visible)', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.abrirInfoMensaje({ sticker: 'estatico' });
      expect(imagen().getBoundingClientRect().width).toBe(190);
      expect(difuminado(imagen())).toBe(true);
    });

    it('aplica un único difuminado efectivo: solo los nodos visuales, ni el contenedor ni el botón', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.abrirInfoMensaje({ sticker: 'animado' });
      expect(filtrosPropios(copia())).toEqual([imagen(), lienzo()]);
      for (const visual of [imagen(), lienzo()]) expect(sinFiltroEnAntecesores(visual)).toBe(true);
      expect(getComputedStyle(sticker()).filter).toBe('none');
    });

    it('mantiene visibles la hora, los indicadores, los estados, el título y el cierre', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.abrirInfoMensaje({ sticker: 'animado' });
      for (const elemento of visibles()) expect(difuminado(elemento), elemento.outerHTML.slice(0, 60)).toBe(false);
    });

    it('revela el sticker con el cursor, con el foco de su botón y con el atajo, y lo vuelve a difuminar', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.abrirInfoMensaje({ sticker: 'animado' });
      await userEvent.hover(copia());
      await expect.poll(() => difuminado(lienzo())).toBe(false);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(lienzo())).toBe(true);

      const boton = requerir(panel().querySelector<HTMLElement>('[data-prueba="sticker-boton"]'));
      const ancla = document.createElement('button');
      sticker().before(ancla);
      ancla.focus();
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement).toBe(boton);
      await expect.poll(() => difuminado(lienzo())).toBe(false);
      ancla.focus();
      ancla.remove();
      await expect.poll(() => difuminado(lienzo())).toBe(true);

      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      await expect.poll(() => difuminado(lienzo())).toBe(false);
      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      expect(difuminado(lienzo())).toBe(true);
    });

    it('protege al abrir, cerrar y cambiar entre un texto y un sticker, y se restaura al desactivar RF-04', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.abrirInfoMensaje({ texto: 'Primero', emoji: true });
      expect(difuminado(texto())).toBe(true);
      wa.abrirInfoMensaje({ sticker: 'animado' });
      expect(difuminado(lienzo())).toBe(true);
      wa.cerrarInfoMensaje();
      wa.abrirInfoMensaje({ sticker: 'estatico' });
      expect(difuminado(imagen())).toBe(true);
      gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
      expect(difuminado(imagen())).toBe(false);
    });

    it('no alcanza stickers de otros paneles laterales derechos ni depende de las demás funciones', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const otro = wa.abrirOtroPanelDerecho('Copia en otro panel');
      const contenedor = document.createElement('div');
      contenedor.dataset['testid'] = 'sticker-container';
      const otroLienzo = document.createElement('canvas');
      contenedor.append(otroLienzo);
      requerir(otro.querySelector('[data-testid="msg-container"]')).append(contenedor);
      expect(difuminado(otroLienzo)).toBe(false);

      wa.abrirInfoMensaje({ sticker: 'animado' });
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarCampoEntrada'));
      expect(filtrosPropios(panel())).toEqual([]);
    });
  });
});

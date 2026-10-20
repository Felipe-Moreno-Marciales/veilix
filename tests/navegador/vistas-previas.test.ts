/**
 * RF-03: vistas previas especiales de la lista de chats (reacciones e iconos
 * de contenido dentro de la vista previa), en Chromium, Firefox y WebKit de
 * Playwright. La estructura es una suposición compatible con lo observado en
 * Chrome real (ver `vistaPreviaEspecial` en el DOM simulado). No demuestra
 * compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { montarWhatsAppConVistasEspeciales, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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

function requerir<T>(valor: T | null | undefined): T {
  if (valor === null || valor === undefined) throw new Error('Elemento no encontrado');
  return valor;
}

function zonaNeutra(): HTMLElement {
  let zona = document.getElementById('zona-neutra');
  if (!zona) {
    zona = document.createElement('div');
    zona.id = 'zona-neutra';
    zona.style.cssText = 'position:fixed;right:0;bottom:0;width:40px;height:40px;';
    document.body.append(zona);
  }
  return zona;
}

const siguienteFotograma = () =>
  new Promise<void>((resolver) => {
    requestAnimationFrame(() => {
      resolver();
    });
  });

describe('RF-03: vistas previas especiales', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppConVistasEspeciales();
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  const filaDe = (nombre: string) =>
    requerir(wa.filas.find((fila) => fila.querySelector(`span[title="${nombre}"]`)));

  /** Contenido de la vista previa de una fila: texto, emoji de la reacción e icono de contenido. */
  const contenidoVistaPrevia = (fila: Element): Element[] => {
    const especial = fila.querySelector('[data-prueba="vista-especial"]');
    if (!especial) return [requerir(fila.querySelector('span[title]:not([dir]) > span'))];
    return [especial, ...especial.querySelectorAll('[data-prueba="emoji-reaccion"], [data-prueba="icono-contenido"]')];
  };

  /** Elementos de la fila que nunca protege RF-03. */
  const noProtegidos = (fila: Element): Element[] => [
    requerir(fila.querySelector('span[dir="auto"]')),
    requerir(fila.querySelector('span[dir="auto"]')?.nextElementSibling),
    ...fila.querySelectorAll('[aria-label$="no leídos"], [data-icon="muted"], [data-icon="pinned"], [data-prueba="avatar"]'),
  ];

  it('difumina la vista previa normal de texto', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
    for (const elemento of contenidoVistaPrevia(filaDe('Normal'))) expect(difuminado(elemento)).toBe(true);
  });

  it('difumina la vista previa de una reacción, emoji incluido', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
    const contenido = contenidoVistaPrevia(filaDe('Reacción'));
    expect(contenido.some((e) => e.matches('[data-prueba="emoji-reaccion"]'))).toBe(true);
    for (const elemento of contenido) expect(difuminado(elemento)).toBe(true);
  });

  it('difumina la vista previa con icono de imagen y la reacción a una foto, icono incluido', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
    for (const nombre of ['Foto', 'Reacción a foto']) {
      const contenido = contenidoVistaPrevia(filaDe(nombre));
      expect(contenido.some((e) => e.matches('[data-prueba="icono-contenido"]')), nombre).toBe(true);
      for (const elemento of contenido) expect(difuminado(elemento), nombre).toBe(true);
    }
  });

  it('no difumina nombre, hora, contador de no leídos, silenciado, fijado ni avatar', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
    for (const fila of wa.filas) {
      for (const elemento of noProtegidos(fila)) {
        expect(difuminado(elemento), elemento.outerHTML.slice(0, 60)).toBe(false);
      }
    }
  });

  it('mantiene difuminados los indicadores de leído (sin regresión)', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
    const leidos = [...wa.lista.querySelectorAll('[data-prueba="estado"]')];
    expect(leidos).toHaveLength(2);
    for (const leido of leidos) expect(difuminado(leido)).toBe(true);
  });

  it('revela la vista previa especial con el cursor sobre la fila y restaura al salir', async () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
    const fila = filaDe('Reacción a foto');
    await userEvent.hover(fila);
    for (const elemento of contenidoVistaPrevia(fila)) await expect.poll(() => difuminado(elemento)).toBe(false);
    for (const elemento of contenidoVistaPrevia(filaDe('Reacción'))) expect(difuminado(elemento)).toBe(true);
    await userEvent.hover(zonaNeutra());
    for (const elemento of contenidoVistaPrevia(fila)) expect(difuminado(elemento)).toBe(true);
  });

  it('marca antes del siguiente fotograma al llegar una reacción, en chats nuevos, al reordenar y al reutilizar filas', async () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
    wa.actualizarVistaPreviaEspecial(0, 'reaccion', 'Texto');
    const nuevo = wa.agregarChat({ nombre: 'Nuevo', vistaPrevia: 'Foto', vistaPreviaEspecial: 'reaccionImagen' });
    await siguienteFotograma();
    for (const elemento of contenidoVistaPrevia(filaDe('Normal'))) expect(difuminado(elemento)).toBe(true);
    for (const elemento of contenidoVistaPrevia(nuevo)) expect(difuminado(elemento)).toBe(true);

    wa.moverAlPrincipio(3);
    wa.reutilizarFila(4, { nombre: 'Reutilizada', vistaPrevia: 'Foto', vistaPreviaEspecial: 'imagen' });
    await siguienteFotograma();
    for (const fila of wa.filas) {
      for (const elemento of contenidoVistaPrevia(fila)) expect(difuminado(elemento)).toBe(true);
    }
  });

  it('no altera la detección del nombre de RF-01', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesRecientes'));
    for (const fila of wa.filas) {
      const marcados = [...fila.querySelectorAll('[data-veilix-nombre]')];
      expect(marcados).toEqual([fila.querySelector('span[dir="auto"]')]);
    }
  });

  it('al desactivar RF-03 restaura la vista previa especial y quita las marcas', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
    gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
    for (const fila of wa.filas) {
      for (const elemento of contenidoVistaPrevia(fila)) expect(difuminado(elemento)).toBe(false);
    }
    expect(document.querySelectorAll('[data-veilix-vista-previa], [data-veilix-estado-vista-previa]')).toHaveLength(0);
  });
});

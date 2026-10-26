/**
 * Recuadro «Responder» (RF-04, con RF-01 y RF-05 independientes) en Chromium,
 * Firefox y WebKit de Playwright. Usa la estructura observada en WhatsApp Web
 * real (`footer` › `popup_panel` › `quoted-message` › `author` y
 * `selectable-text`); la posición de la X y el emoji son suposiciones (ver
 * `responderA` en `tests/apoyo/whatsapp-simulado.ts`). No demuestra
 * compatibilidad con WhatsApp Web real.
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

describe('recuadro «Responder»', () => {
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

  const recuadro = () => requerir(wa.principal.querySelector<HTMLElement>('footer [data-testid="quoted-message"]'));
  const autor = () => requerir(recuadro().querySelector('[data-testid="author"]'));
  const texto = () => requerir(recuadro().querySelector('[data-testid="selectable-text"]'));
  const cancelar = () => requerir(wa.principal.querySelector<HTMLElement>('footer [aria-label="Cancelar respuesta"]'));
  const controlesDelPie = () => [...wa.principal.querySelectorAll('footer button, footer svg')];
  /** Texto citado dentro de un mensaje de la conversación (no en el recuadro). */
  const citaEnMensaje = () => requerir(wa.principal.querySelector('[data-prueba="cita"] span[dir="ltr"]'));

  describe('RF-04', () => {
    it('difumina el texto citado de un mensaje recibido en un grupo, sin el autor ni los controles', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      expect(difuminado(texto())).toBe(true);
      expect(difuminado(autor())).toBe(false);
      for (const control of controlesDelPie()) expect(difuminado(control), control.outerHTML.slice(0, 60)).toBe(false);
      expect(difuminado(wa.editor)).toBe(false);
    });

    it('con RF-04 desactivada el texto citado queda visible', () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarCampoEntrada'));
      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      expect(difuminado(texto())).toBe(false);
    });

    it('difumina la respuesta a un mensaje propio y a un mensaje de un chat individual', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.responderA({ autor: 'Tú', texto: 'Hola' });
      expect(difuminado(texto())).toBe(true);

      wa.abrirConversacionObservada('Ana', [
        { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje individual', remitente: 'Ana' },
        { tipo: 'texto', direccion: 'saliente', texto: 'Respuesta propia' },
      ]);
      wa.responderA({ autor: 'Ana', texto: 'Mensaje individual' });
      expect(difuminado(texto())).toBe(true);
      expect(difuminado(autor())).toBe(false);
    });

    it('difumina los emojis del texto citado', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.responderA({ autor: 'Ana', texto: 'Hola', emoji: true });
      expect(difuminado(requerir(texto().querySelector('img[alt]')))).toBe(true);
    });

    it('protege al instante al cambiar de mensaje citado y tras cancelar con la X, que sigue funcionando', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      const primero = texto();
      wa.responderA({ autor: 'Luis', texto: 'Respondo a Ana' });
      expect(primero.isConnected).toBe(false);
      expect(difuminado(texto())).toBe(true);

      expect(difuminado(cancelar())).toBe(false);
      await userEvent.click(cancelar());
      expect(wa.clics.get('Cancelar respuesta')).toBe(1);
      expect(wa.principal.querySelector('footer [data-testid="popup_panel"]')).toBeNull();

      wa.responderA({ autor: 'Eva', texto: 'Buenas' });
      expect(difuminado(texto())).toBe(true);
    });

    it('revela el texto con el recuadro (cursor, foco y atajo) y lo vuelve a difuminar al terminar', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      await userEvent.hover(recuadro());
      await expect.poll(() => difuminado(texto())).toBe(false);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(texto())).toBe(true);

      const ancla = document.createElement('button');
      recuadro().before(ancla);
      ancla.focus();
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement).toBe(recuadro());
      await expect.poll(() => difuminado(texto())).toBe(false);
      ancla.focus();
      ancla.remove();
      await expect.poll(() => difuminado(texto())).toBe(true);

      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      await expect.poll(() => difuminado(texto())).toBe(false);
      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      expect(difuminado(texto())).toBe(true);
    });

    it('no cambia los mensajes ni sus citas: el original sigue difuminado al revelar el recuadro', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const original = requerir(wa.principal.querySelector('[data-id] [data-pre-plain-text]'));
      const citaAntes = difuminado(citaEnMensaje());
      expect(difuminado(original)).toBe(true);

      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      expect(difuminado(citaEnMensaje())).toBe(citaAntes);
      await userEvent.hover(recuadro());
      await expect.poll(() => difuminado(texto())).toBe(false);
      expect(difuminado(original)).toBe(true);
      expect(difuminado(citaEnMensaje())).toBe(citaAntes);
    });

    it('al desactivar RF-04 restaura el texto citado sin recargar y sin dejar estilos ni marcas', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      expect(difuminado(texto())).toBe(true);
      gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
      expect(difuminado(texto())).toBe(false);
      expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
      const marcas = [recuadro(), ...recuadro().querySelectorAll('*')].flatMap((e) =>
        e.getAttributeNames().filter((a) => a.startsWith('data-veilix-')),
      );
      expect(marcas).toEqual([]);
    });
  });

  describe('independencia de RF-01 y RF-05', () => {
    it('RF-01 sola difumina el autor (remitente del grupo) y deja visible el texto citado', () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      return expect.poll(() => difuminado(autor())).toBe(true).then(() => {
        expect(difuminado(texto())).toBe(false);
      });
    });

    it('RF-01 y RF-04 juntas difuminan el autor y el texto, y los controles siguen visibles', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesConversacion'));
      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      await expect.poll(() => difuminado(autor())).toBe(true);
      expect(difuminado(texto())).toBe(true);
      for (const control of controlesDelPie()) expect(difuminado(control)).toBe(false);
    });

    it('RF-05 sola difumina el editor y deja visible el recuadro; con RF-04 cada una protege lo suyo', () => {
      gestor.aplicar(preferenciasCon('difuminarCampoEntrada'));
      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      expect(difuminado(wa.editor)).toBe(true);
      expect(difuminado(texto())).toBe(false);
      expect(difuminado(autor())).toBe(false);

      gestor.aplicar(preferenciasCon('difuminarCampoEntrada', 'difuminarMensajesConversacion'));
      expect(difuminado(wa.editor)).toBe(true);
      expect(difuminado(texto())).toBe(true);
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      expect(difuminado(wa.editor)).toBe(false);
      expect(difuminado(texto())).toBe(true);
    });

    it('con el recuadro abierto se puede escribir en el editor protegido', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion', 'difuminarCampoEntrada'));
      wa.responderA({ autor: 'Ana', texto: 'Hola a todos' });
      await userEvent.click(wa.editor);
      await userEvent.keyboard('respuesta');
      expect(wa.editor.textContent).toContain('respuesta');
      expect(difuminado(texto())).toBe(true);
    });
  });
});

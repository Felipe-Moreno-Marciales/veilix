/**
 * Indicador de estado «leído» (`<svg><title>wds-ic-read</title>`, confirmado
 * en WhatsApp Web real) en RF-03 (lista de chats) y RF-04 (`msg-meta` en la
 * conversación), en Chromium, Firefox y WebKit de Playwright. Los demás
 * estados (enviado, entregado, pendiente) no están confirmados y no se
 * prueban. No demuestra compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { iconoLeido, iconoSvg, montarWhatsAppConEstados, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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

/** SVG cuyo `<title>` es exactamente `nombre`. */
function svgsLlamados(raiz: ParentNode, nombre: string): SVGElement[] {
  return [...raiz.querySelectorAll('svg')].filter((svg) => svg.querySelector(':scope > title')?.textContent === nombre);
}

const AJENOS = ['wds-ic-status', 'wds-ic-disappearing-messages', 'wds-ic-whatsapp', 'wds-ic-sticker'];

describe('indicador de leído (wds-ic-read)', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppConEstados();
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
  const leidoDe = (fila: Element) => requerir(fila.querySelector('[data-prueba="estado"]'));
  const vistaPreviaDe = (fila: Element) => requerir(fila.querySelector('span[title]:not([dir]) > span'));
  const leidosLista = () => [...wa.lista.querySelectorAll('[data-prueba="estado"]')];
  const leidosConversacion = () => [...wa.principal.querySelectorAll('[data-testid="msg-meta"] [data-prueba="estado"]')];

  describe('RF-03: lista de chats', () => {
    it('difumina el indicador de leído asociado a la vista previa', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      expect(leidosLista()).toHaveLength(2);
      for (const leido of leidosLista()) expect(difuminado(leido)).toBe(true);
      for (const fila of wa.filas) expect(difuminado(vistaPreviaDe(fila))).toBe(true);
    });

    it('no difumina iconos ajenos: estados, mensajes temporales, WhatsApp, stickers, silenciado y fijado', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      const ajenos = [
        ...AJENOS.flatMap((nombre) => svgsLlamados(document, nombre)),
        ...wa.lista.querySelectorAll('[data-icon="muted"], [data-icon="pinned"], [aria-label$="no leídos"]'),
        ...wa.filas.map((f) => requerir(f.querySelector('span[dir="auto"]'))),
      ];
      expect(ajenos.length).toBeGreaterThan(10);
      for (const elemento of ajenos) expect(difuminado(elemento), elemento.outerHTML.slice(0, 70)).toBe(false);
    });

    it('no difumina un wds-ic-read que no está asociado a la vista previa ni el de la navegación', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      const enNombre = requerir(svgsLlamados(filaDe('Negativo'), 'wds-ic-read')[0]);
      const enNavegacion = requerir(svgsLlamados(requerir(document.querySelector('[data-prueba="navegacion"]')), 'wds-ic-read')[0]);
      expect(difuminado(enNombre)).toBe(false);
      expect(difuminado(enNavegacion)).toBe(false);
    });

    it('revela vista previa e indicador juntos con el cursor y restaura al salir', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      const fila = filaDe('Leído');
      await userEvent.hover(fila);
      await expect.poll(() => difuminado(leidoDe(fila))).toBe(false);
      await expect.poll(() => difuminado(vistaPreviaDe(fila))).toBe(false);
      expect(difuminado(leidoDe(filaDe('Sticker leído')))).toBe(true);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(leidoDe(fila))).toBe(true);
      expect(difuminado(vistaPreviaDe(fila))).toBe(true);
    });

    it('revela con el foco de teclado y con Ctrl + Mayús + Espacio', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      const fila = filaDe('Leído');
      const ancla = document.createElement('button');
      fila.before(ancla);
      ancla.focus();
      await userEvent.keyboard('{Tab}');
      await expect.poll(() => difuminado(leidoDe(fila))).toBe(false);
      ancla.focus();
      ancla.remove();
      await expect.poll(() => difuminado(leidoDe(fila))).toBe(true);

      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      for (const leido of leidosLista()) await expect.poll(() => difuminado(leido)).toBe(false);
      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      for (const leido of leidosLista()) expect(difuminado(leido)).toBe(true);
    });

    it('difumina antes del siguiente fotograma el indicador que aparece, en chats nuevos y al reordenar', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      // Un mensaje recibido pasa a ser propio y leído: aparece el indicador.
      const fila = filaDe('Recibido');
      const nuevo = iconoLeido(document);
      requerir(vistaPreviaDe(fila).parentElement?.parentElement).prepend(nuevo);
      const chat = wa.agregarChat({ nombre: 'Nuevo', vistaPrevia: 'Hola', leido: true });
      await siguienteFotograma();
      expect(difuminado(requerir(nuevo.querySelector('svg')))).toBe(true);
      expect(difuminado(leidoDe(chat))).toBe(true);

      wa.moverAlPrincipio(2);
      await siguienteFotograma();
      expect(difuminado(leidoDe(requerir(wa.filas.find((f) => f.querySelector('span[title="Sticker leído"]')))))).toBe(true);

      // El indicador desaparece al llegar un mensaje recibido: no quedan marcas.
      nuevo.remove();
      await siguienteFotograma();
      expect(fila.querySelectorAll('[data-veilix-estado-vista-previa]')).toHaveLength(0);
    });

    it('no difumina los indicadores de la conversación (corresponden a RF-04)', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      for (const leido of leidosConversacion()) expect(difuminado(leido)).toBe(false);
    });

    it('al desactivar RF-03 restaura y quita las marcas sin recargar', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
      for (const leido of leidosLista()) expect(difuminado(leido)).toBe(false);
      expect(document.querySelectorAll('[data-veilix-estado-vista-previa]')).toHaveLength(0);
    });
  });

  describe('RF-04: conversación (msg-meta)', () => {
    it('difumina el indicador de leído de los mensajes enviados y no los de la lista', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      expect(leidosConversacion()).toHaveLength(3);
      for (const leido of leidosConversacion()) expect(difuminado(leido)).toBe(true);
      for (const leido of leidosLista()) expect(difuminado(leido)).toBe(false);
    });

    it('revela el mensaje completo, indicador incluido, con el cursor y restaura al salir', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const leido = requerir(leidosConversacion()[0]);
      const fila = requerir(leido.closest('[data-id]'));
      const texto = requerir(fila.querySelector('.selectable-text span'));
      await userEvent.hover(requerir(leido.closest('[data-testid="msg-meta"]')));
      await expect.poll(() => difuminado(leido)).toBe(false);
      await expect.poll(() => difuminado(texto)).toBe(false);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(leido)).toBe(true);
      expect(difuminado(texto)).toBe(true);
    });

    it('marca el indicador que aparece en un mensaje existente y en mensajes nuevos', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const meta = requerir(wa.principal.querySelector('[data-id^="false_"] [data-testid="msg-meta"]'));
      const nuevo = iconoLeido(document);
      meta.append(nuevo);
      const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'saliente', texto: 'Nuevo' });
      await siguienteFotograma();
      expect(difuminado(requerir(nuevo.querySelector('svg')))).toBe(true);
      expect(difuminado(requerir(fila.querySelector('[data-prueba="estado"]')))).toBe(true);
    });

    it('no difumina wds-ic-read fuera de msg-meta ni otros iconos del mensaje', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const enEncabezado = iconoSvg(document, 'wds-ic-read');
      requerir(wa.principal.querySelector('header')).append(enEncabezado);
      const contenedor = requerir(wa.contenedoresMensaje[0]);
      const fueraDeMeta = iconoSvg(document, 'wds-ic-read');
      contenedor.append(fueraDeMeta);
      const sticker = iconoSvg(document, 'wds-ic-sticker');
      requerir(contenedor.querySelector('[data-testid="msg-meta"]')).append(sticker);
      await siguienteFotograma();
      expect(difuminado(enEncabezado)).toBe(false);
      expect(difuminado(fueraDeMeta)).toBe(false);
      expect(difuminado(sticker)).toBe(false);
      for (const icono of wa.principal.querySelectorAll('[role="application"] [data-icon]')) {
        expect(difuminado(icono), icono.getAttribute('data-icon') ?? '').toBe(false);
      }
    });

    it('activa y desactiva RF-03 y RF-04 de forma independiente', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion', 'difuminarMensajesRecientes'));
      for (const leido of [...leidosLista(), ...leidosConversacion()]) expect(difuminado(leido)).toBe(true);

      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      for (const leido of leidosConversacion()) expect(difuminado(leido)).toBe(false);
      for (const leido of leidosLista()) expect(difuminado(leido)).toBe(true);
      expect(document.querySelectorAll('[data-veilix-estado-mensaje]')).toHaveLength(0);

      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      for (const leido of leidosLista()) expect(difuminado(leido)).toBe(false);
      for (const leido of leidosConversacion()) expect(difuminado(leido)).toBe(true);
      expect(document.querySelectorAll('[data-veilix-estado-vista-previa]')).toHaveLength(0);
    });
  });
});

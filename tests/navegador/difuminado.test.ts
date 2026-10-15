/**
 * Pruebas del motor de difuminado en Chromium real (Playwright).
 *
 * Comprueban el CSS efectivo (`getComputedStyle().filter`), el revelado con
 * cursor y teclado, la escritura en el editor y los clics en controles.
 * Usan el DOM simulado de `tests/apoyo`: NO demuestran compatibilidad con
 * WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

function preferenciasCon(...ids: IdFuncionalidad[]): Preferencias {
  const funcionalidades = { ...PREFERENCIAS_PREDETERMINADAS.funcionalidades };
  for (const id of ids) funcionalidades[id] = true;
  return { ...PREFERENCIAS_PREDETERMINADAS, funcionalidades };
}

/**
 * Indica si el elemento se ve difuminado: `filter` no se hereda, pero el
 * filtro de un ancestro afecta a todo su contenido.
 */
function difuminado(elemento: Element): boolean {
  for (let actual: Element | null = elemento; actual; actual = actual.parentElement) {
    if (getComputedStyle(actual).filter !== 'none') return true;
  }
  return false;
}

function visible(elemento: Element): boolean {
  return !difuminado(elemento);
}

function requerir<T>(valor: T | null | undefined): T {
  if (valor === null || valor === undefined) throw new Error('Elemento no encontrado');
  return valor;
}

function nombreDe(fila: Element): Element {
  return requerir(fila.querySelector('span[dir="auto"][title]'));
}

function vistaPreviaDe(fila: Element): Element {
  return requerir(fila.querySelector('span[title]:not([dir]) > span'));
}

function fotoDe(contenedor: Element): Element {
  return requerir(contenedor.querySelector('img'));
}

function textoMensaje(wa: WhatsAppSimulado, indice = 0): Element {
  return requerir(wa.principal.querySelectorAll('.selectable-text span')[indice]);
}

/** Elementos funcionales que nunca deben difuminarse. */
function controles(wa: WhatsAppSimulado): Element[] {
  return [
    ...wa.app.querySelectorAll('[data-icon], button'),
    ...wa.filas.map((f) => requerir(f.querySelector('[aria-label$="no leídos"], div > div > div'))),
  ];
}

/** Zona fuera del DOM simulado donde se deja el cursor para no revelar nada. */
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

async function alejarRaton(): Promise<void> {
  await userEvent.hover(zonaNeutra());
}

/** Coloca el foco justo antes de `elemento` para que el siguiente Tab llegue a él. */
function enfocarAntesDe(elemento: Element): void {
  const ancla = document.createElement('button');
  ancla.textContent = 'ancla';
  elemento.before(ancla);
  ancla.focus();
  ancla.addEventListener('blur', () => {
    ancla.remove();
  }, { once: true });
}

describe('motor de difuminado en Chromium', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    wa = montarWhatsAppSimulado();
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await alejarRaton();
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  describe('selección de objetivos', () => {
    it('RF-01 difumina nombres de la lista y del encabezado, y nada más', () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      for (const fila of wa.filas) {
        expect(difuminado(nombreDe(fila))).toBe(true);
        expect(difuminado(vistaPreviaDe(fila))).toBe(false);
        expect(difuminado(fotoDe(fila))).toBe(false);
      }
      const encabezado = requerir(wa.principal.querySelector('header'));
      expect(difuminado(requerir(encabezado.querySelector('span[dir="auto"]')))).toBe(true);
      expect(difuminado(requerir(encabezado.querySelector('span[title="en línea"]')))).toBe(true);
      expect(difuminado(textoMensaje(wa))).toBe(false);
    });

    it('RF-02 difumina fotografías de la lista y del encabezado, no los iconos', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      for (const fila of wa.filas) expect(difuminado(fotoDe(fila))).toBe(true);
      expect(difuminado(fotoDe(requerir(wa.principal.querySelector('header'))))).toBe(true);
      for (const fila of wa.filas) expect(difuminado(nombreDe(fila))).toBe(false);
    });

    it('RF-03 difumina las vistas previas y no los nombres', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesRecientes'));
      for (const fila of wa.filas) {
        expect(difuminado(vistaPreviaDe(fila))).toBe(true);
        expect(difuminado(nombreDe(fila))).toBe(false);
      }
    });

    it('RF-04 difumina mensajes entrantes y salientes, no sus controles', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      expect(difuminado(textoMensaje(wa, 0))).toBe(true);
      expect(difuminado(textoMensaje(wa, 1))).toBe(true);
      for (const boton of wa.principal.querySelectorAll('[role="row"] button')) {
        expect(difuminado(boton)).toBe(false);
      }
    });

    it('RF-05 difumina el editor y no los botones del pie', () => {
      gestor.aplicar(preferenciasCon('difuminarCampoEntrada'));
      expect(difuminado(wa.editor)).toBe(true);
      expect(difuminado(wa.control('Adjuntar'))).toBe(false);
      expect(difuminado(wa.control('Enviar'))).toBe(false);
    });

    it('nunca difumina iconos, botones, horas ni contadores con todo activo', () => {
      gestor.aplicar(preferenciasCon(...gestorIds()));
      for (const control of controles(wa)) {
        expect(difuminado(control), control.outerHTML).toBe(false);
      }
    });
  });

  describe('revelado temporal y restauración', () => {
    it('revela la fila bajo el cursor y la restaura al salir', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesRecientes', 'difuminarFotos'));
      const [primera, segunda] = wa.filas.map((f) => f);
      if (!primera || !segunda) throw new Error('faltan filas');

      await userEvent.hover(primera);
      await expect.poll(() => visible(nombreDe(primera))).toBe(true);
      await expect.poll(() => visible(vistaPreviaDe(primera))).toBe(true);
      await expect.poll(() => visible(fotoDe(primera))).toBe(true);
      expect(difuminado(nombreDe(segunda))).toBe(true);

      await alejarRaton();
      expect(difuminado(nombreDe(primera))).toBe(true);
      expect(difuminado(vistaPreviaDe(primera))).toBe(true);
    });

    it('revela un mensaje bajo el cursor sin revelar los demás', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const mensaje = requerir(wa.principal.querySelector('.message-in'));
      await userEvent.hover(mensaje);
      await expect.poll(() => visible(textoMensaje(wa, 0))).toBe(true);
      expect(difuminado(textoMensaje(wa, 1))).toBe(true);
      await alejarRaton();
      expect(difuminado(textoMensaje(wa, 0))).toBe(true);
    });

    it('revela con el foco de teclado (Tab) en la lista de chats', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      const [primera, segunda] = wa.filas;
      if (!primera || !segunda) throw new Error('faltan filas');
      enfocarAntesDe(primera);
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement?.closest('[role="listitem"]')).toBe(primera);
      await expect.poll(() => visible(nombreDe(primera))).toBe(true);
      expect(difuminado(nombreDe(segunda))).toBe(true);

      await userEvent.keyboard('{Tab}');
      await expect.poll(() => visible(nombreDe(segunda))).toBe(true);
      expect(difuminado(nombreDe(primera))).toBe(true);
    });

    it('revela todo mientras se mantiene Ctrl + Mayús + Espacio', async () => {
      gestor.aplicar(preferenciasCon(...gestorIds()));
      const objetivos = [nombreDe(requerir(wa.filas[0])), vistaPreviaDe(requerir(wa.filas[0])), textoMensaje(wa), wa.editor];

      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      for (const objetivo of objetivos) await expect.poll(() => visible(objetivo)).toBe(true);

      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      for (const objetivo of objetivos) expect(difuminado(objetivo)).toBe(true);
    });
  });

  describe('campo de entrada', () => {
    it('permite escribir, corregir y seleccionar con el texto difuminado', async () => {
      gestor.aplicar(preferenciasCon('difuminarCampoEntrada'));
      await userEvent.click(wa.editor);
      await alejarRaton();
      await userEvent.keyboard('Hola mundoo{Backspace}!');
      expect(wa.editor.textContent).toBe('Hola mundo!');
      expect(document.activeElement).toBe(wa.editor);
      // El foco no revela: el contenido sigue protegido mientras se escribe.
      expect(difuminado(wa.editor)).toBe(true);

      await userEvent.keyboard('{Control>}a{/Control}');
      expect(getSelection()?.toString()).toBe('Hola mundo!');
    });

    it('el atajo de revelado no inserta espacios en el editor', async () => {
      gestor.aplicar(preferenciasCon('difuminarCampoEntrada'));
      await userEvent.click(wa.editor);
      await userEvent.keyboard('abc');
      await userEvent.keyboard('{Control>}{Shift>}[Space]{/Shift}{/Control}');
      expect(wa.editor.textContent).toBe('abc');
    });

    it('se revela con el cursor encima', async () => {
      gestor.aplicar(preferenciasCon('difuminarCampoEntrada'));
      await userEvent.hover(wa.editor);
      await expect.poll(() => visible(wa.editor)).toBe(true);
      await alejarRaton();
      expect(difuminado(wa.editor)).toBe(true);
    });

    it('la navegación con Tab sigue funcionando', async () => {
      gestor.aplicar(preferenciasCon('difuminarCampoEntrada'));
      wa.control('Adjuntar').focus();
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement).toBe(wa.editor);
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement).toBe(wa.control('Enviar'));
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(wa.editor);
    });
  });

  describe('ausencia de interferencias', () => {
    it('los clics llegan a los controles de los mensajes difuminados', async () => {
      gestor.aplicar(preferenciasCon(...gestorIds()));
      const reaccionar = wa.control('Reaccionar a «Hola, ¿qué tal?»');
      const caja = reaccionar.getBoundingClientRect();
      const encima = document.elementFromPoint(caja.x + caja.width / 2, caja.y + caja.height / 2);
      expect(reaccionar.contains(encima)).toBe(true);

      await userEvent.click(reaccionar);
      await userEvent.click(wa.control('Enviar'));
      await userEvent.click(wa.control('Menú'));
      expect(wa.clics.get('Reaccionar a «Hola, ¿qué tal?»')).toBe(1);
      expect(wa.clics.get('Enviar')).toBe(1);
      expect(wa.clics.get('Menú')).toBe(1);
    });

    it('la selección de texto de un mensaje difuminado funciona', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const texto = textoMensaje(wa);
      const rango = document.createRange();
      rango.selectNodeContents(texto);
      getSelection()?.removeAllRanges();
      getSelection()?.addRange(rango);
      expect(getSelection()?.toString()).toBe('Hola, ¿qué tal?');
    });
  });

  describe('cambios dinámicos', () => {
    it('protege mensajes nuevos y la conversación nueva al cambiar de chat', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion', 'difuminarCampoEntrada', 'difuminarNombres'));
      const nuevo = wa.agregarMensaje({ texto: 'Mensaje nuevo', direccion: 'entrante' });
      expect(difuminado(requerir(nuevo.querySelector('.selectable-text span')))).toBe(true);

      wa.abrirConversacion('Equipo Veilix', [{ texto: 'Otro chat', direccion: 'saliente' }]);
      expect(difuminado(textoMensaje(wa))).toBe(true);
      expect(difuminado(wa.editor)).toBe(true);
      expect(difuminado(requerir(wa.principal.querySelector('header span[dir="auto"]')))).toBe(true);
    });

    it('marca chats y vistas previas nuevos antes del siguiente fotograma', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesRecientes'));
      const fila = wa.agregarChat({ nombre: 'Contacto nuevo', vistaPrevia: 'Secreto' });
      wa.actualizarVistaPrevia(1, 'Otro secreto');

      const estadoEnFotograma = await new Promise<boolean[]>((resolver) => {
        requestAnimationFrame(() => {
          resolver([
            difuminado(nombreDe(fila)),
            difuminado(vistaPreviaDe(fila)),
            difuminado(vistaPreviaDe(requerir(wa.filas[1]))),
          ]);
        });
      });
      expect(estadoEnFotograma).toEqual([true, true, true]);
    });

    it('mantiene la protección al reordenar la lista', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesRecientes'));
      wa.moverAlPrincipio(2);
      await Promise.resolve();
      const primera = requerir(wa.filas[0]);
      expect(nombreDe(primera).textContent).toBe('Banco');
      expect(difuminado(nombreDe(primera))).toBe(true);
      expect(difuminado(vistaPreviaDe(primera))).toBe(true);
    });

    it('protege el contenido que aparece después de activar (carga inicial)', async () => {
      wa.desmontar();
      gestor.aplicar(preferenciasCon(...gestorIds()));
      wa = montarWhatsAppSimulado();
      await Promise.resolve();
      const fila = requerir(wa.filas[0]);
      expect(difuminado(nombreDe(fila))).toBe(true);
      expect(difuminado(vistaPreviaDe(fila))).toBe(true);
      expect(difuminado(fotoDe(fila))).toBe(true);
      expect(difuminado(textoMensaje(wa))).toBe(true);
      expect(difuminado(wa.editor)).toBe(true);
    });
  });

  describe('desactivación', () => {
    it('restaura la visibilidad sin recargar al desactivar cada módulo', () => {
      gestor.aplicar(preferenciasCon(...gestorIds()));
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const fila = requerir(wa.filas[0]);
      expect(visible(nombreDe(fila))).toBe(true);
      expect(visible(vistaPreviaDe(fila))).toBe(true);
      expect(visible(textoMensaje(wa))).toBe(true);
      expect(visible(wa.editor)).toBe(true);
      expect(difuminado(fotoDe(fila))).toBe(true);

      gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
      expect(visible(fotoDe(fila))).toBe(true);
      expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
    });
  });
});

function gestorIds(): IdFuncionalidad[] {
  return [
    'difuminarNombres',
    'difuminarFotos',
    'difuminarMensajesRecientes',
    'difuminarMensajesConversacion',
    'difuminarCampoEntrada',
  ];
}

/**
 * RF-04: difuminado de mensajes con la estructura observada en WhatsApp Web
 * real (`[data-testid="msg-container"]`, sin `.message-in`/`.message-out`),
 * en Chromium, Firefox y WebKit de Playwright. Las partes internas no
 * observadas son suposiciones (ver `MensajeObservado`). No demuestra
 * compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { montarWhatsAppConMensajesObservados, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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

/** Elementos de cada mensaje (fila `[data-id]`) que deben difuminarse. */
function contenidoDe(fila: Element): Element[] {
  return [
    ...fila.querySelectorAll('.selectable-text span'),
    ...fila.querySelectorAll('[data-prueba="multimedia"] img, video'),
    ...fila.querySelectorAll('[data-prueba="hora"], [data-prueba="reaccion"], [data-prueba="estado"]'),
  ];
}

/** Controles que nunca deben difuminarse (las reacciones y los indicadores de estado sí). */
function controlesDe(fila: Element): Element[] {
  return [
    ...fila.querySelectorAll(
      'button:not([data-prueba="reaccion"], [data-prueba="reaccion"] *), [data-icon]:not([data-prueba="estado"])',
    ),
  ];
}

describe('RF-04: mensajes con la estructura observada', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    // Los clics en controles de la parte baja desplazan la página; se restaura
    // para que la zona neutra del cursor siga visible.
    window.scrollTo(0, 0);
    wa = montarWhatsAppConMensajesObservados();
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  const textoDe = (texto: string) =>
    requerir([...wa.principal.querySelectorAll('.selectable-text span')].find((e) => e.textContent === texto));

  describe('contenido difuminado', () => {
    it('difumina el texto de mensajes recibidos y enviados', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      expect(difuminado(textoDe('Mensaje recibido secreto'))).toBe(true);
      expect(difuminado(textoDe('Mensaje enviado secreto'))).toBe(true);
    });

    it('difumina fotos, miniaturas sin descargar y vídeos', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const multimedia = [...wa.principal.querySelectorAll('[data-prueba="multimedia"] img, video')];
      expect(multimedia).toHaveLength(4);
      for (const elemento of multimedia) expect(difuminado(elemento), elemento.outerHTML.slice(0, 80)).toBe(true);
    });

    it('difumina la foto y la descripción de un mensaje combinado', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const contenedor = requerir(textoDe('Descripción secreta').closest('[data-testid="msg-container"]'));
      expect(difuminado(requerir(contenedor.querySelector('img')))).toBe(true);
      expect(difuminado(textoDe('Descripción secreta'))).toBe(true);
    });

    it('difumina todo el contenido de todos los mensajes de un grupo', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      for (const contenedor of wa.filasMensaje) {
        for (const elemento of contenidoDe(contenedor)) expect(difuminado(elemento)).toBe(true);
      }
    });
  });

  describe('hora y reacciones', () => {
    const horas = () => [...wa.principal.querySelectorAll('[data-prueba="hora"]')];
    const reacciones = () => [...wa.principal.querySelectorAll('[data-prueba="reaccion"]')];

    it('difumina la hora de mensajes recibidos y enviados, en formato de 24 y 12 horas', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      expect(horas().map((h) => h.textContent)).toEqual(
        expect.arrayContaining(['10:40', '10:41\u202fp.\u00a0m.', '9:05 PM']),
      );
      for (const hora of horas()) expect(difuminado(hora), hora.textContent).toBe(true);
    });

    it('difumina las reacciones con emoji en imagen o texto, dentro y fuera del contenedor', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      expect(reacciones()).toHaveLength(3);
      for (const reaccion of reacciones()) expect(difuminado(reaccion), reaccion.outerHTML.slice(0, 60)).toBe(true);
    });

    it('difumina el indicador de leído (wds-ic-read) de los mensajes enviados', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const estados = [...wa.principal.querySelectorAll('[data-testid="msg-meta"] [data-prueba="estado"]')];
      expect(estados).toHaveLength(3);
      for (const estado of estados) {
        expect(estado.querySelector(':scope > title')?.textContent).toBe('wds-ic-read');
        expect(difuminado(estado)).toBe(true);
      }
    });

    it('revela todo el mensaje al pasar el cursor por la reacción exterior y restaura al salir', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const reaccion = requerir(wa.principal.querySelector('[data-id] > [data-prueba="reaccion"]'));
      const fila = requerir(reaccion.closest('[data-id]'));
      await userEvent.hover(reaccion);
      for (const elemento of contenidoDe(fila)) await expect.poll(() => difuminado(elemento)).toBe(false);
      await userEvent.hover(zonaNeutra());
      for (const elemento of contenidoDe(fila)) expect(difuminado(elemento)).toBe(true);
    });

    it('difumina antes del siguiente fotograma una reacción añadida a un mensaje existente', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const contenedor = requerir(wa.contenedoresMensaje[0]);
      const nueva = document.createElement('button');
      nueva.textContent = '🙏 1';
      contenedor.append(nueva);
      const enFotograma = await new Promise<boolean>((resolver) => {
        requestAnimationFrame(() => {
          resolver(difuminado(nueva));
        });
      });
      expect(enFotograma).toBe(true);
    });

    it('los botones de reacción siguen recibiendo clics', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const reaccion = requerir(wa.principal.querySelector<HTMLElement>('[data-id] > button[data-prueba="reaccion"]'));
      let clics = 0;
      reaccion.addEventListener('click', () => {
        clics++;
      });
      await userEvent.click(reaccion);
      expect(clics).toBe(1);
    });

    it('al desactivar quita las marcas y restaura la hora y las reacciones', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
      for (const elemento of [...horas(), ...reacciones()]) expect(difuminado(elemento)).toBe(false);
      expect(document.querySelectorAll('[data-veilix-hora-mensaje], [data-veilix-reaccion]')).toHaveLength(0);
    });
  });

  describe('elementos que no deben difuminarse', () => {
    it('mantiene visibles reaccionar, descarga, respuesta, reproducción, remitentes y separadores', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const visibles = [
        ...wa.filasMensaje.flatMap(controlesDe),
        requerir(wa.principal.querySelector('[data-prueba="separador"]')),
        ...wa.principal.querySelectorAll('[data-prueba="remitente"]'),
      ];
      expect(visibles.length).toBeGreaterThan(20);
      for (const elemento of visibles) expect(difuminado(elemento), elemento.outerHTML.slice(0, 80)).toBe(false);
    });

    it('no difumina el contenedor completo ni el editor', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      for (const contenedor of wa.contenedoresMensaje) expect(difuminado(contenedor)).toBe(false);
      for (const fila of wa.filasMensaje) expect(difuminado(fila)).toBe(false);
      expect(difuminado(wa.editor)).toBe(false);
      expect(difuminado(requerir(wa.principal.querySelector('header')))).toBe(false);
    });

    it('los controles siguen recibiendo los clics', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      for (const etiqueta of ['Descargar', 'Reproducir', 'Reaccionar 1', 'Responder 2']) {
        await userEvent.click(wa.control(etiqueta));
        expect(wa.clics.get(etiqueta), etiqueta).toBe(1);
      }
    });

    it('la selección de texto de un mensaje difuminado funciona', () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const rango = document.createRange();
      rango.selectNodeContents(textoDe('Mensaje recibido secreto'));
      getSelection()?.removeAllRanges();
      getSelection()?.addRange(rango);
      expect(getSelection()?.toString()).toBe('Mensaje recibido secreto');
    });
  });

  describe('revelado temporal', () => {
    it('revela solo el mensaje bajo el cursor y restaura al salir', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const [primero, segundo] = wa.filasMensaje;
      if (!primero || !segundo) throw new Error('faltan mensajes');
      await userEvent.hover(primero);
      for (const elemento of contenidoDe(primero)) await expect.poll(() => difuminado(elemento)).toBe(false);
      for (const elemento of contenidoDe(segundo)) expect(difuminado(elemento)).toBe(true);
      await userEvent.hover(zonaNeutra());
      for (const elemento of contenidoDe(primero)) expect(difuminado(elemento)).toBe(true);
    });

    it('revela con el foco de teclado en un control del mensaje', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const contenedor = requerir(wa.filasMensaje[2]);
      requerir(contenedor.querySelector<HTMLElement>('[data-prueba="multimedia"]')).focus();
      await userEvent.keyboard('{Tab}');
      for (const elemento of contenidoDe(contenedor)) await expect.poll(() => difuminado(elemento)).toBe(false);
    });

    it('revela todos los mensajes con Ctrl + Mayús + Espacio y restaura al soltar', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const todo = wa.filasMensaje.flatMap(contenidoDe);
      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      for (const elemento of todo) await expect.poll(() => difuminado(elemento)).toBe(false);
      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      for (const elemento of todo) expect(difuminado(elemento)).toBe(true);
    });
  });

  describe('cambios dinámicos', () => {
    /** Espera al siguiente fotograma: el marcador debe haber actuado antes del pintado. */
    const siguienteFotograma = () =>
      new Promise<void>((resolver) => {
        requestAnimationFrame(() => {
          resolver();
        });
      });
    const textoYMultimedia = (fila: Element) =>
      contenidoDe(fila).filter((e) => !e.matches('[data-prueba="hora"], [data-prueba="reaccion"], [data-prueba="estado"]'));

    it('difumina los mensajes nuevos, los anteriores al desplazarse y los de otra conversación', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      const nuevo = wa.agregarMensajeObservado({
        tipo: 'fotoConDescripcion',
        direccion: 'entrante',
        texto: 'Nuevo',
        remitente: 'Ana',
        reaccion: 'fuera',
      });
      // Texto y multimedia: CSS, de inmediato.
      for (const elemento of textoYMultimedia(nuevo)) expect(difuminado(elemento)).toBe(true);
      // Hora, reacciones e indicador de estado: marcador, antes del siguiente pintado.
      await siguienteFotograma();
      for (const elemento of contenidoDe(nuevo)) expect(difuminado(elemento)).toBe(true);

      const anteriores = wa.cargarMensajesAnteriores([{ tipo: 'texto', direccion: 'saliente', texto: 'Antiguo', reaccion: 'texto' }]);
      for (const elemento of anteriores.flatMap(textoYMultimedia)) expect(difuminado(elemento)).toBe(true);
      await siguienteFotograma();
      for (const elemento of anteriores.flatMap(contenidoDe)) expect(difuminado(elemento)).toBe(true);

      wa.abrirConversacionObservada('Otro chat', [{ tipo: 'texto', direccion: 'entrante', texto: 'Otro secreto' }, { tipo: 'video', direccion: 'saliente', reaccion: 'imagen' }]);
      await siguienteFotograma();
      for (const elemento of wa.filasMensaje.flatMap(contenidoDe)) expect(difuminado(elemento)).toBe(true);
    });
  });

  it('se desactiva sin recargar y sin afectar a otras protecciones', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion', 'difuminarCampoEntrada'));
    const todo = wa.filasMensaje.flatMap(contenidoDe);
    gestor.aplicar(preferenciasCon('difuminarCampoEntrada'));
    for (const elemento of todo) expect(difuminado(elemento)).toBe(false);
    expect(difuminado(wa.editor)).toBe(true);
    expect(document.querySelector('style[data-veilix-estilo="mensajes-conversacion"]')).toBeNull();
  });

  it('no altera el contenido de los mensajes', () => {
    const original = requerir(wa.principal.querySelector('[role="application"]')).innerHTML;
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
    expect(requerir(wa.principal.querySelector('[role="application"]')).innerHTML).toBe(original);
  });
});

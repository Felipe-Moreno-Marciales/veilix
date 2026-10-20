// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clasificarMensaje,
  crearMarcadorMensajes,
  esContenidoEmoji,
  esHora,
} from '@/nucleo/difuminado/marcador-mensajes';
import { montarWhatsAppConMensajesObservados, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const HORA = 'data-veilix-hora-mensaje';
const REACCION = 'data-veilix-reaccion';
const ESTADO = 'data-veilix-estado-mensaje';

function elemento(etiqueta: string, ...hijos: (Node | string)[]): HTMLElement {
  const nuevo = document.createElement(etiqueta);
  nuevo.append(...hijos);
  return nuevo;
}

describe('esHora', () => {
  it.each(['10:40', '9:05', '10.40', '10:40 p. m.', '10:41 p. m.', '9:05 PM', '9:05 am', ' 23:59 '])(
    'reconoce «%s»',
    (texto) => {
      expect(esHora(texto)).toBe(true);
    },
  );

  it.each(['10:40 hola', 'Hoy', '1040', '10:4', '123:45', 'Mensaje a las 10:40', ''])('rechaza «%s»', (texto) => {
    expect(esHora(texto)).toBe(false);
  });
});

describe('esContenidoEmoji', () => {
  it('acepta emojis en texto o imagen con contador opcional', () => {
    expect(esContenidoEmoji(elemento('button', '❤️ 2'))).toBe(true);
    expect(esContenidoEmoji(elemento('button', '😂👍🏽 3'))).toBe(true);
    expect(esContenidoEmoji(elemento('span', '👨‍👩‍👧'))).toBe(true);
    const imagen = document.createElement('img');
    imagen.alt = '👍';
    expect(esContenidoEmoji(elemento('button', imagen, '1'))).toBe(true);
  });

  it('rechaza textos, números solos, iconos e imágenes que no son emoji', () => {
    expect(esContenidoEmoji(elemento('span', 'Ana 🌸'))).toBe(false);
    expect(esContenidoEmoji(elemento('span', '12'))).toBe(false);
    expect(esContenidoEmoji(elemento('span', ''))).toBe(false);
    const icono = elemento('span', '👍');
    icono.setAttribute('data-icon', 'react');
    expect(esContenidoEmoji(icono)).toBe(false);
    expect(esContenidoEmoji(elemento('button', elemento('span', '👍'), document.createElementNS('http://www.w3.org/2000/svg', 'svg')))).toBe(false);
    const foto = document.createElement('img');
    foto.alt = '';
    expect(esContenidoEmoji(elemento('div', foto))).toBe(false);
  });
});

describe('marcador de hora y reacciones', () => {
  let wa: WhatsAppSimulado;
  let observador: MutationObserver;
  const marcador = crearMarcadorMensajes({ hora: HORA, reaccion: REACCION, estado: ESTADO });

  beforeEach(() => {
    wa = montarWhatsAppConMensajesObservados();
    marcador.marcarTodo(document);
    observador = new MutationObserver((registros) => {
      marcador.marcarCambios(registros);
    });
    observador.observe(document.documentElement, { childList: true, subtree: true });
  });

  afterEach(() => {
    observador.disconnect();
    wa.desmontar();
  });

  it('marca exactamente las horas y las reacciones de cada mensaje', () => {
    expect([...document.querySelectorAll(`[${HORA}]`)]).toEqual([...document.querySelectorAll('[data-prueba="hora"]')]);
    expect([...document.querySelectorAll(`[${REACCION}]`)]).toEqual([
      ...document.querySelectorAll('[data-prueba="reaccion"]'),
    ]);
  });

  it('no marca remitentes, separadores, iconos, botones de control ni el texto', () => {
    const marcados = [...document.querySelectorAll(`[${HORA}], [${REACCION}]`)];
    const excluidos = document.querySelectorAll(
      '[data-prueba="remitente"], [data-prueba="separador"], [data-icon], button[aria-label^="Reaccionar"], button[aria-label^="Responder"], [data-pre-plain-text]',
    );
    for (const excluido of excluidos) {
      expect(marcados.some((m) => m === excluido || m.contains(excluido) || excluido.contains(m))).toBe(false);
    }
  });

  it('no trata como reacción un mensaje de texto formado solo por un emoji', () => {
    const bloque = [...document.querySelectorAll('[data-pre-plain-text]')].find((b) => b.textContent === '🎉');
    expect(bloque).toBeDefined();
    expect(bloque?.closest(`[${REACCION}]`)).toBeNull();
    expect(bloque?.querySelector(`[${REACCION}]`)).toBeNull();
  });

  it('marca la hora y las reacciones de mensajes nuevos y de reacciones añadidas después', async () => {
    const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'saliente', texto: 'Nuevo', hora: '11:00', reaccion: 'texto' });
    await Promise.resolve();
    expect(fila.querySelector(`[data-prueba="hora"][${HORA}]`)).not.toBeNull();
    expect(fila.querySelector(`[data-prueba="reaccion"][${REACCION}]`)).not.toBeNull();

    const contenedor = wa.contenedoresMensaje[0];
    const reaccion = elemento('button', '🙏 1');
    contenedor?.append(reaccion);
    await Promise.resolve();
    expect(reaccion.hasAttribute(REACCION)).toBe(true);

    reaccion.remove();
    contenedor?.append(elemento('span', 'Texto normal'));
    await Promise.resolve();
    expect(contenedor?.querySelectorAll(`[${REACCION}]`)).toHaveLength(0);
  });

  it('clasifica el mensaje sin incluir el contenedor ni la fila', () => {
    const fila = wa.filasMensaje[1];
    if (!fila) throw new Error('sin fila');
    const { horas, reacciones, estados } = clasificarMensaje(fila);
    expect(horas).toHaveLength(1);
    expect(reacciones).toHaveLength(1);
    expect(estados).toHaveLength(1);
    expect(reacciones[0]?.matches('[data-testid="msg-container"], [data-id]')).toBe(false);
  });

  it('marca solo los indicadores de leído dentro de msg-meta', () => {
    expect([...document.querySelectorAll(`[${ESTADO}]`)]).toEqual([
      ...document.querySelectorAll('[data-testid="msg-meta"] [data-prueba="estado"]'),
    ]);
    expect(document.querySelectorAll(`[${ESTADO}]`)).toHaveLength(3);
  });

  it('desmarca todo sin alterar el contenido', () => {
    marcador.desmarcarTodo(document);
    expect(document.querySelectorAll(`[${HORA}], [${REACCION}], [${ESTADO}]`)).toHaveLength(0);
  });
});

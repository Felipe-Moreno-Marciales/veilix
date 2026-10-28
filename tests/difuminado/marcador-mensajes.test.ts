// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clasificarMensaje,
  crearMarcadorMensajes,
  esContenidoEmoji,
  esHora,
  esDuracion,
  esEncabezadoEstado,
} from '@/nucleo/difuminado/marcador-mensajes';
import { MENSAJES_CITAS_MINIATURA, MENSAJES_ENCABEZADOS_CITA, montarWhatsAppConMensajesObservados, montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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
  const marcador = crearMarcadorMensajes({ hora: HORA, reaccion: REACCION, estado: ESTADO, duracionCita: 'data-veilix-duracion-cita', encabezadoEstado: 'data-veilix-encabezado-estado' });

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

describe('duración de una cita', () => {
  it('esDuracion reconoce duraciones de minutos y de horas, no horas con a. m. ni otros textos', () => {
    for (const texto of ['0:18', '12:05', '1:02:07']) expect(esDuracion(texto), texto).toBe(true);
    for (const texto of ['10:40 a. m.', '10.40', 'Foto', '', '0:1', '123:45']) expect(esDuracion(texto), texto).toBe(false);
  });

  it('marca el contenedor con chat-msg-symbol y la duración como texto directo, y nada de lo que contiene', () => {
    const wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Ana', MENSAJES_CITAS_MINIATURA);
    const filas = [...document.querySelectorAll('#main [data-id]')];
    const resultado = filas.map((fila) => clasificarMensaje(fila));
    const duraciones = resultado.flatMap((r) => r.duracionesCita);
    expect(duraciones.map((d) => d.getAttribute('data-prueba'))).toEqual(['duracion-cita', 'duracion-cita']);
    const horas = resultado.flatMap((r) => r.horas);
    // Las horas de msg-meta siguen siendo horas, y nada de las citas se clasifica como hora.
    expect(horas.filter((h) => h.closest('[data-testid="msg-meta"]')).length).toBe(filas.length);
    expect(horas.filter((h) => h.closest('[data-testid="quoted-message"]'))).toEqual([]);
    for (const r of resultado) {
      for (const elemento of [...r.horas, ...r.reacciones]) expect(r.duracionesCita.some((d) => d.contains(elemento))).toBe(false);
    }
    wa.desmontar();
  });
});

describe('encabezado de un estado citado', () => {
  it('esEncabezadoEstado exige un texto, un separador y la etiqueta de estado en español o inglés', () => {
    for (const texto of ['Tú · Estados', 'Ana · Estado', 'You · Status', '\u200eTú • Estados']) expect(esEncabezadoEstado(texto), texto).toBe(true);
    for (const texto of ['Tú', 'Estados', 'Ana', 'Mis estados', 'Tú · Estados de ánimo', '· Estados', 'Tú · Statut']) expect(esEncabezadoEstado(texto), texto).toBe(false);
  });

  it('marca solo los encabezados de estados citados, no los de las citas convencionales', () => {
    const wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Ana', MENSAJES_ENCABEZADOS_CITA);
    const marcados = [...document.querySelectorAll('#main [data-id]')].flatMap((fila) => clasificarMensaje(fila).encabezadosEstado);
    expect(marcados.map((e) => e.textContent)).toEqual(['Tú · Estados', 'Ana · Estado', 'You · Status']);
    wa.desmontar();
  });
});

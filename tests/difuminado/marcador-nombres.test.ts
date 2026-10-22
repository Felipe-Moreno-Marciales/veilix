// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  crearMarcadorFilasContacto,
  crearMarcadorNuevoChat,
  crearMarcadorRemitentes,
  esFilaNuevoChat,
  infoDeFilaNuevoChat,
  nombreDeFilaNuevoChat,
  elementosConNombre,
  esFilaContacto,
  normalizarNombre,
  remitenteDeBloque,
  textoConEmojis,
} from '@/nucleo/difuminado/marcador-nombres';
import {
  CONTACTOS_NUEVO_CHAT,
  montarWhatsAppConGrupo,
  montarWhatsAppSimulado,
  type WhatsAppSimulado,
} from '../apoyo/whatsapp-simulado';

const REMITENTE = 'data-veilix-remitente';

describe('nombres de remitentes', () => {
  it('normaliza marcas de dirección, espacios y la «~» de los contactos no guardados', () => {
    expect(normalizarNombre('‎~ Luis ')).toBe('Luis');
    expect(normalizarNombre('Ana  García')).toBe('Ana García');
  });

  it('extrae el remitente de data-pre-plain-text solo con el formato esperado', () => {
    expect(remitenteDeBloque('[10:40, 15/10/2026] Ana: ')).toBe('Ana');
    expect(remitenteDeBloque('[10:40 p. m., 15/10/2026] +34 600 00 00 00: ')).toBe('+34 600 00 00 00');
    expect(remitenteDeBloque('[10:40, 15/10/2026] Eva 🌸: ')).toBe('Eva 🌸');
    expect(remitenteDeBloque('Texto sin formato')).toBeNull();
    expect(remitenteDeBloque('')).toBeNull();
  });

  it('textoConEmojis incluye los emojis de <img alt> y no el contenido de los SVG', () => {
    const span = document.createElement('span');
    const emoji = document.createElement('img');
    emoji.alt = '🌸';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.append(document.createElementNS('http://www.w3.org/2000/svg', 'title'));
    svg.firstElementChild?.append('wds-ic-x');
    span.append('Eva ', emoji, svg);
    expect(textoConEmojis(span)).toBe('Eva 🌸');
  });

  describe('en una conversación de grupo', () => {
    let wa: WhatsAppSimulado;
    let observador: MutationObserver;
    const marcador = crearMarcadorRemitentes(REMITENTE);

    beforeEach(() => {
      wa = montarWhatsAppConGrupo();
      marcador.marcarTodo(document);
      observador = new MutationObserver((registros) => {
        marcador.marcarCambios(registros);
      });
      observador.observe(document.documentElement, { childList: true, subtree: true });
    });

    afterEach(() => {
      observador.disconnect();
      marcador.desmarcarTodo(document);
      wa.desmontar();
    });

    const marcados = () => [...document.querySelectorAll(`[${REMITENTE}]`)];

    it('marca remitentes, autores de citas y el autor del aviso fijado', () => {
      const esperados = [
        ...document.querySelectorAll('[data-prueba="remitente"], [data-prueba="autor-cita"], [data-prueba="autor-fijado"]'),
      ];
      // 3 remitentes (Ana, «~ Luis», Eva 🌸), 2 autores de cita y 1 autor del aviso fijado.
      expect(esperados).toHaveLength(6);
      expect(marcados().sort()).toEqual(esperados.sort());
    });

    it('no marca el texto de los mensajes, el editor, la hora ni el encabezado', () => {
      for (const marcado of marcados()) {
        expect(marcado.closest('[data-pre-plain-text], [contenteditable], [data-testid="msg-meta"]')).toBeNull();
      }
      const elementos = elementosConNombre(wa.principal, new Set(['Hola a todos']));
      expect(elementos.filter((e) => e.closest('[data-pre-plain-text]'))).toHaveLength(0);
    });

    it('marca los nombres de mensajes nuevos y vuelve a marcar las citas cuando aparece un nombre nuevo', async () => {
      const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Nuevo', remitente: 'Marta', cita: { autor: 'Ana', texto: 'Hola' } });
      await Promise.resolve();
      expect(fila.querySelector(`[data-prueba="remitente"][${REMITENTE}]`)).not.toBeNull();
      expect(fila.querySelector(`[data-prueba="autor-cita"][${REMITENTE}]`)).not.toBeNull();
    });

    it('descarta los nombres al cambiar de conversación', async () => {
      wa.abrirConversacionObservada('Otro', [{ tipo: 'texto', direccion: 'entrante', texto: 'x', cita: { autor: 'Ana', texto: 'y' } }]);
      await Promise.resolve();
      expect(marcados()).toHaveLength(0);
    });
  });
});

describe('filas de contacto fuera de la lista de chats', () => {
  let wa: WhatsAppSimulado;
  beforeEach(() => {
    wa = montarWhatsAppSimulado();
    wa.abrirNuevoChat(CONTACTOS_NUEVO_CHAT);
  });
  afterEach(() => {
    wa.desmontar();
  });

  it('reconoce las filas con un avatar y un nombre, no las acciones ni las de la lista de chats', () => {
    const botones = wa.filasNuevoChat.map((f) => f.querySelector('[role="button"]'));
    for (const fila of wa.filasNuevoChat) expect(esFilaContacto(fila)).toBe(true);
    for (const boton of botones) expect(boton && esFilaContacto(boton)).toBe(true);
    for (const accion of document.querySelectorAll('[data-prueba="accion"]')) expect(esFilaContacto(accion)).toBe(false);
    for (const fila of wa.filas) expect(esFilaContacto(fila)).toBe(false);
  });

  it('marca filas añadidas como nodos independientes, sin botón interior (regresión 0.1.1-beta.0)', async () => {
    const marcador = crearMarcadorFilasContacto('data-veilix-fila-contacto', 'data-veilix-nombre-contacto');
    marcador.marcarTodo(document);
    const observador = new MutationObserver((registros) => {
      marcador.marcarCambios(registros);
    });
    observador.observe(document.documentElement, { childList: true, subtree: true });
    const [fila] = wa.agregarFilasNuevoChat([{ nombre: 'Nuevo contacto', avatar: 'svgForeignObject', sinBotonInterior: true }]);
    await Promise.resolve();
    observador.disconnect();
    expect(fila?.hasAttribute('data-veilix-fila-contacto')).toBe(true);
    expect(fila?.querySelector('[data-prueba="nombre-nuevo-chat"]')?.hasAttribute('data-veilix-nombre-contacto')).toBe(true);
    marcador.desmarcarTodo(document);
  });

  it('marca la fila y solo su nombre, y limpia al desmarcar', () => {
    const marcador = crearMarcadorFilasContacto('data-veilix-fila-contacto', 'data-veilix-nombre-contacto');
    marcador.marcarTodo(document);
    const nombres = [...document.querySelectorAll('[data-veilix-nombre-contacto]')];
    expect(nombres).toEqual([...document.querySelectorAll('[data-prueba="nombre-nuevo-chat"]')]);
    marcador.desmarcarTodo(document);
    expect(document.querySelectorAll('[data-veilix-fila-contacto], [data-veilix-nombre-contacto]')).toHaveLength(0);
  });
});

describe('«Nuevo chat» con la estructura observada', () => {
  let wa: WhatsAppSimulado;
  beforeEach(() => {
    wa = montarWhatsAppSimulado();
    wa.abrirNuevoChatObservado(['Ana', 'Banco']);
  });
  afterEach(() => {
    wa.desmontar();
  });

  it('reconoce las filas de contacto sin avatar y excluye las acciones', () => {
    for (const fila of wa.filasObservadas) {
      expect(esFilaNuevoChat(fila)).toBe(true);
      expect(nombreDeFilaNuevoChat(fila)?.getAttribute('data-prueba')).toBe('nombre-observado');
    }
    const acciones = [...document.querySelectorAll('[data-testid^="new-chat-drawer-new-"]')].map((a) => a.closest('[role="listitem"]'));
    expect(acciones).toHaveLength(3);
    for (const accion of acciones) expect(accion && esFilaNuevoChat(accion)).toBe(false);
  });

  it('la información secundaria son los textos de la celda distintos del nombre, sin iconos ni botones', () => {
    for (const fila of wa.filasObservadas) {
      const nombre = nombreDeFilaNuevoChat(fila);
      const info = infoDeFilaNuevoChat(fila, nombre);
      expect(info).toEqual([...fila.querySelectorAll('[data-prueba="info-observada"]')]);
      expect(info.some((e) => e.closest('button, svg') !== null)).toBe(false);
    }
  });

  it('un encabezado de sección como fila list-item-* no es un contacto', () => {
    const seccion = document.querySelector('[data-prueba="seccion-observada"]')?.closest('[role="listitem"]');
    expect(seccion && esFilaNuevoChat(seccion)).toBe(false);
  });

  it('no reconoce filas con la misma estructura fuera de «Nuevo chat»', () => {
    const fila = wa.crearFilaObservada('Fuera');
    document.body.append(fila);
    expect(esFilaNuevoChat(fila)).toBe(false);
    fila.remove();
  });

  it('marca y desmarca solo los nombres, también en filas añadidas después', async () => {
    const marcador = crearMarcadorNuevoChat('data-veilix-fila-nuevo-chat', 'data-veilix-nombre-nuevo-chat', 'data-veilix-info-nuevo-chat');
    marcador.marcarTodo(document);
    const observador = new MutationObserver((registros) => {
      marcador.marcarCambios(registros);
    });
    observador.observe(document.documentElement, { childList: true, subtree: true });
    wa.agregarContactosObservados(['Después']);
    await Promise.resolve();
    observador.disconnect();
    expect([...document.querySelectorAll('[data-veilix-nombre-nuevo-chat]')]).toEqual([
      ...document.querySelectorAll('[data-prueba="nombre-observado"]'),
    ]);
    marcador.desmarcarTodo(document);
    expect([...document.querySelectorAll('[data-veilix-info-nuevo-chat]')]).toEqual([]);
    expect(document.querySelectorAll('[data-veilix-fila-nuevo-chat], [data-veilix-nombre-nuevo-chat]')).toHaveLength(0);
  });
});

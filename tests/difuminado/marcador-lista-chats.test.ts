// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clasificarFila,
  crearMarcadorEstadoVistaPrevia,
  crearMarcadorListaChats,
  esSoloIcono,
  estadosDeVistaPrevia,
  filasAfectadas,
  textoVisible,
} from '@/nucleo/difuminado/marcador-lista-chats';
import {
  iconoLeido,
  iconoSvg,
  montarWhatsAppConEstados,
  montarWhatsAppConVistasEspeciales,
  montarWhatsAppSimulado,
  type WhatsAppSimulado,
} from '../apoyo/whatsapp-simulado';

const NOMBRE = 'data-veilix-nombre';
const VISTA = 'data-veilix-vista-previa';

function textosMarcados(fila: Element, atributo: string): string[] {
  return [...fila.querySelectorAll(`[${atributo}]`)].map((e) => e.textContent);
}

describe('clasificarFila', () => {
  let wa: WhatsAppSimulado;
  beforeEach(() => {
    wa = montarWhatsAppSimulado();
  });
  afterEach(() => {
    wa.desmontar();
  });

  it('distingue el nombre de la vista previa', () => {
    const fila = wa.filas[0];
    if (!fila) throw new Error('sin filas');
    const { nombre, vistasPrevias } = clasificarFila(fila);
    expect(nombre?.textContent).toBe('Ana García');
    expect(vistasPrevias.map((e) => e.textContent)).toContain('¿Nos vemos mañana?');
    expect(vistasPrevias).not.toContain(nombre);
  });

  it('no clasifica iconos, hora ni contador de no leídos', () => {
    const fila = wa.filas[0];
    if (!fila) throw new Error('sin filas');
    const { nombre, vistasPrevias } = clasificarFila(fila);
    for (const elemento of [nombre, ...vistasPrevias]) {
      expect(elemento?.closest('[data-icon]')).toBeNull();
      expect(elemento?.textContent).not.toBe('10:45');
      expect(elemento?.textContent).not.toBe('2');
    }
  });

  it('devuelve nombre nulo en filas sin textos', () => {
    const fila = document.createElement('div');
    expect(clasificarFila(fila)).toEqual({ nombre: null, vistasPrevias: [] });
  });
});

describe('marcador de la lista de chats', () => {
  let wa: WhatsAppSimulado;
  let observador: MutationObserver;
  const marcadorNombre = crearMarcadorListaChats('nombre', NOMBRE);
  const marcadorVista = crearMarcadorListaChats('vistaPrevia', VISTA);

  beforeEach(() => {
    wa = montarWhatsAppSimulado();
    marcadorNombre.marcarTodo(document);
    marcadorVista.marcarTodo(document);
    observador = new MutationObserver((registros) => {
      marcadorNombre.marcarCambios(registros);
      marcadorVista.marcarCambios(registros);
    });
    observador.observe(document.documentElement, { childList: true, subtree: true });
  });

  afterEach(() => {
    observador.disconnect();
    wa.desmontar();
  });

  it('marca nombre y vista previa de todas las filas', () => {
    for (const fila of wa.filas) {
      expect(textosMarcados(fila, NOMBRE)).toHaveLength(1);
      expect(textosMarcados(fila, VISTA).length).toBeGreaterThan(0);
    }
  });

  it('marca chats nuevos', async () => {
    const fila = wa.agregarChat({ nombre: 'Nuevo', vistaPrevia: 'Mensaje nuevo' });
    await Promise.resolve();
    expect(textosMarcados(fila, NOMBRE)).toEqual(['Nuevo']);
    expect(textosMarcados(fila, VISTA)).toContain('Mensaje nuevo');
  });

  it('marca la vista previa al llegar un mensaje', async () => {
    wa.actualizarVistaPrevia(1, 'Mensaje recién llegado');
    await Promise.resolve();
    const fila = wa.filas[1];
    if (!fila) throw new Error('sin fila');
    expect(textosMarcados(fila, VISTA)).toContain('Mensaje recién llegado');
  });

  it('conserva las marcas al reordenar la lista', async () => {
    wa.moverAlPrincipio(2);
    await Promise.resolve();
    const fila = wa.filas[0];
    if (!fila) throw new Error('sin fila');
    expect(textosMarcados(fila, NOMBRE)).toEqual(['Banco']);
    expect(textosMarcados(fila, VISTA)).toContain('Tu código es 123456');
  });

  it('reclasifica filas reutilizadas por la lista virtualizada', async () => {
    wa.reutilizarFila(0, { nombre: 'Otro contacto', vistaPrevia: 'Otro mensaje' });
    await Promise.resolve();
    const fila = wa.filas[0];
    if (!fila) throw new Error('sin fila');
    expect(textosMarcados(fila, NOMBRE)).toEqual(['Otro contacto']);
    expect(textosMarcados(fila, VISTA)).toContain('Otro mensaje');
  });

  it('desmarca todo sin tocar el texto', () => {
    const textoAntes = wa.lista.textContent;
    marcadorNombre.desmarcarTodo(document);
    marcadorVista.desmarcarTodo(document);
    expect(document.querySelectorAll(`[${NOMBRE}], [${VISTA}]`)).toHaveLength(0);
    expect(wa.lista.textContent).toBe(textoAntes);
  });

  it('ignora mutaciones fuera de la lista de chats', () => {
    const registro = {
      target: wa.principal,
      addedNodes: [wa.principal.firstChild],
    } as unknown as MutationRecord;
    expect(filasAfectadas([registro]).size).toBe(0);
  });
});

describe('indicador de leído asociado a la vista previa', () => {
  let wa: WhatsAppSimulado;
  beforeEach(() => {
    wa = montarWhatsAppConEstados();
  });
  afterEach(() => {
    wa.desmontar();
  });

  const filaDe = (nombre: string) => {
    const fila = wa.filas.find((f) => f.querySelector(`span[title="${nombre}"]`));
    if (!fila) throw new Error(nombre);
    return fila;
  };

  it('asocia el wds-ic-read de la línea de la vista previa', () => {
    for (const nombre of ['Leído', 'Sticker leído']) {
      const estados = estadosDeVistaPrevia(filaDe(nombre));
      expect(estados).toHaveLength(1);
      expect(estados[0]?.getAttribute('data-prueba')).toBe('estado');
    }
  });

  it('no asocia iconos ajenos ni un wds-ic-read de la línea del nombre', () => {
    expect(estadosDeVistaPrevia(filaDe('Temporal'))).toHaveLength(0);
    expect(estadosDeVistaPrevia(filaDe('Negativo'))).toHaveLength(0);
    expect(estadosDeVistaPrevia(filaDe('Recibido'))).toHaveLength(0);
  });

  it('el marcador sigue los cambios y se limpia', async () => {
    const atributo = 'data-veilix-estado-vista-previa';
    const marcador = crearMarcadorEstadoVistaPrevia(atributo);
    marcador.marcarTodo(document);
    expect(wa.lista.querySelectorAll(`[${atributo}]`)).toHaveLength(2);

    const observador = new MutationObserver((registros) => {
      marcador.marcarCambios(registros);
    });
    observador.observe(document.documentElement, { childList: true, subtree: true });
    const fila = filaDe('Recibido');
    const nuevo = iconoLeido(document);
    fila.querySelector('span[title]:not([dir])')?.before(nuevo);
    await Promise.resolve();
    expect(nuevo.querySelector('svg')?.hasAttribute(atributo)).toBe(true);
    observador.disconnect();

    marcador.desmarcarTodo(document);
    expect(document.querySelectorAll(`[${atributo}]`)).toHaveLength(0);
  });
});

describe('vistas previas especiales', () => {
  const span = (...hijos: (Node | string)[]) => {
    const elemento = document.createElement('span');
    elemento.append(...hijos);
    return elemento;
  };

  it('textoVisible ignora los <title> de los SVG', () => {
    expect(textoVisible(span(iconoSvg(document, 'wds-ic-read')))).toBe('');
    expect(textoVisible(span('Foto ', iconoSvg(document, 'icono')))).toBe('Foto');
  });

  it('esSoloIcono distingue iconos de vistas previas con iconos', () => {
    const conDataIcon = document.createElement('span');
    conDataIcon.setAttribute('data-icon', 'muted');
    expect(esSoloIcono(conDataIcon)).toBe(true);
    expect(esSoloIcono(span(iconoSvg(document, 'wds-ic-read')))).toBe(true);
    expect(esSoloIcono(span('reaccionó con ', iconoSvg(document, 'icono'), ' Foto'))).toBe(false);
    const emoji = document.createElement('img');
    emoji.alt = '👌';
    expect(esSoloIcono(span(emoji, iconoSvg(document, 'icono')))).toBe(false);
    expect(esSoloIcono(span('Texto'))).toBe(false);
  });

  it('clasifica como vista previa los bloques especiales sin cambiar el nombre', () => {
    const wa = montarWhatsAppConVistasEspeciales();
    for (const fila of wa.filas) {
      const { nombre, vistasPrevias } = clasificarFila(fila);
      expect(nombre).toBe(fila.querySelector('span[dir="auto"]'));
      const especial = fila.querySelector('[data-prueba="vista-especial"]');
      if (especial) expect(vistasPrevias).toContain(especial);
    }
    wa.desmontar();
  });
});

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clasificarFila,
  crearMarcadorListaChats,
  filasAfectadas,
} from '@/nucleo/difuminado/marcador-lista-chats';
import { montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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

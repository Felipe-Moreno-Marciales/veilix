/**
 * Sugerencias de menciones (`@`) de un grupo: el nombre de cada participante con
 * RF-01 y su avatar con RF-02, con la estructura confirmada por el diagnóstico
 * real sobre 0.1.3. La interacción (flechas, Intro, clic) es la del DOM
 * simulado. En Chromium, Firefox y WebKit de Playwright; no demuestra
 * compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { DESENFOQUE } from '@/nucleo/difuminado/hoja-estilos';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { MENSAJES_AVATARES_GRUPO, montarWhatsAppConAvataresGrupo, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const FILTRO_VEILIX = `blur(${DESENFOQUE})`;
const CINCO = ['difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarMensajesConversacion', 'difuminarCampoEntrada'] as const;
const PARTICIPANTES = ['Ana Secreta', '~ Bruno', 'Eva Privada'];

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

/** Filtros de Veilix en la cadena del elemento: el propio y sus antecesores. */
function filtrosVeilix(elemento: Element): number {
  let total = 0;
  for (let actual: Element | null = elemento; actual; actual = actual.parentElement) {
    if (getComputedStyle(actual).filter === FILTRO_VEILIX) total++;
  }
  return total;
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
    zona.style.cssText = 'position:fixed;left:0;top:0;width:40px;height:40px;z-index:2147483647';
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

describe('sugerencias de menciones en un grupo', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppConAvataresGrupo();
    wa.abrirMenciones(PARTICIPANTES);
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  const aplicar = async (...ids: IdFuncionalidad[]) => {
    gestor.aplicar(preferenciasCon(...ids));
    await siguienteFotograma();
  };
  const todos = (prueba: string) => [...document.querySelectorAll(`[data-prueba="${prueba}"]`)];
  const nombres = () => todos('nombre-mencion');
  const contenedoresNombre = () => todos('contenedor-nombre-mencion');
  const avatares = () => todos('avatar-mencion');
  const filasParticipante = () => todos('fila-mencion').filter((f) => f.querySelector('[data-testid="contact-mention-list-item"]'));
  const filaTodos = () => requerir(todos('fila-mencion').find((f) => f.querySelector('[data-testid="mention-all-list-item"]')));
  /** Lo que nunca debe difuminarse: la lista, los botones, «todos», su icono y la información secundaria. */
  const intocables = () => [
    ...todos('menciones'),
    ...todos('fila-mencion'),
    ...todos('mencion-contacto'),
    ...todos('secundario-mencion'),
    ...todos('mencion-todos'),
    ...todos('nombre-mencion-todos'),
    ...todos('descripcion-mencion-todos'),
    ...document.querySelectorAll('[data-prueba="mencion-todos"] [data-icon]'),
  ];
  const describir = (e: Element) => `${e.getAttribute('data-prueba') ?? e.localName}: ${e.textContent.slice(0, 30)}`;

  it('la página reproduce la lista fuera de #main, con «todos» y tres participantes', () => {
    expect(requerir(todos('menciones')[0]).closest('#main')).toBeNull();
    expect(todos('fila-mencion')).toHaveLength(4);
    expect(filasParticipante()).toHaveLength(3);
    expect(wa.editor.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('sin interruptores, los nombres, los avatares y «todos» se ven', () => {
    for (const elemento of [...nombres(), ...avatares(), ...intocables()]) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('RF-01 difumina el contenedor del nombre de cada participante, con un único filtro', async () => {
    await aplicar('difuminarNombres');
    for (const contenedor of contenedoresNombre()) expect(getComputedStyle(contenedor).filter, describir(contenedor)).toBe(FILTRO_VEILIX);
    for (const nombre of nombres()) {
      expect(getComputedStyle(nombre).filter, describir(nombre)).toBe('none');
      expect(filtrosVeilix(nombre), describir(nombre)).toBe(1);
    }
  });

  it('RF-01 no difumina el botón, «todos», su icono, la información secundaria, el avatar ni el editor', async () => {
    await aplicar('difuminarNombres');
    for (const elemento of [...intocables(), ...avatares(), wa.editor]) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('con RF-01 desactivada, los nombres vuelven a verse', async () => {
    await aplicar('difuminarNombres', 'difuminarFotos');
    await aplicar('difuminarFotos');
    for (const nombre of nombres()) expect(difuminado(nombre), describir(nombre)).toBe(false);
    for (const avatar of avatares()) expect(difuminado(avatar)).toBe(true);
  });

  it('RF-02 difumina solo los avatares, cada uno con un único filtro, sin depender de RF-01', async () => {
    await aplicar('difuminarFotos');
    for (const avatar of avatares()) expect(filtrosVeilix(avatar)).toBe(1);
    for (const elemento of [...nombres(), ...intocables()]) expect(difuminado(elemento), describir(elemento)).toBe(false);
    await aplicar('difuminarNombres');
    for (const avatar of avatares()) expect(difuminado(avatar)).toBe(false);
    for (const nombre of nombres()) expect(filtrosVeilix(nombre)).toBe(1);
  });

  it('con los cinco activos, cada nombre y cada avatar tiene un único filtro, y «todos» se ve', async () => {
    await aplicar(...CINCO);
    for (const elemento of [...nombres(), ...avatares()]) expect(filtrosVeilix(elemento), describir(elemento)).toBe(1);
    for (const elemento of intocables()) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('el cursor sobre una sugerencia revela solo su nombre, y al apartarlo se vuelve a difuminar', async () => {
    await aplicar(...CINCO);
    const [primera, segunda] = [requerir(filasParticipante()[0]), requerir(filasParticipante()[1])];
    const nombreDe = (fila: Element) => requerir(fila.querySelector('[data-prueba="nombre-mencion"]'));
    await userEvent.hover(primera);
    await expect.poll(() => difuminado(nombreDe(primera))).toBe(false);
    expect(difuminado(nombreDe(segunda))).toBe(true);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => nombres().every(difuminado)).toBe(true);
  });

  it('el atajo revela todos los nombres y los vuelve a difuminar al soltarlo', async () => {
    await aplicar(...CINCO);
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    await expect.poll(() => [...nombres(), ...avatares()].some(difuminado)).toBe(false);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    await expect.poll(() => [...nombres(), ...avatares()].every(difuminado)).toBe(true);
  });

  it('las flechas recorren la lista sin mover el foco del editor ni revelar los nombres', async () => {
    await aplicar('difuminarNombres');
    wa.editor.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(wa.editor);
    const seleccionada = requerir(document.getElementById(requerir(wa.editor.getAttribute('aria-activedescendant'))));
    expect(seleccionada.getAttribute('aria-selected')).toBe('true');
    expect(seleccionada).toBe(filasParticipante()[2]);
    for (const nombre of nombres()) expect(difuminado(nombre), describir(nombre)).toBe(true);
  });

  it('si el foco real del teclado llega a una sugerencia, revela su nombre (variante sin evidencia)', async () => {
    await aplicar('difuminarNombres');
    const fila = requerir(filasParticipante()[1]);
    fila.removeAttribute('tabindex');
    const ancla = document.createElement('button');
    fila.before(ancla);
    ancla.focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(fila);
    const nombre = requerir(fila.querySelector('[data-prueba="nombre-mencion"]'));
    await expect.poll(() => difuminado(nombre)).toBe(false);
    expect(nombres().filter(difuminado)).toHaveLength(2);
    ancla.focus();
    ancla.remove();
    await expect.poll(() => difuminado(nombre)).toBe(true);
  });

  it('Intro inserta la mención seleccionada con las flechas, sin alterar su texto', async () => {
    await aplicar(...CINCO);
    wa.editor.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(wa.mencionesInsertadas).toEqual(['~ Bruno']);
    expect(todos('menciones')).toHaveLength(0);
    expect(requerir(todos('mencion-insertada')[0]).textContent).toBe('@~ Bruno');
  });

  it('un clic sobre el nombre difuminado o sobre «todos» inserta la mención', async () => {
    await aplicar(...CINCO);
    await userEvent.click(requerir(nombres()[2]));
    expect(wa.mencionesInsertadas).toEqual(['Eva Privada']);
    wa.abrirMenciones(PARTICIPANTES);
    await userEvent.click(filaTodos());
    expect(wa.mencionesInsertadas).toEqual(['Eva Privada', 'todos']);
  });

  it('tras insertar la mención, el mensaje se puede enviar', async () => {
    await aplicar(...CINCO);
    await userEvent.click(requerir(filasParticipante()[0]));
    await userEvent.click(requerir(document.querySelector('#main footer button[aria-label="Enviar"]')));
    expect(wa.clics.get('Enviar')).toBe(1);
    expect(wa.editor.textContent).toContain('@Ana Secreta');
  });

  it('protege la lista al aparecer, al cerrarla y reabrirla varias veces, con un único filtro', async () => {
    wa.cerrarMenciones();
    await aplicar(...CINCO);
    for (let vez = 0; vez < 3; vez++) {
      wa.abrirMenciones(PARTICIPANTES.slice(vez));
      await siguienteFotograma();
      expect(nombres()).toHaveLength(3 - vez);
      for (const nombre of nombres()) expect(filtrosVeilix(nombre), describir(nombre)).toBe(1);
      wa.cerrarMenciones();
      await siguienteFotograma();
      expect(todos('menciones')).toHaveLength(0);
    }
  });

  it('al cambiar de grupo, la lista nueva se protege sin marcas heredadas', async () => {
    await aplicar(...CINCO);
    wa.cerrarMenciones();
    wa.abrirConversacionObservada('Otro grupo', MENSAJES_AVATARES_GRUPO.slice(0, 2));
    wa.abrirMenciones(['Marta Oculta', 'Luis Reservado']);
    await siguienteFotograma();
    for (const elemento of [...nombres(), ...avatares()]) expect(filtrosVeilix(elemento), describir(elemento)).toBe(1);
    const lista = requerir(todos('menciones')[0]);
    expect([lista, ...lista.querySelectorAll('*')].filter((e) => e.getAttributeNames().some((a) => a.startsWith('data-veilix-')))).toEqual([]);
  });

  it('al desactivar los cinco se restaura todo, sin estilos ni marcas', async () => {
    await aplicar(...CINCO);
    await aplicar();
    for (const elemento of [...nombres(), ...avatares()]) expect(difuminado(elemento)).toBe(false);
    expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
    expect([...document.querySelectorAll('*')].filter((e) => e.getAttributeNames().some((a) => a.startsWith('data-veilix-')))).toEqual([]);
  });
});

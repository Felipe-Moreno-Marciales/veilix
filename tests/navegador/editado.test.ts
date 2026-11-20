/**
 * Indicador «Editado» de los mensajes (RF-04), con la estructura confirmada en
 * WhatsApp Web real sobre 0.1.6. En Chromium, Firefox y WebKit de Playwright;
 * no demuestra compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { DESENFOQUE } from '@/nucleo/difuminado/hoja-estilos';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { type MensajeObservado, montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const FILTRO_VEILIX = `blur(${DESENFOQUE})`;
const CINCO = ['difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarMensajesConversacion', 'difuminarCampoEntrada'] as const;

const MENSAJES: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Recibido y editado', remitente: 'Ana', autor: 'boton', editado: true, hora: '10:41' },
  { tipo: 'texto', direccion: 'saliente', texto: 'Enviado y editado', editado: true, hora: '10:42' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Normal recibido', remitente: 'Luis', autor: 'boton', reaccion: 'texto', hora: '10:43' },
  { tipo: 'texto', direccion: 'saliente', texto: 'Normal enviado', hora: '10:44' },
];

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
    zona.style.cssText = 'position:fixed;right:0;top:0;width:40px;height:40px;z-index:2147483647';
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

describe('indicador «Editado» de los mensajes', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Grupo de prueba', MENSAJES);
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
  const editados = () => todos('editado');
  const horas = () => todos('hora');
  const cuerpos = () => [...document.querySelectorAll('#main [data-testid="msg-container"] [data-pre-plain-text]')];
  /** Lo que nunca debe difuminarse por el indicador: botones del mensaje, msg-meta y su envoltorio. */
  const ajenos = () => [
    ...document.querySelectorAll('#main [data-testid="msg-container"] button'),
    ...document.querySelectorAll('#main [data-testid="msg-meta"]'),
    ...document.querySelectorAll('#main [data-testid="msg-meta"] > div, #main [data-testid="msg-meta"] > div > span'),
  ];
  const describir = (e: Element) => `${e.getAttribute('data-prueba') ?? e.getAttribute('data-testid') ?? e.localName}: ${e.textContent.slice(0, 30)}`;

  it('la página reproduce dos mensajes editados, recibido y enviado, y dos normales', () => {
    expect(editados()).toHaveLength(2);
    expect(horas()).toHaveLength(4);
  });

  it('sin RF-04, el indicador se ve', async () => {
    await aplicar();
    for (const e of editados()) expect(difuminado(e), describir(e)).toBe(false);
  });

  it('RF-04 difumina el indicador con un único filtro propio, y la hora sigue con el suyo', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const e of editados()) {
      expect(getComputedStyle(e).filter, describir(e)).toBe(FILTRO_VEILIX);
      expect(filtrosVeilix(e), describir(e)).toBe(1);
    }
    for (const hora of horas()) expect(filtrosVeilix(hora), describir(hora)).toBe(1);
  });

  it('RF-04 no difumina msg-meta, el envoltorio del indicador ni los botones del mensaje', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const e of ajenos()) expect(getComputedStyle(e).filter, describir(e)).toBe('none');
  });

  it('el indicador se protege en cuanto aparece, sin esperar a la marca de la hora', async () => {
    await aplicar('difuminarMensajesConversacion');
    const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Nuevo', remitente: 'Eva', autor: 'boton', editado: true, hora: '10:50' });
    // En el mismo instante, antes de que el observador marque la hora.
    const editado = requerir(fila.querySelector('[data-prueba="editado"]'));
    const hora = requerir(fila.querySelector('[data-prueba="hora"]'));
    expect(hora.hasAttribute('data-veilix-hora-mensaje')).toBe(false);
    expect(filtrosVeilix(editado)).toBe(1);
    await siguienteFotograma();
    expect(hora.hasAttribute('data-veilix-hora-mensaje')).toBe(true);
    expect(filtrosVeilix(editado)).toBe(1);
  });

  it('al desactivar RF-04, sin recargar, el indicador vuelve a verse', async () => {
    await aplicar('difuminarMensajesConversacion');
    await aplicar();
    for (const e of editados()) expect(difuminado(e), describir(e)).toBe(false);
  });

  it('RF-01 no difumina el indicador, y RF-04 no cambia lo que difumina RF-01', async () => {
    await aplicar('difuminarNombres');
    for (const e of editados()) expect(difuminado(e), describir(e)).toBe(false);
    await aplicar('difuminarNombres', 'difuminarMensajesConversacion');
    for (const autor of document.querySelectorAll('#main [data-testid="author"]')) expect(filtrosVeilix(autor), describir(autor)).toBe(1);
  });

  it('con los cinco activos, cada indicador, hora y cuerpo tiene un único filtro', async () => {
    await aplicar(...CINCO);
    for (const e of [...editados(), ...horas(), ...cuerpos()]) expect(filtrosVeilix(e), describir(e)).toBe(1);
  });

  it('el cursor sobre un mensaje revela su indicador, no el de otros, y al salir se difumina', async () => {
    await aplicar(...CINCO);
    const [primero, segundo] = [requerir(editados()[0]), requerir(editados()[1])];
    await userEvent.hover(requerir(primero.closest('[data-testid="msg-container"]')));
    await expect.poll(() => difuminado(primero)).toBe(false);
    expect(difuminado(segundo)).toBe(true);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => editados().every(difuminado)).toBe(true);
  });

  it('el atajo revela los indicadores y los vuelve a difuminar al soltarlo', async () => {
    await aplicar(...CINCO);
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    await expect.poll(() => editados().some(difuminado)).toBe(false);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    await expect.poll(() => editados().every(difuminado)).toBe(true);
  });

  it('el foco del teclado en un botón del mensaje revela su indicador', async () => {
    await aplicar('difuminarMensajesConversacion');
    const editado = requerir(editados()[0]);
    const boton = requerir(editado.closest('[data-testid="msg-container"]')?.querySelector('button'));
    const ancla = document.createElement('button');
    boton.before(ancla);
    ancla.focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(boton);
    await expect.poll(() => difuminado(editado)).toBe(false);
    ancla.focus();
    ancla.remove();
    await expect.poll(() => difuminado(editado)).toBe(true);
  });

  it('al cambiar de conversación, los indicadores nuevos se protegen', async () => {
    await aplicar(...CINCO);
    wa.abrirConversacionObservada('Otro grupo', [{ tipo: 'texto', direccion: 'saliente', texto: 'Otro editado', editado: true }]);
    await siguienteFotograma();
    expect(editados()).toHaveLength(1);
    expect(filtrosVeilix(requerir(editados()[0]))).toBe(1);
  });

  it('la reacción y las demás protecciones de los mensajes siguen como antes', async () => {
    await aplicar('difuminarMensajesConversacion');
    const reaccion = requerir(document.querySelector('#main [data-prueba="reaccion"]'));
    expect(difuminado(reaccion)).toBe(true);
    for (const cuerpo of cuerpos()) expect(filtrosVeilix(cuerpo), describir(cuerpo)).toBe(1);
  });

  it('al desactivar los cinco se restaura todo, sin estilos ni marcas', async () => {
    await aplicar(...CINCO);
    await aplicar();
    for (const e of [...editados(), ...horas()]) expect(difuminado(e)).toBe(false);
    expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
    expect([...document.querySelectorAll('*')].filter((e) => e.getAttributeNames().some((a) => a.startsWith('data-veilix-')))).toEqual([]);
  });
});

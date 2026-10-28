/**
 * RF-04: datos de los documentos adjuntos (`[data-testid="document-thumb"]`,
 * estructura confirmada por el diagnóstico real sobre 0.1.2-beta.7 con PNG y
 * JPG), en Chromium, Firefox y WebKit de Playwright. PDF y DOCX son variantes
 * simuladas. No demuestra compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { DESENFOQUE } from '@/nucleo/difuminado/hoja-estilos';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { MENSAJES_DOCUMENTOS, montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const FILTRO_VEILIX = `blur(${DESENFOQUE})`;
const OTROS = ['difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarCampoEntrada'] as const;
const DATOS = '[data-prueba="nombre-documento"], [data-prueba="tipo-documento"], [data-prueba="tamano-documento"], [data-prueba="etiqueta-icono"]';
const CONTROLES = '[data-prueba="documento"], [data-prueba="icono-documento"], [data-prueba="dibujo-documento"], [data-prueba="descargar-documento"]';

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
    zona.style.cssText = 'position:fixed;right:0;bottom:0;width:40px;height:40px;z-index:2147483647';
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

describe('RF-04: documentos adjuntos', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Grupo de prueba', MENSAJES_DOCUMENTOS);
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
  const datos = (raiz: ParentNode = document) => [...raiz.querySelectorAll(DATOS)];
  const datosVisibles = (raiz: ParentNode = document) => datos(raiz).filter((e) => !difuminado(e));
  const tarjetas = () => [...document.querySelectorAll('#main [data-testid="document-thumb"]')];
  const describirDato = (e: Element) => `${e.getAttribute('data-prueba') ?? ''}: ${e.textContent}`;

  it('la conversación tiene cuatro documentos (PNG, JPG, PDF y DOCX) con nombre, formato, tamaño y etiqueta del icono', () => {
    expect(tarjetas()).toHaveLength(4);
    expect([...document.querySelectorAll('[data-testid="type"]')].map((e) => e.textContent)).toEqual(['PNG', 'JPG', 'PDF', 'DOCX']);
    expect([...document.querySelectorAll('[data-prueba="etiqueta-icono"]')].map((e) => e.textContent)).toEqual(['PNG', 'JPG', 'PDF', 'DOCX']);
    expect(datos()).toHaveLength(16);
  });

  it('sin RF-04, el nombre, el formato, el tamaño y la etiqueta del icono se ven', () => {
    expect(datosVisibles()).toHaveLength(16);
  });

  it('con RF-04, la etiqueta de extensión del icono queda difuminada, en cualquier orden respecto al dibujo', async () => {
    await aplicar('difuminarMensajesConversacion');
    const etiquetas = [...document.querySelectorAll('[data-prueba="etiqueta-icono"]')];
    expect(etiquetas.map((e) => e.nextElementSibling === null)).toContain(false);
    for (const etiqueta of etiquetas) {
      expect(getComputedStyle(etiqueta).filter, etiqueta.textContent).toBe(FILTRO_VEILIX);
      expect(filtrosVeilix(etiqueta)).toBe(1);
    }
    for (const dibujo of document.querySelectorAll('[data-prueba="dibujo-documento"], [data-prueba="dibujo-documento"] svg')) {
      expect(difuminado(dibujo)).toBe(false);
    }
  });

  it('con RF-04, el nombre, el formato y el tamaño de cada documento quedan difuminados', async () => {
    await aplicar('difuminarMensajesConversacion');
    expect(datosVisibles().map(describirDato)).toEqual([]);
  });

  it('cada dato recibe un único filtro de Veilix, y la descripción también', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const dato of datos()) expect(filtrosVeilix(dato), describirDato(dato)).toBe(1);
    const descripcion = requerir(document.querySelector('[data-prueba="descripcion-documento"] .selectable-text span'));
    expect(difuminado(descripcion)).toBe(true);
    expect(filtrosVeilix(descripcion)).toBe(1);
  });

  it('un nombre largo que ocupa varias líneas queda difuminado entero', async () => {
    await aplicar('difuminarMensajesConversacion');
    const largo = requerir(datos().find((e) => e.textContent.length > 60));
    const rectangulos = largo.getClientRects();
    expect(rectangulos.length).toBeGreaterThan(1);
    expect(getComputedStyle(largo).filter).toBe(FILTRO_VEILIX);
  });

  it('la tarjeta, el icono y el botón de descarga no se difuminan', async () => {
    await aplicar('difuminarMensajesConversacion');
    const controles = [...document.querySelectorAll(CONTROLES)];
    expect(controles).toHaveLength(16);
    for (const control of controles) expect(difuminado(control), control.getAttribute('data-prueba') ?? '').toBe(false);
  });

  it('el botón de descarga y la tarjeta siguen respondiendo a los clics', async () => {
    await aplicar('difuminarMensajesConversacion');
    await userEvent.click(requerir(document.querySelector('[data-prueba="descargar-documento"]')));
    await userEvent.click(requerir(document.querySelector('[data-prueba="icono-documento"]')));
    expect(wa.clics.get('Descargar documento')).toBe(1);
    expect(wa.clics.get('Abrir documento')).toBe(1);
  });

  it('la hora del mensaje mantiene su comportamiento: difuminada por RF-04, como antes', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const tarjeta of tarjetas()) {
      const hora = requerir(tarjeta.closest('[data-testid="msg-container"]')?.querySelector('[data-prueba="hora"]'));
      expect(difuminado(hora)).toBe(true);
      expect(filtrosVeilix(hora)).toBe(1);
    }
  });

  it('el cursor sobre un documento revela solo ese mensaje', async () => {
    await aplicar('difuminarMensajesConversacion');
    const [primera, segunda] = tarjetas();
    await userEvent.hover(requerir(primera));
    await expect.poll(() => datosVisibles(requerir(primera))).toHaveLength(4);
    expect(datosVisibles(requerir(segunda))).toEqual([]);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => datosVisibles()).toEqual([]);
  });

  it('el foco del teclado en la tarjeta revela su documento', async () => {
    await aplicar('difuminarMensajesConversacion');
    const tarjeta = requerir(document.querySelector<HTMLElement>('#main [data-testid="document-thumb"]'));
    tarjeta.focus({ focusVisible: true } as FocusOptions);
    await userEvent.keyboard('{Shift}');
    await expect.poll(() => datosVisibles(tarjeta)).toHaveLength(4);
    tarjeta.blur();
    await expect.poll(() => datosVisibles()).toEqual([]);
  });

  it('el atajo revela todos los documentos y los vuelve a difuminar al soltarlo', async () => {
    await aplicar('difuminarMensajesConversacion');
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    await expect.poll(() => datosVisibles()).toHaveLength(16);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    await expect.poll(() => datosVisibles()).toEqual([]);
  });

  it('al desactivar RF-04 se restauran, y al reactivarlo se vuelven a difuminar, sin recargar', async () => {
    const textos = datos().map((e) => e.textContent);
    await aplicar('difuminarMensajesConversacion');
    await aplicar();
    expect(datosVisibles()).toHaveLength(16);
    expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
    expect(datos().map((e) => e.textContent)).toEqual(textos);
    await aplicar('difuminarMensajesConversacion');
    expect(datosVisibles()).toEqual([]);
  });

  it('protege los documentos nuevos y los de otra conversación', async () => {
    await aplicar('difuminarMensajesConversacion');
    const fila = wa.agregarMensajeObservado({ tipo: 'documento', direccion: 'entrante', documento: { nombre: 'nuevo.png', formato: 'PNG', tamano: '9 kB' } });
    await siguienteFotograma();
    expect(datosVisibles(fila)).toEqual([]);
    wa.abrirConversacionObservada('Otro chat', MENSAJES_DOCUMENTOS.slice(0, 2));
    await siguienteFotograma();
    expect(tarjetas()).toHaveLength(2);
    expect(datosVisibles()).toEqual([]);
  });

  it('no difumina los mismos atributos fuera de una tarjeta de documento', async () => {
    const texto = requerir([...document.querySelectorAll('#main [data-testid="msg-container"]')].find((m) => !m.querySelector('[data-testid="document-thumb"], img, video')));
    const tarjeta = document.createElement('div');
    tarjeta.dataset['prueba'] = 'otra-tarjeta';
    for (const [atributos, contenido] of [[{ dir: 'auto' }, 'Título'], [{ 'data-testid': 'type' }, 'PNG'], [{ title: '1 kB' }, '1 kB']] as const) {
      const span = document.createElement('span');
      for (const [nombre, valor] of Object.entries(atributos)) span.setAttribute(nombre, valor);
      span.textContent = contenido;
      tarjeta.append(span);
    }
    texto.append(tarjeta);
    await aplicar('difuminarMensajesConversacion');
    for (const span of tarjeta.children) expect(difuminado(span), span.outerHTML).toBe(false);
  });

  it('depende solo de RF-04 y, con los cinco activos, sigue sin filtros duplicados', async () => {
    await aplicar(...OTROS);
    expect(datosVisibles()).toHaveLength(16);
    for (const control of document.querySelectorAll(CONTROLES)) expect(difuminado(control)).toBe(false);
    await aplicar(...OTROS, 'difuminarMensajesConversacion');
    expect(datosVisibles()).toEqual([]);
    for (const dato of datos()) expect(filtrosVeilix(dato), describirDato(dato)).toBe(1);
    for (const control of document.querySelectorAll(CONTROLES)) expect(difuminado(control)).toBe(false);
  });
});

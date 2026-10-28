/**
 * RF-01 y RF-02 en el panel «Info. del contacto», con la estructura confirmada
 * por el diagnóstico real sobre 0.1.2-beta.12 (`drawer-right` ›
 * `chat-info-drawer`): nombre, usuario, teléfono y descripción con RF-01, foto
 * con RF-02. En Chromium, Firefox y WebKit de Playwright; no demuestra
 * compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { DESENFOQUE } from '@/nucleo/difuminado/hoja-estilos';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { MENSAJES_OBSERVADOS, montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const FILTRO_VEILIX = `blur(${DESENFOQUE})`;
const CONTACTO = { nombre: 'Marta Secreta', usuario: '@marta.sec', telefono: '+57 300 1234567', descripcion: 'Disponible para secretos ', emojis: 4 } as const;
/** Datos personales que protege RF-01 en el panel. */
const DATOS = '[data-prueba="nombre-info-contacto"], [data-prueba="usuario-info-contacto"], [data-prueba="telefono-info-contacto"], [data-prueba="descripcion-info-contacto"]';
/** Partes del panel que deben seguir visibles con cualquier interruptor. */
const GENERICOS = [
  '[data-prueba="titulo-info-contacto"]',
  '[data-prueba="etiqueta-panel"]',
  '[data-prueba="marcador-notas"]',
  '[data-prueba="contador-panel"]',
  '[data-prueba="interruptor-panel"]',
  '[data-prueba="texto-sin-atribuir"]',
  '[data-prueba="info-contacto"] button:not([data-prueba="boton-foto"])',
  '[data-prueba="info-contacto"] [role="button"]',
  '[data-prueba="info-contacto"] header',
  '[data-testid="contact-info-header"]',
  '[data-testid="section-phone-number"]',
  '[data-testid="section-about"]',
  '[data-testid="notes-section"]',
  '[data-prueba="bloque-perfil"]',
].join(', ');
const OTROS = ['difuminarMensajesRecientes', 'difuminarMensajesConversacion', 'difuminarCampoEntrada'] as const;

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
    zona.style.cssText = 'position:fixed;left:0;bottom:0;width:40px;height:40px;z-index:2147483647';
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

describe('«Info. del contacto»: RF-01 y RF-02', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Marta Secreta', MENSAJES_OBSERVADOS);
    wa.abrirInfoContacto(CONTACTO);
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
  const datos = () => [...document.querySelectorAll(DATOS)];
  const visibles = () => datos().filter((e) => !difuminado(e));
  const foto = () => requerir(document.querySelector('[data-prueba="foto-info-contacto"]'));
  const genericos = () => [...document.querySelectorAll(GENERICOS)];
  const describir = (e: Element) => `${e.getAttribute('data-prueba') ?? e.getAttribute('data-testid') ?? e.localName}: ${e.textContent.slice(0, 30)}`;

  it('el panel reproduce la estructura observada', () => {
    const panel = requerir(document.querySelector('[data-testid="drawer-right"] [data-testid="chat-info-drawer"]'));
    for (const testid of ['contact-info-header', 'section-phone-number', 'section-about', 'notes-section']) {
      expect(panel.querySelector(`[data-testid="${testid}"]`), testid).not.toBeNull();
    }
    expect(panel.querySelector('[data-testid="contact-info-subtitle selectable-text"]')?.textContent).toBe(CONTACTO.nombre);
    // La etiqueta del teléfono está en la sección; el valor, en el div hermano.
    expect(panel.querySelector('[data-testid="section-phone-number"]')?.textContent).toBe('Número de teléfono');
    expect(panel.querySelector('[data-testid="section-phone-number"] + div')?.textContent).toBe(CONTACTO.telefono);
    expect(document.querySelectorAll('[data-prueba="emoji-descripcion"]')).toHaveLength(4);
    expect(datos()).toHaveLength(4);
  });

  it('sin RF-01, el nombre, el usuario, el teléfono y la descripción se ven', () => {
    expect(visibles()).toHaveLength(4);
  });

  it('con RF-01, los cuatro datos quedan difuminados, cada uno con un único filtro', async () => {
    await aplicar('difuminarNombres');
    expect(visibles().map(describir)).toEqual([]);
    for (const dato of datos()) expect(filtrosVeilix(dato), describir(dato)).toBe(1);
    // Solo CSS: ningún marcador de RF-01 marca el panel (como en el diagnóstico real).
    const panel = requerir(document.querySelector('[data-prueba="info-contacto"]'));
    expect([...panel.querySelectorAll('*')].flatMap((e) => e.getAttributeNames().filter((a) => a.startsWith('data-veilix-')))).toEqual([]);
  });

  it('los emojis de la descripción quedan bajo el mismo filtro, sin uno propio', async () => {
    await aplicar('difuminarNombres');
    for (const emoji of document.querySelectorAll('[data-prueba="emoji-descripcion"]')) {
      expect(getComputedStyle(emoji).filter).toBe('none');
      expect(filtrosVeilix(emoji)).toBe(1);
    }
  });

  it('títulos, etiquetas, botones, marcador de notas, contadores, interruptores y secciones siguen visibles', async () => {
    await aplicar('difuminarNombres', 'difuminarFotos');
    const lista = genericos();
    expect(lista.length).toBeGreaterThan(20);
    for (const elemento of lista) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('no difumina un texto seleccionable del panel que no corresponde a un dato confirmado', async () => {
    await aplicar('difuminarNombres');
    expect(difuminado(requerir(document.querySelector('[data-prueba="texto-sin-atribuir"]')))).toBe(false);
    expect(difuminado(requerir(document.querySelector('[data-prueba="marcador-notas"]')))).toBe(false);
  });

  it('los botones siguen funcionando con RF-01 y RF-02', async () => {
    await aplicar('difuminarNombres', 'difuminarFotos');
    await userEvent.click(requerir(document.querySelector('[data-prueba="boton-Llamar"]')));
    await userEvent.click(requerir(document.querySelector('[data-prueba="boton-Buscar"]')));
    expect(wa.clics.get('Llamar')).toBe(1);
    expect(wa.clics.get('Buscar')).toBe(1);
    await userEvent.click(requerir(document.querySelector('[data-prueba="boton-Cerrar"]')));
    expect(document.querySelector('[data-prueba="info-contacto"]')).toBeNull();
  });

  it('la foto depende solo de RF-02, y los datos solo de RF-01', async () => {
    await aplicar('difuminarNombres');
    expect(difuminado(foto())).toBe(false);
    await aplicar('difuminarFotos');
    expect(filtrosVeilix(foto())).toBe(1);
    expect(visibles()).toHaveLength(4);
    await aplicar('difuminarNombres', 'difuminarFotos');
    expect(filtrosVeilix(foto())).toBe(1);
    for (const dato of datos()) expect(filtrosVeilix(dato)).toBe(1);
  });

  it('el cursor sobre un dato revela solo ese dato', async () => {
    await aplicar('difuminarNombres');
    const nombre = requerir(document.querySelector('[data-prueba="nombre-info-contacto"]'));
    await userEvent.hover(nombre);
    await expect.poll(() => difuminado(nombre)).toBe(false);
    expect(visibles()).toEqual([nombre]);
    const telefono = requerir(document.querySelector('[data-prueba="telefono-info-contacto"]'));
    await userEvent.hover(telefono);
    await expect.poll(() => visibles()).toEqual([telefono]);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => visibles()).toEqual([]);
  });

  it('el atajo revela los cuatro datos y los vuelve a difuminar al soltarlo', async () => {
    await aplicar('difuminarNombres');
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    await expect.poll(() => visibles()).toHaveLength(4);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    await expect.poll(() => visibles()).toEqual([]);
  });

  it('al desactivar RF-01 se restauran sin recargar, sin marcas ni cambios de texto, y se vuelven a difuminar al reactivarlo', async () => {
    const textos = datos().map((e) => e.textContent);
    await aplicar('difuminarNombres');
    await aplicar();
    expect(visibles()).toHaveLength(4);
    expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
    const panel = requerir(document.querySelector('[data-prueba="info-contacto"]'));
    expect([...panel.querySelectorAll('*')].filter((e) => e.getAttributeNames().some((a) => a.startsWith('data-veilix-')))).toEqual([]);
    expect(datos().map((e) => e.textContent)).toEqual(textos);
    await aplicar('difuminarNombres');
    expect(visibles()).toEqual([]);
  });

  it('protege el panel al abrirlo, cerrarlo y volver a abrirlo, y al cambiar de contacto', async () => {
    await aplicar('difuminarNombres');
    wa.cerrarInfoContacto();
    await siguienteFotograma();
    expect(datos()).toEqual([]);
    wa.abrirInfoContacto(CONTACTO);
    await siguienteFotograma();
    expect(visibles()).toEqual([]);
    wa.abrirInfoContacto({ nombre: 'Luis Privado', usuario: '@luis', telefono: '+34 600 000 000', descripcion: 'Otro texto privado' });
    await siguienteFotograma();
    expect(datos().map((e) => e.textContent)).toContain('Luis Privado');
    expect(visibles()).toEqual([]);
  });

  it('protege los datos si cambian con el panel abierto', async () => {
    await aplicar('difuminarNombres');
    const nombre = requerir(document.querySelector('[data-prueba="nombre-info-contacto"]'));
    nombre.textContent = 'Nombre actualizado';
    await siguienteFotograma();
    expect(difuminado(nombre)).toBe(true);
  });

  it('un contacto sin usuario ni descripción: protege el nombre y el teléfono, sin errores', async () => {
    await aplicar('difuminarNombres');
    wa.abrirInfoContacto({ nombre: 'Sin extras', telefono: '+57 311 0000000' });
    await siguienteFotograma();
    expect(datos()).toHaveLength(2);
    expect(visibles()).toEqual([]);
  });

  it('RF-03, RF-04 y RF-05 no tocan el panel; con los cinco activos, un único filtro por dato y por foto', async () => {
    await aplicar(...OTROS);
    expect(visibles()).toHaveLength(4);
    expect(difuminado(foto())).toBe(false);
    for (const elemento of genericos()) expect(difuminado(elemento), describir(elemento)).toBe(false);
    await aplicar(...OTROS, 'difuminarNombres', 'difuminarFotos');
    for (const dato of datos()) expect(filtrosVeilix(dato), describir(dato)).toBe(1);
    expect(filtrosVeilix(foto())).toBe(1);
    for (const elemento of genericos()) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('RF-01 sigue protegiendo la lista de chats y el encabezado de la conversación', async () => {
    await aplicar('difuminarNombres');
    for (const nombre of document.querySelectorAll('#pane-side span[dir="auto"][title], #main header span[dir="auto"]')) {
      expect(difuminado(nombre)).toBe(true);
    }
  });
});

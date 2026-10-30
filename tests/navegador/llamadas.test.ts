/**
 * Llamadas: panel flotante de una llamada en curso (nombre con RF-01, avatar con
 * RF-02, estado y duración con RF-04) y tarjetas de llamada de la conversación
 * (RF-04), con las estructuras confirmadas por el diagnóstico real sobre 0.1.2.
 * En Chromium, Firefox y WebKit de Playwright; no demuestra compatibilidad con
 * WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { DESENFOQUE } from '@/nucleo/difuminado/hoja-estilos';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { MENSAJES_LLAMADAS, montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const FILTRO_VEILIX = `blur(${DESENFOQUE})`;
const CINCO = ['difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarMensajesConversacion', 'difuminarCampoEntrada'] as const;

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

describe('llamadas: panel flotante y tarjetas de la conversación', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Marta Secreta', MENSAJES_LLAMADAS);
    wa.abrirPanelLlamada({ nombre: 'Marta Secreta', duracion: '02:15' });
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
  const uno = (prueba: string) => requerir(document.querySelector(`[data-prueba="${prueba}"]`));
  const todos = (prueba: string) => [...document.querySelectorAll(`[data-prueba="${prueba}"]`)];
  const nombre = () => uno('nombre-llamada');
  const avatar = () => uno('avatar-llamada');
  const datosPanel = () => [uno('estado-llamada'), uno('duracion-llamada')];
  const textosTarjetas = () => [...todos('titulo-llamada'), ...todos('detalle-llamada')];
  /** Partes de la llamada que nunca deben difuminarse. */
  const controles = () => [
    uno('panel-llamada'),
    requerir(document.querySelector('[data-testid="voip-container-audio-call"]')),
    uno('contenedor-nombre-llamada'),
    uno('controles-llamada'),
    ...document.querySelectorAll('[data-prueba="controles-llamada"] button'),
    ...todos('tarjeta-llamada'),
    ...document.querySelectorAll('#main [data-testid="call-log-system-message"]'),
    ...todos('icono-llamada'),
  ];
  const describir = (e: Element) => `${e.getAttribute('data-prueba') ?? e.getAttribute('data-testid') ?? e.localName}: ${e.textContent.slice(0, 30)}`;

  it('la página reproduce el panel fuera de #main y cuatro tarjetas de llamada', () => {
    expect(uno('panel-llamada').closest('#main')).toBeNull();
    expect(document.querySelector('[data-testid="voip-call-timer"]')?.getAttribute('role')).toBe('timer');
    expect(document.querySelectorAll('#main [data-testid="call-log-system-message"]')).toHaveLength(4);
  });

  it('sin interruptores, el nombre, el avatar, el estado, la duración y las tarjetas se ven', () => {
    for (const elemento of [nombre(), avatar(), ...datosPanel(), ...textosTarjetas()]) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('RF-01 solo difumina el nombre del panel', async () => {
    await aplicar('difuminarNombres');
    expect(filtrosVeilix(nombre())).toBe(1);
    expect(getComputedStyle(uno('contenedor-nombre-llamada')).filter).toBe('none');
    for (const elemento of [avatar(), ...datosPanel(), ...textosTarjetas()]) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('el nombre también se difumina si no está en un span[dir="auto"]', async () => {
    const contenedor = uno('contenedor-nombre-llamada');
    contenedor.replaceChildren('Marta Secreta');
    await aplicar('difuminarNombres');
    expect(filtrosVeilix(contenedor)).toBe(1);
  });

  it('RF-02 solo difumina el avatar, con un único filtro, y se revela al desactivarlo', async () => {
    await aplicar('difuminarFotos');
    expect(filtrosVeilix(avatar())).toBe(1);
    for (const elemento of [nombre(), ...datosPanel(), ...textosTarjetas()]) expect(difuminado(elemento), describir(elemento)).toBe(false);
    await aplicar();
    expect(difuminado(avatar())).toBe(false);
  });

  it('RF-04 difumina el estado y la duración del panel y los textos de las tarjetas, no el nombre ni el avatar', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const elemento of [...datosPanel(), ...textosTarjetas()]) {
      expect(difuminado(elemento), describir(elemento)).toBe(true);
      expect(filtrosVeilix(elemento), describir(elemento)).toBe(1);
    }
    expect(difuminado(nombre())).toBe(false);
    expect(difuminado(avatar())).toBe(false);
  });

  it('los textos de las tarjetas se reconocen por su estructura, en cualquier idioma', async () => {
    wa.agregarMensajeObservado({ tipo: 'llamada', direccion: 'entrante', llamada: { titulo: 'Missed voice call', detalle: 'Tap to call back' } });
    await aplicar('difuminarMensajesConversacion');
    const ultimos = textosTarjetas().filter((e) => /Missed|Tap/.test(e.textContent));
    expect(ultimos).toHaveLength(2);
    for (const elemento of ultimos) expect(filtrosVeilix(elemento)).toBe(1);
  });

  it('la hora de las tarjetas sigue con su único filtro, y el icono no se difumina', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const hora of document.querySelectorAll('#main [data-testid="call-log-system-message"] [data-prueba="hora"]')) {
      expect(hora.hasAttribute('data-veilix-hora-mensaje')).toBe(true);
      expect(filtrosVeilix(hora)).toBe(1);
    }
    for (const icono of todos('icono-llamada')) expect(difuminado(icono)).toBe(false);
  });

  it('no difumina el panel, la barra de controles, sus botones, la tarjeta ni su icono, con los cinco interruptores', async () => {
    await aplicar(...CINCO);
    for (const elemento of controles()) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('los controles siguen funcionando: silenciar, cámara, volver a llamar y colgar', async () => {
    await aplicar(...CINCO);
    await userEvent.click(uno('control-Silenciar'));
    await userEvent.click(uno('control-Cámara'));
    await userEvent.click(requerir(todos('tarjeta-llamada')[0]));
    await userEvent.click(uno('control-Colgar'));
    expect(wa.clics.get('Silenciar')).toBe(1);
    expect(wa.clics.get('Cámara')).toBe(1);
    expect(wa.clics.get('Volver a llamar')).toBe(1);
    expect(wa.clics.get('Colgar')).toBe(1);
    expect(document.querySelector('[data-prueba="panel-llamada"]')).toBeNull();
  });

  it('con los cinco activos, cada dato tiene un único filtro', async () => {
    await aplicar(...CINCO);
    for (const elemento of [nombre(), avatar(), ...datosPanel(), ...textosTarjetas()]) expect(filtrosVeilix(elemento), describir(elemento)).toBe(1);
  });

  it('cada interruptor se desactiva sin afectar a los otros dos', async () => {
    await aplicar('difuminarNombres', 'difuminarFotos', 'difuminarMensajesConversacion');
    await aplicar('difuminarFotos', 'difuminarMensajesConversacion');
    expect(difuminado(nombre())).toBe(false);
    expect(difuminado(avatar())).toBe(true);
    expect(datosPanel().every(difuminado)).toBe(true);
    await aplicar('difuminarNombres', 'difuminarMensajesConversacion');
    expect(difuminado(avatar())).toBe(false);
    expect(difuminado(nombre())).toBe(true);
    await aplicar('difuminarNombres', 'difuminarFotos');
    expect(datosPanel().some(difuminado)).toBe(false);
    expect(textosTarjetas().some(difuminado)).toBe(false);
    expect(difuminado(nombre())).toBe(true);
    expect(difuminado(avatar())).toBe(true);
  });

  it('el cursor sobre el nombre o la duración revela solo ese dato', async () => {
    await aplicar(...CINCO);
    await userEvent.hover(nombre());
    await expect.poll(() => difuminado(nombre())).toBe(false);
    expect(datosPanel().every(difuminado)).toBe(true);
    await userEvent.hover(uno('duracion-llamada'));
    await expect.poll(() => difuminado(uno('duracion-llamada'))).toBe(false);
    expect(difuminado(nombre())).toBe(true);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => [nombre(), ...datosPanel()].every(difuminado)).toBe(true);
  });

  it('el cursor sobre una tarjeta revela sus textos', async () => {
    await aplicar('difuminarMensajesConversacion');
    const tarjeta = requerir(todos('tarjeta-llamada')[1]);
    await userEvent.hover(tarjeta);
    await expect.poll(() => [...tarjeta.querySelectorAll('[data-prueba="titulo-llamada"], [data-prueba="detalle-llamada"]')].some(difuminado)).toBe(false);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => textosTarjetas().every(difuminado)).toBe(true);
  });

  it('el atajo revela todos los datos de la llamada y los vuelve a difuminar al soltarlo', async () => {
    await aplicar(...CINCO);
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    await expect.poll(() => [nombre(), avatar(), ...datosPanel(), ...textosTarjetas()].some(difuminado)).toBe(false);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    await expect.poll(() => [nombre(), avatar(), ...datosPanel(), ...textosTarjetas()].every(difuminado)).toBe(true);
  });

  it('protege el panel al aparecer, al cerrarse y volver a abrirse, y cuando avanza la duración', async () => {
    wa.cerrarPanelLlamada();
    await aplicar(...CINCO);
    wa.abrirPanelLlamada({ nombre: 'Luis Privado', estado: 'Llamando…', duracion: '00:01' });
    await siguienteFotograma();
    for (const elemento of [nombre(), avatar(), ...datosPanel()]) expect(filtrosVeilix(elemento), describir(elemento)).toBe(1);
    uno('duracion-llamada').textContent = '00:02';
    await siguienteFotograma();
    expect(filtrosVeilix(uno('duracion-llamada'))).toBe(1);
    wa.cerrarPanelLlamada();
    wa.abrirPanelLlamada({ nombre: 'Marta Secreta' });
    await siguienteFotograma();
    expect([nombre(), avatar(), ...datosPanel()].every(difuminado)).toBe(true);
  });

  it('al desactivar los cinco se restaura todo, sin estilos ni marcas', async () => {
    await aplicar(...CINCO);
    await aplicar();
    for (const elemento of [nombre(), avatar(), ...datosPanel(), ...textosTarjetas()]) expect(difuminado(elemento)).toBe(false);
    expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
    expect([...document.querySelectorAll('*')].filter((e) => e.getAttributeNames().some((a) => a.startsWith('data-veilix-')))).toEqual([]);
  });

  it('el texto y la foto de los demás mensajes siguen protegidos como antes', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const elemento of document.querySelectorAll('#main .selectable-text span, #main [data-prueba="multimedia"] img')) {
      expect(filtrosVeilix(elemento)).toBe(1);
    }
  });
});

/**
 * Independencia de los cinco interruptores de difuminado (RF-01 a RF-05) en
 * Chromium, Firefox y WebKit de Playwright, sobre una página que reúne todas
 * las superficies protegidas: lista de chats, conversación de grupo con
 * autores, avatares y multimedia, recuadro «Responder», «Info. del mensaje»
 * con texto y sticker, y «Nuevo chat». Usa el DOM simulado de
 * `tests/apoyo/whatsapp-simulado.ts`: no demuestra compatibilidad con
 * WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { MENSAJES_AVATARES_GRUPO, montarWhatsAppConAvataresGrupo, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const INTERRUPTORES = [
  'difuminarNombres',
  'difuminarFotos',
  'difuminarMensajesRecientes',
  'difuminarMensajesConversacion',
  'difuminarCampoEntrada',
] as const satisfies readonly IdFuncionalidad[];
type Interruptor = (typeof INTERRUPTORES)[number];

/** Elementos que protege cada interruptor, por superficie (selectores del DOM simulado). */
const PROPIOS: Readonly<Record<Interruptor, readonly string[]>> = {
  difuminarNombres: [
    '#pane-side span[dir="auto"][title]',
    '#main header span[dir="auto"]',
    '[data-prueba="remitente"]',
    '#main footer [data-testid="quoted-message"] [data-testid="author"]',
    '[data-prueba="nombre-observado"]',
    '[data-prueba="info-observada"]',
    '[data-prueba="nombre-info-contacto"], [data-prueba="usuario-info-contacto"], [data-prueba="telefono-info-contacto"], [data-prueba="descripcion-info-contacto"]',
    '[data-prueba="nombre-llamada"]',
  ],
  difuminarFotos: [
    '#pane-side [data-prueba="avatar"] img',
    '#main header img',
    '[data-prueba="avatar-grupo"]',
    '[data-prueba="avatar-columna"]',
    '[data-prueba="foto-info-contacto"]',
    '[data-prueba="avatar-llamada"]',
  ],
  difuminarMensajesRecientes: ['#pane-side span[title] > span[dir="ltr"]'],
  difuminarMensajesConversacion: [
    '#main [data-id] [data-pre-plain-text]',
    '#main [data-prueba="multimedia"] img',
    '#main video',
    '#main footer [data-testid="quoted-message"] [data-testid="selectable-text"]',
    '[data-prueba="texto-info"]',
    '[data-prueba="sticker-canvas"]',
    // La capa desenfocada de la miniatura ya trae el filtro de WhatsApp: se vigila la nítida.
    '#main [data-testid="video-content"] [data-prueba="capa-nitida"]',
    '#main [data-prueba="nombre-documento"], #main [data-prueba="tipo-documento"], #main [data-prueba="tamano-documento"], #main [data-prueba="etiqueta-icono"]',
    '#main [data-prueba="miniatura-cita"]',
    '#main [data-prueba="duracion-cita"]',
    '#main [data-prueba="encabezado-cita"]',
    '[data-prueba="estado-llamada"], [data-prueba="duracion-llamada"], #main [data-prueba="titulo-llamada"], #main [data-prueba="detalle-llamada"]',
  ],
  difuminarCampoEntrada: ['#main footer [contenteditable="true"]'],
};

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

/** Cuántos elementos de la cadena (el propio y sus antecesores) tienen su propio filtro. */
function filtrosEnCadena(elemento: Element): number {
  let total = 0;
  for (let actual: Element | null = elemento; actual; actual = actual.parentElement) {
    if (getComputedStyle(actual).filter !== 'none') total++;
  }
  return total;
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

describe('independencia de los cinco interruptores', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppConAvataresGrupo();
    wa.responderA({ autor: 'Marta', texto: 'Hola, soy Marta' });
    // «Info. del mensaje» muestra un mensaje cada vez: aquí, un sticker; el texto se comprueba aparte.
    wa.abrirInfoMensaje({ sticker: 'animado' });
    wa.abrirNuevoChatObservado(['Ana', 'Luis', 'Eva', 'Sara']);
    wa.abrirInfoContacto({ nombre: 'Marta Secreta', usuario: '@marta', telefono: '+57 300 1234567', descripcion: 'Privado', emojis: 1 });
    wa.abrirPanelLlamada({ nombre: 'Marta Secreta', duracion: '02:15' });
    wa.agregarMensajeObservado({ tipo: 'llamada', direccion: 'entrante', llamada: { titulo: 'Llamada de voz', detalle: 'Sin respuesta' } });
    wa.agregarMensajeObservado({ tipo: 'videoMiniatura', direccion: 'entrante', miniaturaVideo: { orientacion: 'horizontal' } });
    wa.agregarMensajeObservado({ tipo: 'documento', direccion: 'entrante', documento: { nombre: 'captura-secreta.png', formato: 'PNG', tamano: '245 kB' } });
    wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Respuesta secreta', citaConMiniatura: { encabezado: 'Tú · Estados', duracion: '0:18', texto: 'Hola!' } });
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  const propios = (id: Interruptor) => PROPIOS[id].flatMap((selector) => [...document.querySelectorAll(selector)]);
  const aplicar = async (...ids: IdFuncionalidad[]) => {
    gestor.aplicar(preferenciasCon(...ids));
    await siguienteFotograma();
  };
  const describirFallo = (id: Interruptor, e: Element) => `${id}: ${e.outerHTML.slice(0, 70)}`;

  it('cada superficie de la página tiene elementos que proteger', () => {
    for (const id of INTERRUPTORES) {
      for (const selector of PROPIOS[id]) {
        if (selector.includes('texto-info')) continue;
        expect(document.querySelectorAll(selector).length, `${id} · ${selector}`).toBeGreaterThan(0);
      }
    }
  });

  it.each(INTERRUPTORES)('%s solo protege lo suyo y nada de los demás', async (id) => {
    await aplicar(id);
    for (const elemento of propios(id)) expect(difuminado(elemento), describirFallo(id, elemento)).toBe(true);
    for (const otro of INTERRUPTORES.filter((o) => o !== id)) {
      for (const elemento of propios(otro)) expect(difuminado(elemento), describirFallo(otro, elemento)).toBe(false);
    }
  });

  it.each(INTERRUPTORES)('con %s desactivado y los otros cuatro activos, lo suyo queda visible', async (id) => {
    await aplicar(...INTERRUPTORES.filter((o) => o !== id));
    for (const elemento of propios(id)) expect(difuminado(elemento), describirFallo(id, elemento)).toBe(false);
    for (const otro of INTERRUPTORES.filter((o) => o !== id)) {
      for (const elemento of propios(otro)) expect(difuminado(elemento), describirFallo(otro, elemento)).toBe(true);
    }
  });

  it('con los cinco activos, cada elemento protegido recibe un único filtro efectivo', async () => {
    await aplicar(...INTERRUPTORES);
    for (const id of INTERRUPTORES) {
      for (const elemento of propios(id)) expect(filtrosEnCadena(elemento), describirFallo(id, elemento)).toBe(1);
    }
  });

  it('con los cinco desactivados no queda ningún estilo, marca ni filtro de Veilix', async () => {
    await aplicar(...INTERRUPTORES);
    await aplicar();
    expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
    const marcados = [...document.querySelectorAll('*')].filter((e) => e.getAttributeNames().some((a) => a.startsWith('data-veilix-')));
    expect(marcados).toEqual([]);
    for (const id of INTERRUPTORES) for (const elemento of propios(id)) expect(difuminado(elemento)).toBe(false);
  });

  it('activar y desactivar uno a uno, sin recargar, no altera a los demás', async () => {
    await aplicar(...INTERRUPTORES);
    for (const id of INTERRUPTORES) {
      await aplicar(...INTERRUPTORES.filter((o) => o !== id));
      for (const elemento of propios(id)) expect(difuminado(elemento)).toBe(false);
      await aplicar(...INTERRUPTORES);
      for (const otro of INTERRUPTORES) for (const elemento of propios(otro)) expect(difuminado(elemento), describirFallo(otro, elemento)).toBe(true);
    }
  });

  it('al cambiar de conversación, los cinco siguen protegiendo lo suyo', async () => {
    await aplicar(...INTERRUPTORES);
    wa.abrirConversacionObservada('Otro grupo', MENSAJES_AVATARES_GRUPO);
    wa.responderA({ autor: 'Ana', texto: 'Otra cita' });
    await siguienteFotograma();
    for (const id of INTERRUPTORES) {
      for (const elemento of propios(id)) expect(difuminado(elemento), describirFallo(id, elemento)).toBe(true);
    }
  });

  it('el atajo revela a la vez lo de los cinco y lo vuelve a difuminar al soltarlo', async () => {
    await aplicar(...INTERRUPTORES);
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    for (const id of INTERRUPTORES) {
      for (const elemento of propios(id)) await expect.poll(() => difuminado(elemento), { message: describirFallo(id, elemento) }).toBe(false);
    }
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    for (const id of INTERRUPTORES) for (const elemento of propios(id)) expect(difuminado(elemento)).toBe(true);
  });

  it('el cursor sobre una fila de chats revela solo esa fila, no las conversaciones', async () => {
    await aplicar(...INTERRUPTORES);
    const fila = wa.filas[0];
    if (!fila) throw new Error('sin filas');
    await userEvent.hover(fila);
    for (const id of INTERRUPTORES) {
      for (const elemento of propios(id)) {
        await expect.poll(() => difuminado(elemento), { message: describirFallo(id, elemento) }).toBe(!fila.contains(elemento));
      }
    }
  });

  it('el foco del teclado revela la fila de chats enfocada, pero el foco del editor no revela lo escrito', async () => {
    await aplicar(...INTERRUPTORES);
    const enfocable = wa.filas[0]?.querySelector<HTMLElement>('[tabindex="0"]');
    if (!enfocable) throw new Error('sin fila enfocable');
    enfocable.focus({ focusVisible: true } as FocusOptions);
    await userEvent.keyboard('{Shift}');
    const nombre = enfocable.querySelector('span[dir="auto"][title]');
    if (!nombre) throw new Error('sin nombre');
    await expect.poll(() => difuminado(nombre)).toBe(false);
    wa.editor.focus();
    await userEvent.keyboard('{Shift}');
    expect(document.activeElement).toBe(wa.editor);
    expect(difuminado(wa.editor)).toBe(true);
  });

  it('el texto de «Info. del mensaje» depende solo de RF-04', async () => {
    wa.abrirInfoMensaje({ texto: 'Copia secreta', emoji: true });
    const texto = document.querySelector('[data-prueba="texto-info"]');
    if (!texto) throw new Error('sin texto en «Info. del mensaje»');
    await aplicar('difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarCampoEntrada');
    expect(difuminado(texto)).toBe(false);
    await aplicar('difuminarMensajesConversacion');
    expect(difuminado(texto)).toBe(true);
    expect(filtrosEnCadena(texto)).toBe(1);
  });
});

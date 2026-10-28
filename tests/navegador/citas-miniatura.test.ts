/**
 * RF-04: miniaturas y duraciones de las citas dentro de los mensajes
 * (`quoted-message` con un fondo en línea `data:image/jpeg`, y la duración
 * como texto directo de un contenedor con `chat-msg-symbol`; estructuras
 * confirmadas por los diagnósticos reales sobre 0.1.2-beta.9 y
 * 0.1.2-beta.10, muy probablemente de una respuesta a un estado), en
 * Chromium, Firefox y WebKit de Playwright. No demuestra compatibilidad con
 * WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { DESENFOQUE } from '@/nucleo/difuminado/hoja-estilos';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { MENSAJES_CITAS_MINIATURA, montarWhatsAppSimulado, URL_MINIATURA_MENSAJE, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const FILTRO_VEILIX = `blur(${DESENFOQUE})`;
const OTROS = ['difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarCampoEntrada'] as const;

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

describe('RF-04: miniaturas de las citas', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Ana', MENSAJES_CITAS_MINIATURA);
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
  const miniaturas = (raiz: ParentNode = document) => [...raiz.querySelectorAll('#main [data-prueba="miniatura-cita"]')];
  const visibles = (raiz: ParentNode = document) => miniaturas(raiz).filter((m) => !difuminado(m));
  /** Partes de la cita que no son la miniatura, la duración ni el encabezado, y deben seguir visibles. */
  const encabezadoYControles = () => [
    ...document.querySelectorAll('#main [data-testid="quoted-message"], [data-prueba="boton-cita"], [data-prueba="columna-cita"]'),
  ];
  const duraciones = (raiz: ParentNode = document) => [...raiz.querySelectorAll('#main [data-prueba="duracion-cita"]')];
  const duracionesVisibles = (raiz: ParentNode = document) => duraciones(raiz).filter((d) => !difuminado(d));

  it('hay tres citas con miniatura de 58 × 58, con fondo data:image/jpeg en línea', () => {
    const lista = miniaturas();
    expect(lista).toHaveLength(3);
    for (const miniatura of lista) {
      const caja = miniatura.getBoundingClientRect();
      expect([caja.width, caja.height]).toEqual([58, 58]);
      expect(miniatura.getAttribute('style')).toContain('data:image/jpeg');
    }
  });

  it('sin RF-04, las miniaturas se ven', () => {
    expect(visibles()).toHaveLength(3);
  });

  it('con RF-04, todas las miniaturas citadas quedan difuminadas, con un único filtro', async () => {
    await aplicar('difuminarMensajesConversacion');
    expect(visibles()).toEqual([]);
    for (const miniatura of miniaturas()) {
      expect(getComputedStyle(miniatura).filter).toBe(FILTRO_VEILIX);
      expect(filtrosVeilix(miniatura)).toBe(1);
    }
  });

  it('sin RF-04, la duración se ve; con RF-04, su contenedor se difumina con un único filtro', async () => {
    expect(duracionesVisibles()).toHaveLength(2);
    await aplicar('difuminarMensajesConversacion');
    expect(duracionesVisibles()).toEqual([]);
    for (const duracion of duraciones()) {
      expect(getComputedStyle(duracion).filter).toBe(FILTRO_VEILIX);
      expect(filtrosVeilix(duracion)).toBe(1);
    }
  });

  it('el icono chat-msg-symbol y el texto citado del contenedor quedan bajo ese único filtro', async () => {
    await aplicar('difuminarMensajesConversacion');
    const dentro = duraciones().flatMap((d) => [...d.querySelectorAll('[data-testid="chat-msg-symbol"], [data-prueba="texto-citado"]')]);
    expect(dentro).toHaveLength(4);
    for (const elemento of dentro) {
      expect(getComputedStyle(elemento).filter, elemento.getAttribute('data-prueba') ?? '').toBe('none');
      expect(filtrosVeilix(elemento)).toBe(1);
    }
  });

  it('solo marca el contenedor de la duración, sin tocar el texto ni la estructura de la cita', async () => {
    const antes = requerir(document.querySelector('#main')).innerHTML.length;
    const textos = duraciones().map((d) => d.textContent);
    await aplicar('difuminarMensajesConversacion');
    expect(document.querySelectorAll('[data-veilix-duracion-cita]')).toHaveLength(2);
    for (const duracion of duraciones()) expect(duracion.hasAttribute('data-veilix-duracion-cita')).toBe(true);
    expect(duraciones().map((d) => d.textContent)).toEqual(textos);
    // La hora de msg-meta sigue marcada como hora, no como duración.
    for (const hora of document.querySelectorAll('#main [data-testid="msg-meta"] [data-prueba="hora"]')) {
      expect(hora.hasAttribute('data-veilix-hora-mensaje')).toBe(true);
      expect(hora.hasAttribute('data-veilix-duracion-cita')).toBe(false);
    }
    await aplicar();
    expect(document.querySelectorAll('[data-veilix-duracion-cita], [data-veilix-hora-mensaje]')).toHaveLength(0);
    expect(requerir(document.querySelector('#main')).innerHTML.length).toBe(antes);
  });

  it('no marca horas, textos ni contenedores de citas convencionales que no tengan la estructura confirmada', async () => {
    const nodo = (etiqueta: string, atributos: Record<string, string>, ...hijos: (Node | string)[]) => {
      const elemento = document.createElement(etiqueta);
      for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
      elemento.append(...hijos);
      return elemento;
    };
    // Como en el DOM real: el icono es un SVG con <title>, cuyo texto forma parte del textContent.
    const simbolo = () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const titulo = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titulo.textContent = 'status-v-ic';
      svg.append(titulo);
      return nodo('div', { 'data-testid': 'chat-msg-symbol' }, nodo('span', {}, svg));
    };
    const contenedor = requerir([...document.querySelectorAll('#main [data-testid="msg-container"]')].find((m) => m.querySelector('[data-prueba="cita"]')));
    const casos = {
      // Hora como texto directo, sin el símbolo.
      'sin-simbolo': nodo('div', { 'data-testid': 'quoted-message' }, nodo('div', { role: 'button', 'data-prueba': 'sin-simbolo' }, '10:40')),
      // Símbolo con un texto que no es una duración («Foto»).
      'no-duracion': nodo('div', { 'data-testid': 'quoted-message' }, nodo('div', { 'data-prueba': 'no-duracion' }, simbolo(), 'Foto')),
      // Símbolo y duración junto al autor de la cita: no se difumina el autor.
      'con-autor': nodo('div', { 'data-testid': 'quoted-message' }, nodo('div', { 'data-prueba': 'con-autor' }, simbolo(), '0:18', nodo('span', { 'data-testid': 'author' }, 'Ana'))),
      // Símbolo y duración junto al encabezado.
      'con-encabezado': nodo('div', { 'data-testid': 'quoted-message' }, nodo('div', { 'data-prueba': 'con-encabezado' }, simbolo(), '0:18', nodo('span', { dir: 'auto' }, 'Ana'))),
      // Símbolo y duración fuera de una cita.
      'fuera-de-cita': nodo('div', { 'data-prueba': 'fuera-de-cita' }, simbolo(), '0:18'),
    };
    contenedor.append(...Object.values(casos));
    await aplicar('difuminarMensajesConversacion');
    for (const prueba of Object.keys(casos)) {
      const elemento = requerir(document.querySelector(`[data-prueba="${prueba}"]`));
      expect(elemento.hasAttribute('data-veilix-duracion-cita'), prueba).toBe(false);
      if (prueba === 'sin-simbolo') {
        // Su texto completo es una hora: la regla de la hora de RF-04 la difumina, igual que antes de esta versión.
        expect(elemento.hasAttribute('data-veilix-hora-mensaje')).toBe(true);
        expect(filtrosVeilix(elemento)).toBe(1);
      } else {
        expect(difuminado(elemento), prueba).toBe(false);
      }
    }
  });

  it('el texto citado y la respuesta siguen difuminados, con un solo filtro', async () => {
    await aplicar('difuminarMensajesConversacion');
    const textos = [...document.querySelectorAll('[data-prueba="texto-citado"], #main .selectable-text:not([data-prueba="texto-citado"]) span')];
    expect(textos.length).toBeGreaterThan(3);
    for (const texto of textos) {
      expect(difuminado(texto)).toBe(true);
      expect(filtrosVeilix(texto)).toBe(1);
    }
  });

  it('la cita y su botón no se difuminan ni se marcan (el encabezado se prueba en encabezado-estado.test.ts)', async () => {
    await aplicar('difuminarMensajesConversacion');
    const partes = encabezadoYControles();
    expect(partes).toHaveLength(9);
    for (const parte of partes) {
      expect(difuminado(parte), parte.getAttribute('data-prueba') ?? parte.getAttribute('data-testid') ?? '').toBe(false);
      expect(parte.getAttributeNames().filter((a) => a.startsWith('data-veilix-'))).toEqual([]);
    }
  });

  it('la cita sigue respondiendo al clic, para ir al contenido citado', async () => {
    await aplicar('difuminarMensajesConversacion');
    await userEvent.click(requerir(document.querySelector('[data-prueba="miniatura-cita"]')));
    await userEvent.click(requerir(document.querySelector('[data-prueba="encabezado-cita"]')));
    expect(wa.clics.get('Abrir cita')).toBe(2);
  });

  it('el cursor sobre un mensaje revela solo su miniatura', async () => {
    await aplicar('difuminarMensajesConversacion');
    const [primera, segunda] = miniaturas();
    await userEvent.hover(requerir(primera));
    await expect.poll(() => difuminado(requerir(primera))).toBe(false);
    const [duracionPrimera, duracionSegunda] = duraciones();
    expect(difuminado(requerir(duracionPrimera))).toBe(false);
    expect(difuminado(requerir(segunda))).toBe(true);
    expect(difuminado(requerir(duracionSegunda))).toBe(true);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => [...visibles(), ...duracionesVisibles()]).toEqual([]);
  });

  it('el foco del teclado en la cita revela su miniatura', async () => {
    await aplicar('difuminarMensajesConversacion');
    const boton = requerir(document.querySelector<HTMLElement>('[data-prueba="boton-cita"]'));
    boton.focus({ focusVisible: true } as FocusOptions);
    await userEvent.keyboard('{Shift}');
    await expect.poll(() => difuminado(requerir(boton.querySelector('[data-prueba="miniatura-cita"]')))).toBe(false);
    expect(difuminado(requerir(boton.querySelector('[data-prueba="duracion-cita"]')))).toBe(false);
    boton.blur();
    await expect.poll(() => [...visibles(), ...duracionesVisibles()]).toEqual([]);
  });

  it('el atajo revela todas las miniaturas y las vuelve a difuminar al soltarlo', async () => {
    await aplicar('difuminarMensajesConversacion');
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    await expect.poll(() => visibles()).toHaveLength(3);
    expect(duracionesVisibles()).toHaveLength(2);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    await expect.poll(() => [...visibles(), ...duracionesVisibles()]).toEqual([]);
  });

  it('al desactivar RF-04 se restauran, y al reactivarlo se vuelven a difuminar, sin recargar', async () => {
    await aplicar('difuminarMensajesConversacion');
    await aplicar();
    expect(visibles()).toHaveLength(3);
    expect(duracionesVisibles()).toHaveLength(2);
    expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
    await aplicar('difuminarMensajesConversacion');
    expect([...visibles(), ...duracionesVisibles()]).toEqual([]);
  });

  it('protege las citas nuevas y las de otra conversación', async () => {
    await aplicar('difuminarMensajesConversacion');
    const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Nueva', citaConMiniatura: { encabezado: 'Tú · Estados', duracion: '0:05' } });
    await siguienteFotograma();
    expect(visibles(fila)).toEqual([]);
    expect(duraciones(fila)).toHaveLength(1);
    expect(duracionesVisibles(fila)).toEqual([]);
    wa.abrirConversacionObservada('Otro chat', MENSAJES_CITAS_MINIATURA.slice(0, 1));
    await siguienteFotograma();
    expect(miniaturas()).toHaveLength(1);
    expect(visibles()).toEqual([]);
  });

  it('no difumina la cita convencional, ni fondos data:image/jpeg fuera de una cita o del mensaje', async () => {
    const fondo = (prueba: string) => {
      const div = document.createElement('div');
      div.setAttribute('style', `background-image: url("${URL_MINIATURA_MENSAJE}"); width: 30px; height: 30px`);
      div.dataset['prueba'] = prueba;
      return div;
    };
    const texto = requerir([...document.querySelectorAll('#main [data-testid="msg-container"]')].find((m) => m.querySelector('[data-prueba="cita"]')));
    texto.append(fondo('fondo-en-mensaje'));
    wa.principal.prepend(fondo('fondo-conversacion'));
    requerir(wa.principal.querySelector('header')).append(fondo('fondo-encabezado'));
    await aplicar('difuminarMensajesConversacion');
    for (const prueba of ['fondo-en-mensaje', 'fondo-conversacion', 'fondo-encabezado']) {
      expect(difuminado(requerir(document.querySelector(`[data-prueba="${prueba}"]`))), prueba).toBe(false);
    }
    const cita = requerir(document.querySelector('[data-prueba="cita"]'));
    expect(difuminado(cita)).toBe(false);
  });

  it('no elige como miniatura un fondo que envuelve el texto citado o el encabezado', async () => {
    const boton = requerir(document.querySelector<HTMLElement>('[data-prueba="boton-cita"]'));
    boton.style.backgroundImage = `url("${URL_MINIATURA_MENSAJE}")`;
    await aplicar('difuminarMensajesConversacion');
    expect(difuminado(boton)).toBe(false);
    // El encabezado lo difumina su propia regla (un filtro), no un fondo que lo envuelva.
    expect(filtrosVeilix(requerir(boton.querySelector('[data-prueba="encabezado-cita"]')))).toBe(1);
  });

  it('depende solo de RF-04 y, con los cinco activos, sigue sin filtros duplicados', async () => {
    await aplicar(...OTROS);
    expect(visibles()).toHaveLength(3);
    await aplicar(...OTROS, 'difuminarMensajesConversacion');
    expect(visibles()).toEqual([]);
    for (const miniatura of miniaturas()) expect(filtrosVeilix(miniatura)).toBe(1);
    for (const duracion of duraciones()) expect(filtrosVeilix(duracion)).toBe(1);
    for (const texto of document.querySelectorAll('[data-prueba="duracion-cita"] [data-prueba="texto-citado"]')) expect(filtrosVeilix(texto)).toBe(1);
    // El encabezado «Tú · Estados» lo difumina RF-04, con un solo filtro aunque RF-01 también esté activo.
    for (const encabezado of document.querySelectorAll('[data-prueba="encabezado-cita"]')) expect(filtrosVeilix(encabezado)).toBe(1);
  });
});

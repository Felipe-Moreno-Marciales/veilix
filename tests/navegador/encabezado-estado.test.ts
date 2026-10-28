/**
 * RF-04: encabezado de los estados citados («Tú · Estados»), reconocido por la
 * estructura confirmada (`quoted-message` sin autor › `div[role=""]` ›
 * `span[dir="auto"]`) y, como criterio complementario, por la forma de su
 * texto. Incluye citas convencionales con la misma estructura como casos
 * negativos (supuestas: no se han observado dentro de un mensaje). En
 * Chromium, Firefox y WebKit de Playwright; no demuestra compatibilidad con
 * WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { DESENFOQUE } from '@/nucleo/difuminado/hoja-estilos';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { MENSAJES_ENCABEZADOS_CITA, montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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

describe('RF-04: encabezado de los estados citados', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Ana', MENSAJES_ENCABEZADOS_CITA);
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
  /** Encabezados de estados citados: el observado («Tú · Estados») y las variantes simuladas. */
  const encabezados = (raiz: ParentNode = document) => [...raiz.querySelectorAll('#main [data-prueba="encabezado-cita"]')];
  const visibles = (raiz: ParentNode = document) => encabezados(raiz).filter((e) => !difuminado(e));
  /** Partes de las citas convencionales (casos negativos) que RF-04 no debe tocar. */
  const convencionales = () => [...document.querySelectorAll('#main [data-prueba="cita-convencional"], #main [data-prueba="encabezado-convencional"], #main [data-prueba="barra-cita"]')];

  it('hay tres estados citados y cinco citas convencionales con la misma estructura', () => {
    expect(encabezados().map((e) => e.textContent)).toEqual(['Tú · Estados', 'Ana · Estado', 'You · Status']);
    expect(document.querySelectorAll('#main [data-prueba="encabezado-convencional"]')).toHaveLength(5);
    for (const encabezado of [...encabezados(), ...document.querySelectorAll('[data-prueba="encabezado-convencional"]')]) {
      expect(encabezado.parentElement?.getAttribute('role')).toBe('');
    }
  });

  it('sin RF-04, los encabezados se ven', () => {
    expect(visibles()).toHaveLength(3);
  });

  it('con RF-04, el encabezado de cada estado citado queda difuminado, solo el span y con un único filtro', async () => {
    await aplicar('difuminarMensajesConversacion');
    expect(visibles()).toEqual([]);
    for (const encabezado of encabezados()) {
      expect(getComputedStyle(encabezado).filter).toBe(FILTRO_VEILIX);
      expect(filtrosVeilix(encabezado)).toBe(1);
      expect(encabezado.hasAttribute('data-veilix-encabezado-estado')).toBe(true);
      // Ni el contenedor del encabezado ni la cita reciben el filtro.
      expect(difuminado(requerir(encabezado.parentElement))).toBe(false);
    }
  });

  it('la cita, su barra de color, la miniatura y la duración conservan su comportamiento', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const boton of document.querySelectorAll('#main [data-prueba="boton-cita"]')) {
      expect(difuminado(boton)).toBe(false);
      expect(difuminado(requerir(boton.firstElementChild))).toBe(false);
    }
    for (const miniatura of document.querySelectorAll('#main [data-prueba="miniatura-cita"]')) expect(filtrosVeilix(miniatura)).toBe(1);
    for (const duracion of document.querySelectorAll('#main [data-prueba="duracion-cita"]')) expect(filtrosVeilix(duracion)).toBe(1);
    await userEvent.click(requerir(encabezados()[0]));
    expect(wa.clics.get('Abrir cita')).toBe(1);
  });

  it('no difumina ni marca las citas convencionales: con autor, sin autor («Tú»), con «Estados» en el texto citado, ni un encabezado sin separador', async () => {
    await aplicar('difuminarMensajesConversacion');
    const partes = convencionales();
    expect(partes).toHaveLength(15);
    for (const parte of partes) {
      expect(difuminado(parte), `${parte.getAttribute('data-prueba') ?? ''}: ${parte.textContent}`).toBe(false);
      expect(parte.hasAttribute('data-veilix-encabezado-estado')).toBe(false);
    }
    // El texto citado sigue difuminado por su propia regla, con un solo filtro.
    for (const texto of document.querySelectorAll('#main [data-prueba="texto-convencional"]')) expect(filtrosVeilix(texto)).toBe(1);
    expect(document.querySelectorAll('[data-veilix-encabezado-estado]')).toHaveLength(3);
  });

  it('el cursor sobre un mensaje revela solo su encabezado', async () => {
    await aplicar('difuminarMensajesConversacion');
    const [primero, segundo] = encabezados();
    await userEvent.hover(requerir(primero));
    await expect.poll(() => difuminado(requerir(primero))).toBe(false);
    expect(difuminado(requerir(segundo))).toBe(true);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => visibles()).toEqual([]);
  });

  it('el foco del teclado en la cita revela su encabezado', async () => {
    await aplicar('difuminarMensajesConversacion');
    const boton = requerir(document.querySelector<HTMLElement>('#main [data-prueba="boton-cita"]'));
    boton.focus({ focusVisible: true } as FocusOptions);
    await userEvent.keyboard('{Shift}');
    await expect.poll(() => difuminado(requerir(boton.querySelector('[data-prueba="encabezado-cita"]')))).toBe(false);
    boton.blur();
    await expect.poll(() => visibles()).toEqual([]);
  });

  it('el atajo revela todos los encabezados y los vuelve a difuminar al soltarlo', async () => {
    await aplicar('difuminarMensajesConversacion');
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    await expect.poll(() => visibles()).toHaveLength(3);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    await expect.poll(() => visibles()).toEqual([]);
  });

  it('al desactivar RF-04 se restauran sin recargar, sin marcas ni cambios de texto, y se vuelven a difuminar al reactivarlo', async () => {
    const textos = encabezados().map((e) => e.textContent);
    await aplicar('difuminarMensajesConversacion');
    await aplicar();
    expect(visibles()).toHaveLength(3);
    expect(document.querySelectorAll('[data-veilix-encabezado-estado]')).toHaveLength(0);
    expect(encabezados().map((e) => e.textContent)).toEqual(textos);
    await aplicar('difuminarMensajesConversacion');
    expect(visibles()).toEqual([]);
  });

  it('protege los estados citados nuevos y los de otra conversación', async () => {
    await aplicar('difuminarMensajesConversacion');
    const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Nueva', citaConMiniatura: { encabezado: 'Tú · Estados' } });
    await siguienteFotograma();
    expect(encabezados(fila)).toHaveLength(1);
    expect(visibles(fila)).toEqual([]);
    wa.abrirConversacionObservada('Otro chat', MENSAJES_ENCABEZADOS_CITA.slice(0, 1));
    await siguienteFotograma();
    expect(visibles()).toEqual([]);
  });

  it('depende solo de RF-04: RF-01 no lo difumina y, con los cinco activos, sigue con un único filtro', async () => {
    await aplicar(...OTROS);
    expect(visibles()).toHaveLength(3);
    await aplicar(...OTROS, 'difuminarMensajesConversacion');
    expect(visibles()).toEqual([]);
    for (const encabezado of encabezados()) expect(filtrosVeilix(encabezado)).toBe(1);
  });
});

/**
 * RF-04: miniaturas de vídeo dibujadas como fondos CSS `data:image/jpeg`
 * dentro de `[data-testid="video-content"]` (estructura confirmada por el
 * diagnóstico real sobre 0.1.2-beta.6), en Chromium, Firefox y WebKit de
 * Playwright. Se prueban las dos relaciones posibles entre las capas
 * (hermanas o anidadas), que aún no están confirmadas. No demuestra
 * compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { DESENFOQUE } from '@/nucleo/difuminado/hoja-estilos';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { mensajesConVideos, montarWhatsAppSimulado, URL_MINIATURA_MENSAJE, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const FILTRO_VEILIX = `blur(${DESENFOQUE})`;
const FILTRO_WHATSAPP = 'blur(8px)';
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

/** Filtros de Veilix (6 px) en la cadena del elemento: el propio y sus antecesores. */
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

describe.each(['hermanas', 'anidadas'] as const)('RF-04: miniaturas de vídeo con capas %s', (capas) => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppSimulado();
    wa.abrirConversacionObservada('Grupo de prueba', mensajesConVideos(capas));
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
  const videos = () => [...document.querySelectorAll('#main [data-testid="video-content"]')];
  /** Capas que pintan la miniatura (todas las de fondo `data:image/jpeg` del vídeo). */
  const capasDe = (video: Element) => [...video.querySelectorAll('[style*="data:image/jpeg"]')];
  /** Capas que dejan ver la miniatura: sin ningún filtro en su cadena. */
  const expuestas = (video: Element) => capasDe(video).filter((capa) => !difuminado(capa));
  const todasExpuestas = () => videos().flatMap(expuestas);

  it('la página tiene un vídeo vertical y otro horizontal, cada uno con dos capas', () => {
    const tamanos = videos().map((v) => {
      const caja = v.getBoundingClientRect();
      return `${String(caja.width)}×${String(caja.height)}`;
    });
    expect(tamanos).toEqual(['256×354', '346×200']);
    for (const video of videos()) expect(capasDe(video)).toHaveLength(2);
  });

  it('sin RF-04, la capa nítida deja ver la miniatura aunque la otra tenga el filtro de WhatsApp', () => {
    for (const video of videos()) {
      expect(expuestas(video)).toEqual([requerir(video.querySelector('[data-prueba="capa-nitida"]'))]);
      expect(getComputedStyle(requerir(video.querySelector('[data-prueba="capa-desenfocada"]'))).filter).toBe(FILTRO_WHATSAPP);
    }
  });

  it('con RF-04, ninguna capa de los dos vídeos deja ver la miniatura', async () => {
    await aplicar('difuminarMensajesConversacion');
    expect(todasExpuestas()).toEqual([]);
  });

  it('cada capa queda bajo un único filtro de Veilix', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const video of videos()) {
      for (const capa of capasDe(video)) expect(filtrosVeilix(capa), capa.getAttribute('data-prueba') ?? '').toBe(1);
    }
  });

  it('ni el contenedor del vídeo ni la burbuja reciben el filtro', async () => {
    await aplicar('difuminarMensajesConversacion');
    for (const video of videos()) {
      for (let actual = video; actual !== document.body; actual = requerir(actual.parentElement)) {
        expect(getComputedStyle(actual).filter).toBe('none');
      }
    }
  });

  it('el botón de reproducir sigue visible', async () => {
    await aplicar('difuminarMensajesConversacion');
    const controles = [...document.querySelectorAll('[data-prueba="control-video"]')];
    expect(controles).toHaveLength(2);
    for (const control of controles) expect(difuminado(control)).toBe(false);
  });

  it('la foto, el vídeo con <video> y el texto siguen difuminados', async () => {
    await aplicar('difuminarMensajesConversacion');
    const otros = [
      requerir(document.querySelector('#main [data-prueba="multimedia"] img')),
      requerir(document.querySelector('#main video')),
      requerir(document.querySelector('#main .selectable-text span')),
    ];
    for (const elemento of otros) {
      expect(difuminado(elemento)).toBe(true);
      expect(filtrosVeilix(elemento)).toBe(1);
    }
  });

  it('al desactivar RF-04, sin recargar, las capas recuperan su aspecto original', async () => {
    await aplicar('difuminarMensajesConversacion');
    await aplicar();
    for (const video of videos()) {
      expect(getComputedStyle(requerir(video.querySelector('[data-prueba="capa-nitida"]'))).filter).toBe('none');
      expect(getComputedStyle(requerir(video.querySelector('[data-prueba="capa-desenfocada"]'))).filter).toBe(FILTRO_WHATSAPP);
    }
    expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
  });

  it('el cursor sobre un vídeo revela solo ese vídeo', async () => {
    await aplicar('difuminarMensajesConversacion');
    const [superior, inferior] = videos();
    await userEvent.hover(requerir(superior));
    await expect.poll(() => expuestas(requerir(superior)).length).toBeGreaterThan(0);
    expect(expuestas(requerir(inferior))).toEqual([]);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => todasExpuestas()).toEqual([]);
  });

  it('el atajo revela los dos vídeos y los vuelve a difuminar al soltarlo', async () => {
    await aplicar('difuminarMensajesConversacion');
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    for (const video of videos()) await expect.poll(() => expuestas(video).length).toBeGreaterThan(0);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    await expect.poll(() => todasExpuestas()).toEqual([]);
  });

  it('el foco del teclado en el vídeo lo revela', async () => {
    await aplicar('difuminarMensajesConversacion');
    const boton = requerir(document.querySelector<HTMLElement>('[data-prueba="video-miniatura"]'));
    boton.focus({ focusVisible: true } as FocusOptions);
    await userEvent.keyboard('{Shift}');
    const video = requerir(boton.querySelector('[data-testid="video-content"]'));
    await expect.poll(() => expuestas(video).length).toBeGreaterThan(0);
    boton.blur();
    await expect.poll(() => todasExpuestas()).toEqual([]);
  });

  it('protege los vídeos nuevos, tras cambiar de conversación y al recargar la miniatura', async () => {
    await aplicar('difuminarMensajesConversacion');
    wa.agregarMensajeObservado({ tipo: 'videoMiniatura', direccion: 'entrante', miniaturaVideo: { orientacion: 'vertical', capas } });
    await siguienteFotograma();
    expect(todasExpuestas()).toEqual([]);

    wa.abrirConversacionObservada('Otro chat', mensajesConVideos(capas));
    await siguienteFotograma();
    expect(videos()).toHaveLength(2);
    expect(todasExpuestas()).toEqual([]);

    // WhatsApp sustituye la miniatura (por ejemplo, al terminar de cargarla).
    const nitida = requerir(document.querySelector<HTMLElement>('[data-prueba="capa-nitida"]'));
    nitida.style.backgroundImage = `url("${URL_MINIATURA_MENSAJE}#nueva")`;
    await siguienteFotograma();
    expect(todasExpuestas()).toEqual([]);
  });

  it('no difumina fondos data:image/jpeg fuera de video-content: fondo de la conversación, encabezado y burbuja', async () => {
    const fondo = `background-image: url("${URL_MINIATURA_MENSAJE}"); width: 60px; height: 60px`;
    const crear = (prueba: string) => {
      const div = document.createElement('div');
      div.setAttribute('style', fondo);
      div.dataset['prueba'] = prueba;
      return div;
    };
    wa.principal.prepend(crear('fondo-conversacion'));
    requerir(wa.principal.querySelector('header')).append(crear('fondo-encabezado'));
    requerir(wa.principal.querySelector('[data-testid="msg-container"]')).append(crear('fondo-burbuja'));
    await aplicar('difuminarMensajesConversacion');
    for (const prueba of ['fondo-conversacion', 'fondo-encabezado', 'fondo-burbuja']) {
      expect(difuminado(requerir(document.querySelector(`[data-prueba="${prueba}"]`))), prueba).toBe(false);
    }
  });

  it('depende solo de RF-04: los otros cuatro interruptores no tocan los vídeos', async () => {
    await aplicar(...OTROS);
    for (const video of videos()) expect(expuestas(video)).toHaveLength(1);
    await aplicar(...OTROS, 'difuminarMensajesConversacion');
    expect(todasExpuestas()).toEqual([]);
    for (const video of videos()) for (const capa of capasDe(video)) expect(filtrosVeilix(capa)).toBe(1);
  });
});

/**
 * RF-02: difuminado de fotografías y avatares en navegadores reales
 * (Chromium, Firefox y WebKit de Playwright) con el DOM simulado.
 * No demuestra compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import {
  crearForeignObject,
  crearImagenSvg,
  crearSvgConMascara,
  montarWhatsAppConAvatares,
  type WhatsAppSimulado,
} from '../apoyo/whatsapp-simulado';

function preferenciasCon(...ids: IdFuncionalidad[]): Preferencias {
  const funcionalidades = { ...PREFERENCIAS_PREDETERMINADAS.funcionalidades };
  for (const id of ids) funcionalidades[id] = true;
  return { ...PREFERENCIAS_PREDETERMINADAS, funcionalidades };
}

/** El elemento se ve difuminado si él o un ancestro tiene `filter`. */
function difuminado(elemento: Element): boolean {
  for (let actual: Element | null = elemento; actual; actual = actual.parentElement) {
    if (getComputedStyle(actual).filter !== 'none') return true;
  }
  return false;
}

function requerir<T>(valor: T | null | undefined): T {
  if (valor === null || valor === undefined) throw new Error('Elemento no encontrado');
  return valor;
}

/** Contenido visual del avatar (img, fondo o icono predeterminado). */
function visualDe(contenedor: Element): Element {
  const marco = requerir(contenedor.querySelector('[data-prueba="avatar"]'));
  return requerir(marco.firstElementChild);
}

function zonaNeutra(): HTMLElement {
  let zona = document.getElementById('zona-neutra');
  if (!zona) {
    zona = document.createElement('div');
    zona.id = 'zona-neutra';
    zona.style.cssText = 'position:fixed;right:0;bottom:0;width:40px;height:40px;';
    document.body.append(zona);
  }
  return zona;
}

describe('RF-02: fotografías y avatares', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    wa = montarWhatsAppConAvatares();
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  describe('tipos de avatar', () => {
    it('difumina fotos de contactos y grupos, personalizadas y predeterminadas, en la lista', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      for (const fila of wa.filas) {
        expect(difuminado(visualDe(fila)), fila.textContent).toBe(true);
      }
    });

    it('difumina la foto del encabezado de la conversación', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      expect(difuminado(requerir(wa.principal.querySelector('header img')))).toBe(true);
    });

    it.each(['fotoPerfil', 'fondo', 'predeterminadoGrupo'] as const)(
      'difumina el avatar (%s) del panel de información',
      (tipo) => {
        gestor.aplicar(preferenciasCon('difuminarFotos'));
        const panel = wa.abrirPanelInformacion(tipo);
        expect(difuminado(visualDe(panel))).toBe(true);
      },
    );

    it('difumina la foto propia y los avatares de remitentes en grupos', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      expect(difuminado(visualDe(wa.agregarFotoPropia()))).toBe(true);
      expect(difuminado(visualDe(wa.agregarMensajeDeGrupo('Hola grupo', 'fotoPerfil')))).toBe(true);
      expect(difuminado(visualDe(wa.agregarMensajeDeGrupo('Sin foto', 'predeterminadoContacto')))).toBe(true);
    });
  });

  describe('avatares SVG (estructura observada en WhatsApp Web real)', () => {
    const filaPorNombre = (nombre: string) =>
      requerir(wa.filas.find((fila) => fila.querySelector(`span[title="${nombre}"]`)));

    it('difumina el <svg> completo con <image> y con <foreignObject> en la lista', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      for (const nombre of ['Contacto SVG con foto', 'Grupo SVG sin foto']) {
        const svg = visualDe(filaPorNombre(nombre));
        expect(svg.tagName.toLowerCase()).toBe('svg');
        // El filtro se aplica al propio <svg>, no a un antecesor.
        expect(getComputedStyle(svg).filter).toContain('blur');
      }
    });

    it('no altera el contenido del SVG al activar ni al desactivar', () => {
      const svgs = ['Contacto SVG con foto', 'Grupo SVG sin foto'].map((n) => visualDe(filaPorNombre(n)));
      const originales = svgs.map((svg) => svg.outerHTML);
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      expect(svgs.map((svg) => svg.outerHTML)).toEqual(originales);
      gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
      expect(svgs.map((svg) => svg.outerHTML)).toEqual(originales);
      for (const svg of svgs) expect(difuminado(svg)).toBe(false);
    });

    it('difumina avatares SVG en el encabezado y fotos SVG en otras zonas', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const encabezado = requerir(wa.principal.querySelector('header'));
      const svgEncabezado = crearSvgConMascara(document, crearForeignObject(document));
      encabezado.prepend(svgEncabezado);
      expect(difuminado(svgEncabezado)).toBe(true);
      expect(difuminado(visualDe(wa.abrirPanelInformacion('svgImagen')))).toBe(true);
      expect(difuminado(visualDe(wa.agregarMensajeDeGrupo('Hola', 'svgImagen')))).toBe(true);
    });

    it('no difumina SVG sin <image> ni <foreignObject>, ni iconos', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const fila = filaPorNombre('Contacto SVG con foto');
      const indicador = wa.agregarIndicadorSvg(fila);
      expect(difuminado(indicador)).toBe(false);
      // Un icono con estructura de avatar dentro de [data-icon] tampoco se difumina.
      const icono = requerir(fila.querySelector('[data-icon="muted"]'));
      const svgEnIcono = crearSvgConMascara(document, crearImagenSvg(document));
      icono.replaceChildren(svgEnIcono);
      expect(difuminado(svgEnIcono)).toBe(false);
      for (const elemento of [
        requerir(fila.querySelector('[aria-label$="no leídos"]')),
        requerir(fila.querySelector('span[title="Contacto SVG con foto"]')),
      ]) {
        expect(difuminado(elemento)).toBe(false);
      }
    });

    it('mantiene el difuminado al cargar la foto, con chats nuevos, reordenamiento y filas reutilizadas', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const fila = filaPorNombre('Grupo SVG sin foto');
      const imagen = wa.cargarImagenEnSvg(fila);
      expect(difuminado(imagen)).toBe(true);
      expect(difuminado(visualDe(fila))).toBe(true);

      const nueva = wa.agregarChat({ nombre: 'Nuevo SVG', vistaPrevia: 'Hola', avatar: 'svgForeignObject' });
      expect(difuminado(visualDe(nueva))).toBe(true);
      wa.moverAlPrincipio(2);
      expect(difuminado(visualDe(requerir(wa.filas[0])))).toBe(true);
      wa.reutilizarFila(3, { nombre: 'Reutilizada SVG', vistaPrevia: 'x', avatar: 'svgImagen' });
      expect(difuminado(visualDe(requerir(wa.filas[3])))).toBe(true);
    });

    it('revela con cursor, foco de teclado y atajo, y restaura el difuminado', async () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const fila = filaPorNombre('Contacto SVG con foto');
      const svg = visualDe(fila);

      await userEvent.hover(fila);
      await expect.poll(() => difuminado(svg)).toBe(false);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(svg)).toBe(true);

      const ancla = document.createElement('button');
      fila.before(ancla);
      ancla.focus();
      await userEvent.keyboard('{Tab}');
      await expect.poll(() => difuminado(svg)).toBe(false);
      ancla.focus();
      ancla.remove();
      await expect.poll(() => difuminado(svg)).toBe(true);

      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      await expect.poll(() => difuminado(svg)).toBe(false);
      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      expect(difuminado(svg)).toBe(true);
    });
  });

  describe('elementos que no deben difuminarse', () => {
    it('no afecta a contadores, iconos, horas, emojis, botones ni multimedia de mensajes', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const panel = wa.abrirPanelInformacion('fotoPerfil');
      const imagenMensaje = wa.agregarMensajeConImagen();
      const intactos = [
        requerir(wa.lista.querySelector('[aria-label$="no leídos"]')),
        ...wa.lista.querySelectorAll('[data-icon="muted"]'),
        requerir(wa.lista.querySelector('img.emoji')),
        ...wa.filas.map((f) => requerir(f.querySelector('span[dir="auto"]'))),
        ...wa.app.querySelectorAll('button'),
        requerir(panel.querySelector('span[dir="auto"]')),
        imagenMensaje,
        ...wa.principal.querySelectorAll('.selectable-text'),
      ];
      for (const elemento of intactos) expect(difuminado(elemento), elemento.outerHTML).toBe(false);
    });
  });

  describe('cambios dinámicos', () => {
    it('difumina fotos que se cargan después (carga diferida)', async () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const fila = requerir(wa.filas[2]);
      const imagen = wa.cargarFotoDiferida(fila);
      await Promise.resolve();
      expect(difuminado(imagen)).toBe(true);
    });

    it('mantiene el difuminado con chats nuevos, reordenamiento y filas reutilizadas', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const nueva = wa.agregarChat({ nombre: 'Nuevo', vistaPrevia: 'Hola', avatar: 'fondo' });
      expect(difuminado(visualDe(nueva))).toBe(true);
      wa.moverAlPrincipio(3);
      expect(difuminado(visualDe(requerir(wa.filas[0])))).toBe(true);
      wa.reutilizarFila(1, { nombre: 'Reutilizada', vistaPrevia: 'x', avatar: 'predeterminadoGrupo' });
      expect(difuminado(visualDe(requerir(wa.filas[1])))).toBe(true);
    });

    it('difumina la foto al cambiar de conversación', () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      wa.abrirConversacion('Otro', [{ texto: 'Hola', direccion: 'entrante' }]);
      expect(difuminado(requerir(wa.principal.querySelector('header img')))).toBe(true);
      expect(difuminado(visualDe(wa.agregarMensajeDeGrupo('Nuevo', 'fondo')))).toBe(true);
    });
  });

  describe('revelado temporal', () => {
    it('revela con el cursor cualquier tipo de avatar de una fila y lo restaura', async () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      for (const fila of wa.filas) {
        const tipo = requerir(fila.querySelector('span[dir="auto"]')).textContent;
        await userEvent.hover(fila);
        await expect.poll(() => difuminado(visualDe(fila)), { message: tipo }).toBe(false);
        await userEvent.hover(zonaNeutra());
        expect(difuminado(visualDe(fila)), tipo).toBe(true);
      }
    });

    it('revela con el foco de teclado en la fila', async () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const fila = requerir(wa.filas[0]);
      const ancla = document.createElement('button');
      fila.before(ancla);
      ancla.focus();
      await userEvent.keyboard('{Tab}');
      await expect.poll(() => difuminado(visualDe(fila))).toBe(false);
      ancla.remove();
    });

    it('revela el avatar del panel de información con el cursor encima', async () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const visual = visualDe(wa.abrirPanelInformacion('fotoPerfil'));
      await userEvent.hover(visual);
      await expect.poll(() => difuminado(visual)).toBe(false);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(visual)).toBe(true);
    });

    it('revela todos los avatares con Ctrl + Mayús + Espacio', async () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      const visuales = [
        ...wa.filas.map(visualDe),
        visualDe(wa.abrirPanelInformacion('fondo')),
        visualDe(wa.agregarMensajeDeGrupo('Hola', 'fotoPerfil')),
      ];
      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      for (const visual of visuales) await expect.poll(() => difuminado(visual)).toBe(false);
      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      for (const visual of visuales) expect(difuminado(visual)).toBe(true);
    });
  });

  it('al desactivar RF-02 se restaura todo al instante sin afectar a otras protecciones', () => {
    gestor.aplicar(preferenciasCon('difuminarFotos', 'difuminarNombres'));
    const visuales = [
      ...wa.filas.map(visualDe),
      visualDe(wa.abrirPanelInformacion('fotoPerfil')),
      visualDe(wa.agregarFotoPropia()),
    ];
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    for (const visual of visuales) expect(difuminado(visual)).toBe(false);
    expect(difuminado(requerir(wa.filas[0]?.querySelector('span[dir="auto"]')))).toBe(true);
    expect(document.querySelector('style[data-veilix-estilo="fotos"]')).toBeNull();
  });
});

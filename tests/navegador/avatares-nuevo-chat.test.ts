/**
 * RF-02 en «Nuevo chat»: columna del avatar de cada contacto y de la fila «Tú»,
 * con la estructura observada en WhatsApp Web real (diagnóstico de paneles
 * sobre 0.1.2-beta.1), en Chromium, Firefox y WebKit de Playwright. Cubre las
 * fotos y los avatares predeterminados (SVG sobre un círculo de color). Las
 * acciones como filas `list-item-*` y el bloque de controles de la celda son
 * peores casos supuestos (ver `abrirNuevoChatObservado`). No demuestra
 * compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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

/** Elementos del subárbol (incluido) con su propio `filter`. */
function filtrosPropios(elemento: Element): Element[] {
  return [elemento, ...elemento.querySelectorAll('*')].filter((e) => getComputedStyle(e).filter !== 'none');
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

const CONTACTOS = Array.from({ length: 18 }, (_, i) => `Contacto ${String(i + 1)}`);

describe('RF-02: avatares de «Nuevo chat» (estructura observada)', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppSimulado();
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  const panel = () => requerir(document.querySelector('[data-testid="new-chat-drawer"]'));
  const columnas = () => [...panel().querySelectorAll('[data-prueba="avatar-columna"]')];
  const fotos = () => [...panel().querySelectorAll('[data-prueba="avatar-foto"]')];
  const predeterminados = () => [...panel().querySelectorAll('[data-prueba="avatar-predeterminado"]')];
  const textosDeContacto = () => [...panel().querySelectorAll('[data-prueba="nombre-observado"], [data-prueba="info-observada"], [data-prueba="nombre-tu"]')];
  const noProtegidos = () => [
    ...panel().querySelectorAll(
      '[data-prueba="icono-accion"], [data-prueba="icono-accion"] *, [data-prueba="accion-observada"] span, [data-prueba="seccion-observada"], [data-prueba="encabezado-nuevo-chat"] span, [data-prueba="buscador-observado"], [data-prueba="funcional-observado"], [data-prueba="funcional-observado"] *',
    ),
  ];

  it('difumina las 12 fotos y los 6 avatares predeterminados de colores distintos', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    wa.abrirNuevoChatObservado(CONTACTOS);
    await siguienteFotograma();
    expect(fotos()).toHaveLength(12);
    expect(new Set(predeterminados().map((svg) => getComputedStyle(svg).backgroundColor)).size).toBe(6);
    for (const avatar of [...fotos(), ...predeterminados()]) expect(difuminado(avatar), avatar.outerHTML.slice(0, 80)).toBe(true);
  });

  it('protege el SVG y su círculo de color como una sola unidad, con un único filtro por avatar', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    wa.abrirNuevoChatObservado(CONTACTOS);
    await siguienteFotograma();
    expect(columnas()).toHaveLength(18);
    for (const columna of columnas()) expect(filtrosPropios(columna), columna.outerHTML.slice(0, 80)).toEqual([columna]);
    // La foto ya no recibe su propio filtro de `FOTO_PERFIL`: la columna la cubre.
    for (const foto of fotos()) expect(getComputedStyle(foto).filter).toBe('none');
  });

  it('protege la fila «Tú», con foto o con avatar predeterminado', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    wa.abrirNuevoChatObservado(['Ana'], { filaTu: 'foto' });
    const filaTu = () => requerir(panel().querySelector('[data-prueba="fila-tu"]'));
    await siguienteFotograma();
    expect(difuminado(requerir(filaTu().querySelector('[data-prueba="avatar-foto"]')))).toBe(true);
    expect(filtrosPropios(requerir(filaTu().querySelector('[data-prueba="avatar-columna"]')))).toHaveLength(1);
    wa.cerrarNuevoChatObservado();
    wa.abrirNuevoChatObservado(['Ana'], { filaTu: 'predeterminado3' });
    await siguienteFotograma();
    expect(difuminado(requerir(filaTu().querySelector('[data-prueba="avatar-predeterminado"]')))).toBe(true);
    expect(difuminado(requerir(filaTu().querySelector('[data-prueba="nombre-tu"]')))).toBe(false);
  });

  it('no difumina las acciones, los encabezados, el buscador, los iconos ni los botones', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos', 'difuminarNombres'));
    wa.abrirNuevoChatObservado(CONTACTOS, { filaTu: 'predeterminado0' });
    await siguienteFotograma();
    expect(panel().querySelectorAll('[data-prueba="icono-accion"]')).toHaveLength(3);
    for (const elemento of noProtegidos()) expect(difuminado(elemento), elemento.outerHTML.slice(0, 80)).toBe(false);
  });

  it('RF-02 sola no afecta a nombres ni descripciones; RF-01 sola no afecta a los avatares', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    wa.abrirNuevoChatObservado(CONTACTOS, { filaTu: 'foto' });
    await siguienteFotograma();
    for (const texto of textosDeContacto()) expect(difuminado(texto), texto.textContent).toBe(false);

    gestor.aplicar(preferenciasCon('difuminarNombres'));
    await siguienteFotograma();
    for (const columna of columnas()) expect(difuminado(columna)).toBe(false);
    for (const nombre of panel().querySelectorAll('[data-prueba="nombre-observado"]')) expect(difuminado(nombre)).toBe(true);

    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos'));
    await siguienteFotograma();
    for (const columna of columnas()) expect(filtrosPropios(columna)).toEqual([columna]);
    for (const nombre of panel().querySelectorAll('[data-prueba="nombre-observado"]')) expect(difuminado(nombre)).toBe(true);
  });

  it('mantiene la protección con la carga dinámica, la búsqueda, el desplazamiento y al volver a abrir', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    wa.abrirNuevoChatObservado([]);
    wa.agregarContactosObservados(['Llega 1', 'Llega 2', 'Llega 3', 'Llega 4']);
    await siguienteFotograma();
    for (const columna of columnas()) expect(difuminado(columna)).toBe(true);
    expect(predeterminados().length).toBeGreaterThan(0);

    wa.buscarContactosObservados(['Resultado A', 'Resultado B', 'Resultado C']);
    await siguienteFotograma();
    for (const columna of columnas()) expect(difuminado(columna)).toBe(true);

    wa.reutilizarFilaObservada(0, 'Reutilizada', 'emoji', 'predeterminado5');
    await siguienteFotograma();
    expect(difuminado(requerir(wa.filasObservadas[0]?.querySelector('[data-prueba="avatar-predeterminado"]')))).toBe(true);

    wa.cerrarNuevoChatObservado();
    wa.abrirNuevoChatObservado(CONTACTOS.slice(0, 6));
    await siguienteFotograma();
    for (const columna of columnas()) expect(difuminado(columna)).toBe(true);
  });

  it('revela el avatar con su fila (cursor, foco y atajo) y lo vuelve a difuminar', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    wa.abrirNuevoChatObservado(CONTACTOS.slice(0, 3));
    await siguienteFotograma();
    const fila = requerir(wa.filasObservadas[1]);
    const avatar = requerir(fila.querySelector('[data-prueba="avatar-predeterminado"]'));
    await userEvent.hover(fila);
    await expect.poll(() => difuminado(avatar)).toBe(false);
    await userEvent.hover(zonaNeutra());
    expect(difuminado(avatar)).toBe(true);

    const boton = requerir(fila.querySelector<HTMLElement>('[role="button"]'));
    const ancla = document.createElement('button');
    boton.before(ancla);
    ancla.focus();
    await userEvent.keyboard('{Tab}');
    await expect.poll(() => difuminado(avatar)).toBe(false);
    ancla.focus();
    ancla.remove();
    await expect.poll(() => difuminado(avatar)).toBe(true);

    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    for (const columna of columnas()) await expect.poll(() => difuminado(columna)).toBe(false);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    for (const columna of columnas()) expect(difuminado(columna)).toBe(true);
  });

  it('al desactivar RF-02 restaura los avatares sin recargar y sin dejar estilos', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos', 'difuminarNombres'));
    wa.abrirNuevoChatObservado(CONTACTOS, { filaTu: 'predeterminado1' });
    await siguienteFotograma();
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    for (const avatar of [...fotos(), ...predeterminados()]) expect(difuminado(avatar)).toBe(false);
    expect(document.querySelector('style[data-veilix-estilo="fotos"]')).toBeNull();
    expect(panel().querySelectorAll('[data-veilix-fila-contacto-fotos]')).toHaveLength(0);
  });

  it('no cambia los avatares de la lista de chats ni del encabezado', () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    for (const foto of document.querySelectorAll('#pane-side img, #main header img')) expect(difuminado(foto)).toBe(true);
    expect(document.querySelector('[data-testid="new-chat-drawer"]')).toBeNull();
  });
});

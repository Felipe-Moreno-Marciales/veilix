/**
 * RF-02: avatares de participantes junto a los mensajes de un grupo
 * (`[data-testid="group-chat-profile-picture"]` en
 * `[data-testid="conversation-panel-messages"]`, estructura observada en
 * WhatsApp Web real), en Chromium, Firefox y WebKit de Playwright. La foto y
 * la inicial están observadas; la silueta, la posición del avatar y su foco
 * son suposiciones (ver `crearAvatarGrupo` en `tests/apoyo/whatsapp-simulado.ts`).
 * No demuestra compatibilidad con WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { montarWhatsAppConAvataresGrupo, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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

describe('RF-02: avatares de participantes en grupos (estructura observada)', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppConAvataresGrupo();
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  const avatares = () => [...wa.principal.querySelectorAll<HTMLElement>('[data-prueba="avatar-grupo"]')];
  const porTipo = (tipo: string) => requerir(wa.principal.querySelector(`[data-prueba="avatar-grupo-${tipo}"]`));
  const textos = () => [...wa.principal.querySelectorAll('[data-pre-plain-text], [data-prueba="multimedia"] img, video')];
  const controles = () => [
    ...wa.principal.querySelectorAll(
      '[data-id] button, [data-prueba="hora"], [data-testid="msg-meta"] svg, [data-prueba="reaccion"], [data-prueba="separador"], header svg, header button',
    ),
  ];
  const autores = () => [...wa.principal.querySelectorAll('[data-prueba="remitente"]')];

  it('difumina la foto, la inicial con su círculo y la silueta (supuesta) de los participantes', () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    expect(avatares()).toHaveLength(4);
    for (const avatar of avatares()) expect(difuminado(avatar)).toBe(true);
    for (const tipo of ['foto', 'inicial', 'circulo', 'silueta']) expect(difuminado(porTipo(tipo)), tipo).toBe(true);
  });

  it('aplica un único filtro por avatar: el contenedor, sin filtro propio en la foto, el círculo ni la inicial', () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    for (const avatar of avatares()) expect(filtrosPropios(avatar), avatar.outerHTML.slice(0, 80)).toEqual([avatar]);
    expect(getComputedStyle(porTipo('foto')).filter).toBe('none');
  });

  it('no difumina el panel de mensajes, los mensajes, la multimedia, las reacciones, los controles ni el editor', () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    expect(getComputedStyle(requerir(wa.principal.querySelector('[data-testid="conversation-panel-messages"]'))).filter).toBe('none');
    for (const fila of wa.principal.querySelectorAll('[data-id], [role="row"]')) expect(getComputedStyle(fila).filter).toBe('none');
    for (const elemento of [...textos(), ...controles(), ...autores()]) {
      expect(difuminado(elemento), elemento.outerHTML.slice(0, 60)).toBe(false);
    }
    expect(difuminado(wa.editor)).toBe(false);
  });

  it('es independiente de RF-01 y RF-04, y las tres juntas protegen cada una lo suyo', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesConversacion'));
    for (const avatar of avatares()) expect(difuminado(avatar)).toBe(false);
    for (const autor of autores()) expect(difuminado(autor)).toBe(true);

    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos', 'difuminarMensajesConversacion'));
    for (const avatar of avatares()) expect(filtrosPropios(avatar)).toEqual([avatar]);
    for (const autor of autores()) expect(difuminado(autor)).toBe(true);
    expect(difuminado(requerir(wa.principal.querySelector('[data-pre-plain-text]')))).toBe(true);
  });

  it('protege al instante los mensajes nuevos y los de otro grupo', () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Nuevo', remitente: 'Nora', autor: 'boton', avatarGrupo: 'inicial' });
    expect(difuminado(requerir(fila.querySelector('[data-testid="group-chat-profile-picture"]')))).toBe(true);

    wa.abrirConversacionObservada('Otro grupo', [
      { tipo: 'foto', direccion: 'entrante', remitente: 'Iván', autor: 'boton', avatarGrupo: 'foto', posicionAvatar: 'mensaje' },
      { tipo: 'texto', direccion: 'entrante', texto: 'Hola', remitente: 'Lía', avatarGrupo: 'inicial' },
    ]);
    expect(avatares()).toHaveLength(2);
    for (const avatar of avatares()) expect(difuminado(avatar)).toBe(true);
  });

  it('revela el avatar con el cursor y con el foco, y lo vuelve a difuminar', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    const avatar = requerir(avatares()[0]);
    await userEvent.hover(avatar);
    await expect.poll(() => difuminado(avatar)).toBe(false);
    await userEvent.hover(zonaNeutra());
    expect(difuminado(avatar)).toBe(true);

    const ancla = document.createElement('button');
    avatar.before(ancla);
    ancla.focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(avatar);
    await expect.poll(() => difuminado(avatar)).toBe(false);
    ancla.focus();
    ancla.remove();
    await expect.poll(() => difuminado(avatar)).toBe(true);
  });

  it('revela todos los avatares con el atajo y los vuelve a difuminar al soltarlo', async () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    for (const avatar of avatares()) await expect.poll(() => difuminado(avatar)).toBe(false);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    for (const avatar of avatares()) expect(difuminado(avatar)).toBe(true);
  });

  it('al desactivar RF-02 restaura los avatares sin recargar y sin dejar estilos', () => {
    gestor.aplicar(preferenciasCon('difuminarFotos', 'difuminarNombres'));
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    for (const avatar of avatares()) expect(difuminado(avatar)).toBe(false);
    expect(document.querySelector('style[data-veilix-estilo="fotos"]')).toBeNull();
  });

  it('conserva la protección de la lista de chats, del encabezado y de «Nuevo chat»', () => {
    gestor.aplicar(preferenciasCon('difuminarFotos'));
    for (const foto of document.querySelectorAll('#pane-side img, #main header img')) expect(difuminado(foto)).toBe(true);
    wa.abrirNuevoChatObservado(['Ana', 'Luis', 'Eva']);
    const columnas = [...document.querySelectorAll('[data-testid="new-chat-drawer"] [data-prueba="avatar-columna"]')];
    expect(columnas).toHaveLength(3);
    for (const columna of columnas) expect(filtrosPropios(columna)).toEqual([columna]);
  });
});

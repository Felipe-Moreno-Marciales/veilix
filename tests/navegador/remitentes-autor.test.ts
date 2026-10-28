/**
 * RF-01: autores de mensajes en grupos por su estructura confirmada
 * (`[data-testid="author"]`), en Chromium, Firefox y WebKit de Playwright.
 * Reproduce los casos del diagnóstico real de remitentes sobre 0.1.2-beta.0:
 * nombre visible distinto de `data-pre-plain-text` (participantes no
 * guardados), «~», emojis, símbolos, multimedia sin bloque de texto y autores
 * anidados. El orden del anidamiento es una suposición (ver `autor` en
 * `tests/apoyo/whatsapp-simulado.ts`). No demuestra compatibilidad con
 * WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { MENSAJES_AUTORES, montarWhatsAppConAutores, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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

/** Elementos del subárbol (incluido) con su propio `filter`: debe haber uno solo por nombre. */
function filtrosPropios(elemento: Element): number {
  return [elemento, ...elemento.querySelectorAll('*')].filter((e) => getComputedStyle(e).filter !== 'none').length;
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

describe('RF-01: autores por estructura ([data-testid="author"])', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppConAutores();
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  /** El elemento más externo de cada nombre (el `author` externo o el `span` supuesto). */
  const autores = () => [...wa.principal.querySelectorAll<HTMLElement>('[data-prueba="remitente"]')];
  const autorDe = (indice: number) => requerir(autores()[indice]);
  const textos = () => [...wa.principal.querySelectorAll('[data-pre-plain-text], [data-prueba="multimedia"] img, video')];
  const controles = () => [
    ...wa.principal.querySelectorAll('[data-id] button, [data-prueba="hora"], [data-testid="msg-meta"] svg, [data-prueba="separador"]'),
  ];

  it('difumina todos los autores: guardados, no guardados con nombre distinto del metadato, símbolos y multimedia sin texto', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    expect(autores()).toHaveLength(MENSAJES_AUTORES.filter((m) => m.remitente).length);
    for (const autor of autores()) expect(difuminado(autor), autor.textContent).toBe(true);
  });

  it('aplica un solo filtro por nombre, también en los autores anidados y en el marcado por texto', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    for (const autor of autores()) expect(filtrosPropios(autor), autor.outerHTML.slice(0, 80)).toBe(1);
    // El guardado coincide con su metadato: el marcador lo marca, pero la estructura ya lo cubre.
    const guardado = autorDe(0);
    expect(guardado.hasAttribute('data-veilix-remitente')).toBe(true);
    expect(getComputedStyle(guardado).filter).not.toBe('none');
    // Anidado y coincidente con su metadato: el marcador marca el interior; solo filtra el exterior.
    const interiorMarcado = requerir(autorDe(5).querySelector('[data-prueba="remitente-interior"]'));
    expect(interiorMarcado.hasAttribute('data-veilix-remitente')).toBe(true);
    for (const interior of wa.principal.querySelectorAll('[data-prueba="remitente-interior"]')) {
      expect(getComputedStyle(interior).filter).toBe('none');
      expect(difuminado(interior)).toBe(true);
    }
  });

  it('trata como texto un nombre con forma de etiqueta HTML', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    const conEtiqueta = autorDe(2);
    expect(conEtiqueta.textContent).toContain('<b>DJ</b>');
    expect(conEtiqueta.querySelector('b')).toBeNull();
    expect(difuminado(conEtiqueta)).toBe(true);
  });

  it('con RF-01 sola no difumina mensajes, multimedia, horas, botones ni indicadores', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    for (const elemento of [...textos(), ...controles()]) expect(difuminado(elemento), elemento.outerHTML.slice(0, 60)).toBe(false);
    expect(difuminado(wa.editor)).toBe(false);
  });

  it('RF-04 sola no difumina los autores; con las dos, cada una protege lo suyo', () => {
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    for (const autor of autores()) expect(difuminado(autor)).toBe(false);
    expect(difuminado(requerir(wa.principal.querySelector('[data-pre-plain-text]')))).toBe(true);

    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesConversacion'));
    for (const autor of autores()) expect(difuminado(autor)).toBe(true);
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    for (const autor of autores()) expect(difuminado(autor)).toBe(true);
    expect(difuminado(requerir(wa.principal.querySelector('[data-pre-plain-text]')))).toBe(false);
  });

  it('protege al instante los mensajes nuevos y los de otro grupo', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    const fila = wa.agregarMensajeObservado({ tipo: 'foto', direccion: 'entrante', remitente: '+57 300 0000009', remitenteVisible: '~ Nuevo 🎉', autor: 'boton' });
    expect(difuminado(requerir(fila.querySelector('[data-testid="author"]')))).toBe(true);

    wa.abrirConversacionObservada('Otro grupo', [
      { tipo: 'video', direccion: 'entrante', remitente: '+57 300 0000010', remitenteVisible: '~ Otro', autor: 'span' },
    ]);
    expect(difuminado(autorDe(0))).toBe(true);
  });

  it('revela el autor con su mensaje (cursor, foco y atajo) y lo vuelve a difuminar', async () => {
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    const autor = autorDe(1);
    const fila = requerir(autor.closest('[data-id]'));
    await userEvent.hover(fila);
    await expect.poll(() => difuminado(autor)).toBe(false);
    await userEvent.hover(zonaNeutra());
    expect(difuminado(autor)).toBe(true);

    const control = requerir(fila.querySelector<HTMLElement>('button'));
    const ancla = document.createElement('button');
    control.before(ancla);
    ancla.focus();
    await userEvent.keyboard('{Tab}');
    await expect.poll(() => difuminado(autor)).toBe(false);
    ancla.focus();
    ancla.remove();
    await expect.poll(() => difuminado(autor)).toBe(true);

    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    for (const a of autores()) await expect.poll(() => difuminado(a)).toBe(false);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    for (const a of autores()) expect(difuminado(a)).toBe(true);
  });

  it('el nombre con role="button" sigue recibiendo clics', async () => {
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    const autor = autorDe(1);
    let clics = 0;
    autor.addEventListener('click', () => clics++);
    await userEvent.click(autor);
    expect(clics).toBe(1);
  });

  it('al desactivar RF-01 restaura los autores sin recargar y sin dejar estilos ni marcas', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesConversacion'));
    gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
    for (const autor of autores()) expect(difuminado(autor)).toBe(false);
    expect(document.querySelector('style[data-veilix-estilo="nombres"]')).toBeNull();
    expect(wa.principal.querySelectorAll('[data-veilix-remitente]')).toHaveLength(0);
  });
});

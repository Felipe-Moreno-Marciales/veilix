/**
 * Etiquetas de miembro («Member Tags») junto al autor de los mensajes de un
 * grupo (RF-01), con la estructura confirmada en WhatsApp Web real sobre
 * 0.1.4-beta.0, y controles de forma parecida que no deben difuminarse. En
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
import { type MensajeObservado, montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const FILTRO_VEILIX = `blur(${DESENFOQUE})`;
const CINCO = ['difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarMensajesConversacion', 'difuminarCampoEntrada'] as const;

const MENSAJES: readonly MensajeObservado[] = [
  { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje secreto uno', remitente: 'Ana', autor: 'boton', etiquetaMiembro: 'El crack', avatarGrupo: 'foto' },
  // Mensaje consecutivo del mismo remitente: sin autor ni etiqueta.
  { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje secreto seguido' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje secreto dos', remitente: '+57 300 0000001', remitenteVisible: '~ Luis', autor: 'span', etiquetaMiembro: 'La jefa' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Mensaje sin etiqueta', remitente: 'Eva', autor: 'boton', reaccion: 'texto' },
  { tipo: 'texto', direccion: 'entrante', texto: 'Respuesta secreta', remitente: 'Sara', autor: 'boton', etiquetaMiembro: 'Admin del asado', citaConvencional: { encabezado: 'Marta', texto: 'Texto citado secreto', conAutor: true } },
  { tipo: 'texto', direccion: 'saliente', texto: 'Mi mensaje' },
];

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
    zona.style.cssText = 'position:fixed;right:0;top:0;width:40px;height:40px;z-index:2147483647';
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

/** Control de forma parecida a la etiqueta: `div[role="button"][tabindex="0"]` › `span`. */
function controlParecido(texto: string, prueba: string): HTMLElement {
  const control = document.createElement('div');
  control.setAttribute('role', 'button');
  control.setAttribute('tabindex', '0');
  control.setAttribute('data-prueba', `control-${prueba}`);
  const span = document.createElement('span');
  span.textContent = texto;
  span.setAttribute('data-prueba', prueba);
  control.append(span);
  return control;
}

describe('etiquetas de miembro en un grupo', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  /** Abre el grupo y añade controles de forma parecida en otras posiciones. */
  const abrirGrupo = (nombre: string, mensajes: readonly MensajeObservado[]) => {
    wa.abrirConversacionObservada(nombre, mensajes);
    const contenedores = [...document.querySelectorAll('#main [data-testid="msg-container"]')];
    // «Leer más» en la rama del cuerpo, que va justo después de la cabecera del autor.
    const primero = requerir(contenedores[0]);
    const cuerpo = requerir(primero.querySelector('[data-pre-plain-text]'));
    const rama = document.createElement('div');
    cuerpo.replaceWith(rama);
    rama.append(cuerpo, controlParecido('Leer más', 'leer-mas'));
    // Control parecido tras el cuerpo de un mensaje con autor y sin etiqueta.
    requerir(contenedores[3]?.querySelector('[data-pre-plain-text]')).after(controlParecido('👍 2', 'reaccion-parecida'));
  };

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppSimulado();
    abrirGrupo('Grupo de prueba', MENSAJES);
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
  const todos = (prueba: string) => [...document.querySelectorAll(`[data-prueba="${prueba}"]`)];
  const etiquetas = () => todos('etiqueta-miembro');
  const autores = () => [...document.querySelectorAll('#main [data-testid="msg-container"] > [data-prueba="cabecera-remitente"] [data-testid="author"]')];
  const cuerpos = () => [...document.querySelectorAll('#main [data-testid="msg-container"] [data-pre-plain-text]')];
  /** Lo que nunca debe difuminar RF-01: controles, cabeceras y controles de forma parecida. */
  const ajenos = () => [
    ...todos('control-etiqueta'),
    ...todos('cabecera-remitente'),
    ...todos('leer-mas'),
    ...todos('control-leer-mas'),
    ...todos('reaccion-parecida'),
    ...todos('control-reaccion-parecida'),
  ];
  const describir = (e: Element) => `${e.getAttribute('data-prueba') ?? e.getAttribute('data-testid') ?? e.localName}: ${e.textContent.slice(0, 30)}`;

  it('la página reproduce tres etiquetas tras el autor y dos controles de forma parecida', () => {
    expect(etiquetas()).toHaveLength(3);
    expect(autores()).toHaveLength(3);
    expect(todos('leer-mas')).toHaveLength(1);
    expect(todos('reaccion-parecida')).toHaveLength(1);
  });

  it('sin RF-01, las etiquetas se ven', async () => {
    await aplicar();
    for (const etiqueta of etiquetas()) expect(difuminado(etiqueta), describir(etiqueta)).toBe(false);
  });

  it('RF-01 difumina cada etiqueta con un único filtro, en el propio span, y el autor sigue con el suyo', async () => {
    await aplicar('difuminarNombres');
    for (const etiqueta of etiquetas()) {
      expect(getComputedStyle(etiqueta).filter, describir(etiqueta)).toBe(FILTRO_VEILIX);
      expect(filtrosVeilix(etiqueta), describir(etiqueta)).toBe(1);
    }
    for (const autor of autores()) expect(filtrosVeilix(autor), describir(autor)).toBe(1);
  });

  it('RF-01 no difumina el control de la etiqueta, la cabecera, «Leer más», la reacción parecida ni los cuerpos', async () => {
    await aplicar('difuminarNombres');
    for (const elemento of [...ajenos(), ...cuerpos()]) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('al desactivar RF-01, sin recargar, las etiquetas vuelven a verse', async () => {
    await aplicar('difuminarNombres');
    await aplicar();
    for (const etiqueta of etiquetas()) expect(difuminado(etiqueta), describir(etiqueta)).toBe(false);
  });

  it('RF-02 y RF-04 no difuminan las etiquetas, y RF-01 no cambia lo que difuminan ellos', async () => {
    await aplicar('difuminarFotos', 'difuminarMensajesConversacion');
    for (const etiqueta of etiquetas()) expect(difuminado(etiqueta), describir(etiqueta)).toBe(false);
    for (const cuerpo of cuerpos()) expect(filtrosVeilix(cuerpo), describir(cuerpo)).toBe(1);
    const avatar = requerir(document.querySelector('#main [data-testid="group-chat-profile-picture"]'));
    expect(filtrosVeilix(avatar)).toBe(1);
    await aplicar('difuminarNombres', 'difuminarFotos', 'difuminarMensajesConversacion');
    for (const cuerpo of cuerpos()) expect(filtrosVeilix(cuerpo), describir(cuerpo)).toBe(1);
    expect(filtrosVeilix(avatar)).toBe(1);
  });

  /** Controles ajenos que ningún interruptor difumina (la reacción parecida la difumina RF-04 a propósito). */
  const ajenosSinReaccion = () => ajenos().filter((e) => !e.matches('[data-prueba$="reaccion-parecida"]'));

  it('con los cinco activos, cada etiqueta, autor y cuerpo tiene un único filtro, y los controles ajenos ninguno', async () => {
    await aplicar(...CINCO);
    for (const elemento of [...etiquetas(), ...autores(), ...cuerpos()]) expect(filtrosVeilix(elemento), describir(elemento)).toBe(1);
    for (const elemento of ajenosSinReaccion()) expect(difuminado(elemento), describir(elemento)).toBe(false);
  });

  it('la reacción de forma parecida solo la difumina RF-04, como reacción, con un único filtro', async () => {
    const reaccion = requerir(todos('reaccion-parecida')[0]);
    await aplicar('difuminarNombres');
    expect(difuminado(reaccion)).toBe(false);
    await aplicar(...CINCO);
    expect(filtrosVeilix(reaccion)).toBe(1);
    expect(reaccion.closest('[data-veilix-reaccion]')).not.toBeNull();
  });

  it('el cursor sobre el mensaje revela su etiqueta y su autor, no los de otros mensajes, y al salir se difuminan', async () => {
    await aplicar(...CINCO);
    const [primera, segunda] = [requerir(etiquetas()[0]), requerir(etiquetas()[1])];
    await userEvent.hover(requerir(primera.closest('[data-testid="msg-container"]')));
    await expect.poll(() => difuminado(primera)).toBe(false);
    expect(difuminado(requerir(autores()[0]))).toBe(false);
    expect(difuminado(segunda)).toBe(true);
    await userEvent.hover(zonaNeutra());
    await expect.poll(() => etiquetas().every(difuminado)).toBe(true);
  });

  it('el atajo revela todas las etiquetas y las vuelve a difuminar al soltarlo', async () => {
    await aplicar(...CINCO);
    await userEvent.keyboard('{Control>}{Shift>}[Space>]');
    await expect.poll(() => etiquetas().some(difuminado)).toBe(false);
    await userEvent.keyboard('[/Space]{/Shift}{/Control}');
    await expect.poll(() => etiquetas().every(difuminado)).toBe(true);
  });

  it('el foco del teclado en el control de la etiqueta la revela, y el control sigue recibiendo clics', async () => {
    await aplicar('difuminarNombres');
    const control = requerir(todos('control-etiqueta')[0]);
    const etiqueta = requerir(control.querySelector('[data-prueba="etiqueta-miembro"]'));
    let clics = 0;
    control.addEventListener('click', () => {
      clics++;
    });
    const ancla = document.createElement('button');
    control.before(ancla);
    ancla.focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(control);
    await expect.poll(() => difuminado(etiqueta)).toBe(false);
    ancla.focus();
    ancla.remove();
    await expect.poll(() => difuminado(etiqueta)).toBe(true);
    await userEvent.click(control);
    expect(clics).toBe(1);
  });

  it('protege las etiquetas de los mensajes que llegan después', async () => {
    await aplicar(...CINCO);
    wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Nuevo secreto', remitente: 'Bruno', autor: 'boton', etiquetaMiembro: 'Recién llegado' });
    await siguienteFotograma();
    const nueva = requerir(etiquetas().at(-1));
    expect(nueva.textContent).toBe('Recién llegado');
    expect(filtrosVeilix(nueva)).toBe(1);
  });

  it('al cambiar de grupo, las etiquetas del nuevo se protegen sin marcas heredadas', async () => {
    await aplicar(...CINCO);
    abrirGrupo('Otro grupo', MENSAJES.map((m) => (m.etiquetaMiembro ? { ...m, etiquetaMiembro: `${m.etiquetaMiembro} 2` } : m)));
    await siguienteFotograma();
    for (const etiqueta of etiquetas()) expect(filtrosVeilix(etiqueta), describir(etiqueta)).toBe(1);
    for (const elemento of ajenosSinReaccion()) expect(difuminado(elemento), describir(elemento)).toBe(false);
    expect(etiquetas().some((e) => e.getAttributeNames().some((a) => a.startsWith('data-veilix-')))).toBe(false);
  });

  it('la cita del mensaje y su autor siguen protegidos como antes', async () => {
    await aplicar(...CINCO);
    const cita = requerir(document.querySelector('#main [data-testid="quoted-message"]'));
    for (const elemento of cita.querySelectorAll('[data-testid="author"], [data-testid="selectable-text"]')) expect(difuminado(elemento), describir(elemento)).toBe(true);
  });

  it('al desactivar los cinco se restaura todo, sin estilos ni marcas', async () => {
    await aplicar(...CINCO);
    await aplicar();
    for (const elemento of [...etiquetas(), ...autores(), ...cuerpos()]) expect(difuminado(elemento)).toBe(false);
    expect(document.querySelectorAll('style[data-veilix-estilo]')).toHaveLength(0);
    expect([...document.querySelectorAll('*')].filter((e) => e.getAttributeNames().some((a) => a.startsWith('data-veilix-')))).toEqual([]);
  });
});

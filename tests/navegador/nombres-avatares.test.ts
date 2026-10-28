/**
 * RF-01 y RF-02 fuera de la lista de chats: remitentes en conversaciones de
 * grupo y panel «Nuevo chat», en Chromium, Firefox y WebKit de Playwright.
 * Las estructuras del DOM simulado son suposiciones (ver
 * `tests/apoyo/whatsapp-simulado.ts`). No demuestra compatibilidad con
 * WhatsApp Web real.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { CONTACTOS_NUEVO_CHAT, montarWhatsAppConGrupo, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

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

const TODAS_MENOS_RF04: IdFuncionalidad[] = [
  'difuminarNombres',
  'difuminarFotos',
  'difuminarMensajesRecientes',
  'difuminarCampoEntrada',
];

describe('RF-01 y RF-02 fuera de la lista de chats', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;

  beforeEach(async () => {
    window.scrollTo(0, 0);
    wa = montarWhatsAppConGrupo();
    contexto = new AbortController();
    gestor = new GestorModulos({ modulos: MODULOS_FUNCIONALIDADES, documento: document, senal: contexto.signal });
    await userEvent.hover(zonaNeutra());
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  const remitentes = () => [...wa.principal.querySelectorAll('[data-prueba="remitente"]')];
  const nombresEnConversacion = () => [
    ...wa.principal.querySelectorAll('[data-prueba="remitente"], [data-prueba="autor-cita"], [data-prueba="autor-fijado"]'),
  ];
  const textosMensaje = () => [...wa.principal.querySelectorAll('.selectable-text span')];

  describe('remitentes en conversaciones de grupo', () => {
    it('RF-01 difumina los nombres de los remitentes con RF-04 desactivada', () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      expect(remitentes()).toHaveLength(3);
      for (const nombre of remitentes()) expect(difuminado(nombre), nombre.textContent).toBe(true);
    });

    it('cubre contactos no guardados («~ Nombre»), nombres con emoji, autores de citas y el aviso fijado', () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      for (const nombre of nombresEnConversacion()) expect(difuminado(nombre), nombre.outerHTML.slice(0, 80)).toBe(true);
    });

    it('con RF-01 sola no difumina el texto de los mensajes, la hora ni los botones', () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      const visibles = [
        ...textosMensaje(),
        ...wa.principal.querySelectorAll('[data-prueba="hora"], [role="application"] button, [data-prueba="separador"]'),
      ];
      for (const elemento of visibles) expect(difuminado(elemento), elemento.outerHTML.slice(0, 60)).toBe(false);
      expect(difuminado(wa.editor)).toBe(false);
    });

    it('con todas las demás funciones activas y RF-04 desactivada, los nombres siguen protegidos y el texto visible', () => {
      gestor.aplicar(preferenciasCon(...TODAS_MENOS_RF04));
      for (const nombre of nombresEnConversacion()) expect(difuminado(nombre)).toBe(true);
      for (const texto of textosMensaje()) expect(difuminado(texto)).toBe(false);
    });

    it('marca antes del siguiente fotograma los nombres de mensajes nuevos y de otra conversación', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Hola', remitente: 'Marta' });
      await siguienteFotograma();
      expect(difuminado(requerir(fila.querySelector('[data-prueba="remitente"]')))).toBe(true);

      wa.abrirConversacionObservada('Otro grupo', [{ tipo: 'texto', direccion: 'entrante', texto: 'x', remitente: 'Pablo' }]);
      await siguienteFotograma();
      expect(difuminado(requerir(wa.principal.querySelector('[data-prueba="remitente"]')))).toBe(true);
    });

    it('revela el nombre con el mensaje (cursor, foco y atajo) y restaura al terminar', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      const nombre = requerir(remitentes()[0]);
      const fila = requerir(nombre.closest('[data-id]'));
      await userEvent.hover(fila);
      await expect.poll(() => difuminado(nombre)).toBe(false);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(nombre)).toBe(true);

      const control = requerir(fila.querySelector<HTMLElement>('button'));
      const ancla = document.createElement('button');
      control.before(ancla);
      ancla.focus();
      await userEvent.keyboard('{Tab}');
      await expect.poll(() => difuminado(nombre)).toBe(false);
      ancla.focus();
      ancla.remove();
      await expect.poll(() => difuminado(nombre)).toBe(true);

      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      for (const n of nombresEnConversacion()) await expect.poll(() => difuminado(n)).toBe(false);
      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      for (const n of nombresEnConversacion()) expect(difuminado(n)).toBe(true);
    });

    it('al desactivar RF-01 restaura los nombres y quita las marcas sin afectar a RF-04', () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesConversacion'));
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      for (const nombre of nombresEnConversacion()) expect(difuminado(nombre)).toBe(false);
      expect(document.querySelectorAll('[data-veilix-remitente]')).toHaveLength(0);
      for (const texto of textosMensaje()) expect(difuminado(texto)).toBe(true);
    });
  });

  describe('«Nuevo chat»', () => {
    const nombresNuevoChat = () => [...document.querySelectorAll('[data-prueba="nombre-nuevo-chat"]')];
    const avataresNuevoChat = () => [...document.querySelectorAll('[data-prueba="avatar-nuevo-chat"]')];
    const funcionales = () => [
      ...document.querySelectorAll(
        '[data-prueba="accion"], [data-prueba="accion"] svg, [data-prueba="seccion"], [data-prueba="buscador"], [data-prueba="nuevo-chat"] header, [data-prueba="info-nuevo-chat"]',
      ),
    ];

    it('RF-01 difumina los nombres al abrir el panel, sin recargar', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      wa.abrirNuevoChat(CONTACTOS_NUEVO_CHAT);
      await siguienteFotograma();
      expect(nombresNuevoChat()).toHaveLength(3);
      for (const nombre of nombresNuevoChat()) expect(difuminado(nombre)).toBe(true);
      for (const avatar of avataresNuevoChat()) expect(difuminado(avatar)).toBe(false);
    });

    it('RF-02 difumina fotos y avatares predeterminados (SVG con <image> y con <foreignObject>)', async () => {
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      wa.abrirNuevoChat(CONTACTOS_NUEVO_CHAT);
      await siguienteFotograma();
      const avatares = avataresNuevoChat();
      expect(avatares.filter((a) => a.querySelector('image'))).toHaveLength(1);
      expect(avatares.filter((a) => a.querySelector('foreignObject'))).toHaveLength(2);
      for (const avatar of avatares) expect(difuminado(avatar)).toBe(true);
      for (const nombre of nombresNuevoChat()) expect(difuminado(nombre)).toBe(false);
    });

    it('no difumina acciones, iconos, encabezados de sección, buscador ni la información del contacto', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos'));
      wa.abrirNuevoChat(CONTACTOS_NUEVO_CHAT);
      await siguienteFotograma();
      for (const elemento of funcionales()) expect(difuminado(elemento), elemento.outerHTML.slice(0, 70)).toBe(false);
    });

    it('mantiene la protección al cerrar y volver a abrir, buscar, desplazarse y cargar fotos', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos'));
      wa.abrirNuevoChat(CONTACTOS_NUEVO_CHAT);
      await siguienteFotograma();
      wa.cerrarNuevoChat();
      wa.abrirNuevoChat(CONTACTOS_NUEVO_CHAT);
      await siguienteFotograma();
      wa.buscarEnNuevoChat([{ nombre: 'Resultado', avatar: 'svgForeignObject' }, { nombre: 'Otro', avatar: 'svgImagen' }]);
      await siguienteFotograma();
      wa.reutilizarFilaNuevoChat(0, { nombre: 'Reutilizada', avatar: 'svgImagen' });
      wa.cargarFotoNuevoChat(1);
      await siguienteFotograma();
      expect(nombresNuevoChat().map((n) => n.textContent)).toEqual(['Reutilizada', 'Otro']);
      for (const nombre of nombresNuevoChat()) expect(difuminado(nombre)).toBe(true);
      for (const avatar of avataresNuevoChat()) expect(difuminado(avatar)).toBe(true);
    });

    it('difumina los nombres de filas añadidas como nodos independientes después de abrir el panel (regresión 0.1.1-beta.0)', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos'));
      wa.abrirNuevoChat([]);
      await siguienteFotograma();
      const filas = wa.agregarFilasNuevoChat([
        { nombre: 'Ana García', avatar: 'svgImagen', sinBotonInterior: true },
        { nombre: 'Banco', avatar: 'svgForeignObject', sinBotonInterior: true },
      ]);
      await siguienteFotograma();
      for (const fila of filas) {
        expect(difuminado(requerir(fila.querySelector('[data-prueba="nombre-nuevo-chat"]')))).toBe(true);
        expect(fila.hasAttribute('data-veilix-fila-contacto')).toBe(true);
        expect(fila.hasAttribute('data-veilix-fila-contacto-fotos')).toBe(true);
      }

      // Búsqueda y desplazamiento con filas de esta estructura.
      wa.buscarEnNuevoChat([{ nombre: 'Resultado', avatar: 'svgForeignObject', sinBotonInterior: true }]);
      await siguienteFotograma();
      wa.reutilizarFilaNuevoChat(0, { nombre: 'Reutilizada', avatar: 'svgImagen', sinBotonInterior: true });
      await siguienteFotograma();
      expect(nombresNuevoChat().map((n) => n.textContent)).toEqual(['Reutilizada']);
      for (const nombre of nombresNuevoChat()) expect(difuminado(nombre)).toBe(true);

      // Revelado con la fila y restauración.
      const fila = requerir(wa.filasNuevoChat[0]);
      await userEvent.hover(fila);
      await expect.poll(() => difuminado(requerir(nombresNuevoChat()[0]))).toBe(false);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(requerir(nombresNuevoChat()[0]))).toBe(true);
    });

    it('revela nombre y avatar con el cursor sobre la fila y con el atajo, y restaura al terminar', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos'));
      wa.abrirNuevoChat(CONTACTOS_NUEVO_CHAT);
      await siguienteFotograma();
      const fila = requerir(wa.filasNuevoChat[1]);
      const nombre = requerir(fila.querySelector('[data-prueba="nombre-nuevo-chat"]'));
      const avatar = requerir(fila.querySelector('[data-prueba="avatar-nuevo-chat"]'));
      await userEvent.hover(fila);
      await expect.poll(() => difuminado(nombre)).toBe(false);
      await expect.poll(() => difuminado(avatar)).toBe(false);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(nombre)).toBe(true);
      expect(difuminado(avatar)).toBe(true);

      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      await expect.poll(() => difuminado(nombre)).toBe(false);
      await expect.poll(() => difuminado(avatar)).toBe(false);
      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      expect(difuminado(nombre)).toBe(true);
    });

    it('RF-01 y RF-02 se activan y desactivan de forma independiente', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos'));
      wa.abrirNuevoChat(CONTACTOS_NUEVO_CHAT);
      await siguienteFotograma();
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      for (const nombre of nombresNuevoChat()) expect(difuminado(nombre)).toBe(false);
      for (const avatar of avataresNuevoChat()) expect(difuminado(avatar)).toBe(true);
      expect(document.querySelectorAll('[data-veilix-nombre-contacto], [data-veilix-fila-contacto]')).toHaveLength(0);

      gestor.aplicar(preferenciasCon('difuminarNombres'));
      await siguienteFotograma();
      for (const nombre of nombresNuevoChat()) expect(difuminado(nombre)).toBe(true);
      for (const avatar of avataresNuevoChat()) expect(difuminado(avatar)).toBe(false);
      expect(document.querySelectorAll('[data-veilix-fila-contacto-fotos]')).toHaveLength(0);
    });
  });

  describe('«Nuevo chat» con la estructura observada en WhatsApp Web real (regresión 0.1.1-beta.1)', () => {
    const CONTACTOS = Array.from({ length: 18 }, (_, i) => `Contacto ${String(i + 1)}`);
    const nombres = () => [...document.querySelectorAll('[data-prueba="nombre-observado"]')];
    const infos = () => [...document.querySelectorAll('[data-prueba="info-observada"]')];
    const noProtegidos = () => [
      ...document.querySelectorAll(
        '[data-prueba="accion-observada"] span, [data-prueba="encabezado-nuevo-chat"] span, [data-prueba="buscador-observado"], [data-prueba="seccion-observada"], [data-prueba="icono-accion"], [data-prueba="icono-accion"] *, [data-prueba="funcional-observado"], [data-prueba="funcional-observado"] *',
      ),
    ];

    it('RF-01 difumina los 18 nombres al abrir el panel, sin avatares SVG en las filas', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      wa.abrirNuevoChatObservado(CONTACTOS);
      await siguienteFotograma();
      expect(nombres()).toHaveLength(18);
      // Como en el DOM real: ningún avatar SVG (`<svg>` con `<mask>`) en las filas.
      expect(document.querySelectorAll('[data-testid="new-chat-drawer"] svg:has(mask)')).toHaveLength(0);
      for (const nombre of nombres()) expect(difuminado(nombre), nombre.textContent).toBe(true);
    });

    it('difumina la información secundaria en todas sus formas (con title, sin atributos, en otra celda, con emoji)', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      wa.abrirNuevoChatObservado(CONTACTOS);
      await siguienteFotograma();
      // 18 contactos con 4 formas que se alternan; la cuarta es «sin información».
      expect(infos().length).toBeGreaterThanOrEqual(13);
      for (const info of infos()) expect(difuminado(info), info.outerHTML.slice(0, 80)).toBe(true);
      const conEmoji = requerir(infos().find((i) => i.querySelector('img')));
      expect(difuminado(requerir(conEmoji.querySelector('img')))).toBe(true);
    });

    it('no difumina las acciones (nuevo grupo, contacto y comunidad), las secciones, el encabezado, el buscador, iconos ni botones', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos'));
      wa.abrirNuevoChatObservado(CONTACTOS);
      await siguienteFotograma();
      expect(document.querySelectorAll('[data-prueba="accion-observada"]')).toHaveLength(3);
      for (const elemento of noProtegidos()) expect(difuminado(elemento), elemento.outerHTML.slice(0, 80)).toBe(false);
      for (const accion of document.querySelectorAll('[data-testid^="new-chat-drawer-new-"]')) {
        expect(accion.closest('[data-veilix-fila-nuevo-chat]')).toBeNull();
      }
    });

    it('cubre la carga dinámica, la búsqueda, el desplazamiento y volver a abrir', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      wa.abrirNuevoChatObservado([]);
      await siguienteFotograma();
      wa.agregarContactosObservados(['Llega después 1', 'Llega después 2', 'Llega después 3']);
      await siguienteFotograma();
      for (const nombre of nombres()) expect(difuminado(nombre)).toBe(true);
      for (const info of infos()) expect(difuminado(info)).toBe(true);

      wa.buscarContactosObservados(['Resultado A', 'Resultado B']);
      await siguienteFotograma();
      wa.reutilizarFilaObservada(0, 'Reutilizada');
      await siguienteFotograma();
      expect(nombres().map((n) => n.textContent)).toEqual(['Reutilizada', 'Resultado B']);
      for (const nombre of nombres()) expect(difuminado(nombre)).toBe(true);
      for (const info of infos()) expect(difuminado(info)).toBe(true);

      wa.cerrarNuevoChatObservado();
      wa.abrirNuevoChatObservado(CONTACTOS.slice(0, 3));
      await siguienteFotograma();
      for (const nombre of nombres()) expect(difuminado(nombre)).toBe(true);
    });

    it('revela con el cursor, el foco de teclado y el atajo, y restaura al terminar', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      wa.abrirNuevoChatObservado(CONTACTOS.slice(0, 3));
      await siguienteFotograma();
      const fila = requerir(wa.filasObservadas[1]);
      const nombre = requerir(fila.querySelector('[data-prueba="nombre-observado"]'));
      const info = requerir(fila.querySelector('[data-prueba="info-observada"]'));
      await userEvent.hover(fila);
      await expect.poll(() => difuminado(nombre)).toBe(false);
      await expect.poll(() => difuminado(info)).toBe(false);
      expect(difuminado(requerir(wa.filasObservadas[0]?.querySelector('[data-prueba="info-observada"]')))).toBe(true);
      await userEvent.hover(zonaNeutra());
      expect(difuminado(nombre)).toBe(true);
      expect(difuminado(info)).toBe(true);

      // El último elemento enfocable de la fila anterior es su botón «Más»; el siguiente Tab llega a esta fila.
      requerir(wa.filasObservadas[0]?.querySelector<HTMLElement>('button')).focus();
      await userEvent.keyboard('{Tab}');
      await expect.poll(() => difuminado(nombre)).toBe(false);

      await userEvent.keyboard('{Control>}{Shift>}[Space>]');
      for (const n of nombres()) await expect.poll(() => difuminado(n)).toBe(false);
      await userEvent.keyboard('[/Space]{/Shift}{/Control}');
      (document.activeElement as HTMLElement | null)?.blur();
      for (const n of nombres()) await expect.poll(() => difuminado(n)).toBe(true);
    });

    it('al desactivar RF-01 restaura los nombres y quita sus marcas; RF-02 no marca estas filas', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos'));
      wa.abrirNuevoChatObservado(CONTACTOS.slice(0, 5));
      await siguienteFotograma();
      gestor.aplicar(preferenciasCon('difuminarFotos'));
      for (const nombre of nombres()) expect(difuminado(nombre)).toBe(false);
      for (const info of infos()) expect(difuminado(info)).toBe(false);
      expect(document.querySelectorAll('[data-veilix-fila-nuevo-chat], [data-veilix-nombre-nuevo-chat], [data-veilix-info-nuevo-chat]')).toHaveLength(0);
      expect(document.querySelectorAll('[data-veilix-fila-contacto-fotos]')).toHaveLength(0);
    });
  });

  describe('interacción entre los marcadores de «Nuevo chat» y de remitentes', () => {
    const nombresGrupo = () => [...wa.principal.querySelectorAll('[data-prueba="remitente"], [data-prueba="autor-cita"]')];

    it('los remitentes siguen protegidos tras abrir y cerrar «Nuevo chat» y abrir otro grupo', async () => {
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      wa.abrirNuevoChatObservado(['Ana', 'Luis']);
      await siguienteFotograma();
      wa.cerrarNuevoChatObservado();
      wa.abrirConversacionObservada('Grupo nuevo', [
        { tipo: 'texto', direccion: 'entrante', texto: 'Hola', remitente: 'Ana' },
        { tipo: 'texto', direccion: 'entrante', texto: 'Qué tal', remitente: 'Luis', cita: { autor: 'Ana', texto: 'Hola' } },
      ]);
      await siguienteFotograma();
      expect(nombresGrupo()).toHaveLength(3);
      for (const nombre of nombresGrupo()) expect(difuminado(nombre)).toBe(true);
    });

    it('con «Nuevo chat» abierto al activar RF-01, los remitentes del grupo también se protegen', async () => {
      wa.abrirNuevoChatObservado(['Ana', 'Luis']);
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      await siguienteFotograma();
      for (const nombre of nombresGrupo()) expect(difuminado(nombre)).toBe(true);
      const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Nuevo', remitente: 'Marta' });
      await siguienteFotograma();
      expect(difuminado(requerir(fila.querySelector('[data-prueba="remitente"]')))).toBe(true);
    });

    it('con RF-01 y RF-04 activadas y desactivadas en distinto orden, los remitentes dependen solo de RF-01', async () => {
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion'));
      gestor.aplicar(preferenciasCon('difuminarMensajesConversacion', 'difuminarNombres'));
      gestor.aplicar(preferenciasCon('difuminarNombres'));
      wa.abrirNuevoChatObservado(['Ana']);
      const fila = wa.agregarMensajeObservado({ tipo: 'texto', direccion: 'entrante', texto: 'Otro', remitente: 'Pablo' });
      await siguienteFotograma();
      for (const nombre of [...nombresGrupo(), requerir(fila.querySelector('[data-prueba="remitente"]'))]) {
        expect(difuminado(nombre)).toBe(true);
      }
      for (const texto of textosMensaje()) expect(difuminado(texto)).toBe(false);
    });
  });

  it('no afecta a la lista de chats ni a RF-03, RF-04 y RF-05 (sin efectos secundarios)', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarFotos'));
    for (const fila of wa.filas) {
      expect(difuminado(requerir(fila.querySelector('span[dir="auto"]')))).toBe(true);
      expect(difuminado(requerir(fila.querySelector('span[title]:not([dir]) > span')))).toBe(false);
    }
    expect(difuminado(wa.editor)).toBe(false);
    for (const texto of textosMensaje()) expect(difuminado(texto)).toBe(false);
    expect(document.querySelectorAll('[data-veilix-vista-previa], [data-veilix-hora-mensaje], [data-veilix-reaccion]')).toHaveLength(0);
  });
});

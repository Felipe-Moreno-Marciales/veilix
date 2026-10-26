/**
 * Verificación de extremo a extremo de la extensión compilada en Chromium.
 *
 * Uso: npm run build:chrome && npm run test:extension
 *
 * - Carga `.output/chrome-mv3` en Chromium (Playwright).
 * - Bloquea TODA la red. `https://web.whatsapp.com/` se sirve con una página
 *   simulada local: no se realiza ninguna petición a WhatsApp ni a terceros.
 * - Activa funcionalidades desde el panel real y comprueba el difuminado.
 * - Comprueba los iconos del paquete y el pie del panel (crédito con la
 *   bandera SVG, sin desbordamiento horizontal) en el emergente y en la
 *   página de opciones.
 * - Guarda capturas del panel en `.output/capturas/` para revisión visual.
 *
 * La página simulada reproduce la estructura supuesta en
 * `src/nucleo/difuminado/selectores.ts`; no demuestra compatibilidad con
 * WhatsApp Web real.
 */
/* global document, getComputedStyle -- usados en funciones que Playwright evalúa dentro de la página */
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const EXTENSION = resolve('.output/chrome-mv3');
const CAPTURAS = resolve('.output/capturas');
const URL_WHATSAPP = 'https://web.whatsapp.com/';

const PAGINA_SIMULADA = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>WhatsApp (simulado)</title>
<style>body{font:14px system-ui;margin:0}#app{display:flex}#side{width:300px}#main{flex:1}
[role=listitem]{padding:8px;border-bottom:1px solid #ddd}img{width:40px;height:40px;background:#888}</style>
</head><body><div id="app"></div>
<script>
  // Simula el renderizado diferido de una aplicación de página única.
  setTimeout(() => {
    const app = document.getElementById('app');
    const el = (t, a = {}, ...h) => { const e = document.createElement(t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); e.append(...h); return e; };
    // Icono con su nombre en <title>, como en WhatsApp Web real.
    const icono = (nombre) => { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('width', '16'); svg.setAttribute('height', '16'); const t = document.createElementNS('http://www.w3.org/2000/svg', 'title'); t.textContent = nombre; svg.append(t); return svg; };
    const fila = (n, p) => el('div', { role: 'listitem' }, el('div', { role: 'button', tabindex: '0' },
      el('img', { alt: '' }), el('div', {}, el('div', {}, el('span', { dir: 'auto', title: n }, n), el('div', {}, '10:45')),
      el('div', {}, el('span', { 'aria-label': ' Leído ' }, icono('wds-ic-read')), el('span', { title: p }, el('span', { dir: 'ltr' }, p)), icono('wds-ic-sticker'), el('span', { 'data-icon': 'muted' })))));
    app.append(
      el('div', { id: 'side' }, el('div', { id: 'pane-side' }, el('div', { role: 'grid' }, fila('Ana García', 'Secreto 1'), fila('Banco', 'Código 123456')))),
      el('div', { id: 'main' },
        el('header', {}, el('img', { alt: '' }), el('span', { dir: 'auto', title: 'Ana García' }, 'Ana García')),
        el('div', { role: 'application' }, el('div', { role: 'row' }, el('div', { 'data-id': 'false_prueba' }, el('div', { 'data-testid': 'msg-container' },
          el('div', { class: 'copyable-text', 'data-pre-plain-text': '[10:40, 15/10/2026] Ana: ' }, el('span', { class: 'selectable-text copyable-text', dir: 'ltr' }, el('span', {}, 'Mensaje privado'))),
          el('div', { 'data-testid': 'msg-meta' }, el('span', { 'data-prueba': 'hora' }, '10:40'), el('span', { 'aria-label': ' Leído ' }, icono('wds-ic-read'))),
          el('button', { 'data-prueba': 'reaccion', type: 'button' }, '👍 1'))))),
        el('footer', {},
          // Recuadro «Responder» con la estructura observada en WhatsApp Web real (la posición de la X es supuesta).
          el('div', { 'data-testid': 'popup_panel' },
            el('div', { 'data-testid': 'quoted-message' },
              el('span', { 'data-testid': 'author' }, 'Ana García'),
              el('span', { class: 'quoted-mention selectable-text copyable-text', 'data-testid': 'selectable-text' }, 'Texto citado secreto')),
            el('button', { 'aria-label': 'Cancelar respuesta' }, icono('wds-ic-close'))),
          el('div', { contenteditable: 'true', role: 'textbox', 'aria-label': 'Escribe un mensaje' }, el('p', {}, el('br'))))));
  }, 300);
</script></body></html>`;

const VERSION = JSON.parse(readFileSync('package.json', 'utf8')).version;
const MANIFIESTO = JSON.parse(readFileSync(join(EXTENSION, 'manifest.json'), 'utf8'));

let fallos = 0;
function comprobar(condicion, descripcion) {
  console.log(`${condicion ? '✔' : '✘'} ${descripcion}`);
  if (!condicion) fallos++;
}

const perfil = mkdtempSync(join(tmpdir(), 'veilix-e2e-'));
const contexto = await chromium.launchPersistentContext(perfil, {
  channel: 'chromium',
  headless: true,
  args: [`--disable-extensions-except=${EXTENSION}`, `--load-extension=${EXTENSION}`],
});

try {
  const peticionesExternas = [];
  await contexto.route('**/*', (ruta) => {
    const url = ruta.request().url();
    if (url === URL_WHATSAPP) {
      return ruta.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: PAGINA_SIMULADA });
    }
    if (url.startsWith('chrome-extension://') || url.startsWith('data:')) return ruta.continue();
    peticionesExternas.push(url);
    return ruta.abort();
  });

  // Identificador de la extensión desde chrome://extensions.
  const gestion = await contexto.newPage();
  await gestion.goto('chrome://extensions');
  const idExtension = await gestion.locator('extensions-item').first().getAttribute('id');
  comprobar(Boolean(idExtension), `extensión cargada (${idExtension})`);
  await gestion.close();

  const whatsapp = await contexto.newPage();
  await whatsapp.goto(URL_WHATSAPP);
  const filtro = (selector) =>
    whatsapp.$eval(selector, (e) => {
      for (let a = e; a; a = a.parentElement) if (getComputedStyle(a).filter !== 'none') return 'blur';
      return 'none';
    });

  await whatsapp.waitForSelector('#pane-side span[title="Ana García"]');
  comprobar((await filtro('#pane-side span[title="Ana García"]')) === 'none', 'sin preferencias, nada se difumina');

  // Activar desde el panel real.
  const panel = await contexto.newPage();
  await panel.setViewportSize({ width: 380, height: 760 });
  await panel.goto(`chrome-extension://${idExtension}/popup.html`);
  for (const nombre of [
    'Difuminar nombres de contactos',
    'Difuminar fotografías de contactos',
    'Difuminar mensajes recientes',
    'Difuminar mensajes de conversaciones',
    'Difuminar el campo de entrada',
  ]) {
    const interruptor = panel.getByRole('switch', { name: nombre });
    await interruptor.click();
    await panel.waitForFunction(
      (n) => [...document.querySelectorAll('[role=switch]')].some(
        (s) => s.getAttribute('aria-labelledby') && document.getElementById(s.getAttribute('aria-labelledby'))?.textContent === n && s.getAttribute('aria-checked') === 'true',
      ),
      nombre,
    );
  }
  comprobar((await panel.getByRole('switch').count()) === 5, 'el panel muestra exactamente 5 interruptores');
  const esEstable = !VERSION.includes('-');
  comprobar(
    esEstable
      ? MANIFIESTO.version === VERSION && MANIFIESTO.version_name === undefined
      : MANIFIESTO.version_name === VERSION && /^\d+\.\d+\.\d+\.\d+$/.test(MANIFIESTO.version),
    `manifiesto: version ${MANIFIESTO.version}, version_name ${MANIFIESTO.version_name ?? '—'} (package.json: ${VERSION})`,
  );
  comprobar(
    (await panel.getByText(new RegExp(`^Veilix ${VERSION.replaceAll('.', '\\.')}( \\(|$)`)).count()) === 1,
    `el panel muestra «Veilix ${VERSION}»`,
  );
  comprobar((await panel.getByText('Pendiente', { exact: true }).count()) === 4, 'el panel muestra 4 funcionalidades pendientes');

  const iconos = Object.entries(MANIFIESTO.icons ?? {});
  comprobar(
    iconos.length === 5 &&
      iconos.every(([tamano, ruta]) => readFileSync(join(EXTENSION, ruta)).equals(readFileSync(resolve('public/icon', `${tamano}.png`)))),
    `el paquete incluye los ${iconos.length} iconos de public/icon (candado)`,
  );

  // Pie del panel: crédito justo después de la versión, con la bandera SVG en lugar del emoji 🇨🇴,
  // sin enlaces ni desbordamiento horizontal.
  const CREDITO = 'Hecho con ❤️ por Felipe Moreno Marciales';
  const revisarPie = (pagina) =>
    pagina.evaluate((credito) => {
      const version = document.querySelector('.panel__version');
      const elemento = version?.nextElementSibling;
      const caja = elemento?.getBoundingClientRect();
      const bandera = elemento?.lastChild;
      const cajaBandera = bandera?.localName === 'svg' ? bandera.getBoundingClientRect() : null;
      return {
        exacto: elemento?.textContent === credito,
        bandera:
          cajaBandera !== null &&
          bandera.getAttribute('aria-label') === 'Bandera de Colombia' &&
          cajaBandera.width === 12 &&
          cajaBandera.height === 8 &&
          [...bandera.querySelectorAll('rect')].map((r) => getComputedStyle(r).fill).join(' ') ===
            'rgb(252, 209, 22) rgb(0, 56, 147) rgb(206, 17, 38)',
        visible: Boolean(caja && caja.width > 0 && caja.height > 0 && caja.right <= document.documentElement.clientWidth),
        sinEnlaces: document.querySelector('.panel__pie a') === null,
        sinDesbordamiento: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      };
    }, CREDITO);
  const opciones = await contexto.newPage();
  await opciones.setViewportSize({ width: 1280, height: 800 });
  await opciones.goto(`chrome-extension://${idExtension}/options.html`);
  await opciones.getByText(CREDITO).waitFor();
  mkdirSync(CAPTURAS, { recursive: true });
  for (const esquema of ['light', 'dark']) {
    for (const [nombre, pagina] of [['emergente', panel], ['opciones', opciones]]) {
      await pagina.emulateMedia({ colorScheme: esquema });
      const pie = await revisarPie(pagina);
      comprobar(
        pie.exacto && pie.bandera && pie.visible && pie.sinEnlaces && pie.sinDesbordamiento,
        `${nombre} (${esquema === 'light' ? 'claro' : 'oscuro'}): crédito exacto tras la versión, con la bandera SVG (12 × 8 px), sin enlaces ni desplazamiento horizontal`,
      );
    }
    const sufijo = esquema === 'light' ? 'claro' : 'oscuro';
    await panel.screenshot({ path: join(CAPTURAS, `panel-${sufijo}.png`), fullPage: true, animations: 'disabled' });
    await opciones.screenshot({ path: join(CAPTURAS, `opciones-${sufijo}.png`), fullPage: true, animations: 'disabled' });
  }
  await opciones.close();

  // Cambios aplicados en caliente, sin recargar WhatsApp.
  await whatsapp.bringToFront();
  await whatsapp.mouse.move(1000, 700);
  await whatsapp.waitForFunction(() => document.querySelectorAll('style[data-veilix-estilo]').length === 5);
  for (const [selector, descripcion] of [
    ['#pane-side span[title="Ana García"]', 'nombre en la lista'],
    ['#pane-side span[title="Secreto 1"] > span', 'vista previa'],
    ['#pane-side img', 'fotografía en la lista'],
    ['#main header span[dir="auto"]', 'nombre en el encabezado'],
    ['#main header img', 'fotografía en el encabezado'],
    ['.selectable-text span', 'mensaje de la conversación'],
    ['#main footer [contenteditable]', 'campo de entrada'],
  ]) {
    comprobar((await filtro(selector)) === 'blur', `difuminado en caliente: ${descripcion}`);
  }
  comprobar((await filtro('#pane-side [data-icon="muted"]')) === 'none', 'los iconos no se difuminan');
  comprobar((await filtro('[data-prueba="hora"]')) === 'blur', 'difuminado en caliente: hora del mensaje');
  comprobar((await filtro('[data-prueba="reaccion"]')) === 'blur', 'difuminado en caliente: reacción del mensaje');
  comprobar((await filtro('#pane-side [aria-label=" Leído "] svg')) === 'blur', 'difuminado en caliente: indicador de leído en la lista');
  comprobar((await filtro('#main [data-testid="msg-meta"] svg')) === 'blur', 'difuminado en caliente: indicador de leído en el mensaje');
  comprobar((await filtro('#pane-side span[title="Secreto 1"] ~ svg')) === 'none', 'el icono de sticker no se difumina');
  comprobar((await filtro('#main footer [data-testid="quoted-message"] [data-testid="selectable-text"]')) === 'blur', 'difuminado en caliente: texto citado del recuadro «Responder»');
  comprobar((await filtro('#main footer [aria-label="Cancelar respuesta"] svg')) === 'none', 'la X del recuadro «Responder» no se difumina');

  await whatsapp.screenshot({ path: join(CAPTURAS, 'whatsapp-simulado-difuminado.png') });

  // Persistencia y protección desde la carga inicial.
  await whatsapp.reload();
  await whatsapp.waitForSelector('#pane-side span[title="Ana García"]');
  comprobar((await filtro('#pane-side span[title="Ana García"]')) === 'blur', 'tras recargar, la protección sigue activa');

  // Desactivar una funcionalidad no afecta al resto.
  await panel.reload();
  await panel.getByRole('switch', { name: 'Difuminar nombres de contactos' }).click();
  await whatsapp.waitForFunction(() => document.querySelectorAll('style[data-veilix-estilo]').length === 4);
  comprobar((await filtro('#pane-side span[title="Ana García"]')) === 'none', 'al desactivar nombres se revelan sin recargar');
  comprobar((await filtro('.selectable-text span')) === 'blur', 'los mensajes siguen difuminados');

  comprobar(
    peticionesExternas.length === 0,
    `ninguna petición de red externa${peticionesExternas.length ? `: ${peticionesExternas.join(', ')}` : ''}`,
  );
} finally {
  await contexto.close();
  rmSync(perfil, { recursive: true, force: true });
}

if (fallos > 0) {
  console.error(`\n${fallos} comprobación(es) fallida(s).`);
  process.exit(1);
}
console.log(`\nTodas las comprobaciones pasaron. Capturas en ${CAPTURAS}`);

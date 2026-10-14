/**
 * Verificación de extremo a extremo de la extensión compilada en Chromium.
 *
 * Uso: npm run build:chrome && npm run test:extension
 *
 * - Carga `.output/chrome-mv3` en Chromium (Playwright).
 * - Bloquea TODA la red. `https://web.whatsapp.com/` se sirve con una página
 *   simulada local: no se realiza ninguna petición a WhatsApp ni a terceros.
 * - Activa funcionalidades desde el panel real y comprueba el difuminado.
 * - Guarda capturas del panel en `.output/capturas/` para revisión visual.
 *
 * La página simulada reproduce la estructura supuesta en
 * `src/nucleo/difuminado/selectores.ts`; no demuestra compatibilidad con
 * WhatsApp Web real.
 */
/* global document, getComputedStyle -- usados en funciones que Playwright evalúa dentro de la página */
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
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
    const fila = (n, p) => el('div', { role: 'listitem' }, el('div', { role: 'button', tabindex: '0' },
      el('img', { alt: '' }), el('div', {}, el('div', {}, el('span', { dir: 'auto', title: n }, n), el('div', {}, '10:45')),
      el('div', {}, el('span', { title: p }, el('span', { dir: 'ltr' }, p)), el('span', { 'data-icon': 'muted' })))));
    app.append(
      el('div', { id: 'side' }, el('div', { id: 'pane-side' }, el('div', { role: 'grid' }, fila('Ana García', 'Secreto 1'), fila('Banco', 'Código 123456')))),
      el('div', { id: 'main' },
        el('header', {}, el('img', { alt: '' }), el('span', { dir: 'auto', title: 'Ana García' }, 'Ana García')),
        el('div', { role: 'application' }, el('div', { role: 'row' }, el('div', { class: 'message-in' },
          el('div', { class: 'copyable-text' }, el('span', { class: 'selectable-text copyable-text', dir: 'ltr' }, el('span', {}, 'Mensaje privado')))))),
        el('footer', {}, el('div', { contenteditable: 'true', role: 'textbox', 'aria-label': 'Escribe un mensaje' }, el('p', {}, el('br'))))));
  }, 300);
</script></body></html>`;

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
  comprobar((await panel.getByText('Pendiente', { exact: true }).count()) === 4, 'el panel muestra 4 funcionalidades pendientes');

  mkdirSync(CAPTURAS, { recursive: true });
  await panel.emulateMedia({ colorScheme: 'light' });
  await panel.screenshot({ path: join(CAPTURAS, 'panel-claro.png'), fullPage: true, animations: 'disabled' });
  await panel.emulateMedia({ colorScheme: 'dark' });
  await panel.screenshot({ path: join(CAPTURAS, 'panel-oscuro.png'), fullPage: true, animations: 'disabled' });

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

import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

const src = fileURLToPath(new URL('./src', import.meta.url));

/**
 * Dos proyectos de pruebas:
 * - `unidad`: Node y jsdom con WxtVitest, que sustituye la API `browser` por
 *   `fakeBrowser`. https://wxt.dev/guide/essentials/unit-testing
 * - `navegador`: Chromium, Firefox y WebKit sin interfaz (Playwright) para
 *   comprobar el CSS real del motor de difuminado (`filter`, `:hover`, foco y
 *   escritura) en los tres motores de renderizado. WebKit de Playwright NO es
 *   Safari: comparte motor, pero no la integración de extensiones de Safari.
 *   https://vitest.dev/guide/browser/
 */
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [WxtVitest()],
        test: {
          name: 'unidad',
          include: ['tests/**/*.test.{ts,tsx}'],
          exclude: ['tests/navegador/**'],
          restoreMocks: true,
        },
      },
      {
        resolve: { alias: { '@': src } },
        test: {
          name: 'navegador',
          include: ['tests/navegador/**/*.test.ts'],
          restoreMocks: true,
          // Con los tres motores en paralelo, WebKit puede tardar más de 1 s en
          // aplicar :hover y la transición de revelado bajo carga de CPU.
          expect: { poll: { timeout: 5000 } },
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});

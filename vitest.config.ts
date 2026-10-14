import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

const src = fileURLToPath(new URL('./src', import.meta.url));

/**
 * Dos proyectos de pruebas:
 * - `unidad`: Node y jsdom con WxtVitest, que sustituye la API `browser` por
 *   `fakeBrowser`. https://wxt.dev/guide/essentials/unit-testing
 * - `navegador`: Chromium sin interfaz (Playwright) para comprobar el CSS
 *   real del motor de difuminado (`filter`, `:hover`, foco y escritura).
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
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});

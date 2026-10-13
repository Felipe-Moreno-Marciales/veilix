import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

// WxtVitest aplica la configuración de WXT y sustituye la API `browser`
// por `fakeBrowser`, una implementación en memoria. https://wxt.dev/guide/essentials/unit-testing
export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});

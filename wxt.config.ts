import { defineConfig } from 'wxt';
import { VERSION, nombreVersionManifiesto, versionManifiesto } from './src/version';

/**
 * Configuración de WXT para Veilix.
 *
 * Principios aplicados:
 * - Manifest V3 en todos los navegadores. Una sola base de código genera:
 *   `chrome` (también para Brave, Opera y Vivaldi), `edge`, `firefox` y `safari`.
 * - Versiones mínimas según las APIs que usa el motor de difuminado:
 *   `AbortSignal.any` (Chromium 116, Firefox 124, Safari 17.4) y `:has()`.
 * - Mínimo privilegio: solo se solicita el permiso `storage`. El acceso a
 *   WhatsApp Web se limita al script de contenido declarado para
 *   `https://web.whatsapp.com/*`.
 * - Sin código remoto, sin telemetría y sin conexiones a servidores externos.
 * - Versión: `package.json` es la única fuente de verdad. `manifest.version`
 *   y `version_name` se calculan en `src/version.ts` para cada navegador.
 *
 * Documentación: https://wxt.dev/api/config.html
 */
/** `version_name` solo donde el navegador lo admite (Chromium). */
function versionNombrada(browser: string): { version_name?: string } {
  const nombre = nombreVersionManifiesto(VERSION, browser);
  return nombre === undefined ? {} : { version_name: nombre };
}

/** Ajustes específicos de cada familia de navegadores. */
function ajustesPorNavegador(browser: string): Record<string, unknown> {
  if (browser === 'firefox') {
    return {
      browser_specific_settings: {
        gecko: {
          // Identificador provisional; debe confirmarse antes de publicar en AMO.
          id: 'veilix@veilix.app',
          strict_min_version: '140.0',
          // Declaración obligatoria para nuevas extensiones de Firefox:
          // Veilix no recopila ni transmite datos.
          data_collection_permissions: {
            required: ['none'],
          },
        },
        // `data_collection_permissions` requiere Firefox para Android 142.
        gecko_android: {
          strict_min_version: '142.0',
        },
      },
    };
  }
  if (browser === 'safari') {
    return {
      browser_specific_settings: {
        // https://developer.apple.com/documentation/safariservices/optimizing-your-web-extension-for-safari
        safari: { strict_min_version: '17.4' },
      },
    };
  }
  // Chrome, Edge y demás navegadores basados en Chromium.
  return { minimum_chrome_version: '116' };
}

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  // Las importaciones se escriben de forma explícita para facilitar la
  // revisión de seguridad y el análisis estático.
  imports: false,
  manifestVersion: 3,
  // Los ZIP llevan la versión SemVer completa, por ejemplo
  // `veilix-0.2.0-beta.2-chrome.zip`.
  zip: {
    artifactTemplate: '{{name}}-{{packageVersion}}-{{browser}}{{modeSuffix}}.zip',
    sourcesTemplate: '{{name}}-{{packageVersion}}-sources{{modeSuffix}}.zip',
  },
  manifest: ({ browser }) => ({
    name: 'Veilix',
    version: versionManifiesto(VERSION, browser),
    ...versionNombrada(browser),
    description:
      'Privacidad para WhatsApp Web. Funciona de forma local y no envía datos a servidores externos.',
    permissions: ['storage'],
    action: {
      default_title: 'Veilix',
    },
    ...ajustesPorNavegador(browser),
  }),
});

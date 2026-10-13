import { defineConfig } from 'wxt';

/**
 * Configuración de WXT para Veilix.
 *
 * Principios aplicados:
 * - Manifest V3 en todos los navegadores (Chrome, Edge y Firefox).
 * - Mínimo privilegio: solo se solicita el permiso `storage`. El acceso a
 *   WhatsApp Web se limita al script de contenido declarado para
 *   `https://web.whatsapp.com/*`.
 * - Sin código remoto, sin telemetría y sin conexiones a servidores externos.
 *
 * Documentación: https://wxt.dev/api/config.html
 */
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  // Las importaciones se escriben de forma explícita para facilitar la
  // revisión de seguridad y el análisis estático.
  imports: false,
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: 'Veilix',
    description:
      'Privacidad para WhatsApp Web. Funciona de forma local y no envía datos a servidores externos.',
    permissions: ['storage'],
    action: {
      default_title: 'Veilix',
    },
    ...(browser === 'firefox'
      ? {
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
        }
      : {}),
  }),
});

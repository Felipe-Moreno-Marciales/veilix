# Veilix

Extensión de privacidad para WhatsApp Web, desarrollada de forma independiente y compatible con Google Chrome, Microsoft Edge y Mozilla Firefox.

> Veilix no está afiliado a WhatsApp ni a Meta.

## Estado

**Fase 1: infraestructura y arquitectura (completada).** Ya existen la base del proyecto, el panel de configuración, el almacenamiento local de preferencias y la estructura de módulos. **Todavía no hay ninguna funcionalidad de privacidad implementada.** En el panel aparecen como «Pendiente» y no tienen controles.

## Funcionalidades aprobadas

| Funcionalidad | Categoría | Estado | Observaciones |
| --- | --- | --- | --- |
| Difuminar nombres de contactos | Difuminado visual | Pendiente | |
| Difuminar fotografías de contactos | Difuminado visual | Pendiente | |
| Difuminar mensajes recientes | Difuminado visual | Pendiente | Vista previa en la lista de chats. |
| Difuminar mensajes de conversaciones | Difuminado visual | Pendiente | |
| Difuminar el campo de entrada de mensajes | Difuminado visual | Pendiente | |
| Ocultar el estado de escritura | Actividad y presencia | Pendiente | Antes de implementarla hay que confirmar que es técnicamente viable. |
| Ver estados de forma privada | Actividad y presencia | Pendiente | Se priorizará la configuración oficial de privacidad de WhatsApp. |
| Ocultar el estado en línea | Actividad y presencia | Pendiente | Se priorizará la configuración oficial de privacidad de WhatsApp. |
| Restaurar mensajes eliminados previamente almacenados | Mensajes | Pendiente | Exigirá consentimiento explícito. Los datos se guardarán solo de forma local. |

## Principios

- **Privacidad desde el diseño.** Todo el procesamiento ocurre en el navegador. No hay telemetría, analítica ni peticiones a servidores externos.
- **Mínimo privilegio.** Solo se pide el permiso `storage`. El script de contenido se ejecuta únicamente en `https://web.whatsapp.com/*`.
- **Sin datos de conversaciones.** En esta fase no se lee ni se almacena ningún contenido de WhatsApp.
- **Honestidad en la interfaz.** Una funcionalidad no implementada nunca muestra controles que sugieran que funciona.

## Tecnologías

| Herramienta | Versión | Uso |
| --- | --- | --- |
| [WXT](https://wxt.dev) | 0.21.4 | Marco de trabajo para extensiones (Vite 8). |
| React | 19.3.0 | Interfaz del panel. |
| TypeScript | 5.9.3 | Modo estricto. Es la versión que admite `typescript-eslint`. |
| ESLint + typescript-eslint | 10.12.0 / 8.71.2 | Reglas `strictTypeChecked`, de hooks y de seguridad. |
| Vitest + Testing Library + jsdom | 5.0.4 | Pruebas unitarias y de interfaz. |
| web-ext | 10.7.0 | Validación del paquete de Firefox. |

Requisitos: Node.js 22.12 o posterior (en `.nvmrc` se indica la 24) y npm.

## Puesta en marcha

```bash
npm install          # instala dependencias y ejecuta `wxt prepare`
npm run dev          # desarrollo con recarga en Chrome
npm run dev:firefox  # desarrollo en Firefox
```

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run compile` | Verificación de tipos (`tsc --noEmit`). |
| `npm run lint` | ESLint sobre todo el proyecto. |
| `npm test` | Pruebas con Vitest. |
| `npm run check` | Tipos, lint y pruebas. |
| `npm run build` | Compila para Chrome, Edge y Firefox. |
| `npm run build:chrome` / `build:edge` / `build:firefox` | Compila para un solo navegador. |
| `npm run lint:firefox` | Valida `.output/firefox-mv3` con `web-ext lint`. |
| `npm run zip:<navegador>` | Genera el paquete `.zip` para distribuirlo. |

Los resultados se generan en `.output/<navegador>-mv3/`.

### Cargar la extensión sin empaquetar

- **Chrome:** `chrome://extensions` → activar el modo de desarrollador → «Cargar descomprimida» → `.output/chrome-mv3`.
- **Edge:** `edge://extensions` → «Modo de desarrollador» → «Cargar desempaquetada» → `.output/edge-mv3`.
- **Firefox:** `about:debugging#/runtime/this-firefox` → «Cargar complemento temporal» → `.output/firefox-mv3/manifest.json`.

## Diferencias entre navegadores

| Aspecto | Chrome / Edge | Firefox |
| --- | --- | --- |
| Manifiesto | MV3 | MV3 (se fuerza `manifestVersion: 3`; WXT usa MV2 por defecto en Firefox) |
| `browser_specific_settings` | No se incluye | Identificador `gecko.id`, `strict_min_version` 140 y `data_collection_permissions: { required: ["none"] }` |
| Firefox para Android | — | `gecko_android.strict_min_version` 142, necesaria para declarar `data_collection_permissions` |
| Acceso al sitio | Se concede al instalar, a partir de `content_scripts.matches` | Se concede al instalar a partir de Firefox 127. El usuario puede revocarlo desde la gestión de complementos. |

El identificador de Firefox (`veilix@veilix.app`) es provisional y hay que confirmarlo antes de publicar en AMO.

## Arquitectura

```
src/
├── entrypoints/
│   ├── popup/                 Panel emergente (acción de la barra)
│   ├── options/               Página de opciones (misma interfaz, en pestaña)
│   └── whatsapp.content/      Script de contenido para web.whatsapp.com
├── funcionalidades/
│   ├── catalogo.ts            Fuente única de verdad: id, textos, categoría y estado
│   ├── modulo-pendiente.ts    Marcador de posición de los módulos no implementados
│   ├── modulos/               Un módulo independiente por funcionalidad (9)
│   └── registro.ts            Lista de módulos entregada al gestor
├── nucleo/
│   ├── modulo.ts              Contrato `ModuloFuncionalidad` y `ContextoModulo`
│   └── gestor-modulos.ts      Activa y desactiva módulos según las preferencias
├── almacenamiento/
│   ├── preferencias.ts        Modelo, valores predeterminados y normalización
│   └── almacen-preferencias.ts Persistencia en `storage.local` (WXT storage)
└── ui/
    ├── PanelConfiguracion.tsx Panel común al emergente y a la página de opciones
    ├── componentes/           Selector de tema, tarjeta de funcionalidad y logotipo
    ├── use-preferencias.ts    Hook de carga, observación y guardado
    └── estilos/panel.css      Tokens de color, tema claro y oscuro
public/icon/                   Iconos generados con scripts/generar-iconos.mjs
tests/                         Pruebas con Vitest
```

### Flujo

1. El panel lee y guarda las preferencias con `almacen-preferencias.ts` en `storage.local`, con la clave `preferencias` (versión 1 del esquema).
2. Todo valor leído se pasa por `normalizarPreferencias`. Esa función descarta claves desconocidas y fuerza a `false` las funcionalidades pendientes.
3. El script de contenido crea un `GestorModulos`, aplica las preferencias y vuelve a aplicarlas cada vez que cambian.
4. El gestor solo activa módulos **habilitados y disponibles**. Cada módulo recibe un `AbortSignal` propio que se cancela al desactivarlo o al invalidarse el script. Si un módulo falla, el error no afecta a los demás.

### Añadir una funcionalidad en fases posteriores

1. Implementar `activar` y `desactivar` en `src/funcionalidades/modulos/<funcionalidad>.ts`. `desactivar` debe revertir todos los cambios.
2. Cambiar su `estado` a `'disponible'` en `catalogo.ts`. A partir de ese momento el panel muestra su interruptor.
3. Añadir las pruebas correspondientes.

## Seguridad

- ESLint prohíbe `eval`, `new Function`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `fetch`, `XMLHttpRequest`, `WebSocket` y `EventSource` en `src/`.
- No se carga código remoto. Se aplica la política de seguridad de contenido (CSP) predeterminada de MV3.
- Hay pruebas que comprueban que el manifiesto solo pide `storage` y que no tiene `host_permissions`.
- La integración continua usa permisos `contents: read` y `persist-credentials: false`.

## Integración continua

`.github/workflows/ci.yml` se ejecuta en cada *push* a `main` y `development` y en cada *pull request*. Hace la verificación de tipos, el lint y las pruebas. Después compila en paralelo para Chrome, Edge y Firefox, valida el paquete de Firefox con `web-ext lint` y publica los artefactos compilados durante 7 días.

## Limitaciones conocidas

- `web-ext lint` muestra dos avisos `UNSAFE_VAR_ASSIGNMENT` que vienen del código interno de `react-dom`, no de Veilix, que no usa `dangerouslySetInnerHTML`.
- `npm audit` informa de una vulnerabilidad en `node-forge`, que llega como dependencia de `web-ext` a través de `@devicefarmer/adbkit`. Todavía no existe versión corregida. Solo afecta a las herramientas de desarrollo y no se incluye en la extensión. `shell-quote` se ha forzado a 1.12.0 mediante `overrides`.
- Las pruebas de carga manual en los navegadores no pueden hacerse en GitHub Codespaces porque no hay interfaz gráfica.

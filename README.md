# Veilix

Extensión de privacidad para WhatsApp Web, desarrollada de forma independiente y compatible con Google Chrome, Microsoft Edge y Mozilla Firefox.

> Veilix no está afiliado a WhatsApp ni a Meta.

## Estado

- **Fase 1: infraestructura y arquitectura.** Completada y aprobada.
- **Fase 2: motor de difuminado.** Implementada y **pendiente de validación en WhatsApp Web real** por el propietario. Las cinco funcionalidades de difuminado están disponibles en el panel. Están probadas con un DOM que *simula* WhatsApp Web, pero los selectores no se han podido verificar contra la interfaz real (ver [Verificación pendiente](#verificación-pendiente-en-whatsapp-web-real)).

## Funcionalidades aprobadas

| Funcionalidad | Categoría | Estado | Observaciones |
| --- | --- | --- | --- |
| Difuminar nombres de contactos (RF-01) | Difuminado visual | Disponible · por validar | Lista de chats y encabezado de la conversación. |
| Difuminar fotografías de contactos (RF-02) | Difuminado visual | Disponible · por validar | Lista de chats y encabezado. No afecta a los iconos. |
| Difuminar mensajes recientes (RF-03) | Difuminado visual | Disponible · por validar | Vista previa en la lista de chats. |
| Difuminar mensajes de conversaciones (RF-04) | Difuminado visual | Disponible · por validar | Texto, citas y multimedia de mensajes entrantes y salientes. |
| Difuminar el campo de entrada de mensajes (RF-05) | Difuminado visual | Disponible · por validar | Se puede escribir, corregir, copiar y enviar con normalidad. |
| Ocultar el estado de escritura | Actividad y presencia | Pendiente | Antes de implementarla hay que confirmar que es técnicamente viable. |
| Ver estados de forma privada | Actividad y presencia | Pendiente | Se priorizará la configuración oficial de privacidad de WhatsApp. |
| Ocultar el estado en línea | Actividad y presencia | Pendiente | Se priorizará la configuración oficial de privacidad de WhatsApp. |
| Restaurar mensajes eliminados previamente almacenados | Mensajes | Pendiente | Exigirá consentimiento explícito. Los datos se guardarán solo de forma local. |

### Revelado temporal

El contenido difuminado se puede revelar momentáneamente y se vuelve a difuminar al terminar:

| Acción | Nombres, fotos, vistas previas y mensajes | Campo de entrada |
| --- | --- | --- |
| Pasar el cursor por encima de la fila, el encabezado o el mensaje | Revela ese elemento | Revela el editor |
| Foco del teclado (Tab o flechas) en la fila, el encabezado o el mensaje | Revela ese elemento | No revela: el editor tiene el foco mientras se escribe |
| Mantener **Ctrl + Mayús + Espacio** | Revela todo mientras se mantiene | Revela el editor y no inserta el espacio |

Si la ventana pierde el foco, todo se vuelve a difuminar.

## Principios

- **Privacidad desde el diseño.** Todo el procesamiento ocurre en el navegador. No hay telemetría, analítica ni peticiones a servidores externos.
- **Mínimo privilegio.** Solo se pide el permiso `storage`. El script de contenido se ejecuta únicamente en `https://web.whatsapp.com/*`.
- **Sin datos de conversaciones.** Las protecciones son exclusivamente visuales. No se lee, copia, almacena ni transmite el contenido de WhatsApp.
- **Honestidad en la interfaz.** Una funcionalidad no implementada nunca muestra controles que sugieran que funciona.

## Tecnologías

| Herramienta | Versión | Uso |
| --- | --- | --- |
| [WXT](https://wxt.dev) | 0.21.4 | Marco de trabajo para extensiones (Vite 8). |
| React | 19.3.0 | Interfaz del panel. |
| TypeScript | 5.9.3 | Modo estricto. Es la versión que admite `typescript-eslint`. |
| ESLint + typescript-eslint | 10.12.0 / 8.71.2 | Reglas `strictTypeChecked`, de hooks y de seguridad. |
| Vitest + Testing Library + jsdom | 5.0.4 | Pruebas unitarias y de interfaz. |
| Vitest Browser + Playwright | 5.0.4 / 1.64.0 | Pruebas del CSS real en Chromium y verificación de la extensión compilada. |
| web-ext | 10.7.0 | Validación del paquete de Firefox. |

Requisitos: Node.js 22.12 o posterior (en `.nvmrc` se indica la 24) y npm. Las pruebas de navegador necesitan Chromium de Playwright, que se instala con `npm run navegador:instalar`.

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
| `npm test` | Pruebas unitarias (Node y jsdom). |
| `npm run test:navegador` | Pruebas del motor de difuminado en Chromium sin interfaz. |
| `npm run test:extension` | Carga `.output/chrome-mv3` en Chromium y la prueba sobre una página simulada. Requiere `build:chrome`. |
| `npm run test:todo` | Pruebas unitarias y de navegador. |
| `npm run navegador:instalar` | Instala Chromium de Playwright y sus dependencias del sistema. |
| `npm run check` | Tipos, lint y pruebas unitarias. |
| `npm run build` | Compila para Chrome, Edge y Firefox. |
| `npm run build:chrome` / `build:edge` / `build:firefox` | Compila para un solo navegador. |
| `npm run lint:firefox` | Valida `.output/firefox-mv3` con `web-ext lint`. |
| `npm run zip:<navegador>` | Genera el paquete `.zip` para distribuirlo. |

Los resultados se generan en `.output/<navegador>-mv3/`.

### Cargar la extensión sin empaquetar

- **Chrome:** `chrome://extensions` → activar el modo de desarrollador → «Cargar descomprimida» → `.output/chrome-mv3`.
- **Edge:** `edge://extensions` → «Modo de desarrollador» → «Cargar desempaquetada» → `.output/edge-mv3`.
- **Firefox:** `about:debugging#/runtime/this-firefox` → «Cargar complemento temporal» → `.output/firefox-mv3/manifest.json`.

## Prueba manual en Chrome

1. Ejecutar `npm install` y `npm run build:chrome`.
2. Abrir `chrome://extensions`, activar el **modo de desarrollador** y pulsar **Cargar descomprimida** con la carpeta `.output/chrome-mv3`.
3. Fijar Veilix en la barra de herramientas y abrir [web.whatsapp.com](https://web.whatsapp.com) con la sesión iniciada.
4. Abrir el panel de Veilix. Las cinco funcionalidades de difuminado deben tener interruptor y las otras cuatro, la etiqueta «Pendiente».
5. Para cada funcionalidad, activarla sola y comprobar:
   - **Nombres:** se difuminan los nombres de la lista de chats y el del encabezado de la conversación abierta.
   - **Fotografías:** se difuminan las fotos de la lista y del encabezado; los iconos (silenciado, fijado, menú…) no.
   - **Mensajes recientes:** se difuminan las vistas previas. Pedir a otra persona que envíe un mensaje y comprobar que la nueva vista previa aparece difuminada y que sigue así cuando el chat sube al principio.
   - **Mensajes de conversaciones:** se difuminan los mensajes entrantes y salientes (texto, fotos, citas). Los menús, reacciones y botones siguen funcionando. Al cambiar de conversación, la nueva también aparece difuminada.
   - **Campo de entrada:** escribir, borrar, seleccionar con Ctrl + A, copiar, pegar y enviar. El texto debe verse difuminado y el mensaje enviado debe ser exactamente el escrito.
6. Revelado: pasar el cursor por encima, navegar con Tab o las flechas y mantener **Ctrl + Mayús + Espacio**. Al terminar, el contenido debe volver a difuminarse.
7. Desactivar cada interruptor y comprobar que el contenido se ve al instante, sin recargar, y que las demás protecciones siguen activas.
8. Recargar WhatsApp Web con protecciones activas y observar si el contenido llega a verse durante la carga.
9. En las herramientas de desarrollo (pestaña *Red*), comprobar que Veilix no hace ninguna petición.
10. Repetir los pasos más importantes en Edge y Firefox.

Si un elemento no se difumina o se difumina algo que no debería, anota qué elemento era. Después usa *Inspeccionar elemento* para revisar sus atributos (`role`, `title`, `dir`, `data-icon`, `contenteditable`) y sus contenedores (`#pane-side`, `#main`, `header`, `footer`). Los ajustes se hacen solo en [`selectores.ts`](src/nucleo/difuminado/selectores.ts).

## Verificación pendiente en WhatsApp Web real

WhatsApp Web solo muestra la interfaz de chats con una sesión iniciada, y desde el entorno de desarrollo no se puede inspeccionar. Por eso **ninguna funcionalidad se considera compatible hasta que el propietario la compruebe**. Las suposiciones que hay que confirmar son:

| Suposición | Afecta a |
| --- | --- |
| La lista de chats está en `#pane-side` y cada fila tiene `role="listitem"` o `role="row"`. | RF-01, RF-02, RF-03 |
| En cada fila, el nombre es el primer `span[title]` y la vista previa son los demás `span[title]` o `span[dir]`. | RF-01, RF-03 |
| La conversación abierta está en `#main`, con `header` y `footer`. | RF-01, RF-02, RF-04, RF-05 |
| Las burbujas usan las clases `message-in` y `message-out`, y el texto `copyable-text` o `selectable-text`. | RF-04 |
| El editor es un elemento `contenteditable` o `role="textbox"` dentro de `#main footer`. | RF-05 |
| Las fotografías son `<img>` y los iconos usan `data-icon` o SVG. | RF-02 |
| Las filas y los mensajes pueden recibir foco con el teclado. | Revelado con foco |
| Ctrl + Mayús + Espacio no entra en conflicto con atajos de WhatsApp, del navegador o del sistema operativo. | Revelado con teclado |

## Diferencias entre navegadores

| Aspecto | Chrome / Edge | Firefox |
| --- | --- | --- |
| Manifiesto | MV3 | MV3 (se fuerza `manifestVersion: 3`; WXT usa MV2 por defecto en Firefox) |
| `browser_specific_settings` | No se incluye | Identificador `gecko.id`, `strict_min_version` 140 y `data_collection_permissions: { required: ["none"] }` |
| Firefox para Android | — | `gecko_android.strict_min_version` 142, necesaria para declarar `data_collection_permissions` |
| Acceso al sitio | Se concede al instalar, a partir de `content_scripts.matches` | Se concede al instalar a partir de Firefox 127. El usuario puede revocarlo desde la gestión de complementos. |
| APIs usadas por el motor | `AbortSignal.any` (116+), `:has()` (105+) | `AbortSignal.any` (124+), `:has()` (121+); cubiertas por la versión mínima 140 |

El identificador de Firefox (`veilix@veilix.app`) es provisional y hay que confirmarlo antes de publicar en AMO.

## Arquitectura

```
src/
├── entrypoints/
│   ├── popup/                 Panel emergente (acción de la barra)
│   ├── options/               Página de opciones (misma interfaz, en pestaña)
│   └── whatsapp.content/      Script de contenido para web.whatsapp.com (document_start)
├── funcionalidades/
│   ├── catalogo.ts            Fuente única de verdad: id, textos, categoría y estado
│   ├── modulo-pendiente.ts    Marcador de posición de los módulos no implementados
│   ├── modulos/               Un módulo independiente por funcionalidad (9; 5 implementados)
│   └── registro.ts            Lista de módulos entregada al gestor
├── nucleo/
│   ├── modulo.ts              Contrato `ModuloFuncionalidad` y `ContextoModulo`
│   ├── gestor-modulos.ts      Activa y desactiva módulos según las preferencias
│   └── difuminado/            Motor de difuminado reutilizable
│       ├── selectores.ts          Selectores de WhatsApp Web (único punto de ajuste)
│       ├── hoja-estilos.ts        Generación del CSS de difuminado y revelado
│       ├── modulo-difuminado.ts   Fábrica `crearModuloDifuminado`
│       ├── marcador-lista-chats.ts Clasificación de nombre y vista previa en la lista
│       ├── observador-dom.ts      MutationObserver único y compartido
│       └── revelado-teclado.ts    Atajo Ctrl + Mayús + Espacio
├── almacenamiento/
│   ├── preferencias.ts        Modelo, valores predeterminados y normalización
│   └── almacen-preferencias.ts Persistencia en `storage.local` con escrituras serializadas
└── ui/
    ├── PanelConfiguracion.tsx Panel común al emergente y a la página de opciones
    ├── componentes/           Selector de tema, tarjeta de funcionalidad y logotipo
    ├── use-preferencias.ts    Hook de carga, observación y guardado
    └── estilos/panel.css      Tokens de color, tema claro y oscuro
public/icon/                   Iconos generados con scripts/generar-iconos.mjs
scripts/verificar-extension.mjs Verificación de extremo a extremo de la extensión compilada
tests/                         Pruebas unitarias (jsdom)
tests/navegador/               Pruebas en Chromium real
tests/apoyo/                   DOM simulado de WhatsApp Web
```

### Flujo

1. El panel lee y guarda las preferencias con `almacen-preferencias.ts` en `storage.local`, con la clave `preferencias` (versión 1 del esquema). Las escrituras se encolan para que dos cambios seguidos no se pisen.
2. Todo valor leído se pasa por `normalizarPreferencias`. Esa función descarta claves desconocidas y fuerza a `false` las funcionalidades pendientes.
3. El script de contenido se ejecuta en `document_start`, crea un `GestorModulos`, aplica las preferencias y vuelve a aplicarlas cada vez que cambian, sin recargar la página.
4. El gestor solo activa módulos **habilitados y disponibles**. Cada módulo recibe un `AbortSignal` propio que se cancela al desactivarlo o al invalidarse el script. Si un módulo falla, el error no afecta a los demás.

### Motor de difuminado

Los cinco módulos se crean con `crearModuloDifuminado`, a partir de una lista de reglas `{ contenedor, objetivo, revelarConFoco }`:

- **CSS antes que JavaScript.** Cada módulo inserta su propia hoja `<style data-veilix-estilo="…">` con `filter: blur(6px)`. Como las reglas CSS se aplican solas a todo elemento que coincida, los mensajes nuevos, el cambio de conversación y los encabezados no necesitan observar el DOM. El texto, el DOM y los eventos de WhatsApp no se modifican, así que la selección, la copia, la escritura y los clics funcionan con normalidad.
- **Revelado sin JavaScript.** Para cada regla se genera un estado revelado: `:hover`, y además `:focus-visible` y `:has(:focus-visible)` si `revelarConFoco` está activo. Tiene mayor especificidad que el difuminado. La transición solo se aplica al revelar: al volver a difuminar, o al activar el módulo, el cambio es inmediato y el contenido no queda visible durante una animación.
- **Marcado solo donde hace falta.** El nombre y la vista previa de la lista de chats no se pueden distinguir con CSS sin usar clases ofuscadas. En su lugar, `marcador-lista-chats.ts` los clasifica por estructura y les añade `data-veilix-nombre` o `data-veilix-vista-previa`. Cada mutación reclasifica la fila afectada, lo que cubre los mensajes nuevos, el reordenamiento y la reutilización de filas en la lista virtualizada.
- **Un único observador.** `observador-dom.ts` mantiene como máximo un `MutationObserver` por documento, compartido y con recuento de suscriptores. Solo observa `childList`, de modo que los atributos que añade Veilix no generan nuevas mutaciones y no hay bucles. El marcado se hace dentro del propio *callback*, antes del siguiente pintado.
- **Carga inicial.** Las hojas de estilo se insertan en `document_start`, en `<html>` si `<head>` todavía no existe, antes de que WhatsApp pinte los chats.
- **Limpieza completa.** Al desactivar un módulo o invalidarse el script se eliminan su hoja de estilos, sus atributos, sus escuchas de teclado y su suscripción al observador. El observador se desconecta cuando no le queda ningún suscriptor.

### Añadir una funcionalidad en fases posteriores

1. Implementar `activar` y `desactivar` en `src/funcionalidades/modulos/<funcionalidad>.ts`. `desactivar` debe revertir todos los cambios. Si es un difuminado, basta con usar `crearModuloDifuminado`.
2. Cambiar su `estado` a `'disponible'` en `catalogo.ts`. A partir de ese momento el panel muestra su interruptor.
3. Añadir las pruebas correspondientes.

## Pruebas

- **Unitarias (`npm test`, jsdom):** catálogo, preferencias y su persistencia (incluidas escrituras simultáneas), gestor, observador compartido, atajo de teclado, clasificación de filas, ciclo de vida de los cinco módulos, limpieza y panel de configuración.
- **Navegador (`npm run test:navegador`, Chromium):** `filter` calculado sobre cada objetivo y cada control, revelado con cursor, Tab y el atajo, restauración, escritura en el editor, clics en controles difuminados, cambios dinámicos y desactivación.
- **Extensión (`npm run test:extension`, Chromium):** carga `.output/chrome-mv3` con la red bloqueada y sirve una página simulada en `https://web.whatsapp.com/`. Activa las funciones desde el panel real, comprueba el difuminado en caliente, la persistencia tras recargar y que no hay peticiones externas. Guarda capturas del panel en `.output/capturas/`.

Todas usan un DOM **simulado**. Pasar estas pruebas no demuestra compatibilidad con WhatsApp Web real.

## Seguridad

- ESLint prohíbe `eval`, `new Function`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `fetch`, `XMLHttpRequest`, `WebSocket` y `EventSource` en `src/`.
- No se carga código remoto. Se aplica la política de seguridad de contenido (CSP) predeterminada de MV3. El CSS se genera a partir de constantes internas, nunca a partir de datos de la página.
- El motor solo añade elementos `<style>` propios y atributos `data-veilix-*`. No lee el contenido de los mensajes ni modifica nodos de WhatsApp.
- Hay pruebas que comprueban que el manifiesto solo pide `storage` y que no tiene `host_permissions`.
- La integración continua usa permisos `contents: read` y `persist-credentials: false`.

## Integración continua

`.github/workflows/ci.yml` se ejecuta en cada *push* a `main` y `development` y en cada *pull request*:

1. Verificación de tipos, lint, pruebas unitarias y pruebas en Chromium.
2. Compilación en paralelo para Chrome, Edge y Firefox, con validación del paquete de Firefox mediante `web-ext lint`.
3. Verificación de extremo a extremo de la extensión de Chrome, con las capturas del panel como artefacto.
4. Publicación de los artefactos compilados durante 7 días.

## Limitaciones conocidas

- **Selectores sin verificar.** Ver [Verificación pendiente](#verificación-pendiente-en-whatsapp-web-real). Si WhatsApp cambia su estructura, hay que ajustar `selectores.ts`.
- **Heurística de la lista de chats.** El nombre del remitente en vistas previas de grupos, o vistas previas sin `title` ni `dir`, podrían quedar sin difuminar.
- **Fotografías.** Se difuminan todas las `<img>` de las filas y del encabezado. Si WhatsApp mostrara emojis como `<img>` en esas zonas, también se difuminarían.
- **Carga inicial.** Leer las preferencias es asíncrono. Si WhatsApp pintara antes de esa lectura, el contenido podría verse unos milisegundos.
- **Atajo de teclado.** Si se suelta Ctrl o Mayús manteniendo pulsado el Espacio, la repetición automática del Espacio puede escribir espacios en el editor.
- **Avisos de `web-ext lint`.** Muestra dos avisos `UNSAFE_VAR_ASSIGNMENT` que vienen del código interno de `react-dom`, no de Veilix, que no usa `dangerouslySetInnerHTML`.
- **`npm audit`.** Informa de una vulnerabilidad en `node-forge`, que llega como dependencia de `web-ext` a través de `@devicefarmer/adbkit`. Todavía no existe versión corregida. Solo afecta a las herramientas de desarrollo y no se incluye en la extensión. `shell-quote` se ha forzado a 1.12.0 mediante `overrides`.
- **Codespaces.** No se puede probar WhatsApp Web real porque requiere una sesión iniciada. Las pruebas en Chromium sin interfaz sí funcionan. Edge y Firefox solo se validan mediante compilación y `web-ext lint`.

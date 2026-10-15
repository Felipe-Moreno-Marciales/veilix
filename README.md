# Veilix

Extensión de privacidad para WhatsApp Web, desarrollada de forma independiente. Está dirigida a Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Opera, Vivaldi (en Windows, Linux y macOS) y Safari en macOS. El estado real de cada combinación está en la [matriz de compatibilidad](#matriz-de-compatibilidad).

> Veilix no está afiliado a WhatsApp ni a Meta.

## Estado

- **Fase 1: infraestructura y arquitectura.** Completada y aprobada.
- **Fase 2: motor de difuminado.** Implementada y **pendiente de validación en WhatsApp Web real** por el propietario. Las cinco funcionalidades de difuminado están disponibles en el panel. Están probadas con un DOM que *simula* WhatsApp Web, pero los selectores no se han podido verificar contra la interfaz real (ver [Verificación pendiente](#verificación-pendiente-en-whatsapp-web-real)).
- **Ampliación multiplataforma.** Una sola base de código genera los paquetes de Chromium (Chrome, Brave, Opera y Vivaldi), Edge, Firefox y Safari. El motor de difuminado se prueba de forma automatizada en Chromium, Firefox y WebKit. **Ningún navegador se ha probado todavía con WhatsApp Web real, y Safari no se ha ejecutado nunca** (requiere macOS).

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

El atajo usa la tecla **Control** en todos los sistemas, también en macOS (no Comando). En Safari, el tabulador solo recorre los campos de formulario por defecto. Para mover el foco por filas y botones hay que usar **Opción + Tab** o activar *Safari > Ajustes > Avanzado > «Pulsar Tab para resaltar cada ítem de una página web»*.

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
| Vitest Browser + Playwright | 5.0.4 / 1.64.0 | Pruebas del CSS real en Chromium, Firefox y WebKit, y verificación de la extensión compilada en Chromium. |
| web-ext | 10.7.0 | Validación del paquete de Firefox. |

Requisitos: Node.js 22.12 o posterior (en `.nvmrc` se indica la 24) y npm. Las pruebas de navegador necesitan los navegadores de Playwright (Chromium, Firefox y WebKit), que se instalan con `npm run navegador:instalar`.

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
| `npm run test:navegador` | Pruebas del motor de difuminado en Chromium, Firefox y WebKit sin interfaz. |
| `npm run test:extension` | Carga `.output/chrome-mv3` en Chromium y la prueba sobre una página simulada. Requiere `build:chrome`. |
| `npm run test:todo` | Pruebas unitarias y de navegador. |
| `npm run navegador:instalar` | Instala Chromium, Firefox y WebKit de Playwright y sus dependencias del sistema. |
| `npm run check` | Tipos, lint y pruebas unitarias. |
| `npm run build` | Compila para Chrome, Edge, Firefox y Safari. |
| `npm run build:chrome` / `build:edge` / `build:firefox` / `build:safari` | Compila para un solo navegador. `build:chrome` sirve también para Brave, Opera y Vivaldi. |
| `npm run lint:firefox` | Valida `.output/firefox-mv3` con `web-ext lint`. |
| `npm run zip:<navegador>` | Genera el paquete `.zip` (`chrome`, `edge`, `firefox` o `safari`). |

Los resultados se generan en `.output/<navegador>-mv3/`.

### Cargar la extensión sin empaquetar

| Navegador | Paquete | Pasos |
| --- | --- | --- |
| Chrome | `.output/chrome-mv3` | `chrome://extensions` → activar «Modo de desarrollador» → «Cargar descomprimida». |
| Edge | `.output/edge-mv3` | `edge://extensions` → «Modo de desarrollador» → «Cargar desempaquetada». |
| Brave | `.output/chrome-mv3` | `brave://extensions` → «Modo de desarrollador» → «Cargar descomprimida». |
| Opera | `.output/chrome-mv3` | `opera://extensions` → «Modo de desarrollador» → «Cargar descomprimida». |
| Vivaldi | `.output/chrome-mv3` | `vivaldi://extensions` → «Modo de desarrollador» → «Cargar descomprimida». |
| Firefox | `.output/firefox-mv3` | `about:debugging#/runtime/this-firefox` → «Cargar complemento temporal» → `manifest.json`. Se elimina al cerrar Firefox. |
| Safari (macOS) | `.output/safari-mv3` | Ver [Safari](#safari-en-macos). |

En Opera y Vivaldi, la extensión actúa sobre WhatsApp Web abierto **en una pestaña**. Los paneles laterales que estos navegadores integran para WhatsApp no se han evaluado, y es posible que los scripts de contenido no se inyecten en ellos.

## Prueba manual

El procedimiento se describe con Chrome y se repite igual en el resto de navegadores. Las diferencias de cada uno están al final de esta sección.


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
10. Anotar el resultado en la [matriz de compatibilidad](#matriz-de-compatibilidad), indicando navegador, versión y sistema operativo.

**Particularidades por navegador**

- **Edge:** usar `.output/edge-mv3`. Comprobar que el atajo no lo captura la barra lateral ni Copilot.
- **Brave:** usar `.output/chrome-mv3`. Los escudos de Brave no deberían afectar, porque Veilix no hace peticiones.
- **Opera y Vivaldi:** usar `.output/chrome-mv3` y abrir WhatsApp Web **en una pestaña**, no en el panel lateral. Comprobar que el atajo no choca con los atajos propios del navegador (Vivaldi permite reasignarlos en *Ajustes > Teclado*).
- **Firefox:** cargar como complemento temporal. Comprobar en *about:addons > Veilix > Permisos* que el acceso a `web.whatsapp.com` está concedido.
- **Safari (macOS):** ver [Safari en macOS](#safari-en-macos). Hay que conceder acceso al sitio y usar **Opción + Tab** para el revelado por foco.
- **Por sistema operativo:** el atajo usa Control en Windows, Linux y macOS. Comprobar que no lo capturan el cambio de idioma o de distribución del teclado (Windows: Ctrl + Mayús), los métodos de entrada (IBus o Fcitx en Linux) ni las fuentes de entrada de macOS.

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

## Matriz de compatibilidad

Estado a 15 de octubre de 2026. Las columnas distinguen tres tipos de evidencia:

- **Compilación:** se genera un paquete válido para ese navegador.
- **Pruebas simuladas:** pruebas automatizadas sobre un DOM que imita WhatsApp Web, ejecutadas en Linux (Codespaces y GitHub Actions).
- **Prueba real:** la extensión instalada en ese navegador y sistema operativo, usada con WhatsApp Web real. **Ninguna se ha hecho todavía.**

| Navegador | Paquete | Versión mínima | Compilación | Motor de difuminado (simulado) | Extensión cargada (simulado) | Real · Windows | Real · Linux | Real · macOS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chrome | `chrome-mv3` | Chrome 116 | ✅ | ✅ Chromium 156 | ✅ Chromium | ⏳ | ⏳ | ⏳ |
| Edge | `edge-mv3` | Edge 116 | ✅ | ◐ mismo motor que Chromium | ❌ | ⏳ | ⏳ | ⏳ |
| Brave | `chrome-mv3` | Chromium 116 | ✅ mismo paquete que Chrome | ◐ mismo motor que Chromium | ❌ | ⏳ | ⏳ | ⏳ |
| Opera | `chrome-mv3` | Chromium 116 | ✅ mismo paquete que Chrome | ◐ mismo motor que Chromium | ❌ | ⏳ | ⏳ | ⏳ |
| Vivaldi | `chrome-mv3` | Chromium 116 | ✅ mismo paquete que Chrome | ◐ mismo motor que Chromium | ❌ | ⏳ | ⏳ | ⏳ |
| Firefox | `firefox-mv3` | Firefox 140 | ✅ y `web-ext lint` sin errores | ✅ Firefox 157 (Playwright) | ❌ | ⏳ | ⏳ | ⏳ |
| Safari | `safari-mv3` | Safari 17.4 | ✅ solo los archivos de la extensión; sin empaquetar | ◐ WebKit 27.2 (Playwright), que **no es Safari** | ❌ | — | — | ⏳ (requiere macOS) |

Leyenda: ✅ comprobado · ◐ evidencia indirecta (mismo motor de renderizado, otro navegador) · ❌ no realizado · ⏳ pendiente de prueba real · — no aplica.

- **Motor de difuminado (simulado):** las 21 pruebas de `tests/navegador` en cada motor. Comprueban el CSS calculado, el revelado con cursor, Tab y atajo, la escritura, los clics y los cambios dinámicos.
- **Extensión cargada (simulado):** `npm run test:extension`. Carga el paquete compilado, lo usa desde su panel real, bloquea la red y sirve una página simulada en `web.whatsapp.com`. Playwright solo puede cargar extensiones en Chromium.
- **WebKit de Playwright no es Safari:** comparte el motor de renderizado, pero no la integración de extensiones de Safari (permisos por sitio, almacenamiento, ventana emergente), ni el sistema macOS ni la versión exacta de Safari.

Cuando se pruebe una combinación real, sustituye ⏳ por ✅ o ❌ e indica la versión del navegador, el sistema y la fecha.

## Diferencias entre navegadores

| Aspecto | Chromium (Chrome, Edge, Brave, Opera, Vivaldi) | Firefox | Safari (macOS) |
| --- | --- | --- | --- |
| Manifiesto | MV3 | MV3 (se fuerza `manifestVersion: 3`; WXT usa MV2 por defecto) | MV3 (se fuerza `manifestVersion: 3`; WXT usa MV2 por defecto) |
| Ajustes específicos | `minimum_chrome_version: "116"` | `gecko.id`, `strict_min_version` 140 y `data_collection_permissions: { required: ["none"] }`. En Android, `gecko_android.strict_min_version` 142. | `browser_specific_settings.safari.strict_min_version: "17.4"` |
| Página de opciones | Se abre en una pestaña (`open_in_tab`) | Se abre en una pestaña | WXT elimina `open_in_tab`, que Safari no admite |
| Acceso al sitio | Se concede al instalar, a partir de `content_scripts.matches` | Se concede al instalar a partir de Firefox 127; el usuario puede revocarlo | El usuario debe conceder acceso a `web.whatsapp.com` desde Safari |
| Distribución | Chrome Web Store (también la usan Brave, Opera y Vivaldi), Edge Add-ons, Opera Add-ons | addons.mozilla.org | App Store, mediante una app contenedora para macOS |
| APIs del motor | `AbortSignal.any` (116+), `:has()` (105+) | `AbortSignal.any` (124+), `:has()` (121+) | `AbortSignal.any` (17.4+), `:has()` (15.4+) |

Los identificadores provisionales (`veilix@veilix.app` en Firefox y `app.veilix.Veilix` en Safari) deben confirmarse antes de publicar.

## Safari en macOS

### Evaluación técnica

- **Manifiesto compatible.** El paquete `safari-mv3` usa solo claves que Safari admite: `storage`, `action` con ventana emergente, `options_ui`, `content_scripts` e `icons`. No tiene página de fondo, así que no le afectan las restricciones de Safari sobre páginas de fondo persistentes.
- **APIs del motor.** `AbortSignal.any` (Safari 17.4), `:has()` y `:focus-visible` (Safari 15.4). Por eso la versión mínima declarada es 17.4.
- **Mismo código.** No hace falta ningún cambio en el código fuente ni en los módulos. WXT genera el paquete con `npm run build:safari`.
- **Sin probar en Safari.** La compilación funciona en Linux, pero empaquetar, instalar y ejecutar en Safari no se ha podido hacer, porque requiere macOS o una cuenta del Apple Developer Program. WebKit de Playwright solo confirma que el CSS del motor funciona en el motor de Safari.

### Opciones oficiales de empaquetado

| Opción | Requisitos | Uso |
| --- | --- | --- |
| **Extensión temporal** (*Safari > Ajustes > Desarrollador > «Añadir extensión temporal…»*) | Mac con Safari reciente; activar «Mostrar funciones para desarrolladores web» y «Permitir extensiones sin firmar» | Prueba rápida sin Xcode. Safari la elimina a las 24 horas o al cerrarse. |
| **`xcrun safari-web-extension-packager`** (antes `safari-web-extension-converter`) | Mac con Xcode | Genera un proyecto de Xcode con la app contenedora para macOS. Necesario para distribuir o para probar firmado. |
| **Safari Web Extension Packager en App Store Connect** | Apple Developer Program, registro de la app en App Store Connect (consume horas de Xcode Cloud) | Empaqueta un ZIP de la extensión sin Mac, para TestFlight y la App Store. Hay desarrolladores que informan de que la opción no siempre aparece en la interfaz. |

### Probar en Safari (macOS)

1. En cualquier sistema: `npm run build:safari` (o `npm run zip:safari` para obtener un ZIP).
2. En el Mac: *Safari > Ajustes > Avanzado* → activar «Mostrar funciones para desarrolladores web».
3. *Safari > Ajustes > Desarrollador* → activar «Permitir extensiones sin firmar» (se desactiva al cerrar Safari).
4. *Safari > Ajustes > Desarrollador > «Añadir extensión temporal…»* → seleccionar `.output/safari-mv3` o el ZIP.
5. En *Ajustes > Extensiones*, activar Veilix y conceder acceso a `web.whatsapp.com`, o aceptar la solicitud de acceso al abrir WhatsApp Web.
6. Seguir la [prueba manual](#prueba-manual) y usar **Opción + Tab** para el revelado por foco.

Para generar el proyecto de Xcode:

```bash
npm run build:safari
xcrun safari-web-extension-packager .output/safari-mv3 \
  --app-name Veilix --bundle-identifier app.veilix.Veilix \
  --swift --macos-only --copy-resources
```

El trabajo `safari-macos` de la integración continua automatiza este paso y compila la app sin firmar en un runner de macOS. Solo se ejecuta al lanzarlo a mano, y valida el empaquetado, no el funcionamiento en Safari.

Referencias: [Running your Safari web extension](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension), [Packaging a web extension for Safari](https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari), [Packaging and distributing Safari Web Extensions with App Store Connect](https://developer.apple.com/documentation/safariservices/packaging-and-distributing-safari-web-extensions-with-app-store-connect), [Optimizing your web extension for Safari](https://developer.apple.com/documentation/safariservices/optimizing-your-web-extension-for-safari) y [WXT: publicación](https://wxt.dev/guide/essentials/publishing).

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
- **Navegador (`npm run test:navegador`, Chromium, Firefox y WebKit):** las mismas 21 pruebas en cada motor. Comprueban el `filter` calculado sobre cada objetivo y cada control, el revelado con cursor, Tab y el atajo, la restauración, la escritura en el editor, los clics en controles difuminados, los cambios dinámicos y la desactivación. WebKit de Playwright no equivale a Safari.
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

1. Verificación de tipos, lint, pruebas unitarias y pruebas en Chromium, Firefox y WebKit.
2. Compilación en paralelo para Chrome, Edge, Firefox y Safari, con validación del paquete de Firefox mediante `web-ext lint`.
3. Verificación de extremo a extremo de la extensión de Chrome, con las capturas del panel como artefacto.
4. Publicación de los artefactos compilados durante 7 días.
5. Solo al lanzarlo a mano (`workflow_dispatch`): el trabajo experimental `safari-macos` empaqueta para Safari con `safari-web-extension-packager` y compila la app sin firmar en macOS. Si falla, no bloquea el resto (`continue-on-error`).

## Limitaciones conocidas

- **Selectores sin verificar.** Ver [Verificación pendiente](#verificación-pendiente-en-whatsapp-web-real). Si WhatsApp cambia su estructura, hay que ajustar `selectores.ts`.
- **Heurística de la lista de chats.** El nombre del remitente en vistas previas de grupos, o vistas previas sin `title` ni `dir`, podrían quedar sin difuminar.
- **Fotografías.** Se difuminan todas las `<img>` de las filas y del encabezado. Si WhatsApp mostrara emojis como `<img>` en esas zonas, también se difuminarían.
- **Carga inicial.** Leer las preferencias es asíncrono. Si WhatsApp pintara antes de esa lectura, el contenido podría verse unos milisegundos.
- **Atajo de teclado.** Si se suelta Ctrl o Mayús manteniendo pulsado el Espacio, la repetición automática del Espacio puede escribir espacios en el editor.
- **Avisos de `web-ext lint`.** Muestra dos avisos `UNSAFE_VAR_ASSIGNMENT` que vienen del código interno de `react-dom`, no de Veilix, que no usa `dangerouslySetInnerHTML`.
- **`npm audit`.** Informa de una vulnerabilidad en `node-forge`, que llega como dependencia de `web-ext` a través de `@devicefarmer/adbkit`. Todavía no existe versión corregida. Solo afecta a las herramientas de desarrollo y no se incluye en la extensión. `shell-quote` se ha forzado a 1.12.0 mediante `overrides`.
- **Codespaces.** No se puede probar WhatsApp Web real porque requiere una sesión iniciada. Tampoco hay Windows, macOS, Edge, Brave, Opera, Vivaldi ni Safari. Las pruebas del motor se ejecutan en los motores de Playwright (Chromium, Firefox y WebKit) sobre Linux, y la extensión cargada solo en Chromium.
- **Safari.** No se ha ejecutado nunca y el trabajo `safari-macos` aún no se ha lanzado. En Safari, el revelado por foco requiere **Opción + Tab**, salvo que se cambie el ajuste correspondiente.
- **Opera y Vivaldi.** No se han evaluado los paneles laterales de WhatsApp integrados en estos navegadores.
- **Atajo multiplataforma.** No se ha comprobado si Ctrl + Mayús + Espacio choca con atajos de Vivaldi u Opera, con el cambio de distribución del teclado de Windows ni con los métodos de entrada de Linux y macOS.

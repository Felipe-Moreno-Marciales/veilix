# Veilix

Extensión de privacidad para WhatsApp Web, desarrollada de forma independiente. Está dirigida a Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Opera, Vivaldi (en Windows, Linux y macOS) y Safari en macOS. El estado real de cada combinación está en la [matriz de compatibilidad](#matriz-de-compatibilidad).

> Veilix no está afiliado a WhatsApp ni a Meta.

## Estado

Versión actual: **0.1.2-beta.0**, compilación interna de prueba sobre la estable `0.1.1`, que sigue pendiente de la aprobación final del propietario. Solo añade la protección del texto citado en el recuadro «Responder» (RF-04), pendiente de validación real; ver [Recuadro «Responder»](#recuadro-responder-corrección-en-012-beta0). Ninguna está publicada en tiendas ni tiene etiqueta de Git. `0.1.1` incluye las correcciones de RF-01 y RF-02 sobre `0.1.0` y la identidad visual del candado, con el crédito del desarrollador en el pie del panel (la bandera de Colombia es un SVG local, porque Windows no muestra el emoji 🇨🇴). El estado de cada evidencia está en [Versión 0.1.1](#versión-011-estable-pendiente-de-aprobación) y el historial, en [CHANGELOG.md](CHANGELOG.md).

- **Fase 1: infraestructura y arquitectura.** Completada y aprobada.
- **Fase 2: motor de difuminado.** Implementada y **validada funcionalmente en Google Chrome** por el propietario con `0.2.0-beta.8` (sistema operativo sin indicar). La versión final es `0.1.0` (renumeración aprobada), con el mismo comportamiento que `0.2.0-beta.8`. Después, en pruebas reales se detectaron nombres de remitentes de grupo y elementos de «Nuevo chat» sin proteger; `0.1.1-beta.0` los corrige, y `0.1.1` reúne esas correcciones como estable. Con `0.1.1-beta.3`, el propietario validó en Chrome la información secundaria de «Nuevo chat» y los remitentes en grupos, sin regresiones. **La Fase 2 sigue abierta** hasta que el propietario apruebe `0.1.1`. Ver [Versión 0.1.1](#versión-011-estable-pendiente-de-aprobación) y [Cierre de la Fase 2](#cierre-de-la-fase-2).
- **Ampliación multiplataforma.** Una sola base de código genera los paquetes de Chromium (Chrome, Brave, Opera y Vivaldi), Edge, Firefox y Safari. El motor de difuminado se prueba de forma automatizada en Chromium, Firefox y WebKit. **Fuera de Google Chrome no se ha hecho ninguna prueba real, y Safari no se ha ejecutado nunca** (requiere macOS).
- **Fase 3:** no iniciada.

## Versión 0.1.1 (estable, pendiente de aprobación)

Preparada el 21 de octubre de 2026 a partir de `0.1.1-beta.5` con `npm run version:estable`, sin cambios de comportamiento. Manifiesto `0.1.1` en Chrome, Edge, Firefox y Safari, sin `version_name`. El panel muestra «Veilix 0.1.1».

### Contenido

- **RF-01 a RF-05**, con revelado temporal y restauración al desactivar.
- **Ampliaciones de RF-01:** remitentes en grupos, y nombres e información secundaria en «Nuevo chat».
- **Ampliación de RF-02:** avatares SVG en cualquier zona.
- **Funcionalidades pendientes:** las otras cuatro siguen marcadas como «Pendiente» y sin interruptor.
- **Identidad visual:** candado sobre el verde `#00A884` y crédito con la bandera SVG, en los temas claro y oscuro.
- **Permisos y almacenamiento:** solo `storage`, sin `host_permissions`. Solo se guardan las preferencias (`local:preferencias`), con el mismo esquema, así que se conservan al actualizar.

### Evidencia, por tipo

| Tipo | Alcance | Estado |
| --- | --- | --- |
| Automatizada (compilación y DOM simulado) | `0.1.1`, todas las verificaciones de `AGENTS.md` | ✅ Correcta (ver la tabla siguiente) |
| Real en Google Chrome (propietario, sistema sin indicar) | RF-01 a RF-05 con `0.2.0-beta.8` | ✅ Validada |
| Real en Google Chrome | `0.1.1-beta.0`: remitentes en grupos, fotos y avatares de «Nuevo chat», revelado y desactivación | ✅ Correcta |
| Real en Google Chrome | `0.1.1-beta.2`: nombres de «Nuevo chat» | ✅ Correcta |
| Real en Google Chrome | `0.1.1-beta.2`: remitentes en grupos | ❌ Regresión comunicada (no reproducida en el DOM simulado; causa sin identificar) |
| Real en Google Chrome | `0.1.1-beta.3`: información secundaria de «Nuevo chat», remitentes en grupos y ausencia de regresiones | ✅ Correcta; la regresión de beta.2 no volvió a manifestarse |
| Real en Google Chrome | Candado (beta.4), crédito y bandera (beta.5) y `0.1.1` | ⏳ Sin resultado comunicado (solo cambian la identidad visual y la versión; RF-01 a RF-05 no cambian desde beta.3) |
| Real en Google Chrome | Recuadro «Responder» (vista previa del mensaje citado encima del editor) con `0.1.1` | ❌ **El texto citado queda visible** con RF-04 activa (comunicado por el propietario el 22 de octubre de 2026). El autor sí se difumina con RF-01. Corrección en `0.1.2-beta.0`, pendiente de validación ([detalle](#recuadro-responder-corrección-en-012-beta0)) |
| Real en Edge, Firefox, Brave, Opera, Vivaldi y Safari | — | ⏳ Ninguna prueba real ([matriz](#matriz-de-compatibilidad)) |

### Resultados automatizados (`0.1.1`)

| Verificación | Resultado |
| --- | --- |
| `compile`, `lint` | Sin errores |
| `npm test` | 208 de 208 (20 archivos) |
| `test:navegador` | 342 de 342 (114 por motor en Chromium, Firefox y WebKit) |
| `build` (Chrome, Edge, Firefox y Safari) | Correcta; manifiesto `0.1.1` en los cuatro, sin `version_name` |
| `lint:firefox` | 0 errores, 2 avisos conocidos de `react-dom` |
| `test:extension` | Todas las comprobaciones correctas, red bloqueada y sin peticiones externas |
| `zip:*` (solo en local) | `veilix-0.1.1-{chrome,edge,firefox,safari}.zip` y `veilix-0.1.1-sources.zip` |
| `version:comprobar` | Correcta: `0.1.1-beta.5` → `0.1.1` |

### Antes de aprobar

1. **Prueba de humo de `0.1.1` en Chrome:** que el panel muestre «Veilix 0.1.1» sin «(beta)», el candado (barra, administrador de extensiones y panel), el crédito con la bandera en los dos temas, y un repaso rápido de RF-01 a RF-05.
2. **Recuadro «Responder»:** `0.1.1` tiene esta exposición; la corrige `0.1.2-beta.0`. Decidir si `0.1.1` se aprueba con la limitación documentada o si la siguiente estable (`0.1.2`) espera a validar la corrección (ver [Recuadro «Responder»](#recuadro-responder-corrección-en-012-beta0)).
3. **Después de aprobar:** cualquier corrección empieza en `0.1.2-beta.0` (`npm run version:beta`). El número `0.1.1` no se reutiliza para otro código.

### Recuadro «Responder» (corrección en 0.1.2-beta.0)

Al pulsar «Responder», WhatsApp Web muestra encima del editor una vista previa del mensaje citado. Con `0.1.1`, el propietario comprobó en Chrome que el texto citado queda visible con la protección activada.

**Estructura confirmada** con [`scripts/diagnostico-respuesta.js`](scripts/diagnostico-respuesta.js) en WhatsApp Web real (Chrome, respuesta a un mensaje de texto):

```text
#main
└── footer
    └── [data-testid="popup_panel"]
        └── [data-testid="quoted-message"]
            ├── [data-testid="author"]                   ← difuminado por RF-01 (marcado como remitente)
            └── span.quoted-mention.selectable-text.copyable-text[data-testid="selectable-text"]  ← visible
```

El editor (`conversation-compose-box-input`) estaba difuminado por RF-05, y los botones seguían visibles.

**Causa confirmada:** la regla de RF-04 solo actúa dentro de una fila de mensaje (`#main [data-id]` con `msg-container`) o de un `msg-container`. El recuadro está en `footer`, fuera de esas filas, así que ninguna regla alcanzaba su texto. RF-01 ya lo cubría, porque su marcador recorre todo `#main` y el autor coincide con un remitente de `data-pre-plain-text`.

**Corrección (`0.1.2-beta.0`):** una regla CSS más en RF-04, sin observadores nuevos.
- **Selector:** `#main footer [data-testid="quoted-message"] [data-testid="selectable-text"]`, que deja fuera `[data-testid="author"]`.
- **Alcance:** solo el texto citado. El autor sigue correspondiendo a RF-01, y la X y los demás controles quedan visibles.
- **Revelado:** con el cursor o el foco sobre el recuadro, o con Ctrl + Mayús + Espacio.
- **Sin efecto en:** las citas dentro de los mensajes (la regla se limita a `footer`), RF-01, RF-05 y el resto de RF-04.

**Pendiente de evidencia** (no se han inventado selectores):
- **Fotos, vídeos y otros contenidos citados:** solo se ha observado la respuesta a un texto. Las miniaturas de fotos y vídeos citados no se difuminan hasta confirmar su estructura.
- **Variantes de respuesta:** chats individuales, mensajes propios, grupos y multimedia sin descripción. Si usan la misma estructura, el texto queda cubierto; si no, el diagnóstico lo mostrará.
- **Respuesta a un mensaje propio:** el autor que se muestra es una etiqueta de la interfaz («Tú»), no un remitente de `data-pre-plain-text`, así que RF-01 no lo difumina.

**Versión:** `0.1.1` ya estaba entregada y confirmada en `development`, así que la corrección es `0.1.2-beta.0` (`npm run version:beta`), una compilación interna. Incluirla en `0.1.1` exigiría una decisión expresa del propietario y una excepción en `version-renumeraciones.json`, que un agente no puede añadir.

**Riesgo residual:** la causa de la regresión de remitentes de beta.2 sigue sin conocerse. No se reprodujo en el DOM simulado, no se cambió código para corregirla y no se repitió en la validación real de beta.3. Si vuelve a aparecer, hay que ejecutar [`scripts/diagnostico-mensajes.js`](scripts/diagnostico-mensajes.js) en el grupo afectado y compartir las tablas «reglas cargadas en esta pestaña» y «remitentes por mensaje», además de los errores de consola que empiecen por «[Veilix]».

## Cierre de la Fase 2

### Funcionalidades entregadas

RF-01 a RF-05, con revelado temporal (cursor, foco de teclado y Ctrl + Mayús + Espacio), panel de configuración, preferencias persistentes y aplicación en caliente sin recargar WhatsApp Web.

### Validación funcional en Google Chrome

El propietario realizó las pruebas con `0.2.0-beta.8`, sin indicar el sistema operativo. Comunicó como superados:

| Ámbito | Resultado comunicado |
| --- | --- |
| RF-01 | Nombres de contactos, encabezados y participantes de grupos |
| RF-02 | Fotografías y avatares |
| RF-03 | Mensajes recientes, indicadores y vistas previas especiales (reacciones, emojis e iconos multimedia) |
| RF-04 | Mensajes, multimedia, horas, reacciones e indicadores |
| RF-05 | Campo de escritura |
| Comportamiento general | Revelado temporal y restauración; persistencia y protección tras recargar; cambio de conversación |

Precisiones técnicas sobre ese resultado:

- **Participantes de grupos:** en `0.1.0`, RF-01 no tenía ninguna regla para los nombres de remitentes dentro de la conversación. Una prueba real lo mostró: con RF-01 activa, esos nombres seguían visibles. La observación anterior (nombres difuminados con RF-04 desactivada) queda sin explicación con el código de `0.1.0`. `0.1.1-beta.0` lo corrige (ver [Nombres fuera de la lista de chats](#nombres-y-avatares-fuera-de-la-lista-de-chats-011-beta0)).
- **Indicadores de estado:** el código solo reconoce el icono `wds-ic-read`. Si los indicadores de enviado y entregado también se ven difuminados, es probable que compartan ese icono, pero no está confirmado por diagnóstico. El **indicador de reloj (pendiente) está pendiente de validación**.

### Resultados automatizados (`0.1.0`)

| Verificación | Resultado |
| --- | --- |
| `compile`, `lint` | Sin errores |
| `npm test` | 170 de 170 |
| `test:navegador` | 255 de 255 (85 por motor en Chromium, Firefox y WebKit) |
| `build:chrome`, `build:edge`, `build:firefox`, `build:safari` | Correctas |
| `lint:firefox` | 0 errores, 2 avisos conocidos de `react-dom` |
| `test:extension` | Todas las comprobaciones correctas, red bloqueada y sin peticiones externas |
| `zip:*` | `veilix-0.1.0-{chrome,edge,firefox,safari}.zip` (y `veilix-0.1.0-sources.zip` para Firefox) |
| `version:comprobar` | Correcta: renumeración aprobada frente a `HEAD` y `origin/main` |

### Auditoría de permisos y privacidad

- **Manifiestos:** solo piden el permiso `storage`, sin `host_permissions`, página de fondo, CSP personalizada ni recursos accesibles desde la web. El script de contenido se limita a `https://web.whatsapp.com/*`.
- **Código:** `src/` no usa APIs de red ni ejecución dinámica de código. El almacenamiento se limita a las preferencias (`local:preferencias`). Los marcadores leen texto solo para clasificar elementos y no lo guardan ni lo transmiten.
- **Paquetes compilados:** las únicas URL son espacios de nombres XML/SVG, enlaces de mensajes de error de React y WXT, y el patrón de `web.whatsapp.com`. Ninguna se usa para hacer peticiones.
- **Dependencias:** en producción, solo `react` y `react-dom`. `npm audit` informa de 4 alertas altas de la cadena de desarrollo `web-ext → @devicefarmer/adbkit → node-forge`, que no se incluye en la extensión.

### Pendiente

- **Otros navegadores y sistemas:** pruebas manuales en Edge, Brave, Opera, Vivaldi, Firefox y Safari, y en Chrome con el sistema operativo indicado. Ver la [matriz de compatibilidad](#matriz-de-compatibilidad).
- **Indicador de reloj (pendiente):** validación pendiente.
- **Prueba de humo de `0.1.1` en Chrome:** identidad visual y versión (ver [Antes de aprobar](#antes-de-aprobar)).
- **Correcciones de RF-01 y RF-02 de `0.1.1`:** validadas en Chrome real con `0.1.1-beta.0`, `0.1.1-beta.2` y `0.1.1-beta.3`. La causa de la regresión de remitentes de beta.2 sigue sin conocerse, aunque no se repitió en beta.3. Ver [Versión 0.1.1](#versión-011-estable-pendiente-de-aprobación).
- **Alertas de `npm audit`** en dependencias de desarrollo (`web-ext → node-forge`).
- **Commits:** parte del trabajo de `0.1.1` ya está confirmado en `development`, pero no todo. El `HEAD` actual no compila sin los archivos pendientes (ver [Antes de aprobar](#antes-de-aprobar)).

## Funcionalidades aprobadas

| Funcionalidad | Categoría | Estado | Observaciones |
| --- | --- | --- | --- |
| Difuminar nombres de contactos (RF-01) | Difuminado visual | Disponible · validado en Chrome con `0.2.0-beta.8`. Ampliaciones de `0.1.1` validadas en Chrome con `0.1.1-beta.3`: remitentes en grupos y nombres e información secundaria de «Nuevo chat» | Lista de chats y encabezado de la conversación. Desde `0.1.1-beta.0`, también los remitentes dentro de la conversación (sobre los mensajes de grupo, en citas y respuestas, en el aviso fijado) y los nombres de filas de contacto fuera de la lista («Nuevo chat», participantes…). |
| Difuminar fotografías de contactos (RF-02) | Difuminado visual | Disponible · validado en Chrome (ampliación de `0.1.1-beta.0` validada en «Nuevo chat»; otros paneles sin comprobar) | Fotos y avatares predeterminados de la lista y del encabezado, y fotos de perfil en cualquier otra zona (panel de información, remitentes en grupos, foto propia). Desde `0.1.1-beta.0`, también los avatares SVG predeterminados en cualquier zona, como «Nuevo chat», que se revelan con su fila. No afecta a iconos, contadores ni imágenes de mensajes. |
| Difuminar mensajes recientes (RF-03) | Difuminado visual | Disponible · validado en Chrome (reloj pendiente) | Vista previa en la lista de chats, incluidas las especiales con iconos dentro (por ejemplo, «reaccionó con 👌 a:» con el icono de una foto), y su indicador de **leído** (`wds-ic-read`) cuando el último mensaje es propio. Enviado, entregado y pendiente, pendientes de diagnóstico. Silenciado, fijado, estados, mensajes temporales, stickers y contador de no leídos siguen visibles. |
| Difuminar mensajes de conversaciones (RF-04) | Difuminado visual | Disponible · validado en Chrome (reloj pendiente) | Texto, descripciones, multimedia (fotos, vídeos y miniaturas), hora y reacciones de los mensajes entrantes y salientes, y el indicador de **leído** de los enviados (`wds-ic-read` en `msg-meta`; los demás estados, pendientes de diagnóstico). El revelado abarca el mensaje completo. Desde `0.1.2-beta.0`, también el texto citado del recuadro «Responder» encima del editor (pendiente de validación real; las miniaturas citadas, pendientes de diagnóstico). Los botones de reaccionar, descargar, responder y reproducir, los demás iconos y los separadores siguen visibles. |
| Difuminar el campo de entrada de mensajes (RF-05) | Difuminado visual | Disponible · validado en Chrome | Se puede escribir, corregir, copiar y enviar con normalidad. |
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
| `npm run zip:<navegador>` | Genera el paquete `.zip` (`chrome`, `edge`, `firefox` o `safari`) con la versión en el nombre, por ejemplo `veilix-0.1.2-beta.0-chrome.zip`. |
| `npm run version:beta` | Siguiente versión previa: desde una estable inicia la beta del siguiente parche (`0.1.0` → `0.1.1-beta.0`), y desde una beta la incrementa (`0.1.1-beta.0` → `0.1.1-beta.1`). |
| `npm run version:parche-beta` / `version:menor-beta` | Primera beta del siguiente parche (`0.2.1-beta.0`) o de la siguiente versión menor (`0.3.0-beta.0`). |
| `npm run version:estable` | Convierte en estable la beta actual (`0.1.1-beta.5` → `0.1.1`). Ejecutar solo sobre una versión beta. |
| `npm run version:comprobar` | Falla si el código cambió respecto a `HEAD` (o a la referencia indicada) y la versión no, salvo una renumeración aprobada en `version-renumeraciones.json` para ese commit base. |

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

## Versionado

- **Fuente única de verdad:** el campo `version` de `package.json`, con [versionado semántico](https://semver.org/lang/es/). Durante el desarrollo se usan versiones `MAYOR.MENOR.PARCHE-beta.N`. Todo lo demás se calcula a partir de ella en [`src/version.ts`](src/version.ts).
- **Cambio de versión:** solo se cambia a mano, con los scripts `version:*`, que ejecutan `npm version --no-git-tag-version` y actualizan `package.json` y `package-lock.json` sin crear commits ni etiquetas. Compilar o empaquetar nunca cambia la versión.
- **Una versión por entrega:** cada entrega de prueba con cambios en el código (`src/`, `public/` o `wxt.config.ts`) recibe una versión nueva y una entrada en [CHANGELOG.md](CHANGELOG.md). `npm run version:comprobar` lo verifica en local, y la integración continua lo comprueba en cada *pull request*.

### Correspondencia con `manifest.version`

Las tiendas exigen una versión numérica, por eso SemVer se traduce así:

| SemVer | Chrome, Edge, Brave, Opera, Vivaldi y Firefox | `version_name` (solo Chromium) | Safari |
| --- | --- | --- | --- |
| `X.Y.Z-alpha.N` | `X.Y.Z.(1000+N)` | `X.Y.Z-alpha.N` | `X.Y.Z` |
| `X.Y.Z-beta.N` | `X.Y.Z.(2000+N)` | `X.Y.Z-beta.N` | `X.Y.Z` |
| `X.Y.Z-rc.N` | `X.Y.Z.(3000+N)` | `X.Y.Z-rc.N` | `X.Y.Z` |
| `X.Y.Z` (estable) | `X.Y.Z` | — | `X.Y.Z` |

Por ejemplo, `0.1.1` se compila como `0.1.1` en todos los navegadores, y `0.1.1-beta.2` como `0.1.1.2002` (Chromium y Firefox) o `0.1.1` (Safari).

- **Estables:** se compilan con el número exacto `X.Y.Z` en todos los navegadores, y son las únicas que se distribuyen en tiendas. Crecen estrictamente entre sí. Hasta `0.2.0-beta.8`, el esquema daba `X.Y.Z.4000` a las estables; cambió con la renumeración a `0.1.0`.
- **Versiones previas:** el cuarto componente da a cada compilación de prueba una versión distinta. `N` admite de 0 a 999.
  - Consecuencia aceptada: una versión previa queda numéricamente por encima de la estable con el mismo `X.Y.Z`. Por ejemplo, `0.1.1.2001` es mayor que `0.1.1`.
  - Por eso las versiones previas son **solo compilaciones internas**: se cargan sin empaquetar y nunca se suben a una tienda.
  - Quien tenga instalada una beta sin empaquetar (`0.1.1.200N`) puede cargar `0.1.1` desde la misma carpeta: Chrome no impide bajar de versión en extensiones sin empaquetar, y las preferencias se conservan mientras la ruta de la carpeta sea la misma, porque de ella depende el identificador de la extensión.
- **Firefox:** no admite `version_name`. Su panel muestra la versión SemVer completa, que se incluye al compilar.
- **Safari:** la app contenedora toma la versión del manifiesto como `CFBundleShortVersionString`, que admite como máximo tres números. Por eso Safari recibe `X.Y.Z` y las betas se distinguen por el número de compilación (`CFBundleVersion`) que se asigne al empaquetar en Xcode o App Store Connect. Este comportamiento está pendiente de comprobar en macOS.
- **Compilaciones anteriores:**
  - La Fase 1 usó el número `0.1.0` como hito interno de desarrollo; sigue así en los commits de `main` y `development`, sin etiquetas ni publicaciones.
  - Las compilaciones de la Fase 2 y de la ampliación multiplataforma también se generaron con `0.1.0` antes de existir el sistema de versionado. Esa entrega figura como `0.2.0-beta.1`, asignada retroactivamente.
  - Después llegaron las betas internas `0.2.0-beta.2` a `0.2.0-beta.8`.
  - Todo ello está en la sección «Historial de desarrollo anterior a 0.1.0» del CHANGELOG.

### Nombres y avatares fuera de la lista de chats (0.1.1-beta.0)

| Problema observado en Chrome real | Causa identificada en el código de `0.1.0` | Corrección |
| --- | --- | --- |
| Nombres de remitentes visibles sobre los mensajes de grupo con RF-01 activa | RF-01 solo tenía reglas para `#pane-side` y para `#main header`; nada alcanzaba el interior de los mensajes | Marcador de remitentes (`marcador-nombres.ts`): aprende los nombres de `data-pre-plain-text` y marca con `data-veilix-remitente` los elementos que los muestran (sobre los mensajes, en citas y respuestas, en el aviso fijado). Se revelan con el mensaje. No depende de RF-04. |
| Nombres visibles en «Nuevo chat» | Las filas de RF-01 solo se buscaban dentro de `#pane-side` | Marcador de filas de contacto fuera de la lista y de la conversación: fila con un avatar SVG y un `span[title]`. Marca `data-veilix-fila-contacto` y `data-veilix-nombre-contacto`. |
| Avatares predeterminados visibles en «Nuevo chat» | La estructura SVG de avatar (`<mask>` con `<image>` o `<foreignObject>`) solo se aplicaba en la lista y en el encabezado. Fuera de ellos, solo se reconocían fotos por su origen. | `AVATAR_SVG` se aplica en cualquier zona. Las filas de contacto se marcan con `data-veilix-fila-contacto-fotos`, un atributo propio de RF-02, para revelarlas con la fila. |

**Validación real de `0.1.1-beta.0` en Chrome (propietario):**

| Comprobación | Resultado |
| --- | --- |
| Remitentes en grupos | Correcto |
| Fotos y avatares en «Nuevo chat» | Correcto |
| Mensajes nuevos | Correcto |
| Revelado temporal | Correcto |
| Desactivación y restauración | Correcto |
| Nombres en «Nuevo chat» | **Falló** |

`0.1.1-beta.1` corrigió un defecto del marcador: no evaluaba como fila el propio nodo añadido al DOM. Aun así, en Chrome real los nombres de «Nuevo chat» seguían visibles.

**Diagnóstico real sobre `0.1.1-beta.1`:** 18 contactos, 0 nombres marcados, todos con `span[dir][title]` y ninguno con un avatar SVG de la estructura `AVATAR_SVG`. La estructura confirmada es:

`[data-testid="new-chat-drawer"]` › `[data-testid="contact-list-key"]` › `[role="listitem"][data-testid^="list-item-"]` › `[role="button"]` › `[data-testid="cell-frame-container"]` › `[role="gridcell"]`

Las acciones son `new-chat-drawer-new-group-cell`, `-new-contact-cell` y `-new-community-cell`.

**Causa confirmada:** las filas de contacto exigían exactamente un avatar SVG. `0.1.1-beta.2` añade un marcador propio para «Nuevo chat», basado en esa estructura y sin depender de avatares:
- Se limita al panel `new-chat-drawer`.
- Excluye las acciones.
- El nombre es el primer `span[dir][title]` sin iconos de la fila.

**Validación real de `0.1.1-beta.2`:** los nombres de «Nuevo chat» quedaron correctos visualmente. El propietario comunicó **una regresión en los remitentes de grupo** y que la información secundaria de los contactos de «Nuevo chat» sigue visible.

- **Regresión de remitentes (en investigación):** el marcador de remitentes no cambió desde `0.1.1-beta.0`, y en el DOM simulado beta.0 y beta.2 se comportan igual. Hace falta el diagnóstico de mensajes en el grupo afectado: tabla «reglas cargadas» y tabla «remitentes por mensaje».
- **Información secundaria (desde `0.1.1-beta.3`, aprobado por el propietario):** RF-01 difumina también los textos de cada contacto en «Nuevo chat» distintos del nombre: cualquier texto visible dentro de `[data-testid="cell-frame-container"]`, sin suponer sus atributos. Se excluyen iconos, botones, campos, acciones y encabezados de sección, y se revela con la fila.

**Validación real de `0.1.1-beta.3` en Chrome (propietario):**

| Comprobación | Resultado |
| --- | --- |
| Información secundaria de «Nuevo chat» | Correcto |
| Remitentes en grupos | Correcto |
| Regresiones | No se detectaron |

La regresión de remitentes comunicada con beta.2 no volvió a manifestarse. Su causa técnica sigue sin conocerse: el marcador de remitentes (`crearMarcadorRemitentes`) no cambió entre beta.2 y beta.3, que solo añadió el marcado de la información secundaria de «Nuevo chat».

Para confirmarlo sin exponer datos están:
- [`scripts/diagnostico-paneles.js`](scripts/diagnostico-paneles.js): la tabla de «Nuevo chat» muestra, para cada fila, cuántos `span[dir][title]` tiene, cuál se marcó como nombre (`posicionMarcada`), si está difuminado y qué textos quedan sin proteger (`textosSinProteger`; con beta.3 debería ser «—» en las filas de contacto).
- [`scripts/diagnostico-mensajes.js`](scripts/diagnostico-mensajes.js) (marca `MARCADO-REMITENTE`).

### Renumeración a 0.1.0 (aprobada)

El 16 de octubre de 2026 el propietario aprobó establecer `0.1.0` como primera versión definitiva, en sustitución de `0.2.0-beta.8` (opción B de la auditoría de cierre de la Fase 2). Así se resolvió cada conflicto, sin borrar ni reescribir el historial:

| Conflicto | Solución |
| --- | --- |
| `0.1.0` ya identificaba la Fase 1 (`HEAD` `a283fda` y `main` `9ba34bf`), sin etiquetas ni publicaciones | La Fase 1 figura en el CHANGELOG como hito interno que usó ese número durante el desarrollo, y conserva su registro original. Los commits, ramas y artefactos históricos no se tocan. |
| El manifiesto de una estable era `X.Y.Z.4000` | Las estables se compilan ahora como `X.Y.Z` exacto en todos los navegadores. |
| `version:comprobar` y el trabajo `version` de la integración continua fallaban | Excepción registrada en `version-renumeraciones.json`, con motivo y aprobación. Solo se aplica a la versión `0.1.0` comparada con esos dos commits base. Al confirmar el trabajo cambia el commit base, y la regla vuelve a exigir una versión nueva para cualquier cambio de código. |
| `0.1.0` es menor que `0.2.0-beta.8` | Las betas fueron compilaciones internas que no se publicaron. Las instalaciones de prueba («Cargar descomprimida» o complemento temporal) no comprueban la versión: basta con recargar la extensión. |

Antes de distribuir nada, hay que descartar cualquier paquete local antiguo llamado `veilix-0.1.0-*.zip` que se hubiera generado en la Fase 1, porque tendría el mismo nombre que los de la versión definitiva.

## Prueba manual

El procedimiento se describe con Chrome y se repite igual en el resto de navegadores. Las diferencias de cada uno están al final de esta sección.


1. Ejecutar `npm install` y `npm run build:chrome`.
2. Abrir `chrome://extensions`, activar el **modo de desarrollador** y pulsar **Cargar descomprimida** con la carpeta `.output/chrome-mv3`.
3. Fijar Veilix en la barra de herramientas y abrir [web.whatsapp.com](https://web.whatsapp.com) con la sesión iniciada.
4. Abrir el panel de Veilix. Las cinco funcionalidades de difuminado deben tener interruptor y las otras cuatro, la etiqueta «Pendiente».
5. Para cada funcionalidad, activarla sola y comprobar:
   - **Nombres:**
     - Se difuminan los nombres de la lista de chats y el del encabezado de la conversación abierta.
     - En un **grupo**, con RF-04 desactivada, comprobar los nombres de color sobre los mensajes, el de un contacto no guardado («~ Nombre»), un nombre con emoji, el autor de una respuesta o cita y el aviso de mensaje fijado.
     - Abrir **«Nuevo chat»**, buscar, desplazarse, cerrar y volver a abrir: los nombres de los contactos y su información (descripción o frase de estado) deben verse difuminados, y «Nuevo grupo», «Nuevo contacto», «Nueva comunidad», los encabezados de sección y el buscador, visibles.
   - **Fotografías:** comprobar contactos y grupos, con foto personalizada y sin foto (avatar predeterminado), en la lista de chats, el encabezado, el panel de información del contacto o grupo, los remitentes de un chat de grupo, los paneles de *Nuevo chat* y *Archivados*, y la foto propia. Los iconos (silenciado, fijado, menú…), los contadores de no leídos y las fotos enviadas en los mensajes no deben difuminarse. Desplazar la lista y recibir mensajes con RF-02 activa.
   - **Mensajes recientes:**
     - Se difuminan las vistas previas y, en los chats cuyo último mensaje es tuyo y está leído, el indicador de leído junto a ellas. Los iconos de silenciado, fijado, mensajes temporales y sticker y el contador de no leídos siguen visibles.
     - Pedir a otra persona que envíe un mensaje y comprobar que la nueva vista previa aparece difuminada y que sigue así cuando el chat sube al principio.
     - Enviar un mensaje y observar el indicador al pasar por pendiente, enviado, entregado y leído. Solo el de leído está confirmado; si los demás quedan visibles, ejecutar el diagnóstico de mensajes en cada estado.
   - **Mensajes de conversaciones:**
     - En un chat individual y en un grupo, comprobar que se difuminan el texto recibido y el enviado, las fotos, las fotos con descripción, los vídeos y las fotos aún no descargadas.
     - Comprobar que también se difuminan la hora, las reacciones (emojis bajo el mensaje) y el indicador de leído de los mensajes enviados.
     - Pasar el cursor por cualquier parte del mensaje, incluida la reacción, debe revelar el mensaje completo.
     - Comprobar que siguen visibles y funcionan los botones de reaccionar, descargar, responder y reproducir y los separadores de fecha.
     - Desplazarse hacia arriba para cargar mensajes antiguos, recibir mensajes nuevos y cambiar de conversación.
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

### Diagnóstico anonimizado de avatares

Si alguna foto sigue visible con RF-02 activa:

1. Abre la consola de las herramientas de desarrollo en WhatsApp Web.
2. Pega el contenido de [`scripts/diagnostico-avatares.js`](scripts/diagnostico-avatares.js) y pulsa Intro.

El fragmento solo lee el DOM. No hace peticiones ni muestra nombres, textos, `title`, `aria-label`, `alt` ni direcciones completas. Lista las imágenes, fondos e iconos de al menos 20 px, con su zona, sus atributos, su ascendencia, el patrón de su origen y si están difuminados. Revisa el resultado y comparte las filas marcadas con `difuminado: NO`.

### Diagnóstico anonimizado de paneles («Nuevo chat»)

Si algún nombre o avatar de «Nuevo chat» u otro panel con contactos sigue visible:

1. Abre el panel con RF-01 y RF-02 activas.
2. En la consola, pega [`scripts/diagnostico-paneles.js`](scripts/diagnostico-paneles.js) y pulsa Intro.

Para cada fila candidata fuera de la lista de chats y de la conversación muestra:
- Su elemento y su ascendencia: etiquetas, `role`, `data-testid`, `data-animate-drawer` e identificadores conocidos.
- Cuántos avatares SVG contiene y su estructura.
- Los iconos `wds-ic-…`.
- Los `span[title]`, solo con su longitud.
- Las marcas de Veilix y si el nombre y el avatar están difuminados.

No muestra nombres ni textos.

### Diagnóstico anonimizado de la lista de chats

Si alguna vista previa (por ejemplo, una reacción) sigue visible con RF-03 activa:

1. En la consola, pega [`scripts/diagnostico-lista-chats.js`](scripts/diagnostico-lista-chats.js) y pulsa Intro.
2. Comparte el resultado.

Para cada fila muestra:
- Qué ha marcado Veilix: nombre, vista previa y estado.
- Cuántos textos visibles quedan sin proteger, excluidos el nombre, la hora y los contadores.
- El esqueleto de las filas con textos sin proteger: etiquetas, presencia de `title`, `dir` y `aria-label`, longitud del texto, emojis y nombres de icono `wds-ic-…`.

No muestra textos, nombres ni emojis concretos.

### Diagnóstico anonimizado de mensajes

Si algún contenido de mensaje sigue visible con RF-04 activa, o algún control aparece difuminado:

1. Abre un chat de grupo que tenga texto, fotos con descripción y mensajes enviados.
2. En la consola, pega [`scripts/diagnostico-mensajes.js`](scripts/diagnostico-mensajes.js) y pulsa Intro.

Muestra, para cada `[data-testid="msg-container"]`:
- Un resumen: dirección (enviado o recibido), bloques de texto, tipos de imagen, iconos y botones.
- Los iconos de la lista de chats y de la conversación agrupados por nombre, tanto `data-icon` como el `<title>` de los SVG (solo identificadores `wds-ic-…`), con cuántos están difuminados o marcados.
- El contenido de cada `msg-meta`: nombres de sus iconos y etiquetas de estado conocidas («Leído», «Entregado»…).

Para identificar los indicadores de enviado, entregado y pendiente, ejecútalo con mensajes en cada estado. Para el pendiente, por ejemplo, desactiva la red un momento y envía un mensaje.
- El esqueleto de su estructura: etiquetas, `role`, `data-testid`, `data-icon`, clases semánticas y si cada elemento está difuminado.

No muestra textos, nombres, identificadores ni direcciones. Del texto solo indica la longitud, si parece una hora y si coincide con el nombre del remitente de `data-pre-plain-text`; esto último sirve para localizar el nombre del remitente en los grupos (RF-01).

### Diagnóstico anonimizado del recuadro «Responder»

Para el [recuadro «Responder»](#recuadro-responder-corrección-en-012-beta0). Con `0.1.2-beta.0`, el texto citado debería aparecer como `· difuminado`:

1. Abre una conversación con RF-01, RF-04 y RF-05 activadas.
2. Pulsa «Responder» sobre un mensaje y, con el recuadro abierto, pega [`scripts/diagnostico-respuesta.js`](scripts/diagnostico-respuesta.js) en la consola y pulsa Intro.
3. Repite la ejecución en cuatro casos: un mensaje recibido en un chat individual, un mensaje propio, un mensaje de un grupo y una foto o un vídeo.

Muestra:
- Los elementos de `#main` con texto o imagen que están fuera de las filas de mensaje, con su ascendencia y si están en `footer`.
- Si cada texto coincide con un remitente o con el inicio de un mensaje visible (sin mostrar ninguno de los dos), y si está difuminado y con qué marcas de Veilix.
- Los botones del pie, con sus iconos (`wds-ic-…` y `data-icon`), para confirmar que la X de cancelar no se difumina.
- El esqueleto del pie que contiene el recuadro y el editor.

No muestra textos, nombres, `data-id`, `title`, `aria-label`, `alt` ni direcciones, y no recorre el contenido del editor. De las imágenes indica solo si son `blob:`, `data:` o de un dominio de WhatsApp, sin nombrar otros dominios. Los `data-testid` se anonimizan.

## Verificación pendiente en WhatsApp Web real

WhatsApp Web solo muestra la interfaz de chats con una sesión iniciada, y desde el entorno de desarrollo no se puede inspeccionar. Por eso **ninguna funcionalidad se considera compatible hasta que el propietario la compruebe**. Las suposiciones que hay que confirmar son:

| Suposición | Afecta a |
| --- | --- |
| La lista de chats está en `#pane-side` y cada fila tiene `role="listitem"` o `role="row"`. | RF-01, RF-02, RF-03 |
| En cada fila, el nombre es el primer `span[title]` y la vista previa son los demás `span[title]` o `span[dir]`. | RF-01, RF-03 |
| La conversación abierta está en `#main`, con `header` y `footer`. | RF-01, RF-02, RF-04, RF-05 |
| ~~Las burbujas usan las clases `message-in` y `message-out`~~. **Descartado** (Chrome, diagnóstico real): hay 0 elementos con esas clases. | RF-04 |
| **Confirmado** (Chrome, diagnóstico real): cada mensaje es un `[data-testid="msg-container"]` dentro de `#main`, con un bloque de texto `[data-pre-plain-text]`. | RF-04 |
| La hora es el elemento más interno cuyo texto completo tiene formato de hora (`10:40`, `10:40 p. m.`), dentro de la fila del mensaje. Los indicadores de lectura son iconos `data-icon` separados de ella. | RF-04 |
| ~~Los indicadores de estado son iconos con `data-icon` (`msg-check`, `status-dblcheck`…)~~. **Descartado** (Chrome, diagnóstico real): el nombre de los iconos está en el `<title>` del SVG. | RF-03, RF-04 |
| **Confirmado** (Chrome, diagnóstico real): el indicador de leído es `<svg><title>wds-ic-read</title>…</svg>`, en `#pane-side` y dentro de `[data-testid="msg-meta"]` (con `aria-label=" Leído "`). | RF-03, RF-04 |
| **Sin evidencia:** los nombres de los indicadores de enviado, entregado y pendiente. | RF-03, RF-04 |
| En la lista, el indicador de estado comparte bloque con la vista previa y no con el nombre del chat. | RF-03 |
| Las vistas previas especiales (reacciones, fotos…) están dentro de un `span[title]` o `span[dir]`, con su texto y sus iconos en el mismo elemento. Si estuvieran en `span` sin esos atributos, no se detectarían. | RF-03 |
| Las reacciones son elementos cuyo contenido son solo emojis (texto o `<img>` con `alt` de emoji) y un contador, sin iconos. Están dentro de `msg-container` o de su fila `[data-id]`. | RF-04 |
| La fila `[data-id]` es el antecesor de `msg-container` y agrupa todo el mensaje. | RF-04 |
| La descripción de una foto es un `.selectable-text` sin `[data-pre-plain-text]`. | RF-04 |
| La multimedia de los mensajes se carga como `blob:`, y las miniaturas sin descargar como `data:image/jpeg`. Los emojis de reacciones usan otro origen. | RF-04 |
| El editor es un elemento `contenteditable` o `role="textbox"` dentro de `#main footer`. | RF-05 |
| **Confirmado (Chrome, diagnóstico real):** en `#pane-side`, los avatares son `<svg>` con `<mask>` y `<circle>` que contienen `<image>` o `<foreignObject>`. Queda por confirmar que el `<foreignObject>` corresponde a los avatares sin foto, y que el encabezado y otras zonas usan la misma estructura. | RF-02 |
| Las fotos de perfil se sirven desde `pps.whatsapp.net` o con una ruta que contiene `/t61.24694-24/`, como `<img>`, como `<image>` dentro de un SVG o como imagen de fondo en línea. Las imágenes de los mensajes usan otros orígenes. | RF-02 |
| Los avatares sin foto son iconos con `data-icon` que empieza por `default-user`, `default-group`, `default-contact` o `default-community`. | RF-02 |
| Los iconos funcionales usan `data-icon` o SVG, y los emojis de nombres y vistas previas están dentro de `span[title]` o `span[dir]`. | RF-02 |
| Las filas y los mensajes pueden recibir foco con el teclado. | Revelado con foco |
| Ctrl + Mayús + Espacio no entra en conflicto con atajos de WhatsApp, del navegador o del sistema operativo. | Revelado con teclado |

## Matriz de compatibilidad

Estado a 22 de octubre de 2026 (versión `0.1.2-beta.0`). Las columnas distinguen tres tipos de evidencia:

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

- **Motor de difuminado (simulado):** las 126 pruebas de `tests/navegador` en cada motor:

  | Archivo | Pruebas |
  | --- | --- |
  | Motor general | 21 |
  | Avatares de RF-02 | 21 |
  | Mensajes | 21 |
  | Nombres y avatares fuera de la lista | 24 |
  | Indicadores de estado | 13 |
  | Vistas previas especiales | 9 |
  | Crédito del panel | 5 |
  | Recuadro «Responder» | 12 |
 Comprueban el CSS calculado, el revelado con cursor, Tab y atajo, la escritura, los clics y los cambios dinámicos.
- **Extensión cargada (simulado):** `npm run test:extension`. Carga el paquete compilado, lo usa desde su panel real, bloquea la red y sirve una página simulada en `web.whatsapp.com`. Playwright solo puede cargar extensiones en Chromium.
- **WebKit de Playwright no es Safari:** comparte el motor de renderizado, pero no la integración de extensiones de Safari (permisos por sitio, almacenamiento, ventana emergente), ni el sistema macOS ni la versión exacta de Safari.

Cuando se pruebe una combinación real, sustituye ⏳ por ✅ o ❌ e indica la versión del navegador, el sistema y la fecha.

**Chrome, sistema operativo sin indicar:**
- ✅ Validación funcional del propietario con `0.2.0-beta.8` (RF-01 a RF-05).
- ✅ Validación parcial de `0.1.1-beta.0` y `0.1.1-beta.2`.
- ✅ `0.1.1-beta.3`: información secundaria de «Nuevo chat», remitentes en grupos y sin regresiones. La regresión de remitentes de beta.2 no volvió a manifestarse; su causa sigue sin conocerse.
- ⏳ `0.1.1` (y los cambios visuales de beta.4 y beta.5) sin probar.

La celda del sistema correspondiente se marcará cuando se indique cuál es. El indicador de reloj sigue pendiente.

**Observaciones de pruebas reales comunicadas por el propietario** (pendientes de formalizar en la matriz):

- **Brave, primera prueba real con WhatsApp Web** (sistema y versión sin indicar):
  - RF-01 y RF-03 parecen funcionar. Esto apunta a que `#pane-side`, las filas con `role` y la heurística de nombre y vista previa son correctas.
  - RF-02 dejaba fotografías visibles. Se ha corregido, pero la corrección está **pendiente de verificación real**.
- **Chrome con 0.2.0-beta.2, diagnóstico anonimizado de avatares** (sistema sin indicar):
  - En `#pane-side` hay 16 `<svg>` de unos 48 × 48 px, todos con `<mask>` y `<circle>`. De ellos, 12 contienen `<image>` y 4 `<foreignObject>`.
  - Ninguno estaba difuminado. Era la causa de las fotos visibles, porque la regla solo cubría `<img>`.
  - En 0.2.0-beta.3 se difuminan estos SVG. La corrección está **pendiente de prueba real en Chrome**.
- **Chrome con 0.2.0-beta.3, diagnóstico de mensajes en `#main`** (sistema sin indicar):
  - RF-04 no difuminaba el texto ni las fotos.
  - El diagnóstico encontró 0 `.message-in` y 0 `.message-out`, frente a 3 `[data-testid="msg-container"]`, 3 `[data-pre-plain-text]`, 25 `.copyable-text`, 4 `[data-id]`, 2 `[data-testid*="message"]` y 21 `img`.
  - En 0.2.0-beta.4, RF-04 usa `msg-container`. La corrección está **pendiente de prueba real**.
  - Los nombres de remitentes en grupos siguen visibles con RF-01. Para cubrirlos hace falta el diagnóstico de mensajes.
- **Chrome, vista previa de reacción** (versión anterior a 0.2.0-beta.8):
  - Una vista previa «reaccionó con 👌 a:» con el icono de una foto quedaba visible con RF-03.
  - En 0.2.0-beta.8 se protegen las vistas previas que contienen iconos. La corrección está **pendiente de prueba real**.
- **Chrome con 0.2.0-beta.6, indicadores de lectura:**
  - RF-03 difuminaba las vistas previas, pero no los indicadores de lectura.
  - En `#pane-side` había 44 SVG con el nombre en `<title>`: `wds-ic-read` (4 visibles, ninguno difuminado), `wds-ic-status`, `wds-ic-disappearing-messages`, `wds-ic-whatsapp` y `wds-ic-sticker`.
  - En la conversación se identificaron `[data-testid="msg-meta"]`, `<title>wds-ic-read</title>` y `aria-label=" Leído "`.
  - En 0.2.0-beta.7 se difumina `wds-ic-read`. La corrección está **pendiente de prueba real**.

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
    ├── componentes/           Selector de tema, tarjeta de funcionalidad, logotipo, crédito y bandera
    ├── use-preferencias.ts    Hook de carga, observación y guardado
    └── estilos/panel.css      Tokens de color, tema claro y oscuro
public/icon/                   Iconos (candado) generados con scripts/generar-iconos.mjs
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
- **Navegador (`npm run test:navegador`, Chromium, Firefox y WebKit):** las mismas 36 pruebas en cada motor. Comprueban el `filter` calculado sobre cada objetivo y cada control (incluidos los tipos de avatar de RF-02: foto personalizada, imagen de fondo, avatar predeterminado de contacto y de grupo, panel de información, remitentes en grupos y foto propia), el revelado con cursor, Tab y el atajo, la restauración, la escritura en el editor, los clics en controles difuminados, los cambios dinámicos y la desactivación. WebKit de Playwright no equivale a Safari.
- **Extensión (`npm run test:extension`, Chromium):** carga `.output/chrome-mv3` con la red bloqueada y sirve una página simulada en `https://web.whatsapp.com/`. Activa las funciones desde el panel real, comprueba el difuminado en caliente, la persistencia tras recargar y que no hay peticiones externas. Comprueba también que el paquete incluye los iconos de `public/icon` y que el crédito del pie aparece tras la versión, con la bandera SVG de 12 × 8 px y sin desplazamiento horizontal, en el emergente y en la página de opciones (temas claro y oscuro). Guarda capturas del panel y de las opciones en `.output/capturas/`.

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
- **Vistas previas especiales (RF-03).**
  - Se corrigió la causa más probable: las vistas previas que contenían un icono se descartaban enteras.
  - Si en el DOM real el texto de la reacción está en un `span` sin `title` ni `dir`, seguirá visible y hará falta el [diagnóstico de la lista](#diagnóstico-anonimizado-de-la-lista-de-chats).
  - Un icono de contenido situado fuera del elemento de la vista previa tampoco se protege, porque no puede distinguirse de los iconos ajenos sin conocer su nombre.
- **Indicadores de estado (RF-03 y RF-04).**
  - Solo se reconoce el indicador de **leído** (`wds-ic-read`), confirmado por el diagnóstico real. Los de enviado, entregado y pendiente **siguen visibles** hasta que un diagnóstico muestre sus nombres. No se han inventado.
  - En la lista, el indicador debe compartir bloque con la vista previa y no con el nombre del chat (heurística). En la conversación, debe estar dentro de `msg-meta`.
  - Fuera de esas zonas no se difumina ningún icono, aunque se llame `wds-ic-read`.
- **Mensajes (RF-04).**
  - El contenedor `[data-testid="msg-container"]` y el bloque `[data-pre-plain-text]` están confirmados por el diagnóstico real. El resto son hipótesis: descripciones como `.selectable-text`, multimedia por su origen `blob:` o `data:image/jpeg`, y la fila `[data-id]` como mensaje completo.
  - La hora y las reacciones se marcan con una heurística sobre la forma del texto (formato de hora; solo emojis y contador), que se reevalúa con cada cambio del mensaje. Pueden escaparse formatos de hora no contemplados (por ejemplo, con segundos) y reacciones que incluyan texto o iconos. Un elemento del mensaje formado solo por emojis fuera del texto (por ejemplo, un nombre de remitente compuesto solo de emojis) también se difuminaría.
  - No se cubren las encuestas, los contactos compartidos, la ubicación, los documentos (nombre de archivo) ni las notas de voz, salvo que incluyan alguno de los elementos anteriores.
  - El revelado se delimita por mensaje.
- **Nombres de remitentes en la conversación (RF-01, desde `0.1.1-beta.0`).**
  - Se reconocen comparando el texto visible con los nombres de `data-pre-plain-text` de la conversación abierta. El atributo está confirmado, pero el formato «[hora, fecha] Nombre: » es una hipótesis. Si no coincide, no se difumina nada.
  - El remitente de un mensaje **sin texto** (por ejemplo, una foto sin descripción) solo se reconoce si esa persona tiene otro mensaje con texto visible en la conversación.
  - Un nombre que forma parte de un texto más largo (por ejemplo, «Ana: hola» en un único elemento) no se reconoce.
  - En contactos no guardados se reconoce el nombre que figura en `data-pre-plain-text` (con o sin «~»). Si WhatsApp muestra además otro dato, como el nombre público junto al número, ese dato puede quedar visible.
- **Filas de contacto fuera de la lista de chats (RF-01 y RF-02, desde `0.1.1-beta.0`).**
  - **«Nuevo chat» (desde `0.1.1-beta.2`, estructura confirmada):** filas `[role="listitem"][data-testid^="list-item-"]` dentro de `[data-testid="new-chat-drawer"]`, sin las acciones `new-chat-drawer-new-*`. El nombre es el primer `span[dir][title]` sin iconos. Desde `0.1.1-beta.3`, el resto de textos de `cell-frame-container` también se difumina, así que aunque el nombre no fuera el primero, todo el texto del contacto queda protegido. Un texto funcional dentro de la celda que no sea un botón, un icono o un campo (por ejemplo, una etiqueta de estado de la app) también se difuminaría.
  - **Otros paneles (hipótesis sin confirmar):** filas con rol `listitem`, `row` o `button` que contienen exactamente un avatar SVG y un `span[title]`. En «Nuevo chat» esta regla no se cumplía, porque sus filas no contienen avatares SVG.
  - Una fila de acción dibujada con un avatar de esa estructura (por ejemplo, «Nuevo grupo» con un círculo de máscara) vería su texto difuminado.
  - Fuera de «Nuevo chat», la línea de información del contacto (estado o «Disponible») no se protege.
- **Fotografías (RF-02).**
  - En la lista de chats, el selector de avatares SVG (`<svg>` con máscara y `<image>` o `<foreignObject>`) se basa en el DOM real observado.
  - En el encabezado, el selector SVG se aplica por la misma estructura, pero no está observado en el DOM real.
  - En otras zonas, los avatares se reconocen por el origen de la foto (una hipótesis) y, desde `0.1.1-beta.0`, también por la estructura SVG confirmada en la lista, aplicada a cualquier zona. Se supone que «Nuevo chat» y otros paneles usan el mismo componente de avatar. Un SVG con esa misma estructura que no fuera un avatar también se difuminaría.
  - Fuera de la lista y del encabezado, el revelado por foco de teclado no está disponible; sí el cursor y Ctrl + Mayús + Espacio.
  - No se cubren los avatares en `<canvas>` ni las imágenes de fondo aplicadas desde hojas de estilo (solo las que van en el atributo `style`).
- **Recuadro «Responder» (RF-04, desde `0.1.2-beta.0`).** Se difumina el texto citado con la estructura confirmada. Las miniaturas de fotos y vídeos citados siguen visibles hasta confirmar su estructura. El autor solo se difumina con RF-01 si coincide con un remitente de `data-pre-plain-text` (no la etiqueta «Tú»). Ver [Recuadro «Responder»](#recuadro-responder-corrección-en-012-beta0).
- **Carga inicial.** Leer las preferencias es asíncrono. Si WhatsApp pintara antes de esa lectura, el contenido podría verse unos milisegundos.
- **Atajo de teclado.** Si se suelta Ctrl o Mayús manteniendo pulsado el Espacio, la repetición automática del Espacio puede escribir espacios en el editor.
- **Avisos de `web-ext lint`.** Muestra dos avisos `UNSAFE_VAR_ASSIGNMENT` que vienen del código interno de `react-dom`, no de Veilix, que no usa `dangerouslySetInnerHTML`.
- **`npm audit`.** Informa de una vulnerabilidad en `node-forge`, que llega como dependencia de `web-ext` a través de `@devicefarmer/adbkit`. Todavía no existe versión corregida. Solo afecta a las herramientas de desarrollo y no se incluye en la extensión. `shell-quote` se ha forzado a 1.12.0 mediante `overrides`.
- **Codespaces.** No se puede probar WhatsApp Web real porque requiere una sesión iniciada. Tampoco hay Windows, macOS, Edge, Brave, Opera, Vivaldi ni Safari. Las pruebas del motor se ejecutan en los motores de Playwright (Chromium, Firefox y WebKit) sobre Linux, y la extensión cargada solo en Chromium.
- **Safari.** No se ha ejecutado nunca y el trabajo `safari-macos` aún no se ha lanzado. En Safari, el revelado por foco requiere **Opción + Tab**, salvo que se cambie el ajuste correspondiente.
- **Opera y Vivaldi.** No se han evaluado los paneles laterales de WhatsApp integrados en estos navegadores.
- **Atajo multiplataforma.** No se ha comprobado si Ctrl + Mayús + Espacio choca con atajos de Vivaldi u Opera, con el cambio de distribución del teclado de Windows ni con los métodos de entrada de Linux y macOS.

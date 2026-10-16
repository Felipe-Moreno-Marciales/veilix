# AGENTS.md — Guía para agentes y colaboradores

Instrucciones para cualquier agente (Codex, Claude u otros) o persona que trabaje en este repositorio. Complementan el [README](README.md).

## Contexto

Veilix es una extensión de privacidad para WhatsApp Web, construida con WXT, React y TypeScript sobre Manifest V3. Está dirigida a Chrome, Edge, Firefox, Brave, Opera y Vivaldi (en Windows, Linux y macOS) y a Safari en macOS. El estado de cada combinación está en la matriz de compatibilidad del README.

- **Fase 1 (infraestructura):** completada y aprobada.
- **Fase 2 (motor de difuminado, RF-01 a RF-05):** implementada y **validada funcionalmente en Google Chrome** por el propietario con `0.2.0-beta.8`. La versión final es **`0.1.0`** (renumeración aprobada, sin publicar). El cierre formal depende de la aprobación y los commits del propietario.
- **Fase 3:** no iniciada. No se empieza sin aprobación explícita.
- **Ampliación multiplataforma:** paquetes y pruebas automatizadas preparados. Ninguna combinación de navegador y sistema operativo se ha probado aún con WhatsApp Web real, y Safari no se ha ejecutado nunca.
- Las otras cuatro funcionalidades siguen pendientes.

## Reglas obligatorias

1. **Ramas.** Se trabaja en `development`. Nunca se modifica `main` directamente y no se hace *push* ni se publica sin autorización expresa. Las reglas completas están en [Control de versiones](#control-de-versiones-reglas-permanentes).
2. **Alcance.** Solo se implementan las nueve funcionalidades del catálogo (`src/funcionalidades/catalogo.ts`). Cualquier funcionalidad nueva necesita aprobación previa.
3. **Privacidad.**
   - No se añade telemetría, analítica ni registro remoto de errores.
   - Ningún dato de WhatsApp se envía a servidores externos. ESLint bloquea `fetch`, `XMLHttpRequest`, `WebSocket` y `EventSource` en `src/`.
   - No se almacenan conversaciones salvo en «Restaurar mensajes eliminados», y siempre con consentimiento explícito, solo en local y con opción de borrado.
4. **Mínimo privilegio.** No se añaden permisos ni `host_permissions` sin justificarlo y documentarlo. La prueba `tests/manifiesto.test.ts` vigila los permisos.
5. **Honestidad en la interfaz.** Una funcionalidad con `estado: 'pendiente'` no puede mostrar interruptores ni controles que aparenten funcionar.
6. **Idioma.** La documentación, los comentarios, los mensajes de interfaz y los identificadores propios se escriben en español. Se conservan los identificadores que imponen las herramientas, como `defineConfig`, `main`, los hooks `use*` o las claves del manifiesto.
7. **Seguridad del código.** No se usa `eval`, `new Function`, `innerHTML` ni `dangerouslySetInnerHTML`, y no se carga código remoto. Todo dato leído del almacenamiento o del DOM se considera no confiable.
8. **Compatibilidad honesta.** Nunca se declara compatible con WhatsApp Web una funcionalidad que solo se ha probado con el DOM simulado. Tampoco se inventan selectores sin indicarlo. Los selectores sin verificar se documentan como hipótesis en `selectores.ts` y en el README.
9. **Protecciones solo visuales.** Las funciones de difuminado no modifican, eliminan ni reemplazan el texto o los nodos de WhatsApp. Solo añaden elementos `<style>` propios y atributos `data-veilix-*`, y lo eliminan todo al desactivarse.
10. **Compatibilidad entre navegadores.** Se aplican las reglas de la sección [Compatibilidad multiplataforma](#compatibilidad-multiplataforma).

## Control de versiones (reglas permanentes)

Estas reglas se aplican a Codex y a cualquier otro agente que trabaje en el repositorio, y prevalecen sobre cualquier otra instrucción, salvo una autorización explícita del propietario.

### Qué puede hacer el agente

1. **Gestionar archivos.** Puede crear, editar, eliminar y organizar los archivos que necesite para el desarrollo.
2. **Ejecutar verificaciones.** Puede ejecutar compilaciones, pruebas automatizadas, verificaciones de seguridad y análisis de código.

### Qué tiene prohibido sin autorización explícita del propietario

3. **Operaciones de Git.** No puede ejecutar `git add`, `git commit`, `git push`, `git merge` ni `git rebase`, ni crear, eliminar, renombrar o cambiar de rama. Sí puede usar comandos de solo lectura, como `git status`, `git diff`, `git log` o `git branch --show-current`.

### Flujo de trabajo por fases

4. **Entrega de cada fase.** Al terminar una fase, el agente entrega un informe técnico completo y deja todos los cambios sin confirmar en el árbol de trabajo. El informe incluye:
   - Archivos creados y modificados.
   - Cambios de arquitectura.
   - Dependencias.
   - Resultados de las pruebas y las compilaciones.
   - Limitaciones y tareas pendientes.
5. **Revisión del propietario.** El propietario revisa y aprueba cada fase a mano, y después hace él mismo los *commits* y el *push*.
6. **Inicio de una fase nueva.** No se empieza una fase nueva sin aprobación explícita del propietario.

### Ramas

7. **Rama de trabajo.** La rama de desarrollo es `development`. La rama `main` permanece protegida frente a modificaciones no autorizadas.

## Versionado

1. **Fuente única.** La versión vive solo en `package.json` (SemVer, con `-beta.N` durante el desarrollo). No se escribe a mano en el manifiesto, el código ni la interfaz: se obtiene de `src/version.ts`.
2. **Una versión por entrega.** Cada entrega con cambios en `src/`, `public/` o `wxt.config.ts` recibe una versión nueva. Normalmente es `npm run version:beta`; los scripts `version:*` no ejecutan operaciones de Git. Además, la entrega se registra en `CHANGELOG.md`, bajo una sección `## [versión] — fecha` en español. Si solo cambian documentación o pruebas, la versión puede mantenerse.
3. **Sin incrementos automáticos.** Compilar, empaquetar o probar nunca cambia la versión. Volver a compilar el mismo código produce la misma versión.
4. **Comprobación.** `npm run version:comprobar` debe pasar antes de entregar. El informe de cada entrega indica la versión.
5. **Sin reutilizar versiones.** Un número de versión no se reasigna a un código distinto, ni la versión retrocede respecto a versiones ya entregadas, sin una decisión explícita del propietario que lo documente. Nunca se desactiva `version:comprobar` ni las pruebas de versionado para lograrlo.
6. **Renumeraciones.** La única excepción vigente es la de `0.1.0`, registrada en `version-renumeraciones.json` y limitada a los commits base `a283fda` (`development`) y `9ba34bf` (`main`). Un agente nunca añade, amplía ni modifica entradas de ese archivo sin aprobación expresa del propietario. La prueba `tests/version.test.ts` falla si el registro cambia.
7. **Manifiesto.** Una estable se compila como `X.Y.Z` exacto en todos los navegadores. Las versiones previas (`-alpha`, `-beta`, `-rc`) usan un cuarto componente y son solo compilaciones internas: nunca se suben a una tienda.
8. **Después de `0.1.0`.** La siguiente entrega con cambios de código empieza con `npm run version:beta` (`0.1.0` → `0.1.1-beta.0`) o con `npm run version:menor-beta` (`0.2.0-beta.0`). Antes de elegir, hay que tener en cuenta que el historial ya contiene compilaciones internas `0.2.0-beta.1` a `0.2.0-beta.8`. La siguiente versión menor debe elegirse de modo que no repita esos números.

## Compatibilidad multiplataforma

1. **Una sola base de código.** No se crean ramas ni copias del código por navegador. Las diferencias de manifiesto se concentran en `ajustesPorNavegador` (`wxt.config.ts`).
2. **Paquetes.**
   - `chrome-mv3` sirve para Chrome, Brave, Opera y Vivaldi.
   - `edge-mv3` es para Edge.
   - `firefox-mv3` es para Firefox.
   - `safari-mv3` es para Safari en macOS.
3. **Sin APIs exclusivas.** Los módulos solo usan CSS y APIs DOM estándar. Antes de usar una API nueva hay que comprobar que la admiten las versiones mínimas declaradas: Chromium 116, Firefox 140 y Safari 17.4. Si no, se suben las versiones mínimas, se documenta y se actualiza `tests/manifiesto.test.ts`.
4. **Sin suposiciones de sistema operativo.** Los atajos usan `KeyboardEvent.code` y una combinación válida en Windows, Linux y macOS. No se asume la tecla Comando ni la distribución del teclado.
5. **Tipos de evidencia.** Hay tres, y no se mezclan:
   - **Compilación:** se genera un paquete válido.
   - **Pruebas simuladas:** Playwright con el DOM simulado.
   - **Prueba real:** la extensión instalada en ese navegador y sistema, usada con WhatsApp Web real.

   **WebKit de Playwright no es Safari**, y el motor Chromium de Playwright no es Edge, Brave, Opera ni Vivaldi.
6. **Matriz.** Cualquier cambio de compatibilidad actualiza la matriz del README. Solo el propietario marca una prueba real como superada.
7. **Safari.** Solo se compila en Linux. Para empaquetar hace falta macOS con Xcode (`xcrun safari-web-extension-packager`) o el empaquetador de App Store Connect. El trabajo `safari-macos` de la integración continua es manual y experimental.

## Mapa del código

| Ruta | Responsabilidad |
| --- | --- |
| `wxt.config.ts` | Manifiesto y diferencias entre navegadores (`ajustesPorNavegador`) |
| `src/version.ts` | Versión (desde `package.json`) y su traducción a `manifest.version`, `version_name` y texto del panel |
| `CHANGELOG.md` | Historial de versiones |
| `version-renumeraciones.json` | Registro de renumeraciones aprobadas por el propietario (solo `0.1.0`) |
| `scripts/comprobar-cambio-version.mjs` | Comprueba que una entrega con cambios de código tiene versión nueva |
| `src/funcionalidades/catalogo.ts` | Identificadores, textos, categorías y estado de cada funcionalidad |
| `src/funcionalidades/modulos/*.ts` | Un módulo por funcionalidad (contrato `ModuloFuncionalidad`) |
| `src/funcionalidades/registro.ts` | Registro de módulos que usa el gestor |
| `src/nucleo/gestor-modulos.ts` | Activación y desactivación según las preferencias, con aislamiento de errores |
| `src/nucleo/difuminado/selectores.ts` | **Único** lugar con selectores de WhatsApp Web (hipótesis pendientes de validar) |
| `src/nucleo/difuminado/` | Motor de difuminado: generación de CSS, fábrica de módulos, marcadores (lista de chats y su indicador de estado; hora, reacciones e indicador de estado de los mensajes), reconocimiento de iconos por `<title>` (`iconos-estado.ts`), observador compartido y atajo de revelado |
| `src/almacenamiento/` | Modelo, normalización y persistencia de las preferencias (`storage.local`) |
| `src/ui/` | Panel de configuración (emergente y página de opciones) |
| `src/entrypoints/` | Puntos de entrada de WXT: `popup`, `options` y `whatsapp.content` |
| `tests/` | Pruebas unitarias con Vitest, que usa `fakeBrowser` mediante `WxtVitest` |
| `tests/navegador/` | Pruebas en Chromium, Firefox y WebKit (Vitest Browser + Playwright) |
| `tests/apoyo/whatsapp-simulado.ts` | DOM simulado de WhatsApp Web (hipótesis, no la interfaz real) |
| `scripts/verificar-extension.mjs` | Verificación de extremo a extremo de la extensión compilada, con la red bloqueada |
| `scripts/diagnostico-lista-chats.js` | Fragmento de consola con un diagnóstico **anonimizado** de las filas de la lista de chats (RF-01 y RF-03): marcas de Veilix y textos que quedan sin proteger |
| `scripts/diagnostico-mensajes.js` | Fragmento de consola con un diagnóstico **anonimizado** de la estructura de los mensajes (RF-04) y de la posición del nombre del remitente en grupos (RF-01) |
| `scripts/diagnostico-avatares.js` | Fragmento de consola que extrae un diagnóstico **anonimizado** de los avatares del DOM real, para validar los selectores de RF-02 |

## Cómo implementar una funcionalidad

1. Implementar el módulo en `src/funcionalidades/modulos/<nombre>.ts`:
   - `activar(contexto)` aplica los cambios y usa `contexto.senal` para registrar escuchas (`{ signal }`) y cancelar observadores.
   - `desactivar()` revierte **todos** los cambios en la página.
   - Para el difuminado se usa `crearModuloDifuminado` (`src/nucleo/difuminado/modulo-difuminado.ts`), que se encarga de los estilos, el revelado, el observador y la limpieza.
   - Los selectores nuevos se añaden solo en `selectores.ts`. Se prefieren identificadores estables y atributos semánticos o de accesibilidad, y nunca clases generadas dinámicamente.
   - Cuando haga falta conocer el DOM real, se piden al propietario ejemplos **anonimizados** (por ejemplo, con `scripts/diagnostico-avatares.js`, `scripts/diagnostico-lista-chats.js` o `scripts/diagnostico-mensajes.js`). Nunca se piden ni se registran nombres, mensajes, fotos ni direcciones completas.
   - WhatsApp Web indica el nombre de muchos iconos en el `<title>` del SVG (por ejemplo, `wds-ic-read`), no con `data-icon`. Para difuminar un tipo de icono concreto se usa la lista de nombres confirmados (`TITULOS_ICONO_ESTADO` en `selectores.ts`) y las funciones de `iconos-estado.ts`, a través de un marcador limitado a la zona correspondiente. Solo se añaden nombres que aparezcan en un diagnóstico real. Nunca se difuminan en general `[data-icon]` ni `svg`.
   - Un módulo que necesite varios marcadores los combina con `combinarMarcadores`.
   - Los marcadores pueden leer el texto de la página solo para clasificar elementos, en el navegador. Nunca lo guardan, lo registran ni lo transmiten.
   - Las búsquedas dentro de un subárbol añadido (`elemento.querySelectorAll`) usan selectores sin prefijos de antecesores, como `#main`, y después se filtran con `matches()`. jsdom no resuelve esos prefijos cuando el antecesor está fuera del subárbol.
   - Solo se usa `MutationObserver` cuando el CSS no basta, y siempre a través de `suscribirMutaciones` (un observador por documento). No se observan atributos.
2. Cambiar `estado` a `'disponible'` en el catálogo.
3. Añadir pruebas que cubran la activación, la desactivación completa y la ausencia de efectos secundarios.
4. Si hace falta el contexto `MAIN` de la página u otro permiso, justificarlo en el *pull request* y en el README.
5. Actualizar la tabla de funcionalidades del README.

## Verificación antes de entregar

```bash
npm run compile
npm run lint
npm test
npm run test:navegador     # requiere `npm run navegador:instalar` la primera vez
npm run build:chrome
npm run build:edge
npm run build:firefox
npm run build:safari
npm run lint:firefox
npm run test:extension     # después de build:chrome
npm run version:comprobar
```

Todo debe terminar sin errores. Los avisos `UNSAFE_VAR_ASSIGNMENT` de `web-ext lint` vienen de `react-dom` y ya están documentados en el README.

## Convenciones

- TypeScript estricto, con `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` y `verbatimModuleSyntax`.
- Las importaciones de WXT son explícitas (`imports: false`), por ejemplo `import { storage } from 'wxt/utils/storage'`.
- Se usa el alias `@/` para `src/`.
- Las dependencias se fijan a versiones exactas. Antes de actualizarlas hay que comprobar la compatibilidad entre `typescript` y `typescript-eslint`.
- Los mensajes de *commit* van en español con prefijo convencional (`feat:`, `fix:`, `docs:`, `chore:`, `test:`). Los *commits* los hace el propietario; el agente solo puede proponer el mensaje en su informe.

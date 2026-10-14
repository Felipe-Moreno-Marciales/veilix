# AGENTS.md — Guía para agentes y colaboradores

Instrucciones para cualquier agente (Codex, Claude u otros) o persona que trabaje en este repositorio. Complementan el [README](README.md).

## Contexto

Veilix es una extensión de privacidad para WhatsApp Web, construida con WXT, React y TypeScript. Funciona en Chrome, Edge y Firefox con Manifest V3.

- **Fase 1 (infraestructura):** completada y aprobada.
- **Fase 2 (motor de difuminado, RF-01 a RF-05):** implementada y **pendiente de validación en WhatsApp Web real** por el propietario.
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

## Mapa del código

| Ruta | Responsabilidad |
| --- | --- |
| `wxt.config.ts` | Manifiesto y diferencias entre navegadores |
| `src/funcionalidades/catalogo.ts` | Identificadores, textos, categorías y estado de cada funcionalidad |
| `src/funcionalidades/modulos/*.ts` | Un módulo por funcionalidad (contrato `ModuloFuncionalidad`) |
| `src/funcionalidades/registro.ts` | Registro de módulos que usa el gestor |
| `src/nucleo/gestor-modulos.ts` | Activación y desactivación según las preferencias, con aislamiento de errores |
| `src/nucleo/difuminado/selectores.ts` | **Único** lugar con selectores de WhatsApp Web (hipótesis pendientes de validar) |
| `src/nucleo/difuminado/` | Motor de difuminado: generación de CSS, fábrica de módulos, marcador de la lista de chats, observador compartido y atajo de revelado |
| `src/almacenamiento/` | Modelo, normalización y persistencia de las preferencias (`storage.local`) |
| `src/ui/` | Panel de configuración (emergente y página de opciones) |
| `src/entrypoints/` | Puntos de entrada de WXT: `popup`, `options` y `whatsapp.content` |
| `tests/` | Pruebas unitarias con Vitest, que usa `fakeBrowser` mediante `WxtVitest` |
| `tests/navegador/` | Pruebas en Chromium real (Vitest Browser + Playwright) |
| `tests/apoyo/whatsapp-simulado.ts` | DOM simulado de WhatsApp Web (hipótesis, no la interfaz real) |
| `scripts/verificar-extension.mjs` | Verificación de extremo a extremo de la extensión compilada, con la red bloqueada |

## Cómo implementar una funcionalidad

1. Implementar el módulo en `src/funcionalidades/modulos/<nombre>.ts`:
   - `activar(contexto)` aplica los cambios y usa `contexto.senal` para registrar escuchas (`{ signal }`) y cancelar observadores.
   - `desactivar()` revierte **todos** los cambios en la página.
   - Para el difuminado se usa `crearModuloDifuminado` (`src/nucleo/difuminado/modulo-difuminado.ts`), que se encarga de los estilos, el revelado, el observador y la limpieza.
   - Los selectores nuevos se añaden solo en `selectores.ts`. Se prefieren identificadores estables y atributos semánticos o de accesibilidad, y nunca clases generadas dinámicamente.
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
npm run lint:firefox
npm run test:extension     # después de build:chrome
```

Todo debe terminar sin errores. Los avisos `UNSAFE_VAR_ASSIGNMENT` de `web-ext lint` vienen de `react-dom` y ya están documentados en el README.

## Convenciones

- TypeScript estricto, con `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` y `verbatimModuleSyntax`.
- Las importaciones de WXT son explícitas (`imports: false`), por ejemplo `import { storage } from 'wxt/utils/storage'`.
- Se usa el alias `@/` para `src/`.
- Las dependencias se fijan a versiones exactas. Antes de actualizarlas hay que comprobar la compatibilidad entre `typescript` y `typescript-eslint`.
- Los mensajes de *commit* van en español con prefijo convencional (`feat:`, `fix:`, `docs:`, `chore:`, `test:`). Los *commits* los hace el propietario; el agente solo puede proponer el mensaje en su informe.

# Veilix — Documentación técnica

> Documentación interna del proyecto, trasladada desde el `README.md` principal el 28 de octubre de 2026 sin cambios de contenido. Conserva el estado, la evidencia, los diagnósticos, los selectores, la arquitectura, las pruebas y el versionado. Para usuarios finales, ver el [README](../README.md); para la publicación de las descargas, [Publicación de Veilix](publicacion.md); para el historial, el [CHANGELOG](../CHANGELOG.md); y para las reglas del proyecto, [AGENTS.md](../AGENTS.md). No forma parte del repositorio público de distribución.

Extensión de privacidad para WhatsApp Web, desarrollada de forma independiente. Está dirigida a Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Opera, Vivaldi (en Windows, Linux y macOS) y Safari en macOS. El estado real de cada combinación está en la [matriz de compatibilidad](#matriz-de-compatibilidad).

> Veilix no está afiliado a WhatsApp ni a Meta.

## Estado

Versión actual: **0.1.6**, estable del 11 de noviembre de 2026 preparada a partir de `0.1.6-beta.0`, y **versión que se publica** (todos los navegadores salvo Safari: Chrome, también para Brave, Opera y Vivaldi, Edge y Firefox). Ver [Versión 0.1.6](#versión-016-estable). No inicia la Fase 3.
- **Qué añade:** con RF-01, la información secundaria de las [sugerencias de menciones](#sugerencias-de-menciones-en-grupos-rf-01-corrección-en-014-beta0): la segunda línea bajo el nombre, con nombres de perfil o emojis. No cambia el comportamiento respecto a beta.0.
- **Validación:** el 11 de noviembre de 2026, el propietario confirmó en Google Chrome, con `0.1.6-beta.0`, que «todo quedó perfecto» y que los nombres de las sugerencias quedan ocultos (confirmación general, sin detalle por caso). No consta una prueba de `0.1.6` en Brave.
- **Publicación:** Release `v0.1.6` en este repositorio, siguiendo [Publicación de Veilix](publicacion.md). Firefox se publica por primera vez, sin la firma de Mozilla: en Firefox normal, la instalación es temporal.
- **Estable anterior, publicada:** `0.1.5` (Release `v0.1.5`, commit `92d827a`). Fue la primera publicación como código abierto, con el mismo código que `0.1.4`. Ver [Versión 0.1.5](#versión-015-estable-primera-publicación-como-código-abierto).
- **Estables anteriores, etiquetadas y sin publicar:**
  - `0.1.4` (`v0.1.4`, commit `19f418a`), elegida para el lanzamiento antes del cambio de licencia;
  - `0.1.3` (`v0.1.3`, commit `ce22e1d`);
  - `0.1.2` (`v0.1.2`, commit `8672a99`).

  El antecedente `0.1.1` no consta como aprobado ni publicado ([Versión 0.1.1](#versión-011-estable-anterior-antecedente)).
- **Siguiente versión:** cualquier corrección posterior empezará en `0.1.7-beta.0` (`npm run version:beta`).
- **Licencia:** desde el 10 de noviembre de 2026, Veilix es código abierto con licencia GPL-3.0 o posterior (`GPL-3.0-or-later`, [`LICENSE`](../LICENSE)). Antes era propietario (`UNLICENSED`). La nueva licencia se aplica también a las versiones anteriores. Ese mismo día el propietario hizo público el repositorio. Las guías para colaborar y para informar de vulnerabilidades están en [`CONTRIBUIR.md`](../CONTRIBUIR.md) y [`SEGURIDAD.md`](../SEGURIDAD.md).
- **Historial:** el completo está en [CHANGELOG.md](../CHANGELOG.md).

Las secciones de cada corrección conservan el nombre de la beta en que se introdujo, por ejemplo [«Info. del contacto»](#panel-info-del-contacto-rf-01-desde-012-beta13) o [Miniaturas de vídeo](#miniaturas-de-vídeo-corrección-en-012-beta7).

- **Fase 1: infraestructura y arquitectura.** Completada y aprobada.
- **Fase 2: motor de difuminado.** **cerrada oficialmente el 28 de octubre de 2026**, con la aprobación expresa del propietario. Sus entregables técnicos están consolidados en la estable `0.1.2`. Historial: implementada y **validada funcionalmente en Google Chrome** por el propietario con `0.2.0-beta.8` (sistema operativo sin indicar). La versión final es `0.1.0` (renumeración aprobada), con el mismo comportamiento que `0.2.0-beta.8`. Después, en pruebas reales se detectaron nombres de remitentes de grupo y elementos de «Nuevo chat» sin proteger; `0.1.1-beta.0` los corrige, y `0.1.1` reúne esas correcciones como estable. Con `0.1.1-beta.3`, el propietario validó en Chrome la información secundaria de «Nuevo chat» y los remitentes en grupos, sin regresiones. Los entregables técnicos (RF-01 a RF-05, con el revelado temporal, el panel y las preferencias) se integraron y ampliaron en `0.1.2`. Ver [Cierre de la Fase 2](#cierre-de-la-fase-2).
- **Ampliación multiplataforma.** Una sola base de código genera los paquetes de Chromium (Chrome, Brave, Opera y Vivaldi), Edge, Firefox y Safari. El motor de difuminado se prueba de forma automatizada en Chromium, Firefox y WebKit. **Fuera de Google Chrome no se ha hecho ninguna prueba real, y Safari no se ha ejecutado nunca** (requiere macOS).
- **Fase 3:** no iniciada.

## Versión 0.1.6 (estable)

Preparada el 11 de noviembre de 2026 a partir de `0.1.6-beta.0` con `npm run version:estable`, sin cambios de comportamiento. Manifiesto `0.1.6` en Chrome, Edge, Firefox y Safari, sin `version_name`. El panel muestra «Veilix 0.1.6».

| Interruptor | Novedades respecto a `0.1.5` |
| --- | --- |
| RF-01 · nombres e información personal | Información secundaria de las [sugerencias de menciones](#sugerencias-de-menciones-en-grupos-rf-01-corrección-en-014-beta0) (`mention-secondary`), con un único filtro y revelada con su fila |
| RF-02, RF-03, RF-04 y RF-05 | Sin cambios |

| Tipo de evidencia | Resultado |
| --- | --- |
| Compilación (Chrome, Edge, Firefox y Safari) | ✅ |
| Pruebas simuladas (Chromium, Firefox y WebKit) | ✅ 996 de 996 (332 por motor) |
| Extensión cargada (simulado) | ✅ 48 de 48 |
| Real en Google Chrome (propietario, `0.1.6-beta.0`) | ✅ «Todo quedó perfecto»: los nombres de las sugerencias, segunda línea incluida, quedan ocultos |
| Real en Brave | ⏳ Sin prueba de `0.1.6` (la de `0.1.5` fue correcta) |

- **Huella SHA-256 de los paquetes de Chrome y Edge**, que son idénticos: `b234e173f975c8dd002a89a06b75493c25ac908dd60a3fecc71a2ad323ec7282`. El guion de [Publicación de Veilix](publicacion.md) la comprueba.
- **Limitaciones:** las de [0.1.4](#limitaciones-conocidas-de-014), salvo `mention-secondary`, que ahora se protege.

## Versión 0.1.5 (estable, primera publicación como código abierto)

Preparada el 10 de noviembre de 2026 a partir de `0.1.4` con `npm run version:estable`, sin beta intermedia, porque no hay cambios de código. Manifiesto `0.1.5` en Chrome, Edge, Firefox y Safari, sin `version_name`. El panel muestra «Veilix 0.1.5».

- **Contenido:** el de [0.1.4](#versión-014-estable-elegida-para-el-primer-lanzamiento-público). Los 13 archivos de los paquetes son idénticos salvo el número de versión (y los nombres de los fragmentos JavaScript, que dependen de su contenido).
- **Novedades fuera del código:**
  - la licencia GPL-3.0 (`LICENSE`);
  - [`SEGURIDAD.md`](../SEGURIDAD.md) y [`CONTRIBUIR.md`](../CONTRIBUIR.md);
  - los enlaces de descarga del README;
  - la publicación en el propio repositorio.
- **Huella SHA-256 de los paquetes de Chrome y Edge**, que son idénticos: `48dc03d19d7efd7f72c53908dae9e13ba836f04ae48430ccb873435db0451484`. El guion de [Publicación de Veilix](publicacion.md) la comprueba.
- **Verificación automatizada:** la misma batería que `0.1.4`, repetida con `0.1.5`; el resultado está en el informe de entrega y en la integración continua del *pull request*.
- **Limitaciones:** las de [0.1.4](#limitaciones-conocidas-de-014).

## Versión 0.1.4 (estable, elegida para el primer lanzamiento público)

Preparada el 10 de noviembre de 2026 a partir de `0.1.4-beta.1` con `npm run version:estable`, sin cambios de comportamiento. Ese mismo día el propietario la eligió como última versión estable y primera versión del lanzamiento público, en lugar de `0.1.3`. Manifiesto `0.1.4` en Chrome, Edge, Firefox y Safari, sin `version_name`. El panel muestra «Veilix 0.1.4». Está etiquetada como `v0.1.4` en `main` (commit `19f418a`) y no está publicada.

### Contenido de 0.1.4

| Interruptor | Novedades respecto a `0.1.3` |
| --- | --- |
| RF-01 · nombres e información personal | Nombre de cada participante en las [sugerencias de menciones](#sugerencias-de-menciones-en-grupos-rf-01-corrección-en-014-beta0) (`@`), y [etiqueta de miembro](#etiquetas-de-miembro-en-grupos-rf-01-corrección-en-014-beta1) junto al autor de los mensajes de grupo |
| RF-02, RF-03, RF-04 y RF-05 | Sin cambios |

- **Lo que nunca se difumina:** el botón de cada sugerencia, la opción «todos», `mention-secondary`, el control de la etiqueta ni los controles de forma parecida («Leer más»).
- **Revelado:** el nombre de una sugerencia se revela con su fila, y la etiqueta, con su mensaje, como el autor.

### Evidencia de 0.1.4, por tipo

| Tipo | Alcance | Resultado |
| --- | --- | --- |
| Compilación | Chrome, Edge, Firefox y Safari | ✅ |
| Pruebas simuladas | Chromium, Firefox y WebKit de Playwright | ✅ 993 de 993 (331 por motor) |
| Extensión cargada (simulado) | Paquete de Chrome con la red bloqueada | ✅ |
| Real en Google Chrome (propietario) | `0.1.4-beta.1`: menciones y etiquetas de miembro | ✅ «Todo funciona sin problemas» (confirmación general, sin detalle por caso) |
| Real en Edge, Firefox, Brave, Opera, Vivaldi y Safari | — | ⏳ Ninguna prueba real ([matriz](#matriz-de-compatibilidad)) |

### Resultados automatizados (`0.1.4`)

| Verificación | Resultado |
| --- | --- |
| `compile`, `lint` | Sin errores |
| `npm test` | 248 de 248 (24 archivos) |
| `test:navegador` | 993 de 993 (331 por motor en Chromium, Firefox y WebKit) |
| `npm run build` (Chrome, Edge, Firefox y Safari) | Correcto; manifiesto `0.1.4` en los cuatro, sin `version_name`, solo `storage` |
| `lint:firefox` | 0 errores; los 2 avisos conocidos `UNSAFE_VAR_ASSIGNMENT` de `react-dom` |
| `test:extension` | Todas las comprobaciones correctas, también las de las menciones y las etiquetas de miembro, sin peticiones de red externas |
| `version:comprobar` | Correcta: `0.1.3` → `0.1.4` |
| `zip:*` (solo en local) | `veilix-0.1.4-{chrome,edge,firefox,safari}.zip` y `veilix-0.1.4-sources.zip` |

- **Sin cambios funcionales:** el código de `src/`, `public/` y `wxt.config.ts` es el de `0.1.4-beta.1`; solo cambia la versión de `package.json`.
- **Huella SHA-256 de los paquetes de Chrome y Edge de `0.1.4`,** que son idénticos: `93d34bb404a9ad48cd11bf46028e5bfff58ae6cb35b956cffc1a87e596f4a78a`. Los de Firefox y Safari son técnicos, y el de fuentes es privado.
- **Distribución:** la prevista son solo los paquetes de Chrome y Edge, siguiendo [Publicación de Veilix](publicacion.md), cuyo guion comprueba esa huella. `SHA256SUMS.txt` se genera al publicar.
- **Paquetes de `0.1.3`:** se conservan con las mismas huellas.

### Limitaciones conocidas de 0.1.4

- **Menciones:**
  - Al recorrer la lista con las flechas, los nombres no se revelan, porque el foco se queda en el editor; el atajo sí los revela.
  - `mention-secondary` no se protege, porque no se ha observado con contenido.
- **Etiquetas de miembro sin evidencia:** en citas, «Info. del grupo», la lista de participantes, mensajes propios y el recuadro «Responder».
- **Etiqueta solo con emojis:** RF-04 podría difuminarla también como reacción. Sin evidencia.
- **Hallazgo independiente:** el autor de una cita tiene dos filtros (RF-01 y RF-04 sobre un antecesor). Sin corregir.
- **Resto:** siguen vigentes las [limitaciones de 0.1.3](#limitaciones-conocidas-de-013).

## Versión 0.1.3 (estable, elegida para el primer lanzamiento público)

Preparada el 30 de octubre de 2026 a partir de `0.1.3-beta.0` con `npm run version:estable`, sin cambios de comportamiento. Ese mismo día el propietario la aprobó y la eligió como primera versión del lanzamiento público. Manifiesto `0.1.3` en Chrome, Edge, Firefox y Safari, sin `version_name`. El panel muestra «Veilix 0.1.3». No está publicada ni etiquetada.

### Contenido de 0.1.3

| Interruptor | Novedades respecto a `0.1.2` |
| --- | --- |
| RF-01 · nombres e información personal | Nombre del participante en el panel flotante de una llamada |
| RF-02 · fotografías y avatares | Sin cambios: el avatar de la llamada ya lo difuminaba la regla general de fotos de perfil |
| RF-04 · contenido de los mensajes | Estado y duración del panel de la llamada, y textos de las tarjetas de llamada (título, estado y duración) |
| RF-03 y RF-05 | Sin cambios |

El panel entero, la barra de controles, la tarjeta interactiva y su icono nunca se difuminan. El detalle está en [Llamadas](#llamadas-rf-01-rf-02-y-rf-04-corrección-en-013-beta0).

### Evidencia de 0.1.3, por tipo

| Tipo | Alcance | Resultado |
| --- | --- | --- |
| Compilación | Chrome, Edge, Firefox y Safari | ✅ |
| Pruebas simuladas | Chromium, Firefox y WebKit de Playwright | ✅ 897 de 897 (299 por motor) |
| Extensión cargada (simulado) | Paquete de Chrome con la red bloqueada | ✅ |
| Real en Google Chrome (propietario) | Llamada de voz en curso y tarjetas de llamada | ✅ Las correcciones funcionan en las variantes observadas (sin detalle por caso) |
| Real en Edge, Firefox, Brave, Opera, Vivaldi y Safari | — | ⏳ Ninguna prueba real ([matriz](#matriz-de-compatibilidad)) |

### Resultados automatizados (`0.1.3`)

| Verificación | Resultado |
| --- | --- |
| `compile`, `lint` | Sin errores |
| `npm test` | 236 de 236 (22 archivos) |
| `test:navegador` | 897 de 897 (299 por motor en Chromium, Firefox y WebKit) |
| `npm run build` (Chrome, Edge, Firefox y Safari) | Correcto; manifiesto `0.1.3` en los cuatro, sin `version_name`, solo `storage` |
| `lint:firefox` | 0 errores; los 2 avisos conocidos `UNSAFE_VAR_ASSIGNMENT` de `react-dom` |
| `test:extension` | Todas las comprobaciones correctas, también las de las llamadas, sin peticiones de red externas |
| `version:comprobar` | Correcta: `0.1.2` → `0.1.3` |
| `zip:*` (solo en local) | `veilix-0.1.3-{chrome,edge,firefox,safari}.zip` y `veilix-0.1.3-sources.zip` |

- **Sin cambios funcionales:** el código de `src/`, `public/` y `wxt.config.ts` es byte a byte el de `0.1.3-beta.0`; solo cambia la versión de `package.json`.
- **Distribución:** la prevista son solo los paquetes de Chrome y Edge, siguiendo [Publicación de Veilix](publicacion.md). Los de Firefox y Safari son técnicos, y el de fuentes es privado. La huella SHA-256 de los paquetes de Chrome y Edge, que son idénticos, es `97cabb6c68582812a110d169eab8ae54bd347e5b1fc65adea5883f278ba6165a`. `SHA256SUMS.txt` se genera al publicar, con el guion de ese procedimiento, que comprueba esa huella.
- **Paquetes de `0.1.2`:** se conservan con las mismas huellas.

### Limitaciones conocidas de 0.1.3

- **Llamadas sin evidencia:** las entrantes (sonando), rechazadas, de vídeo y de grupo.
- **Réplica de las pruebas:** el anidamiento intermedio del panel y de las tarjetas es una suposición.
- **Resto:** siguen vigentes las [limitaciones de 0.1.2](#limitaciones-conocidas-de-012), salvo las llamadas.

## Versión 0.1.2 (estable, aprobada para el primer lanzamiento público)

Preparada el 28 de octubre de 2026 a partir de `0.1.2-beta.13` con `npm run version:estable`, sin cambios de comportamiento. El propietario la aprobó ese mismo día para el primer lanzamiento público, todavía sin publicar. Su código está marcado con la etiqueta `v0.1.2` en `main` (commit `8672a99`). Manifiesto `0.1.2` en Chrome, Edge, Firefox y Safari, sin `version_name`. El panel muestra «Veilix 0.1.2».

### Contenido de 0.1.2

| Interruptor | Novedades respecto a `0.1.1` |
| --- | --- |
| RF-01 · nombres e información personal | Autores de grupo por su estructura `[data-testid="author"]` (beta.1). Nombre, usuario, teléfono y descripción de «Info. del contacto» (beta.13) |
| RF-02 · fotografías y avatares | Avatares de «Nuevo chat», también el de «Tú» (beta.2). Avatares de participantes junto a los mensajes de grupo (beta.3) |
| RF-03 · vista previa | Un solo filtro por vista previa (beta.6) |
| RF-04 · contenido de los mensajes | Texto citado de «Responder» (beta.0). Texto y stickers de «Info. del mensaje» (beta.4 y beta.5). Miniaturas de vídeo (beta.7). Nombre, formato, tamaño y etiqueta del icono de los documentos (beta.8 y beta.9). Miniatura y duración de las citas (beta.10 y beta.11). Encabezado de los estados citados (beta.12) |
| RF-05 · campo de entrada | Sin cambios |

Además:
- **Panel de Veilix:** textos de los interruptores revisados, con `aria-describedby` (beta.6).
- **Diagnósticos:** nuevos diagnósticos anonimizados en `scripts/`, que no se incluyen en los paquetes.
- **Pruebas:** de independencia de los cinco interruptores.
- **Sin cambios:** los permisos (solo `storage`) y el almacenamiento.

### Evidencia de 0.1.2, por tipo

| Tipo | Alcance | Resultado |
| --- | --- | --- |
| Compilación | Chrome, Edge, Firefox y Safari | ✅ |
| Pruebas simuladas | Chromium, Firefox y WebKit de Playwright | ✅ 843 de 843 (281 por motor) |
| Extensión cargada (simulado) | Paquete de Chrome con la red bloqueada | ✅ |
| Real en Google Chrome (propietario) | Confirmadas por elemento: autores (beta.1), avatares de grupo (beta.3), «Info. del mensaje» (beta.4 y beta.5), documentos (beta.8 y beta.9) y miniatura de la cita de un estado (beta.10) | ✅ |
| Real en Google Chrome (propietario) | Serie `0.1.2-beta` completa | ✅ Validación funcional terminada, comunicada el 28 de octubre de 2026, sin detalle por elemento del resto de correcciones |
| Real en Edge, Firefox, Brave, Opera, Vivaldi y Safari | — | ⏳ Ninguna prueba real ([matriz](#matriz-de-compatibilidad)) |

### Resultados automatizados (`0.1.2`)

| Verificación | Resultado |
| --- | --- |
| `compile`, `lint` | Sin errores |
| `npm test` | 232 de 232 (21 archivos) |
| `test:navegador` | 843 de 843 (281 por motor en Chromium, Firefox y WebKit) |
| `build:chrome`, `build:edge`, `build:firefox`, `build:safari` | Correctos |
| `lint:firefox` | 0 errores; los 2 avisos conocidos `UNSAFE_VAR_ASSIGNMENT` de `react-dom` |
| `test:extension` | Todas las comprobaciones correctas, sin peticiones de red externas |
| `version:comprobar` | Correcta: `0.1.2`, sin cambios de código respecto al último commit |
| `zip:*` (solo en local) | `veilix-0.1.2-{chrome,edge,firefox,safari}.zip` y `veilix-0.1.2-sources.zip` |

**Revisión de los paquetes:**
- **Manifiesto:** versión `0.1.2` sin `version_name`, nombre «Veilix», solo el permiso `storage`, sin `host_permissions` y script de contenido limitado a `https://web.whatsapp.com/*`. Versiones mínimas: Chromium 116, Firefox 140 y Safari 17.4.
- **Contenido:** 13 archivos por paquete, sin diagnósticos, pruebas ni mapas de código fuente. Conservan los iconos del candado y el crédito.
- **Observación:** el fragmento del panel incluye el *polyfill* `modulepreload` de Vite, que usa `fetch` solo para precargar módulos de la propia extensión. No es código de Veilix, no está en el script de contenido, y la prueba de extremo a extremo no registra peticiones externas.
- **Paquete de fuentes:** `veilix-0.1.2-sources.zip`, para la revisión de Firefox, contiene el código fuente, incluidos los diagnósticos de `scripts/`, pero no `node_modules` ni `.env`.
- **Licencia:** `"license": "UNLICENSED"` (propietaria).

### Limitaciones conocidas de 0.1.2

La lista completa está en la entrada [0.1.2 del CHANGELOG](../CHANGELOG.md#012--2026-10-28). Las principales son:

- **«Info. del contacto»:**
  - Las notas guardadas o en edición no se han observado.
  - Los números no guardados y otros diseños de empresa no se han observado.
  - Hay otros textos no genéricos del panel sin cubrir, entre ellos uno de 968 caracteres.
  - Las repeticiones del nombre en las filas inferiores tampoco están cubiertas.
- **Estados citados:** el encabezado solo se reconoce en español e inglés, y los estados de foto, texto o GIF no tienen evidencia.
- **Sin diagnóstico:** las fotos y los vídeos de «Info. del mensaje», y las miniaturas citadas del recuadro «Responder».
- **Vídeos y citas:**
  - Las capas de la miniatura de un vídeo no se han confirmado (hermanas o anidadas).
  - La duración de una cita se difumina con su icono.
  - La duración de un vídeo con forma de hora se difumina como una hora.
- **Documentos:** PDF, DOCX y los demás formatos solo están probados con el DOM simulado.
- **Indicadores:** los de enviado, entregado y reloj no tienen evidencia, y la silueta de grupo de RF-02 no está confirmada.
- **Inicialización:** si algo elimina un estilo de Veilix de la página, no se vuelve a insertar hasta desactivar y reactivar su interruptor, y la causa del episodio de `0.1.2-beta.0` no se ha confirmado (ver [Inicialización de los módulos](#inicialización-de-los-módulos-en-investigación)).
- **Navegadores:** no hay pruebas reales fuera de Chrome, y Safari no se ha ejecutado nunca.

Las tablas de evidencia y las notas «pendiente de validación» de las secciones anteriores conservan el estado comunicado en su momento. El cierre de la validación de la serie está en [Evidencia de 0.1.2, por tipo](#evidencia-de-012-por-tipo).

### Antes de publicar 0.1.2

1. **Prueba de humo en Chrome:** carga `veilix-0.1.2-chrome.zip` (o `.output/chrome-mv3`), comprueba que el panel muestra «Veilix 0.1.2» y que los cinco interruptores funcionan.
2. **Paquetes locales antiguos:** descarta cualquiera con el mismo nombre que los de esta versión.

## Versión 0.1.1 (estable anterior, antecedente)

> **Antecedente histórico.** `0.1.1` se preparó como estable durante el desarrollo. No consta que el propietario la aprobara ni que se publicara. Su aprobación ya no es un requisito: la estable aprobada para el primer lanzamiento público es [`0.1.2`](#versión-012-estable-aprobada-para-el-primer-lanzamiento-público). El contenido de esta sección, «Antes de aprobar» incluido, conserva el estado de entonces.

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
| Real en Google Chrome | Remitentes no guardados en grupos con `0.1.2-beta.0` (nombres en color, algunos con «~», emojis o símbolos) | ❌ **Algunos nombres quedan visibles** con RF-01 activa (comunicado por el propietario el 26 de octubre de 2026). Ver [Remitentes no guardados](#remitentes-no-guardados-en-grupos-corrección-en-012-beta1) |
| Real en Google Chrome | Remitentes no guardados en grupos con `0.1.2-beta.1` | ✅ **Correcto**: el propietario confirmó que la corrección funciona |
| Real en Google Chrome | Avatares predeterminados de «Nuevo chat» (círculos de color con una silueta) con `0.1.2-beta.1` | ❌ **Siguen visibles** con RF-02 activa; las fotos personalizadas sí se difuminan. Corrección en `0.1.2-beta.2`, pendiente de validación: ver [Avatares predeterminados](#avatares-predeterminados-en-nuevo-chat-corrección-en-012-beta2) |
| Real en Google Chrome | Avatares de participantes junto a los mensajes de un grupo (silueta, inicial en un círculo de color) con `0.1.2-beta.2` | ❌ **Algunos siguen visibles** con RF-02 activa (comunicado por el propietario). Corrección en `0.1.2-beta.3`, pendiente de validación: ver [Avatares de participantes en grupos](#avatares-de-participantes-en-grupos-corrección-en-012-beta3) |
| Real en Google Chrome | `0.1.2-beta.3`: las ocho pruebas funcionales de los avatares de participantes en grupos, incluidas la conservación de la lista de chats, el encabezado y «Nuevo chat» | ✅ **Aprobadas** por el propietario; incidencia cerrada. No consta si la prueba incluyó un avatar con silueta |
| Real en Google Chrome | Recuadro «Responder» con `0.1.2-beta.0` o posterior (texto citado) | ⏳ **Sin resultado comunicado**. Las miniaturas citadas no tienen selector ni diagnóstico |
| Real en Google Chrome | «Info. del mensaje» con `0.1.2-beta.3` | ❌ **La copia del mensaje se ve sin difuminar** con RF-04 activa (comunicado por el propietario). Corrección en `0.1.2-beta.4`, pendiente de validación: ver [«Info. del mensaje»](#info-del-mensaje-corrección-en-012-beta4) |
| Real en Google Chrome | «Info. del mensaje» con `0.1.2-beta.4`: texto | ✅ **Correcto**: difuminado y revelado con el cursor; título, cierre, horas, indicadores, «Leído» y «Entregado» visibles |
| Real en Google Chrome | «Info. del mensaje» con `0.1.2-beta.4`: sticker | ❌ **El sticker queda visible** con RF-04 activa (comunicado por el propietario, con capturas). Corrección en `0.1.2-beta.5`: ver [«Info. del mensaje»](#info-del-mensaje-corrección-en-012-beta4) |
| Real en Google Chrome | «Info. del mensaje» con `0.1.2-beta.5`: sticker | ✅ **Funciona** (confirmado por el propietario) |
| Real en Google Chrome | `0.1.2-beta.6`: textos del panel e independencia de los interruptores | ⏳ **Sin resultado comunicado**. Ver [Interruptores del panel](#interruptores-del-panel-auditoría-de-012-beta6) |
| Real en Google Chrome | Documentos adjuntos (PNG y JPG) con `0.1.2-beta.7` | ❌ **Nombre, formato y tamaño visibles** con RF-04 activa (diagnóstico real: `document-thumb`). Corrección en `0.1.2-beta.8`, pendiente de validación: ver [Documentos adjuntos](#documentos-adjuntos-corrección-en-012-beta8) |
| Real en Google Chrome | Respuesta a un estado con `0.1.2-beta.10` | ◐ **Miniatura difuminada**, pero el encabezado «Tú · Estados» y la duración «0:18» siguen nítidos (comunicado por el propietario). En investigación |
| Real en Google Chrome | Documentos con `0.1.2-beta.9`: etiqueta de extensión del icono | ✅ **Funciona** (confirmado por el propietario) |
| Real en Google Chrome | Respuesta a un estado con `0.1.2-beta.9` | ❌ **La miniatura del estado se ve** con RF-04 activa (diagnóstico real: fondo `data:image/jpeg` en `quoted-message`). Corrección en `0.1.2-beta.10`, pendiente de validación: ver [Miniaturas de citas](#miniaturas-de-citas-y-respuestas-a-estados-corrección-en-012-beta10) |
| Real en Google Chrome | Documentos con `0.1.2-beta.8`: nombre, formato y tamaño | ✅ **Difuminados** (confirmado por el propietario). La etiqueta PNG/JPG del icono seguía visible; corrección en `0.1.2-beta.9`, pendiente de validación |
| Real en Google Chrome | Vídeos de una conversación con `0.1.2-beta.6` | ❌ **Una miniatura se ve sin difuminar** con RF-04 activa (diagnóstico real: fondos `data:image/jpeg` en `video-content`). Corrección en `0.1.2-beta.7`, pendiente de validación: ver [Miniaturas de vídeo](#miniaturas-de-vídeo-corrección-en-012-beta7) |
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

**Estructura confirmada** con [`scripts/diagnostico-respuesta.js`](../scripts/diagnostico-respuesta.js) en WhatsApp Web real (Chrome, respuesta a un mensaje de texto):

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

**Riesgo residual:** la causa de la regresión de remitentes de beta.2 sigue sin conocerse. No se reprodujo en el DOM simulado, no se cambió código para corregirla y no se repitió en la validación real de beta.3. Si vuelve a aparecer, hay que ejecutar [`scripts/diagnostico-mensajes.js`](../scripts/diagnostico-mensajes.js) en el grupo afectado y compartir las tablas «reglas cargadas en esta pestaña» y «remitentes por mensaje», además de los errores de consola que empiecen por «[Veilix]».

## Cierre de la Fase 2

**Fase 2 cerrada oficialmente el 28 de octubre de 2026**, con la aprobación expresa del propietario. Sus entregables técnicos (RF-01 a RF-05, revelado temporal, panel de configuración, preferencias persistentes y aplicación en caliente) están integrados y ampliados en la estable `0.1.2`, cuya validación funcional en Google Chrome confirmó el propietario. El cierre no implica que se hayan validado todas las variantes de WhatsApp Web ni todos los navegadores: las limitaciones técnicas siguen en [Limitaciones conocidas de 0.1.2](#limitaciones-conocidas-de-012) y en [Pendiente técnico tras el cierre](#pendiente-técnico-tras-el-cierre).

Lo que sigue en esta sección documenta la entrega original de la fase, con `0.1.0`, tal como se registró.

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

### Pendiente técnico tras el cierre

No son requisitos del cierre de la fase, sino tareas técnicas abiertas:

- **Otros navegadores y sistemas:** pruebas manuales en Edge, Brave, Opera, Vivaldi, Firefox y Safari, y en Chrome con el sistema operativo indicado. Ver la [matriz de compatibilidad](#matriz-de-compatibilidad).
- **Indicador de reloj (pendiente):** validación pendiente.
- **Prueba de humo antes de publicar:** la del paquete final de `0.1.4`, en [Publicación de Veilix](publicacion.md#prueba-de-humo-del-paquete-final). Las de `0.1.1` y `0.1.2` ya no son necesarias.
- **Correcciones de RF-01 y RF-02 de `0.1.1`:** validadas en Chrome real con `0.1.1-beta.0`, `0.1.1-beta.2` y `0.1.1-beta.3`. La causa de la regresión de remitentes de beta.2 sigue sin conocerse, aunque no se repitió en beta.3. Ver [Versión 0.1.1](#versión-011-estable-anterior-antecedente).
- **Alertas de `npm audit`** en dependencias de desarrollo (`web-ext → node-forge`).

## Funcionalidades aprobadas

| Funcionalidad | Categoría | Estado | Observaciones |
| --- | --- | --- | --- |
| Difuminar nombres de contactos (RF-01) | Difuminado visual | Disponible · validado en Chrome. En `0.1.2`: autores de grupo por su estructura e información personal de «Info. del contacto» (serie `0.1.2-beta` validada por el propietario; ver [Versión 0.1.2](#versión-012-estable-aprobada-para-el-primer-lanzamiento-público)). En `0.1.4`, confirmadas por el propietario en Chrome: [etiquetas de miembro](#etiquetas-de-miembro-en-grupos-rf-01-corrección-en-014-beta1) y [sugerencias de menciones](#sugerencias-de-menciones-en-grupos-rf-01-corrección-en-014-beta0) | Lista de chats y encabezado de la conversación; remitentes y autores de grupo (también en citas y en el aviso fijado); autor citado en «Responder»; nombre e información de «Nuevo chat»; otras filas de contacto con avatar SVG (hipótesis); y nombre, usuario, teléfono y descripción de «Info. del contacto». Las notas guardadas, los números no guardados y otros textos del panel no están cubiertos. |
| Difuminar fotografías de contactos (RF-02) | Difuminado visual | Disponible · validado en Chrome. En `0.1.2`: avatares de «Nuevo chat» y de participantes en grupos (serie `0.1.2-beta` validada por el propietario) | Fotos y avatares predeterminados de la lista, del encabezado, de «Nuevo chat» (también «Tú») y junto a los mensajes de grupo (foto e inicial; la silueta, sin confirmar), y fotos de perfil en cualquier otra zona, como «Info. del contacto». No afecta a iconos, contadores ni imágenes de mensajes. |
| Difuminar mensajes recientes (RF-03) | Difuminado visual | Disponible · validado en Chrome (reloj pendiente) | Vista previa en la lista de chats, incluidas las especiales con iconos dentro (por ejemplo, «reaccionó con 👌 a:» con el icono de una foto), y su indicador de **leído** (`wds-ic-read`) cuando el último mensaje es propio. Enviado, entregado y pendiente, pendientes de diagnóstico. Silenciado, fijado, estados, mensajes temporales, stickers y contador de no leídos siguen visibles. |
| Difuminar mensajes de conversaciones (RF-04) | Difuminado visual | Disponible · validado en Chrome (reloj pendiente). En `0.1.2`: «Responder», «Info. del mensaje», vídeos, documentos, citas y estados citados (serie `0.1.2-beta` validada por el propietario) | Texto, descripciones, multimedia (fotos, vídeos, miniaturas de vídeo y stickers), hora, reacciones e indicador de **leído** de los mensajes. Texto citado del recuadro «Responder». Texto y stickers de «Info. del mensaje». Nombre, formato, tamaño y etiqueta del icono de los documentos. Miniatura, duración y encabezado «Tú · Estados» de las citas (encabezado solo en español e inglés). Los botones, los demás iconos y los separadores siguen visibles. Sin cubrir: fotos y vídeos de «Info. del mensaje», miniaturas citadas de «Responder» y estados de foto, texto o GIF. |
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

### Interruptores del panel (auditoría de 0.1.2-beta.6)

Cada interruptor guarda solo su clave, `funcionalidades.<id>`, dentro de `local:preferencias`, y el gestor activa o desactiva su módulo en vivo, sin recargar. Cada módulo añade su propio `<style>` y sus propias marcas `data-veilix-*`, y no depende de los demás.

| Interruptor | Módulo | Zonas que protege | Fuera de su alcance | Validación real (Chrome) |
| --- | --- | --- | --- | --- |
| RF-01 · nombres e información personal | `difuminar-nombres.ts` | Lista de chats, encabezado, autores y remitentes de grupo, autor citado en «Responder», nombre e información de cada contacto en «Nuevo chat», otras filas de contacto con avatar SVG (hipótesis) y, desde `0.1.2-beta.13`, nombre, usuario, teléfono y descripción de «Info. del contacto» | Textos de mensajes (RF-04) | ✅ hasta `0.1.2-beta.1`; autor citado sin validar |
| RF-02 · fotos | `difuminar-fotos.ts` | Lista de chats, encabezado, columna del avatar en «Nuevo chat» (también «Tú»), avatares de participantes junto a los mensajes de grupo y fotos de perfil en otras zonas | Fotos y vídeos enviados (RF-04), iconos y contadores | ✅ hasta `0.1.2-beta.3`; la silueta de grupo, sin confirmar |
| RF-03 · mensajes recientes | `difuminar-mensajes-recientes.ts` | Vista previa de cada fila de la lista, con sus emojis, reacciones e iconos, y el indicador de leído (`wds-ic-read`) | Enviado, entregado y reloj (sin evidencia); silenciado, fijado y contador | ✅ con `0.2.0-beta.8` (reloj pendiente) |
| RF-04 · mensajes | `difuminar-mensajes-conversacion.ts` | Texto, descripciones, multimedia (también las miniaturas de vídeo como fondos CSS, desde `0.1.2-beta.7`), nombre, formato y tamaño de los documentos adjuntos (desde `0.1.2-beta.8`) y la etiqueta de extensión de su icono (desde `0.1.2-beta.9`), miniaturas de las citas (desde `0.1.2-beta.10`) su duración (desde `0.1.2-beta.11`) y el encabezado de los estados citados (desde `0.1.2-beta.12`), hora, reacciones e indicador de leído de los mensajes; texto citado en «Responder»; texto y stickers de «Info. del mensaje» | Miniaturas citadas, fotos y vídeos de «Info. del mensaje» (sin selector) y nombres (RF-01) | ✅ salvo el texto citado de «Responder» (⏳) |
| RF-05 · campo de entrada | `difuminar-campo-entrada.ts` | Editor de `#main footer` | Resto del pie | ✅ con `0.2.0-beta.8` |

**Condiciones del foco.** RF-01 a RF-04 revelan con `:focus-visible` en el contenedor o en un descendiente: la fila de la lista, el encabezado, la fila del mensaje, la copia de «Info. del mensaje» o el botón del sticker. Solo ocurre cuando WhatsApp Web permite llegar ahí con el teclado y el navegador marca el foco como visible; un clic con el ratón normalmente no lo hace. RF-05 no revela con el foco, porque el editor lo tiene mientras se escribe.

**Pruebas de independencia** (`tests/navegador/interruptores.test.ts`, DOM simulado): cada interruptor solo, cada uno desactivado con los otros cuatro activos, los cinco activos con un único filtro por elemento, los cinco desactivados sin restos, alternancia en vivo, cambio de conversación, atajo y revelado por cursor y por foco. La prueba del filtro único detectó que RF-03 difuminaba dos veces la vista previa, porque marcaba el `span[title]` y el `span[dir]` interior. Desde `0.1.2-beta.6` solo marca el más externo. No hay evidencia real de ese anidamiento en WhatsApp Web.

**Validación real pendiente de `0.1.2-beta.6`:**
1. Los textos del panel describen lo que se observa.
2. Cada interruptor, desactivado con los demás activos, deja visible solo lo suyo.
3. La vista previa de la lista no se ve más difuminada que los nombres.

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

> **Pruebas reales: carga siempre `.output/chrome-mv3`** (tras `npm run build:chrome`). La compilación de desarrollo (`.output/chrome-mv3-dev`, de `npm run dev`) no declara el script de contenido en su manifiesto. WXT lo registra en tiempo de ejecución desde el servidor de desarrollo, así que sin él Veilix no actúa en WhatsApp Web. Además tiene el mismo número de versión, por lo que en `chrome://extensions` no se distingue.

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
| `npm run zip:<navegador>` | Genera el paquete `.zip` (`chrome`, `edge`, `firefox` o `safari`) con la versión en el nombre, por ejemplo `veilix-0.1.3-chrome.zip`. |
| `npm run version:beta` | Siguiente versión previa: desde una estable inicia la beta del siguiente parche (`0.1.0` → `0.1.1-beta.0`), y desde una beta la incrementa (`0.1.1-beta.0` → `0.1.1-beta.1`). |
| `npm run version:parche-beta` / `version:menor-beta` | Primera beta del siguiente parche (`0.2.1-beta.0`) o de la siguiente versión menor (`0.3.0-beta.0`). |
| `npm run version:estable` | Convierte en estable la beta actual (`0.1.3-beta.0` → `0.1.3`). Ejecutar solo sobre una versión beta. |
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

- **Fuente única de verdad:** el campo `version` de `package.json`, con [versionado semántico](https://semver.org/lang/es/). Durante el desarrollo se usan versiones `MAYOR.MENOR.PARCHE-beta.N`. Todo lo demás se calcula a partir de ella en [`src/version.ts`](../src/version.ts).
- **Cambio de versión:** solo se cambia a mano, con los scripts `version:*`, que ejecutan `npm version --no-git-tag-version` y actualizan `package.json` y `package-lock.json` sin crear commits ni etiquetas. Compilar o empaquetar nunca cambia la versión.
- **Una versión por entrega:** cada entrega de prueba con cambios en el código (`src/`, `public/` o `wxt.config.ts`) recibe una versión nueva y una entrada en [CHANGELOG.md](../CHANGELOG.md). `npm run version:comprobar` lo verifica en local, y la integración continua lo comprueba en cada *pull request*.

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
- [`scripts/diagnostico-paneles.js`](../scripts/diagnostico-paneles.js): la tabla de «Nuevo chat» muestra, para cada fila, cuántos `span[dir][title]` tiene, cuál se marcó como nombre (`posicionMarcada`), si está difuminado y qué textos quedan sin proteger (`textosSinProteger`; con beta.3 debería ser «—» en las filas de contacto).
- [`scripts/diagnostico-mensajes.js`](../scripts/diagnostico-mensajes.js) (marca `MARCADO-REMITENTE`).

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

Si un elemento no se difumina o se difumina algo que no debería, anota qué elemento era. Después usa *Inspeccionar elemento* para revisar sus atributos (`role`, `title`, `dir`, `data-icon`, `contenteditable`) y sus contenedores (`#pane-side`, `#main`, `header`, `footer`). Los ajustes se hacen solo en [`selectores.ts`](../src/nucleo/difuminado/selectores.ts).

### Diagnóstico anonimizado de avatares

Si alguna foto sigue visible con RF-02 activa:

1. Abre la consola de las herramientas de desarrollo en WhatsApp Web.
2. Pega el contenido de [`scripts/diagnostico-avatares.js`](../scripts/diagnostico-avatares.js) y pulsa Intro.

El fragmento solo lee el DOM. No hace peticiones ni muestra nombres, textos, `title`, `aria-label`, `alt` ni direcciones completas. Lista las imágenes, fondos e iconos de al menos 20 px, con su zona, sus atributos, su ascendencia, el patrón de su origen y si están difuminados. Revisa el resultado y comparte las filas marcadas con `difuminado: NO`.

### Avatares predeterminados en «Nuevo chat» (corrección en 0.1.2-beta.2)

Con `0.1.2-beta.1`, el propietario comprobó en Chrome que, con RF-02 activa, las fotos personalizadas de «Nuevo chat» se difuminan, pero algunos avatares predeterminados (círculos de color con la silueta de una persona) siguen visibles.

**Lo que se sabe por el código:**
- **Sin regla por fila:** RF-02 no reconoce como filas de contacto las filas de «Nuevo chat». `crearMarcadorFilasContacto` exige exactamente un `AVATAR_SVG`, y el diagnóstico real de `0.1.1-beta.1` mostró que esas filas no tienen ninguno.
- **Solo la regla global:** en «Nuevo chat» solo actúa la regla que reconoce un avatar por sí mismo:
  - `FOTO_PERFIL`: origen `pps.whatsapp.net`. Por eso las fotos sí se difuminan.
  - `FOTO_PERFIL_SVG`.
  - `AVATAR_SVG`: máscara con `<image>` o `<foreignObject>`.
  - `AVATAR_PREDETERMINADO`: `data-icon` que empieza por `default-user`, `default-group`, `default-contact` o `default-community`.
- **Por qué siguen visibles:** un avatar predeterminado que no cumpla ninguna de las cuatro no lo alcanza ninguna regla. La hipótesis de `0.1.1-beta.0`, según la cual «Nuevo chat» usaría el mismo componente de avatar que la lista, no se cumple para estos avatares.

**Lo que falta:**
- La estructura real del avatar predeterminado: el contenedor que dibuja el círculo, si es un SVG y con qué `<title>`, o si tiene otro atributo estable.
- Cómo distinguirlo de los iconos de «Nuevo grupo», «Nuevo contacto» y «Nueva comunidad».

**Primer intento de diagnóstico:** el propietario revisó la tabla general, que mostraba `div[role=gridcell]` sin imágenes ni SVG. Esa tabla toma el elemento con rol más interno de cada fila; en «Nuevo chat» es la celda de texto, dentro de `cell-frame-container`, y el avatar no está ahí. Las tablas de «Nuevo chat» del diagnóstico se han rehecho para usar como raíz la fila completa y detectar también avatares dibujados con CSS.

**Diagnóstico real** (tablas A, B y C del [diagnóstico de paneles](#diagnóstico-anonimizado-de-paneles-nuevo-chat), con `0.1.2-beta.1`): 17 contactos y la fila «Tú», con RF-02 cargada y el atajo inactivo. 11 fotos estaban difuminadas por `FOTO_PERFIL`, y 6 avatares predeterminados no los alcanzaba ninguna regla.

```text
[role="listitem"][data-testid^="list-item-"] › div[role="button"]
  › div[data-testid="cell-frame-container"]        (fila «Tú»: div[data-testid="message-yourself-row"])
      › div (77 × 72 px)  ← columna del avatar
          › div › div (49 × 49 px, redondo)
              › img (foto, pps.whatsapp.net)                      o bien
              › div › span › svg (49 × 49 px, path, fondo de color, redondo)
      › div               ← columna del texto
          › div[role="gridcell"] › div[data-testid="cell-frame-title"] › … nombre
          › div[data-testid="cell-frame-secondary"] › … información
```

- **Dos columnas distintas:** la del avatar y la del texto son hijos distintos de la celda. La del avatar mide 77 px y el nombre, 190 px.
- **Acciones fuera de las filas:** «Nuevo grupo», «Nuevo contacto» y «Nueva comunidad» están fuera de las filas `list-item-*`, en `div[data-tab="3"]`.
- **Título del SVG desconocido:** solo consta su longitud (16), así que no se usa.

**Causa confirmada:** el avatar predeterminado es un SVG sin `<mask>`, sin `data-icon` y sin origen `pps`. Ningún selector de RF-02 lo reconocía, y la regla por fila no se aplicaba.

**Corrección (`0.1.2-beta.2`):** RF-02 difumina la **columna del avatar** de cada fila de persona de «Nuevo chat», contactos y «Tú» (`AVATAR_NUEVO_CHAT`).
- **Qué es la columna del avatar:** el hijo directo de `cell-frame-container` o de `message-yourself-row` que contiene una imagen o un SVG, y ningún `gridcell`, `cell-frame-title`, `cell-frame-secondary`, botón ni campo.
- **En qué filas:** solo en las filas `list-item-*` de `[data-testid="new-chat-drawer"]` que no contienen una acción.
- **Unidad:** el SVG y su círculo de color, o la foto, se difuminan como una sola unidad.
- **Revelado:** con la fila (cursor, foco y Ctrl + Mayús + Espacio).
- **Solo CSS:** sin observadores nuevos y sin depender de RF-01.
- **Sin doble filtro:** las reglas anteriores de fotos no se aplican dentro de esa columna.

| Alternativa | Por qué no |
| --- | --- |
| `svg` por su `<title>` | El título no está confirmado; solo su longitud |
| Ruta completa hasta el círculo | Depende de la profundidad interna, que puede cambiar |
| El círculo por su color o su redondez | Exigiría clases, estilos o colores concretos |

**Riesgos:**
- **Otro elemento visual en la columna:** si WhatsApp añadiera a la columna del avatar algo que no fuera un control (por ejemplo, un indicador de estado), también se difuminaría.
- **Columna sin texto ni controles con un icono:** si la celda tuviera otra columna así, se difuminaría. La exclusión de botones y campos reduce este riesgo.
- **Acciones dentro de las filas:** si WhatsApp las moviera a filas `list-item-*`, seguirían excluidas por contener `new-chat-drawer-new-*`.

### «Info. del mensaje» (corrección en 0.1.2-beta.4)

Con `0.1.2-beta.3`, el propietario comprobó en Chrome que la pantalla «Info. del mensaje» muestra una copia del contenido del mensaje sin difuminar, con RF-04 activa.

**Lo que se sabe por el código:** todas las reglas de RF-04 están limitadas a `#main`: la fila `#main [data-id]`, su `msg-container` y el recuadro «Responder» de `#main footer`. Si «Info. del mensaje» se abre como un panel fuera de `#main`, ninguna regla lo alcanza, aunque reutilice los componentes del mensaje. Es la explicación más probable, pero no está confirmada.

**Lo que falta:**
- Dónde está el panel.
- Si reutiliza `msg-container`, `data-pre-plain-text` o `.selectable-text`.
- Cómo se representa la multimedia.
- Dónde están el título, el botón de cierre, los estados, las fechas y las horas, que deben seguir visibles.

**Diagnóstico real** ([diagnóstico de «Info. del mensaje»](#diagnóstico-anonimizado-de-info-del-mensaje), con `0.1.2-beta.3`, sobre un mensaje de texto): `dentroDeMain: false`, RF-04 activa y el atajo inactivo.

| Elemento | Estructura |
| --- | --- |
| Panel | `div.copyable-area`, dentro de `[data-testid="drawer-right"]` |
| Copia del mensaje | `[data-testid="msg-container"]` |
| Texto | `[data-testid="selectable-text"]`, el único texto que coincidía con un mensaje, visible |
| Hora e indicadores | `[data-testid="msg-meta"]` |
| Estados de entrega y lectura | `[data-testid="kept-by-info"]` |
| Multimedia | No había en la muestra |

**Causa confirmada:** las reglas de RF-04 solo actúan dentro de `#main`, y esta copia está fuera.

**Corrección (`0.1.2-beta.4`):** RF-04 difumina el texto de la copia del mensaje.
- **Selector:** `[data-testid="selectable-text"]` más externo, dentro de `[data-testid="msg-container"]`, en un `[data-testid="drawer-right"]` que contiene `[data-testid="kept-by-info"]` (`MENSAJE_INFO`, `TEXTO_MENSAJE_INFO`).
- **Qué se excluye:** los metadatos y el autor.
- **Qué sigue visible:** el título, el cierre, la hora, los indicadores, los estados, las fechas y los otros paneles laterales derechos.
- **Revelado:** con la copia del mensaje y con Ctrl + Mayús + Espacio.
- **Solo CSS:** sin observadores nuevos y sin depender de RF-01, RF-02, RF-03 ni RF-05.

**Validación real de `0.1.2-beta.4`:** el texto se difumina y se revela con el cursor, y el título, el cierre, las horas, los indicadores y los estados siguen visibles.

**Stickers (corrección en `0.1.2-beta.5`):** con `0.1.2-beta.4`, el sticker de «Info. del mensaje» quedaba visible (capturas del propietario). Con `0.1.2-beta.5`, el propietario confirmó que funcionan.

**Diagnóstico real** (con un sticker):

```text
[data-testid="drawer-right"] (con [data-testid="kept-by-info"])
  › … [data-testid="msg-container"]
      › [data-testid="sticker-container"]
          › div[role="button"][tabindex="0"]
              ├── img (origen blob:, 0 × 0 px; auxiliar)
              └── canvas (190 × 190 px; el sticker visible)
```

Ninguna regla de RF-04 alcanzaba esos elementos, y no estaban difuminados. En la conversación, el mismo sticker usa una estructura equivalente y ya se difuminaba.

**Causa confirmada:** la regla de multimedia de RF-04 está limitada a `#main`, y la de esta pantalla solo alcanzaba el texto.

**Corrección:** una regla aparte de RF-04, sobre la misma copia del mensaje, difumina los nodos visuales del sticker.
- **Selector:** `[data-testid="sticker-container"] :is(img[src^="blob:"], canvas)`, dentro de `MENSAJE_INFO` (`VISUAL_STICKER_INFO`).
- **Qué no se difumina:** el contenedor ni su botón, que es pulsable. Cada nodo visible recibe un solo filtro.
- **Revelado:** con la copia del mensaje (cursor, foco del botón del sticker y Ctrl + Mayús + Espacio).
- **Suposiciones de las pruebas:** el sticker estático (solo el `img` visible) y el orden de los nodos.

**Pendiente de evidencia:**
- **Multimedia:** fotos y vídeos en esta pantalla no se han observado y no tienen selector. Hay que repetir el diagnóstico con una foto y un vídeo.
- **Otros paneles laterales:** los que muestren copias de mensajes sin `kept-by-info` (por ejemplo, «Mensajes destacados») quedan fuera por diseño.

### Diagnóstico anonimizado de «Info. del mensaje»

1. Activa RF-04 y abre «Info. del mensaje» de un mensaje propio con texto (después, de uno con foto o vídeo).
2. Aleja el cursor del panel.
3. En la consola, pega [`scripts/diagnostico-info-mensaje.js`](../scripts/diagnostico-info-mensaje.js) y pulsa Intro.

**Qué busca fuera de la conversación y de la lista de chats:**
- Componentes de mensaje: `msg-container`, `data-pre-plain-text`, `.selectable-text` y `msg-meta`.
- Multimedia.
- Textos que coinciden con un mensaje visible, sin mostrarlos.
- El título y las etiquetas de estado («Leído», «Entregado»…).

**Qué muestra:**
- La raíz del panel, que es el antecesor común más pequeño de lo encontrado, y su ascendencia.
- Un resumen.
- El esqueleto del panel, con las reglas de RF-04 que alcanzan a cada elemento y si está difuminado.

**Tabla de elementos visuales:** además, lista todos los elementos visuales de cada copia del mensaje. Incluye, para comparar, los de los mensajes multimedia de la conversación. De cada uno indica:
- **Qué es:** `img` con su tipo de origen; `video` y sus atributos (`autoplay`, `loop`…); `canvas`; SVG; o fondo o máscara CSS, también en pseudoelementos.
- **Dónde está:** su ruta desde `msg-container` y su tamaño. Se clasifica como contenido o como metadato (`msg-meta`).
- **Interacción:** si está dentro de un botón y si puede recibir el foco.
- **Protección:** las reglas de RF-04 que lo alcanzan y dónde está el filtro.

Sirve para los stickers estáticos y animados, las fotos y los vídeos.

No muestra textos, nombres, fechas, horas, teléfonos, `data-id`, `aria-label`, `alt` ni direcciones. De cada texto solo indica su longitud y si parece una hora o una fecha. Solo se ven tal cual el título de la pantalla y las etiquetas de estado conocidas, que son textos genéricos de la interfaz.

### Avatares de participantes en grupos (corrección en 0.1.2-beta.3)

Con `0.1.2-beta.2`, el propietario comprobó en Chrome que, en los grupos, algunos avatares de participantes a la izquierda de los mensajes siguen visibles con RF-02 activa: siluetas predeterminadas y círculos de color con una inicial. RF-01 ya protege sus nombres.

**Lo que se sabe por el código:** dentro de `#main`, RF-02 solo tiene las reglas globales:
- `FOTO_PERFIL`: imagen de `pps.whatsapp.net`. Una foto real de un participante probablemente ya se difumina.
- `FOTO_PERFIL_SVG`.
- `AVATAR_SVG`: máscara con `<image>` o `<foreignObject>`.
- `AVATAR_PREDETERMINADO`: `data-icon` `default-*`.

Un avatar hecho con un SVG sin máscara, con texto (una inicial) o con CSS no lo alcanza ninguna de ellas.

**Lo que falta:**
- Dónde está el avatar respecto a la fila del mensaje, a la burbuja y al autor.
- Cómo se representan la foto, la silueta y la inicial.
- Qué atributos estables tiene.

**Diagnóstico real** ([diagnóstico de avatares en grupos](#diagnóstico-anonimizado-de-avatares-en-grupos), con `0.1.2-beta.2`), con RF-02 activa, el atajo inactivo y el cursor fuera de la conversación:
- **Contenedor:** el avatar de cada participante es `[data-testid="group-chat-profile-picture"]`, dentro de `#main [data-testid="conversation-panel-messages"]`.
- **Foto:** un `img` de unos 28 × 28 px. Ya la difuminaba `FOTO_PERFIL`.
- **Inicial:** `[data-testid="profile-first-initial"]`, sobre un círculo de color de unos 28 × 28 px. La inicial y el círculo seguían visibles.
- **Otros elementos:** el diagnóstico recogió también el fondo de la conversación y componentes del editor, ajenos a los avatares.

**Causa confirmada:** el círculo con la inicial no es una imagen, ni un SVG con máscara, ni tiene `data-icon`, así que no lo alcanzaba ninguna regla de RF-02.

**Corrección (`0.1.2-beta.3`):** RF-02 difumina el contenedor `group-chat-profile-picture` más externo de `#main [data-testid="conversation-panel-messages"]` (`AVATAR_PARTICIPANTE`).
- **Unidad:** la foto, o el círculo y la inicial, se difuminan juntos.
- **Revelado:** con el propio avatar (cursor, foco y Ctrl + Mayús + Espacio).
- **Solo CSS:** sin observadores nuevos y sin depender de RF-01 ni de RF-04.
- **Sin doble filtro:** las reglas anteriores de fotos no se aplican dentro de ese contenedor.
- **Qué no difumina:** el panel de mensajes, las filas, las burbujas, la multimedia, las reacciones, los controles, el encabezado ni el editor.

**Pendiente de evidencia:**
- **Silueta:** no se ha confirmado que el avatar predeterminado con silueta use el mismo contenedor. Si lo usa, queda cubierto; si no, seguirá visible.
- **Posición y foco:** tampoco se conocen la posición exacta del avatar respecto a la fila ni si puede recibir el foco; las pruebas cubren las dos posiciones supuestas.

### Diagnóstico anonimizado de avatares en grupos

1. Abre un grupo con RF-02 activada.
2. Desplázate hasta que se vean varios avatares: con foto, con silueta y con inicial.
3. Aleja el cursor de la conversación.
4. En la consola, pega [`scripts/diagnostico-avatares-grupo.js`](../scripts/diagnostico-avatares-grupo.js) y pulsa Intro.

Examina cada fila de mensaje (`#main [data-id]` más externo) y lo que el navegador pinta junto a la burbuja (`elementsFromPoint`, a 20 px, arriba y abajo), dentro o fuera de la fila. De cada elemento muestra:
- **Ubicación:** su ruta desde la fila y su relación con la burbuja, el autor, `msg-meta` y los botones.
- **Tamaño y señales:**
  - Imagen, con su tipo de origen.
  - SVG, con su estructura y su `<title>` `wds-ic-…`.
  - Fondo o máscara CSS, también en pseudoelementos.
  - Color de fondo, forma redonda y texto de una o dos letras (posible inicial).
- **Clasificación:** foto, inicial, SVG, CSS o círculo de color.
- **Protección:** las reglas de RF-02 que lo alcanzan y dónde está el filtro.

Termina con un resumen por tipo, con los visibles primero.

No muestra textos, nombres, iniciales, teléfonos, `data-id`, `title`, `aria-label`, `alt`, colores ni direcciones. De un texto corto solo indica cuántas letras tiene.

### Diagnóstico anonimizado de paneles («Nuevo chat»)

Si algún nombre o avatar de «Nuevo chat» u otro panel con contactos sigue visible:

1. Abre el panel con RF-01 y RF-02 activas.
2. En la consola, pega [`scripts/diagnostico-paneles.js`](../scripts/diagnostico-paneles.js) y pulsa Intro.

Para cada fila candidata fuera de la lista de chats y de la conversación muestra:
- Su elemento y su ascendencia: etiquetas, `role`, `data-testid`, `data-animate-drawer` e identificadores conocidos.
- Cuántos avatares SVG contiene y su estructura.
- Los iconos `wds-ic-…`.
- Los `span[title]`, solo con su longitud.
- Las marcas de Veilix y si el nombre y el avatar están difuminados.

**Para RF-02 en «Nuevo chat»**, con el panel abierto, muestra **primero** tres tablas. Usan como raíz la fila completa `[role="listitem"][data-testid^="list-item-"]`, no la celda de texto:
- **A) Estructura de cada fila:** los hijos de su botón, incluidos los hermanos de `cell-frame-container`, con su tamaño y sus señales visuales.
- **B) Candidatos a avatar:** cada elemento con alguna señal visual, más lo que el navegador pinta en la zona del avatar (`elementsFromPoint`, a 30 px del borde inicial de la fila). De cada uno indica:
  - Su ruta y si está dentro o fuera de `cell-frame-container`.
  - Su tamaño y sus señales:
    - `img`, con su tipo de origen.
    - `svg`, con su estructura y su `<title>` `wds-ic-…`.
    - Fondo o `mask-image` de CSS, también en `::before` y `::after`.
    - `data-icon`, color de fondo y forma redonda.
  - Las reglas de RF-02 que lo alcanzan y dónde está el filtro.
- **C) Resumen** por categoría de fila y tipo de elemento, con los visibles primero.

Cada fila se clasifica como acción, «Tú», contacto, contacto posiblemente no guardado (nombre con «~» o con forma de teléfono) o encabezado de sección. También indica si la fila está bajo el cursor o si el atajo de revelado está activo.

Las tablas generales (filas candidatas por rol, avatares SVG y nombres de «Nuevo chat») van después. La primera toma el elemento con rol más interno, que en «Nuevo chat» es la celda de texto.

No muestra nombres, textos, números, colores, `aria-label` ni direcciones de imágenes o fondos (solo su tipo de origen). De los `data-testid` de las filas (`list-item-…`) no muestra el sufijo. Para clasificar las filas solo compara textos genéricos de la interfaz («Tú», «Envíate un mensaje») y la forma del nombre, sin mostrarlos.

### Diagnóstico anonimizado de la lista de chats

Si alguna vista previa (por ejemplo, una reacción) sigue visible con RF-03 activa:

1. En la consola, pega [`scripts/diagnostico-lista-chats.js`](../scripts/diagnostico-lista-chats.js) y pulsa Intro.
2. Comparte el resultado.

Para cada fila muestra:
- Qué ha marcado Veilix: nombre, vista previa y estado.
- Cuántos textos visibles quedan sin proteger, excluidos el nombre, la hora y los contadores.
- El esqueleto de las filas con textos sin proteger: etiquetas, presencia de `title`, `dir` y `aria-label`, longitud del texto, emojis y nombres de icono `wds-ic-…`.

No muestra textos, nombres ni emojis concretos.

### Diagnóstico anonimizado de mensajes

Si algún contenido de mensaje sigue visible con RF-04 activa, o algún control aparece difuminado:

1. Abre un chat de grupo que tenga texto, fotos con descripción y mensajes enviados.
2. En la consola, pega [`scripts/diagnostico-mensajes.js`](../scripts/diagnostico-mensajes.js) y pulsa Intro.

Muestra, para cada `[data-testid="msg-container"]`:
- Un resumen: dirección (enviado o recibido), bloques de texto, tipos de imagen, iconos y botones.
- Los iconos de la lista de chats y de la conversación agrupados por nombre, tanto `data-icon` como el `<title>` de los SVG (solo identificadores `wds-ic-…`), con cuántos están difuminados o marcados.
- El contenido de cada `msg-meta`: nombres de sus iconos y etiquetas de estado conocidas («Leído», «Entregado»…).

Para identificar los indicadores de enviado, entregado y pendiente, ejecútalo con mensajes en cada estado. Para el pendiente, por ejemplo, desactiva la red un momento y envía un mensaje.
- El esqueleto de su estructura: etiquetas, `role`, `data-testid`, `data-icon`, clases semánticas y si cada elemento está difuminado.

No muestra textos, nombres, identificadores ni direcciones. Del texto solo indica la longitud, si parece una hora y si coincide con el nombre del remitente de `data-pre-plain-text`; esto último sirve para localizar el nombre del remitente en los grupos (RF-01).

### Remitentes no guardados en grupos (corrección en 0.1.2-beta.1)

**Validación real:** el propietario confirmó en Chrome, con `0.1.2-beta.1`, que la corrección funciona.

Con `0.1.2-beta.0`, el propietario comprobó en Chrome que RF-01 deja visibles algunos nombres de participantes no guardados en grupos. Esos nombres aparecen en color, algunos empiezan por «~» y otros contienen emojis, símbolos o texto con forma de etiqueta HTML.

**Diagnóstico real** ([`scripts/diagnostico-remitentes.js`](../scripts/diagnostico-remitentes.js)): `rf01Activa: true`, `reglaRemitentes: true`, 7 remitentes marcados en 15 mensajes analizados y 4 remitentes distintos. Mostró dos cosas:
- **Coincidencia por texto insuficiente:** algunos nombres visibles no coinciden con su `data-pre-plain-text`, y algunos mensajes multimedia no tienen ese bloque.
- **Estructura del nombre:** está en `[data-testid="author"]` dentro de `msg-container`, como `span[data-testid="author"]` o `span[role="button"][data-testid="author"]`, a veces anidados.

**Causa confirmada:** el marcador de remitentes solo difumina un elemento si su texto visible es idéntico al remitente de algún `data-pre-plain-text`. Fallaba en los casos 1 y 2 de la lista siguiente, que estaba en investigación.

**Corrección (`0.1.2-beta.1`):** el autor se difumina por su estructura, sin comparar textos.
- **Selector:** `[data-testid="author"]:not([data-testid="author"] *)`, el más externo, para no aplicar dos filtros en los anidados.
- **Revelado:** con el mensaje (cursor, foco y Ctrl + Mayús + Espacio); fuera de los mensajes, con el propio nombre.
- **El marcador por texto se conserva** para los nombres sin `author` (aviso fijado…). Sus marcas dentro de un `author` se excluyen del CSS, para no difuminar dos veces.
- **Sin cambios en** RF-04, RF-05 ni los demás selectores.

Casos posibles que se habían identificado por el código:

1. **Nombre distinto del metadato:** el nombre visible no coincide con el de `data-pre-plain-text`, por ejemplo «~ Nombre público» visible frente a un teléfono en el metadato.
2. **Mensajes sin bloque de texto:** una foto o un vídeo sin descripción no aportan ningún nombre; solo se reconocen si esa persona tiene otro mensaje con texto.
3. **Emojis distintos:** un emoji en `<img alt>` puede no ser idéntico al del metadato, por ejemplo por el selector de variación U+FE0F.
4. **Nombre repartido:** el nombre está en varios elementos y ninguno contiene el texto completo.
5. **Cambios de texto:** el observador solo ve nodos añadidos, no cambios de texto dentro de un nodo existente.

Los nombres con forma de etiqueta HTML se leen siempre como texto (`textContent`) y no deberían ser un problema.

Con la estructura `author`, los casos 1 a 4 quedan cubiertos sin depender del texto, y el 5 ya no influye, porque la regla es solo CSS. Las pruebas nuevas (`tests/navegador/remitentes-autor.test.ts`) reproducen los casos del diagnóstico y fallan con el código anterior.

**Pendiente de evidencia y riesgos:**
- **Orden del anidamiento:** no se conoce, así que se prueban los dos.
- **Teléfono junto al nombre:** si un participante no guardado muestra un número **fuera** del `author`, ese número seguiría visible. El diagnóstico no lo ha mostrado.
- **Otros usos de `author`:** cualquier `[data-testid="author"]` de `#main` se difumina con RF-01, también el autor de una cita o del recuadro «Responder». Si WhatsApp usara ese atributo para algo que no fuera un nombre, también se difuminaría.

### Inicialización de los módulos (en investigación)

Con `0.1.2-beta.0`, en Chrome real, el propietario tenía los cinco interruptores activados, pero la página no tenía ningún estilo ni elemento marcado por Veilix (`estilosVeilix: []`, `elementosMarcados: 0`, `filtrosAplicados: []`), de forma repetida.

**Comprobado en local** (extensión compilada en Chromium, página simulada y red bloqueada):
- **Manifiesto correcto:** el script de contenido se inyecta en `https://web.whatsapp.com/*` en `document_start`, sin permisos adicionales.
- **Carga normal correcta:** los cinco estilos están presentes y los nombres, difuminados.
- **Recargar la extensión con la pestaña abierta:** la pestaña conserva los estilos del script anterior. En Playwright, la extensión queda desactivada tras `chrome.runtime.reload()`, algo que no ocurre en Chrome real, así que ese experimento no sirve como prueba.
- **Punto débil confirmado en el código:** si algo elimina un `<style data-veilix-estilo>`, el módulo sigue considerándose activo y no lo vuelve a insertar hasta desactivarlo y reactivarlo. Produce el síntoma exacto, pero no está demostrado que WhatsApp Web elimine esos estilos.

**Causas posibles, sin confirmar:**
1. El script no se inyectó: pestaña abierta antes de instalar o actualizar la extensión, acceso al sitio restringido, ventana de incógnito sin permiso o extensión desactivada.
2. El script de una versión anterior quedó con su contexto invalidado.
3. El script lee otras preferencias (otra instalación u otro perfil).
4. Los estilos se insertan y algo los elimina.

**Actualización (26 de octubre de 2026):** en una pestaña nueva, tras recargar la extensión, DevTools no muestra ningún contexto «Veilix». Chrome crea ese contexto al inyectar el script aunque este falle de inmediato, así que el script **no se está inyectando**. Quedan descartados el fallo de inicialización y la invalidación del contexto.

**Reproducido en local** (Chromium, página simulada y red bloqueada):

| Carga | Interruptores | Acceso efectivo a WhatsApp Web | Contexto «Veilix» | Estilos |
| --- | --- | --- | --- | --- |
| `.output/chrome-mv3` | activos | sí | sí | 5 |
| `.output/chrome-mv3` con acceso al sitio «Al hacer clic» | **activos** | **no** | **no** | **0** |
| `.output/chrome-mv3-dev` sin servidor de desarrollo | el panel no carga | sí | no | 0 |

El segundo caso reproduce exactamente el síntoma comunicado. El ZIP `veilix-0.1.2-beta.0-chrome.zip` es una compilación de producción correcta: declara el script de contenido, incluye su archivo y solo pide `storage`.

**Estado posterior:** el diagnóstico de remitentes que le siguió muestra RF-01 cargada (`rf01Activa: true`), así que el script vuelve a ejecutarse en la pestaña. La causa exacta del episodio no se ha comunicado.

**Causa más probable, pendiente de confirmar en el Chrome del propietario:** el acceso de Veilix a `web.whatsapp.com` está restringido. Es un ajuste de Chrome que se conserva al recargar la extensión mientras su identificador no cambie, y no un defecto del código. Se comprueba con el [diagnóstico de la instalación](#diagnóstico-anonimizado-de-la-instalación).

### Diagnóstico anonimizado de la instalación

Si en WhatsApp Web no aparece el contexto «Veilix» en la consola:

1. En `chrome://extensions`, abre «Detalles» de Veilix → «Opciones de extensión».
2. En esa pestaña (no en WhatsApp Web), abre la consola (F12), pega [`scripts/diagnostico-extension.js`](../scripts/diagnostico-extension.js) y pulsa Intro.

**Muestra:**
- El manifiesto realmente cargado: versión, tipo de compilación (producción o desarrollo), si declara el script de contenido, su ruta y si el archivo existe.
- El acceso efectivo a `https://web.whatsapp.com/*` y los orígenes concedidos.
- Si la extensión está permitida en incógnito.
- Cuántas pestañas de WhatsApp Web puede ver la extensión.
- Las funcionalidades que lee como activas.

Termina con una lectura y la acción recomendada:
- Cargar `.output/chrome-mv3`.
- Volver a compilar.
- Conceder el acceso al sitio en «Detalles» → «Acceso a sitios».
- Revisar si hay otra copia de Veilix.
- Comprobar en el menú de extensiones que estén permitidas en `web.whatsapp.com`.

No muestra el identificador de la extensión, rutas del equipo, URL de pestañas, títulos ni contenidos. Solo consulta archivos de la propia extensión.

### Diagnóstico anonimizado de la inicialización

En la pestaña de WhatsApp Web, con la consola abierta (F12):

1. **Con el contexto «top»** (desplegable arriba a la izquierda de la consola), pega [`scripts/diagnostico-inicializacion.js`](../scripts/diagnostico-inicializacion.js) y pulsa Intro. Durante los 20 segundos siguientes, desactiva un interruptor en el panel de Veilix, espera dos segundos y vuelve a activarlo. El fragmento registra si Veilix añade o retira sus estilos.
2. **Abre el desplegable de contextos y busca «Veilix».**
   - Si **no aparece**, el script de contenido no está en la pestaña. Recarga la pestaña y revisa el acceso al sitio de la extensión y el modo incógnito.
   - Si **aparece**, selecciónalo, pega de nuevo el fragmento y pulsa Intro. Indica si el contexto sigue siendo válido, qué versión está inyectada (compárala con `chrome://extensions`) y qué funcionalidades lee como activas.
3. **Filtra la consola por «Veilix»** y anota cualquier error, como «[Veilix] No se pudo activar» o «Extension context invalidated».

Solo lee el DOM y las preferencias. No muestra textos, nombres, mensajes, URL completas ni identificadores de la extensión.

### Diagnóstico anonimizado de remitentes

Para los [remitentes no guardados](#remitentes-no-guardados-en-grupos-corrección-en-012-beta1):

1. Abre el grupo afectado con RF-01 activada.
2. Desplázate hasta que se vean los nombres que siguen visibles, mejor junto a mensajes de contactos guardados y alguna foto o vídeo.
3. Pega [`scripts/diagnostico-remitentes.js`](../scripts/diagnostico-remitentes.js) en la consola y pulsa Intro.

Muestra:
- Las reglas cargadas y los totales: remitentes distintos, cuántos son teléfonos y cuántos están marcados.
- Un resumen por tipo de nombre, con los que siguen visibles primero. Agrupa por si llevan «~», por si el metadato es un nombre o un teléfono, por la relación entre ambos y por la estructura.
- Para cada mensaje, hasta tres textos en el lugar del nombre:
  - Estructura (etiquetas, `role`, `dir`, `data-testid` y clases semánticas) y si tiene color propio.
  - Longitud, si empieza por «~», si parece un teléfono y si contiene emojis o símbolos.
  - Relación con el metadato de su mensaje y con los de toda la conversación: idéntico, igual solo al normalizar emojis o Unicode, mismo teléfono con otro formato, metadato con teléfono y visible distinto, distinto…
  - La misma relación para su contenedor inmediato.
  - Si está marcado y difuminado, y el tipo de mensaje.

No muestra textos, nombres, teléfonos, `data-id`, `data-pre-plain-text`, `title`, `aria-label`, `alt`, colores ni direcciones. Los `data-testid` se anonimizan y los textos con forma de etiqueta HTML se leen como texto.

### Diagnóstico anonimizado del recuadro «Responder»

Para el [recuadro «Responder»](#recuadro-responder-corrección-en-012-beta0). Con `0.1.2-beta.0`, el texto citado debería aparecer como `· difuminado`:

1. Abre una conversación con RF-01, RF-04 y RF-05 activadas.
2. Pulsa «Responder» sobre un mensaje y, con el recuadro abierto, pega [`scripts/diagnostico-respuesta.js`](../scripts/diagnostico-respuesta.js) en la consola y pulsa Intro.
3. Repite la ejecución en cuatro casos: un mensaje recibido en un chat individual, un mensaje propio, un mensaje de un grupo y una foto o un vídeo.

Muestra:
- Los elementos de `#main` con texto o imagen que están fuera de las filas de mensaje, con su ascendencia y si están en `footer`.
- Si cada texto coincide con un remitente o con el inicio de un mensaje visible (sin mostrar ninguno de los dos), y si está difuminado y con qué marcas de Veilix.
- Los botones del pie, con sus iconos (`wds-ic-…` y `data-icon`), para confirmar que la X de cancelar no se difumina.
- El esqueleto del pie que contiene el recuadro y el editor.

No muestra textos, nombres, `data-id`, `title`, `aria-label`, `alt` ni direcciones, y no recorre el contenido del editor. De las imágenes indica solo si son `blob:`, `data:` o de un dominio de WhatsApp, sin nombrar otros dominios. Los `data-testid` se anonimizan.

### Miniaturas de vídeo (corrección en 0.1.2-beta.7)

**Incidencia (Chrome, `0.1.2-beta.6`):** en una misma conversación, con RF-04 activa, la miniatura de un vídeo situado arriba a la izquierda se veía sin difuminar, y otro vídeo más abajo parecía difuminado.

**Causa confirmada** por el diagnóstico real, con RF-04 activa, sin el atajo pulsado, sin el cursor sobre la conversación y sin ningún revelado:

```text
#main › … › [data-id] › [data-testid="msg-container"] › … › [data-testid="video-content"]
  ├── div (fondo en línea data:image/jpeg; filter: blur(8px) de WhatsApp)
  └── div (fondo en línea data:image/jpeg; sin filtro: la miniatura nítida)
```

- Vídeo superior, vertical: 256 × 354 px. Vídeo inferior, horizontal: 346 × 200 px.
- `MULTIMEDIA_MENSAJE` solo reconocía `img`, `video`, `canvas` y fondos con `blob:`, así que ninguna regla de Veilix alcanzaba esas capas.
- El filtro de 8 px es de WhatsApp: Veilix usa 6 px. El vídeo que parecía protegido no lo estaba por RF-04.
- **Sin confirmar:** si las dos capas son hermanas (como en el esquema) o la nítida contiene a la otra. La nítida no puede estar dentro de la desenfocada, porque se ve nítida.

**Corrección** (`MINIATURA_VIDEO`): RF-04 difumina la capa más externa con fondo `data:image/jpeg` de cada `[data-testid="video-content"]`, dentro de `msg-container`.
- **Un filtro por capa:** si las capas son hermanas, cada una recibe su filtro de Veilix. Si están anidadas, la interior queda difuminada con la exterior.
- **Sin doble filtro:** la regla de multimedia y el marcador de horas y reacciones ignoran lo que hay dentro de esa capa.
- **Qué no se difumina:** `video-content`, la burbuja, el botón de reproducir y los fondos `data:image/jpeg` fuera de `video-content` (fondo de la conversación, encabezado).
- **Filtro de 8 px de WhatsApp:** mientras RF-04 protege la capa, el de Veilix (6 px) lo sustituye. Durante el revelado, la capa se ve sin filtro. Al desactivar RF-04, recupera sus 8 px sin recargar.
- **Duración del vídeo:** si tiene formato de hora («0:15»), el marcador de RF-04 la difumina como una hora, igual que antes de esta versión.

### Documentos adjuntos (corrección en 0.1.2-beta.8)

**Incidencia (Chrome, `0.1.2-beta.7`):** en la conversación, las tarjetas de archivo dejaban ver el nombre, el formato y el tamaño con RF-04 activa.

**Diagnóstico real** (dos imágenes enviadas como documento, PNG y JPG; RF-04 activa, sin cursor ni atajo):

```text
[data-testid="msg-container"]
  › … [data-testid="document-thumb"][role="button"]
      ├── contenedor del icono
      │     ├── [data-icon="document-PNG-icon"] › svg   (dibujo del icono)
      │     └── div                                      (etiqueta «PNG»)
      ├── span[dir="auto"]        (nombre del archivo)
      ├── [data-testid="type"]     (formato)
      └── span[title]              (tamaño)
  › descripción del adjunto (.selectable-text, ya difuminada)
```

El esquema solo indica qué hay dentro de la tarjeta. El orden y el anidamiento interno no constan en la evidencia recibida. Ninguna regla de RF-04 alcanzaba esos tres datos.

**Corrección** (`DATOS_DOCUMENTO`): RF-04 difumina el nombre, el formato y el tamaño dentro de `document-thumb`, en mensajes de `#main`.
- **La tarjeta no se difumina entera:** es el control que abre o descarga el archivo. Tampoco se difuminan el icono ni los botones que contenga.
- **Salvaguardas:** solo el elemento más externo de cada grupo, y nunca lo que ya cubre la regla de texto, ni un elemento con iconos o imágenes, ni algo dentro de un botón. Así, cada dato recibe un solo filtro.
- **Revelado:** con el mensaje (cursor, foco de la tarjeta y Ctrl + Mayús + Espacio).
- **Descripciones emergentes:** el `title` del tamaño solo aparece con el cursor encima, cuando el mensaje ya está revelado. CSS no oculta los atributos `title`.

**Validación real de `0.1.2-beta.8`:** el propietario confirmó en Chrome que el nombre, el formato y el tamaño se difuminan. La etiqueta PNG/JPG del icono seguía visible.

**Etiqueta del icono (corrección en `0.1.2-beta.9`):** dentro de la tarjeta, el icono es un elemento con `data-icon="document-PNG-icon"` (o `-JPG-`) y su SVG, y la etiqueta es un `div` hermano suyo (estructura confirmada). RF-04 difumina solo ese `div` (`ETIQUETA_ICONO_DOCUMENTO`), en cualquier orden y sin depender de la extensión. El dibujo del icono sigue nítido. Nunca se difumina un hermano con iconos, imágenes, botones o los datos de la tarjeta. Pendiente de validación real.

**Pendiente de evidencia:**
- **Miniaturas:** las de la tarjeta, si existen, no se han observado.
- **Otros formatos:** PDF, DOCX y los demás solo se han probado con el DOM simulado.

### Diagnóstico anonimizado de archivos adjuntos

**Pasos:**
1. Con RF-04 activada, abre una conversación con varios archivos adjuntos a la vista: por ejemplo, un PDF, un documento de texto y una imagen enviada como documento.
2. Deja el cursor sobre la lista de chats, sin pulsar ninguna tecla.
3. Abre la consola (F12), pega [`scripts/diagnostico-adjuntos.js`](../scripts/diagnostico-adjuntos.js) y pulsa Intro.
4. Comparte el resumen, la tabla, el JSON y la estructura anonimizada.

**Qué muestra:**
- **Mensajes:** los visibles con indicios de adjunto, como un texto con forma de tamaño («245 kB»), de páginas o de nombre de archivo, un icono de documento, archivo o descarga, un `data-testid` de documento o un enlace con `download`.
- **Estructura:** el esqueleto anonimizado de cada uno, con las reglas de RF-04 que alcanzan a cada elemento.
- **Elementos visibles:** una tabla con sus textos, iconos e imágenes, con su clase, su tamaño en pantalla, si están en un botón, qué regla de RF-04 los alcanza (también `DATOS_DOCUMENTO`) y si están difuminados.

**Privacidad:**
- Solo lee el DOM. No lo modifica, no descarga nada y no hace peticiones.
- No muestra textos, nombres de archivo, nombres de personas, teléfonos, `data-id`, `title`, `aria-label`, `alt` ni direcciones.
- De un nombre de archivo solo indica la extensión, y solo si es común (PDF, DOCX, JPG…).
- De las imágenes, solo el tipo de origen. Los `data-testid` se anonimizan.

**Probado en Chromium** con un DOM inventado y datos secretos: un PDF con miniatura, icono y botón de descarga, y un enlace con `download` y una extensión poco común.
- No se filtró ningún dato.
- La extensión poco común no se mostró.
- El mensaje de solo texto quedó fuera.

### Miniaturas de citas y respuestas a estados (corrección en 0.1.2-beta.10)

**Incidencia (Chrome, `0.1.2-beta.9`):** cuando un contacto responde a un estado, su mensaje incluye una tarjeta «Tú · Estados» con la miniatura del estado, un indicador de vídeo y la duración. La respuesta se difuminaba; la miniatura, no.

**Diagnóstico real** (RF-04 y RF-01 activas, sin cursor ni atajo):

```text
[data-testid="msg-container"]
  › [data-testid="quoted-message"] … div[role="button"][tabindex="0"]
      ├── span[dir="auto"]                 (encabezado, 12 caracteres)
      ├── texto de 4 caracteres            (forma de duración)
      ├── [data-testid="selectable-text"]  (texto citado, ya difuminado)
      └── div[style]                       (fondo en línea data:image/jpeg, 58 × 58 px: la miniatura)
```

- **Lo que no se sabe:** el orden y el anidamiento exactos.
- **Por qué el diagnóstico lo dio por cita convencional:** buscaba «Estados» como texto independiente, y el encabezado es compuesto.
- **Hipótesis muy probable, no confirmada:** las longitudes coinciden con «Tú · Estados» y «0:18» de la captura, así que es casi seguro una respuesta a un estado.

**Corrección** (`MINIATURA_CITA`): RF-04 difumina la capa más externa con fondo `data:image/jpeg` dentro de un `quoted-message` del mensaje, en `#main`.
- **No se difumina la cita entera:** el encabezado, el botón, el texto citado (que ya tiene su regla) y la navegación al contenido citado no cambian.
- **Salvaguardas:** nunca se elige un fondo que contenga el texto citado, el encabezado o botones. La regla de multimedia y el marcador de horas ignoran lo que haya dentro de la miniatura: un solo filtro por elemento.
- **Fuera del alcance:** el recuadro «Responder» del pie, «Info. del mensaje» y los fondos fuera de una cita.
- **Duración e indicador:** dentro de la miniatura se difuminan con ella. Fuera, el indicador sigue visible, y la duración, por su forma de hora, la difumina el marcador de horas de RF-04, como antes. Su posición real no está confirmada.

**Sin evidencia:** las respuestas a estados de foto, texto o GIF, y las citas de otros tipos de mensaje. Con el diagnóstico actualizado se pueden observar.

**Validación real de `0.1.2-beta.10`:** la miniatura se difumina, pero el encabezado «Tú · Estados» y la duración «0:18» siguen nítidos.

**Encabezado (corrección en `0.1.2-beta.12`).** Se reconoce por la estructura confirmada (`quoted-message` sin `[data-testid="author"]` › `div[role=""]` › `span[dir="auto"]`, que no es el texto citado) y, como criterio complementario autorizado por el propietario, por la forma de su texto: «… · Estados», «… · Estado» o «… · Status». Se marca con `data-veilix-encabezado-estado` y se difumina solo el `span`.
- **Idiomas:** el reconocimiento depende del idioma y se limita al español y al inglés. En otros idiomas el encabezado no se difumina.
- **Por qué no basta la estructura:** una cita convencional dentro de un mensaje no se ha observado, y la de un mensaje propio («Tú») podría compartir la estructura. Las pruebas incluyen esos casos negativos.
- Pendiente de validación real.

**Antecedentes del encabezado** (antes de `0.1.2-beta.12`): Solo se ha observado una cita dentro de un mensaje en el DOM real, la del estado. Sin una cita convencional real con la que compararla, no se puede identificar de forma fiable la tarjeta de un estado sin mirar su texto, y no se ha cambiado ningún selector.
- **Duración, causa confirmada:** «0:18» es un nodo de texto directo de un `div[role="button"]` que contiene también `chat-msg-symbol` y el texto citado, con 21 caracteres de `textContent`.
  - **Por qué no se difumina:** el marcador de horas compara el texto completo de cada elemento y no la reconoce.
  - **Por qué no basta CSS:** CSS no puede seleccionar un nodo de texto suelto, y difuminar el `div` alcanzaría el icono y el texto citado.
  - **Por qué no se toca el DOM:** envolver el texto en un elemento propio está prohibido por la regla 9.
  - **Contenido del `div`,** comprobado con `contains()` en una réplica del árbol real: `chat-msg-symbol` (un icono SVG), el texto «0:18» y el texto citado. El encabezado y la miniatura están fuera. El «contiene: encabezado» del diagnóstico anterior era un error, porque el texto citado también lleva `dir="auto"`; ya está corregido.
  - **Corrección en `0.1.2-beta.11`** (autorizada por el propietario): el marcador de mensajes reconoce, dentro de un `quoted-message` del mensaje, el elemento con `chat-msg-symbol` como hijo directo y un texto directo con forma de duración (`CANDIDATO_DURACION_CITA`). Lo marca con `data-veilix-duracion-cita` y RF-04 lo difumina entero.
    - El texto citado de su interior pierde su propio filtro, así que queda con uno solo.
    - Nunca se marca un contenedor con autor, encabezado, miniatura, botones u otra cita.
    - El icono `chat-msg-symbol` se difumina también (coste aceptado).
    - Una cita convencional con la misma estructura también se difuminaría; no se ha observado ninguna.
    - Pendiente de validación real.
- **Criterio candidato, sin confirmar:** en el encabezado del estado (`div[role=""]` › `span[dir="auto"]`) no hay `[data-testid="author"]`. En el recuadro «Responder» del pie, la única cita convencional observada (respuesta a un mensaje del contacto), el encabezado sí es `[data-testid="author"]`. Faltan dos comparaciones:
  - nunca se ha observado una cita convencional **dentro de un mensaje**;
  - nunca se ha observado la cita de un **mensaje propio** («Tú»), que es la que más se parece al encabezado del estado.
- **Evidencia indispensable:** una ejecución del diagnóstico con dos citas convencionales dentro de mensajes, una de un mensaje del contacto y otra de un mensaje propio. Se necesitan las filas de la tabla de rasgos (`conAutor`, `encabezados` con su ruta, `dataTestidDentro`, `iconos`).
- **Decisión según el resultado:**
  - **Las dos citas convencionales tienen `[data-testid="author"]`:** se difumina el `span[dir="auto"]` del encabezado de las citas sin autor (nunca el texto citado), sin depender del texto.
  - **Alguna no lo tiene:** hace falta otro rasgo que solo tenga el estado, como el `div[role=""]`, `chat-msg-symbol` o el título del icono. Si no aparece ninguno, el encabezado no se protege.
- **Qué se busca:** la tabla de **rasgos de cada cita** muestra, sin textos:
  - sus `data-testid`, iconos, autor, texto citado, miniaturas, encabezados y elementos interactivos;
  - la duración, con los hijos de su contenedor en orden y lo que contiene.

  Reconoce también las citas sin `data-testid` `quoted…`, por su texto citado (`.quoted-mention`) o su autor.

### Diagnóstico anonimizado de respuestas a estados

**Pasos:**
1. Con RF-04 activada, abre la conversación con la respuesta al estado y déjala a la vista. Si puedes, deja también a la vista un mensaje que cite otro mensaje, para comparar.
2. Deja el cursor sobre la lista de chats, sin pulsar ninguna tecla.
3. Abre la consola (F12), pega [`scripts/diagnostico-respuestas-estado.js`](../scripts/diagnostico-respuestas-estado.js) y pulsa Intro.
4. Comparte el resumen, la tabla, el JSON y la estructura anonimizada. Si hay respuestas a estados de otros tipos (foto, texto, GIF), repite con cada una.

**Qué muestra:**
- **Mensajes, en cuatro grupos:**
  - **Respuesta a un estado confirmada:** por un identificador inequívoco, como un `data-testid` de estado o el icono `wds-ic-status…`.
  - **Posible respuesta a un estado:** la palabra «Estados» en el encabezado, sola o compuesta.
  - **Cita con miniatura.**
  - **Cita convencional:** hasta dos, para comparar.
- **Estructura:** el esqueleto anonimizado de cada mensaje, con las reglas de RF-04 y de autores de RF-01 que alcanzan a cada elemento.
- **Textos e imágenes:** su tipo (`img`, `video`, `canvas`, SVG, fondos y máscaras CSS), su tipo de origen y su tamaño. También si están en la cita o en un elemento interactivo, sus filtros propios y de antecesores, y lo que se pinta encima.
- **Revelado:** si el mensaje está revelado por el cursor, el foco o el atajo.

**Privacidad:**
- Solo lee el DOM. No lo modifica, no descarga nada y no hace peticiones.
- No muestra textos, nombres, teléfonos, `data-id`, `title`, `aria-label`, `alt` ni direcciones.
- Solo muestran su texto las etiquetas genéricas «Tú», «Estados», «Tú · Estados» y los separadores; un encabezado con un nombre no se muestra. Del resto, la longitud y si parece una hora o una duración.
- De las imágenes, solo el tipo de origen. Los `data-testid` se anonimizan.

**Probado en Chromium** con un DOM inventado y datos secretos: una respuesta a un estado de vídeo con miniatura como fondo `data:image/jpeg`, y una cita convencional.
- No se filtró ningún dato.
- Distinguió los dos tipos de mensaje y señaló la miniatura sin ninguna regla.

### Panel «Info. del contacto» (RF-01 desde 0.1.2-beta.13)

**Incidencia (Chrome, `0.1.2-beta.12`):** al abrir «Info. del contacto», la foto se difuminaba (RF-02), pero el nombre, el nombre de usuario, el teléfono y la descripción quedaban visibles. El propietario aprobó ampliar RF-01 a esa información, sin un interruptor nuevo.

**Diagnóstico real** (Chrome, contacto guardado de una cuenta de empresa):

```text
[data-testid="drawer-right"] › … › [data-testid="chat-info-drawer"]
  ├── header › [data-testid="contact-info-header"] › h2 «Info. del contacto»
  └── … section
        ├── div
        │     ├── foto (SVG, RF-02)
        │     ├── div (bloque de perfil)
        │     │     ├── div › … › span[data-testid="contact-info-subtitle selectable-text"]   (nombre)
        │     │     └── div › span[data-testid="selectable-text"][dir="auto"] › div › span   (usuario)
        │     ├── acciones «Llamar», «Video», «Buscar»
        │     └── [data-testid="notes-section"] › … marcador «Añade notas…»
        ├── div › [data-testid="section-phone-number"] «Número de teléfono»  +  div (valor)
        ├── div › [data-testid="section-about"] «Info.»  +  div › span › div › span (texto y emojis GIF)
        └── filas de acciones (archivos, destacados, silenciar…)
```

**Corrección** (`0.1.2-beta.13`): RF-01 difumina el nombre, el usuario, el valor del teléfono y el texto de la descripción, cada uno con un solo filtro. Los emojis quedan bajo el de su texto.
- **Selectores:** `NOMBRE_INFO_CONTACTO`, `USUARIO_INFO_CONTACTO`, `VALOR_INFO_CONTACTO` y `TEXTO_VALOR_INFO_CONTACTO`, todos dentro de `chat-info-drawer`.
- **Visibles:** el título, las etiquetas, los botones, el marcador de las notas, los contadores, los interruptores y la foto, que sigue en RF-02.
- **Revelado:** el cursor sobre un dato revela solo ese dato; Ctrl + Mayús + Espacio, todos.
- **Sin evidencia, sin cubrir:** las notas guardadas o en edición, los números no guardados, otros diseños de empresa, otros idiomas y las repeticiones del nombre en las filas inferiores, cuyos contenedores no constan.
- **Textos no atribuidos del mismo panel**, que siguen visibles y podrían ser datos personales:
  - un `span.selectable-text[data-testid="selectable-text"][title]` de 968 caracteres, no interactivo, con la misma forma que la descripción;
  - un `span[dir="auto"][title]` de 20 caracteres y un texto de 16, no interactivos;
  - los textos interactivos de 7, 13, 15 y 76 caracteres.

  Para cubrirlos hace falta la parte del árbol anonimizado posterior a `contact-info-dm-setting-row`.
- Pendiente de validación real.

### Diagnóstico anonimizado de «Info. del contacto»

**Pasos:**
1. Con RF-01 y RF-02 activadas, abre una conversación y pulsa su encabezado para abrir «Info. del contacto».
2. Deja el cursor sobre la lista de chats, sin pulsar ninguna tecla.
3. Abre la consola (F12), pega [`scripts/diagnostico-info-contacto.js`](../scripts/diagnostico-info-contacto.js) y pulsa Intro.
4. Repite con un contacto guardado, con un número no guardado y, si los tienes, con un contacto con notas y con una empresa.
5. Comparte, de cada ejecución, el resumen, las tablas, el JSON y la estructura anonimizada.

**Qué muestra:**
- La raíz del panel (`drawer-right` o, si no existe, su antecesor de al menos media ventana fuera de la conversación) y el esqueleto anonimizado.
- Cada texto, con su clase:
  - **Genérico:** de una lista cerrada en español e inglés («Número de teléfono», «Llamar», «Buscar», «Notas»…), tal cual.
  - **Resto, anonimizado:** la longitud y su forma: parece un teléfono, empieza por «~» o «@», contador, fecha, coincide con el nombre del chat.
- Las imágenes, con las reglas de RF-02 que las alcanzan.
- Los campos de las notas: su marcador de posición (genérico o no) y la longitud de su contenido.

**Privacidad:**
- Solo lee el DOM. No lo modifica, no descarga nada y no hace peticiones.
- No muestra nombres, teléfonos, nombres de usuario, descripciones, notas, `title`, `aria-label`, `alt` ni direcciones.
- Los `data-testid` se anonimizan.

**Probado en Chromium** con un DOM inventado y datos secretos (nombre, usuario, teléfono, descripción, nota y foto).
- No se filtró ningún dato.
- Distinguió cada dato personal de los textos genéricos y de los controles.

### Llamadas (RF-01, RF-02 y RF-04, corrección en 0.1.3-beta.0)

**Incidencia (Chrome, `0.1.2`):**
- **Panel flotante de una llamada en curso:** el nombre del contacto, el avatar y la duración quedan visibles.
- **Tarjetas de llamada de la conversación:** «Llamada», «Sin respuesta», «Llamando…», la duración y otros estados también.

**Diagnóstico real** (Chrome, llamada de voz; ventana principal, sin marcos, con Veilix cargado):

```text
[data-testid="move_resize_component"]   (fuera de #main)
  › [data-testid="voip-container-audio-call"]
      ├── avatar                                         (ya difuminado por RF-02)
      ├── [data-testid="voip-call-participant-info-name"] › span[dir="auto"]   (nombre)
      ├── [data-testid="voip-call-participant-info-call-state-text"]           (estado)
      └── [data-testid="voip-call-timer"][role="timer"]                        (duración)
  barra de controles aparte (micrófono, cámara, colgar)

[data-testid="msg-container"] › tarjeta interactiva
  › [data-testid="call-log-system-message"]
      ├── [data-testid="call-log-icon-chip"]   (icono)
      ├── div   (título, como «Llamada»)
      ├── span  (estado o duración)
      └── [data-testid="msg-meta"]              (hora, ya difuminada por RF-04)
```

**Corrección** (`0.1.3-beta.0`):
- **RF-01** (`NOMBRE_LLAMADA`): el nombre del panel.
- **RF-04** (`DATOS_PANEL_LLAMADA`): el estado y la duración del panel.
- **RF-04** (`TEXTO_REGISTRO_LLAMADA`): los textos finales de cada tarjeta (título, estado y duración), en cualquier idioma, sin el icono ni `msg-meta`.
- **Lo que nunca se difumina:** el panel entero, la barra de controles, la tarjeta ni su icono.
- **Cómo funciona:** solo CSS, cada interruptor por separado, con revelado por cursor y atajo.
- **Sin evidencia:** las llamadas entrantes, rechazadas, de vídeo y de grupo.
- **Validación real:** el propietario confirmó en Google Chrome que la corrección funciona en las variantes observadas, que son una llamada de voz en curso y tarjetas de llamada. Está incluida en la estable `0.1.3`.

**Antes del diagnóstico** (`0.1.2`):
- **Avatar:** si es una foto de `pps.whatsapp.net`, quizá ya lo difumine la regla general de RF-02.
- **Dónde se ejecuta Veilix:** el script de contenido solo se inyecta en el marco principal de `https://web.whatsapp.com/*` (sin `all_frames` ni `match_about_blank`). Si WhatsApp muestra la llamada en un `iframe` o en otra ventana, Veilix no se ejecuta allí. El diagnóstico lo indica.
- **Tarjetas de la conversación:** RF-04 solo difumina en los mensajes el texto `[data-pre-plain-text]` o `.selectable-text`, la multimedia y la hora de `msg-meta`. Si la tarjeta usa `span` propios, no la alcanza ninguna regla.

**Pasos:**
1. Con RF-01, RF-02 y RF-04 activadas, durante una llamada en curso con el panel flotante a la vista, abre la consola (F12), pega [`scripts/diagnostico-llamadas.js`](../scripts/diagnostico-llamadas.js) y pulsa Intro. Deja el cursor fuera del panel y no pulses ninguna tecla.
2. Si la llamada se abre en una ventana aparte, repite en la consola de esa ventana.
3. Repite con una conversación que tenga tarjetas de llamada a la vista: perdida, sin respuesta y finalizada con duración.
4. Comparte el resumen, la tabla, el JSON y la estructura anonimizada de cada ejecución.

**Qué muestra:**
- **El contexto:** ventana principal, emergente o marco; si Veilix está cargado en ese documento; y los marcos de la página.
- **El panel flotante:** lo localiza fuera de `#main` por indicios genéricos (textos de llamada de una lista cerrada, duraciones, iconos y `data-testid` de llamada) y por su posición fija o `role="dialog"`.
- **Las tarjetas de llamada:** los mensajes de `#main` con esos indicios.
- **El detalle:** el esqueleto anonimizado y una tabla de textos, imágenes y controles, con las reglas de RF-01, RF-02 y RF-04 que los alcanzan, las marcas de Veilix y el filtro.

**Privacidad:**
- Solo lee el DOM. No interactúa con la llamada.
- No muestra nombres, teléfonos, duraciones, horas, `aria-label` ni la ruta completa de la página.
- Solo muestra tal cual los textos genéricos de la interfaz de llamadas («Colgar», «Llamada de voz perdida»…).

**Probado en Chromium** con un DOM inventado y datos secretos: un panel flotante con foto, nombre, duración y controles, dos tarjetas de llamada y un marco. Distinguió los datos personales de los textos genéricos y de los controles, y no filtró ningún dato.

**Pruebas manuales en Chrome de `0.1.3-beta.0`** (solo el propietario puede marcarlas como superadas):
- **Llamadas:** entrante, saliente, perdida, rechazada, sin respuesta, finalizada con duración y en curso; de voz y de vídeo.
- **Controles:** contestar, rechazar, colgar, silenciar, cámara y opciones siguen funcionando, también con el teclado.
- **Revelado:** el revelado temporal funciona y la protección se restaura después.
- **Aparición:** el panel queda protegido al aparecer, sin recargar.

### Sugerencias de menciones en grupos (RF-01, corrección en 0.1.4-beta.0)

**Incidencia (Chrome, `0.1.3`):** al escribir `@` en un grupo, la lista de participantes que se pueden mencionar deja los nombres visibles con RF-01 activada. Los avatares sí se difuminan con RF-02.

**Información secundaria (corrección en `0.1.6-beta.0`):** con `0.1.5`, el propietario mostró en Chrome una captura con cuatro sugerencias. El nombre principal se veía difuminado, pero debajo quedaba visible una segunda línea con nombres personales y emojis, probablemente el nombre de perfil de WhatsApp.
- **Cambio de criterio:** en el grupo del diagnóstico `mention-secondary` estaba vacío, y por eso no se difuminaba. Con esta evidencia, `0.1.6-beta.0` lo difumina (`SECUNDARIO_MENCION_CONTACTO`), con un único filtro y revelado con la fila, sin la descripción de «todos».
- **Sin confirmar en el DOM:** que el texto esté en `mention-secondary` se deduce por su posición. Pendiente de validación real. Si no se difuminara, la inspección del texto con DevTools («Inspeccionar») o `scripts/diagnostico-menciones.js` dirá dónde está.

**Validación real:** el 10 de noviembre de 2026, el propietario confirmó en Google Chrome que «todo funciona sin problemas» con `0.1.4-beta.1`, que incluye esta corrección (confirmación general, sin detalle de cada prueba manual de abajo). Está incluida en la estable `0.1.4`.

**Diagnóstico real** (Chrome, `scripts/diagnostico-menciones.js`; Veilix cargado, cuatro filas, sin filtros dobles ni controles difuminados):

```text
lista de sugerencias                                   (fuera de #main)
  ├── [data-testid="mention-all-list-item"]            («todos» y una descripción genérica)
  └── button                                           (una por participante, tres observadas)
        └── [data-testid="contact-mention-list-item"]  (hijo directo del botón)
              ├── img                                  (avatar, ya difuminado por RF-02)
              ├── [data-testid="mention-primary"] › span[dir="auto"]   (nombre, visible)
              └── [data-testid="mention-secondary"]                    (sin texto observado)
editor: aria-autocomplete, aria-owns, aria-activedescendant
```

**Causa:** RF-01 solo difumina nombres en zonas concretas, y ninguna de sus reglas alcanzaba esta lista. La regla genérica de filas de contacto (`esFilaContacto`, hipótesis) exige un rol de fila (`listitem`, `row` o `button` como atributo) y un único avatar SVG con máscara. Aquí la fila es un elemento `button` y el avatar, un `img`. RF-02, en cambio, difumina las fotos de perfil por su origen en cualquier zona.

**Corrección** (`0.1.4-beta.0`, solo CSS, en RF-01):
- **Fila** (`FILA_MENCION_CONTACTO`): `button:has(> [data-testid="contact-mention-list-item"])`, que delimita el revelado.
- **Nombre** (`NOMBRE_MENCION_CONTACTO`): `[data-testid="contact-mention-list-item"] [data-testid="mention-primary"]`. Recibe un único filtro; el `span` interior no recibe otro.
- **Lo que nunca se difumina:** el botón, la lista, la opción «todos» (el nombre se acota a `contact-mention-list-item`, así que no la alcanza aunque tenga su propio `mention-primary`), su icono, `mention-secondary`, el avatar (RF-02, sin cambios) y el editor.
- **Revelado:**
  - **Cursor:** sobre una sugerencia, revela solo su nombre.
  - **Atajo:** revela todos los nombres.
  - **Foco de teclado:** el nombre solo se revela si el foco real llega al botón (`:focus-visible`). El diagnóstico muestra que el editor usa `aria-activedescendant`, así que al recorrer la lista con las flechas el foco probablemente se queda en el editor y los nombres siguen difuminados. No se ha cambiado la interacción de WhatsApp para evitarlo: para leer un nombre con el teclado, el atajo sigue disponible.
- **Sin evidencia:** el contenido de `mention-secondary` cuando no está vacío, que no se protege; la estructura interior de «todos»; y si el foco real pasa alguna vez a los botones.

**Pruebas automatizadas** (DOM simulado; no demuestran compatibilidad con WhatsApp Web real):
- `tests/navegador/menciones.test.ts`: 17 por motor. Sin la regla fallan 9.
- `tests/difuminado/selectores-menciones.test.ts`: 4.
- `tests/navegador/interruptores.test.ts` y `npm run test:extension`: también comprueban las menciones.

**Pruebas manuales en Chrome de `0.1.4-beta.0`** (solo el propietario puede marcarlas como superadas):
1. Con RF-01 y RF-02 activadas, en un grupo, escribe `@`. Los nombres de los participantes deben verse difuminados, «todos» nítido y los avatares difuminados. Prueba también con participantes no guardados («~» o número).
2. Escribe una letra después de `@`: la lista filtrada también debe quedar difuminada.
3. Recorre la lista con las flechas y elige con Intro. La mención debe insertarse con el nombre correcto. Anota si, al moverte con las flechas, algún nombre se revela.
4. Elige otra sugerencia con el ratón, también sobre «todos», y envía el mensaje.
5. Pasa el cursor por una sugerencia: solo se revela su nombre. Al apartarlo se vuelve a difuminar. Pulsa Ctrl + Mayús + Espacio: se revelan todos mientras lo mantienes.
6. Cierra y abre la lista varias veces, y cambia a otro grupo.
7. Desactiva RF-01: los nombres se ven y los avatares siguen difuminados. Desactiva RF-02 con RF-01 activa: los avatares se ven y los nombres siguen difuminados.
8. Comprueba que el resto de RF-01 a RF-05 funciona como en `0.1.3`.

#### Diagnóstico anonimizado de las sugerencias de menciones

**Pasos:**
1. Con RF-01 y RF-02 activadas, abre un grupo y escribe solo `@` en el campo de mensajes, para que la lista muestre a todos los participantes.
2. Abre la consola (F12), pega [`scripts/diagnostico-menciones.js`](../scripts/diagnostico-menciones.js) y pulsa Intro. Deja el cursor fuera de la lista y no pulses ninguna tecla.
3. Si la lista se cierra al pasar a la consola, el diagnóstico lo indica y se repite una vez a los 8 segundos. En ese tiempo, haz clic al final del campo de mensajes, o vuelve a escribir `@`, y aparta el cursor. También puedes activar «Emulate a focused page» en «Rendering» y volver a ejecutarlo.
4. Si puedes, repite con un participante no guardado a la vista: los que WhatsApp muestra con «~» o con su número.
5. Comparte el resumen, las tablas, el JSON y la estructura anonimizada.

**Qué muestra:**
- **El contexto:**
  - si Veilix está cargado y si el atajo está pulsado;
  - si la página y el editor tienen el foco;
  - los atributos ARIA del editor (`aria-controls`, `aria-activedescendant`, `aria-autocomplete`, `aria-expanded`), solo como presencia o valor genérico, y si apuntan a la lista.
- **El contenedor de sugerencias:** cada candidato, con los indicios que lo encontraron:
  - los atributos ARIA del editor;
  - `role="listbox"`;
  - un `data-testid` de mención o sugerencia;
  - el antecesor común de dos o más avatares;
  - el texto genérico «todos».

  Indica su zona: dentro de `#main footer`, dentro de `#main` o fuera de `#main`.
- **Las filas:** el tipo de cada una (participante con avatar, opción «todos» o sin avatar), su rol, `aria-selected`, sus `span[title]` y `span[dir="auto"]`, sus avatares, los controles que contiene y si la fila completa tiene filtro.
- **Cada texto, avatar y control:** las reglas de RF-01, RF-02, RF-04 y RF-05 que lo alcanzan, las marcas de Veilix, dónde está el filtro y si hay **dos filtros apilados** (`FILTRO-DOBLE`).
- **La estructura anonimizada:** el contenedor, sus cuatro primeras filas y la de «todos».

**Privacidad:**
- Solo lee el DOM. No mueve el foco, no pulsa teclas y no selecciona ninguna sugerencia.
- No muestra nombres, teléfonos, el texto del campo de mensajes, `id`, `data-id`, `title`, `aria-label` ni `alt`.
- Solo muestra tal cual los textos genéricos de una lista cerrada, como «todos», «everyone», «@» o «Tú». Del resto, da la longitud y la forma (parece teléfono, empieza por «~» o «@», coincide con su `title` o con el nombre del chat), comparadas en el navegador sin mostrarlas.

**Probado en Chromium** con un DOM inventado y datos secretos, en tres variantes:
- una lista ARIA dentro de `#main footer`;
- una lista sin roles fuera de `#main`;
- una lista que aparece después de la primera ejecución, para probar el reintento.

Encontró el contenedor y la opción «todos» en las tres. Distinguió los participantes, los teléfonos y los «~», y no filtró ningún dato.

### Etiquetas de miembro en grupos (RF-01, corrección en 0.1.4-beta.1)

**Incidencia (Chrome, `0.1.4-beta.0`):** en un grupo, la etiqueta de miembro («Member Tag») de un participante queda visible con RF-01 y RF-04 activadas, aunque su nombre y el mensaje se difuminan. Es un apodo, rol o descripción que el grupo asigna a cada miembro.

**Estado:** corregido en `0.1.4-beta.1` (`ETIQUETA_MIEMBRO`, solo CSS, en RF-01). El 10 de noviembre de 2026, el propietario confirmó que `0.1.4-beta.1` funciona en Google Chrome. Es una confirmación general, sin detalle de cada prueba manual de abajo. Las variantes sin evidencia (citas, «Info. del grupo», participantes, mensajes propios, etiquetas solo de emojis) siguen pendientes. Debajo se conserva el historial del diagnóstico.

**Evidencia final (Chrome, inspección sobre `0.1.4-beta.0`):** el propietario eligió la etiqueta en DevTools y comprobó visualmente que el único elemento de la variante V5 (`[data-veilix-inspeccion="V5-1"]`) era exactamente el apodo.

**Corrección** (`0.1.4-beta.1`):
- **Selector** (`ETIQUETA_MIEMBRO`): dentro de `[data-testid="msg-container"]`, el `span` sin hijos que es el único hijo de un `div[role="button"][tabindex="0"]`.
  - **El control:** sin `data-testid`, imágenes, iconos ni otros controles, y fuera del autor, la cita, la hora y el cuerpo.
  - **Su posición:** está en la rama hermana inmediatamente posterior a una rama que contiene al autor (no a una cita).
- **Restricción añadida a V5, coherente con la evidencia** (la etiqueta está separada del autor y del cuerpo): la rama de la etiqueta no puede contener el autor, el cuerpo, una cita ni la hora. Excluye, por ejemplo, un «Leer más» de la misma forma que comparta rama con el cuerpo.
- **Criterios descartados:** no usa la longitud, el texto, el idioma, las clases ni el `style` en línea.
- **Filtro y revelado:** un único filtro, en el `span`. Está en la misma regla que el autor, así que se revela con el mensaje (cursor, o foco de teclado dentro, por ejemplo en el propio control) y con el atajo.
- **Lo que nunca se difumina:** el control (sigue recibiendo clics y foco), la cabecera y el autor, que mantiene su filtro. RF-02 y RF-04 no cambian.
- **Interacción con RF-04:** una etiqueta formada solo por emojis podría reconocerla también el marcador de reacciones de RF-04. Sería el mismo elemento, sin filtros superpuestos, pero con RF-01 desactivado seguiría difuminada. Sin evidencia.
- **Sin evidencia:** las etiquetas en citas, en «Info. del grupo», en la lista de participantes, en mensajes propios y en el recuadro «Responder».

**Pruebas automatizadas** (DOM simulado; no demuestran compatibilidad con WhatsApp Web real):
- `tests/navegador/etiquetas-miembro.test.ts`: 15 por motor; sin la regla fallan 7.
- `tests/difuminado/selectores-etiqueta-miembro.test.ts`: 8, con casos negativos de controles de forma parecida y ninguna coincidencia en los mensajes ya simulados.
- `tests/navegador/interruptores.test.ts` y `npm run test:extension` (un mensaje que aparece después, con un «Leer más» de la misma forma).

**Pruebas manuales en Chrome de `0.1.4-beta.1`** (solo el propietario puede marcarlas como superadas):
1. Con RF-01 activada, en un grupo con etiquetas, las etiquetas se ven difuminadas junto al autor difuminado.
2. Con el cursor sobre el mensaje, se revelan la etiqueta y el autor de ese mensaje, y al salir se difuminan. Con Ctrl + Mayús + Espacio se revelan todas mientras se mantiene.
3. Al hacer clic en la etiqueta, el control funciona como sin Veilix.
4. No se difuminan: «Leer más», reacciones, stickers, documentos, citas, la hora, el cuerpo (con RF-04 desactivado) ni otros controles.
5. Con RF-01 desactivada, las etiquetas se ven. Con RF-02 y RF-04, sin RF-01, también.
6. Comprueba también: mensajes consecutivos, mensajes nuevos que llegan y cambio de grupo.
7. Si las ves, anota si aparecen etiquetas en citas, «Info. del grupo», participantes o mensajes propios, y si quedan visibles.

**Primera ejecución real** (Chrome, `0.1.4-beta.0`, resumen del propietario):
- **Mensajes:** examinó diez, cinco de ellos con autor.
- **Un único texto adicional visible:** `span[style] texto(8) T4`, en la zona «OTRO (dentro de un control)», sin ninguna regla de Veilix ni difuminado. Aparece después y debajo del autor del mensaje 2.
- **Por qué no basta:** sin la cadena de antecesores ni el control que lo contiene, no se puede fijar un selector. La longitud del texto y el `style` en línea no son criterios válidos. Por eso se añadió la sección focalizada.

**Segunda ejecución real (sección focalizada, resumen del propietario):**
- **Candidato C1:** un `span` con atributos `class` y `style`, dentro de un `div[role="button"][tabindex="0"]`.
- **Ese control contiene un único texto.** Está separado del autor y del cuerpo, y su antecesor común con ambos es el que contiene los elementos del mensaje.
- **Sin filtros de Veilix;** el propio `span` es la unidad mínima.
- **Falta confirmar visualmente** que C1 sea la etiqueta.

**Decisión previa (9 de noviembre de 2026, antes de la inspección): no se implementa todavía.** La estructura conocida no permite una selección segura:
- **Control muy común:** en `msg-container`, `div[role="button"][tabindex="0"]` es la forma de muchos controles. Las estructuras confirmadas lo usan para el sticker, la cita y su duración, y el documento.
- **Ruta desconocida:** no se conoce la ruta del control hasta `msg-container` (profundidad, `data-testid`, hermanos).
- **Sin pruebas negativas:** nada muestra qué otros controles con un solo `span` hay en los mensajes, como «Leer más», vistas previas de enlaces, encuestas o mensajes de empresa.
- **Criterios descartados:** la longitud, el texto, el idioma y las clases o el `style` generados no son criterios válidos, y una regla global como `div[role="button"] > span` queda descartada.
- **Riesgo comprobado:** en un DOM inventado verosímil, las variantes estructurales genéricas también alcanzan un «Leer más» y una reacción con la misma forma. Difuminar a ciegas podría ocultar controles ajenos, así que se prepara una inspección puntual.

**Inspección puntual con DevTools** ([`scripts/inspeccion-etiqueta-miembro.js`](../scripts/inspeccion-etiqueta-miembro.js)):
- **Elemento:** trabaja sobre el que elige el propietario: clic derecho sobre la etiqueta → «Inspeccionar», que la consola expone como `$0`. Si no hay selección, usa el candidato C1 del diagnóstico. Así la identidad no depende de ninguna heurística.
- **Cadena:** muestra la de antecesores hasta `msg-container`, con los nombres de todos los atributos y los valores estructurales, la posición entre hermanos y un resumen de los hermanos (autor, cuerpo, cita, hora, imágenes, iconos, controles, textos).
- **Ramas:** muestra la relación entre la rama de la etiqueta y las del autor y el cuerpo dentro del antecesor común, y si son contiguas.
- **Colisiones medidas, sin aplicar nada:** para cada variante de selector posible, cuántos elementos de la conversación alcanza, si incluye la etiqueta elegida y qué son los demás (zona, si el mensaje tiene autor, si siguen la misma ruta, que indicaría otra etiqueta). Variantes:
  - **V1:** un control con un `span` como único hijo;
  - **V2:** sin `data-testid`, medios, iconos ni otros controles;
  - **V3:** fuera del autor, la cita, la hora y el cuerpo;
  - **V4:** solo en mensajes con autor;
  - **V5:** en la rama inmediatamente posterior a la del autor. Es la hipótesis más específica, sugerida por «después y debajo del autor».
- **Marca en pantalla durante 60 segundos:** la etiqueta elegida con borde continuo y las colisiones con borde discontinuo, mediante el atributo temporal `data-veilix-inspeccion`, que se retira solo.
- **Privacidad:** no muestra nombres, etiquetas, mensajes, `id`, `data-id`, `title`, `aria-label`, `alt`, `style` ni clases. De estos atributos solo indica que existen.
- **Probado en Chromium** con un DOM inventado y datos secretos: dos etiquetas, un «Leer más», un sticker, una cita, una reacción y un documento.
  - V1 a V4 alcanzaron también el «Leer más» y la reacción.
  - V5 solo alcanzó las dos etiquetas.
  - No filtró ningún dato.

  Que V5 sea segura en WhatsApp Web real es lo que debe medir la inspección.

**Criterio para implementar `0.1.4-beta.1`:** una variante que, en conversaciones reales con mensajes largos, enlaces, encuestas, stickers, documentos, citas y reacciones, alcance la etiqueta elegida y solo etiquetas. Si ninguna lo consigue, hará falta otro atributo o relación discriminante.

**Hallazgo independiente: filtro doble en el autor de una cita.**
- **Origen:** lo detectaron las ejecuciones reales. Lo producen RF-01, que difumina el autor (`[data-testid="author"]`), y RF-04, que difumina un antecesor de ese autor.
- **Sin cambios:** no se corrige en esta intervención porque no se ha demostrado que cause una regresión (el autor queda difuminado en ambos casos).
- **Pendiente:** confirmar qué antecesor y en qué tipo de cita ocurre, y si afecta a la independencia de los interruptores (con RF-01 desactivado, el autor seguiría difuminado por RF-04).

**Hipótesis (sin confirmar):**
- **Por qué queda visible:** RF-01 difumina el nombre por su estructura `[data-testid="author"]` (el más externo), y RF-04, el cuerpo del mensaje (`[data-pre-plain-text]`, `.selectable-text`). Si la etiqueta es un elemento aparte, fuera de ambos, como un hermano del autor, ninguna regla la alcanza.
- **Riesgo ya registrado:** ver [Remitentes no guardados](#remitentes-no-guardados-en-grupos-corrección-en-012-beta1). Un dato junto al nombre pero fuera del `author` sigue visible.

**Sección focalizada** (añadida al mismo diagnóstico tras la primera ejecución). Analiza cada texto OTRO no genérico de un mensaje (candidato C1, C2…):
- **Su cadena de antecesores hasta el mensaje:** de cada nivel, si contiene al autor o al cuerpo, si es un control, su filtro y qué selector de Veilix lo difumina.
- **Sus atributos:** solo los nombres; también los nombres de las propiedades del `style` en línea. Su aspecto: color, peso, tamaño y `display`.
- **El control que lo contiene:** qué incluye (el autor, el cuerpo, imágenes, iconos, cuántos textos), sus atributos ARIA y si es el mismo control que el del autor.
- **Su firma estructural:** la ruta de etiquetas, roles y `data-testid` desde `msg-container`. Indica cuántos candidatos la comparten, como indicio de un contenedor reutilizable.
- **La unidad mínima que podría difuminar RF-01:** el antecesor más alto que solo contiene ese texto, sin controles, autor, cuerpo ni imágenes. Indica si ya tiene un filtro de Veilix y si algún antecesor tiene filtro, lo que provocaría filtros superpuestos.
- **Filtros dobles:** cada elemento filtrado de la cadena, con el selector exacto de Veilix que lo difumina y la regla conocida que coincide con ese mismo elemento.

  Los selectores salen de las hojas reales de Veilix en la página (`style[data-veilix-estilo]`), así que no dependen de una copia.
- **Marca en pantalla:** cada candidato queda rodeado con un borde discontinuo durante 60 segundos, mediante el atributo temporal `data-veilix-diagnostico-candidato` y una hoja `style[data-veilix-diagnostico]`. Se retiran solos, y también al volver a ejecutar el diagnóstico. No cambian ningún texto ni nodo de WhatsApp. En las herramientas de desarrollo, se localizan con `[data-veilix-diagnostico-candidato="C1"]`.

**Pasos:**
1. Con RF-01, RF-02 y RF-04 activadas, abre el grupo y desplázate hasta que se vea un mensaje con una etiqueta de miembro.
2. Deja el cursor sobre la lista de chats, sin pulsar ninguna tecla. Abre la consola (F12), pega [`scripts/diagnostico-etiquetas-miembro.js`](../scripts/diagnostico-etiquetas-miembro.js) y pulsa Intro.
3. Cuando la consola lo indique, coloca el cursor sobre el mensaje con la etiqueta y déjalo quieto. A los 8 segundos se hace la segunda pasada.
4. Si puedes, repite con un mensaje propio, con una respuesta a un participante con etiqueta y con «Info. del grupo» › participantes abierto.
5. Comparte el resumen, las tablas, el JSON y la estructura anonimizada de cada ejecución, también la sección focalizada (`Veilix · sección focalizada (JSON)`). Indica qué candidato (C1, C2…) rodea el borde discontinuo de la etiqueta y, si lo ves, a qué cita corresponde el filtro doble.

**Qué muestra:**
- **Zona de cada texto de un mensaje:**
  - autor, que ya difumina RF-01;
  - cuerpo, que difumina RF-04;
  - hora y estado (`msg-meta`);
  - cita: su autor, su texto y cualquier otro texto;
  - **OTRO:** cualquier texto fuera de esas zonas. Ahí debería estar la etiqueta.
- **De cada texto OTRO:**
  - su relación con el autor: si es hermano, si va antes o después, si está en la misma línea y cuántos niveles hay hasta el antecesor común;
  - su relación con el cuerpo;
  - los `data-testid` de su cadena;
  - las reglas de Veilix que lo alcanzan, las marcas, dónde está el filtro y si hay dos filtros apilados (`FILTRO-DOBLE`).
- **Estructura anonimizada:** la del antecesor común del autor y los textos OTRO de cada mensaje.
- **Otras zonas, sin ampliar nada:** el recuadro «Responder» y las filas con avatar del panel derecho («Info. del grupo», participantes).
- **Revelado:** compara el filtro de cada texto entre la primera pasada, con el cursor fuera, y la segunda, con el cursor sobre el mensaje. También indica si el cursor estaba sobre el mensaje o sobre el propio texto, si había foco dentro y si el atajo estaba pulsado.

**Privacidad:**
- Solo lee el DOM. No mueve el foco ni pulsa teclas.
- No muestra nombres, etiquetas, teléfonos, mensajes, `id`, `data-id`, `title`, `aria-label`, `alt` ni `data-pre-plain-text`.
- Solo muestra tal cual los textos genéricos de una lista cerrada («Admin», «Tú», «Reenviado»…).
- Del resto, da la longitud, la forma (parece teléfono, hora, empieza por «~») y una clase anónima («T1», «T2»…). La clase solo indica qué textos son iguales entre sí en cualquier zona, sin mostrarlos.

**Probado en Chromium** con un DOM inventado y datos secretos:
- un mensaje recibido con etiqueta y teléfono junto al autor;
- otro participante con otra etiqueta;
- un mensaje enviado;
- una cita con autor y etiqueta;
- el recuadro «Responder»;
- una fila de participantes con la etiqueta.

Encontró las etiquetas como texto OTRO, hermano del autor y en la misma línea, y reconoció la misma etiqueta en el mensaje y en el panel. Midió que el cursor revela el autor y no la etiqueta, y no filtró ningún dato.

**Sección focalizada, probada con la extensión compilada `0.1.4-beta.0`** (Chromium de Playwright, con RF-01, RF-02 y RF-04 activados desde el panel real) sobre un DOM inventado. Ese DOM reproduce la evidencia: un `span[style]` de 8 caracteres dentro de un control con el autor, debajo de él. Incluye también una cita con dos filtros en su autor.
- Encontró el candidato C1 y lo marcó en pantalla.
- Recorrió su cadena hasta el mensaje y propuso como unidad su `div` contenedor, sin filtros superpuestos.
- Atribuyó cada filtro del autor de la cita a su módulo: RF-01 (autor) y RF-04 (texto).
- No filtró ningún dato ni dio errores.

**Pendiente tras la evidencia:**
- **Implementación:** con RF-01, un único filtro sobre la etiqueta, sin depender del texto ni del idioma y sin filtros superpuestos con el nombre.
- **Revelado:** decidir si la etiqueta se revela con el mensaje, como el autor, o con el propio elemento.
- **Variantes:** cada una necesita su evidencia (mensajes enviados, citas, «Info. del grupo» y participantes).

### Diagnóstico anonimizado de vídeos visibles

**Qué cubre RF-04** (`MULTIMEDIA_MENSAJE` y `MINIATURA_VIDEO`):
- Elementos: `img` de origen `blob:` o `data:image/jpeg`, `video` (con su `poster`), `canvas`, fondos **en línea** con `blob:` y, desde `0.1.2-beta.7`, las capas con fondo `data:image/jpeg` de `video-content`.
- Ubicación: solo dentro de un mensaje de `#main` (fila `[data-id]` o `msg-container`).

**Qué queda fuera:**
- Una `img` con otro origen (`data:image/png`, `data:image/webp` o un recurso de WhatsApp).
- Fondos CSS con `data:` fuera de `video-content`, o definidos en una hoja de estilos.
- Imágenes fuera de los mensajes, como la miniatura de un aviso fijado.
- Lo revelado en ese momento: con el cursor o el foco del teclado sobre el mensaje, o con el atajo pulsado.

**Pasos:**
1. Con RF-04 activada, abre la conversación y desplázala hasta que **los dos vídeos** se vean a la vez.
2. Deja el cursor sobre la lista de chats, sin pulsar ninguna tecla. Si has hecho clic en el vídeo, haz clic en un hueco de la lista de chats.
3. Abre la consola (F12), pega [`scripts/diagnostico-videos.js`](../scripts/diagnostico-videos.js) y pulsa Intro.
4. Comparte el resumen, la tabla y el JSON. Indica qué número de la tabla corresponde al vídeo visible («A») y cuál al difuminado («B»): la columna `posicion` ayuda a reconocerlos.

**Qué muestra cada elemento que pinta una imagen** (de al menos 40 × 40 px):
- **Posición y tamaño** en pantalla.
- **Qué lo pinta:** `img` y su tipo de origen; `video`, su `poster` y si se reproduce; `canvas`; SVG con `<image>`; fondos, máscaras o `content` CSS, también en pseudoelementos.
- **Dónde está:** la zona (mensaje, fila sin `msg-container`, encabezado, pie, fuera de los mensajes o fuera de `#main`), si es enviado o recibido, y si está en una cita o en un botón.
- **Filtros:** si lo alcanza el selector de multimedia de RF-04; `filter` y `backdrop-filter` propios, y qué antecesor tiene filtro.
- **Revelado:** si la fila o el contenedor tienen `:hover`, `:focus-visible` o el foco dentro, y si el atajo está pulsado.
- **Capas del vídeo:** su relación con las demás del mismo `video-content` (hermana, antecesora o descendiente) y si el filtro va en línea.
- **Capas:** lo que se pinta encima de su centro, por si una capa sin difuminar tapa a la difuminada.

**Privacidad:**
- Solo lee el DOM. No lo modifica, no descarga nada y no hace peticiones.
- No muestra textos, nombres, teléfonos, `data-id`, `title`, `aria-label`, `alt` ni direcciones.
- Del `data-id` solo deduce si el mensaje es enviado o recibido.
- De las imágenes solo indica el tipo de origen.
- Los `data-testid` se anonimizan: números, lo que sigue a «@», fragmentos con mayúsculas y fragmentos largos.

**Probado en Chromium** con un DOM inventado: un vídeo como fondo `data:image/jpeg`, otro como `img` de `blob:`, un `video` con `poster` y la miniatura de un aviso fijado, con datos secretos.
- No se filtró ningún dato.
- Distinguió los elementos difuminados de los visibles.
- Detectó el cursor y el foco del teclado sobre el mensaje.

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

Estado de la versión `0.1.6`. Las columnas distinguen tres tipos de evidencia:

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

- **Motor de difuminado (simulado):** las 332 pruebas de `tests/navegador` en cada motor:

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
  | Autores por estructura (RF-01) | 9 |
  | Avatares de «Nuevo chat» (RF-02) | 9 |
  | Avatares de participantes en grupos (RF-02) | 9 |
  | «Info. del mensaje» (RF-04): texto y stickers | 16 |
  | Independencia de los cinco interruptores | 19 |
  | Tarjetas del panel (desbordamiento y teclado) | 4 |
  | Miniaturas de vídeo (RF-04), capas hermanas y anidadas | 28 |
  | Documentos adjuntos (RF-04) | 16 |
  | Miniaturas y duraciones de citas (RF-04) | 18 |
  | Encabezado de los estados citados (RF-04) | 11 |
  | «Info. del contacto» (RF-01 y RF-02) | 16 |
  | Llamadas (RF-01, RF-02 y RF-04) | 18 |
  | Sugerencias de menciones (RF-01) | 18 |
  | Etiquetas de miembro (RF-01) | 15 |
 Comprueban el CSS calculado, el revelado con cursor, Tab y atajo, la escritura, los clics y los cambios dinámicos.
- **Extensión cargada (simulado):** `npm run test:extension`. Carga el paquete compilado, lo usa desde su panel real, bloquea la red y sirve una página simulada en `web.whatsapp.com`. Playwright solo puede cargar extensiones en Chromium.
- **WebKit de Playwright no es Safari:** comparte el motor de renderizado, pero no la integración de extensiones de Safari (permisos por sitio, almacenamiento, ventana emergente), ni el sistema macOS ni la versión exacta de Safari.

Cuando se pruebe una combinación real, sustituye ⏳ por ✅ o ❌ e indica la versión del navegador, el sistema y la fecha.

**Chrome, sistema operativo sin indicar:**
- ✅ Validación funcional del propietario con `0.2.0-beta.8` (RF-01 a RF-05).
- ✅ Validación parcial de `0.1.1-beta.0` y `0.1.1-beta.2`.
- ✅ `0.1.1-beta.3`: información secundaria de «Nuevo chat», remitentes en grupos y sin regresiones. La regresión de remitentes de beta.2 no volvió a manifestarse; su causa sigue sin conocerse.
- ⏳ `0.1.1` (y los cambios visuales de beta.4 y beta.5) sin probar.

- ✅ `0.1.4-beta.1` (mismo código que `0.1.4` y `0.1.5`): «todo funciona sin problemas», comunicado por el propietario el 10 de noviembre de 2026.

**Brave, sistema operativo y versión exacta sin indicar:**
- ✅ Funciona sin problemas con el código de `0.1.4` y `0.1.5`, que es el mismo, comunicado por el propietario el 10 de noviembre de 2026 (confirmación general, sin detalle por caso). Es la segunda prueba real, después de Chrome. Las observaciones anteriores de Brave, con `0.2.0-beta`, están más abajo.

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
  - No se cubren las encuestas, los contactos compartidos, la ubicación ni las notas de voz, salvo que incluyan alguno de los elementos anteriores. Los documentos adjuntos se cubren desde `0.1.2-beta.8` (nombre, formato y tamaño) y `0.1.2-beta.9` (etiqueta del icono); ver [Documentos adjuntos](#documentos-adjuntos-corrección-en-012-beta8).
  - El revelado se delimita por mensaje.
- **«Info. del contacto» (RF-01, desde `0.1.2-beta.13`).** Solo se cubren el nombre, el usuario, el teléfono y la descripción de la estructura observada (un contacto guardado de una cuenta de empresa). Las limitaciones están en [Limitaciones conocidas de 0.1.2](#limitaciones-conocidas-de-012).
- **Nombres de remitentes en la conversación (RF-01, desde `0.1.1-beta.0`).**
  - Se reconocen comparando el texto visible con los nombres de `data-pre-plain-text` de la conversación abierta. El atributo está confirmado, pero el formato «[hora, fecha] Nombre: » es una hipótesis. Si no coincide, no se difumina nada.
  - El remitente de un mensaje **sin texto** (por ejemplo, una foto sin descripción) solo se reconoce si esa persona tiene otro mensaje con texto visible en la conversación.
  - Un nombre que forma parte de un texto más largo (por ejemplo, «Ana: hola» en un único elemento) no se reconoce.
  - En contactos no guardados se reconoce el nombre que figura en `data-pre-plain-text` (con o sin «~»). Si WhatsApp muestra además otro dato, como el nombre público junto al número, ese dato puede quedar visible. **Desde `0.1.2-beta.1`**, los autores de mensajes se difuminan por su estructura `[data-testid="author"]`, sin comparar textos, y estas limitaciones solo afectan a los nombres sin `author`, como el aviso fijado (ver [Remitentes no guardados](#remitentes-no-guardados-en-grupos-corrección-en-012-beta1)).
- **Filas de contacto fuera de la lista de chats (RF-01 y RF-02, desde `0.1.1-beta.0`).**
  - **«Nuevo chat» (desde `0.1.1-beta.2`, estructura confirmada):** filas `[role="listitem"][data-testid^="list-item-"]` dentro de `[data-testid="new-chat-drawer"]`, sin las acciones `new-chat-drawer-new-*`. El nombre es el primer `span[dir][title]` sin iconos. Desde `0.1.1-beta.3`, el resto de textos de `cell-frame-container` también se difumina, así que aunque el nombre no fuera el primero, todo el texto del contacto queda protegido. Un texto funcional dentro de la celda que no sea un botón, un icono o un campo (por ejemplo, una etiqueta de estado de la app) también se difuminaría.
  - **Otros paneles (hipótesis sin confirmar):** filas con rol `listitem`, `row` o `button` que contienen exactamente un avatar SVG y un `span[title]`. En «Nuevo chat» esta regla no se cumplía, porque sus filas no contienen avatares SVG.
  - Una fila de acción dibujada con un avatar de esa estructura (por ejemplo, «Nuevo grupo» con un círculo de máscara) vería su texto difuminado.
  - Fuera de «Nuevo chat», la línea de información del contacto (estado o «Disponible») no se protege.
- **Fotografías (RF-02).**
  - En la lista de chats, el selector de avatares SVG (`<svg>` con máscara y `<image>` o `<foreignObject>`) se basa en el DOM real observado.
  - En el encabezado, el selector SVG se aplica por la misma estructura, pero no está observado en el DOM real.
  - En otras zonas, los avatares se reconocen por el origen de la foto (una hipótesis) y, desde `0.1.1-beta.0`, también por la estructura SVG confirmada en la lista, aplicada a cualquier zona. Se supone que «Nuevo chat» y otros paneles usan el mismo componente de avatar. Un SVG con esa misma estructura que no fuera un avatar también se difuminaría.
  - **En «Nuevo chat», desde `0.1.2-beta.2`,** se difumina la columna del avatar de cada contacto y de «Tú», por su estructura confirmada. Con `0.1.2-beta.1`, los avatares predeterminados seguían visibles. Ver [Avatares predeterminados](#avatares-predeterminados-en-nuevo-chat-corrección-en-012-beta2).
  - Fuera de la lista y del encabezado, el revelado por foco de teclado no está disponible; sí el cursor y Ctrl + Mayús + Espacio.
  - No se cubren los avatares en `<canvas>` ni las imágenes de fondo aplicadas desde hojas de estilo (solo las que van en el atributo `style`).
- **Recuadro «Responder» (RF-04, desde `0.1.2-beta.0`).** Se difumina el texto citado con la estructura confirmada. Las miniaturas de fotos y vídeos citados siguen visibles hasta confirmar su estructura. Desde `0.1.2-beta.1`, RF-01 difumina el autor del recuadro por su estructura `[data-testid="author"]`, también cuando es la etiqueta «Tú». Ver [Recuadro «Responder»](#recuadro-responder-corrección-en-012-beta0).
- **«Info. del mensaje» (RF-04, desde `0.1.2-beta.4`).** Se difumina el texto de la copia del mensaje con la estructura confirmada y, desde `0.1.2-beta.5`, los stickers (`canvas` e `img` de `blob:` dentro de `sticker-container`). Las fotos y los vídeos de esa pantalla no están observados y no se difuminan. Los demás paneles laterales derechos (sin `kept-by-info`) quedan fuera. Ver [«Info. del mensaje»](#info-del-mensaje-corrección-en-012-beta4).
- **Carga inicial.** Leer las preferencias es asíncrono. Si WhatsApp pintara antes de esa lectura, el contenido podría verse unos milisegundos.
- **Atajo de teclado.** Si se suelta Ctrl o Mayús manteniendo pulsado el Espacio, la repetición automática del Espacio puede escribir espacios en el editor.
- **Avisos de `web-ext lint`.** Muestra dos avisos `UNSAFE_VAR_ASSIGNMENT` que vienen del código interno de `react-dom`, no de Veilix, que no usa `dangerouslySetInnerHTML`.
- **`npm audit`.** Informa de una vulnerabilidad en `node-forge`, que llega como dependencia de `web-ext` a través de `@devicefarmer/adbkit`. Todavía no existe versión corregida. Solo afecta a las herramientas de desarrollo y no se incluye en la extensión. `shell-quote` se ha forzado a 1.12.0 mediante `overrides`.
- **Codespaces.** No se puede probar WhatsApp Web real porque requiere una sesión iniciada. Tampoco hay Windows, macOS, Edge, Brave, Opera, Vivaldi ni Safari. Las pruebas del motor se ejecutan en los motores de Playwright (Chromium, Firefox y WebKit) sobre Linux, y la extensión cargada solo en Chromium.
- **Safari.** No se ha ejecutado nunca y el trabajo `safari-macos` aún no se ha lanzado. En Safari, el revelado por foco requiere **Opción + Tab**, salvo que se cambie el ajuste correspondiente.
- **Opera y Vivaldi.** No se han evaluado los paneles laterales de WhatsApp integrados en estos navegadores.
- **Atajo multiplataforma.** No se ha comprobado si Ctrl + Mayús + Espacio choca con atajos de Vivaldi u Opera, con el cambio de distribución del teclado de Windows ni con los métodos de entrada de Linux y macOS.

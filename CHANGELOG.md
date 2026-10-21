# Historial de versiones

Todos los cambios relevantes de Veilix se registran en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/). Las versiones de prueba llevan el sufijo `-beta.N`. La correspondencia con `manifest.version` de cada navegador está en la sección [Versionado](README.md#versionado) del README.

Las versiones publicables aparecen como `## [versión]`. El historial de desarrollo anterior a la primera versión definitiva (`0.1.0`) se conserva íntegro, sin cambios de contenido, en la sección [Historial de desarrollo anterior a 0.1.0](#historial-de-desarrollo-anterior-a-010).

Cada entrega de prueba con cambios en el código recibe una versión nueva. Volver a compilar el mismo código no cambia la versión.

## [Sin publicar]

## [0.1.1-beta.5] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2005` en Chromium y Firefox (`version_name` `0.1.1-beta.5` en Chromium), y `0.1.1` en Safari. Solo cambia el crédito del pie del panel: no hay cambios en el candado, RF-01 a RF-05, las preferencias, los permisos ni el almacenamiento.

### Cambiado

- **Bandera del crédito:** el emoji 🇨🇴, que Windows muestra como las letras «CO», se sustituye por una bandera de Colombia en SVG local.
  - El componente es `BanderaColombia`.
  - Proporción 3:2: amarillo `#FCD116` en el 50 % superior, azul `#003893` en el 25 % central y rojo `#CE1126` en el 25 % inferior.
  - Sin sombras, degradados ni animaciones.
  - Se dibuja a 12 × 8 px, con las franjas en píxeles enteros (`crispEdges`), alineada con la altura de las mayúsculas y separada del nombre por 0,35 em.
  - Es una imagen accesible con la etiqueta «Bandera de Colombia».
  - El emoji ya no está en la página, así que nunca se ven los dos a la vez.
- El crédito pasa a un componente propio, `CreditoDesarrollador`. El texto «Hecho con ❤️ por Felipe Moreno Marciales» no cambia.

### Añadido (pruebas)

- `tests/bandera-colombia.test.tsx`: etiqueta accesible, proporción 3:2, colores y altura de cada franja, y ausencia de elementos decorativos.
- `tests/navegador/credito.test.ts`, con el CSS real en Chromium, Firefox y WebKit:
  - Tamaño de 12 × 8 px y separación del nombre.
  - Alineación vertical con el texto, en una sola línea.
  - Sin desbordamiento a la anchura del emergente.
  - Mismos colores en los temas claro y oscuro.
- `tests/panel-configuracion.test.tsx` comprueba el texto exacto, la bandera como último elemento del crédito y que el emoji 🇨🇴 no está en la página.
- `npm run test:extension` comprueba la bandera (etiqueta, tamaño y colores) en el emergente y en las opciones, en los dos temas.
- `vitest.config.ts`: React se preoptimiza en las pruebas de navegador, para que Vite no recargue la prueba del crédito la primera vez que se ejecuta.

## [0.1.1-beta.4] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2004` en Chromium y Firefox (`version_name` `0.1.1-beta.4` en Chromium), y `0.1.1` en Safari. Solo cambia la identidad visual: no hay cambios en RF-01 a RF-05, el motor de difuminado, los observadores, el revelado, los permisos ni las preferencias.

### Cambiado

- **Logotipo e iconos:** el ojo se sustituye por un **candado cerrado** blanco sobre el mismo cuadrado redondeado verde (`#00A884`).
  - Lo cambian juntos el logotipo del panel (`Logotipo.tsx`) y el dibujo original del generador (`scripts/generar-iconos.mjs`), con la misma geometría en una cuadrícula de 32 × 32.
  - Los bordes rectos caen en píxeles enteros a 16 × 16, para que se vea nítido en la barra de herramientas.
  - `public/icon/{16,32,48,96,128}.png` se regeneran con el generador, que ahora acepta una carpeta de salida opcional y no escribe nada al importarse.
  - El cambio llega a los cuatro paquetes (Chrome, Edge, Firefox y Safari), al administrador de extensiones, al emergente y a la página de opciones.

### Añadido

- **Crédito del desarrollador** en el pie del panel, justo después de la versión: «Hecho con ❤️ por Felipe Moreno Marciales 🇨🇴».
  - Es fijo, no depende de ninguna funcionalidad y no lleva enlaces.
  - Usa el color secundario del tema y las fuentes de emoji de cada sistema.
- Pruebas:
  - `tests/iconos.test.ts` comprueba que `public/icon` coincide byte a byte con lo que genera el script, que cada tamaño dibuja el candado y que el logotipo del panel tiene la misma geometría.
  - `tests/panel-configuracion.test.tsx` comprueba el texto exacto del crédito y su posición en el emergente y en la página de opciones, que se conservan los textos del pie y que no depende de las funcionalidades.
  - `npm run test:extension` comprueba los iconos del paquete compilado y, en temas claro y oscuro, el crédito sin enlaces ni desplazamiento horizontal. También guarda capturas de la página de opciones.

## [0.1.1-beta.3] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2003` en Chromium y Firefox (`version_name` `0.1.1-beta.3` en Chromium), y `0.1.1` en Safari.

### Cambiado

- **RF-01, información secundaria en «Nuevo chat»** (ampliación aprobada por el propietario):
  - Además del nombre, se difuminan los textos de cada contacto debajo del nombre, como la descripción o la frase de estado. Se marcan con `data-veilix-info-nuevo-chat`.
  - **Criterio, sin suponer atributos:** cualquier elemento con texto visible propio (o emojis en `<img alt>`) dentro de `[data-testid="cell-frame-container"]` (estructura confirmada) que no sea el nombre.
  - **Exclusiones:**
    - SVG, iconos, campos de entrada y botones de la celda.
    - Las acciones `new-chat-drawer-new-*`.
    - Las filas sin nombre `span[dir][title]`, como los encabezados de sección.
  - El nombre y la información se revelan juntos con la fila (cursor, foco y atajo) y se restauran al desactivar RF-01.

### En investigación

- **Regresión comunicada en RF-01 (remitentes en grupos) con `0.1.1-beta.2`.** No hay corrección en esta entrega, porque la causa no se ha podido identificar con evidencia.
  - **Revisión del código:**
    - El marcador de remitentes no ha cambiado desde `0.1.1-beta.0`, la versión validada como correcta.
    - Los marcadores añadidos después (filas de contacto y «Nuevo chat») usan atributos propios, excluyen `#main` y no tocan `data-veilix-remitente`.
    - Las reglas CSS nuevas son válidas y van dentro de `:is()`, así que no pueden invalidar las anteriores.
  - **Pruebas en el DOM simulado:** la lógica de beta.0 reconstruida y la de beta.2 dan el mismo resultado, y los escenarios de interacción entre marcadores pasan. **No se reproduce.**
  - Hace falta el diagnóstico de mensajes en el grupo afectado (ver el README).

### Añadido (diagnóstico y pruebas)

- `scripts/diagnostico-mensajes.js`:
  - Muestra qué reglas tiene cargadas la extensión en la pestaña (módulos activos, regla de remitentes y regla de «Nuevo chat»).
  - Añade una tabla de remitentes por mensaje: formato de `data-pre-plain-text` reconocido, elementos que coinciden con el nombre, marcados y difuminados, y si el texto visible empieza por «~» o parece un teléfono. Sin mostrar nombres.
- `scripts/diagnostico-paneles.js`: en la tabla de «Nuevo chat», los textos de cada fila que quedan sin proteger, con su tipo de elemento, su longitud y si están dentro de `[role="gridcell"]`.
- Pruebas:
  - Información secundaria en varias formas (con `title`, sin atributos, en otra celda, con emoji).
  - Iconos y botones de la celda que no se difuminan.
  - Encabezado de sección como fila `list-item-*`.
  - Revelado y desactivación.
  - Interacción entre los marcadores de «Nuevo chat» y de remitentes: abrir y cerrar el panel antes de abrir un grupo, activar RF-01 con el panel abierto, y distinto orden de activación de RF-01 y RF-04.

## [0.1.1-beta.2] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2002` en Chromium y Firefox (`version_name` `0.1.1-beta.2` en Chromium), y `0.1.1` en Safari.

### Corregido

- **RF-01, nombres en «Nuevo chat» (causa confirmada por el diagnóstico real):**
  - En Chrome con `0.1.1-beta.1`, el diagnóstico de paneles inspeccionó 18 contactos: 0 nombres marcados, todos con `span[dir][title]` y **ninguno con un avatar SVG** de la estructura `AVATAR_SVG`.
  - **Causa:** las filas de contacto exigían exactamente un avatar SVG, así que ninguna fila de «Nuevo chat» se reconocía. Los avatares se difuminaban igualmente porque RF-02 usa reglas CSS que no dependen de las filas.
  - **Corrección:** un marcador propio para «Nuevo chat», basado en la estructura confirmada (`[data-testid="new-chat-drawer"]`, filas `[role="listitem"][data-testid^="list-item-"]`) y sin depender de avatares.
    - Marca el primer `span[dir][title]` sin iconos de cada fila con `data-veilix-nombre-nuevo-chat`, y la fila con `data-veilix-fila-nuevo-chat`.
    - Excluye las acciones `new-chat-drawer-new-*` (nuevo grupo, contacto y comunidad).
    - Cubre la carga dinámica, la búsqueda y el desplazamiento.
    - Se revela con la fila (cursor, foco y atajo).
  - RF-02 no cambia.

  Pendiente de validación real. Que el nombre sea el **primer** `span[dir][title]` de la fila se apoya en la regla validada en la lista de chats; el diagnóstico lo comprueba.

### Seguridad de los diagnósticos

- Los diagnósticos de paneles, mensajes y lista de chats **anonimizan los valores de `data-testid`**: los números pasan a «#» y no se muestra nada tras «@». Un sufijo como `list-item-…` podría contener un identificador.

### Añadido

- El diagnóstico de paneles añade una tabla de «Nuevo chat»: número de `span[dir][title]` por fila (solo longitudes), cuál marcó Veilix, si está difuminado y si la fila es una acción.
- Pruebas de regresión con la estructura observada (18 contactos sin avatar SVG, acciones como filas `list-item-*`, carga dinámica, búsqueda, desplazamiento, volver a abrir, revelado, desactivación e independencia de RF-02), en jsdom y en Chromium, Firefox y WebKit.

## [0.1.1-beta.1] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2001` en Chromium y Firefox (`version_name` `0.1.1-beta.1` en Chromium), y `0.1.1` en Safari.

### Corregido

- **RF-01, nombres en «Nuevo chat»:** en Chrome real con `0.1.1-beta.0`, los nombres de contactos seguían visibles. El resto de lo validado (remitentes de grupo, fotos y avatares de «Nuevo chat», mensajes nuevos, revelado y desactivación) era correcto.
  - **Defecto confirmado en el código:** el marcador de filas de contacto (`marcador-nombres.ts`) examinaba los descendientes de cada nodo añadido al DOM, pero **no el propio nodo**. Si WhatsApp añade cada fila como un nodo independiente después de abrir el panel (lista virtualizada o contactos cargados más tarde), la fila nunca se procesaba y su nombre quedaba visible. El DOM simulado lo ocultaba porque cada fila contenía otro `[role="button"]`.
  - **Corrección:** el propio nodo añadido también se evalúa como fila candidata.
  - Los avatares de RF-02 se difuminaban igualmente porque su regla CSS no depende de las filas. Lo único que mejora en RF-02 es el revelado del avatar junto con la fila, en esas filas.
  - **Pendiente de confirmar** en WhatsApp Web real que esta era la causa. El diagnóstico de paneles amplía su información para descartar otras.

### Añadido

- `scripts/diagnostico-paneles.js` analiza cada avatar fuera de la lista de chats y de la conversación. Indica el motivo por el que su fila se reconoce o no como fila de contacto (rol, número de avatares, `span[title]`, iconos), si está marcada y si el nombre está difuminado.
- Pruebas de regresión en jsdom y en Chromium, Firefox y WebKit: filas sin botón interior añadidas como nodos independientes, búsqueda, desplazamiento y revelado.

## [0.1.1-beta.0] — 2026-10-20

Compilación interna de prueba: no se sube a ninguna tienda. Manifiesto: `0.1.1.2000` en Chromium y Firefox (`version_name` `0.1.1-beta.0` en Chromium), y `0.1.1` en Safari.

### Corregido

- **RF-01, nombres de remitentes en conversaciones de grupo:** en Chrome real, con RF-01 activa, los nombres de color sobre los mensajes seguían visibles.
  - **Causa:** RF-01 solo tenía reglas para `#pane-side` y para `#main header`, así que nada alcanzaba el interior de los mensajes.
  - **Corrección:** un marcador nuevo (`marcador-nombres.ts`) aprende los nombres de `data-pre-plain-text` de la conversación abierta. Después marca con `data-veilix-remitente` los elementos cuyo texto visible es exactamente uno de esos nombres:
    - Sobre los mensajes, también los de contactos no guardados («~ Nombre») y con emojis.
    - En citas y respuestas.
    - En el aviso fijado.
  - Excluye el texto de los mensajes y el editor. Se revela con el mensaje y no depende de RF-04.
- **RF-01, nombres en «Nuevo chat»:**
  - **Causa:** las filas de RF-01 solo se buscaban dentro de `#pane-side`.
  - **Corrección:** las filas de contacto fuera de la lista y de la conversación (rol `listitem`, `row` o `button` con exactamente un avatar SVG y un `span[title]`) se marcan con `data-veilix-fila-contacto`, y su nombre con `data-veilix-nombre-contacto`.
- **RF-02, avatares predeterminados en «Nuevo chat»:**
  - **Causa:** la estructura SVG de avatar (`<mask>` con `<image>` o `<foreignObject>`) solo se aplicaba en la lista y en el encabezado.
  - **Corrección:** `AVATAR_SVG` se aplica en cualquier zona. RF-02 marca las filas de contacto con su propio atributo (`data-veilix-fila-contacto-fotos`) para revelar el avatar con la fila, sin depender de RF-01.

Estructuras basadas en hipótesis (ver el README); pendiente de validación en WhatsApp Web real.

### Añadido

- Diagnóstico anonimizado de paneles con contactos (`scripts/diagnostico-paneles.js`).
- El diagnóstico de mensajes marca `MARCADO-REMITENTE` y la regla `RF-01-REMITENTE`.
- Pruebas de remitentes (con RF-04 desactivada, citas, contactos no guardados, emojis, aviso fijado, mensajes nuevos, cambio de conversación, revelado y desactivación) y de «Nuevo chat» (nombres, fotos y avatares predeterminados, acciones y buscador visibles, abrir y cerrar, búsqueda, desplazamiento, carga de fotos, revelado e independencia de RF-01 y RF-02), en jsdom y en Chromium, Firefox y WebKit.

### Notas

- Esta entrega aclara la discrepancia anotada en `0.1.0`: con el código de `0.1.0`, RF-01 no podía difuminar los nombres de remitentes dentro de los mensajes.

## [0.1.0] — 2026-10-16

**Primera versión definitiva** y cierre de la Fase 2. No está publicada en ninguna tienda.

Manifiesto: `0.1.0` en Chrome, Edge, Firefox y Safari (sin `version_name`). Paquetes: `veilix-0.1.0-{chrome,edge,firefox,safari}.zip`.

### Incluye

Todo lo desarrollado hasta `0.2.0-beta.8`, sin cambios de comportamiento:

- **RF-01 (difuminar nombres):** en la lista de chats y en los textos del encabezado de la conversación.
- **RF-02 (difuminar fotos):** fotos y avatares, también los dibujados como SVG (`<image>` y `<foreignObject>`).
- **RF-03 (difuminar mensajes recientes):** vistas previas, incluidas las especiales con iconos (reacciones, emojis e iconos multimedia), y el indicador de leído (`wds-ic-read`).
- **RF-04 (difuminar mensajes de conversaciones):** texto, multimedia, hora, reacciones e indicador de leído en `msg-meta`.
- **RF-05 (difuminar el campo de entrada).**
- **Comportamiento común:** revelado temporal (cursor, foco y Ctrl + Mayús + Espacio), preferencias persistentes y aplicación sin recargar.

### Validación

- **Validación funcional en Google Chrome** realizada por el propietario con `0.2.0-beta.8`, sin indicar el sistema operativo:
  - RF-01: nombres, encabezados y participantes de grupos.
  - RF-02: fotos y avatares.
  - RF-03: mensajes recientes, indicadores y vistas previas especiales.
  - RF-04: mensajes, multimedia, horas, reacciones e indicadores.
  - RF-05: campo de escritura.
  - Revelado y restauración, persistencia tras recargar y cambio de conversación.
- **Auditoría de cierre:**
  - Solo el permiso `storage`.
  - Ni red ni telemetría en el código ni en los paquetes.
  - Dependencias de producción: `react` y `react-dom`.
  - Todas las verificaciones automatizadas correctas.

  El detalle está en la sección [Cierre de la Fase 2](README.md#cierre-de-la-fase-2) del README.

### Cambiado (versionado)

- **Renumeración aprobada por el propietario (opción B):** `0.1.0` sustituye a `0.2.0-beta.8` como versión final. Queda registrada con su motivo en `version-renumeraciones.json`.
  - `version:comprobar` solo la acepta comparando con los commits base históricos (`a283fda` en `development` y `9ba34bf` en `main`).
  - Con cualquier otro commit base, la regla «código nuevo, versión nueva» se aplica con normalidad.
- **Manifiesto de las versiones estables:** ahora es exactamente `MAYOR.MENOR.PARCHE` en todos los navegadores (antes `X.Y.Z.4000` en Chromium y Firefox). Las versiones previas siguen usando un cuarto componente (`X.Y.Z.(2000+N)` para las beta) y son solo compilaciones internas: nunca se suben a una tienda, porque quedan numéricamente por encima de la estable del mismo `X.Y.Z`.
- **Panel:** muestra «Veilix 0.1.0».

### Cambiado (interfaz)

- **Identidad visual verde, alineada con WhatsApp Web**, en lugar del morado anterior. Solo cambian los colores; el diseño y la lógica del panel no se modificaron.
  - **Acento principal** en los temas claro y oscuro: `#00A884`. Lo usan los interruptores activos, el logotipo del panel y los iconos de la extensión, regenerados con la misma forma.
  - **Apoyo:** `#25D366` para el foco y el *hover* del interruptor activo en el tema oscuro. En el tema claro, el foco y el *hover* usan `#008069`, porque `#25D366` y `#00A884` no alcanzan un contraste de 3:1 sobre el fondo claro.
  - Una prueba nueva (`tests/panel-paleta.test.ts`) comprueba el acento, la ausencia de los morados anteriores y un contraste mínimo de 3:1 del interruptor activo y del foco en ambos temas.

### Pendiente

- Validación del indicador de reloj (pendiente).
- Pruebas reales en otros navegadores y sistemas operativos.
- Alertas de `npm audit` en dependencias de desarrollo (`web-ext → node-forge`).
- Determinar qué módulo difumina el nombre del remitente sobre los mensajes de grupo (ver la discrepancia de RF-01 en el README).

## Historial de desarrollo anterior a 0.1.0

Compilaciones internas de prueba y el hito de la Fase 1, conservados tal como se registraron. Ninguna se publicó.

### [0.2.0-beta.8] — 2026-10-16

Manifiesto: `0.2.0.2008` en Chromium y Firefox, y `0.2.0` en Safari.

#### Corregido

- **RF-03 (difuminar mensajes recientes):** en Chrome real, una vista previa especial como «reaccionó con 👌 a:» con el icono de una foto quedaba visible.
  - **Causa más probable:** la clasificación descartaba como icono cualquier elemento de vista previa que **contuviera** un SVG o un `[data-icon]`. Una vista previa con texto e icono en el mismo elemento no se marcaba.
  - **Corrección:** para las vistas previas, un elemento solo cuenta como icono si es un icono o si no tiene más contenido visible que iconos (sin contar el texto de los `<title>` de los SVG ni los emojis). La vista previa se protege entera, iconos incluidos, y se revela con la fila.
  - Al reconocerse ahora esas vistas previas, su indicador de leído también vuelve a protegerse.
  - La detección del nombre (RF-01) conserva su regla, sin cambios.
  - Siguen visibles el nombre, la hora, el contador de no leídos, silenciado, fijado, el avatar y los iconos ajenos.

  Pendiente de prueba real.

#### Añadido

- Diagnóstico anonimizado de la lista de chats (`scripts/diagnostico-lista-chats.js`), por si alguna vista previa sigue visible.
- Pruebas de vistas previas normales, de reacción, con icono de foto y de reacción a una foto, en jsdom y en Chromium, Firefox y WebKit.

#### Notas

- El 16 de octubre de 2026 se inició un cambio de versión a `0.1.0` que el propietario interrumpió. Los cambios parciales (versión en `package.json` y texto del panel) se revirtieron antes de esta entrega. La versión sigue la serie `0.2.0-beta.N`.

### [0.2.0-beta.7] — 2026-10-16

Manifiesto: `0.2.0.2007` en Chromium y Firefox, y `0.2.0` en Safari.

#### Corregido

- **Indicadores de lectura (RF-03 y RF-04):** en Chrome con 0.2.0-beta.6, los indicadores de lectura seguían visibles. El diagnóstico real mostró que los iconos de WhatsApp Web llevan su nombre en el `<title>` del SVG (`wds-ic-read`), no en `data-icon`, así que los selectores de beta.6 no coincidían con nada. Ahora:
  - `iconos-estado.ts` reconoce los SVG cuyo `<title>` hijo es exactamente un nombre de estado confirmado (`TITULOS_ICONO_ESTADO`). Hoy solo `wds-ic-read`.
  - **RF-03:** un marcador nuevo marca con `data-veilix-estado-vista-previa` el indicador asociado a la vista previa de cada fila (el que comparte bloque con ella y no con el nombre). Se combina con el marcador de vista previa mediante `combinarMarcadores`.
  - **RF-04:** el marcador de mensajes marca con `data-veilix-estado-mensaje` el indicador dentro de `[data-testid="msg-meta"]` (estructura confirmada).
  - Se revelan junto con la vista previa o con el mensaje completo, y las marcas se eliminan al desactivar.
  - No se difuminan `wds-ic-status`, `wds-ic-disappearing-messages`, `wds-ic-whatsapp`, `wds-ic-sticker` ni ningún `wds-ic-read` fuera de esas zonas.

  Pendiente de prueba real.

#### Eliminado

- Los selectores supuestos de beta.6 (`msg-check`, `msg-dblcheck`, `msg-time`, `status-check`, `status-dblcheck` y `status-time` en `data-icon`), descartados por el diagnóstico real.

#### Pendiente

- Los indicadores de **enviado, entregado y pendiente** no se difuminan, porque sus nombres no aparecen en el diagnóstico. El diagnóstico de mensajes ahora resume los `<title>` de los SVG y el contenido de cada `msg-meta` para identificarlos.

#### Añadido

- Pruebas con la estructura confirmada (`<title>wds-ic-read</title>`, `msg-meta`, iconos ajenos observados) en jsdom y en Chromium, Firefox y WebKit.

### [0.2.0-beta.6] — 2026-10-15

Manifiesto: `0.2.0.2006` en Chromium y Firefox, y `0.2.0` en Safari.

#### Cambiado

- **Indicadores de estado (✓, ✓✓, reloj):** a petición del propietario, se difuminan junto con el contenido que acompañan.
  - **RF-03:** en la lista de chats, el indicador junto a la vista previa cuando el último mensaje es propio. Se revela con la fila completa.
  - **RF-04:** en la conversación, el indicador de los mensajes enviados. Se revela con el mensaje completo.
  - Se reconocen por el nombre del icono (`ICONO_ESTADO_MENSAJE`): `msg-check`, `msg-dblcheck`, `msg-time`, `status-check`, `status-dblcheck` y `status-time`, por prefijo. Es una **hipótesis**: estos nombres no aparecen en los diagnósticos reales.
  - Solo se difuminan dentro de las filas de la lista y de los mensajes. Silenciado, fijado, contador de no leídos y los botones de los mensajes siguen visibles.
  - Se aplican con CSS, así que los cambios de estado (de ✓ a ✓✓), los mensajes nuevos y los chats reordenados quedan cubiertos al instante. Los marcadores no cambian.

  Pendiente de prueba real.

#### Añadido

- El diagnóstico de mensajes resume los iconos de la lista y de la conversación por nombre y cuántos están difuminados, sin mostrar contenido.
- Pruebas de los indicadores en la lista y en la conversación, en Chromium, Firefox y WebKit.

### [0.2.0-beta.5] — 2026-10-15

Manifiesto: `0.2.0.2005` en Chromium y Firefox, y `0.2.0` en Safari.

#### Cambiado

- **RF-04 (difuminar mensajes de conversaciones):** a petición del propietario, la hora del mensaje y sus reacciones también se difuminan como parte del contenido. Es un endurecimiento de privacidad: en 0.2.0-beta.4 se mantenían visibles a propósito.
  - Un marcador nuevo (`marcador-mensajes.ts`) clasifica la hora y las reacciones por la forma de su texto y las marca con `data-veilix-hora-mensaje` y `data-veilix-reaccion`:
    - Hora: formatos de 24 y 12 horas, incluidos los espacios no separables.
    - Reacciones: solo emojis, como texto o como imagen, y un contador.
  - Usa el observador compartido, así que marca también los mensajes y las reacciones que llegan después, antes del siguiente pintado.
  - El revelado abarca el mensaje completo (la fila `[data-id]`), de modo que pasar el cursor por una reacción exterior revela todo el mensaje.
  - Siguen visibles los botones de reaccionar, descargar, responder y reproducir, los indicadores de lectura, los separadores y el editor.

  Pendiente de prueba real.

#### Añadido

- El diagnóstico de mensajes marca `SOLO-EMOJI`, `ALT-EMOJI`, `MARCADO-HORA` y `MARCADO-REACCION`, sin mostrar contenido.
- Pruebas del marcador (jsdom) y de la hora y las reacciones en Chromium, Firefox y WebKit.

#### Corregido en las pruebas

- La prueba del tema del panel fallaba de forma intermitente (1 de cada 11 ejecuciones aproximadamente): comprobaba `data-tema` antes de que React ejecutara el efecto que lo aplica. Ahora espera a ese efecto. El panel no cambia.

### [0.2.0-beta.4] — 2026-10-15

Manifiesto: `0.2.0.2004` en Chromium y Firefox, y `0.2.0` en Safari.

#### Corregido

- **RF-04 (difuminar mensajes de conversaciones):** en Chrome con 0.2.0-beta.3, el texto y las fotos seguían visibles. El diagnóstico real mostró 0 `.message-in` y 0 `.message-out`, frente a 3 `[data-testid="msg-container"]` y 3 `[data-pre-plain-text]`. Ahora:
  - El contenedor de mensaje es `[data-testid="msg-container"]`. Se conservan las clases anteriores como alternativa.
  - No se difumina el contenedor completo, sino solo:
    - El texto: bloques `[data-pre-plain-text]` y `.selectable-text` fuera de ellos (descripciones).
    - La multimedia: `img` con origen `blob:` o `data:image/jpeg`, `video`, `canvas` y fondos `blob:`.
  - Ya no se difuminan todas las `img` ni todos los `.copyable-text`.
  - Siguen visibles reacciones, descarga, respuesta, hora, indicadores de lectura, separadores, botones del reproductor y el editor.

  Pendiente de prueba real.

#### Añadido

- Diagnóstico anonimizado de mensajes (`scripts/diagnostico-mensajes.js`). Muestra la estructura de cada mensaje sin textos ni identificadores, y localiza el nombre del remitente de los grupos sin revelarlo.
- DOM simulado con la estructura observada y pruebas de RF-04 en Chromium, Firefox y WebKit: texto, multimedia, mensajes combinados, grupos, controles, revelado, desactivación, mensajes nuevos, desplazamiento y cambio de conversación.

#### Pendiente

- **RF-01:** los nombres de remitentes en grupos siguen visibles. Se necesita el diagnóstico de mensajes para localizar el elemento sin inventar selectores.

### [0.2.0-beta.3] — 2026-10-15

Manifiesto: `0.2.0.2003` en Chromium y Firefox, y `0.2.0` en Safari.

#### Corregido

- **RF-02 (difuminar fotografías):** el diagnóstico anonimizado en Chrome con WhatsApp Web real mostró que los avatares de la lista de chats son `<svg>` con `<mask>` y `<circle>` que contienen `<image>` (foto) o `<foreignObject>`. Ahora:
  - Se difumina el `<svg>` completo de esa estructura en la lista y en el encabezado, sin alterar su contenido. No afecta a los SVG sin `<image>` ni `<foreignObject>` ni a los que están dentro de `[data-icon]`.
  - También se difuminan las fotos de perfil dentro de un SVG (`<image>`) en cualquier zona, reconocidas por su origen.
  - El revelado con el cursor o el foco sobre una fila o el encabezado funciona ahora con todas las representaciones de avatar. Antes, una foto aplicada como imagen de fondo dentro de una fila solo se revelaba con el cursor sobre la propia foto.

  La corrección está pendiente de prueba real en Chrome.

#### Añadido

- El diagnóstico de avatares (`scripts/diagnostico-avatares.js`) indica la estructura interna de cada SVG (`mask`, `circle`, `image` o `foreignObject`) y si el SVG está difuminado.
- Pruebas de las dos representaciones SVG en Chromium, Firefox y WebKit: difuminado, contenido sin alterar, carga de la foto, chats nuevos, reordenamiento, filas reutilizadas, revelado y SVG que no deben difuminarse.

### [0.2.0-beta.2] — 2026-10-15

Manifiesto: `0.2.0.2002` en Chromium y Firefox, y `0.2.0` en Safari.

#### Corregido

- **RF-02 (difuminar fotografías):** en una prueba real en Brave, algunas fotografías seguían visibles. Ahora también se difuminan:
  - Las fotos de perfil fuera de la lista y del encabezado: panel de información, remitentes en grupos, foto propia y paneles laterales.
  - Las fotos aplicadas como imagen de fondo en línea.
  - Los avatares predeterminados de contactos y grupos sin foto.

  Siguen sin difuminarse los iconos, los contadores, los emojis de los textos y las imágenes de los mensajes. La corrección está pendiente de verificación en WhatsApp Web real.

#### Añadido

- Fragmento de diagnóstico anonimizado de avatares (`scripts/diagnostico-avatares.js`).
- Sistema de versionado:
  - `package.json` es la única fuente de verdad.
  - `manifest.version` es numérico en cada navegador y `version_name` se usa en Chromium.
  - La versión se muestra en el panel y en los nombres de los ZIP.
  - Este historial y pruebas automatizadas de coherencia.

### [0.2.0-beta.1] — 2026-10-15

> Versión asignada **retroactivamente**. Las compilaciones de esta entrega se generaron con la versión `0.1.0`, porque el sistema de versionado todavía no existía. Esas compilaciones no se distinguen de las de 0.1.0 por su manifiesto.

#### Añadido

- Motor de difuminado y funcionalidades RF-01 a RF-05 (nombres, fotografías, mensajes recientes, mensajes de conversaciones y campo de entrada), con revelado temporal mediante cursor, foco de teclado y Ctrl + Mayús + Espacio.
- Paquetes para Chrome (también Brave, Opera y Vivaldi), Edge, Firefox y Safari desde una sola base de código, con versiones mínimas por navegador.
- Pruebas del motor en Chromium, Firefox y WebKit, y verificación de extremo a extremo de la extensión compilada.

#### Cambiado

- El script de contenido se ejecuta en `document_start`.
- Las escrituras de preferencias se serializan.

### Fase 1 — hito interno de desarrollo (número `0.1.0`) — 2026-10-12

> Registro original de la Fase 1, publicado en este archivo como «[0.1.0] — 2026-10-12». La Fase 1 usó el número `0.1.0` durante el desarrollo, sin etiquetas ni publicaciones. Desde el 16 de octubre de 2026, `0.1.0` identifica la primera versión definitiva (ver [0.1.0]). Los commits de la Fase 1 en `main` y `development` conservan su `package.json` con ese número.

#### Añadido

- Fase 1: infraestructura con WXT, React y TypeScript estricto.
- Panel de configuración con tema claro, oscuro o del sistema.
- Almacenamiento local de preferencias.
- Arquitectura de módulos con las nueve funcionalidades aprobadas como pendientes.
- ESLint, Vitest e integración continua.

[Sin publicar]: #sin-publicar
[0.1.1-beta.5]: #011-beta5--2026-10-20
[0.1.1-beta.4]: #011-beta4--2026-10-20
[0.1.1-beta.3]: #011-beta3--2026-10-20
[0.1.1-beta.2]: #011-beta2--2026-10-20
[0.1.1-beta.1]: #011-beta1--2026-10-20
[0.1.1-beta.0]: #011-beta0--2026-10-20
[0.2.0-beta.8]: #020-beta8--2026-10-16
[0.2.0-beta.7]: #020-beta7--2026-10-16
[0.2.0-beta.6]: #020-beta6--2026-10-15
[0.2.0-beta.5]: #020-beta5--2026-10-15
[0.2.0-beta.4]: #020-beta4--2026-10-15
[0.2.0-beta.3]: #020-beta3--2026-10-15
[0.2.0-beta.2]: #020-beta2--2026-10-15
[0.2.0-beta.1]: #020-beta1--2026-10-15
[0.1.0]: #010--2026-10-16

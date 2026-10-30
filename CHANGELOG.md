# Historial de versiones

Todos los cambios relevantes de Veilix se registran en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/). Las versiones de prueba llevan el sufijo `-beta.N`. La correspondencia con `manifest.version` de cada navegador está en la sección [Versionado](docs/desarrollo.md#versionado) de la documentación técnica. Desde el 28 de octubre de 2026, la documentación técnica que antes estaba en el `README.md` está en [`docs/desarrollo.md`](docs/desarrollo.md): las menciones al README de las entradas anteriores se refieren a ese contenido.

Las versiones publicables aparecen como `## [versión]`. El historial de desarrollo anterior a la primera versión definitiva (`0.1.0`) se conserva íntegro, sin cambios de contenido, en la sección [Historial de desarrollo anterior a 0.1.0](#historial-de-desarrollo-anterior-a-010). Del mismo modo, las compilaciones internas de cada estable posterior se conservan en su propia sección, como [Compilaciones internas de 0.1.3](#compilaciones-internas-de-013), [Compilaciones internas de 0.1.2](#compilaciones-internas-de-012) y [Compilaciones internas de 0.1.1](#compilaciones-internas-de-011).

Cada entrega de prueba con cambios en el código recibe una versión nueva. Volver a compilar el mismo código no cambia la versión.

## [Sin publicar]

## [0.1.3] — 2026-10-30

**Versión estable aprobada por el propietario y seleccionada como primera versión del lanzamiento público de Veilix** (30 de octubre de 2026), preparada a partir de `0.1.3-beta.0`. No está publicada ni etiquetada. Congelación de funcionalidades: no incluye ningún cambio de comportamiento respecto a `0.1.3-beta.0`. No inicia la Fase 3.

Manifiesto: `0.1.3` en Chrome, Edge, Firefox y Safari (sin `version_name`). Panel: «Veilix 0.1.3». Paquetes: `veilix-0.1.3-{chrome,edge,firefox,safari}.zip` y `veilix-0.1.3-sources.zip`.

### Incluye

Lo entregado en `0.1.3-beta.0`; el detalle está en [Compilaciones internas de 0.1.3](#compilaciones-internas-de-013).

- **Llamadas:** protección visual del panel flotante de una llamada en curso y de las tarjetas de llamada de la conversación.
  - **RF-01:** el nombre del participante del panel (`voip-call-participant-info-name`).
  - **RF-02:** el avatar del panel, ya cubierto por la regla general de fotos de perfil, con un único filtro.
  - **RF-04:** el estado y la duración del panel (`voip-call-participant-info-call-state-text`, `voip-call-timer`) y los textos de las tarjetas (`call-log-system-message`: título, estado y duración, en cualquier idioma).
  - **Lo que nunca se difumina:** el panel entero, la barra de controles, la tarjeta interactiva y su icono.
- **Interno:** el marcador de mensajes comprueba el contenido ya difuminado selector a selector, por el límite de longitud de selectores de jsdom. El resultado es el mismo.
- **Diagnóstico:** `scripts/diagnostico-llamadas.js`, que no se incluye en los paquetes.
- **Sin cambios en:** RF-03, RF-05, el resto de RF-01, RF-02 y RF-04, los permisos (solo `storage`), el almacenamiento, el panel de Veilix y la identidad visual.

### Cambiado (versionado)

- Se pasa de `0.1.3-beta.0` a `0.1.3` con `npm run version:estable`.
- La compilación interna `0.1.3.2000` queda numéricamente por encima de `0.1.3`. Es la consecuencia aceptada en la renumeración de `0.1.0`: no afecta a las tiendas, porque las betas nunca se suben.
- **Commit de la beta:** `0.1.3-beta.0` no llegó a confirmarse en Git por separado, así que su código entra con esta estable.
- Cualquier corrección posterior empieza en `0.1.4-beta.0` (`npm run version:beta`) y no reutiliza `0.1.3`.

### Validación

- **Real en Google Chrome**, comunicada por el propietario (sistema operativo sin indicar): las correcciones de las llamadas funcionan en las variantes observadas.
  - Las variantes observadas son una llamada de voz en curso y tarjetas de llamada de la conversación.
  - No consta el detalle por caso.
- **Automatizada:** todas las verificaciones de `AGENTS.md` son correctas; los resultados están en la documentación técnica ([`docs/desarrollo.md`](docs/desarrollo.md), «Versión 0.1.3»).
- **Sin prueba real** en Edge, Firefox, Brave, Opera, Vivaldi ni Safari.

### Aprobación

- **Primer lanzamiento público:** el 30 de octubre de 2026, el propietario aprobó técnicamente `0.1.3` y la eligió como primera versión del lanzamiento público, en lugar de `0.1.2`. La publicación todavía no se ha hecho.

### Distribución

- **Prevista:** solo los paquetes de Chrome y Edge, siguiendo [`docs/publicacion.md`](docs/publicacion.md).
- **Huella SHA-256 de los paquetes de Chrome y Edge**, que son idénticos: `97cabb6c68582812a110d169eab8ae54bd347e5b1fc65adea5883f278ba6165a`.
- **No autorizados para publicar:** los de Firefox y Safari, que son técnicos.
- **Privado:** el de fuentes. Nunca se publica.

### Limitaciones conocidas

- **Llamadas:**
  - Las entrantes (sonando), rechazadas, de vídeo y de grupo no tienen evidencia.
  - El anidamiento intermedio del panel y de las tarjetas es una suposición de las pruebas.
- **Resto:** las limitaciones de [0.1.2] siguen vigentes, salvo las llamadas, que se corrigen aquí.

## Compilaciones internas de 0.1.3

Compilación interna de prueba `0.1.3-beta.0`, conservada tal como se registró. No se publicó. Su contenido está consolidado en [0.1.3]. Va con un nivel de encabezado menos porque su manifiesto (`0.1.3.2000`) es mayor que el de la estable `0.1.3`: la lista de versiones `## [...]` solo recoge las estables, en orden creciente de manifiesto.

### [0.1.3-beta.0] — 2026-10-30

Compilación interna de prueba sobre la estable `0.1.2`. Manifiesto: `0.1.3.2000` en Chromium y Firefox (`version_name` `0.1.3-beta.0` en Chromium), y `0.1.3` en Safari. Corrección de privacidad de las llamadas, autorizada por el propietario. No inicia administrativamente la Fase 3, y los paquetes de `0.1.2` no cambian.

#### Corregido

- **Llamadas (RF-01 y RF-04):** con `0.1.2` quedaban visibles el nombre y la duración del panel flotante de una llamada en curso, y el contenido de las tarjetas de llamada de la conversación.
  - **Estructura confirmada** por el diagnóstico real (`scripts/diagnostico-llamadas.js`, Chrome, llamada de voz):
    - **Dónde está el panel:** en la ventana principal, sin marcos, con Veilix cargado y fuera de `#main`.
    - **Qué contiene el panel:** `[data-testid="move_resize_component"]` › `[data-testid="voip-container-audio-call"]`, con el nombre (`voip-call-participant-info-name` › `span[dir="auto"]`), el estado (`voip-call-participant-info-call-state-text`) y la duración (`[data-testid="voip-call-timer"][role="timer"]`). Los controles están en una barra aparte.
    - **Tarjetas:** dentro de `msg-container`, una tarjeta interactiva con `[data-testid="call-log-system-message"]`, que contiene el icono (`call-log-icon-chip`), un `div` con el título, un `span` con el estado o la duración y `msg-meta`.
    - **Ya protegidos:** el avatar (RF-02) y la hora de las tarjetas (RF-04).
  - **Corrección:**
    - **RF-01** (`NOMBRE_LLAMADA`, `TEXTO_NOMBRE_LLAMADA`): el nombre del panel, es decir, su `span[dir="auto"]` o, si no lo tiene, el propio contenedor.
    - **RF-04, panel** (`DATOS_PANEL_LLAMADA`): el estado y la duración, cada uno con su revelado, salvo que contengan algún control.
    - **RF-04, tarjetas** (`TEXTO_REGISTRO_LLAMADA`): sus elementos de texto finales (título, estado y duración), reconocidos por la estructura y no por el texto, así que sirve en cualquier idioma. Se excluyen el icono, `msg-meta` (su hora mantiene su único filtro) y los controles.
    - **Sin cambios en RF-02:** el avatar ya se difuminaba con un único filtro.
  - **Lo que nunca se difumina:** el panel entero, la barra de controles, sus botones, la tarjeta interactiva ni su icono. Colgar, silenciar, la cámara y volver a llamar siguen funcionando.
  - **Revelado:** el cursor sobre un dato del panel lo revela solo a él, el cursor sobre una tarjeta revela sus textos, y el atajo los revela todos.
  - **Implementación:** solo CSS. Sin observadores nuevos y sin cambios de permisos ni del manifiesto.
  - **Sin evidencia:** las llamadas entrantes (sonando), rechazadas, de vídeo y de grupo.
  - Pendiente de validación real.

#### Cambiado (interno)

- **Marcador de mensajes:** comprueba el contenido ya difuminado selector a selector (`yaDifuminado`), en lugar de unir todos los selectores en un solo `:is()`.
  - **Por qué:** con el selector de las tarjetas de llamada, el combinado superaba los 2048 caracteres que admite el motor de selectores de jsdom, y fallaban 12 pruebas unitarias.
  - **Resultado:** el mismo que antes; los navegadores no tienen ese límite.

#### Añadido (pruebas)

- `tests/navegador/llamadas.test.ts`, en Chromium, Firefox y WebKit (18 pruebas por motor):
  - **Qué difumina cada interruptor:**
    - RF-01, solo el nombre (también sin `span[dir="auto"]`);
    - RF-02, solo el avatar, con un único filtro;
    - RF-04, el estado y la duración del panel y los textos de las tarjetas, en cualquier idioma.
  - **Lo que no cambia:** la hora de las tarjetas, con su único filtro, y el icono, sin difuminar.
  - **Controles:** el panel, la barra de controles, los botones y la tarjeta no se difuminan. Silenciar, cámara, volver a llamar y colgar siguen funcionando.
  - **Interruptores:** un único filtro por dato con los cinco activos, y cada uno se desactiva sin afectar a los otros.
  - **Revelado:** con el cursor y con el atajo.
  - **Cambios dinámicos y limpieza:** el panel aparece, se cierra y se vuelve a abrir, y la duración avanza. Al desactivar todo se restaura sin estilos ni marcas, sin regresiones en los demás mensajes.

  Sin las reglas nuevas fallan 10 de las 18.
- `tests/difuminado/selectores-llamadas.test.ts`: cada selector elige exactamente su elemento. Nunca elige un contenedor con controles ni nada fuera de una tarjeta de un mensaje.
- `tests/navegador/interruptores.test.ts` y `npm run test:extension`: las llamadas forman parte de lo que protegen RF-01, RF-02 y RF-04.
- `tests/apoyo/whatsapp-simulado.ts`: tipo `llamada`, `abrirPanelLlamada`, `cerrarPanelLlamada` y `MENSAJES_LLAMADAS`.

#### En investigación (antes de `0.1.3-beta.0`)

- **Llamadas (RF-01, RF-02 y RF-04):** el propietario comunicó que, con `0.1.2`, siguen visibles dos cosas:
  - en el panel flotante de una llamada en curso, el nombre del contacto, el avatar y la duración;
  - en las tarjetas de llamada de la conversación, «Llamada», «Sin respuesta», «Llamando…», la duración y otros estados.

  No hay evidencia del DOM de las llamadas, así que no se ha cambiado ningún selector.
  - **Dato relevante:** el script de contenido solo se inyecta en el marco principal de `https://web.whatsapp.com/*`, sin `all_frames` ni `match_about_blank`. Si la llamada está en un `iframe` o en otra ventana, Veilix no se ejecuta allí.
  - **Versión:** la corrección empezará en `0.1.3-beta.0`, sin cambiar los paquetes congelados de `0.1.2`.

#### Añadido (diagnóstico)

- `scripts/diagnostico-llamadas.js`:
  - **Contexto:** ventana principal, emergente o marco; si Veilix está cargado en ese documento; y los marcos de la página.
  - **Panel flotante:** lo localiza fuera de `#main` por indicios genéricos (textos de llamada de una lista cerrada, duraciones, iconos y `data-testid` de llamada) y por su posición fija o `role="dialog"`.
  - **Tarjetas de llamada:** las localiza en los mensajes de `#main` con los mismos indicios.
  - **Salida:** el esqueleto anonimizado y una tabla de textos, imágenes y controles, con las reglas de RF-01, RF-02 y RF-04 que los alcanzan y el filtro.
  - **Privacidad:** no muestra nombres, teléfonos, duraciones, horas, `aria-label` ni la ruta completa de la página.
  - Probado en Chromium con un DOM inventado y datos secretos: no se filtró ningún dato.
- `scripts/diagnostico-llamadas.js` comprueba también las reglas nuevas.

## [0.1.2] — 2026-10-28

**Versión estable aprobada por el propietario para el primer lanzamiento público de Veilix** (28 de octubre de 2026). Está etiquetada como `v0.1.2` en `main` (commit `8672a99`, 28 de octubre de 2026). Todavía no está publicada en ninguna tienda. Congelación de funcionalidades: no incluye ningún cambio de comportamiento respecto a `0.1.2-beta.13`.

Manifiesto: `0.1.2` en Chrome, Edge, Firefox y Safari (sin `version_name`). Panel: «Veilix 0.1.2». Paquetes: `veilix-0.1.2-{chrome,edge,firefox,safari}.zip`.

### Incluye

Todo lo entregado de `0.1.2-beta.0` a `0.1.2-beta.13`, consolidado. El detalle de cada beta está en [Compilaciones internas de 0.1.2](#compilaciones-internas-de-012).

- **RF-01, nombres e información personal:**
  - Autores de los mensajes de grupo por su estructura `[data-testid="author"]`, también los participantes no guardados y la multimedia sin descripción (beta.1).
  - Nombre, nombre de usuario, teléfono y descripción del panel «Info. del contacto», con los emojis de la descripción (beta.13). El texto del interruptor pasa a describir la protección de la identidad.
- **RF-02, fotografías y avatares:**
  - Avatares de «Nuevo chat», predeterminados y con foto, también el de «Tú» (beta.2).
  - Avatares de participantes junto a los mensajes de grupo: foto e inicial (beta.3).
- **RF-03, vista previa:** un solo filtro por vista previa; antes se superponían dos (beta.6).
- **RF-04, contenido de los mensajes:**
  - **Recuadro «Responder»:** el texto citado (beta.0).
  - **«Info. del mensaje»:** el texto (beta.4) y los stickers (beta.5) de la copia del mensaje.
  - **Vídeos:** miniaturas dibujadas como fondos CSS en `video-content` (beta.7).
  - **Documentos adjuntos:** nombre, formato y tamaño (beta.8), y la etiqueta de la extensión del icono (beta.9).
  - **Citas dentro de los mensajes:** miniatura (beta.10) y duración, con su icono `chat-msg-symbol` (beta.11).
  - **Estados citados:** encabezado «Tú · Estados», reconocido por su estructura y por la etiqueta en español o inglés (beta.12).
- **RF-05, campo de entrada:** sin cambios.
- **Panel de Veilix:**
  - Textos de los cinco interruptores contrastados con el código.
  - Cada interruptor se describe con `aria-describedby` (beta.6).
- **Diagnósticos anonimizados nuevos o ampliados** en `scripts/` (no se incluyen en los paquetes):
  - `diagnostico-respuesta.js`, `diagnostico-remitentes.js`, `diagnostico-inicializacion.js` y `diagnostico-extension.js`;
  - `diagnostico-avatares-grupo.js`, `diagnostico-info-mensaje.js` y `diagnostico-videos.js`;
  - `diagnostico-adjuntos.js`, `diagnostico-respuestas-estado.js` y `diagnostico-info-contacto.js`;
  - `diagnostico-paneles.js`, ampliado.
- **Pruebas:**
  - Independencia de los cinco interruptores, en `tests/navegador/interruptores.test.ts`.
  - Tarjetas del panel, en `tests/navegador/tarjetas.test.ts`.
  - Una prueba de navegador por cada corrección. Cada una se comprobó fallando antes de la corrección.
- **Sin cambios en:**
  - Los permisos (solo `storage`) y el almacenamiento (solo las preferencias en `local:preferencias`, con el mismo esquema).
  - Las cuatro funcionalidades pendientes, que siguen sin interruptor.
  - La identidad visual y el crédito.
  - `version-renumeraciones.json`.

### Aprobación

- **Primer lanzamiento público:** el 28 de octubre de 2026, el propietario aprobó `0.1.2` como la estable del primer lanzamiento público. La publicación todavía no se ha hecho.
  - **Nota (30 de octubre de 2026):** el propietario eligió después [0.1.3] como primera versión del lanzamiento público. `0.1.2` se conserva como estable etiquetada, con sus paquetes, y no se publica.
- **Etiqueta:** ese mismo día se creó la etiqueta anotada `v0.1.2` sobre el commit `8672a99` de `main` (fusión del Pull Request #2), con la autorización del propietario. Marca el código exacto de esta estable. No creó ninguna Release.
- **Fase 2:** el mismo día, el propietario aprobó expresamente su cierre oficial. Sus entregables técnicos (RF-01 a RF-05, revelado temporal, panel, preferencias y aplicación en caliente) están consolidados en esta versión. El cierre no implica que se hayan validado todas las variantes de WhatsApp Web ni todos los navegadores; ver «Limitaciones conocidas».
- **Siguiente versión prevista:** `0.1.3-beta.0`, todavía no iniciada.

### Cambiado (versionado)

- Se pasa de `0.1.2-beta.13` a `0.1.2` con `npm run version:estable`.
- Las compilaciones internas `0.1.2.2000` a `0.1.2.2013` quedan numéricamente por encima de `0.1.2`. Es la consecuencia aceptada en la renumeración de `0.1.0`: no afecta a las tiendas, porque las betas nunca se suben.
- Cualquier corrección posterior empieza en `0.1.3-beta.0` (`npm run version:beta`) y no reutiliza `0.1.2`.

### Validación

- **Automatizada:** todas las verificaciones de `AGENTS.md` son correctas; los resultados están en la documentación técnica ([`docs/desarrollo.md`](docs/desarrollo.md), «Versión 0.1.2»).
- **Real en Google Chrome**, comunicada por el propietario (sistema operativo sin indicar):
  - **Confirmadas por elemento:**
    - autores de grupo (beta.1);
    - avatares de participantes en grupos, con ocho pruebas (beta.3);
    - texto (beta.4) y stickers (beta.5) de «Info. del mensaje»;
    - nombre, formato y tamaño de los documentos (beta.8) y la etiqueta de su icono (beta.9);
    - miniatura de la cita de un estado (beta.10).
  - **Cierre de la serie:** el 28 de octubre de 2026, el propietario comunicó que terminó la validación funcional de la serie `0.1.2-beta` y autorizó preparar esta estable. No consta el detalle por elemento del resto de correcciones (beta.0, beta.2, beta.6, beta.7 y de beta.11 a beta.13).
- **Sin prueba real** en Edge, Firefox, Brave, Opera, Vivaldi ni Safari.

### Limitaciones conocidas

- **«Info. del contacto» (RF-01):**
  - Las notas guardadas o en edición no se han observado: solo el marcador «Añade notas…», que sigue visible.
  - Solo se ha observado un contacto guardado de una cuenta de empresa. Los números no guardados y otros diseños de empresa no se han observado.
  - Siguen visibles otros textos no genéricos del panel cuyos contenedores no constan: uno de 968 caracteres con la forma de una descripción, otros de 20 y 16 caracteres, y textos interactivos de 7, 13, 15 y 76.
  - Las repeticiones del nombre en las filas inferiores tampoco están cubiertas.
- **Estados citados (RF-04):**
  - El encabezado solo se reconoce con la interfaz en español o en inglés.
  - Que la tarjeta observada sea una respuesta a un estado es muy probable, pero no está confirmado.
  - No se ha observado una cita convencional dentro de un mensaje.
  - Los estados de foto, texto o GIF no tienen evidencia.
- **Citas:**
  - La duración de una cita se difumina junto con su icono, y una cita convencional con la misma estructura también tendría su duración difuminada.
  - Las miniaturas citadas del recuadro «Responder» no tienen selector.
- **«Info. del mensaje»:** las fotos y los vídeos no tienen diagnóstico.
- **Vídeos:**
  - Está sin confirmar si las dos capas de la miniatura son hermanas o anidadas.
  - Mientras RF-04 protege la miniatura, su filtro de 6 px sustituye al de 8 px de WhatsApp, y durante el revelado esa capa se ve sin filtro.
  - La duración de un vídeo con forma de hora se difumina como una hora.
- **Documentos:** PDF, DOCX y los demás formatos solo están probados con el DOM simulado, y las miniaturas de la tarjeta no se han observado.
- **Indicadores:**
  - RF-03: los de enviado, entregado y reloj no tienen evidencia.
  - RF-04: el de reloj está pendiente.
- **RF-02:** la silueta del avatar de un participante de grupo no está confirmada.
- **Navegadores:** no hay pruebas reales fuera de Chrome, y Safari no se ha ejecutado nunca.
- **Dependencias:** `npm audit` informa de alertas en dependencias de desarrollo (`web-ext → node-forge`), que no se incluyen en la extensión. En producción, 0 vulnerabilidades.
- **Inicialización de los módulos** (investigación registrada en beta.1):
  - Si algo elimina un `<style data-veilix-estilo>` de la página, el módulo no lo vuelve a insertar hasta que se desactiva y se reactiva su interruptor. Mientras tanto, el interruptor aparece activo y esa parte de la página queda sin protección.
  - La causa del episodio de `0.1.2-beta.0`, con los interruptores activos y sin estilos en la página, no se ha confirmado.
- **Detalles menores sin confirmar o sin cubrir:**
  - El `title` del tamaño de un documento se sigue mostrando como descripción emergente, aunque solo aparece con el cursor encima, cuando el mensaje ya está revelado (beta.8).
  - El orden entre el dibujo y la etiqueta del icono de los documentos (beta.9).
  - Si el filtro de 8 px de las miniaturas de vídeo va en línea (beta.7).
  - Las variantes de respuesta no observadas (beta.0).
  - En «Info. del contacto», otros idiomas (beta.13).
- **Regresión de beta.2 de `0.1.1`:** su causa sigue sin identificarse.
- **`0.1.1`:** se conserva como antecedente histórico. No consta su aprobación ni su publicación, y su aprobación no es requisito de este lanzamiento.

## Compilaciones internas de 0.1.2

Compilaciones internas de prueba de `0.1.2-beta.0` a `0.1.2-beta.13`, conservadas tal como se registraron. Ninguna se publicó. Su contenido está consolidado en [0.1.2]. Van con un nivel de encabezado menos porque su manifiesto (`0.1.2.2000` a `0.1.2.2013`) es mayor que el de la estable `0.1.2`: la lista de versiones `## [...]` solo recoge las estables, en orden creciente de manifiesto.

### [0.1.2-beta.13] — 2026-10-27

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2013` en Chromium y Firefox (`version_name` `0.1.2-beta.13` en Chromium), y `0.1.2` en Safari.

#### Añadido

- **RF-01, «Info. del contacto»** (ampliación aprobada por el propietario): RF-01 difumina el nombre, el nombre de usuario, el teléfono y la descripción del panel. No se crea un interruptor nuevo, y la foto sigue en RF-02.
  - **Estructura confirmada** por el diagnóstico real (`scripts/diagnostico-info-contacto.js`, Chrome, un contacto guardado de una cuenta de empresa):
    - **Panel:** `[data-testid="drawer-right"]` › … › `[data-testid="chat-info-drawer"]`. `contact-info-header` solo contiene el título genérico.
    - **Nombre:** `span[data-testid="contact-info-subtitle selectable-text"]`, un `data-testid` de dos palabras.
    - **Usuario:** en el bloque de perfil, el `div` hermano del que contiene el nombre, con un `span[data-testid="selectable-text"][dir="auto"]` como hijo directo.
    - **Teléfono y descripción:** `section-phone-number` y `section-about` contienen solo la etiqueta; el valor está en el `div` hermano siguiente. La descripción lleva sus emojis como `img` GIF dentro del texto.
  - **Selectores** (`selectores.ts`):
    - `INFO_CONTACTO`.
    - `NOMBRE_INFO_CONTACTO`, que usa `[data-testid~="contact-info-subtitle"]`.
    - `USUARIO_INFO_CONTACTO`, que se elige por su relación con el nombre, no porque empiece por «@».
    - `VALOR_INFO_CONTACTO`, que usa `[data-testid="section-…"] + div`.
    - `TEXTO_VALOR_INFO_CONTACTO`, el `span` más externo del valor, fuera de los botones.
  - **Un filtro por dato:** los emojis de la descripción quedan bajo el filtro de su texto. Solo CSS, sin marcas ni observadores nuevos.
  - **Revelado:** el cursor sobre un dato revela solo ese dato; el atajo, todos.
  - **Fuera del alcance:** el título, las etiquetas «Número de teléfono» e «Info.», los botones, el marcador de las notas, los contadores, los interruptores y la foto (RF-02).
  - **Sin evidencia, sin cubrir:** las notas guardadas o en edición, los números no guardados, otros diseños de empresa, otros idiomas y las repeticiones del nombre en las filas inferiores, cuyos contenedores no constan en el árbol.
  - **Textos no atribuidos del mismo panel**, que siguen visibles y podrían ser datos personales:
    - un `span.selectable-text[data-testid="selectable-text"][title]` de 968 caracteres, no interactivo, con la misma forma que la descripción (quizá la descripción de la empresa);
    - un `span[dir="auto"][title]` de 20 caracteres y un texto de 16, no interactivos;
    - los textos interactivos de 7, 13, 15 y 76 caracteres.

    Sus contenedores no constan en el árbol conservado, así que no se han inventado selectores.
  - Pendiente de validación real.

#### Cambiado

- **Texto de RF-01 en el panel de Veilix:** «Difumina la identidad de contactos y grupos: sus nombres en la lista de chats, el encabezado de la conversación, los remitentes de los mensajes de grupo, el autor citado al responder y «Nuevo chat», y el nombre, el usuario, el teléfono y la descripción en «Info. del contacto».»

#### Añadido (pruebas)

- `tests/navegador/info-contacto.test.ts`, en Chromium, Firefox y WebKit (16 pruebas), sobre una réplica del árbol real:
  - Los cuatro datos difuminados con un único filtro, y los emojis bajo el de la descripción.
  - Títulos, etiquetas, botones, marcador de notas, contadores, interruptores y un texto seleccionable no atribuido, visibles; los botones siguen funcionando.
  - La foto depende solo de RF-02.
  - Revelado por dato y con el atajo; restauración y reactivación sin recargar, sin marcas.
  - Apertura, cierre y cambio de contacto; datos actualizados; contacto sin usuario ni descripción.
  - Independencia de RF-03, RF-04 y RF-05, y sin regresiones en la lista de chats ni en el encabezado.

  Sin las reglas nuevas fallan 10 de las 16.
- `tests/difuminado/selectores-info-contacto.test.ts`: cada selector elige exactamente su elemento en la réplica.
- `tests/navegador/interruptores.test.ts` y `npm run test:extension`: el panel forma parte de lo que protegen RF-01 y RF-02.
- `tests/apoyo/whatsapp-simulado.ts`: `abrirInfoContacto` y `cerrarInfoContacto`, con la estructura observada.

#### En investigación (antes de `0.1.2-beta.13`)

- **RF-01 y RF-02, panel «Info. del contacto» (Chrome, `0.1.2-beta.12`):** el propietario comunicó que, con la foto difuminada, quedan visibles el nombre, el nombre de usuario, el teléfono, la descripción y las notas. Pide ampliar RF-01 a esa información personal; la foto sigue en RF-02.
  - No hay evidencia del DOM del panel, así que no se ha cambiado ningún selector.
  - Al implementarlo, habrá que actualizar el texto de RF-01 en el panel de Veilix, porque pasará a cubrir más que nombres.

#### Añadido (diagnóstico, antes de `0.1.2-beta.13`)

- `scripts/diagnostico-info-contacto.js`: localiza el panel por su título genérico («Info. del contacto», «Contact info», «Info. de empresa») y toma como raíz `drawer-right` o, si no existe, su antecesor de al menos media ventana fuera de la conversación.
  - **Muestra:** el esqueleto anonimizado, los textos, las imágenes (con las reglas de RF-02 que las alcanzan) y los campos editables de las notas, con su marcador de posición y la longitud de su contenido.
  - **Clase de cada texto:** genérico de la interfaz (de una lista cerrada en español e inglés, tal cual) o anonimizado, con su forma: parece un teléfono, empieza por «~» o «@», contador, fecha, coincide con el nombre del chat.
  - Probado en Chromium con un DOM inventado y datos secretos: no se filtró ningún dato.

### [0.1.2-beta.12] — 2026-10-27

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2012` en Chromium y Firefox (`version_name` `0.1.2-beta.12` en Chromium), y `0.1.2` en Safari. Solo corrige el encabezado de los estados citados.

#### Corregido

- **RF-04, encabezado «Tú · Estados» de los estados citados:** con `0.1.2-beta.11` seguía nítido. Era lo único sin proteger en esa tarjeta.
  - **Reconocimiento** (con la autorización del propietario de usar la etiqueta como criterio complementario):
    - **Estructura confirmada:** `msg-container` › `quoted-message` sin `[data-testid="author"]` › `div[role=""]` › `span[dir="auto"]`, que no es el texto citado (`CANDIDATO_ENCABEZADO_ESTADO`).
    - **Etiqueta:** el marcador de mensajes exige además que el texto completo tenga la forma «… · Estados», «… · Estado» o «… · Status», y solo entonces lo marca con `data-veilix-encabezado-estado`.
  - **Por qué no basta la estructura:** la de una cita convencional dentro de un mensaje no se ha observado, y la cita de un mensaje propio («Tú») podría compartirla. Solo con la estructura, su «Tú» se difuminaría; las pruebas lo detectan.
  - **Idiomas:** la etiqueta depende del idioma. Se reconocen el español («Estado», «Estados») y el inglés («Status»). En otros idiomas el encabezado no se difumina.
  - **Alcance:** solo el `span`. La barra de color, la cita, la navegación, la miniatura y la duración no cambian. El revelado (cursor, foco de la cita y atajo) es el del resto del mensaje, y la marca se retira al desactivar RF-04.
  - **RF-01:** no difumina este encabezado. Con RF-01 activo sigue habiendo un solo filtro.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/encabezado-estado.test.ts`, en Chromium, Firefox y WebKit (11 pruebas):
  - El estado observado y dos variantes simuladas («Ana · Estado», «You · Status») se difuminan, solo el `span`, con un único filtro.
  - Barra, cita, miniatura, duración y clic se conservan.
  - **Casos negativos** (citas convencionales supuestas con la misma estructura): con autor, sin autor («Tú», la cita de un mensaje propio), con «Estados» en el texto citado, con un autor llamado «Ana · Estados» y con «Estados» sin separador.
  - Revelado con cursor, foco y atajo; restauración y reactivación sin recargar; estados citados nuevos; independencia de los otros cuatro interruptores.

  Sin la corrección fallan 8 de las 11. Con solo la regla estructural (sin la etiqueta) falla la prueba de casos negativos, por el «Tú» de la cita propia.
- `tests/difuminado/marcador-mensajes.test.ts`: `esEncabezadoEstado` y la clasificación, que solo marca los encabezados de estados.
- `tests/navegador/citas-miniatura.test.ts`, `tests/navegador/interruptores.test.ts` y `npm run test:extension`: el encabezado pasa a estar protegido por RF-04, sin filtro en su contenedor.
- `tests/apoyo/whatsapp-simulado.ts`: `citaConvencional` y `MENSAJES_ENCABEZADOS_CITA`.
- `scripts/diagnostico-respuestas-estado.js`: comprueba también la marca nueva.

### [0.1.2-beta.11] — 2026-10-27

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2011` en Chromium y Firefox (`version_name` `0.1.2-beta.11` en Chromium), y `0.1.2` en Safari. Solo corrige la duración de las citas, con la autorización del propietario.

#### Corregido

- **RF-04, duración de las citas («0:18» en una respuesta a un estado):** con `0.1.2-beta.10` seguía nítida.
  - **Causa confirmada** (diagnóstico real, réplica con `contains()` y reproducción en jsdom):
    - La duración es un nodo de texto directo de un `div[role="button"]` que contiene, en orden, `[data-testid="chat-msg-symbol"]` (un icono SVG), «0:18» y el texto citado. El encabezado y la miniatura están fuera.
    - El marcador de horas compara el `textContent` completo (21 caracteres, con el `<title>` del icono y el texto citado), así que no la reconocía.
  - **Corrección:** el marcador de mensajes reconoce, dentro de un `quoted-message` del mensaje, el elemento que tiene `chat-msg-symbol` como hijo directo y un texto directo con forma de duración (`CANDIDATO_DURACION_CITA`). Lo marca con `data-veilix-duracion-cita`, y RF-04 lo difumina entero.
    - **Un solo filtro:** el texto citado y lo demás que contiene quedan fuera de las otras reglas de RF-04, y nada de su interior se clasifica como hora o reacción.
    - **Salvaguardas:** nunca un contenedor con un autor, un encabezado, una miniatura, botones u otra cita.
    - **Sin cambios en el DOM:** solo se añade ese atributo, que se retira al desactivar RF-04.
    - El revelado (cursor, foco de la cita y atajo) es el del resto del mensaje.
  - **Coste aceptado por el propietario:** el icono `chat-msg-symbol` se difumina con la duración.
  - **Sin cambios:** la miniatura sigue protegida, y el encabezado «Tú · Estados» sigue nítido a la espera de una diferencia estructural fiable con las citas convencionales.
  - **Límite:** una cita convencional con la misma estructura (por ejemplo, la de un vídeo, si la usa) también tendría su duración difuminada. No se ha observado ninguna.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/citas-miniatura.test.ts` (18 pruebas por motor), con el simulador reproduciendo el árbol real:
  - Duración visible sin RF-04 y difuminada con un único filtro; icono y texto citado bajo ese filtro.
  - Solo se marca el contenedor, sin tocar el texto ni la estructura, y la hora de `msg-meta` sigue siendo una hora.
  - Revelado con cursor, foco y atajo; restauración y reactivación sin recargar; citas nuevas.
  - No se marcan horas, textos ni contenedores sin la estructura confirmada (sin símbolo, con un texto que no es una duración, con autor, con encabezado o fuera de una cita).
  - Encabezado y cita sin filtro ni marcas; independencia de los otros cuatro interruptores.

  Sin la corrección fallan 9 de las 18.
- `tests/difuminado/marcador-mensajes.test.ts`: `esDuracion` y la clasificación de la duración, sin horas dentro de las citas.
- `tests/navegador/interruptores.test.ts` y `npm run test:extension`: la duración de la cita, con un solo filtro.
- `tests/apoyo/whatsapp-simulado.ts`: `citaConMiniatura` reproduce el árbol real. Se retira la variante supuesta con la duración dentro de la miniatura.

#### Validación (antes de `0.1.2-beta.11`)

- **RF-04, documentos adjuntos (`0.1.2-beta.9`):** el propietario confirmó en Chrome que funcionan, incluida la etiqueta de extensión del icono.
- **RF-04, respuesta a un estado (`0.1.2-beta.10`):** la miniatura se difumina, pero el encabezado «Tú · Estados» y la duración «0:18» siguen nítidos.

#### En investigación (antes de `0.1.2-beta.11`)

- **RF-04, encabezado y duración de los estados citados:** la evidencia real solo incluye una cita dentro de un mensaje, la del estado. Sin ver una cita convencional del DOM real, no se puede distinguir de forma fiable la tarjeta de un estado sin mirar su texto, así que no se ha cambiado ningún selector.
  - **Duración, causa confirmada** (diagnóstico real y código): «0:18» es un nodo de texto directo de un `div[role="button"]` que contiene también `chat-msg-symbol` y el texto citado (`selectable-text`); su `textContent` tiene 21 caracteres.
    - El marcador de horas de RF-04 compara el `textContent` completo de cada elemento, así que no reconoce ahí una hora. Se reprodujo con jsdom: solo detecta la hora de `msg-meta`.
    - **Por qué no basta CSS:** CSS no puede seleccionar un nodo de texto suelto, y un filtro en ese `div` difuminaría también el icono y el texto citado, que ya tiene el suyo.
    - **Por qué no se toca el DOM:** envolver el texto en un elemento propio modificaría el DOM de WhatsApp, y la regla 9 lo prohíbe.
    - **Contenido real del `div`, comprobado con `contains()` sobre una réplica del árbol real:**
      - En orden: `[data-testid="chat-msg-symbol"]` (un SVG), el texto directo «0:18» y el texto citado.
      - El encabezado «Tú · Estados» y la miniatura están fuera.
      - Los 21 caracteres encajan con 4 + 5 más el `<title>` del SVG, de 11.
    - **Consecuencia de difuminar el `div`:** el texto citado recibiría dos filtros (comprobado: 2 en vez de 1), salvo que se le retire el suyo, y el icono de `chat-msg-symbol` también se difuminaría.

#### Cambiado (diagnóstico, antes de `0.1.2-beta.11`)

- `scripts/diagnostico-respuestas-estado.js`: tabla de **rasgos de cada cita**, para comparar una respuesta a un estado con una cita convencional sin mirar su texto.
  - **Rasgos:** sus `data-testid` y sus iconos; si tiene autor (`[data-testid="author"]`), texto citado y miniaturas; sus encabezados `span[dir="auto"]`; la duración, con sus hijos y la longitud de su texto completo; y sus elementos interactivos.
  - Selecciona hasta seis citas no convencionales.
  - Reconoce también las citas sin `data-testid` `quoted…`: el botón que contiene un texto citado (`.quoted-mention`) o un autor.
  - **Encabezado:** el diagnóstico real decía que el contenedor de la duración «contiene: encabezado». Era un error: el criterio `span[dir="auto"]` incluía el texto citado, que también lleva `dir="auto"`. Ahora el encabezado excluye el texto citado, y su relación con la duración se comprueba con `contains()` (dentro, fuera o antecesor).
  - **Títulos de icono:** muestra los títulos de SVG con forma de nombre de icono (minúsculas con guiones, como `tail-in`).
  - **Duración:** describe los hijos de su contenedor en orden, nodos de texto directos incluidos (solo su longitud y su forma), y si contiene encabezado, autor, texto citado, miniatura, iconos o botones.
  - Probado en Chromium con un DOM inventado y datos secretos: no se filtró ningún dato.
- `scripts/diagnostico-respuestas-estado.js` comprueba también la marca `data-veilix-duracion-cita`.

### [0.1.2-beta.10] — 2026-10-27

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2010` en Chromium y Firefox (`version_name` `0.1.2-beta.10` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-04, miniaturas de las citas dentro de los mensajes:** con `0.1.2-beta.9`, el propietario vio en Chrome, en una respuesta a un estado («Tú · Estados», «0:18»), la miniatura del estado sin difuminar.
  - **Causa confirmada** por el diagnóstico real (`scripts/diagnostico-respuestas-estado.js`, con RF-04 y RF-01 activas, sin cursor ni atajo):
    - Dentro de `msg-container` › `[data-testid="quoted-message"]` (con un `div[role="button"][tabindex="0"]`) está la miniatura de 58 × 58 px: un `div` con fondo en línea `data:image/jpeg`.
    - Junto a ella hay un encabezado `span[dir="auto"]` de 12 caracteres, un texto de 4 con forma de duración y el texto citado (`selectable-text`, ya difuminado).
    - Ninguna regla de RF-04 alcanzaba la miniatura.
  - **Límites de la evidencia:** el diagnóstico clasificó el mensaje como cita convencional, porque buscaba «Estados» como texto independiente y el encabezado es compuesto. Las longitudes coinciden con «Tú · Estados» y «0:18» de la captura, pero que sea una respuesta a un estado es una hipótesis muy probable, no una confirmación.
  - **Corrección:** RF-04 difumina la capa más externa con fondo `data:image/jpeg` dentro de un `quoted-message` del mensaje (`MINIATURA_CITA`), no la cita entera.
    - Nunca elige un fondo que contenga el texto citado, el encabezado o botones, porque eso no sería la miniatura sino un contenedor mayor.
    - La regla de multimedia y el marcador de horas ignoran lo que haya dentro de la miniatura, así que cada elemento recibe un solo filtro.
    - El recuadro «Responder» del pie y «Info. del mensaje» quedan fuera, igual que los fondos fuera de una cita.
    - El revelado (cursor, foco de la cita y atajo) y la restauración son los del resto del mensaje. Solo CSS.
  - **Duración e indicador:**
    - Si están dentro de la miniatura, se difuminan con ella.
    - Si están fuera, el indicador sigue visible.
    - Fuera de la miniatura, la duración tiene forma de hora y el marcador de RF-04 la difumina como una hora, igual que antes de esta versión.

    La posición real no está confirmada.
  - **Sin evidencia:** las respuestas a estados de foto, texto o GIF, y las citas de otros tipos de mensaje.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/citas-miniatura.test.ts`, en Chromium, Firefox y WebKit (15 pruebas):
  - Miniatura de 58 × 58, visible sin RF-04 y difuminada con un único filtro con RF-04.
  - Duración e indicador dentro de la miniatura sin doble filtro; texto citado y respuesta protegidos.
  - Cita, botón, encabezado e indicador visibles; la cita sigue respondiendo al clic.
  - Revelado con cursor (solo ese mensaje), foco de la cita y atajo; restauración y reactivación sin recargar.
  - Citas nuevas y cambio de conversación.
  - Cita convencional, fondos fuera de una cita o del mensaje y fondos que envuelven el encabezado, sin difuminar.
  - Independencia de los otros cuatro interruptores; RF-01 no difumina «Tú · Estados».

  Sin la regla nueva fallan 8 de las 15.
- `tests/difuminado/selectores-mensaje.test.ts`: `MINIATURA_CITA` elige solo la capa más externa de la cita y nunca un contenedor del encabezado; la multimedia de su interior no se difumina otra vez.
- `tests/navegador/interruptores.test.ts` y `npm run test:extension`: la miniatura de la cita forma parte de lo que protege RF-04, sin filtro en la cita ni en su encabezado.
- `tests/apoyo/whatsapp-simulado.ts`: `citaConMiniatura` y `MENSAJES_CITAS_MINIATURA`.

#### Añadido (diagnóstico)

- `scripts/diagnostico-respuestas-estado.js` (preparado con `0.1.2-beta.9`, sin cambiar la versión): esqueleto anonimizado de las respuestas a estados y de las citas visibles, con las reglas de RF-04 y de autores de RF-01 que alcanzan a cada elemento.
  - **Textos e imágenes:** tipo, tipo de origen, tamaño, si están en la cita o en un elemento interactivo, filtros y lo que se pinta encima.
  - **Revelado:** si el mensaje está revelado por el cursor, el foco o el atajo.
  - **Privacidad:** solo muestra tal cual las etiquetas genéricas.

#### Cambiado (diagnóstico)

- `scripts/diagnostico-respuestas-estado.js` clasifica ahora en cuatro grupos:
  - **Respuesta a un estado confirmada:** por un identificador inequívoco, como un `data-testid` de estado o el icono `wds-ic-status…`.
  - **Posible respuesta a un estado:** por la palabra «Estados» en el encabezado, sola o compuesta.
  - **Cita con miniatura.**
  - **Cita convencional.**

  Además:
  - Muestra el encabezado compuesto genérico «Tú · Estados», pero no uno con un nombre.
  - Comprueba también la regla nueva.
  - Probado en Chromium con un DOM inventado y datos secretos: no se filtró ningún dato.

### [0.1.2-beta.9] — 2026-10-27

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2009` en Chromium y Firefox (`version_name` `0.1.2-beta.9` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-04, etiqueta de extensión del icono de los documentos:** con `0.1.2-beta.8`, la etiqueta PNG o JPG del icono seguía visible.
  - **Estructura confirmada** por el diagnóstico real de `0.1.2-beta.7`: dentro de `document-thumb`, el icono es un elemento con `data-icon="document-PNG-icon"` (o `document-JPG-icon`) con su SVG, y la etiqueta, un `div` hermano suyo en el mismo contenedor.
  - **Corrección:** RF-04 difumina solo ese `div` (`ETIQUETA_ICONO_DOCUMENTO`), en cualquier orden respecto al icono y sin depender de la extensión. El dibujo del icono y su SVG siguen nítidos.
  - **Salvaguardas:** no se difumina ningún hermano que contenga iconos, imágenes, botones o los datos de `0.1.2-beta.8`, así que no hay filtros superpuestos ni se toca el resto de la tarjeta.
  - El revelado y la restauración son los del resto del mensaje. Solo CSS.
  - **Validación real de `0.1.2-beta.8`:** el propietario confirmó en Chrome que el nombre, el formato y el tamaño se difuminan.
  - **Sin confirmar:** el orden del icono y la etiqueta (las pruebas cubren los dos) y otros formatos (PDF, DOCX…), probados solo con el DOM simulado.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/documentos.test.ts`:
  - **Nueva:** etiqueta PNG, JPG, PDF y DOCX difuminada con un único filtro, con la etiqueta antes o después del dibujo, y el dibujo y su SVG nítidos.
  - **Ampliadas:** las demás incluyen la etiqueta: revelado, restauración, independencia y ausencia de doble filtro.

  Sin la regla nueva fallan 9 de las 16.
- `tests/difuminado/selectores-mensaje.test.ts`: `ETIQUETA_ICONO_DOCUMENTO` elige el `div` hermano del icono en los dos órdenes. No elige el bloque del nombre, el del botón, los hermanos de iconos que no son de documento ni nada fuera de un mensaje.
- `tests/navegador/interruptores.test.ts` y `npm run test:extension`: la etiqueta del icono forma parte de lo que protege RF-04, sin filtro en el dibujo.
- `tests/apoyo/whatsapp-simulado.ts`: el icono simulado sigue la estructura observada, con la opción `etiquetaAntes`.
- `scripts/diagnostico-adjuntos.js`: comprueba también la regla nueva.

### [0.1.2-beta.8] — 2026-10-27

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2008` en Chromium y Firefox (`version_name` `0.1.2-beta.8` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-04, datos de los documentos adjuntos:** con `0.1.2-beta.7`, el nombre, el formato y el tamaño de las tarjetas de archivo quedaban visibles.
  - **Causa confirmada** por el diagnóstico real (`scripts/diagnostico-adjuntos.js`, con RF-04 activa y sin revelado; dos imágenes enviadas como documento, PNG y JPG):
    - La tarjeta es `[data-testid="document-thumb"][role="button"]` dentro de `msg-container`.
    - El nombre está en un `span[dir="auto"]`, el formato en `[data-testid="type"]` y el tamaño en un `span[title]`.
    - Ninguna regla de RF-04 los alcanzaba: no son `.selectable-text` ni multimedia. La descripción del adjunto ya se difuminaba.
  - **Corrección:** RF-04 difumina esos tres datos dentro de la tarjeta (`DATOS_DOCUMENTO`), no la tarjeta entera, que es el control que abre o descarga el archivo.
    - Solo el más externo de cada grupo anidado, sin lo que ya cubre la regla de texto: un único filtro por dato.
    - Nunca un elemento con iconos o imágenes, ni los botones de dentro de la tarjeta.
    - El revelado (cursor, foco de la tarjeta y atajo) y la restauración son los del resto del mensaje. Solo CSS, sin observadores nuevos.
  - **Descripciones emergentes:** el `title` del tamaño solo aparece con el cursor encima, cuando el mensaje ya está revelado. CSS no oculta los atributos `title`.
  - **Pendiente de evidencia:** la etiqueta PNG/JPG del icono, cuya representación no consta en la evidencia recibida, y las miniaturas de la tarjeta. PDF, DOCX y otros formatos solo están probados con el DOM simulado.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/documentos.test.ts`, en Chromium, Firefox y WebKit (15 pruebas): documentos PNG y JPG con la estructura observada, y PDF y DOCX simulados.
  - Nombre, formato y tamaño difuminados con un único filtro; nombre largo en varias líneas; descripción sin doble filtro.
  - Tarjeta, icono y botón de descarga visibles y pulsables; la hora conserva su comportamiento.
  - Revelado con cursor (solo ese mensaje), foco de la tarjeta y atajo; restauración y reactivación sin recargar.
  - Documentos nuevos y cambio de conversación; los mismos atributos fuera de una tarjeta no se difuminan; independencia de los otros cuatro interruptores.

  Sin la regla nueva fallan 9 de las 15.
- `tests/difuminado/selectores-mensaje.test.ts`: `DATOS_DOCUMENTO` elige solo el nombre, el formato y el tamaño, sin controles, iconos, texto ya cubierto ni elementos fuera de la tarjeta.
- `tests/navegador/interruptores.test.ts`: los datos de un documento forman parte de lo que protege RF-04.
- `tests/apoyo/whatsapp-simulado.ts`: tipo `documento` y `MENSAJES_DOCUMENTOS`.
- `npm run test:extension`: nombre, formato y tamaño difuminados, sin filtro en la tarjeta ni en el botón de descarga.

#### Añadido (diagnóstico)

- `scripts/diagnostico-adjuntos.js`: localiza los mensajes visibles con indicios de adjunto y muestra el esqueleto anonimizado de cada uno.
  - **Indicios:** un texto con forma de tamaño, de páginas o de nombre de archivo; un icono de documento, archivo o descarga; un `data-testid` de documento; un enlace con `download`.
  - **Para cada texto, icono e imagen:** su clase (tamaño, páginas, nombre de archivo, extensión común, hora), su tamaño en pantalla, si está en un botón, qué regla de RF-04 lo alcanza y si está difuminado.
  - **Privacidad:** no muestra textos ni nombres de archivo; de un nombre de archivo solo indica la extensión, y solo si es común.
  - Comprueba también la regla nueva (`DATOS_DOCUMENTO`).
  - Probado en Chromium con un DOM inventado y datos secretos: no se filtró ningún dato.

### [0.1.2-beta.7] — 2026-10-27

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2007` en Chromium y Firefox (`version_name` `0.1.2-beta.7` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-04, miniaturas de vídeo visibles en la conversación:** con `0.1.2-beta.6`, el propietario vio en Chrome la miniatura de un vídeo sin difuminar.
  - **Causa confirmada** por el diagnóstico real (`scripts/diagnostico-videos.js`, con RF-04 activa y sin ningún revelado):
    - Los dos vídeos de la conversación están en `#main`, en filas `[data-id]` con `msg-container`, dentro de `[data-testid="video-content"]`.
    - Cada miniatura son dos capas `div` con un fondo en línea `data:image/jpeg`: una trae `filter: blur(8px)` de WhatsApp y la otra, sin filtro, muestra la miniatura nítida. Se observó en vertical (256 × 354 px) y en horizontal (346 × 200 px).
    - `MULTIMEDIA_MENSAJE` solo reconocía `img`, `video`, `canvas` y fondos con `blob:`, así que ninguna regla de Veilix alcanzaba esas capas. El vídeo que parecía protegido solo lo estaba en parte, por el filtro de WhatsApp en una de sus capas.
  - **Corrección:** RF-04 difumina la capa más externa con fondo `data:image/jpeg` de cada `video-content`, dentro de `msg-container` (`MINIATURA_VIDEO`).
    - **Un solo filtro de Veilix por capa:** si las capas son hermanas, cada una recibe su filtro; si una contiene a la otra, la interior queda difuminada con la exterior.
    - **Sin doble filtro:** `MULTIMEDIA_MENSAJE` y el marcador de horas y reacciones ignoran lo que haya dentro de esa capa.
    - **Fuera del alcance:** `video-content`, la burbuja, el botón de reproducir y los fondos `data:image/jpeg` fuera de `video-content`, como el fondo de la conversación o el encabezado.
    - El revelado (cursor, foco y atajo) y la restauración no cambian. Solo CSS, sin observadores nuevos.
  - **Filtro de 8 px de WhatsApp:**
    - Mientras RF-04 está activa y la capa no se revela, el difuminado de Veilix (6 px) sustituye ese filtro.
    - Durante el revelado, la capa se ve sin filtro.
    - Al desactivar RF-04, recupera sus 8 px.
  - **Sin confirmar:** si las capas son hermanas o anidadas, y si el filtro de 8 px va en línea. Las pruebas cubren los dos casos.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/videos.test.ts`, en Chromium, Firefox y WebKit (14 pruebas por cada relación de capas, hermanas y anidadas):
  - Vídeo vertical y horizontal; sin RF-04, la capa nítida deja ver la miniatura aunque la otra tenga el filtro de WhatsApp.
  - Con RF-04, ninguna capa la deja ver, con un único filtro de Veilix por capa y sin filtro en `video-content` ni en la burbuja.
  - Botón de reproducir visible; foto, `<video>` y texto siguen difuminados.
  - Restauración sin recargar, también del filtro de 8 px de WhatsApp.
  - Revelado con cursor (solo ese vídeo), atajo y foco.
  - Vídeos nuevos, cambio de conversación y miniatura sustituida.
  - Fondos `data:image/jpeg` fuera de `video-content` sin difuminar; independencia de los otros cuatro interruptores.

  Sin la regla nueva fallan 14 de las 28 de cada motor.
- `tests/difuminado/selectores-mensaje.test.ts`: `MINIATURA_VIDEO` elige solo la capa más externa, dentro de `msg-container` y `video-content`, y `MULTIMEDIA_MENSAJE` ignora lo que hay dentro de ella.
- `tests/navegador/interruptores.test.ts`: la miniatura de vídeo forma parte de lo que protege RF-04.
- `tests/apoyo/whatsapp-simulado.ts`: tipo `videoMiniatura` (vertical u horizontal, capas hermanas o anidadas) y `mensajesConVideos`.
- `npm run test:extension`: las dos capas de una miniatura de vídeo difuminadas, sin filtro en `video-content`.

#### Añadido (diagnóstico)

- `scripts/diagnostico-videos.js`: compara todo lo que pinta una imagen en la conversación y fuera de ella (salvo la lista de chats). Para cada elemento muestra:
  - Posición, tamaño y tipo (`img`, `video` y `poster`, `canvas`, fondos o máscaras CSS…), sin URL.
  - Zona respecto a `#main`, la fila `[data-id]` y `msg-container`.
  - Qué regla de RF-04 lo alcanza (incluida la nueva), sus filtros y los de sus antecesores, y si el filtro está en línea.
  - Su relación con las demás capas del mismo vídeo (hermana, antecesora o descendiente).
  - Si su mensaje está revelado por el cursor, el foco o el atajo, y lo que se pinta encima de él.

  Probado en Chromium con un DOM inventado y datos secretos: no se filtró ningún dato.

### [0.1.2-beta.6] — 2026-10-27

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2006` en Chromium y Firefox (`version_name` `0.1.2-beta.6` en Chromium), y `0.1.2` en Safari. Auditoría de los cinco interruptores del panel (RF-01 a RF-05).

#### Cambiado

- **Textos del panel:** la descripción de cada interruptor enumera las zonas que protege su módulo, contrastadas con las reglas del código. No menciona las zonas sin selector (fotos y vídeos de «Info. del mensaje», miniaturas citadas) ni los indicadores sin evidencia (enviado, entregado, reloj).
  - **RF-01:** «Difumina los nombres de contactos y grupos en la lista de chats, el encabezado de la conversación, los remitentes de los mensajes de grupo, el autor citado al responder y «Nuevo chat», con la información de cada contacto.»
  - **RF-02:** «Difumina las fotografías y los avatares de contactos y grupos, incluidos los predeterminados y los de iniciales, en la lista de chats, el encabezado, «Nuevo chat» y junto a los mensajes de grupo.»
  - **RF-03:** «Difumina la vista previa del último mensaje de cada chat en la lista, con sus emojis, sus reacciones y el indicador de leído.»
  - **RF-04:** «Difumina el texto, la multimedia, la hora y las reacciones de los mensajes, el texto citado al responder y el texto y los stickers de «Info. del mensaje».»
  - **RF-05:** «Difumina lo que escribes en el campo de mensaje, sin impedir escribir, corregir ni enviar.»
  - **Revelado:**
    - RF-01 a RF-04: «Revelar: cursor encima o Ctrl + Mayús + Espacio; también con el foco del teclado donde WhatsApp lo permita.»
    - RF-05: «Revelar: cursor encima o Ctrl + Mayús + Espacio.» El foco no revela el editor, porque el texto quedaría visible siempre mientras se escribe.
- **Accesibilidad:** cada interruptor se describe (`aria-describedby`) con la descripción y la nota de su tarjeta. El diseño, el orden de tabulación y el manejo con Espacio e Intro no cambian.

#### Corregido

- **RF-03, filtros superpuestos en la vista previa.**
  - **Detectado** por la prueba de independencia nueva, en el DOM simulado. Se marcaban a la vez el `span[title]` de la vista previa y el `span[dir]` que contiene, de modo que el texto recibía dos difuminados (más intensos que en el resto de zonas). Lo mismo ocurría con un indicador de leído situado dentro de la vista previa.
  - **Sin evidencia real** de que WhatsApp Web anide así esos elementos.
  - **Corrección:** solo se marca el elemento más externo de cada vista previa (`soloExternos`), y no se marca un indicador que ya está dentro de ella. La zona protegida y el revelado no cambian.

#### Añadido (pruebas)

- `tests/navegador/interruptores.test.ts`, en Chromium, Firefox y WebKit (19 pruebas), sobre una página con todas las superficies: lista de chats, grupo con autores, avatares y multimedia, «Responder», «Info. del mensaje» y «Nuevo chat».
  - Cada interruptor solo, y cada uno desactivado con los otros cuatro activos.
  - Los cinco activos con un único filtro efectivo por elemento; los cinco desactivados sin estilos, marcas ni filtros.
  - Alternancia en vivo uno a uno y cambio de conversación.
  - Atajo de revelado para los cinco; el cursor sobre una fila revela solo esa fila.
  - El foco del teclado revela la fila enfocada, pero el del editor no revela lo escrito.
  - El texto de «Info. del mensaje» depende solo de RF-04.

  Sin la corrección de RF-03 falla la prueba del filtro único.
- `tests/navegador/tarjetas.test.ts` (4 pruebas por motor): las tarjetas con el CSS real caben en los 380 px del emergente, sin desbordar ni solapar el interruptor. El tabulador recorre los cinco en orden, Espacio e Intro los alternan sin afectar a los demás y se muestra el contorno de foco.
- `tests/panel-configuracion.test.tsx`: `aria-describedby` de cada interruptor.
- `tests/difuminado/marcador-lista-chats.test.ts`: solo el elemento más externo de la vista previa, `soloExternos` y el indicador dentro de la vista previa.

#### Validación

- **RF-04, stickers de «Info. del mensaje» (`0.1.2-beta.5`):** el propietario confirmó en Chrome que funcionan.

### [0.1.2-beta.5] — 2026-10-27

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2005` en Chromium y Firefox (`version_name` `0.1.2-beta.5` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-04, stickers en «Info. del mensaje»:** con `0.1.2-beta.4`, el sticker quedaba visible.
  - **Causa confirmada** por el diagnóstico real:
    - El sticker está en `[data-testid="sticker-container"]` › `div[role="button"][tabindex="0"]`, con un `canvas` visible (190 × 190 px) y un `img` auxiliar de origen `blob:` (0 × 0 px), dentro de la copia del mensaje en `drawer-right`.
    - Ninguna regla de RF-04 los alcanzaba: la de multimedia está limitada a `#main`, y la de esta pantalla solo cubría el texto.
  - **Corrección:** una regla aparte de RF-04 difumina `[data-testid="sticker-container"] :is(img[src^="blob:"], canvas)` dentro de `MENSAJE_INFO` (`VISUAL_STICKER_INFO`).
    - Ni el contenedor ni su botón reciben filtro; un solo difuminado por nodo visible.
    - Se revela con la copia del mensaje (cursor, foco del botón y atajo).
    - Solo CSS, sin observadores nuevos.
  - **Pendiente de evidencia:** las fotos y los vídeos de esta pantalla.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/info-mensaje.test.ts`, en Chromium, Firefox y WebKit, 7 pruebas nuevas de stickers:
  - Sticker animado (`canvas` visible e `img` de 0 × 0) y estático (`img` visible).
  - Un único difuminado efectivo, sin filtro en el contenedor ni en el botón.
  - Hora, indicadores, estados, título y cierre visibles.
  - Revelado con cursor, con el foco del botón y con el atajo.
  - Cambio entre un texto y un sticker, cierre y restauración al desactivar.
  - Stickers de otros paneles laterales excluidos, e independencia de las demás funciones.

  Sin la regla nueva fallan 5 de las 7.
- `tests/apoyo/whatsapp-simulado.ts`: `abrirInfoMensaje` admite un sticker `animado` o `estatico`, y el texto pasa a ser opcional.
- `npm run test:extension`: sticker de «Info. del mensaje» (`canvas`) difuminado, sin filtro en su contenedor.

#### Validación

- **RF-04, texto de «Info. del mensaje» (`0.1.2-beta.4`):** el propietario confirmó en Chrome que el texto se difumina y se revela con el cursor. El título, el cierre, las horas, los indicadores, «Leído» y «Entregado» siguen visibles.

#### Añadido (diagnóstico)

- `scripts/diagnostico-info-mensaje.js`: tabla de los elementos visuales de cada copia del mensaje y, para comparar, de los mensajes multimedia de la conversación.
  - **Muestra:** el tipo de origen, los atributos de vídeo, el canvas, el SVG, los fondos y máscaras CSS (también en pseudoelementos), la ruta, el tamaño, si es contenido o `msg-meta`, si está en un botón o puede recibir el foco, las reglas de RF-04 y el filtro.
  - Comprueba también la regla de texto de `0.1.2-beta.4` y la de multimedia de la conversación.
  - **Probado en Chromium** con stickers inventados (`img` de `blob:` y `canvas`, dentro de un elemento pulsable):
    - No se filtró ningún dato.
    - Distinguió el sticker de «Info. del mensaje» (sin regla y visible) del de la conversación (difuminado).

### [0.1.2-beta.4] — 2026-10-26

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2004` en Chromium y Firefox (`version_name` `0.1.2-beta.4` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-04, «Info. del mensaje»:** con `0.1.2-beta.3`, la pantalla mostraba la copia del mensaje sin difuminar.
  - **Causa confirmada** por el diagnóstico real (mensaje de texto):
    - La copia está fuera de `#main` (`dentroDeMain: false`), en `[data-testid="drawer-right"]` › `div.copyable-area`, y las reglas de RF-04 solo actúan en `#main`.
    - El texto está en `[data-testid="selectable-text"]` dentro de `[data-testid="msg-container"]`; los metadatos, en `msg-meta`; y los estados, en `kept-by-info`.
  - **Corrección:** RF-04 difumina el `selectable-text` más externo de la copia (`TEXTO_MENSAJE_INFO`), solo en un `drawer-right` que contenga `kept-by-info` (`INFO_MENSAJE`).
    - Excluye los metadatos y el autor.
    - Quedan visibles el título, el cierre, la hora, los indicadores, los estados y las fechas.
    - Se revela con la copia del mensaje y con el atajo.
    - Solo CSS, sin observadores nuevos.
  - **Pendiente de evidencia:** la multimedia de esta pantalla, que no tiene selector.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/info-mensaje.test.ts`, en Chromium, Firefox y WebKit, con la estructura observada:
  - Texto y emojis difuminados, con un único filtro.
  - Hora, indicadores, «Leído», «Entregado», fechas, título y cierre visibles; el cierre sigue funcionando.
  - Abrir, cerrar, volver a abrir y cambiar de mensaje.
  - Revelado con cursor y atajo; restauración al desactivar.
  - Otro panel lateral derecho sin `kept-by-info`, excluido.
  - Independencia de RF-01, RF-02 y RF-05.
  - Conversación y recuadro «Responder» sin cambios.

  Sin la regla nueva fallan 5 de las 9 pruebas.
- `tests/apoyo/whatsapp-simulado.ts`: `abrirInfoMensaje`, `cerrarInfoMensaje` y `abrirOtroPanelDerecho`.
- `npm run test:extension`: texto de «Info. del mensaje» difuminado, con la hora y el estado visibles.

#### Validación

- **RF-02, avatares de participantes en grupos (`0.1.2-beta.3`):** el propietario aprobó las ocho pruebas funcionales, incluida la conservación de la lista de chats, el encabezado y «Nuevo chat». La incidencia queda cerrada. No consta si la prueba incluyó un avatar con silueta.

#### Añadido (diagnóstico)

- `scripts/diagnostico-info-mensaje.js`: diagnóstico anonimizado de «Info. del mensaje».
  - **Busca fuera de la conversación:** componentes de mensaje, multimedia, textos que coinciden con un mensaje visible (sin mostrarlos), el título y los estados.
  - **Muestra:** la raíz del panel, su ascendencia y su esqueleto, con las reglas de RF-04 y el difuminado de cada elemento.
  - **Probado en Chromium** con una pantalla inventada (copia del mensaje con texto, emoji, foto y vídeo, estados con fecha y botón de cierre):
    - No se filtró ningún dato.
    - Localizó la raíz del panel y la copia del mensaje.

#### Pendiente para la estable `0.1.2`

- **RF-04, recuadro «Responder» (`0.1.2-beta.0`) e «Info. del mensaje» (`0.1.2-beta.4`):** no consta validación real. La preparación de la estable queda detenida hasta que el propietario la confirme.
- **Multimedia de «Info. del mensaje»:** sin diagnóstico ni selector.
- **Miniaturas citadas en el recuadro «Responder»:** no hay selector ni diagnóstico; seguirían visibles. Es una limitación conocida, ya documentada.

### [0.1.2-beta.3] — 2026-10-26

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2003` en Chromium y Firefox (`version_name` `0.1.2-beta.3` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-02, avatares de participantes en grupos:** con `0.1.2-beta.2`, los avatares junto a los mensajes de un grupo con una inicial en un círculo de color seguían visibles.
  - **Causa confirmada** por el diagnóstico real (RF-02 activa, atajo inactivo, cursor fuera):
    - El avatar es `[data-testid="group-chat-profile-picture"]` dentro de `#main [data-testid="conversation-panel-messages"]`.
    - La foto (`img`, unos 28 × 28 px) ya la cubría `FOTO_PERFIL`.
    - El círculo de color con la inicial (`[data-testid="profile-first-initial"]`) no lo reconocía ninguna regla.
  - **Corrección:** RF-02 difumina el contenedor `group-chat-profile-picture` más externo (`AVATAR_PARTICIPANTE`).
    - La foto, o el círculo y la inicial, se difuminan como una sola unidad.
    - Se revela con el propio avatar.
    - Solo CSS, sin observadores nuevos, independiente de RF-01 y RF-04.
    - Las reglas anteriores de fotos no se aplican dentro del contenedor, para no difuminar dos veces.
    - Esa exclusión va dentro de `:where()`. Sin él, el `#main` del selector subía la especificidad del difuminado global por encima del revelado de la lista de chats. La ejecución completa de `test:navegador` lo detectó antes de la entrega.
  - **Pendiente de evidencia:** que el avatar con silueta use el mismo contenedor.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/avatares-grupo.test.ts`, en Chromium, Firefox y WebKit, con la estructura observada:
  - Foto, inicial con su círculo y silueta (supuesta).
  - Un único filtro por avatar.
  - Sin difuminado del panel, las filas, los mensajes, la multimedia, las reacciones, los controles, los autores ni el editor.
  - Independencia de RF-01 y RF-04, y las tres juntas.
  - Mensajes nuevos y cambio de grupo.
  - Revelado con cursor, foco y atajo; restauración al desactivar.
  - Conservación de la lista de chats, del encabezado y de «Nuevo chat».

  Con el módulo de `0.1.2-beta.2` fallan 6 de las 9 pruebas. Sin la exclusión del doble filtro, falla la del filtro único.
- `tests/apoyo/whatsapp-simulado.ts`: avatares de grupo (`avatarGrupo`) en dos posiciones supuestas, y la lista de mensajes con `conversation-panel-messages`.
- `npm run test:extension`: avatar con inicial difuminado con un solo filtro, y la fila del mensaje sin difuminar.

#### Restaurado

- `wxt.config.ts` apareció eliminado del árbol de trabajo durante la entrega anterior, sin que lo hiciera el agente. Se restauró con el contenido de `HEAD` (`git show HEAD:wxt.config.ts`), idéntico al confirmado, porque sin él no se puede compilar ni verificar.

#### Añadido (diagnóstico)

- `scripts/diagnostico-avatares-grupo.js`: diagnóstico anonimizado de los avatares de participantes en un grupo.
  - **Recorre:** los elementos de cada fila de mensaje fuera de la burbuja, y lo pintado junto a ella (`elementsFromPoint`), dentro o fuera de la fila.
  - **Muestra de cada uno:**
    - Su ruta y su relación con la burbuja, el autor y los botones.
    - Sus señales: imagen, SVG, fondo o máscara CSS, color de fondo, forma redonda y texto de una o dos letras.
    - Su tipo, las reglas de RF-02 que lo alcanzan y dónde está el filtro.
  - **Probado en Chromium** con un grupo inventado (foto, silueta, inicial de una y de dos letras, y un avatar fuera de la fila):
    - No se filtró ningún dato: ni nombres, ni iniciales, ni teléfonos, ni `aria-label`, ni colores, ni direcciones.
    - Cada avatar quedó bien clasificado.

### [0.1.2-beta.2] — 2026-10-26

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2002` en Chromium y Firefox (`version_name` `0.1.2-beta.2` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-02, avatares predeterminados de «Nuevo chat»:** con `0.1.2-beta.1`, las fotos personalizadas se difuminaban, pero no los avatares predeterminados (círculos de color con una silueta).
  - **Causa confirmada** por el diagnóstico real (17 contactos y la fila «Tú»; 11 fotos con `FOTO_PERFIL` y 6 avatares sin ninguna regla):
    - El avatar predeterminado es un `svg` de 49 × 49 px con `path`, sobre un fondo de color, sin `<mask>`, sin `data-icon` y sin origen `pps`.
    - Ningún selector de RF-02 lo reconocía, y la regla por fila no se aplica en «Nuevo chat».
  - **Estructura confirmada:** `cell-frame-container` (en «Tú», `message-yourself-row`) tiene dos columnas distintas.
    - La del avatar (77 × 72 px) contiene el círculo con la foto o con el SVG.
    - La del texto contiene `gridcell`, `cell-frame-title` y `cell-frame-secondary`.
    - Las acciones están fuera de las filas `list-item-*`.
  - **Corrección:** RF-02 difumina la columna del avatar (`AVATAR_NUEVO_CHAT`) de cada fila de persona de `[data-testid="new-chat-drawer"]`.
    - Se reconoce como el hijo directo de la celda con una imagen o un SVG, y sin texto de la fila ni controles.
    - Protege el SVG y su círculo, o la foto, como una sola unidad, y se revela con la fila.
    - Solo CSS, sin observadores nuevos e independiente de RF-01.
    - Las reglas anteriores de fotos no se aplican dentro de esa columna, para no difuminar dos veces.
    - No usa el `<title>` del SVG (no confirmado), ni clases, colores, tamaños o la profundidad interna.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/avatares-nuevo-chat.test.ts`, en Chromium, Firefox y WebKit, con la estructura observada:
  - 12 fotos y 6 avatares predeterminados de colores distintos.
  - Un solo filtro por avatar: la columna, sin filtro propio en la foto.
  - Fila «Tú» con foto o con avatar predeterminado.
  - Sin difuminado de acciones, encabezados, buscador, iconos ni botones.
  - RF-01 y RF-02 por separado y juntas, sin afectar a nombres ni descripciones.
  - Carga dinámica, búsqueda, desplazamiento y volver a abrir.
  - Revelado con cursor, foco y atajo; restauración al desactivar.
  - Sin cambios en la lista de chats.

  Con el código anterior fallan 6 de las 9 pruebas. Sin la exclusión del doble filtro, falla la del filtro único.
- `tests/apoyo/whatsapp-simulado.ts`: «Nuevo chat» con las dos columnas observadas, avatares con foto o predeterminados (`avatarObservado`) y la fila «Tú» (`message-yourself-row`).
- `npm run test:extension`: avatares de «Nuevo chat» difuminados (un filtro por columna) y el icono de «Nuevo grupo» sin difuminar.

#### Validación

- **RF-01, autores de grupo por su estructura (`0.1.2-beta.1`):** el propietario confirmó en Chrome que los nombres de los participantes no guardados quedan protegidos.

#### Añadido (diagnóstico)

- `scripts/diagnostico-paneles.js`: tablas nuevas para RF-02 en «Nuevo chat», que se muestran primero y usan como raíz la fila completa `[role="listitem"]`.
  - **Por qué:** la tabla general que revisó el propietario toma el elemento con rol más interno, la celda de texto, y por eso no encontraba el avatar.
  - **Tablas:**
    - A) Estructura de cada fila.
    - B) Candidatos a avatar: imágenes, SVG, fondo o `mask-image` de CSS (también en pseudoelementos), color de fondo, forma redonda y lo pintado en la zona del avatar (`elementsFromPoint`), con las reglas de RF-02 y el filtro.
    - C) Resumen por categoría de fila: acción, «Tú», contacto, posible no guardado y encabezado.
  - El sufijo de `list-item-…` deja de mostrarse.
  - **Probado en Chromium** con un «Nuevo chat» inventado, con foto, avatar con máscara CSS, avatar en `::before`, «Tú», acciones y encabezado:
    - No se filtró ningún dato: ni nombres, ni números, ni colores, ni el contenido de las URL `data:`.
    - Localizó cada avatar fuera de `cell-frame-container`.

### [0.1.2-beta.1] — 2026-10-26

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2001` en Chromium y Firefox (`version_name` `0.1.2-beta.1` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-01, autores de mensajes en grupos (participantes no guardados):** con `0.1.2-beta.0` quedaban visibles algunos nombres, en color, con «~», emojis, símbolos o texto con forma de etiqueta HTML.
  - **Causa confirmada** por el diagnóstico anonimizado real (`rf01Activa: true`, 7 remitentes marcados en 15 mensajes, 4 remitentes distintos):
    - El marcador solo difuminaba un nombre idéntico al remitente de `data-pre-plain-text`.
    - Algunos nombres visibles no coinciden con ese metadato, y algunos mensajes multimedia no tienen el bloque.
  - **Estructura confirmada:** el nombre está en `[data-testid="author"]` dentro de `msg-container`, como `span` o `span[role="button"]`, a veces anidados.
  - **Corrección:** RF-01 difumina con CSS el `[data-testid="author"]` más externo (`:not([data-testid="author"] *)`), sin comparar textos y sin observadores nuevos.
    - Se revela con el mensaje; fuera de los mensajes, con el propio nombre.
    - El marcador por texto se conserva para los nombres sin `author`. Sus marcas dentro de un `author` se excluyen para no aplicar dos filtros.
  - **Sin cambios en:** RF-04, RF-05 y los demás selectores.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/remitentes-autor.test.ts`, en Chromium, Firefox y WebKit, con los casos del diagnóstico real:
  - Remitente guardado y no guardados con un teléfono en el metadato.
  - «~», emojis, símbolos y texto con forma de etiqueta HTML.
  - Foto y vídeo sin bloque de texto.
  - Autores anidados en los dos órdenes, con un solo filtro por nombre, también cuando el marcador marca el interior.
  - Mensajes nuevos y cambio de grupo.
  - RF-01 y RF-04 por separado y juntas.
  - Sin difuminado de mensajes, multimedia, horas, botones ni indicadores.
  - Clics en el nombre con `role="button"`.
  - Revelado con cursor, foco y atajo, y restauración al desactivar.

  Con el código anterior fallan 6 de las 9 pruebas. Sin la exclusión del marcador, falla la del filtro único.
- `tests/difuminado/selectores-mensaje.test.ts`: `AUTOR_EXTERNO` reconoce las dos variantes y en los anidados solo el exterior.
- `tests/apoyo/whatsapp-simulado.ts`: opción `autor` con las estructuras observadas y el grupo `MENSAJES_AUTORES`.
- `npm run test:extension`: autor no guardado, con un nombre distinto del metadato, difuminado en la extensión compilada.

#### Investigación

- **Inicialización de los módulos:** en Chrome real, con `0.1.2-beta.0`, los cinco interruptores estaban activados, pero la página no tenía estilos ni marcas de Veilix.
  - **Comprobado en local:** el manifiesto compilado es correcto y la carga normal protege la página.
  - **Punto débil confirmado en el código:** si algo elimina un estilo de Veilix, el módulo no lo vuelve a insertar hasta desactivarlo y reactivarlo.
  - La causa real no está confirmada, y no hay cambios funcionales.
  - **Actualización:** en una pestaña nueva no aparece el contexto «Veilix», así que el script no se inyecta. El síntoma se reproduce en local con el acceso al sitio de Chrome en «Al hacer clic»: interruptores activos, sin contexto y sin estilos.
    - Una compilación de desarrollo (`chrome-mv3-dev`) cargada sin su servidor tampoco inyecta el script, porque su manifiesto no lo declara.
    - El ZIP `0.1.2-beta.0` de Chrome es correcto.
    - Falta confirmarlo con el diagnóstico de la instalación.
  - **Estado posterior:** el diagnóstico de remitentes muestra RF-01 cargada (`rf01Activa: true`), así que el script vuelve a ejecutarse. La causa exacta del episodio no se ha comunicado.

#### Añadido (diagnóstico)

- `scripts/diagnostico-extension.js`: diagnóstico anonimizado de la instalación, ejecutado desde una página de la propia extensión.
  - **Muestra:**
    - El manifiesto cargado: tipo de compilación, declaración, ruta y existencia del script de contenido.
    - El acceso efectivo a `web.whatsapp.com`.
    - El permiso de incógnito y las pestañas de WhatsApp Web visibles.
    - Las preferencias leídas.
  - Validado en local con la compilación normal, la de desarrollo sin servidor y el acceso al sitio restringido: da una lectura distinta en cada caso y no filtra el identificador ni rutas.
- README: aviso de que las pruebas reales deben cargar `.output/chrome-mv3` y no la compilación de desarrollo.
- `scripts/diagnostico-inicializacion.js`: diagnóstico anonimizado del arranque, en dos contextos de la consola.
  - **Página («top»):** estado del DOM y 20 s de observación de altas y bajas de los estilos de Veilix mientras se alterna un interruptor.
  - **Mundo aislado «Veilix»:** validez del contexto, versión inyectada y funcionalidades que lee como activas.
  - **No muestra** textos, nombres, mensajes, URL completas ni identificadores.
  - Validado en local con la extensión compilada en tres casos: sana, estilos eliminados y script no inyectado. Da una lectura distinta en cada uno y no filtra datos.
- `scripts/diagnostico-remitentes.js`: diagnóstico anonimizado de los nombres de remitentes.
  - **Muestra:**
    - Estructura, color propio, «~», forma de teléfono, emojis y símbolos.
    - Relación del nombre con el metadato de su mensaje y de la conversación, como categoría y sin mostrar ninguno.
    - Tipo de mensaje, y si está marcado y difuminado.
    - Un resumen por tipo de nombre.
  - **No muestra** textos, nombres, teléfonos, identificadores, colores ni direcciones.
  - Probado en Chromium con un DOM inventado lleno de datos ficticios: no se filtró ninguno, y clasificó correctamente los seis casos supuestos.
- `scripts/diagnostico-respuesta.js`: los caracteres invisibles de sus expresiones regulares se escriben ahora como secuencias `\uXXXX`, sin cambiar su comportamiento.

### [0.1.2-beta.0] — 2026-10-22

Compilación interna de prueba sobre `0.1.1`. Manifiesto: `0.1.2.2000` en Chromium y Firefox (`version_name` `0.1.2-beta.0` en Chromium), y `0.1.2` en Safari.

#### Corregido

- **RF-04, texto citado en el recuadro «Responder»:** con `0.1.1`, al pulsar «Responder» el texto del mensaje citado, encima del editor, quedaba visible con RF-04 activa.
  - **Causa confirmada:** el diagnóstico anonimizado en WhatsApp Web real (Chrome, respuesta a un mensaje de texto) mostró que el recuadro está en `#main footer` › `[data-testid="popup_panel"]` › `[data-testid="quoted-message"]`, fuera de las filas de mensaje. RF-04 solo actúa dentro de esas filas.
  - **Corrección:** una regla CSS en RF-04 para `#main footer [data-testid="quoted-message"] [data-testid="selectable-text"]`.
    - Excluye `[data-testid="author"]`, que corresponde a RF-01.
    - Se revela con el recuadro: cursor, foco y Ctrl + Mayús + Espacio.
    - No añade observadores ni marcas.
  - **Sin cambios en:**
    - RF-01: el autor ya se difuminaba como remitente.
    - RF-05: el editor ya estaba protegido.
    - Las citas dentro de los mensajes.
    - Los controles: la X sigue visible.
  - **Pendiente de evidencia:** las fotos y los vídeos citados y otras variantes de respuesta. No se han añadido selectores para multimedia.
  - Pendiente de validación real.

#### Añadido (pruebas)

- `tests/navegador/respuesta.test.ts`, en Chromium, Firefox y WebKit, con la estructura observada:
  - Texto citado difuminado solo con RF-04.
  - Independencia de RF-01 y RF-05, y las dos combinaciones.
  - Respuestas en grupo, en chat individual y a mensajes propios, y emojis.
  - Cambio de mensaje citado, y cancelación con la X, que sigue funcionando.
  - Revelado con cursor, foco y atajo.
  - Mensajes y citas de la conversación sin cambios.
  - Escritura con el recuadro abierto.
  - Restauración sin estilos ni marcas al desactivar.

  Sin la regla nueva fallan 9 de las 12 pruebas.
- `tests/difuminado/selectores-mensaje.test.ts`: los selectores nuevos alcanzan solo el texto del recuadro del pie, no el autor, la X, las citas dentro de los mensajes ni el editor.
- `npm run test:extension`: texto citado difuminado y X visible en la extensión compilada.

#### Añadido (diagnóstico)

- `scripts/diagnostico-respuesta.js`: diagnóstico anonimizado del recuadro «Responder».
  - **Muestra:**
    - Los elementos con texto o imagen fuera de las filas de mensaje, con su ascendencia.
    - Si coinciden con un remitente o con el inicio de un mensaje, sin mostrarlos.
    - Las marcas de Veilix y si están difuminados.
    - Los botones del pie.
    - El esqueleto del pie.
  - **No muestra:** textos, nombres, `data-id`, `title`, `aria-label`, `alt` ni direcciones.
  - No recorre el editor, y no nombra los dominios de imágenes ajenos a WhatsApp.
  - Probado en Chromium con un DOM inventado lleno de datos ficticios: no se filtró ninguno.

## [0.1.1] — 2026-10-21

**Versión estable preparada para la aprobación final del propietario.** No está publicada en ninguna tienda, no tiene etiqueta de Git y la Fase 2 sigue abierta.

> **Nota (28 de octubre de 2026):** el párrafo anterior describe el estado al preparar esta versión. `0.1.1` queda como antecedente histórico. No consta su aprobación ni su publicación, y su aprobación ya no es un requisito: la estable aprobada para el primer lanzamiento público es [0.1.2], y la Fase 2 se cerró oficialmente el 28 de octubre de 2026.

Manifiesto: `0.1.1` en Chrome, Edge, Firefox y Safari (sin `version_name`). Panel: «Veilix 0.1.1». Paquetes: `veilix-0.1.1-{chrome,edge,firefox,safari}.zip`.

### Incluye

Todo lo entregado de `0.1.1-beta.0` a `0.1.1-beta.5`, sin cambios de comportamiento respecto a `0.1.1-beta.5`:

- **RF-01, nombres:**
  - Remitentes dentro de las conversaciones de grupo: sobre los mensajes, en citas y respuestas, y en el aviso fijado (beta.0).
  - Filas de contacto con avatar SVG fuera de la lista (beta.0 y beta.1).
  - Nombres de «Nuevo chat» con la estructura confirmada (beta.2) y su información secundaria (beta.3).
- **RF-02, avatares:** los avatares SVG predeterminados se difuminan en cualquier zona y se revelan con su fila (beta.0).
- **RF-03, RF-04 y RF-05:** sin cambios desde `0.1.0`.
- **Diagnósticos anonimizados:**
  - `diagnostico-paneles.js`, nuevo.
  - `diagnostico-mensajes.js` muestra las reglas cargadas y la tabla de remitentes.
  - Todos anonimizan `data-testid`.
- **Identidad visual:**
  - Logotipo e iconos con un candado cerrado sobre el verde `#00A884` (beta.4).
  - Crédito «Hecho con ❤️ por Felipe Moreno Marciales» con la bandera de Colombia en SVG local (beta.4 y beta.5).
- **Sin cambios en:**
  - Las cuatro funcionalidades pendientes, que siguen sin interruptor.
  - Los permisos (solo `storage`) y el almacenamiento, que solo guarda las preferencias en `local:preferencias`, con el mismo esquema.
  - `version-renumeraciones.json`.

### Cambiado (versionado)

- Se pasa de `0.1.1-beta.5` a `0.1.1` con `npm run version:estable`.
- Las compilaciones internas `0.1.1.2000` a `0.1.1.2005` quedan numéricamente por encima de `0.1.1`. Es la consecuencia aceptada en la renumeración de `0.1.0`: no afecta a las tiendas, porque las betas nunca se suben.
- Cualquier corrección posterior empieza en `0.1.2-beta.0` (`npm run version:beta`) y no reutiliza `0.1.1`.

### Validación

- **Automatizada:** todas las verificaciones de `AGENTS.md` son correctas; los resultados están en el README.
- **Real en Google Chrome**, comunicada por el propietario (sistema operativo sin indicar):
  - `0.1.1-beta.0`: correcta, salvo los nombres de «Nuevo chat».
  - `0.1.1-beta.2`: nombres de «Nuevo chat» correctos, pero con una regresión comunicada en los remitentes de grupo.
  - **`0.1.1-beta.3`: información secundaria de «Nuevo chat» correcta, remitentes en grupos correctos y sin regresiones detectadas.** La regresión de beta.2 no volvió a manifestarse.
- **Sin resultado real comunicado** de `0.1.1-beta.4`, `0.1.1-beta.5` ni `0.1.1`. Solo cambian la identidad visual (candado, crédito y bandera) y el número de versión; el código de RF-01 a RF-05 es el mismo que el de beta.3.

### Pendiente

- **Causa de la regresión de beta.2 sin identificar:** no se reprodujo en el DOM simulado y no se repitió en la validación real de beta.3. No se cambió ningún código para corregirla. Si vuelve a aparecer, el diagnóstico es `scripts/diagnostico-mensajes.js`.
- Prueba de humo de `0.1.1` en Chrome: candado, crédito, bandera y «Veilix 0.1.1» en el panel.
- Pruebas reales en Edge, Firefox, Brave, Opera, Vivaldi y Safari.
- Indicador de reloj (pendiente) sin validar.
- Alertas de `npm audit` en dependencias de desarrollo (`web-ext → node-forge`).

## Compilaciones internas de 0.1.1

Compilaciones internas de prueba de `0.1.1-beta.0` a `0.1.1-beta.5`, conservadas tal como se registraron. Ninguna se publicó. Su contenido está consolidado en [0.1.1]. Van con un nivel de encabezado menos porque su manifiesto (`0.1.1.2000` a `0.1.1.2005`) es mayor que el de la estable `0.1.1`: la lista de versiones `## [...]` solo recoge las estables, en orden creciente de manifiesto.

### [0.1.1-beta.5] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2005` en Chromium y Firefox (`version_name` `0.1.1-beta.5` en Chromium), y `0.1.1` en Safari. Solo cambia el crédito del pie del panel: no hay cambios en el candado, RF-01 a RF-05, las preferencias, los permisos ni el almacenamiento.

#### Cambiado

- **Bandera del crédito:** el emoji 🇨🇴, que Windows muestra como las letras «CO», se sustituye por una bandera de Colombia en SVG local.
  - El componente es `BanderaColombia`.
  - Proporción 3:2: amarillo `#FCD116` en el 50 % superior, azul `#003893` en el 25 % central y rojo `#CE1126` en el 25 % inferior.
  - Sin sombras, degradados ni animaciones.
  - Se dibuja a 12 × 8 px, con las franjas en píxeles enteros (`crispEdges`), alineada con la altura de las mayúsculas y separada del nombre por 0,35 em.
  - Es una imagen accesible con la etiqueta «Bandera de Colombia».
  - El emoji ya no está en la página, así que nunca se ven los dos a la vez.
- El crédito pasa a un componente propio, `CreditoDesarrollador`. El texto «Hecho con ❤️ por Felipe Moreno Marciales» no cambia.

#### Añadido (pruebas)

- `tests/bandera-colombia.test.tsx`: etiqueta accesible, proporción 3:2, colores y altura de cada franja, y ausencia de elementos decorativos.
- `tests/navegador/credito.test.ts`, con el CSS real en Chromium, Firefox y WebKit:
  - Tamaño de 12 × 8 px y separación del nombre.
  - Alineación vertical con el texto, en una sola línea.
  - Sin desbordamiento a la anchura del emergente.
  - Mismos colores en los temas claro y oscuro.
- `tests/panel-configuracion.test.tsx` comprueba el texto exacto, la bandera como último elemento del crédito y que el emoji 🇨🇴 no está en la página.
- `npm run test:extension` comprueba la bandera (etiqueta, tamaño y colores) en el emergente y en las opciones, en los dos temas.
- `vitest.config.ts`: React se preoptimiza en las pruebas de navegador, para que Vite no recargue la prueba del crédito la primera vez que se ejecuta.

### [0.1.1-beta.4] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2004` en Chromium y Firefox (`version_name` `0.1.1-beta.4` en Chromium), y `0.1.1` en Safari. Solo cambia la identidad visual: no hay cambios en RF-01 a RF-05, el motor de difuminado, los observadores, el revelado, los permisos ni las preferencias.

#### Cambiado

- **Logotipo e iconos:** el ojo se sustituye por un **candado cerrado** blanco sobre el mismo cuadrado redondeado verde (`#00A884`).
  - Lo cambian juntos el logotipo del panel (`Logotipo.tsx`) y el dibujo original del generador (`scripts/generar-iconos.mjs`), con la misma geometría en una cuadrícula de 32 × 32.
  - Los bordes rectos caen en píxeles enteros a 16 × 16, para que se vea nítido en la barra de herramientas.
  - `public/icon/{16,32,48,96,128}.png` se regeneran con el generador, que ahora acepta una carpeta de salida opcional y no escribe nada al importarse.
  - El cambio llega a los cuatro paquetes (Chrome, Edge, Firefox y Safari), al administrador de extensiones, al emergente y a la página de opciones.

#### Añadido

- **Crédito del desarrollador** en el pie del panel, justo después de la versión: «Hecho con ❤️ por Felipe Moreno Marciales 🇨🇴».
  - Es fijo, no depende de ninguna funcionalidad y no lleva enlaces.
  - Usa el color secundario del tema y las fuentes de emoji de cada sistema.
- Pruebas:
  - `tests/iconos.test.ts` comprueba que `public/icon` coincide byte a byte con lo que genera el script, que cada tamaño dibuja el candado y que el logotipo del panel tiene la misma geometría.
  - `tests/panel-configuracion.test.tsx` comprueba el texto exacto del crédito y su posición en el emergente y en la página de opciones, que se conservan los textos del pie y que no depende de las funcionalidades.
  - `npm run test:extension` comprueba los iconos del paquete compilado y, en temas claro y oscuro, el crédito sin enlaces ni desplazamiento horizontal. También guarda capturas de la página de opciones.

### [0.1.1-beta.3] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2003` en Chromium y Firefox (`version_name` `0.1.1-beta.3` en Chromium), y `0.1.1` en Safari.

#### Cambiado

- **RF-01, información secundaria en «Nuevo chat»** (ampliación aprobada por el propietario):
  - Además del nombre, se difuminan los textos de cada contacto debajo del nombre, como la descripción o la frase de estado. Se marcan con `data-veilix-info-nuevo-chat`.
  - **Criterio, sin suponer atributos:** cualquier elemento con texto visible propio (o emojis en `<img alt>`) dentro de `[data-testid="cell-frame-container"]` (estructura confirmada) que no sea el nombre.
  - **Exclusiones:**
    - SVG, iconos, campos de entrada y botones de la celda.
    - Las acciones `new-chat-drawer-new-*`.
    - Las filas sin nombre `span[dir][title]`, como los encabezados de sección.
  - El nombre y la información se revelan juntos con la fila (cursor, foco y atajo) y se restauran al desactivar RF-01.

#### En investigación

- **Regresión comunicada en RF-01 (remitentes en grupos) con `0.1.1-beta.2`.** No hay corrección en esta entrega, porque la causa no se ha podido identificar con evidencia.
  - **Revisión del código:**
    - El marcador de remitentes no ha cambiado desde `0.1.1-beta.0`, la versión validada como correcta.
    - Los marcadores añadidos después (filas de contacto y «Nuevo chat») usan atributos propios, excluyen `#main` y no tocan `data-veilix-remitente`.
    - Las reglas CSS nuevas son válidas y van dentro de `:is()`, así que no pueden invalidar las anteriores.
  - **Pruebas en el DOM simulado:** la lógica de beta.0 reconstruida y la de beta.2 dan el mismo resultado, y los escenarios de interacción entre marcadores pasan. **No se reproduce.**
  - Hace falta el diagnóstico de mensajes en el grupo afectado (ver el README).

#### Añadido (diagnóstico y pruebas)

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

### [0.1.1-beta.2] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2002` en Chromium y Firefox (`version_name` `0.1.1-beta.2` en Chromium), y `0.1.1` en Safari.

#### Corregido

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

#### Seguridad de los diagnósticos

- Los diagnósticos de paneles, mensajes y lista de chats **anonimizan los valores de `data-testid`**: los números pasan a «#» y no se muestra nada tras «@». Un sufijo como `list-item-…` podría contener un identificador.

#### Añadido

- El diagnóstico de paneles añade una tabla de «Nuevo chat»: número de `span[dir][title]` por fila (solo longitudes), cuál marcó Veilix, si está difuminado y si la fila es una acción.
- Pruebas de regresión con la estructura observada (18 contactos sin avatar SVG, acciones como filas `list-item-*`, carga dinámica, búsqueda, desplazamiento, volver a abrir, revelado, desactivación e independencia de RF-02), en jsdom y en Chromium, Firefox y WebKit.

### [0.1.1-beta.1] — 2026-10-20

Compilación interna de prueba. Manifiesto: `0.1.1.2001` en Chromium y Firefox (`version_name` `0.1.1-beta.1` en Chromium), y `0.1.1` en Safari.

#### Corregido

- **RF-01, nombres en «Nuevo chat»:** en Chrome real con `0.1.1-beta.0`, los nombres de contactos seguían visibles. El resto de lo validado (remitentes de grupo, fotos y avatares de «Nuevo chat», mensajes nuevos, revelado y desactivación) era correcto.
  - **Defecto confirmado en el código:** el marcador de filas de contacto (`marcador-nombres.ts`) examinaba los descendientes de cada nodo añadido al DOM, pero **no el propio nodo**. Si WhatsApp añade cada fila como un nodo independiente después de abrir el panel (lista virtualizada o contactos cargados más tarde), la fila nunca se procesaba y su nombre quedaba visible. El DOM simulado lo ocultaba porque cada fila contenía otro `[role="button"]`.
  - **Corrección:** el propio nodo añadido también se evalúa como fila candidata.
  - Los avatares de RF-02 se difuminaban igualmente porque su regla CSS no depende de las filas. Lo único que mejora en RF-02 es el revelado del avatar junto con la fila, en esas filas.
  - **Pendiente de confirmar** en WhatsApp Web real que esta era la causa. El diagnóstico de paneles amplía su información para descartar otras.

#### Añadido

- `scripts/diagnostico-paneles.js` analiza cada avatar fuera de la lista de chats y de la conversación. Indica el motivo por el que su fila se reconoce o no como fila de contacto (rol, número de avatares, `span[title]`, iconos), si está marcada y si el nombre está difuminado.
- Pruebas de regresión en jsdom y en Chromium, Firefox y WebKit: filas sin botón interior añadidas como nodos independientes, búsqueda, desplazamiento y revelado.

### [0.1.1-beta.0] — 2026-10-20

Compilación interna de prueba: no se sube a ninguna tienda. Manifiesto: `0.1.1.2000` en Chromium y Firefox (`version_name` `0.1.1-beta.0` en Chromium), y `0.1.1` en Safari.

#### Corregido

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

#### Añadido

- Diagnóstico anonimizado de paneles con contactos (`scripts/diagnostico-paneles.js`).
- El diagnóstico de mensajes marca `MARCADO-REMITENTE` y la regla `RF-01-REMITENTE`.
- Pruebas de remitentes (con RF-04 desactivada, citas, contactos no guardados, emojis, aviso fijado, mensajes nuevos, cambio de conversación, revelado y desactivación) y de «Nuevo chat» (nombres, fotos y avatares predeterminados, acciones y buscador visibles, abrir y cerrar, búsqueda, desplazamiento, carga de fotos, revelado e independencia de RF-01 y RF-02), en jsdom y en Chromium, Firefox y WebKit.

#### Notas

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

  El detalle está en la sección [Cierre de la Fase 2](docs/desarrollo.md#cierre-de-la-fase-2) del README.

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
[0.1.3]: #013--2026-10-30
[0.1.2]: #012--2026-10-28
[0.1.2-beta.5]: #012-beta5--2026-10-27
[0.1.2-beta.4]: #012-beta4--2026-10-26
[0.1.2-beta.3]: #012-beta3--2026-10-26
[0.1.2-beta.2]: #012-beta2--2026-10-26
[0.1.2-beta.1]: #012-beta1--2026-10-26
[0.1.2-beta.0]: #012-beta0--2026-10-22
[0.1.1]: #011--2026-10-21
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

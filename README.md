<p align="center">
  <img src="public/icon/128.png" width="96" height="96" alt="Logotipo de Veilix: un candado blanco sobre fondo verde">
</p>

<h1 align="center">Veilix</h1>

<p align="center"><strong>Privacidad para WhatsApp Web.</strong><br>Funciona de forma local y no envía datos a servidores externos.</p>

<p align="center">Versión estable <strong>0.1.4</strong> · Software propietario</p>

---

## ¿Qué es Veilix?

Veilix es una extensión de navegador que **difumina en pantalla** la información sensible de WhatsApp Web: nombres, fotos, vistas previas, mensajes y lo que escribes. Así puedes usar WhatsApp Web en la oficina, en una presentación o en un lugar público sin que otras personas lean tus conversaciones de un vistazo.

La protección es solo visual: Veilix no modifica, borra ni envía tus mensajes, y se puede activar o desactivar en cualquier momento sin recargar la página.

> Veilix es un proyecto independiente y no está afiliado a WhatsApp ni a Meta.

## Funcionalidades

Cada protección tiene su propio interruptor en el panel de Veilix, y puedes combinarlas como quieras.

| Interruptor | Qué difumina |
| --- | --- |
| **Nombres de contactos** | Los nombres de contactos y grupos en la lista de chats, el encabezado, los mensajes de grupo (con las etiquetas de miembro), las sugerencias al mencionar con @, «Nuevo chat» y las llamadas, y el nombre, el usuario, el teléfono y la descripción de «Info. del contacto» |
| **Fotografías de contactos** | Las fotos de perfil y los avatares de contactos y grupos, también durante las llamadas |
| **Mensajes recientes** | La vista previa del último mensaje de cada chat en la lista |
| **Mensajes de conversaciones** | El texto, las fotos, los vídeos, los documentos, la hora y las reacciones de los mensajes, las citas, el texto y los stickers de «Info. del mensaje», y el estado y la duración de las llamadas |
| **Campo de entrada** | Lo que escribes, sin impedirte escribir, corregir ni enviar |

**Para ver algo un momento**, pasa el cursor por encima o mantén pulsado **Ctrl + Mayús + Espacio**. Al apartar el cursor o soltar las teclas, todo vuelve a difuminarse.

El panel muestra también cuatro funciones en preparación, marcadas como «Pendiente» y sin interruptor.

## 📥 Descargar Veilix

**Última versión estable: `0.1.4`**

> ⏳ **Publicación pendiente.** Todavía no hay ninguna descarga publicada. La primera publicación incluirá **Chrome** (que sirve también para Brave, Opera y Vivaldi) y **Edge**. Los enlaces aparecerán aquí cuando estén disponibles.

| Navegador | Descarga | Estado |
| --- | --- | --- |
| 🌐 Google Chrome | Publicación pendiente | ✅ En la primera publicación |
| 🌐 Brave, Opera y Vivaldi | Publicación pendiente | ✅ En la primera publicación (paquete de Chrome) |
| 🌊 Microsoft Edge | Publicación pendiente | ✅ En la primera publicación |
| 🦊 Mozilla Firefox | — | ⏸️ Pendiente de la firma de Mozilla |
| 🧭 Apple Safari (macOS) | — | ⛔ No disponible por ahora |

**Requisitos:**
- Chrome o Edge 116 o posterior.
- WhatsApp Web abierto en una pestaña de `https://web.whatsapp.com`.

## Instalación

### Google Chrome (y Brave, Opera y Vivaldi)

1. Descarga `veilix-0.1.4-chrome.zip` y descomprímelo en una carpeta que vayas a conservar.
2. Abre `chrome://extensions` (o `brave://extensions`, `opera://extensions` o `vivaldi://extensions`).
3. Activa el **«Modo de desarrollador»**.
4. Pulsa **«Cargar descomprimida»** y elige la carpeta que contiene `manifest.json`.
5. Abre WhatsApp Web y activa las protecciones desde el icono de Veilix.

### Microsoft Edge

1. Descarga `veilix-0.1.4-edge.zip` y descomprímelo en una carpeta que vayas a conservar.
2. Abre `edge://extensions` y activa el **«Modo de desarrollador»**.
3. Pulsa **«Cargar desempaquetada»** y elige la carpeta que contiene `manifest.json`.

Es una instalación manual. El navegador puede avisar de que la extensión está en modo de desarrollador, y algunas políticas de empresa la impiden. Para actualizar, sustituye el contenido de la carpeta y pulsa «Actualizar» en la página de extensiones.

### Firefox y Safari

- **Firefox:** todavía no hay una versión instalable. Firefox solo instala de forma permanente extensiones firmadas por Mozilla, y Veilix aún no lo está.
- **Safari:** todavía no hay instalador ni publicación en la App Store.

## Privacidad

- **Todo ocurre en tu navegador.** Veilix no tiene servidores, no envía datos a ningún sitio y no contiene telemetría ni analítica.
- **Permisos mínimos.** Solo pide guardar sus preferencias (`storage`) y solo actúa en `web.whatsapp.com`.
- **No guarda tus conversaciones.** Lee la página únicamente para decidir qué difuminar, en tu propio equipo. Lo único que almacena son tus preferencias.
- **Protección visual.** Difumina lo que se ve en pantalla. No cifra nada ni cambia lo que WhatsApp guarda o envía.

## Limitaciones

- **Validación:** Veilix se ha probado en Google Chrome. Los demás navegadores no se han probado todavía con WhatsApp Web real.
- **Partes de WhatsApp Web aún no cubiertas:** algunas, como las fotos y los vídeos de «Info. del mensaje» o las notas guardadas de un contacto, pueden quedar visibles.
- **Cambios de WhatsApp:** si WhatsApp cambia su diseño, alguna protección puede dejar de funcionar hasta que se actualice Veilix.

La lista completa está en el [historial de versiones](CHANGELOG.md#014--2026-11-10).

## Documentación

- [Historial de versiones](CHANGELOG.md).
- [Documentación técnica](docs/desarrollo.md): estado, compatibilidad, arquitectura, pruebas y versionado. Es para colaboradores.
- [Reglas del proyecto](AGENTS.md).

## Licencia y créditos

© 2026 Felipe Moreno Marciales. Todos los derechos reservados.

Veilix es software propietario de código cerrado (`UNLICENSED`). No se permite copiar, modificar ni redistribuir su código sin autorización expresa del autor.

Hecho con ❤️ por **Felipe Moreno Marciales** 🇨🇴

/* global document, getComputedStyle, console, URL, Node, window -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de los mensajes con archivos o documentos adjuntos
 * de la conversación abierta (RF-04).
 *
 * No supone cómo se dibuja la tarjeta de un archivo. Entre los mensajes de
 * `#main` visibles en pantalla, elige los que tienen indicios de adjunto:
 * - un texto con forma de tamaño («12 kB», «1,2 MB»), de número de páginas o
 *   de nombre de archivo (termina en una extensión);
 * - un icono cuyo nombre (`<title>` `wds-ic-…` o `data-icon`) menciona
 *   documento, archivo o descarga;
 * - un `data-testid` que menciona documento o archivo.
 *
 * De cada uno muestra el esqueleto anonimizado del mensaje, con las reglas
 * de RF-04 que alcanzan a cada elemento y dónde está el filtro, y una tabla
 * con los textos y las imágenes de la tarjeta (tamaño en pantalla, clase de
 * texto, tipo de origen, si están dentro de un botón y si están difuminados).
 *
 * Uso: con RF-04 activada, abre una conversación con uno o varios archivos
 * adjuntos (un PDF, un documento, una imagen enviada como documento…) y
 * déjalos a la vista. Aleja el cursor de la conversación (déjalo sobre la
 * lista de chats), no pulses ninguna tecla, abre las herramientas de
 * desarrollo (F12) → Consola, pega este archivo completo y pulsa Intro.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No modifica la página, no
 *   descarga archivos ni hace peticiones.
 * - No muestra textos, nombres de archivo, nombres de personas, teléfonos,
 *   fechas, horas, `data-id`, `title`, `aria-label`, `alt` ni direcciones. De
 *   cada texto solo indica su longitud y su clase (tamaño, páginas, nombre de
 *   archivo, hora). De un nombre de archivo solo muestra la extensión, y solo
 *   si es una extensión común (PDF, DOCX, JPG…).
 * - De las imágenes, solo el tipo de origen. Los `data-testid` se anonimizan.
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  /**
   * `data-testid` anonimizado: números como «#», nada tras «@» ni tras `list-item-`, y «…» en lugar de
   * cualquier fragmento con mayúsculas o de más de 24 caracteres (los nombres de la interfaz van en
   * minúsculas, como `msg-container`).
   */
  const limpiarTestId = (valor) =>
    valor
      .replace(/^(list-item-).+$/, '$1…')
      .replace(/@.*$/, '@…')
      .replace(/[^-_.:@…]*[A-Z][^-_.:@…]*|[^-_.:@…]{25,}/g, '…')
      .replace(/\d+/g, '#');
  const MAXIMO_MENSAJES = 6;
  const MAXIMO_NODOS = 120;
  // Mismos selectores que `selectores.ts` (RF-04).
  const CONTENEDOR_MENSAJE = ':is([data-testid="msg-container"], .message-in, .message-out)';
  const CAPA_MINIATURA_VIDEO = '[data-testid="video-content"] [style*="data:image/jpeg"]';
  const MULTIMEDIA = `:is(img[src^="blob:"], img[src^="data:image/jpeg"], video, canvas, [style*="blob:"]):not([data-icon] *):not(:where(${CAPA_MINIATURA_VIDEO}) *)`;
  const TEXTO = ':is([data-pre-plain-text], .selectable-text:not([data-pre-plain-text] *)):not([data-icon], [data-icon] *)';
const CAMPO_DOCUMENTO = '[data-testid="document-thumb"] :is(span[dir="auto"], [data-testid="type"], span[title])';
  const DATOS_DOCUMENTO = `[data-testid="msg-container"] ${CAMPO_DOCUMENTO}:not(${CAMPO_DOCUMENTO} *):not(:where(${TEXTO}, ${TEXTO} *)):not(:has(svg, img, canvas, video, [data-icon])):not(:where([data-testid="document-thumb"] :is(button, [role="button"]), [data-testid="document-thumb"] :is(button, [role="button"]) *))`;
  const ICONO_DOCUMENTO = '[data-icon^="document-"][data-icon$="-icon"]';
  const ETIQUETA_ICONO_DOCUMENTO = `[data-testid="msg-container"] [data-testid="document-thumb"] :has(> ${ICONO_DOCUMENTO}) > div:not(${ICONO_DOCUMENTO}):not(:has(svg, img, canvas, video, [data-icon], button, [role="button"], span[dir="auto"], [data-testid="type"], span[title]))`;
  const REGLAS_RF04 = [
    ['texto', `#main ${CONTENEDOR_MENSAJE} ${TEXTO}`],
    ['multimedia', `#main ${CONTENEDOR_MENSAJE} ${MULTIMEDIA}`],
    ['miniatura de vídeo', `[data-testid="msg-container"] ${CAPA_MINIATURA_VIDEO}:not(${CAPA_MINIATURA_VIDEO} *)`],
    ['documento (0.1.2-beta.8)', DATOS_DOCUMENTO],
    ['etiqueta del icono (0.1.2-beta.9)', ETIQUETA_ICONO_DOCUMENTO],
    ['hora (marca)', '[data-veilix-hora-mensaje]'],
    ['reacción (marca)', '[data-veilix-reaccion]'],
    ['estado (marca)', '[data-veilix-estado-mensaje]'],
  ];
  const EXTENSIONES = new Set(
    'pdf doc docx odt rtf txt xls xlsx ods csv ppt pptx odp key pages numbers zip rar 7z tar gz apk exe dmg msi jpg jpeg png gif webp heic bmp svg tif tiff mp3 m4a ogg opus wav aac mp4 mov avi mkv webm 3gp vcf json xml html epub'.split(' '),
  );
  const ICONO_ADJUNTO = /document|doc-|file|archivo|download|descarga|pdf|attach/i;

  const principal = document.querySelector('#main');
  if (!principal) {
    console.log('Veilix · no hay ninguna conversación abierta (#main). Ábrela y vuelve a ejecutar el fragmento.');
    return;
  }

  const normalizar = (texto) => texto.replace(/[‎‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
  const textoPropio = (elemento) =>
    normalizar(
      [...elemento.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join(''),
    );
  /** Clase del texto, sin mostrarlo. */
  const claseTexto = (texto) => {
    const clases = [];
    if (/^\d+([.,]\d+)?\s?(B|bytes?|kB|KB|KiB|MB|MiB|GB|GiB)$/i.test(texto)) clases.push('TAMAÑO');
    if (/^\d+\s?(p[aá]ginas?|pages?|p[aá]g\.?)$/i.test(texto)) clases.push('PÁGINAS');
    if (/^\d{1,2}[:.]\d{2}(\s?[ap]\.?\s?m\.?)?$/i.test(texto)) clases.push('PARECE-HORA');
    const extension = /\.([a-z0-9]{1,5})$/i.exec(texto)?.[1]?.toLowerCase();
    if (extension && texto.length > extension.length + 1) clases.push(EXTENSIONES.has(extension) ? `NOMBRE-DE-ARCHIVO(.${extension})` : 'NOMBRE-DE-ARCHIVO(otra extensión)');
    else if (extension === undefined && EXTENSIONES.has(texto.toLowerCase())) clases.push(`EXTENSIÓN(${texto.toUpperCase()})`);
    if (/^[•·|,–-]$/.test(texto)) clases.push(`SEPARADOR(${texto})`);
    return clases;
  };

  const tipoOrigen = (url) => {
    if (!url) return 'sin origen';
    if (url.startsWith('blob:')) return 'blob';
    if (url.startsWith('data:')) {
      const fin = [url.indexOf(';'), url.indexOf(',')].filter((n) => n > 0);
      return url.slice(0, fin.length ? Math.min(...fin) : 15);
    }
    try {
      return /(^|\.)(whatsapp\.(net|com)|fbcdn\.net)$/.test(new URL(url, document.baseURI).hostname) ? 'recurso de WhatsApp' : 'otro dominio';
    } catch {
      return 'no válida';
    }
  };
  const tipoImagenCss = (valor) => {
    if (!valor || valor === 'none' || valor === 'normal' || valor === '""') return null;
    if (/gradient\(/.test(valor) && !/url\(/.test(valor)) return 'degradado';
    const url = /url\(["']?([^"')]+)/.exec(valor)?.[1];
    return url ? tipoOrigen(url) : null;
  };
  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    if (!titulo) return 'ninguno';
    const texto = titulo.textContent.trim();
    return /^wds-ic-[a-z0-9-]+$/.test(texto) ? texto : `otro título (${texto.length})`;
  };
  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');

  const reglasQueAlcanzan = (elemento) =>
    REGLAS_RF04.filter(([, selector]) => {
      try {
        return elemento.closest(selector) !== null;
      } catch {
        return false;
      }
    })
      .map(([nombre]) => nombre)
      .join('+') || 'NINGUNA';
  const difuminado = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return true;
    }
    return false;
  };
  const filtroEn = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      const filtro = getComputedStyle(actual).filter;
      if (filtro !== 'none') return `${actual === elemento ? 'propio' : 'antecesor'} ${filtro}`;
    }
    return 'NO difuminado';
  };

  const describir = (elemento) => {
    const partes = [elemento.localName + clasesSemanticas(elemento)];
    for (const atributo of ['role', 'data-testid', 'data-icon', 'tabindex', 'dir', 'download']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}${atributo === 'download' ? '' : `=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}`}]`);
    }
    for (const atributo of ['data-id', 'data-pre-plain-text', 'aria-label', 'title', 'alt', 'href']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    for (const atributo of elemento.getAttributeNames()) {
      if (atributo.startsWith('data-veilix-')) partes.push(`[${atributo}]`);
    }
    if (elemento.localName === 'img') partes.push(`origen=${tipoOrigen(elemento.getAttribute('src'))}`);
    if (elemento.localName === 'svg') partes.push(`título=${tituloIcono(elemento)}`);
    const fondo = tipoImagenCss(getComputedStyle(elemento).backgroundImage);
    if (fondo) partes.push(`fondo=${fondo}`);
    const texto = textoPropio(elemento);
    if (texto) partes.push(`texto(${texto.length})${claseTexto(texto).map((c) => ` ${c}`).join('')}`);
    return partes.join('');
  };

  const nombreIcono = (e) => (e.localName === 'svg' ? tituloIcono(e) : (e.getAttribute('data-icon') ?? ''));
  const indicios = (mensaje) => {
    const lista = [];
    for (const e of mensaje.querySelectorAll('*')) {
      const texto = textoPropio(e);
      for (const clase of texto ? claseTexto(texto) : []) {
        if (!clase.startsWith('PARECE-HORA') && !clase.startsWith('SEPARADOR')) lista.push(clase.replace(/\(.*$/, ''));
      }
      if (ICONO_ADJUNTO.test(nombreIcono(e))) lista.push(`icono ${nombreIcono(e)}`);
      const testid = e.getAttribute('data-testid') ?? '';
      if (/document|file|doc-/i.test(testid)) lista.push(`data-testid ${limpiarTestId(testid)}`);
      if (e.hasAttribute('download')) lista.push('enlace con download');
    }
    return [...new Set(lista)];
  };

  const visible = (e) => {
    const caja = e.getBoundingClientRect();
    return caja.width > 0 && caja.height > 0 && caja.bottom > 0 && caja.top < window.innerHeight;
  };
  const mensajes = [...principal.querySelectorAll(CONTENEDOR_MENSAJE)]
    .filter((m) => !m.parentElement?.closest(CONTENEDOR_MENSAJE) && visible(m))
    .map((m) => ({ mensaje: m, indicios: indicios(m) }))
    .filter((m) => m.indicios.length > 0)
    .slice(-MAXIMO_MENSAJES);

  if (mensajes.length === 0) {
    console.log('Veilix · no se encontró ningún mensaje con indicios de archivo adjunto a la vista. Desplaza la conversación hasta verlos y vuelve a ejecutar el fragmento.');
    return;
  }

  const sentido = (m) => {
    const id = m.closest('[data-id]')?.getAttribute('data-id') ?? '';
    if (id.startsWith('true_')) return 'enviado';
    if (id.startsWith('false_')) return 'recibido';
    return 'desconocido';
  };

  const tablas = [];
  const esqueletos = [];
  mensajes.forEach(({ mensaje, indicios: lista }, indice) => {
    const n = indice + 1;
    // Elementos de la tarjeta que muestran algo: textos propios, imágenes, iconos y fondos.
    for (const e of mensaje.querySelectorAll('*')) {
      if (e.parentElement?.closest('svg')) continue;
      const texto = textoPropio(e);
      const imagen = e.localName === 'img' || e.localName === 'svg' || e.localName === 'canvas' || e.localName === 'video' || tipoImagenCss(getComputedStyle(e).backgroundImage);
      if (!texto && !imagen) continue;
      const caja = e.getBoundingClientRect();
      tablas.push({
        mensaje: n,
        elemento: describir(e),
        tamano: `${Math.round(caja.width)}×${Math.round(caja.height)}`,
        zona: e.closest('[data-testid="msg-meta"]') ? 'msg-meta' : 'contenido',
        enUnBoton: e.closest('button, [role="button"], a[href]') ? 'sí' : 'no',
        reglasRF04: reglasQueAlcanzan(e),
        difuminado: filtroEn(e),
      });
    }
    const lineas = [];
    const recorrer = (elemento, nivel) => {
      if (lineas.length >= MAXIMO_NODOS) return;
      const reglas = reglasQueAlcanzan(elemento);
      lineas.push(`${'  '.repeat(nivel)}${describir(elemento)}${reglas === 'NINGUNA' ? '' : ` REGLAS=${reglas}`} · ${difuminado(elemento) ? 'difuminado' : 'visible'}`);
      if (elemento.localName === 'svg') return;
      for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
    };
    recorrer(mensaje, 0);
    const ascendencia = [];
    for (let actual = mensaje.parentElement; actual && actual !== principal && ascendencia.length < 6; actual = actual.parentElement) ascendencia.push(describir(actual));
    esqueletos.push(`Mensaje ${n} (${sentido(mensaje)}; indicios: ${lista.join(', ')})\n  ascendencia: ${ascendencia.join(' < ')}\n${lineas.join('\n')}`);
  });

  const resumen = {
    rf04Activa: (document.querySelector('style[data-veilix-estilo="mensajes-conversacion"]')?.textContent ?? '') !== '',
    atajoPulsado: document.documentElement.hasAttribute('data-veilix-revelar-mensajes-conversacion'),
    cursorSobreLaConversacion: principal.matches(':hover'),
    mensajesConIndicios: mensajes.length,
    elementosVisibles: tablas.filter((f) => f.zona === 'contenido' && f.difuminado === 'NO difuminado').length,
  };

  console.log('Veilix · archivos adjuntos (RF-04): resumen.');
  console.table([resumen]);
  console.log('Veilix · textos, iconos e imágenes de cada mensaje con adjunto:');
  console.table(tablas);
  console.log('Veilix · resumen (JSON):\n' + JSON.stringify({ resumen, elementos: tablas }, null, 2) + '\n\nVeilix · estructura anonimizada:\n' + esqueletos.join('\n\n'));
})();

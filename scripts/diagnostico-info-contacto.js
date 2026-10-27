/* global document, getComputedStyle, console, URL, Node, window -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO del panel «Info. del contacto» de WhatsApp Web
 * (RF-01 y RF-02).
 *
 * No supone la estructura del panel. Lo localiza por su título («Info. del
 * contacto», «Contact info», «Info. de empresa»…), que es un texto genérico de
 * la interfaz, y toma como raíz el `[data-testid="drawer-right"]` que lo
 * contiene o, si no lo hay, su antecesor más pequeño que ocupa al menos la
 * mitad de la altura de la ventana fuera de la conversación y de la lista de
 * chats. De esa raíz muestra:
 * - el esqueleto anonimizado, con las marcas de Veilix y dónde está el filtro;
 * - una tabla de los textos: los genéricos de la interfaz («Número de
 *   teléfono», «Llamar», «Buscar»…) tal cual; del resto, solo la longitud y su
 *   forma (parece un teléfono, un nombre de usuario, un contador, una fecha;
 *   coincide con el nombre del chat abierto), si son interactivos o editables
 *   y si están difuminados;
 * - una tabla de las imágenes (tipo de origen, tamaño, reglas de RF-02 que las
 *   alcanzan y filtro);
 * - los campos editables (notas): su tipo, si su marcador de posición es
 *   genérico y la longitud de su contenido.
 *
 * Uso: con RF-01 y RF-02 activadas, abre una conversación, abre «Info. del
 * contacto» (pulsando el encabezado), aleja el cursor del panel (déjalo sobre la
 * lista de chats), no pulses ninguna tecla, abre las herramientas de
 * desarrollo (F12) → Consola, pega este archivo completo y pulsa Intro.
 * Repite con un contacto guardado, con un número no guardado y, si los tienes,
 * con un contacto con notas y con una empresa.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No modifica la página, no
 *   descarga archivos ni hace peticiones.
 * - No muestra nombres, teléfonos, nombres de usuario, descripciones, notas,
 *   fechas, `data-id`, `title`, `aria-label`, `alt` ni direcciones. Solo se
 *   muestran tal cual los textos genéricos de la interfaz de una lista cerrada.
 * - De las imágenes, solo el tipo de origen. Los `data-testid` se anonimizan.
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  /**
   * `data-testid` anonimizado: números como «#», nada tras «@» ni tras `list-item-`, y «…» en lugar de
   * cualquier fragmento con mayúsculas o de más de 24 caracteres.
   */
  const limpiarTestId = (valor) =>
    valor
      .replace(/^(list-item-).+$/, '$1…')
      .replace(/@.*$/, '@…')
      .replace(/[^-_.:@…]*[A-Z][^-_.:@…]*|[^-_.:@…]{25,}/g, '…')
      .replace(/\d+/g, '#');
  const MAXIMO_NODOS = 220;
  const TITULO = /^(info\.? del contacto|informaci[oó]n del contacto|info\.? de (la )?empresa|informaci[oó]n de (la )?empresa|contact info|business info)$/i;
  /** Textos genéricos de la interfaz que se muestran tal cual (español e inglés). Cualquier otro se anonimiza. */
  const GENERICOS = new Set(
    [
      'info. del contacto', 'información del contacto', 'info. de empresa', 'info. de la empresa', 'información de la empresa', 'contact info', 'business info',
      'número de teléfono', 'teléfono', 'info.', 'info', 'información', 'acerca de', 'llamar', 'llamada', 'video', 'vídeo', 'videollamada', 'buscar', 'audio', 'voz',
      'notas', 'nota', 'editar', 'cerrar', 'guardar', 'cancelar', 'añadir', 'ver todo', 'ver todos', 'archivos, enlaces y documentos', 'archivos', 'enlaces', 'documentos',
      'mensajes destacados', 'silenciar notificaciones', 'notificaciones', 'mensajes temporales', 'privacidad avanzada del chat', 'cifrado', 'bloquear', 'reportar',
      'eliminar chat', 'vaciar chat', 'desactivado', 'activado', 'grupos en común', 'añadir a favoritos', 'eliminar de favoritos', 'favoritos', 'añadir a la lista',
      'tú', 'horario', 'abierto', 'cerrado', 'sitio web', 'correo electrónico', 'dirección', 'categoría', 'catálogo', 'cuenta de empresa', 'empresa',
      'phone number', 'phone', 'about', 'call', 'search', 'notes', 'note', 'edit', 'close', 'save', 'cancel', 'add', 'see all', 'view all',
      'media, links and docs', 'media', 'links', 'docs', 'starred messages', 'mute notifications', 'disappearing messages', 'advanced chat privacy',
      'encryption', 'block', 'report', 'delete chat', 'clear chat', 'off', 'on', 'groups in common', 'add to favourites', 'add to favorites', 'favourites', 'favorites',
      'you', 'business hours', 'open', 'closed', 'website', 'email', 'address', 'category', 'catalog', 'catalogue', 'business account',
    ],
  );
  const MARCADOR_GENERICO = /^(añade notas|añadir notas|agrega notas|add notes|add a note)\b/i;

  const principal = document.querySelector('#main');
  const fueraDeLaConversacion = (e) => !e.closest('#main, #pane-side');

  const normalizar = (texto) => texto.replace(/[‎‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
  const textoPropio = (elemento) =>
    normalizar(
      [...elemento.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join(''),
    );
  // Nombre del chat abierto: solo para comparar; nunca se muestra.
  const nombreDelChat = normalizar(principal?.querySelector('header span[dir="auto"], header span[title]')?.textContent ?? '');
  const describirTexto = (texto) => {
    if (GENERICOS.has(texto.toLowerCase()) || TITULO.test(texto)) return `GENÉRICO=«${texto}»`;
    if (MARCADOR_GENERICO.test(texto) && texto.length <= 60) return 'MARCADOR-DE-POSICIÓN-GENÉRICO';
    const partes = [`texto(${texto.length})`];
    if (/^\+?[\d\s().-]{7,}$/.test(texto) && /\d{6,}/.test(texto.replace(/\D/g, ''))) partes.push('PARECE-TELÉFONO');
    if (/^[@~]/.test(texto)) partes.push(`EMPIEZA-POR-«${texto[0]}»`);
    if (/^\d{1,5}$/.test(texto)) partes.push('PARECE-CONTADOR');
    if (/\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}|\b(hoy|ayer|today|yesterday)\b/i.test(texto)) partes.push('PARECE-FECHA');
    if (nombreDelChat && texto === nombreDelChat) partes.push('COINCIDE-CON-EL-NOMBRE-DEL-CHAT');
    if (/\p{Extended_Pictographic}/u.test(texto)) partes.push('CON-EMOJI');
    return partes.join(' ');
  };

  const tipoOrigen = (url) => {
    if (!url) return 'sin origen';
    if (url.startsWith('blob:')) return 'blob';
    if (url.startsWith('data:')) {
      const fin = [url.indexOf(';'), url.indexOf(',')].filter((n) => n > 0);
      return url.slice(0, fin.length ? Math.min(...fin) : 15);
    }
    try {
      const host = new URL(url, document.baseURI).hostname;
      if (/(^|\.)pps\.whatsapp\.net$/.test(host)) return 'foto de perfil (pps.whatsapp.net)';
      return /(^|\.)(whatsapp\.(net|com)|fbcdn\.net)$/.test(host) ? 'recurso de WhatsApp' : 'otro dominio';
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
    if (/^wds-ic-[a-z0-9-]+$/.test(texto)) return texto;
    if (texto.length <= 40 && /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(texto)) return `${texto} (nombre de icono)`;
    return `otro título (${texto.length})`;
  };
  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');

  // Reglas de RF-02 que pueden alcanzar una imagen fuera de la conversación (mismos selectores que `selectores.ts`).
  const REGLAS_RF02 = [
    ['RF-02 foto de perfil', ':is(img[src*="pps.whatsapp.net"], [style*="pps.whatsapp.net"], img[src*="/t61.24694-24/"], [style*="/t61.24694-24/"])'],
    ['RF-02 foto de perfil SVG', 'svg:not([data-icon] svg):has(image[*|href*="pps.whatsapp.net"], image[*|href*="/t61.24694-24/"])'],
    ['RF-02 avatar SVG', 'svg:not([data-icon] svg):has(mask):has(image, foreignObject)'],
    ['RF-02 avatar predeterminado', '[data-icon^="default-user"], [data-icon^="default-group"], [data-icon^="default-contact"], [data-icon^="default-community"]'],
  ];
  const reglasRF02 = (elemento) =>
    REGLAS_RF02.filter(([, selector]) => {
      try {
        return elemento.closest(selector) !== null;
      } catch {
        return false;
      }
    })
      .map(([nombre]) => nombre)
      .join('+') || 'NINGUNA';
  const marcasVeilix = (elemento) => {
    const marcas = new Set();
    for (let actual = elemento; actual; actual = actual.parentElement) {
      for (const atributo of actual.getAttributeNames()) if (atributo.startsWith('data-veilix-')) marcas.add(atributo.replace('data-veilix-', ''));
    }
    return [...marcas].join(', ') || '—';
  };
  const difuminado = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return true;
    }
    return false;
  };
  const filtroEn = (elemento) => {
    for (let actual = elemento, niveles = 0; actual; actual = actual.parentElement, niveles++) {
      const filtro = getComputedStyle(actual).filter;
      if (filtro !== 'none') return niveles === 0 ? `propio ${filtro}` : `antecesor (${niveles} arriba) ${filtro}`;
    }
    return 'NO difuminado';
  };

  const describir = (elemento) => {
    const partes = [elemento.localName + clasesSemanticas(elemento)];
    for (const atributo of ['role', 'data-testid', 'data-icon', 'tabindex', 'dir', 'contenteditable', 'type', 'data-tab', 'data-animate-drawer']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['data-id', 'aria-label', 'title', 'alt', 'href', 'placeholder', 'aria-placeholder', 'value', 'style']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    for (const atributo of elemento.getAttributeNames()) {
      if (atributo.startsWith('data-veilix-')) partes.push(`[${atributo}]`);
    }
    if (elemento.localName === 'svg') partes.push(` título=${tituloIcono(elemento)}`);
    if (elemento.localName === 'img') partes.push(` origen=${tipoOrigen(elemento.currentSrc || elemento.getAttribute('src'))}`);
    const fondo = tipoImagenCss(getComputedStyle(elemento).backgroundImage);
    if (fondo) partes.push(` fondo=${fondo}`);
    const texto = textoPropio(elemento);
    if (texto) partes.push(` ${describirTexto(texto)}`);
    return partes.join('');
  };

  // 1) Raíz del panel.
  const titulos = [...document.querySelectorAll('body *')].filter((e) => fueraDeLaConversacion(e) && TITULO.test(textoPropio(e)));
  const alturaMinima = window.innerHeight * 0.5;
  const raizDesde = (titulo) => {
    const cajon = titulo.closest('[data-testid="drawer-right"]');
    if (cajon) return cajon;
    for (let actual = titulo.parentElement; actual && actual !== document.body; actual = actual.parentElement) {
      if (actual.closest('#main, #pane-side')) return null;
      if (actual.getBoundingClientRect().height >= alturaMinima) return actual;
    }
    return null;
  };
  const raiz = titulos.map(raizDesde).find(Boolean) ?? null;
  if (!raiz) {
    console.log('Veilix · no se encontró el panel «Info. del contacto». Ábrelo (pulsa el encabezado de la conversación) y vuelve a ejecutar el fragmento.');
    return;
  }

  const ascendencia = [];
  for (let actual = raiz.parentElement; actual && actual !== document.body && ascendencia.length < 10; actual = actual.parentElement) ascendencia.push(describir(actual));

  // 2) Textos, imágenes y campos editables del panel.
  const editable = (e) => e.closest('[contenteditable="true"], [contenteditable=""], textarea, input, [role="textbox"]') !== null;
  const interactivo = (e) => e.closest('button, [role="button"], a[href], [tabindex]:not([tabindex="-1"])') !== null;
  const textos = [];
  const imagenes = [];
  for (const e of raiz.querySelectorAll('*')) {
    if (e.parentElement?.closest('svg')) continue;
    const caja = e.getBoundingClientRect();
    const tamano = `${Math.round(caja.width)}×${Math.round(caja.height)}`;
    const texto = textoPropio(e);
    if (texto) {
      textos.push({
        elemento: describir(e),
        tamano,
        interactivo: interactivo(e) ? 'sí' : 'no',
        editable: editable(e) ? 'sí' : 'no',
        marcasVeilix: marcasVeilix(e),
        filtro: filtroEn(e),
      });
    }
    const esImagen = e.localName === 'img' || e.localName === 'canvas' || (e.localName === 'svg' && caja.width >= 24) || tipoImagenCss(getComputedStyle(e).backgroundImage);
    if (esImagen && caja.width >= 16) {
      imagenes.push({ elemento: describir(e), tamano, reglasRF02: reglasRF02(e), marcasVeilix: marcasVeilix(e), filtro: filtroEn(e) });
    }
  }
  const campos = [...raiz.querySelectorAll('[contenteditable="true"], [contenteditable=""], textarea, input, [role="textbox"]')].map((e) => {
    const marcador = e.getAttribute('placeholder') ?? e.getAttribute('aria-placeholder') ?? '';
    const contenido = normalizar('value' in e && typeof e.value === 'string' ? e.value : (e.textContent ?? ''));
    return {
      elemento: describir(e),
      marcadorDePosicion: marcador ? (MARCADOR_GENERICO.test(normalizar(marcador)) ? 'genérico («Añade notas…»)' : `otro (${normalizar(marcador).length})`) : 'ninguno',
      contenido: contenido ? (MARCADOR_GENERICO.test(contenido) ? 'MARCADOR-DE-POSICIÓN-GENÉRICO' : `${contenido.length} caracteres`) : 'vacío',
      filtro: filtroEn(e),
    };
  });

  const lineas = [];
  const recorrer = (elemento, nivel) => {
    if (lineas.length >= MAXIMO_NODOS) return;
    lineas.push(`${'  '.repeat(nivel)}${describir(elemento)} · ${difuminado(elemento) ? 'difuminado' : 'visible'}`);
    if (elemento.localName === 'svg') return;
    for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
  };
  recorrer(raiz, 0);

  const estilo = (sufijo) => (document.querySelector(`style[data-veilix-estilo="${sufijo}"]`)?.textContent ?? '') !== '';
  const resumen = {
    rf01Activa: estilo('nombres'),
    rf02Activa: estilo('fotos'),
    atajoPulsado: [...document.documentElement.getAttributeNames()].some((a) => a.startsWith('data-veilix-revelar-')),
    cursorSobreElPanel: raiz.matches(':hover'),
    raizDelPanel: describir(raiz),
    dentroDeMain: Boolean(raiz.closest('#main')),
    titulos: titulos.length,
    textos: textos.length,
    textosNoGenericosVisibles: textos.filter((t) => !/GENÉRICO=|MARCADOR-DE-POSICIÓN-GENÉRICO/.test(t.elemento) && t.filtro === 'NO difuminado').length,
    imagenes: imagenes.length,
    imagenesVisiblesSinContarIconos: imagenes.filter((i) => i.filtro === 'NO difuminado' && !/título=(wds-ic-|.*\(nombre de icono\))/.test(i.elemento)).length,
    camposEditables: campos.length,
  };

  console.log('Veilix · «Info. del contacto» (RF-01 y RF-02): resumen.');
  console.table([resumen]);
  console.log('Veilix · textos del panel (los genéricos de la interfaz, tal cual; el resto, anonimizado):');
  console.table(textos);
  console.log('Veilix · imágenes del panel:');
  console.table(imagenes);
  console.log('Veilix · campos editables (notas):');
  console.table(campos);
  console.log(
    'Veilix · resumen (JSON):\n' +
      JSON.stringify({ resumen, ascendencia, textos, imagenes, campos }, null, 2) +
      '\n\nVeilix · estructura anonimizada del panel:\n' +
      lineas.join('\n'),
  );
})();

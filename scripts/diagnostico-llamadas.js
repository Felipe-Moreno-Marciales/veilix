/* global document, getComputedStyle, console, URL, Node, window, location -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de las llamadas de WhatsApp Web (RF-01, RF-02 y
 * RF-04): el panel flotante de una llamada en curso y las tarjetas de llamada
 * dentro de la conversación.
 *
 * No supone la estructura. Primero describe el contexto en que se ejecuta:
 * si es la ventana principal, una ventana emergente o un marco, si Veilix está
 * cargado en este documento (sus `<style data-veilix-estilo>`) y qué marcos
 * (`iframe`) hay. Después busca, por indicios genéricos:
 * - textos de la interfaz de llamadas de una lista cerrada («Llamada de voz»,
 *   «Sin respuesta», «Llamando…», «Colgar»…), textos con forma de duración
 *   («2:15») e iconos cuyo nombre menciona llamada, teléfono, micrófono,
 *   cámara o colgar;
 * - `data-testid` que mencionan llamada (`call`, `voip`).
 * Con ellos localiza el panel flotante (fuera de `#main` y de la lista de
 * chats: el antecesor con posición fija, `role="dialog"` o `data-testid` de
 * llamada) y las tarjetas de llamada (mensajes de `#main` con esos indicios).
 * De cada uno muestra el esqueleto anonimizado, una tabla de textos, imágenes
 * y controles, las reglas de RF-01, RF-02 y RF-04 que los alcanzan, las
 * marcas de Veilix y dónde está el filtro.
 *
 * Uso:
 * 1. Con RF-01, RF-02 y RF-04 activadas, durante una llamada en curso con el
 *    panel flotante a la vista, abre las herramientas de desarrollo (F12) →
 *    Consola, pega este archivo completo y pulsa Intro. Deja el cursor fuera
 *    del panel y no pulses ninguna tecla.
 * 2. Si la llamada se abre en una ventana aparte, repite en la consola de esa
 *    ventana.
 * 3. Repite con una conversación que muestre tarjetas de llamada (perdida,
 *    sin respuesta, finalizada con duración) a la vista.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No modifica la página, no
 *   interactúa con la llamada, no descarga nada ni hace peticiones.
 * - No muestra nombres, teléfonos, mensajes, duraciones, horas, `data-id`,
 *   `title`, `aria-label`, `alt`, direcciones ni la ruta completa de la página.
 *   Solo muestran su texto los textos genéricos de la interfaz de llamadas de
 *   una lista cerrada. Del resto, la longitud y su forma (duración, hora,
 *   teléfono, coincide con el nombre del chat).
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
  const MAXIMO_NODOS = 160;
  const MAXIMO_TARJETAS = 6;
  const CONTENEDOR_MENSAJE = ':is([data-testid="msg-container"], .message-in, .message-out)';
  /** Textos genéricos de la interfaz de llamadas (español e inglés). Cualquier otro texto se anonimiza. */
  const GENERICOS = new Set(
    [
      'llamada', 'llamadas', 'llamada de voz', 'llamada de video', 'llamada de vídeo', 'videollamada', 'llamada perdida', 'llamada de voz perdida',
      'videollamada perdida', 'llamada entrante', 'llamada saliente', 'llamada de grupo', 'llamada rechazada', 'llamada finalizada', 'sin respuesta',
      'llamando…', 'llamando...', 'llamando', 'sonando…', 'sonando...', 'sonando', 'conectando…', 'conectando...', 'conectando', 'en espera', 'ocupado',
      'cifrada de extremo a extremo', 'cifrado de extremo a extremo', 'colgar', 'finalizar', 'finalizar llamada', 'aceptar', 'rechazar', 'contestar',
      'responder', 'silenciar', 'activar sonido', 'micrófono', 'cámara', 'vídeo', 'video', 'altavoz', 'compartir pantalla', 'más opciones', 'minimizar',
      'maximizar', 'cerrar', 'volver a llamar', 'llamar', 'toca para volver a llamar', 'haz clic para volver a llamar', 'tú',
      'call', 'calls', 'voice call', 'video call', 'missed call', 'missed voice call', 'missed video call', 'incoming call', 'outgoing call',
      'group call', 'declined', 'call ended', 'no answer', 'calling…', 'calling...', 'calling', 'ringing…', 'ringing...', 'ringing', 'connecting…',
      'connecting...', 'connecting', 'on hold', 'busy', 'end-to-end encrypted', 'end call', 'hang up', 'accept', 'decline', 'answer', 'mute', 'unmute',
      'microphone', 'camera', 'speaker', 'share screen', 'more options', 'minimize', 'maximize', 'close', 'call back', 'you',
    ],
  );
  const ICONO_LLAMADA = /call|phone|voip|mic|camera|video|cam|end|hang|speaker|ringer|ring/i;
  const TESTID_LLAMADA = /call|voip/i;

  const principal = document.querySelector('#main');
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
  const esDuracion = (texto) => /^\d{1,2}:\d{2}(:\d{2})?$/.test(texto);
  const describirTexto = (texto) => {
    if (GENERICOS.has(texto.toLowerCase())) return `GENÉRICO=«${texto}»`;
    const partes = [`texto(${texto.length})`];
    if (esDuracion(texto)) partes.push('PARECE-DURACIÓN');
    else if (/^\d{1,2}[:.]\d{2}\s?([ap]\.?\s?m\.?)?$/i.test(texto)) partes.push('PARECE-HORA');
    if (/^\+?[\d\s().-]{7,}$/.test(texto) && /\d{6,}/.test(texto.replace(/\D/g, ''))) partes.push('PARECE-TELÉFONO');
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
    if (url === 'about:blank' || url.startsWith('about:')) return url.slice(0, 12);
    try {
      const host = new URL(url, document.baseURI).hostname;
      if (/(^|\.)pps\.whatsapp\.net$/.test(host)) return 'foto de perfil (pps.whatsapp.net)';
      if (host === 'web.whatsapp.com') return 'web.whatsapp.com';
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
  const nombreIcono = (e) => (e.localName === 'svg' ? tituloIcono(e) : (e.getAttribute('data-icon') ?? ''));
  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');

  // Reglas de Veilix que pueden alcanzar estos elementos (mismos selectores que `selectores.ts`).
  const REGLAS = [
    ['RF-01 autor', '#main [data-testid="author"]'],
    ['RF-01 encabezado', '#main header :is(span[dir="auto"], span[title])'],
    ['RF-02 foto de perfil', ':is(img[src*="pps.whatsapp.net"], [style*="pps.whatsapp.net"], img[src*="/t61.24694-24/"], [style*="/t61.24694-24/"])'],
    ['RF-02 foto de perfil SVG', 'svg:not([data-icon] svg):has(image[*|href*="pps.whatsapp.net"], image[*|href*="/t61.24694-24/"])'],
    ['RF-02 avatar SVG', 'svg:not([data-icon] svg):has(mask):has(image, foreignObject)'],
    ['RF-02 avatar predeterminado', '[data-icon^="default-user"], [data-icon^="default-group"], [data-icon^="default-contact"], [data-icon^="default-community"]'],
    ['RF-04 texto', `#main ${CONTENEDOR_MENSAJE} :is([data-pre-plain-text], .selectable-text:not([data-pre-plain-text] *))`],
    ['RF-04 multimedia', `#main ${CONTENEDOR_MENSAJE} :is(img[src^="blob:"], img[src^="data:image/jpeg"], video, canvas, [style*="blob:"])`],
    ['RF-01 nombre de la llamada (0.1.3-beta.0)', '[data-testid="voip-call-participant-info-name"]'],
    ['RF-04 estado y duración de la llamada (0.1.3-beta.0)', ':is([data-testid="voip-call-participant-info-call-state-text"], [data-testid="voip-call-timer"]):not(:has(button, [role="button"]))'],
    ['RF-04 texto de la tarjeta de llamada (0.1.3-beta.0)', '[data-testid="msg-container"] [data-testid="call-log-system-message"] :is(div, span):not(:has(*)):not(button, [role="button"]):not(:where([data-testid="call-log-system-message"] :is([data-testid="call-log-icon-chip"], [data-testid="msg-meta"])) *):not([data-testid="call-log-icon-chip"], [data-testid="msg-meta"])'],
    ['RF-04 hora (marca)', '[data-veilix-hora-mensaje]'],
  ];
  const reglas = (elemento) =>
    REGLAS.filter(([, selector]) => {
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
  const filtroEn = (elemento) => {
    for (let actual = elemento, niveles = 0; actual; actual = actual.parentElement, niveles++) {
      const filtro = getComputedStyle(actual).filter;
      if (filtro !== 'none') return niveles === 0 ? `propio ${filtro}` : `antecesor (${niveles} arriba) ${filtro}`;
    }
    return 'NO difuminado';
  };
  const difuminado = (elemento) => filtroEn(elemento) !== 'NO difuminado';

  const describir = (elemento) => {
    const partes = [elemento.localName + clasesSemanticas(elemento)];
    for (const atributo of ['role', 'data-testid', 'data-icon', 'tabindex', 'dir', 'type', 'aria-pressed', 'aria-modal']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['data-id', 'aria-label', 'title', 'alt', 'href', 'data-pre-plain-text', 'style']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    for (const atributo of elemento.getAttributeNames()) {
      if (atributo.startsWith('data-veilix-')) partes.push(`[${atributo}]`);
    }
    if (elemento.localName === 'svg') partes.push(` título=${tituloIcono(elemento)}`);
    if (elemento.localName === 'img') partes.push(` origen=${tipoOrigen(elemento.currentSrc || elemento.getAttribute('src'))}`);
    if (elemento.localName === 'video') partes.push(` vídeo origen=${tipoOrigen(elemento.currentSrc || elemento.getAttribute('src'))}`);
    if (elemento.localName === 'iframe') partes.push(` marco origen=${tipoOrigen(elemento.getAttribute('src'))}`);
    const estilo = getComputedStyle(elemento);
    const fondo = tipoImagenCss(estilo.backgroundImage);
    if (fondo) partes.push(` fondo=${fondo}`);
    if (estilo.position === 'fixed') partes.push(' POSICIÓN-FIJA');
    const texto = textoPropio(elemento);
    // En msg-meta, un texto con forma de hora es la hora del mensaje, no una duración.
    if (texto) partes.push(` ${elemento.closest('[data-testid="msg-meta"]') && /^\d{1,2}[:.]\d{2}/.test(texto) ? `texto(${texto.length}) PARECE-HORA (msg-meta)` : describirTexto(texto)}`);
    return partes.join('');
  };

  // 1) Contexto de ejecución.
  const estilos = [...document.querySelectorAll('style[data-veilix-estilo]')].map((e) => e.getAttribute('data-veilix-estilo'));
  const contexto = {
    ventana: window.top === window ? (window.opener ? 'ventana emergente (abierta por otra)' : 'ventana principal') : 'marco (iframe)',
    origen: location.origin,
    primerSegmentoDeRuta: `/${location.pathname.split('/')[1] ?? ''}`,
    hayConversacion: Boolean(principal),
    veilixCargadoEnEsteDocumento: estilos.length > 0,
    estilosDeVeilix: estilos.join(', ') || 'ninguno',
    atajoPulsado: [...document.documentElement.getAttributeNames()].some((a) => a.startsWith('data-veilix-revelar-')),
    marcos: [...document.querySelectorAll('iframe')].map((m) => `${describir(m)} ${Math.round(m.getBoundingClientRect().width)}×${Math.round(m.getBoundingClientRect().height)}`).join(' | ') || 'ninguno',
  };

  // 2) Indicios de llamada.
  const visible = (e) => {
    const caja = e.getBoundingClientRect();
    return caja.width > 0 && caja.height > 0 && caja.bottom > 0 && caja.top < window.innerHeight;
  };
  const indicio = (e) => {
    const texto = textoPropio(e);
    if (texto && (GENERICOS.has(texto.toLowerCase()) || esDuracion(texto))) return true;
    if ((e.localName === 'svg' || e.hasAttribute('data-icon')) && ICONO_LLAMADA.test(nombreIcono(e)) && !/^otro título/.test(nombreIcono(e))) return true;
    return TESTID_LLAMADA.test(e.getAttribute('data-testid') ?? '');
  };
  const todos = [...document.querySelectorAll('body *')].filter((e) => !e.closest('#pane-side') && visible(e) && indicio(e));
  const fuera = todos.filter((e) => !e.closest('#main'));
  const enMensajes = todos.filter((e) => e.closest(`#main ${CONTENEDOR_MENSAJE}`));

  // Panel flotante: el antecesor más cercano con posición fija, role=dialog o data-testid de llamada; si no, el antecesor común.
  const raizFlotante = (e) => {
    for (let actual = e; actual && actual !== document.body; actual = actual.parentElement) {
      if (actual.closest('#main, #pane-side')) return null;
      if (getComputedStyle(actual).position === 'fixed' || actual.getAttribute('role') === 'dialog' || TESTID_LLAMADA.test(actual.getAttribute('data-testid') ?? '')) return actual;
    }
    return null;
  };
  const paneles = [...new Set(fuera.map(raizFlotante).filter(Boolean))]
    .filter((p, _, lista) => !lista.some((otro) => otro !== p && otro.contains(p)))
    .slice(0, 3);
  const tarjetas = [...new Set(enMensajes.map((e) => e.closest(`#main ${CONTENEDOR_MENSAJE}`)))].slice(-MAXIMO_TARJETAS);

  // 3) Tabla de elementos y esqueleto de cada raíz.
  const filas = [];
  const esqueletos = [];
  const interactivo = (e) => e.closest('button, [role="button"], a[href], input, [tabindex]:not([tabindex="-1"])') !== null;
  const examinar = (raiz, tipo, n) => {
    for (const e of [raiz, ...raiz.querySelectorAll('*')]) {
      if (e.parentElement?.closest('svg')) continue;
      const caja = e.getBoundingClientRect();
      const texto = textoPropio(e);
      const imagen = e.localName === 'img' || e.localName === 'video' || e.localName === 'canvas' || (e.localName === 'svg' && caja.width >= 20) || tipoImagenCss(getComputedStyle(e).backgroundImage);
      const control = e.matches('button, [role="button"], input');
      if (!texto && !imagen && !control) continue;
      filas.push({
        tipo,
        n,
        elemento: describir(e),
        tamano: `${Math.round(caja.width)}×${Math.round(caja.height)}`,
        clase: control ? 'control' : imagen ? 'imagen' : 'texto',
        interactivo: interactivo(e) ? 'sí' : 'no',
        reglas: reglas(e),
        marcasVeilix: marcasVeilix(e),
        filtro: filtroEn(e),
      });
    }
    const lineas = [];
    const recorrer = (elemento, nivel) => {
      if (lineas.length >= MAXIMO_NODOS) return;
      lineas.push(`${'  '.repeat(nivel)}${describir(elemento)} · ${difuminado(elemento) ? 'difuminado' : 'visible'}`);
      if (elemento.localName === 'svg') return;
      for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
    };
    recorrer(raiz, 0);
    const ascendencia = [];
    for (let actual = raiz.parentElement; actual && actual !== document.body && ascendencia.length < 8; actual = actual.parentElement) ascendencia.push(describir(actual));
    esqueletos.push(`${tipo} ${n}${raiz.closest('#main') ? ' (dentro de #main)' : ' (fuera de #main)'}\n  ascendencia: ${ascendencia.join(' < ') || '(body)'}\n${lineas.join('\n')}`);
  };
  paneles.forEach((p, i) => {
    examinar(p, 'Panel flotante', i + 1);
  });
  tarjetas.forEach((t, i) => {
    examinar(t, 'Tarjeta de llamada', i + 1);
  });

  const resumen = {
    ...contexto,
    indiciosFueraDeMain: fuera.length,
    indiciosEnMensajes: enMensajes.length,
    panelesFlotantes: paneles.length,
    tarjetasDeLlamada: tarjetas.length,
    textosNoGenericosVisibles: filas.filter((f) => f.clase === 'texto' && !/GENÉRICO=/.test(f.elemento) && f.filtro === 'NO difuminado').length,
    imagenesVisibles: filas.filter((f) => f.clase === 'imagen' && !/título=(wds-ic-|.*\(nombre de icono\))/.test(f.elemento) && f.filtro === 'NO difuminado').length,
    controlesDifuminados: filas.filter((f) => f.clase === 'control' && f.filtro !== 'NO difuminado').length,
  };

  console.log('Veilix · llamadas (RF-01, RF-02 y RF-04): resumen.');
  console.table([resumen]);
  if (paneles.length === 0 && tarjetas.length === 0) {
    console.log('Veilix · no se encontró ningún panel de llamada ni ninguna tarjeta de llamada a la vista. Si la llamada está en otra ventana, ejecuta el fragmento en la consola de esa ventana.');
  }
  console.log('Veilix · textos, imágenes y controles:');
  console.table(filas);
  console.log('Veilix · resumen (JSON):\n' + JSON.stringify({ resumen, elementos: filas }, null, 2) + '\n\nVeilix · estructura anonimizada:\n' + esqueletos.join('\n\n'));
})();

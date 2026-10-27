/* global document, getComputedStyle, console, URL, Node -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de la pantalla «Info. del mensaje» de WhatsApp Web
 * (RF-04).
 *
 * Las reglas de RF-04 solo actúan dentro de `#main` (la conversación). «Info.
 * del mensaje» se abre como un panel aparte que vuelve a mostrar el mensaje.
 * Este fragmento localiza ese panel y la copia del mensaje sin suponer su
 * estructura:
 * - busca, fuera de `#main` y de la lista de chats, los componentes de mensaje
 *   (`msg-container`, `data-pre-plain-text`, `.selectable-text`), la
 *   multimedia (`img` de `blob:` o `data:image/jpeg`, `video`, `canvas`) y
 *   los textos que coinciden con un mensaje visible de la conversación (sin
 *   mostrarlos);
 * - localiza el título «Info. del mensaje» y las etiquetas de estado («Leído»,
 *   «Entregado»…), que son textos genéricos de la interfaz;
 * - toma como raíz el antecesor común más pequeño de todo ello y muestra su
 *   esqueleto, con las reglas de RF-04 que alcanzan a cada elemento y dónde
 *   está el filtro.
 *
 * Además, muestra todos los elementos visuales de la copia del mensaje (img
 * con su tipo de origen, vídeo y sus atributos, canvas, SVG, fondos y
 * máscaras CSS, también en pseudoelementos), con su ruta, su tamaño, si
 * pueden recibir el foco, las reglas de RF-04 que los alcanzan y dónde está el
 * filtro; y, para comparar, los de los mensajes multimedia de la conversación.
 *
 * Uso: con RF-04 activada, abre «Info. del mensaje» de un mensaje (de texto;
 * de un sticker, estático y animado; de una foto; de un vídeo), aleja el cursor del panel,
 * abre las herramientas de desarrollo (F12) → Consola, pega este archivo
 * completo y pulsa Intro.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No hace peticiones ni guarda nada.
 * - No muestra textos, nombres, fechas, horas, teléfonos, `data-id`,
 *   `data-pre-plain-text`, `title`, `aria-label`, `alt` ni direcciones. Del
 *   texto solo indica su longitud y si parece una hora o una fecha; solo se
 *   muestran tal cual el título de la pantalla y las etiquetas de estado
 *   conocidas, que son textos genéricos de la interfaz.
 * - De las imágenes, solo el tipo de origen. Los `data-testid` se anonimizan.
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  /** `data-testid` anonimizado: números como «#», nada tras «@» ni tras `list-item-`. */
  const limpiarTestId = (valor) => valor.replace(/^(list-item-).+$/, '$1…').replace(/@.*$/, '@…').replace(/\d+/g, '#');
  const MAXIMO_NODOS = 150;
  const CONTENEDOR_MENSAJE = ':is([data-testid="msg-container"], .message-in, .message-out)';
  const COMPONENTES_MENSAJE = `${CONTENEDOR_MENSAJE}, [data-pre-plain-text], .selectable-text, [data-testid="msg-meta"]`;
  const MULTIMEDIA = 'img[src^="blob:"], img[src^="data:image/jpeg"], video, canvas, [style*="blob:"]';
  const TITULO = /^(info\.? del mensaje|informaci[oó]n del mensaje|message info)$/i;
  const ESTADO = /^(le[ií]do|entregado|enviado|visto|reproducido|pendiente|read|delivered|sent|seen|played|pending)$/i;

  const principal = document.querySelector('#main');
  const fueraDeLaConversacion = (e) => !e.closest('#main, #pane-side');

  const normalizar = (texto) => texto.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim();
  const textoPropio = (elemento) =>
    normalizar(
      [...elemento.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join(''),
    );
  // Textos de los mensajes visibles de la conversación: solo para comparar; nunca se muestran.
  const textosMensajes = new Set(
    [...(principal?.querySelectorAll('[data-pre-plain-text], .selectable-text') ?? [])].map((e) => normalizar(e.textContent ?? '')).filter((t) => t.length >= 2),
  );
  const coincideConMensaje = (texto) =>
    texto.length >= 2 && (textosMensajes.has(texto) || [...textosMensajes].some((m) => m.startsWith(texto.replace(/…$/, '')) || texto.startsWith(m)));

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
  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    if (!titulo) return 'ninguno';
    const texto = titulo.textContent.trim();
    return /^wds-ic-[a-z0-9-]+$/.test(texto) ? texto : `otro título (${texto.length})`;
  };
  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');

  // Reglas actuales de RF-04 (mismos selectores que `selectores.ts`), para saber cuáles alcanzan a cada elemento.
  const REGLAS_RF04 = [
    ['RF-04 fila', `#main [data-id]:has(${CONTENEDOR_MENSAJE})`],
    ['RF-04 contenedor', `#main ${CONTENEDOR_MENSAJE}`],
    ['RF-04 «Responder»', '#main footer [data-testid="quoted-message"]'],
    ['RF-04 multimedia (conversación)', `#main ${CONTENEDOR_MENSAJE} :is(img[src^="blob:"], img[src^="data:image/jpeg"], video, canvas, [style*="blob:"])`],
    ['RF-04 «Info. del mensaje» (texto)', '[data-testid="drawer-right"]:has([data-testid="kept-by-info"]) [data-testid="msg-container"] [data-testid="selectable-text"]'],
  ];
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
  const filtroEn = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return actual === elemento ? 'el propio elemento' : 'un antecesor';
    }
    return 'NO difuminado';
  };

  const describir = (elemento) => {
    const partes = [elemento.tagName.toLowerCase() + clasesSemanticas(elemento)];
    if (['app', 'main', 'side', 'pane-side'].includes(elemento.id)) partes.push(`#${elemento.id}`);
    for (const atributo of ['role', 'data-testid', 'data-icon', 'data-animate-drawer', 'data-tab', 'tabindex']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['data-id', 'data-pre-plain-text', 'aria-label', 'title', 'alt']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    if (elemento.localName === 'img') partes.push(`origen=${tipoOrigen(elemento.getAttribute('src'))}`);
    if (/blob:/.test(elemento.getAttribute('style') ?? '')) partes.push('FONDO-BLOB');
    if (elemento.localName === 'svg') partes.push(`título=${tituloIcono(elemento)}`);
    if (elemento.localName === 'img' && /\p{Extended_Pictographic}/u.test(elemento.getAttribute('alt') ?? '')) partes.push('ALT-EMOJI');
    const texto = textoPropio(elemento);
    if (texto) {
      if (TITULO.test(texto)) partes.push(`TÍTULO=«${texto}»`);
      else if (ESTADO.test(texto)) partes.push(`ESTADO=«${texto}»`);
      else {
        partes.push(`texto(${texto.length})`);
        if (/^\d{1,2}[:.]\d{2}/.test(texto) || /\d{1,2}[:.]\d{2}\s*(a|p)?\.?\s*m?\.?$/i.test(texto)) partes.push('PARECE-HORA');
        if (/\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}|\b(hoy|ayer|today|yesterday|lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/i.test(texto)) partes.push('PARECE-FECHA');
        if (coincideConMensaje(texto)) partes.push('COINCIDE-CON-UN-MENSAJE');
        if (/\p{Extended_Pictographic}/u.test(texto)) partes.push('CON-EMOJI');
      }
    }
    if (elemento.matches(CONTENEDOR_MENSAJE)) partes.push('ES-CONTENEDOR-DE-MENSAJE');
    const reglas = reglasQueAlcanzan(elemento);
    if (reglas !== 'NINGUNA') partes.push(`REGLAS=${reglas}`);
    partes.push(`· ${filtroEn(elemento) === 'NO difuminado' ? 'visible' : 'difuminado'}`);
    return partes.join(' ');
  };

  // 1) Indicios fuera de la conversación.
  const todos = [...document.querySelectorAll('body *')].filter(fueraDeLaConversacion);
  const componentes = todos.filter((e) => e.matches(COMPONENTES_MENSAJE));
  const multimedia = todos.filter((e) => e.matches(MULTIMEDIA));
  const copias = todos.filter((e) => coincideConMensaje(textoPropio(e)));
  const titulos = todos.filter((e) => TITULO.test(textoPropio(e)));
  const estados = todos.filter((e) => ESTADO.test(textoPropio(e)));
  const indicios = [...new Set([...titulos, ...componentes, ...multimedia, ...copias, ...estados])];

  if (indicios.length === 0) {
    console.log('Veilix · no se encontró «Info. del mensaje» fuera de la conversación. Ábrela y vuelve a ejecutar el fragmento.');
    return;
  }

  // 2) Raíz: el antecesor común más pequeño del título y de la copia del mensaje (o de todos los indicios).
  const nucleo = [...titulos, ...componentes, ...multimedia, ...copias];
  let raiz = (nucleo[0] ?? indicios[0]).parentElement;
  for (const e of nucleo.length > 0 ? nucleo : indicios) {
    while (raiz && !raiz.contains(e)) raiz = raiz.parentElement;
  }
  raiz ??= document.body;

  const ascendencia = [];
  for (let actual = raiz; actual && actual !== document.body && ascendencia.length < 12; actual = actual.parentElement) {
    ascendencia.push(describir(actual).replace(/ · .*$/, ''));
  }

  const lineas = [];
  const recorrer = (elemento, nivel) => {
    if (lineas.length >= MAXIMO_NODOS) return;
    lineas.push(`${'  '.repeat(nivel)}${describir(elemento)}`);
    if (elemento.localName === 'svg') return;
    for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
  };
  recorrer(raiz, 0);

  // 3) Elementos visuales de cada copia del mensaje (fuera de #main) y, para comparar, de los mensajes
  //    multimedia de la conversación: qué representa la imagen (img, vídeo, canvas, SVG, fondo CSS…).
  const tipoImagenCss = (valor) => {
    if (!valor || valor === 'none' || valor === 'normal' || valor === '""') return null;
    if (/gradient\(/.test(valor)) return 'degradado';
    const url = /url\(["']?([^"')]+)/.exec(valor)?.[1];
    return url ? tipoOrigen(url) : 'otro valor';
  };
  const senalesVisuales = (e) => {
    const lista = [];
    if (e.localName === 'img') lista.push(`img · ${tipoOrigen(e.getAttribute('src'))}${e.hasAttribute('srcset') ? ' · srcset' : ''}`);
    if (e.localName === 'video') lista.push(`video${['autoplay', 'loop', 'muted', 'poster', 'controls'].filter((a) => e.hasAttribute(a)).map((a) => ` · ${a}`).join('')}`);
    if (e.localName === 'canvas') lista.push('canvas');
    if (e.localName === 'svg' && !e.parentElement?.closest('svg')) {
      const partes = ['mask', 'image', 'foreignObject', 'path', 'use'].filter((x) => e.querySelector(x));
      lista.push(`svg · ${partes.join('+') || 'vacío'} · título ${tituloIcono(e)}`);
    }
    const estilo = getComputedStyle(e);
    const fondo = tipoImagenCss(estilo.backgroundImage);
    if (fondo) lista.push(`fondo CSS · ${fondo}`);
    const mascara = tipoImagenCss(estilo.maskImage || estilo.webkitMaskImage);
    if (mascara) lista.push(`máscara CSS · ${mascara}`);
    for (const pseudo of ['::before', '::after']) {
      const imagen = tipoImagenCss(getComputedStyle(e, pseudo).backgroundImage);
      if (imagen) lista.push(`${pseudo} · fondo ${imagen}`);
    }
    return lista;
  };
  const rutaDesde = (e, contenedor) => {
    const cadena = [];
    for (let actual = e.parentElement; actual && actual !== contenedor && cadena.length < 10; actual = actual.parentElement) {
      cadena.push(describir(actual).replace(/ (texto\(|TÍTULO|ESTADO|PARECE|COINCIDE|CON-EMOJI|ES-CONTENEDOR|REGLAS|·).*$/, ''));
    }
    return cadena.reverse().join(' › ') || '(directamente en msg-container)';
  };
  const visualesDe = (contenedor) => [...contenedor.querySelectorAll('*')].filter((e) => senalesVisuales(e).length > 0);
  const filaVisual = (origen, indice, contenedor, e) => {
    const caja = e.getBoundingClientRect();
    return {
      origen,
      mensaje: indice + 1,
      elemento: describir(e).replace(/ (REGLAS|·).*$/, ''),
      ruta: rutaDesde(e, contenedor),
      tamano: `${Math.round(caja.width)}×${Math.round(caja.height)}`,
      senales: senalesVisuales(e).join('; '),
      zona: e.closest('[data-testid="msg-meta"]') ? 'msg-meta' : 'contenido',
      dentroDeUnBoton: e.closest('button, [role="button"]') ? 'sí' : 'no',
      foco: e.closest('[tabindex], a[href], button') ? 'puede recibirlo (o un antecesor)' : 'no',
      reglasRF04: reglasQueAlcanzan(e),
      difuminado: filtroEn(e),
    };
  };
  const copiasDelMensaje = todos.filter((e) => e.matches(CONTENEDOR_MENSAJE));
  const visualesInfo = copiasDelMensaje.flatMap((c, i) => visualesDe(c).map((e) => filaVisual('«Info. del mensaje»', i, c, e)));
  const mensajesMultimedia = [...(principal?.querySelectorAll(CONTENEDOR_MENSAJE) ?? [])]
    .filter((c) => visualesDe(c).some((e) => !e.closest('[data-testid="msg-meta"]') && e.localName !== 'svg'))
    .slice(-5);
  const visualesConversacion = mensajesMultimedia.flatMap((c, i) =>
    visualesDe(c)
      .filter((e) => !e.closest('[data-testid="msg-meta"]'))
      .map((e) => filaVisual('conversación', i, c, e)),
  );

  const resumen = {
    raizDelPanel: describir(raiz).replace(/ · .*$/, ''),
    dentroDeMain: Boolean(raiz.closest('#main')),
    titulos: titulos.length,
    componentesDeMensaje: componentes.map((e) => describir(e).replace(/ (texto\(|TÍTULO|ESTADO|PARECE|COINCIDE|CON-EMOJI|ES-CONTENEDOR|REGLAS|·).*$/, '')).join(', ') || '—',
    multimedia: multimedia.length,
    elementosVisualesEnLaCopia: visualesInfo.filter((v) => v.zona === 'contenido').length,
    elementosVisualesVisibles: visualesInfo.filter((v) => v.zona === 'contenido' && v.difuminado === 'NO difuminado').length,
    textosQueCoincidenConUnMensaje: copias.length,
    textosQueCoincidenVisibles: copias.filter((e) => filtroEn(e) === 'NO difuminado').length,
    etiquetasDeEstado: estados.length,
    rf04Activa: (document.querySelector('style[data-veilix-estilo="mensajes-conversacion"]')?.textContent ?? '') !== '',
    atajoActivo: document.documentElement.hasAttribute('data-veilix-revelar-mensajes-conversacion'),
  };

  console.log('Veilix · «Info. del mensaje» (RF-04): resumen.');
  console.table([resumen]);
  console.log('Veilix · ascendencia del panel (de la raíz hacia arriba):\n' + ascendencia.join('\n  < '));
  console.log('Veilix · elementos visuales de la copia del mensaje y, para comparar, de los mensajes multimedia de la conversación:');
  console.table([...visualesInfo, ...visualesConversacion]);
  console.log(
    'Veilix · resumen (JSON):\n' +
      JSON.stringify({ resumen, ascendencia, visualesInfo, visualesConversacion }, null, 2) +
      '\n\nVeilix · estructura anonimizada del panel:\n' +
      lineas.join('\n'),
  );
})();

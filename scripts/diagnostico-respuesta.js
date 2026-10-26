/* global document, getComputedStyle, console, URL, Node -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO del recuadro «Responder» de WhatsApp Web (RF-01,
 * RF-04 y RF-05).
 *
 * Al pulsar «Responder» sobre un mensaje, WhatsApp muestra encima del editor
 * una vista previa del mensaje citado. Las reglas actuales de RF-04 solo
 * actúan dentro de las filas de mensaje (`#main [data-id]` con
 * `msg-container`), y RF-01 solo difumina el nombre si su texto coincide con
 * un remitente de `data-pre-plain-text`. Este fragmento muestra la estructura
 * real del recuadro para poder protegerlo sin suponer selectores.
 *
 * Uso: abrir una conversación con RF-01, RF-04 y RF-05 activadas, pulsar
 * «Responder» sobre un mensaje y, con el recuadro abierto, abrir las
 * herramientas de desarrollo (F12) → Consola, pegar este archivo completo y
 * pulsar Intro. Conviene repetirlo con un mensaje recibido, uno propio, un
 * mensaje de un grupo y una foto o un vídeo.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No hace peticiones ni guarda nada.
 * - No muestra textos, nombres, `data-id`, `data-pre-plain-text`, `title`,
 *   `aria-label`, `alt` ni direcciones. Del texto solo indica su longitud y,
 *   sin mostrarlo, si coincide con un remitente o con un mensaje visible de la
 *   conversación. De las imágenes, solo el tipo de origen (`blob`,
 *   `data:image/jpeg`, dominio de WhatsApp u otro dominio, sin nombrarlo).
 * - No recorre el contenido del editor: solo describe el propio campo.
 * - Los valores de `data-testid` se anonimizan.
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  /** `data-testid` anonimizado: números como «#» y nada tras «@» (podrían ser identificadores). */
  const limpiarTestId = (valor) => valor.replace(/@.*$/, '@…').replace(/\d+/g, '#');
  const MAXIMO_NODOS = 120;
  const MAXIMO_CANDIDATOS = 30;
  const EDITOR = '[contenteditable="true"], [contenteditable=""], [role="textbox"]';
  const CONTENEDOR_MENSAJE = ':is([data-testid="msg-container"], .message-in, .message-out)';

  const panel = document.querySelector('#main');
  if (!panel) {
    console.log('Veilix · no hay ninguna conversación abierta (#main no existe).');
    return;
  }
  const editor = panel.querySelector(`footer :is(${EDITOR})`) ?? panel.querySelector(EDITOR);

  /** Elemento que lleva el `filter` (él mismo o un antecesor), o `null`. */
  const origenFiltro = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return actual;
    }
    return null;
  };

  const textoPropio = (elemento) =>
    [...elemento.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join('')
      .trim();

  const normalizar = (texto) => texto.replace(/[‎‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();

  // Remitentes y textos de los mensajes visibles: solo se usan para comparar y nunca se muestran.
  const remitentes = new Set();
  const textosMensajes = new Set();
  for (const bloque of panel.querySelectorAll('[data-pre-plain-text]')) {
    const remitente = /\]\s*(.+?):\s*$/su.exec(bloque.getAttribute('data-pre-plain-text') ?? '')?.[1];
    if (remitente) remitentes.add(normalizar(remitente).replace(/^~\s*/, ''));
    const texto = normalizar(bloque.textContent ?? '');
    if (texto) textosMensajes.add(texto);
  }

  const tipoOrigen = (src) => {
    if (!src) return 'sin src';
    if (src.startsWith('blob:')) return 'blob';
    if (src.startsWith('data:')) return src.slice(0, src.indexOf(';') > 0 ? src.indexOf(';') : 15);
    // El dominio de una imagen citada podría revelar qué web se compartió: solo se indica si es de WhatsApp.
    try {
      return /(^|\.)(whatsapp\.(net|com)|fbcdn\.net)$/.test(new URL(src, document.baseURI).hostname) ? 'dominio de WhatsApp' : 'otro dominio';
    } catch {
      return 'no válida';
    }
  };

  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');

  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    if (!titulo) return 'sin título';
    const texto = titulo.textContent.trim();
    return /^wds-ic-[a-z0-9-]+$/.test(texto) ? texto : `otro título (${texto.length})`;
  };

  /** Etiquetas genéricas de la interfaz que se pueden mostrar porque no son datos personales. */
  const etiquetaGenerica = (texto) =>
    /^(t[uú]|you|cancelar|cerrar|close|cancel|foto|photo|v[ií]deo|video|gif|sticker|documento|document|audio|ubicaci[oó]n|location|contacto|contact|encuesta|poll)$/i.test(texto)
      ? `«${texto}»`
      : null;

  const marcasVeilix = (elemento) =>
    elemento
      .getAttributeNames()
      .filter((a) => a.startsWith('data-veilix-'))
      .map((a) => a.replace('data-veilix-', 'MARCADO-').toUpperCase());

  const describir = (elemento) => {
    const partes = [elemento.tagName.toLowerCase() + clasesSemanticas(elemento)];
    if (elemento === panel) partes.push('#main');
    for (const atributo of ['role', 'data-testid', 'data-icon', 'dir', 'contenteditable', 'tabindex']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['data-id', 'data-pre-plain-text', 'aria-label', 'title', 'alt']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    if (elemento.tagName === 'IMG') partes.push(`origen=${tipoOrigen(elemento.getAttribute('src'))}`);
    if (elemento.tagName === 'IMG' && /\p{Extended_Pictographic}/u.test(elemento.getAttribute('alt') ?? '')) partes.push('ALT-EMOJI');
    if (/blob:/.test(elemento.getAttribute('style') ?? '')) partes.push('FONDO-BLOB');
    if (elemento.localName === 'svg') partes.push(`título=${tituloIcono(elemento)}`);
    const texto = normalizar(textoPropio(elemento));
    if (texto) {
      partes.push(`texto(${texto.length})`);
      const generica = etiquetaGenerica(texto);
      if (generica) partes.push(`ETIQUETA=${generica}`);
      if (remitentes.has(texto.replace(/^~\s*/, ''))) partes.push('COINCIDE-CON-REMITENTE');
      if (textosMensajes.has(texto)) partes.push('COINCIDE-CON-MENSAJE');
      else if (texto.length >= 3 && [...textosMensajes].some((m) => m.startsWith(texto.replace(/…$/, '')))) partes.push('COINCIDE-CON-INICIO-DE-MENSAJE');
      if (/^\d{1,2}[:.]\d{2}/.test(texto)) partes.push('PARECE-HORA');
    }
    partes.push(...marcasVeilix(elemento));
    if (elemento.matches(CONTENEDOR_MENSAJE)) partes.push('ES-CONTENEDOR-DE-MENSAJE');
    if (elemento === editor) partes.push('ES-EL-EDITOR (contenido omitido)');
    const filtro = origenFiltro(elemento);
    partes.push(filtro ? (filtro === elemento ? '· difuminado' : `· difuminado (filtro en ${filtro.tagName.toLowerCase()})`) : '· visible');
    return partes.join(' ');
  };

  const ascendencia = (elemento) => {
    const cadena = [];
    for (let actual = elemento.parentElement; actual && cadena.length < 12; actual = actual.parentElement) {
      cadena.push(describir(actual).replace(/ · .*$/, ''));
      if (actual === panel) break;
    }
    return cadena.join(' < ');
  };

  // Candidatos: elementos de #main con texto o imagen que no están en una fila de mensaje
  // (`[data-id]`), ni en el encabezado, ni dentro del editor.
  const esCandidato = (elemento) => {
    if (elemento.closest('[data-id], header, svg')) return false;
    if (editor && (editor.contains(elemento) || elemento.contains(editor))) return elemento === editor;
    const tieneImagen = elemento.tagName === 'IMG' || elemento.localName === 'video' || elemento.localName === 'canvas' || /blob:/.test(elemento.getAttribute('style') ?? '');
    return tieneImagen || textoPropio(elemento) !== '';
  };
  const candidatos = [...panel.querySelectorAll('*')].filter(esCandidato);

  const resumen = candidatos.slice(0, MAXIMO_CANDIDATOS).map((elemento, indice) => ({
    elemento: indice + 1,
    descripcion: describir(elemento),
    enFooter: elemento.closest('footer') ? 'sí' : 'no',
    ascendencia: ascendencia(elemento),
  }));

  // Esqueleto del contenedor común más pequeño que incluye el editor y los candidatos del pie.
  const delPie = candidatos.filter((c) => c.closest('footer'));
  let raiz = editor?.closest('footer') ?? panel.querySelector('footer');
  for (const candidato of delPie) {
    while (raiz && !raiz.contains(candidato)) raiz = raiz.parentElement;
  }
  const lineas = [];
  const recorrer = (elemento, nivel) => {
    if (lineas.length >= MAXIMO_NODOS) return;
    lineas.push(`${'  '.repeat(nivel)}${describir(elemento)}`);
    if (elemento.localName === 'svg' || elemento === editor) return;
    for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
  };
  if (raiz) recorrer(raiz, 0);

  const botones = raiz
    ? [...raiz.querySelectorAll('button, [role="button"]')].map((boton) => ({
        boton: describir(boton).replace(/ · .*$/, ''),
        iconos: [...boton.querySelectorAll('svg')].map(tituloIcono).join(', ') || '—',
        dataIcon: [...boton.querySelectorAll('[data-icon]')].map((e) => e.getAttribute('data-icon')).join(', ') || '—',
        difuminado: origenFiltro(boton) ? 'sí' : 'no',
      }))
    : [];

  console.log(
    `Veilix · recuadro «Responder»: editor ${editor ? 'encontrado' : 'NO encontrado'}` +
      `${editor?.closest('footer') ? ' dentro de #main footer' : ''}; ${candidatos.length} elemento(s) con texto o imagen fuera de las filas de mensaje; ` +
      `${remitentes.size} remitente(s) y ${textosMensajes.size} texto(s) de mensaje para comparar (no se muestran).`,
  );
  console.table(resumen);
  console.log('Veilix · botones del pie (la X para cancelar debe seguir visible):');
  console.table(botones);
  console.log(
    'Veilix · resumen (JSON):\n' +
      JSON.stringify({ editorEnFooter: Boolean(editor?.closest('footer')), candidatos: resumen, botones }, null, 2) +
      '\n\nVeilix · estructura anonimizada del pie con el recuadro:\n' +
      (lineas.join('\n') || '(no se encontró el pie)'),
  );
})();

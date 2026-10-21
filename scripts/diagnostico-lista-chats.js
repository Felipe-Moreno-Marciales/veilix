/* global document, getComputedStyle, console, Node -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de la lista de chats en WhatsApp Web (RF-01 y RF-03).
 *
 * Uso: con RF-03 (y, si se quiere, RF-01) activada, abrir las herramientas de
 * desarrollo (F12) → Consola, pegar este archivo completo y pulsar Intro.
 * Conviene que en la lista haya chats con vistas previas especiales: una
 * reacción («reaccionó con … a:»), una foto, un sticker, un mensaje propio
 * leído, etc.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No hace peticiones ni guarda nada.
 * - No muestra textos, nombres, `title`, `aria-label` ni `alt`. Del texto solo
 *   indica su longitud, si parece una hora, si contiene emojis o si solo son
 *   emojis. De los SVG, solo los nombres con forma `wds-ic-…`.
 * - Revisa el resultado antes de compartirlo.
 *
 * Para cada fila muestra su estructura y qué ha marcado Veilix (nombre, vista
 * previa, estado), y resume los textos visibles que quedan sin proteger.
 */
(() => {
  /** `data-testid` anonimizado: números como «#» y nada tras «@» (podrían ser identificadores). */
  const limpiarTestId = (valor) => valor.replace(/@.*$/, '@…').replace(/\d+/g, '#');
  const MAXIMO_FILAS = 15;
  const MAXIMO_NODOS = 70;
  const filas = [...document.querySelectorAll('#pane-side :is([role="listitem"], [role="row"])')];

  const difuminado = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return true;
    }
    return false;
  };

  const textoPropio = (elemento) =>
    [...elemento.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join('')
      .trim();

  const EMOJI = /\p{Extended_Pictographic}/u;
  const SOLO_EMOJI = /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Emoji_Component}|[\s\d+.,·])+$/u;

  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    if (!titulo) return 'sin título';
    const texto = titulo.textContent.trim();
    return /^wds-ic-[a-z0-9-]+$/.test(texto) ? texto : `otro título (${texto.length})`;
  };

  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');

  const marcas = (elemento) =>
    [
      ['data-veilix-nombre', 'MARCADO-NOMBRE'],
      ['data-veilix-vista-previa', 'MARCADO-VISTA-PREVIA'],
      ['data-veilix-estado-vista-previa', 'MARCADO-ESTADO'],
    ]
      .filter(([atributo]) => elemento.hasAttribute(atributo))
      .map(([, etiqueta]) => etiqueta);

  const describir = (elemento) => {
    const partes = [elemento.tagName.toLowerCase() + clasesSemanticas(elemento)];
    for (const atributo of ['role', 'data-testid', 'data-icon', 'dir']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['title', 'aria-label', 'tabindex']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    if (elemento.localName === 'svg') partes.push(`título=${tituloIcono(elemento)}`);
    if (elemento.tagName === 'IMG' && EMOJI.test(elemento.getAttribute('alt') ?? '')) partes.push('ALT-EMOJI');
    const texto = textoPropio(elemento);
    if (texto) {
      partes.push(`texto(${texto.length})`);
      if (/^\d{1,2}[:.]\d{2}/.test(texto) || /^(ayer|hoy|yesterday|today)$/i.test(texto)) partes.push('PARECE-HORA');
      if (EMOJI.test(texto)) partes.push(SOLO_EMOJI.test(texto) ? 'SOLO-EMOJI' : 'CON-EMOJI');
    }
    partes.push(...marcas(elemento));
    partes.push(difuminado(elemento) ? '· difuminado' : '· visible');
    return partes.join(' ');
  };

  const esqueleto = (fila) => {
    const lineas = [];
    const recorrer = (elemento, nivel) => {
      if (lineas.length >= MAXIMO_NODOS) return;
      lineas.push(`${'  '.repeat(nivel)}${describir(elemento)}`);
      if (elemento.localName === 'svg') return;
      for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
    };
    recorrer(fila, 0);
    return lineas.join('\n');
  };

  /** Elementos con texto propio visible que no están difuminados ni son el nombre ni parecen hora. */
  const textosSinProteger = (fila) =>
    [...fila.querySelectorAll('*')].filter((elemento) => {
      if (elemento.closest('svg')) return false;
      const texto = textoPropio(elemento);
      if (!texto || /^\d{1,2}[:.]\d{2}/.test(texto) || /^\d+$/.test(texto)) return false;
      if (elemento.closest('[data-veilix-nombre]')) return false;
      return !difuminado(elemento);
    });

  const resumen = filas.map((fila, indice) => {
    const sinProteger = textosSinProteger(fila);
    return {
      fila: indice + 1,
      nombreMarcado: fila.querySelector('[data-veilix-nombre]') !== null,
      vistasPreviasMarcadas: fila.querySelectorAll('[data-veilix-vista-previa]').length,
      estadosMarcados: fila.querySelectorAll('[data-veilix-estado-vista-previa]').length,
      textosSinProteger: sinProteger.length,
      detalle: sinProteger.map((e) => `${describir(e)}`).join(' | ') || '—',
      iconos: [...fila.querySelectorAll('svg')].map((svg) => `${tituloIcono(svg)}${difuminado(svg) ? ' (dif.)' : ''}`).join(', ') || '—',
    };
  });

  console.log(`Veilix · diagnóstico anonimizado de la lista de chats: ${filas.length} fila(s).`);
  console.table(resumen);
  const conProblemas = filas
    .map((fila, indice) => ({ fila, indice }))
    .filter(({ indice }) => (resumen[indice]?.textosSinProteger ?? 0) > 0);
  const elegidas = (conProblemas.length > 0 ? conProblemas : filas.map((fila, indice) => ({ fila, indice }))).slice(0, MAXIMO_FILAS);
  console.log(
    'Veilix · resumen (JSON):\n' +
      JSON.stringify(resumen, null, 2) +
      '\n\nVeilix · estructura anonimizada' +
      (conProblemas.length > 0 ? ' (filas con textos sin proteger)' : '') +
      ':\n' +
      elegidas.map(({ fila, indice }) => `── Fila ${indice + 1} ──\n${esqueleto(fila)}`).join('\n\n'),
  );
})();

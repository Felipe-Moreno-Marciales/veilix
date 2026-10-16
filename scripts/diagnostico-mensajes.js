/* global document, getComputedStyle, console, URL, Node -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de mensajes en WhatsApp Web (RF-04 y remitentes de RF-01).
 * Para cada elemento indica qué reglas de Veilix lo alcanzan (RF-01 o RF-04),
 * si está dentro de un `<header>` y qué elemento lleva el filtro. Así se ve
 * qué módulo difumina el nombre del remitente en los grupos.
 * Indica además qué elementos ha marcado Veilix como hora o reacción, y
 * resume los iconos de la lista y de la conversación por nombre: `data-icon` y
 * `<title>` de los SVG (solo identificadores `wds-ic-…`). Para cada
 * `msg-meta` muestra sus iconos y las etiquetas de estado conocidas
 * («Leído», «Entregado»…). Sirve para confirmar los indicadores de enviado,
 * entregado y pendiente.
 *
 * Uso: abrir una conversación (mejor un grupo con texto, fotos con
 * descripción y mensajes enviados) con RF-04 activada. Abrir las
 * herramientas de desarrollo (F12) → Consola, pegar este archivo completo y
 * pulsar Intro.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No hace peticiones ni guarda nada.
 * - No muestra textos, nombres, `data-id`, `data-pre-plain-text`, `title`,
 *   `aria-label`, `alt` ni direcciones. Del texto solo indica su longitud y si
 *   tiene formato de hora o si solo contiene emojis (sin mostrarlos). De las
 *   imágenes, solo el tipo de origen (`blob`,
 *   `data:image/jpeg`, dominio…).
 * - Para localizar el nombre del remitente, compara cada texto con el nombre
 *   incluido en `data-pre-plain-text` y solo indica si coincide.
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  const MAXIMO_MENSAJES = 8;
  const MAXIMO_NODOS = 60;
  const contenedores = [...document.querySelectorAll('#main [data-testid="msg-container"]')];

  const difuminado = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return true;
    }
    return false;
  };

  /** Elemento que lleva el `filter` (él mismo o un antecesor), o `null`. */
  const origenFiltro = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return actual;
    }
    return null;
  };

  /** Reglas de Veilix que alcanzan al elemento (solo nombres de regla, sin contenido). */
  const REGLAS = [
    ['RF-01-ENCABEZADO', '#main header :is(span[dir="auto"], span[title])'],
    ['RF-01-LISTA', '[data-veilix-nombre]'],
    ['RF-04-TEXTO', '#main :is([data-testid="msg-container"], .message-in, .message-out) :is([data-pre-plain-text], .selectable-text)'],
  ];
  const reglasQueAlcanzan = (elemento) =>
    REGLAS.filter(([, selector]) => {
      try {
        return elemento.matches(selector) || elemento.closest(selector) !== null;
      } catch {
        return false;
      }
    }).map(([nombre]) => nombre);

  const tipoOrigen = (src) => {
    if (!src) return 'sin src';
    if (src.startsWith('blob:')) return 'blob';
    if (src.startsWith('data:')) return src.slice(0, src.indexOf(';') > 0 ? src.indexOf(';') : 15);
    try {
      return new URL(src, document.baseURI).hostname;
    } catch {
      return 'no válida';
    }
  };

  /** Nombre del remitente según `data-pre-plain-text` («[hora, fecha] Nombre: »). Nunca se muestra. */
  const remitenteDe = (contenedor) => {
    const bloque = contenedor.querySelector('[data-pre-plain-text]');
    const valor = bloque?.getAttribute('data-pre-plain-text') ?? '';
    return /\]\s*(.+?):\s*$/.exec(valor)?.[1]?.trim() ?? null;
  };

  const textoPropio = (elemento) =>
    [...elemento.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join('')
      .trim();

  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');

  /**
   * Nombre de un icono SVG (`<title>` hijo directo). Solo se muestra si tiene
   * la forma de un identificador de icono de WhatsApp (`wds-ic-…`).
   */
  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    if (!titulo) return 'sin título';
    const texto = titulo.textContent.trim();
    return /^wds-ic-[a-z0-9-]+$/.test(texto) ? texto : `otro título (${texto.length})`;
  };

  /** Etiqueta de accesibilidad de estado: solo se muestra si es una palabra de estado conocida. */
  const etiquetaEstado = (elemento) => {
    const etiqueta = elemento.getAttribute('aria-label');
    if (etiqueta === null) return null;
    const limpia = etiqueta.trim();
    return /^(le[ií]do|entregado|enviado|pendiente|read|delivered|sent|pending)$/i.test(limpia)
      ? `«${limpia}»`
      : `aria-label(${limpia.length})`;
  };

  const describir = (elemento, remitente) => {
    const partes = [elemento.tagName.toLowerCase() + clasesSemanticas(elemento)];
    for (const atributo of ['role', 'data-testid', 'data-icon', 'dir']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${valor}]`);
    }
    for (const atributo of ['data-pre-plain-text', 'aria-label', 'title', 'tabindex', 'contenteditable']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    if (elemento.tagName === 'IMG') partes.push(`origen=${tipoOrigen(elemento.getAttribute('src'))}`);
    if (elemento.localName === 'svg') partes.push(`título=${tituloIcono(elemento)}`);
    if (elemento.hasAttribute('aria-label') && elemento.closest('[data-testid="msg-meta"]')) {
      partes.push(`estado=${etiquetaEstado(elemento)}`);
    }
    if (elemento.hasAttribute('data-veilix-estado-mensaje')) partes.push('MARCADO-ESTADO');
    if (elemento.tagName === 'IMG' && /\p{Extended_Pictographic}/u.test(elemento.getAttribute('alt') ?? '')) partes.push('ALT-EMOJI');
    if (elemento.hasAttribute('data-veilix-hora-mensaje')) partes.push('MARCADO-HORA');
    if (elemento.hasAttribute('data-veilix-reaccion')) partes.push('MARCADO-REACCION');
    const texto = textoPropio(elemento);
    if (texto) {
      partes.push(`texto(${texto.length})`);
      if (/^\d{1,2}[:.]\d{2}/.test(texto)) partes.push('PARECE-HORA');
      if (remitente && texto === remitente) partes.push('COINCIDE-CON-REMITENTE');
      if (/\p{Extended_Pictographic}/u.test(texto) && /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Emoji_Component}|[\s\d+.,·])+$/u.test(texto)) {
        partes.push('SOLO-EMOJI');
      }
    }
    const reglas = reglasQueAlcanzan(elemento);
    if (reglas.length > 0) partes.push(`REGLAS=${reglas.join('+')}`);
    if (elemento.closest('header')) partes.push('DENTRO-DE-HEADER');
    const filtro = origenFiltro(elemento);
    if (filtro && filtro !== elemento) {
      partes.push(`· difuminado (filtro en ${filtro.tagName.toLowerCase()}${filtro.getAttribute('data-testid') ? `[data-testid=${filtro.getAttribute('data-testid')}]` : ''})`);
    } else {
      partes.push(filtro ? '· difuminado' : '· visible');
    }
    return partes.join(' ');
  };

  const esqueleto = (contenedor) => {
    const remitente = remitenteDe(contenedor);
    const lineas = [];
    const recorrer = (elemento, nivel) => {
      if (lineas.length >= MAXIMO_NODOS) return;
      lineas.push(`${'  '.repeat(nivel)}${describir(elemento, remitente)}`);
      if (elemento.tagName.toLowerCase() === 'svg') return;
      for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
    };
    recorrer(contenedor, 0);
    return lineas.join('\n');
  };

  const resumen = contenedores.map((contenedor, indice) => {
    const prefijo = contenedor.closest('[data-id]')?.getAttribute('data-id') ?? '';
    const bloques = [...contenedor.querySelectorAll('[data-pre-plain-text]')];
    return {
      mensaje: indice + 1,
      direccion: prefijo.startsWith('true_') ? 'enviado' : prefijo.startsWith('false_') ? 'recibido' : '?',
      bloquesTexto: bloques.length,
      selectableFueraDeBloque: [...contenedor.querySelectorAll('.selectable-text')].filter(
        (e) => !e.closest('[data-pre-plain-text]'),
      ).length,
      imagenes: [...contenedor.querySelectorAll('img')].map((i) => `${tipoOrigen(i.getAttribute('src'))}${difuminado(i) ? ' (dif.)' : ''}`).join(', ') || '—',
      videoCanvas: contenedor.querySelectorAll('video, canvas').length,
      iconos: [...contenedor.querySelectorAll('[data-icon]')].map((i) => `${i.getAttribute('data-icon')}${difuminado(i) ? ' (dif.)' : ''}`).join(', ') || '—',
      botones: contenedor.querySelectorAll('button, [role="button"]').length,
      horaDentroDelBloque: bloques.some((b) =>
        [...b.querySelectorAll('*')].some((e) => /^\d{1,2}[:.]\d{2}/.test(textoPropio(e))),
      ),
      textoDifuminado: bloques.length > 0 && bloques.every(difuminado),
    };
  });

  /** Iconos por nombre de `data-icon`: total y cuántos están difuminados (solo nombres). */
  /** SVG por nombre (`<title>`): total, difuminados y marcados por Veilix como estado. */
  const resumenTitulos = (selector) => {
    const recuento = {};
    for (const svg of document.querySelectorAll(`${selector} svg`)) {
      const nombre = tituloIcono(svg);
      recuento[nombre] ??= { total: 0, difuminados: 0, marcadosEstado: 0 };
      recuento[nombre].total++;
      if (difuminado(svg)) recuento[nombre].difuminados++;
      if (svg.hasAttribute('data-veilix-estado-vista-previa') || svg.hasAttribute('data-veilix-estado-mensaje')) {
        recuento[nombre].marcadosEstado++;
      }
    }
    return recuento;
  };

  /** Contenido de cada `msg-meta`: iconos (por nombre) y etiquetas de estado. */
  const resumenMeta = () =>
    [...document.querySelectorAll('#main [data-testid="msg-meta"]')].map((meta, indice) => ({
      meta: indice + 1,
      direccion: (() => {
        const prefijo = meta.closest('[data-id]')?.getAttribute('data-id') ?? '';
        return prefijo.startsWith('true_') ? 'enviado' : prefijo.startsWith('false_') ? 'recibido' : '?';
      })(),
      iconos: [...meta.querySelectorAll('svg')].map((svg) => `${tituloIcono(svg)}${difuminado(svg) ? ' (dif.)' : ''}`).join(', ') || '—',
      etiquetas: [meta, ...meta.querySelectorAll('[aria-label]')]
        .map(etiquetaEstado)
        .filter((e) => e !== null)
        .join(', ') || '—',
    }));

  const resumenIconos = (selector) => {
    const recuento = {};
    for (const icono of document.querySelectorAll(`${selector} [data-icon]`)) {
      const nombre = icono.getAttribute('data-icon');
      recuento[nombre] ??= { total: 0, difuminados: 0 };
      recuento[nombre].total++;
      if (difuminado(icono)) recuento[nombre].difuminados++;
    }
    return recuento;
  };

  console.log(`Veilix · diagnóstico anonimizado de mensajes: ${contenedores.length} contenedor(es) en #main.`);
  console.log('Veilix · iconos de la lista de chats (#pane-side), por nombre:');
  console.table(resumenIconos('#pane-side'));
  console.log('Veilix · iconos de la conversación (#main), por nombre:');
  console.table(resumenIconos('#main'));
  console.log('Veilix · iconos SVG por nombre (<title>) en la lista de chats (#pane-side):');
  console.table(resumenTitulos('#pane-side'));
  console.log('Veilix · iconos SVG por nombre (<title>) en la conversación (#main):');
  console.table(resumenTitulos('#main'));
  console.log('Veilix · contenido de cada msg-meta (iconos y etiquetas de estado):');
  console.table(resumenMeta());
  console.table(resumen);
  const detalle = contenedores
    .slice(0, MAXIMO_MENSAJES)
    .map((c, i) => `── Mensaje ${i + 1} ──\n${esqueleto(c)}`)
    .join('\n\n');
  console.log(
    'Veilix · resumen (JSON):\n' +
      JSON.stringify(
        {
          mensajes: resumen,
          iconosLista: resumenIconos('#pane-side'),
          iconosConversacion: resumenIconos('#main'),
          svgLista: resumenTitulos('#pane-side'),
          svgConversacion: resumenTitulos('#main'),
          metas: resumenMeta(),
        },
        null,
        2,
      ) +
      '\n\nVeilix · estructura anonimizada:\n' +
      detalle,
  );
})();

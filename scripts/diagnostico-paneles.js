/* global document, getComputedStyle, console -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de paneles con listas de contactos fuera de la lista
 * de chats («Nuevo chat», participantes de un grupo, reenvío…), para RF-01 y
 * RF-02.
 *
 * Uso: con RF-01 y RF-02 activadas, abre el panel que quieras revisar (por
 * ejemplo, «Nuevo chat»), abre las herramientas de desarrollo (F12) →
 * Consola, pega este archivo completo y pulsa Intro.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No hace peticiones ni guarda nada.
 * - No muestra textos, nombres, `title`, `aria-label`, `alt` ni direcciones.
 *   Del texto solo indica su longitud. De los SVG, solo los nombres con forma
 *   `wds-ic-…` y su estructura (`mask`, `image`, `foreignObject`).
 * - Revisa el resultado antes de compartirlo.
 *
 * Muestra tres tablas: las filas candidatas por rol; desde cada avatar, el
 * motivo por el que Veilix reconoce o no su fila como fila de contacto; y,
 * en «Nuevo chat», qué `span[dir][title]` de cada fila se marca como nombre.
 * Los valores de `data-testid` se anonimizan.
 */
(() => {
  /** `data-testid` anonimizado: números como «#» y nada tras «@» (podrían ser identificadores). */
  const limpiarTestId = (valor) => valor.replace(/@.*$/, '@…').replace(/\d+/g, '#');
  const MAXIMO_FILAS = 25;
  const CANDIDATA = ':is([role="listitem"], [role="row"], [role="button"], [role="option"], [role="gridcell"])';
  const AVATAR_SVG = 'svg:not([data-icon] svg):has(mask):has(image, foreignObject)';

  const difuminado = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return true;
    }
    return false;
  };

  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    if (!titulo) return null;
    const texto = titulo.textContent.trim();
    return /^wds-ic-[a-z0-9-]+$/.test(texto) ? texto : `otro título (${texto.length})`;
  };

  const describir = (elemento) => {
    const partes = [elemento.tagName.toLowerCase()];
    if (['app', 'side', 'main', 'pane-side'].includes(elemento.id)) partes.push(`#${elemento.id}`);
    for (const atributo of ['role', 'data-testid', 'data-animate-drawer', 'data-tab']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    if (elemento.hasAttribute('aria-label')) partes.push('[aria-label]');
    if (elemento.hasAttribute('tabindex')) partes.push('[tabindex]');
    return partes.join('');
  };

  const ascendencia = (elemento) => {
    const cadena = [];
    for (let actual = elemento.parentElement; actual && actual !== document.body && cadena.length < 10; actual = actual.parentElement) {
      cadena.push(describir(actual));
    }
    return cadena.join(' < ');
  };

  const marcas = (elemento) =>
    ['data-veilix-fila-contacto', 'data-veilix-fila-contacto-fotos']
      .filter((atributo) => elemento.hasAttribute(atributo))
      .map((atributo) => atributo.replace('data-veilix-', ''))
      .join(' ') || '—';

  const filas = [...document.querySelectorAll(CANDIDATA)]
    .filter((elemento) => !elemento.closest('#pane-side, #main'))
    .filter((elemento) => elemento.querySelector('svg, img, span[title], span[dir]'))
    // Solo las candidatas más internas, para no repetir contenedores.
    .filter((elemento) => !elemento.querySelector(CANDIDATA));

  const resumen = filas.slice(0, MAXIMO_FILAS).map((fila, indice) => {
    const svgs = [...fila.querySelectorAll('svg')];
    const avatares = svgs.filter((svg) => svg.matches(AVATAR_SVG));
    const titulos = [...fila.querySelectorAll('span[title]')];
    const textosDir = [...fila.querySelectorAll('span[dir]')];
    const primerTitulo = titulos[0];
    return {
      fila: indice + 1,
      elemento: describir(fila),
      ascendencia: ascendencia(fila),
      avataresSvg: avatares.length,
      estructuraAvatares: avatares.map((svg) => ['mask', 'circle', 'image', 'foreignObject'].filter((e) => svg.querySelector(e)).join('+')).join(', ') || '—',
      imagenes: fila.querySelectorAll('img').length,
      iconos: svgs.filter((svg) => !avatares.includes(svg)).map((svg) => tituloIcono(svg) ?? 'sin título').join(', ') || '—',
      spanTitle: titulos.map((t) => `${t.getAttribute('dir') ? 'dir+' : ''}title(${t.textContent.trim().length})`).join(', ') || '—',
      spanDir: textosDir.length,
      marcasFila: marcas(fila) + (fila.closest('[data-veilix-fila-contacto]') && !fila.hasAttribute('data-veilix-fila-contacto') ? ' (dentro de fila marcada)' : ''),
      nombreMarcado: fila.querySelector('[data-veilix-nombre-contacto]') !== null,
      primerTituloDifuminado: primerTitulo ? (difuminado(primerTitulo) ? 'sí' : 'NO') : '—',
      avatarDifuminado: avatares.length > 0 ? avatares.map((a) => (difuminado(a) ? 'sí' : 'NO')).join(', ') : '—',
    };
  });

  // Análisis desde cada avatar: por qué su fila se reconoce o no como fila de contacto
  // (mismas condiciones que `esFilaContacto` en `marcador-nombres.ts`).
  const ROLES_ADMITIDOS = ':is([role="listitem"], [role="row"], [role="button"])';
  const contieneIcono = (elemento) => elemento.matches('[data-icon], [data-icon] *') || elemento.querySelector('[data-icon], svg') !== null;
  const avataresFuera = [...document.querySelectorAll('svg')]
    .filter((svg) => svg.matches(AVATAR_SVG))
    .filter((svg) => !svg.closest('#pane-side, #main'));
  const porAvatar = avataresFuera.slice(0, MAXIMO_FILAS).map((svg, indice) => {
    const filaAdmitida = svg.parentElement?.closest(ROLES_ADMITIDOS) ?? null;
    let conRol = svg.parentElement;
    while (conRol && !conRol.hasAttribute('role')) conRol = conRol.parentElement;
    const avataresEnFila = filaAdmitida ? [...filaAdmitida.querySelectorAll('svg')].filter((s) => s.matches(AVATAR_SVG)).length : 0;
    const titulos = filaAdmitida ? [...filaAdmitida.querySelectorAll('span[title]')] : [];
    const nombre = titulos.find((t) => !contieneIcono(t));
    let motivo = 'reconocida';
    if (!filaAdmitida) motivo = `sin antecesor con role listitem/row/button (rol más cercano: ${conRol ? conRol.getAttribute('role') : 'ninguno'})`;
    else if (avataresEnFila !== 1) motivo = `la fila contiene ${avataresEnFila} avatares (se exige 1)`;
    else if (titulos.length === 0) motivo = 'la fila no tiene span[title]';
    else if (!nombre) motivo = 'todos los span[title] de la fila contienen iconos';
    const textosSinTitle = filaAdmitida
      ? [...filaAdmitida.querySelectorAll('span[dir="auto"]:not([title])')].filter((e) => e.textContent.trim() !== '').length
      : 0;
    return {
      avatar: indice + 1,
      estructura: ['mask', 'circle', 'image', 'foreignObject'].filter((e) => svg.querySelector(e)).join('+'),
      avatarDifuminado: difuminado(svg) ? 'sí' : 'NO',
      filaAdmitida: filaAdmitida ? describir(filaAdmitida) : '—',
      ascendenciaFila: filaAdmitida ? ascendencia(filaAdmitida) : ascendencia(svg),
      avataresEnFila,
      spanTitle: titulos.length,
      spanDirSinTitle: textosSinTitle,
      motivo,
      filaMarcada: filaAdmitida?.closest('[data-veilix-fila-contacto]') ? 'sí' : 'NO',
      nombreMarcado: filaAdmitida?.querySelector('[data-veilix-nombre-contacto]') ? 'sí' : 'NO',
      nombreDifuminado: nombre ? (difuminado(nombre) ? 'sí' : 'NO') : '—',
    };
  });

  // «Nuevo chat» (estructura confirmada): qué `span[dir][title]` marca Veilix como nombre en cada fila.
  const filasNuevoChat = [...document.querySelectorAll('[data-testid="new-chat-drawer"] [role="listitem"][data-testid^="list-item-"]')];
  const nuevoChat = filasNuevoChat.slice(0, MAXIMO_FILAS).map((fila, indice) => {
    const candidatos = [...fila.querySelectorAll('span[dir][title]')];
    const marcado = fila.querySelector('[data-veilix-nombre-nuevo-chat]');
    return {
      fila: indice + 1,
      esAccion: fila.matches('[data-testid^="new-chat-drawer-new-"]') || fila.querySelector('[data-testid^="new-chat-drawer-new-"]') !== null ? 'sí' : 'no',
      spanDirTitle: candidatos.length,
      longitudes: candidatos.map((c) => c.textContent.trim().length).join(', ') || '—',
      spanTitleSinDir: fila.querySelectorAll('span[title]:not([dir])').length,
      posicionMarcada: marcado ? candidatos.indexOf(marcado) + 1 : '—',
      filaMarcada: fila.hasAttribute('data-veilix-fila-nuevo-chat') ? 'sí' : 'NO',
      nombreDifuminado: marcado ? (difuminado(marcado) ? 'sí' : 'NO') : '—',
      otrosDifuminados: candidatos.filter((c) => c !== marcado && difuminado(c)).length,
      // Información secundaria: textos visibles de la fila distintos del nombre (sin mostrar su contenido).
      textosSinProteger:
        [...fila.querySelectorAll('*')]
          .filter((e) => !e.closest('svg') && e !== marcado && !marcado?.contains(e) && !e.contains(marcado ?? null))
          .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() !== ''))
          .filter((e) => !difuminado(e))
          .map((e) => {
            const etiqueta = `${e.tagName.toLowerCase()}${e.hasAttribute('dir') ? '[dir]' : ''}${e.hasAttribute('title') ? '[title]' : ''}`;
            const enCelda = e.closest('[role="gridcell"]') ? 'gridcell' : 'fuera de gridcell';
            return `${etiqueta}(${e.textContent.trim().length}, ${enCelda})`;
          })
          .join(' | ') || '—',
    };
  });

  console.log(`Veilix · diagnóstico anonimizado de paneles: ${filas.length} fila(s) candidata(s) fuera de la lista de chats y de la conversación.`);
  console.table(resumen);
  console.log(`Veilix · ${avataresFuera.length} avatar(es) fuera de la lista de chats y de la conversación, con el motivo por el que su fila se reconoce o no:`);
  console.table(porAvatar);
  console.log(`Veilix · «Nuevo chat»: ${filasNuevoChat.length} fila(s) [role=listitem][data-testid^=list-item-] (nombre marcado y su posición entre los span[dir][title]):`);
  console.table(nuevoChat);
  console.log('Veilix · resumen (JSON):\n' + JSON.stringify({ filas: resumen, avatares: porAvatar, nuevoChat }, null, 2));
})();

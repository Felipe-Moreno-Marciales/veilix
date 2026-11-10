/* global document, getComputedStyle, console, URL, Node, window, setTimeout -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de la lista de sugerencias de menciones (`@`) de un
 * grupo de WhatsApp Web (RF-01 y RF-02).
 *
 * No supone la estructura. Busca el contenedor de sugerencias por varios
 * indicios independientes y dice cuál lo encontró:
 * - los atributos ARIA del editor (`aria-controls`, `aria-owns`,
 *   `aria-activedescendant`);
 * - `role="listbox"` y `data-testid` que mencionan mención, sugerencia o
 *   autocompletado;
 * - el antecesor común más cercano de dos o más avatares visibles fuera de la
 *   lista de chats, del encabezado y de los mensajes;
 * - un texto genérico «todos» / «everyone» de una lista cerrada.
 * Del contenedor muestra su posición (dentro o fuera de `#main footer`), sus
 * filas (participantes, la opción «todos» y su selección), una tabla de
 * textos, avatares y controles, las reglas de Veilix que alcanzan cada uno,
 * las marcas de Veilix, dónde está el filtro y si hay dos filtros apilados,
 * y una estructura DOM anonimizada.
 *
 * Uso:
 * 1. Con RF-01 y RF-02 activadas, abre un grupo y escribe solo `@` en el
 *    campo de mensajes, para que la lista muestre a todos los participantes.
 * 2. Abre las herramientas de desarrollo (F12) → Consola, pega este archivo
 *    completo y pulsa Intro. Deja el cursor del ratón fuera de la lista y no
 *    pulses ninguna tecla.
 * 3. Si la lista se cierra al pasar a la consola, el diagnóstico lo indica y
 *    se repite solo una vez a los 8 segundos: en ese tiempo, haz clic al final
 *    del campo de mensajes (o borra y vuelve a escribir `@`) y aparta el
 *    cursor. Otra opción: en las herramientas de desarrollo, «⋮» → «More
 *    tools» → «Rendering» → «Emulate a focused page», y vuelve a ejecutarlo.
 * 4. Si puedes, repite con la fila de un participante no guardado a la vista
 *    (los que WhatsApp muestra con «~» o con su número).
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No modifica la página, no mueve
 *   el foco, no pulsa teclas, no selecciona ninguna sugerencia, no descarga
 *   nada ni hace peticiones.
 * - No muestra nombres, teléfonos, el texto del campo de mensajes, `id`,
 *   `data-id`, `title`, `aria-label`, `alt`, direcciones ni la ruta de la
 *   página. Solo muestran su texto los textos genéricos de una lista cerrada
 *   («todos», «everyone», «Tú»…). Del resto, la longitud y su forma (parece
 *   teléfono, empieza por «~» o «@», coincide con su `title` o con el nombre
 *   del chat), comparadas en el navegador sin mostrarlas.
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
  const MAXIMO_FILAS_EN_ESQUELETO = 4;
  const RETRASO_MS = 8000;
  /** Textos genéricos de la lista de menciones (español e inglés). Cualquier otro texto se anonimiza. */
  const GENERICOS = new Set([
    '@', 'todos', '@todos', 'everyone', '@everyone', 'all', '@all', 'mencionar a todos', 'menciona a todos', 'mention everyone',
    'todos los participantes', 'all participants', 'notificar a todos', 'notify everyone', 'tú', 'you', 'admin', 'admin.',
    'administrador', 'administradora', 'admin. del grupo', 'admin del grupo', 'group admin', 'mencionar', 'mention', 'menciones',
    'mentions', 'participantes', 'participants', 'miembros', 'members', 'contactos', 'contacts', 'sin resultados', 'no results',
  ]);
  const ES_TODOS = /^@?(todos|everyone|all|mencionar a todos|menciona a todos|mention everyone|todos los participantes|all participants|notificar a todos|notify everyone)$/i;
  const TESTID_SUGERENCIAS = /mention|suggest|autocomplete|typeahead|tag-?list|popup|picker/i;

  const CAMPO_ENTRADA = '#main footer :is([contenteditable="true"], [contenteditable=""], [role="textbox"])';
  const AVATAR = [
    'svg:not([data-icon] svg):has(mask):has(image, foreignObject)',
    'img:not([data-icon] img)',
    '[data-icon^="default-user"], [data-icon^="default-group"], [data-icon^="default-contact"], [data-icon^="default-community"]',
    '[style*="pps.whatsapp.net"]',
  ].join(', ');
  const FUERA_DE_LA_BUSQUEDA = '#pane-side, #main header, [data-testid="conversation-panel-messages"], [data-testid="drawer-right"], [data-testid="new-chat-drawer"]';

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
  const tituloCercano = (elemento) => normalizar(elemento.closest('[title]')?.getAttribute('title') ?? '');
  const describirTexto = (texto, elemento) => {
    if (GENERICOS.has(texto.toLowerCase())) return `GENÉRICO=«${texto}»`;
    const partes = [`texto(${texto.length})`];
    const digitos = texto.replace(/\D/g, '');
    if (/^[+~\s]*[\d\s().-]{7,}$/.test(texto) && digitos.length >= 6) partes.push('PARECE-TELÉFONO');
    else if (digitos.length >= 6) partes.push('CONTIENE-6-O-MÁS-DÍGITOS');
    if (/^~/.test(texto)) partes.push('EMPIEZA-POR-TILDE');
    if (/^@/.test(texto)) partes.push('EMPIEZA-POR-ARROBA');
    if (nombreDelChat && texto === nombreDelChat) partes.push('COINCIDE-CON-EL-NOMBRE-DEL-CHAT');
    const titulo = tituloCercano(elemento);
    if (titulo) partes.push(titulo === texto ? 'COINCIDE-CON-SU-TITLE' : 'DISTINTO-DE-SU-TITLE');
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
      if (host === 'web.whatsapp.com') return 'web.whatsapp.com';
      return /(^|\.)(whatsapp\.(net|com)|fbcdn\.net)$/.test(host) ? 'recurso de WhatsApp' : 'otro dominio';
    } catch {
      return 'no válida';
    }
  };
  const tipoImagenCss = (valor) => {
    if (!valor || valor === 'none' || valor === 'normal') return null;
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

  // Reglas de Veilix que pueden alcanzar estos elementos (mismos selectores que `selectores.ts` y los módulos).
  const REGLAS = [
    ['RF-01 lista de chats (marca)', '#pane-side [data-veilix-nombre]'],
    ['RF-01 encabezado', '#main header :is(span[dir="auto"], span[title])'],
    ['RF-01 autor', '#main [data-testid="author"]'],
    ['RF-01 remitente (marca)', '[data-veilix-remitente]'],
    ['RF-01 fila de contacto (marca)', '[data-veilix-fila-contacto] [data-veilix-nombre-contacto]'],
    ['RF-01 «Nuevo chat» (marca)', '[data-veilix-fila-nuevo-chat] :is([data-veilix-nombre-nuevo-chat], [data-veilix-info-nuevo-chat])'],
    ['RF-02 foto de perfil', ':is(img[src*="pps.whatsapp.net"], [style*="pps.whatsapp.net"], img[src*="/t61.24694-24/"], [style*="/t61.24694-24/"])'],
    ['RF-02 foto de perfil SVG', 'svg:not([data-icon] svg):has(image[*|href*="pps.whatsapp.net"], image[*|href*="/t61.24694-24/"])'],
    ['RF-02 avatar SVG', 'svg:not([data-icon] svg):has(mask):has(image, foreignObject)'],
    ['RF-02 avatar predeterminado', '[data-icon^="default-user"], [data-icon^="default-group"], [data-icon^="default-contact"], [data-icon^="default-community"]'],
    ['RF-02 fila de contacto (marca)', '[data-veilix-fila-contacto-fotos] :is(svg, img, [data-icon])'],
    ['RF-04 recuadro «Responder»', '#main footer [data-testid="quoted-message"]'],
    ['RF-05 campo de entrada', CAMPO_ENTRADA],
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
      .join(' + ') || 'NINGUNA';
  const marcasVeilix = (elemento) => {
    const marcas = new Set();
    for (let actual = elemento; actual; actual = actual.parentElement) {
      for (const atributo of actual.getAttributeNames()) if (atributo.startsWith('data-veilix-')) marcas.add(atributo.replace('data-veilix-', ''));
    }
    return [...marcas].join(', ') || '—';
  };
  /** Dónde está el filtro y cuántos hay apilados en la cadena de antecesores. */
  const filtroEn = (elemento) => {
    const filtros = [];
    for (let actual = elemento, niveles = 0; actual; actual = actual.parentElement, niveles++) {
      const filtro = getComputedStyle(actual).filter;
      if (filtro !== 'none') filtros.push(niveles === 0 ? `propio ${filtro}` : `antecesor (${niveles} arriba) ${filtro}`);
    }
    if (filtros.length === 0) return 'NO difuminado';
    return filtros.length > 1 ? `FILTRO-DOBLE: ${filtros.join(' | ')}` : filtros[0];
  };
  const difuminado = (elemento) => filtroEn(elemento) !== 'NO difuminado';

  const describir = (elemento) => {
    const partes = [elemento.localName + clasesSemanticas(elemento)];
    for (const atributo of ['role', 'data-testid', 'data-icon', 'tabindex', 'dir', 'aria-selected', 'aria-checked', 'aria-disabled', 'aria-expanded', 'aria-autocomplete', 'aria-haspopup', 'contenteditable']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['id', 'data-id', 'aria-label', 'title', 'alt', 'href', 'style', 'aria-controls', 'aria-owns', 'aria-activedescendant']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    for (const atributo of elemento.getAttributeNames()) {
      if (atributo.startsWith('data-veilix-')) partes.push(`[${atributo}]`);
    }
    if (elemento.localName === 'svg') partes.push(` título=${tituloIcono(elemento)}`);
    if (elemento.localName === 'img') partes.push(` origen=${tipoOrigen(elemento.currentSrc || elemento.getAttribute('src'))}`);
    const estilo = getComputedStyle(elemento);
    const fondo = tipoImagenCss(estilo.backgroundImage);
    if (fondo) partes.push(` fondo=${fondo}`);
    if (estilo.position === 'fixed' || estilo.position === 'absolute') partes.push(` POSICIÓN-${estilo.position === 'fixed' ? 'FIJA' : 'ABSOLUTA'}`);
    // Nunca el texto del campo de mensajes, ni siquiera su forma.
    const texto = elemento.closest(CAMPO_ENTRADA) ? '' : textoPropio(elemento);
    if (texto) partes.push(` ${describirTexto(texto, elemento)}`);
    return partes.join('');
  };

  const visible = (e) => {
    const caja = e.getBoundingClientRect();
    return caja.width > 0 && caja.height > 0 && caja.bottom > 0 && caja.top < window.innerHeight;
  };
  const ascendencia = (elemento) => {
    const lista = [];
    for (let actual = elemento.parentElement; actual && actual !== document.body && lista.length < 10; actual = actual.parentElement) lista.push(describir(actual));
    return lista.join(' < ') || '(body)';
  };
  const zona = (elemento) => {
    if (elemento.closest('#main footer')) return 'dentro de #main footer';
    if (elemento.closest('#main')) return 'dentro de #main (fuera del footer)';
    return 'fuera de #main';
  };
  const porId = (id) => (id ? document.getElementById(id) : null);

  const ejecutar = (intento) => {
    const editor = document.querySelector(CAMPO_ENTRADA);
    const estilos = [...document.querySelectorAll('style[data-veilix-estilo]')].map((e) => e.getAttribute('data-veilix-estilo'));

    // 1) Candidatos a contenedor, cada uno con el indicio que lo encontró.
    const candidatos = new Map();
    const anadir = (elemento, indicio) => {
      if (!elemento || !visible(elemento) || elemento.closest(FUERA_DE_LA_BUSQUEDA) || elemento.matches(CAMPO_ENTRADA)) return;
      candidatos.set(elemento, [...(candidatos.get(elemento) ?? []), indicio]);
    };
    for (const atributo of ['aria-controls', 'aria-owns']) {
      for (const id of (editor?.getAttribute(atributo) ?? '').split(/\s+/)) anadir(porId(id), `editor ${atributo}`);
    }
    const activo = porId(editor?.getAttribute('aria-activedescendant'));
    anadir(activo?.closest('[role="listbox"], [role="list"], [role="menu"], [role="grid"]') ?? activo?.parentElement ?? null, 'editor aria-activedescendant');
    for (const lista of document.querySelectorAll('[role="listbox"]')) anadir(lista, 'role=listbox');
    for (const e of document.querySelectorAll('[data-testid]')) if (TESTID_SUGERENCIAS.test(e.getAttribute('data-testid'))) anadir(e, `data-testid=${limpiarTestId(e.getAttribute('data-testid'))}`);
    const avatares = [...document.querySelectorAll(AVATAR)].filter((a) => visible(a) && !a.closest(FUERA_DE_LA_BUSQUEDA));
    for (const avatar of avatares) {
      for (let actual = avatar.parentElement; actual && actual !== document.body; actual = actual.parentElement) {
        if (avatares.filter((otro) => actual.contains(otro)).length >= 2) {
          anadir(actual, 'antecesor común de 2 o más avatares');
          break;
        }
      }
    }
    for (const e of document.querySelectorAll('body *')) {
      if (ES_TODOS.test(textoPropio(e)) && visible(e) && !e.closest(CAMPO_ENTRADA)) {
        const fila = e.closest('[role="option"], [role="listitem"], [role="row"], [role="button"], [role="menuitem"]');
        anadir(fila?.parentElement ?? null, 'texto genérico «todos»');
      }
    }

    // Contenedor elegido: el que reúne más indicios; a igualdad, el que contiene más avatares; después, el más interno.
    const lista = [...candidatos.entries()].map(([elemento, indicios]) => ({
      elemento,
      indicios: [...new Set(indicios)],
      avatares: avatares.filter((a) => elemento.contains(a)).length,
    }));
    lista.sort((a, b) => b.indicios.length - a.indicios.length || b.avatares - a.avatares || (a.elemento.contains(b.elemento) ? 1 : -1));
    const elegido = lista[0];

    const resumenCandidatos = lista.slice(0, 6).map((c, i) => ({
      n: i + 1,
      elegido: c === elegido ? 'sí' : 'no',
      indicios: c.indicios.join(' · '),
      avatares: c.avatares,
      zona: zona(c.elemento),
      elemento: describir(c.elemento),
      contieneAlElegido: c !== elegido && elegido && c.elemento.contains(elegido.elemento) ? 'sí' : 'no',
    }));

    const contexto = {
      intento,
      hayConversacion: Boolean(principal),
      veilixCargado: estilos.length > 0,
      estilosDeVeilix: estilos.join(', ') || 'ninguno',
      atajoPulsado: [...document.documentElement.getAttributeNames()].some((a) => a.startsWith('data-veilix-revelar-')),
      paginaConFoco: document.hasFocus(),
      focoEnElEditor: Boolean(editor && (document.activeElement === editor || editor.contains(document.activeElement))),
      editor: editor ? describir(editor) : 'no encontrado',
      editorApuntaConControlsAlContenedor: Boolean(elegido && ['aria-controls', 'aria-owns'].some((a) => (editor?.getAttribute(a) ?? '').split(/\s+/).some((id) => porId(id) === elegido.elemento))),
      activedescendantDentroDelContenedor: Boolean(elegido && activo && elegido.elemento.contains(activo)),
    };

    if (!elegido) {
      console.log('Veilix · menciones: resumen del contexto.');
      console.table([contexto]);
      if (intento === 1) {
        console.log(`Veilix · no se encontró ninguna lista de sugerencias a la vista. Si se cerró al pasar a la consola, haz clic al final del campo de mensajes (o vuelve a escribir «@») y aparta el cursor: el diagnóstico se repite en ${RETRASO_MS / 1000} segundos.`);
        setTimeout(() => ejecutar(2), RETRASO_MS);
      } else {
        console.log('Veilix · tampoco se encontró en el segundo intento. Prueba con «Emulate a focused page» (Rendering) y vuelve a ejecutar el fragmento.');
      }
      return;
    }
    const contenedor = elegido.elemento;

    // 2) Filas: las más externas con un rol de opción o fila; si no hay, los hijos del primer nivel con varios hijos.
    const ROL_FILA = '[role="option"], [role="listitem"], [role="row"], [role="menuitem"], [role="button"]';
    let filas = [...contenedor.querySelectorAll(ROL_FILA)].filter((f) => {
      const superior = f.parentElement.closest(ROL_FILA);
      return !superior || superior === contenedor || !contenedor.contains(superior);
    });
    let origenFilas = 'por rol';
    if (filas.length === 0) {
      let nivel = contenedor;
      while (nivel.children.length === 1) nivel = nivel.children[0];
      filas = [...nivel.children];
      origenFilas = 'hijos del primer nivel con varios hijos (sin rol)';
    }
    filas = filas.filter(visible);

    const elementos = [];
    const tablaFilas = filas.map((fila, i) => {
      const textos = [...fila.querySelectorAll('*')].filter((e) => textoPropio(e) && !e.closest('svg'));
      const esTodos = textos.some((e) => ES_TODOS.test(textoPropio(e)));
      const avataresFila = [...fila.querySelectorAll(AVATAR)];
      for (const e of [fila, ...fila.querySelectorAll('*')]) {
        if (e.parentElement?.closest('svg')) continue;
        const texto = textoPropio(e);
        const imagen = e.localName === 'img' || (e.localName === 'svg' && e.getBoundingClientRect().width >= 16) || tipoImagenCss(getComputedStyle(e).backgroundImage);
        const control = e.matches('button, [role="button"], [role="option"], input');
        if (!texto && !imagen && !control) continue;
        const caja = e.getBoundingClientRect();
        elementos.push({
          fila: i + 1,
          clase: control ? 'control' : imagen ? 'imagen' : 'texto',
          elemento: describir(e),
          tamano: `${Math.round(caja.width)}×${Math.round(caja.height)}`,
          reglas: reglas(e),
          marcasVeilix: marcasVeilix(e),
          filtro: filtroEn(e),
        });
      }
      return {
        fila: i + 1,
        tipo: esTodos ? 'opción «todos»' : avataresFila.length ? 'participante (con avatar)' : 'sin avatar',
        elemento: describir(fila),
        seleccionada: fila.getAttribute('aria-selected') ?? (activo && fila.contains(activo) ? 'activedescendant' : '—'),
        textos: textos.length,
        spanTitle: fila.querySelectorAll('span[title]').length,
        spanDirAuto: fila.querySelectorAll('span[dir="auto"]').length,
        avatares: avataresFila.map((a) => describir(a)).join(' | ') || '—',
        controlesDentro: fila.querySelectorAll('button, [role="button"], input').length,
        filtroEnLaFila: getComputedStyle(fila).filter !== 'none' ? 'SÍ (fila completa)' : 'no',
        marcasVeilix: marcasVeilix(fila),
      };
    });

    // 3) Estructura anonimizada: el contenedor, las primeras filas y la fila «todos».
    const indiceTodos = tablaFilas.findIndex((f) => f.tipo === 'opción «todos»');
    const mostradas = new Set(filas.filter((_, i) => i < MAXIMO_FILAS_EN_ESQUELETO || i === indiceTodos));
    const lineas = [];
    const recorrer = (elemento, nivel) => {
      if (lineas.length >= MAXIMO_NODOS) return;
      if (filas.includes(elemento) && !mostradas.has(elemento)) {
        lineas.push(`${'  '.repeat(nivel)}… (fila ${filas.indexOf(elemento) + 1} omitida)`);
        return;
      }
      lineas.push(`${'  '.repeat(nivel)}${describir(elemento)} · ${difuminado(elemento) ? 'difuminado' : 'visible'}`);
      if (elemento.localName === 'svg') return;
      for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
    };
    recorrer(contenedor, 0);

    const resumen = {
      ...contexto,
      zonaDelContenedor: zona(contenedor),
      indiciosDelContenedor: elegido.indicios.join(' · '),
      filas: filas.length,
      origenDeLasFilas: origenFilas,
      filasDeParticipante: tablaFilas.filter((f) => f.tipo === 'participante (con avatar)').length,
      opcionTodos: indiceTodos >= 0 ? `fila ${indiceTodos + 1}` : 'no encontrada',
      textosNoGenericosVisibles: elementos.filter((e) => e.clase === 'texto' && !/GENÉRICO=/.test(e.elemento) && e.filtro === 'NO difuminado').length,
      textosQueParecenTelefono: elementos.filter((e) => /PARECE-TELÉFONO/.test(e.elemento)).length,
      avataresVisibles: elementos.filter((e) => e.clase === 'imagen' && !/título=(wds-ic-|.*\(nombre de icono\))/.test(e.elemento) && e.filtro === 'NO difuminado').length,
      filtrosDobles: elementos.filter((e) => e.filtro.startsWith('FILTRO-DOBLE')).length,
      controlesDifuminados: elementos.filter((e) => e.clase === 'control' && e.filtro !== 'NO difuminado').length,
    };

    console.log('Veilix · menciones (RF-01 y RF-02): resumen.');
    console.table([resumen]);
    console.log('Veilix · candidatos a contenedor:');
    console.table(resumenCandidatos);
    console.log('Veilix · filas de la lista:');
    console.table(tablaFilas);
    console.log('Veilix · textos, avatares y controles:');
    console.table(elementos);
    console.log(
      'Veilix · resumen (JSON):\n' +
        JSON.stringify({ resumen, candidatos: resumenCandidatos, filas: tablaFilas, elementos }, null, 2) +
        `\n\nVeilix · estructura anonimizada (${zona(contenedor)}):\n  ascendencia: ${ascendencia(contenedor)}\n${lineas.join('\n')}`,
    );
  };

  ejecutar(1);
})();

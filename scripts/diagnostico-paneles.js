/* global document, window, getComputedStyle, console, URL -- fragmento para la consola del navegador */
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
 * Con «Nuevo chat» abierto muestra primero tres tablas para RF-02, con la
 * fila completa `[role="listitem"][data-testid^="list-item-"]` como raíz:
 * A) los hijos del botón de cada fila, con su tamaño y señales visuales;
 * B) los candidatos a avatar: elementos con imagen, SVG, fondo o máscara CSS
 *    (también en pseudoelementos), color de fondo o forma redonda, y lo que el
 *    navegador pinta en la zona del avatar (`elementsFromPoint`), con las
 *    reglas de RF-02 que los alcanzan y dónde está el filtro;
 * C) un resumen por categoría de fila (acción, tú, contacto, posible no
 *    guardado, encabezado) y tipo de elemento.
 * Después, las tablas generales: filas candidatas por rol (el elemento con rol
 * más interno, que en «Nuevo chat» es la celda de texto), avatares SVG fuera
 * de la lista y nombres de «Nuevo chat» (RF-01).
 *
 * Los valores de `data-testid` se anonimizan. De las imágenes y los fondos solo
 * se indica el tipo de origen, nunca la dirección; de los SVG, su estructura y
 * su `<title>` si tiene la forma `wds-ic-…`. No se muestran colores, nombres,
 * números ni `aria-label`. La categoría de fila solo compara textos genéricos
 * de la interfaz («Tú», «Envíate un mensaje») y la forma del nombre («~» o
 * teléfono), sin mostrarlos.
 */
(() => {
  /**
   * `data-testid` anonimizado: números como «#», nada tras «@» y nada tras
   * `list-item-` (podrían ser identificadores).
   */
  const limpiarTestId = (valor) => valor.replace(/^(list-item-).+$/, '$1…').replace(/@.*$/, '@…').replace(/\d+/g, '#');
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

  /** Ruta desde la fila hasta el elemento (sin incluirlo), con a lo sumo 8 niveles. */
  const ascendenciaEnFila = (elemento, fila) => {
    if (elemento === fila) return '(la propia fila)';
    const cadena = [];
    for (let actual = elemento.parentElement; actual && actual !== fila && cadena.length < 8; actual = actual.parentElement) cadena.push(describir(actual));
    return cadena.reverse().join(' › ') || '(directamente en la fila)';
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

  // ─────────────────────────────────────────────────────────────────────────────
  // «Nuevo chat» · avatares (RF-02). La raíz es la fila completa
  // `[role="listitem"][data-testid^="list-item-"]` del panel, no la celda de texto:
  // se examinan todos sus descendientes, incluidos los hermanos de
  // `cell-frame-container`, y lo que el navegador pinta en la zona del avatar.
  // ─────────────────────────────────────────────────────────────────────────────
  const ORIGENES_FOTO_PERFIL = ['pps.whatsapp.net', '/t61.24694-24/'];
  const REGLAS_RF02 = [
    ['FOTO_PERFIL', ORIGENES_FOTO_PERFIL.flatMap((o) => [`img[src*="${o}"]`, `[style*="${o}"]`]).join(', ')],
    ['FOTO_PERFIL_SVG', `svg:not([data-icon] svg):has(${ORIGENES_FOTO_PERFIL.map((o) => `image[*|href*="${o}"]`).join(', ')})`],
    ['AVATAR_SVG', AVATAR_SVG],
    ['AVATAR_PREDETERMINADO', ['default-user', 'default-group', 'default-contact', 'default-community'].map((p) => `[data-icon^="${p}"]`).join(', ')],
    ['FILA_MARCADA_RF02', '[data-veilix-fila-contacto-fotos] *'],
  ];
  const reglasQueAlcanzan = (elemento) =>
    REGLAS_RF02.filter(([, selector]) => {
      try {
        return elemento.matches(selector) || elemento.closest(selector) !== null;
      } catch {
        return false;
      }
    }).map(([nombre]) => nombre).join('+') || 'NINGUNA';

  /** Tipo de origen de una URL, sin mostrarla. */
  const tipoOrigen = (url) => {
    if (!url) return 'sin origen';
    if (url.startsWith('blob:')) return 'blob';
    if (url.startsWith('data:')) return url.slice(0, Math.max(url.indexOf(';'), url.indexOf(',')) > 0 ? Math.min(...[url.indexOf(';'), url.indexOf(',')].filter((n) => n > 0)) : 15);
    if (ORIGENES_FOTO_PERFIL.some((o) => url.includes(o))) return 'foto de perfil (pps)';
    try {
      return /(^|\.)(whatsapp\.(net|com)|fbcdn\.net)$/.test(new URL(url, document.baseURI).hostname) ? 'otro recurso de WhatsApp' : 'otro dominio';
    } catch {
      return 'no válida';
    }
  };
  /** Clasifica un valor CSS de imagen (`background-image`, `mask-image`, `content`) sin mostrar direcciones. */
  const tipoImagenCss = (valor) => {
    if (!valor || valor === 'none' || valor === 'normal' || valor === '""') return null;
    if (/gradient\(/.test(valor)) return 'degradado';
    const url = /url\(["']?([^"')]+)/.exec(valor)?.[1];
    return url ? tipoOrigen(url) : 'otro valor';
  };
  const esRedondo = (elemento, estilo) =>
    /50%/.test(estilo.borderRadius) || (parseFloat(estilo.borderRadius) > 0 && parseFloat(estilo.borderRadius) * 2 >= Math.min(elemento.clientWidth, elemento.clientHeight) - 1);
  const tieneFondoDeColor = (estilo) => estilo.backgroundColor !== 'rgba(0, 0, 0, 0)' && estilo.backgroundColor !== 'transparent';
  const estructuraSvg = (svg) => {
    const partes = ['mask', 'clipPath', 'circle', 'image', 'foreignObject', 'path', 'use'].filter((e) => svg.querySelector(e));
    const caminos = svg.querySelectorAll('path').length;
    return `${partes.join('+') || 'vacío'}${caminos > 1 ? ` (${caminos} paths)` : ''}`;
  };

  /** Señales visuales de un elemento: qué podría estar dibujando un avatar. Sin colores ni direcciones. */
  const senales = (elemento) => {
    const estilo = getComputedStyle(elemento);
    const lista = [];
    if (elemento.localName === 'img') lista.push(`img · ${tipoOrigen(elemento.getAttribute('src'))}`);
    if (elemento.localName === 'svg' && !elemento.parentElement?.closest('svg')) {
      lista.push(`svg · ${estructuraSvg(elemento)} · título ${tituloIcono(elemento) ?? 'ninguno'}`);
    }
    if (elemento.localName === 'video' || elemento.localName === 'canvas') lista.push(elemento.localName);
    const fondo = tipoImagenCss(estilo.backgroundImage);
    if (fondo) lista.push(`fondo CSS · ${fondo}`);
    const mascara = tipoImagenCss(estilo.maskImage || estilo.webkitMaskImage);
    if (mascara) lista.push(`máscara CSS · ${mascara}`);
    for (const pseudo of ['::before', '::after']) {
      const p = getComputedStyle(elemento, pseudo);
      if (p.content && p.content !== 'none' && p.content !== 'normal') {
        const partes = [tipoImagenCss(p.backgroundImage), tipoImagenCss(p.maskImage || p.webkitMaskImage), tipoImagenCss(p.content)].filter(Boolean);
        lista.push(`${pseudo}${partes.length ? ` · ${partes.join(', ')}` : ''}`);
      }
    }
    if (elemento.hasAttribute('data-icon')) lista.push(`data-icon=${elemento.getAttribute('data-icon')}`);
    if (tieneFondoDeColor(estilo)) lista.push('color de fondo');
    if (esRedondo(elemento, estilo)) lista.push('redondo');
    return lista;
  };

  const filtroEn = (elemento, fila) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') {
        return actual === elemento ? 'el propio elemento' : `${describir(actual)}${fila.contains(actual) ? '' : ' (fuera de la fila)'}`;
      }
    }
    return 'NO difuminado';
  };

  // Categorías de fila: solo se comparan textos genéricos de la interfaz; nunca se muestran nombres.
  const ETIQUETA_TU = /^\(?\s*(t[uú]|you)\s*\)?$|^(env[ií]ate un mensaje|message yourself)$/i;
  const pareceTelefono = (texto) => /^\+?[\d\s().\u00a0-]{7,}$/.test(texto) && texto.replace(/\D/g, '').length >= 7;
  const categoriaDe = (fila) => {
    if (fila.matches('[data-testid^="new-chat-drawer-new-"]') || fila.querySelector('[data-testid^="new-chat-drawer-new-"]')) return 'acción';
    const nombre = fila.querySelector('span[dir][title]');
    if (!nombre) return 'encabezado de sección u otra';
    const textos = [...fila.querySelectorAll('span, div')].map((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim()).filter(Boolean);
    if (textos.some((t) => ETIQUETA_TU.test(t))) return 'tú';
    const textoNombre = (nombre.textContent ?? '').trim();
    if (textoNombre.startsWith('~') || pareceTelefono(textoNombre)) return 'contacto posiblemente no guardado';
    return 'contacto';
  };

  const celdaDe = (fila) => fila.querySelector('[data-testid="cell-frame-container"]');
  const zonaDe = (elemento, fila) => {
    const celda = celdaDe(fila);
    if (!celda) return 'fila sin cell-frame-container';
    if (celda.contains(elemento)) return elemento.closest('[role="gridcell"]') ? 'dentro de cell-frame-container · gridcell' : 'dentro de cell-frame-container';
    return 'fuera de cell-frame-container';
  };

  const visibleEnPantalla = (caja) => caja.width > 0 && caja.height > 0 && caja.bottom > 0 && caja.top < window.innerHeight;
  const atajoActivo = document.documentElement.hasAttribute('data-veilix-revelar-fotos');

  const categorias = filasNuevoChat.slice(0, MAXIMO_FILAS).map((fila) => categoriaDe(fila));

  // Tabla A · estructura de cada fila: los hijos directos de su botón (o de la fila), con su tamaño y señales.
  const estructuraFilas = filasNuevoChat.slice(0, MAXIMO_FILAS).map((fila, indice) => {
    const boton = fila.querySelector(':scope > [role="button"]') ?? fila.querySelector('[role="button"]') ?? fila;
    const celda = celdaDe(fila);
    const hijos = [...boton.children].map((hijo) => {
      const caja = hijo.getBoundingClientRect();
      const visuales = [hijo, ...hijo.querySelectorAll('*')].flatMap((e) => senales(e));
      return `${describir(hijo)} ${Math.round(caja.width)}×${Math.round(caja.height)}${hijo === celda || hijo.contains(celda) ? ' (contiene cell-frame-container)' : ''}${visuales.length ? ` [${[...new Set(visuales)].join('; ')}]` : ''}`;
    });
    return {
      fila: indice + 1,
      categoria: categorias[indice],
      bajoElCursor: fila.matches(':hover') ? 'sí (se estaría revelando)' : 'no',
      raiz: describir(boton),
      hijos: hijos.join(' | ') || '—',
    };
  });

  // Tabla B · candidatos a avatar: elementos de la fila con alguna señal visual, más lo pintado en la zona del avatar.
  const candidatosAvatar = filasNuevoChat.slice(0, MAXIMO_FILAS).flatMap((fila, indice) => {
    const enFila = [fila, ...fila.querySelectorAll('*')].filter((e) => !e.parentElement?.closest('svg') || e.localName === 'svg');
    const conSenales = enFila.filter((e) => senales(e).some((s) => s !== 'redondo'));
    // Lo que el navegador pinta a 30 px del borde inicial de la fila (donde suele dibujarse el avatar).
    const caja = fila.getBoundingClientRect();
    const pintados = visibleEnPantalla(caja)
      ? document.elementsFromPoint(document.dir === 'rtl' ? caja.right - 30 : caja.left + 30, caja.top + caja.height / 2)
      : [];
    const enZonaDelAvatar = new Set(pintados.filter((e) => fila.contains(e)));
    const fuera = pintados.filter((e) => !fila.contains(e) && !e.contains(fila)).slice(0, 3);
    const elementos = [...new Set([...conSenales, ...enZonaDelAvatar])].slice(0, 12);
    const filas = elementos.map((e) => {
      const c = e.getBoundingClientRect();
      return {
        fila: indice + 1,
        categoria: categorias[indice],
        elemento: describir(e),
        ruta: ascendenciaEnFila(e, fila),
        zona: zonaDe(e, fila),
        tamano: `${Math.round(c.width)}×${Math.round(c.height)}`,
        senales: senales(e).join('; ') || '—',
        enLaZonaDelAvatar: enZonaDelAvatar.has(e) ? 'sí' : 'no',
        reglasRF02: reglasQueAlcanzan(e),
        difuminado: filtroEn(e, fila),
      };
    });
    if (fuera.length > 0) {
      filas.push({
        fila: indice + 1,
        categoria: categorias[indice],
        elemento: fuera.map((e) => describir(e)).join(' | '),
        ruta: '(pintado en la zona del avatar, FUERA de la fila)',
        zona: 'fuera de la fila',
        tamano: '—',
        senales: fuera.flatMap((e) => senales(e)).join('; ') || '—',
        enLaZonaDelAvatar: 'sí',
        reglasRF02: fuera.map((e) => reglasQueAlcanzan(e)).join(' | '),
        difuminado: fuera.map((e) => filtroEn(e, fila)).join(' | '),
      });
    }
    if (filas.length === 0) {
      filas.push({ fila: indice + 1, categoria: categorias[indice], elemento: visibleEnPantalla(caja) ? 'ningún elemento visual' : 'fila fuera de pantalla (desplázate hasta ella)' });
    }
    return filas;
  });

  // Tabla C · resumen por categoría de fila y tipo de elemento, con los visibles primero.
  const firmas = new Map();
  for (const c of candidatosAvatar.filter((c) => c.senales && c.senales !== '—')) {
    const clave = [c.categoria, c.zona, c.senales.replace(/\b\d+×\d+\b/g, ''), c.reglasRF02].join(' | ');
    const firma = firmas.get(clave) ?? { tipo: clave, elementos: 0, visibles: 0 };
    firma.elementos++;
    if (c.difuminado === 'NO difuminado') firma.visibles++;
    firmas.set(clave, firma);
  }
  const resumenAvatares = [...firmas.values()].sort((a, b) => b.visibles - a.visibles);
  const recuentoCategorias = categorias.reduce((r, c) => ({ ...r, [c]: (r[c] ?? 0) + 1 }), {});

  if (filasNuevoChat.length > 0) {
    console.log(
      `Veilix · «Nuevo chat» (RF-02) · ${filasNuevoChat.length} fila(s) completas [role=listitem]: ${Object.entries(recuentoCategorias).map(([c, n]) => `${n} ${c}`).join(', ')}. ` +
        `Atajo de revelado ${atajoActivo ? 'ACTIVO (suéltalo y repite)' : 'inactivo'}. Aleja el cursor de la lista antes de ejecutar.`,
    );
    console.log('Veilix · A) estructura de cada fila (hijos del botón, tamaño y señales visuales):');
    console.table(estructuraFilas);
    console.log('Veilix · B) candidatos a avatar (con señales visuales o pintados en la zona del avatar), con las reglas de RF-02 y el filtro:');
    console.table(candidatosAvatar);
    console.log('Veilix · C) resumen por categoría y tipo de elemento (los visibles primero):');
    console.table(resumenAvatares);
  } else {
    console.log('Veilix · «Nuevo chat» no está abierto: ábrelo y repite para obtener las tablas de avatares.');
  }

  console.log(`Veilix · (general) ${filas.length} fila(s) candidata(s) fuera de la lista de chats y de la conversación. Atención: esta tabla toma el elemento con rol más interno (en «Nuevo chat», la celda de texto), no la fila completa.`);
  console.table(resumen);
  console.log(`Veilix · (general) ${avataresFuera.length} avatar(es) SVG fuera de la lista de chats y de la conversación, con el motivo por el que su fila se reconoce o no:`);
  console.table(porAvatar);
  console.log(`Veilix · «Nuevo chat» (RF-01): nombre marcado y su posición entre los span[dir][title]:`);
  console.table(nuevoChat);
  console.log(
    'Veilix · resumen (JSON):\n' +
      JSON.stringify({ nuevoChat: { recuentoCategorias, atajoActivo, estructuraFilas, candidatosAvatar, resumenAvatares, nombres: nuevoChat }, general: { filas: resumen, avatares: porAvatar } }, null, 2),
  );
})();

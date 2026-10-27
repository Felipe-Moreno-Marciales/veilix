/* global document, window, getComputedStyle, console, URL, Node -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de los avatares de participantes junto a los
 * mensajes de un grupo (RF-02).
 *
 * En los grupos, WhatsApp Web dibuja a la izquierda de algunos mensajes el
 * avatar del remitente: foto, silueta predeterminada o un círculo de color con
 * una inicial. Este fragmento localiza esos avatares sin suponer su estructura
 * y muestra qué reglas de RF-02 los alcanzan.
 *
 * Para cada fila de mensaje (`#main [data-id]` más externo) examina:
 * - todos los elementos de la fila, también fuera de `msg-container`, con sus
 *   señales visuales: imagen (tipo de origen), SVG (estructura y `<title>` si
 *   es `wds-ic-…`), fondo o máscara CSS (también en pseudoelementos), color de
 *   fondo, forma redonda y texto de una o dos letras (posible inicial);
 * - lo que el navegador pinta a la izquierda (o derecha, en RTL) de la burbuja
 *   del mensaje, arriba y abajo (`elementsFromPoint`), dentro o fuera de la fila;
 * - su relación con la burbuja (`msg-container`) y con el autor
 *   (`[data-testid="author"]`), las reglas de RF-02 que lo alcanzan y dónde
 *   está el filtro.
 *
 * Uso: abrir un grupo con RF-02 activada, desplazarse hasta que se vean varios
 * avatares (con foto, con silueta y con inicial), alejar el cursor de la
 * conversación, abrir las herramientas de desarrollo (F12) → Consola, pegar
 * este archivo completo y pulsar Intro.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No hace peticiones ni guarda nada.
 * - No muestra textos, nombres, iniciales, teléfonos, `data-id`,
 *   `data-pre-plain-text`, `title`, `aria-label`, `alt`, colores ni
 *   direcciones de imágenes o fondos (solo su tipo de origen). De un texto
 *   corto solo indica cuántas letras tiene.
 * - Los valores de `data-testid` se anonimizan.
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  /** `data-testid` anonimizado: números como «#», nada tras «@» ni tras `list-item-`. */
  const limpiarTestId = (valor) => valor.replace(/^(list-item-).+$/, '$1…').replace(/@.*$/, '@…').replace(/\d+/g, '#');
  const MAXIMO_FILAS = 40;
  const MAXIMO_CANDIDATOS_POR_FILA = 10;
  const CONTENEDOR = ':is([data-testid="msg-container"], .message-in, .message-out)';
  const ORIGENES_FOTO_PERFIL = ['pps.whatsapp.net', '/t61.24694-24/'];
  const AVATAR_SVG = 'svg:not([data-icon] svg):has(mask):has(image, foreignObject)';

  const panel = document.querySelector('#main');
  if (!panel) {
    console.log('Veilix · no hay ninguna conversación abierta (#main no existe).');
    return;
  }

  const REGLAS_RF02 = [
    ['FOTO_PERFIL', ORIGENES_FOTO_PERFIL.flatMap((o) => [`img[src*="${o}"]`, `[style*="${o}"]`]).join(', ')],
    ['FOTO_PERFIL_SVG', `svg:not([data-icon] svg):has(${ORIGENES_FOTO_PERFIL.map((o) => `image[*|href*="${o}"]`).join(', ')})`],
    ['AVATAR_SVG', AVATAR_SVG],
    ['AVATAR_PREDETERMINADO', ['default-user', 'default-group', 'default-contact', 'default-community'].map((p) => `[data-icon^="${p}"]`).join(', ')],
  ];
  const reglasQueAlcanzan = (elemento) =>
    REGLAS_RF02.filter(([, selector]) => {
      try {
        return elemento.matches(selector) || elemento.closest(selector) !== null;
      } catch {
        return false;
      }
    })
      .map(([nombre]) => nombre)
      .join('+') || 'NINGUNA';

  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');
  const describir = (elemento) => {
    const partes = [elemento.tagName.toLowerCase() + clasesSemanticas(elemento)];
    if (elemento === panel) partes.push('#main');
    for (const atributo of ['role', 'data-testid', 'data-icon', 'tabindex']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['data-id', 'data-pre-plain-text', 'aria-label', 'title', 'alt']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    return partes.join('');
  };
  const ruta = (elemento, fila) => {
    if (elemento === fila) return '(la propia fila)';
    const cadena = [];
    for (let actual = elemento.parentElement; actual && actual !== fila && cadena.length < 10; actual = actual.parentElement) cadena.push(describir(actual));
    return cadena.reverse().join(' › ') || '(directamente en la fila)';
  };

  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    if (!titulo) return 'ninguno';
    const texto = titulo.textContent.trim();
    return /^wds-ic-[a-z0-9-]+$/.test(texto) ? texto : `otro título (${texto.length})`;
  };
  const tipoOrigen = (url) => {
    if (!url) return 'sin origen';
    if (url.startsWith('blob:')) return 'blob';
    if (url.startsWith('data:')) {
      const fin = [url.indexOf(';'), url.indexOf(',')].filter((n) => n > 0);
      return url.slice(0, fin.length ? Math.min(...fin) : 15);
    }
    if (ORIGENES_FOTO_PERFIL.some((o) => url.includes(o))) return 'foto de perfil (pps)';
    try {
      return /(^|\.)(whatsapp\.(net|com)|fbcdn\.net)$/.test(new URL(url, document.baseURI).hostname) ? 'otro recurso de WhatsApp' : 'otro dominio';
    } catch {
      return 'no válida';
    }
  };
  const tipoImagenCss = (valor) => {
    if (!valor || valor === 'none' || valor === 'normal' || valor === '""') return null;
    if (/gradient\(/.test(valor)) return 'degradado';
    const url = /url\(["']?([^"')]+)/.exec(valor)?.[1];
    return url ? tipoOrigen(url) : 'otro valor';
  };
  const textoPropio = (elemento) =>
    [...elemento.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join('')
      .trim();
  const esRedondo = (elemento, estilo) =>
    /50%/.test(estilo.borderRadius) ||
    (parseFloat(estilo.borderRadius) > 0 && parseFloat(estilo.borderRadius) * 2 >= Math.min(elemento.clientWidth, elemento.clientHeight) - 1);
  const tieneFondoDeColor = (estilo) => estilo.backgroundColor !== 'rgba(0, 0, 0, 0)' && estilo.backgroundColor !== 'transparent';

  /** Señales visuales de un elemento, sin colores, textos ni direcciones. */
  const senales = (elemento) => {
    const estilo = getComputedStyle(elemento);
    const lista = [];
    if (elemento.localName === 'img') lista.push(`img · ${tipoOrigen(elemento.getAttribute('src'))}`);
    if (elemento.localName === 'svg' && !elemento.parentElement?.closest('svg')) {
      const partes = ['mask', 'clipPath', 'circle', 'image', 'foreignObject', 'path', 'text', 'use'].filter((e) => elemento.querySelector(e));
      lista.push(`svg · ${partes.join('+') || 'vacío'} · título ${tituloIcono(elemento)}`);
    }
    if (elemento.localName === 'video' || elemento.localName === 'canvas') lista.push(elemento.localName);
    const fondo = tipoImagenCss(estilo.backgroundImage);
    if (fondo) lista.push(`fondo CSS · ${fondo}`);
    const mascara = tipoImagenCss(estilo.maskImage || estilo.webkitMaskImage);
    if (mascara) lista.push(`máscara CSS · ${mascara}`);
    for (const pseudo of ['::before', '::after']) {
      const p = getComputedStyle(elemento, pseudo);
      if (p.content && p.content !== 'none' && p.content !== 'normal') {
        const partes = [tipoImagenCss(p.backgroundImage), tipoImagenCss(p.maskImage || p.webkitMaskImage)].filter(Boolean);
        lista.push(`${pseudo}${partes.length ? ` · ${partes.join(', ')}` : ''}`);
      }
    }
    const texto = textoPropio(elemento);
    if (texto && texto.length <= 2 && /^\p{L}{1,2}$/u.test(texto)) lista.push(`texto de ${texto.length} letra(s) (posible inicial)`);
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
  const relacion = (elemento, fila) => {
    const burbuja = fila.querySelector(CONTENEDOR);
    const partes = [];
    partes.push(burbuja?.contains(elemento) ? 'dentro de la burbuja' : 'fuera de la burbuja');
    const autor = fila.querySelector('[data-testid="author"]');
    if (autor?.contains(elemento)) partes.push('dentro del autor');
    if (elemento.closest('[data-testid="msg-meta"]')) partes.push('dentro de msg-meta');
    if (elemento.closest('button, [role="button"]')) partes.push('dentro de un botón');
    if (elemento.closest('[data-pre-plain-text]')) partes.push('dentro del texto');
    return partes.join(', ');
  };

  /** Clasificación orientativa del candidato. */
  const tipoAvatar = (s) => {
    const texto = s.join('; ');
    if (/foto de perfil \(pps\)|img · blob/.test(texto)) return 'foto';
    if (/posible inicial/.test(texto)) return 'inicial';
    if (/^svg|; svg/.test(texto) || /svg ·/.test(texto)) return 'svg (posible silueta o icono)';
    if (/fondo CSS|máscara CSS|::before|::after/.test(texto)) return 'CSS';
    if (/color de fondo/.test(texto) && /redondo/.test(texto)) return 'círculo de color';
    return 'otro';
  };

  // Filas de mensaje: el `[data-id]` más externo que contiene una burbuja.
  const filas = [...panel.querySelectorAll('[data-id]')].filter((f) => f.querySelector(CONTENEDOR) && !f.parentElement?.closest('[data-id]'));
  const visibles = filas.filter((f) => {
    const c = f.getBoundingClientRect();
    return c.height > 0 && c.bottom > 0 && c.top < window.innerHeight;
  });
  const enRtl = getComputedStyle(panel).direction === 'rtl';

  const candidatos = visibles.slice(-MAXIMO_FILAS).flatMap((fila, indice) => {
    const prefijo = fila.getAttribute('data-id') ?? '';
    const direccion = prefijo.startsWith('true_') ? 'enviado' : prefijo.startsWith('false_') ? 'recibido' : '?';
    const burbuja = fila.querySelector(CONTENEDOR);
    const cajaBurbuja = burbuja?.getBoundingClientRect();
    // Lo pintado a 20 px de la burbuja, en el lado del avatar, arriba y abajo.
    const puntos = cajaBurbuja
      ? [cajaBurbuja.top + 16, cajaBurbuja.bottom - 16].map((y) => [enRtl ? cajaBurbuja.right + 20 : cajaBurbuja.left - 20, y])
      : [];
    const pintados = new Set(puntos.flatMap(([x, y]) => (x > 0 && x < window.innerWidth ? document.elementsFromPoint(x, y) : [])));
    const conSenales = [fila, ...fila.querySelectorAll('*')]
      .filter((e) => !e.parentElement?.closest('svg') || e.localName === 'svg')
      .filter((e) => !(burbuja && burbuja.contains(e)))
      .filter((e) => senales(e).some((s) => s !== 'redondo'));
    const pintadosEnFila = [...pintados].filter((e) => fila.contains(e) && e !== fila);
    const pintadosFuera = [...pintados].filter((e) => !fila.contains(e) && !e.contains(fila) && senales(e).some((s) => s !== 'redondo')).slice(0, 4);
    const elementos = [...new Set([...conSenales, ...pintadosEnFila])].slice(0, MAXIMO_CANDIDATOS_POR_FILA);
    const base = {
      mensaje: indice + 1,
      direccion,
      tieneAutor: fila.querySelector('[data-testid="author"]') ? 'sí' : 'no',
    };
    const resultado = elementos.map((e) => {
      const c = e.getBoundingClientRect();
      const s = senales(e);
      return {
        ...base,
        elemento: describir(e),
        ruta: ruta(e, fila),
        relacion: relacion(e, fila),
        tamano: `${Math.round(c.width)}×${Math.round(c.height)}`,
        senales: s.join('; ') || '—',
        tipo: tipoAvatar(s),
        enLaZonaDelAvatar: pintados.has(e) ? 'sí' : 'no',
        reglasRF02: reglasQueAlcanzan(e),
        difuminado: filtroEn(e, fila),
      };
    });
    for (const e of pintadosFuera) {
      const c = e.getBoundingClientRect();
      const s = senales(e);
      resultado.push({
        ...base,
        elemento: describir(e),
        ruta: `FUERA de la fila: ${ruta(e, panel)}`,
        relacion: 'fuera de la fila',
        tamano: `${Math.round(c.width)}×${Math.round(c.height)}`,
        senales: s.join('; ') || '—',
        tipo: tipoAvatar(s),
        enLaZonaDelAvatar: 'sí',
        reglasRF02: reglasQueAlcanzan(e),
        difuminado: filtroEn(e, fila),
      });
    }
    if (resultado.length === 0) resultado.push({ ...base, elemento: 'ningún elemento visual fuera de la burbuja' });
    return resultado;
  });

  // Resumen por tipo, estructura y regla, con los visibles primero.
  const firmas = new Map();
  for (const c of candidatos.filter((c) => c.senales && c.senales !== '—')) {
    const clave = [c.tipo, c.relacion, c.ruta.replace(/\[tabindex=[^\]]*\]/g, ''), c.senales, c.reglasRF02].join(' | ');
    const firma = firmas.get(clave) ?? { tipo: clave, elementos: 0, visibles: 0, enLaZonaDelAvatar: 0 };
    firma.elementos++;
    if (c.difuminado === 'NO difuminado') firma.visibles++;
    if (c.enLaZonaDelAvatar === 'sí') firma.enLaZonaDelAvatar++;
    firmas.set(clave, firma);
  }
  const resumen = [...firmas.values()].sort((a, b) => b.visibles - a.visibles || b.enLaZonaDelAvatar - a.enLaZonaDelAvatar);

  const estiloFotos = document.querySelector('style[data-veilix-estilo="fotos"]')?.textContent ?? '';
  const cargado = {
    rf02Activa: estiloFotos !== '',
    atajoActivo: document.documentElement.hasAttribute('data-veilix-revelar-fotos'),
    cursorSobreLaConversacion: panel.matches(':hover'),
    filasDeMensaje: filas.length,
    filasVisiblesAnalizadas: Math.min(visibles.length, MAXIMO_FILAS),
    direccion: enRtl ? 'rtl' : 'ltr',
  };

  console.log('Veilix · avatares de participantes en el grupo (RF-02): estado y totales.');
  console.table([cargado]);
  console.log('Veilix · resumen por tipo de elemento (los visibles primero; «enLaZonaDelAvatar» cuenta los pintados junto a la burbuja):');
  console.table(resumen);
  console.log('Veilix · detalle por mensaje (elementos fuera de la burbuja y lo pintado en la zona del avatar):');
  console.table(candidatos);
  console.log('Veilix · resumen (JSON):\n' + JSON.stringify({ cargado, resumen, candidatos }, null, 2));
})();

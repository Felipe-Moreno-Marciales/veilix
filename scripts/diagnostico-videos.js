/* global document, getComputedStyle, console, URL, window -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de la multimedia visible de la conversación abierta
 * (RF-04), para comparar un vídeo que queda sin difuminar con otro que sí se
 * difumina.
 *
 * No supone cómo se dibuja la miniatura de un vídeo. Recorre la conversación
 * (`#main`) y, fuera de ella, el resto de la página salvo la lista de chats, y
 * reúne todo lo que pinta una imagen de cierto tamaño: `img` (con cualquier
 * origen), `video` (y su `poster`), `canvas`, SVG con `<image>`, y fondos o
 * máscaras CSS, también en pseudoelementos. Para cada candidato muestra:
 * - su posición en pantalla (para reconocer el vídeo «A», arriba a la
 *   izquierda, y el «B», más abajo) y su tamaño;
 * - la ruta anonimizada desde `#main` y la zona: fila de mensaje `[data-id]`,
 *   `msg-container`, encabezado, pie o fuera de los mensajes (por ejemplo, un
 *   aviso fijado), sin suponer cuál es;
 * - si el mensaje es enviado o recibido (solo eso del `data-id`), y si está
 *   dentro de una cita, de un botón o de un elemento que puede recibir el foco;
 * - `filter` y `backdrop-filter` calculados del propio elemento y qué
 *   antecesor tiene filtro, y si el filtro está en línea (atributo `style`);
 * - su relación con los demás candidatos del mismo `video-content` o del
 *   mismo mensaje (hermano, antecesor o descendiente);
 * - si el selector de multimedia de RF-04 lo alcanza, y si su fila o su
 *   contenedor tienen ahora `:hover`, `:focus-visible` o el foco dentro, y si
 *   el atajo de revelado está pulsado;
 * - lo que se pinta encima del centro del elemento (`elementsFromPoint`), por
 *   si una capa sin difuminar tapa a la difuminada.
 *
 * Uso: con RF-04 activada, abre la conversación con los dos vídeos visibles a
 * la vez, aleja el cursor de la conversación (déjalo sobre la lista de chats),
 * no pulses ninguna tecla, abre las herramientas de desarrollo (F12) →
 * Consola, pega este archivo completo y pulsa Intro.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No modifica la página, no
 *   descarga archivos ni hace peticiones.
 * - No muestra textos, nombres, teléfonos, fechas, horas, `data-id`,
 *   `data-pre-plain-text`, `title`, `aria-label`, `alt` ni direcciones: solo
 *   si existen. De cada imagen, solo el tipo de origen (`blob`,
 *   `data:image/jpeg`, «recurso de WhatsApp»…), nunca la URL.
 * - Los `data-testid` se anonimizan (números como «#», nada tras «@»).
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  /**
   * `data-testid` anonimizado: números como «#», nada tras «@» ni tras `list-item-`, y «…» en lugar de
   * cualquier fragmento con mayúsculas o de más de 24 caracteres (los nombres de la interfaz van en
   * minúsculas, como `msg-container`).
   */
  const limpiarTestId = (valor) =>
    valor
      .replace(/^(list-item-).+$/, '$1…')
      .replace(/@.*$/, '@…')
      .replace(/[^-_.:@…]*[A-Z][^-_.:@…]*|[^-_.:@…]{25,}/g, '…')
      .replace(/\d+/g, '#');
  const TAMANO_MINIMO = 40;
  const MAXIMO_CANDIDATOS = 40;
  // Mismos selectores que `selectores.ts` (RF-04).
  const CONTENEDOR_MENSAJE = ':is([data-testid="msg-container"], .message-in, .message-out)';
  const FILA_MENSAJE = `#main [data-id]:has(${CONTENEDOR_MENSAJE})`;
  const MENSAJE = `#main ${CONTENEDOR_MENSAJE}`;
  const CAPA_MINIATURA_VIDEO = '[data-testid="video-content"] [style*="data:image/jpeg"]';
  const MULTIMEDIA = `:is(img[src^="blob:"], img[src^="data:image/jpeg"], video, canvas, [style*="blob:"]):not([data-icon] *):not(:where(${CAPA_MINIATURA_VIDEO}) *)`;
  const MINIATURA_VIDEO = `[data-testid="msg-container"] ${CAPA_MINIATURA_VIDEO}:not(${CAPA_MINIATURA_VIDEO} *)`;

  const principal = document.querySelector('#main');
  if (!principal) {
    console.log('Veilix · no hay ninguna conversación abierta (#main). Ábrela y vuelve a ejecutar el fragmento.');
    return;
  }

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
  const tipoImagenCss = (valor) => {
    if (!valor || valor === 'none' || valor === 'normal' || valor === '""') return null;
    if (/gradient\(/.test(valor) && !/url\(/.test(valor)) return 'degradado';
    const url = /url\(["']?([^"')]+)/.exec(valor)?.[1];
    return url ? tipoOrigen(url) : null;
  };
  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');

  const describir = (elemento) => {
    const partes = [elemento.localName + clasesSemanticas(elemento)];
    if (['app', 'main', 'side', 'pane-side'].includes(elemento.id)) partes.push(`#${elemento.id}`);
    for (const atributo of ['role', 'data-testid', 'data-icon', 'tabindex']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['data-id', 'data-pre-plain-text', 'aria-label', 'title', 'alt', 'href']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    for (const atributo of elemento.getAttributeNames()) {
      if (atributo.startsWith('data-veilix-')) partes.push(`[${atributo}]`);
    }
    return partes.join('');
  };
  const rutaDesde = (elemento, limite) => {
    const cadena = [];
    for (let actual = elemento.parentElement; actual && actual !== limite && cadena.length < 14; actual = actual.parentElement) {
      cadena.push(describir(actual));
    }
    return cadena.reverse().join(' › ');
  };

  /** Lo que pinta el elemento como imagen (vacío si no pinta ninguna). */
  const senalesVisuales = (e) => {
    const lista = [];
    if (e.localName === 'img') {
      lista.push(`img · ${tipoOrigen(e.currentSrc || e.getAttribute('src'))}${e.hasAttribute('srcset') ? ' · srcset' : ''}${e.complete ? '' : ' · cargando'}`);
    }
    if (e.localName === 'video') {
      const poster = e.getAttribute('poster');
      const atributos = ['autoplay', 'loop', 'muted', 'controls', 'playsinline'].filter((a) => e.hasAttribute(a));
      lista.push(`video · origen ${tipoOrigen(e.currentSrc || e.getAttribute('src'))}${poster !== null ? ` · poster ${tipoOrigen(poster)}` : ''}${atributos.map((a) => ` · ${a}`).join('')}${e.paused ? ' · en pausa' : ' · reproduciéndose'}`);
    }
    if (e.localName === 'canvas') lista.push('canvas');
    if (e.localName === 'image' && e.closest('svg')) lista.push(`svg image · ${tipoOrigen(e.getAttribute('href') ?? e.getAttribute('xlink:href'))}`);
    const estilo = getComputedStyle(e);
    const fondo = tipoImagenCss(estilo.backgroundImage);
    if (fondo) lista.push(`fondo CSS · ${fondo}${/blob:|data:/.test(e.getAttribute('style') ?? '') ? ' (en línea)' : ' (hoja de estilos)'}`);
    const mascara = tipoImagenCss(estilo.maskImage || estilo.webkitMaskImage);
    if (mascara) lista.push(`máscara CSS · ${mascara}`);
    const contenido = tipoImagenCss(estilo.content);
    if (contenido && e.localName !== 'img') lista.push(`content CSS · ${contenido}`);
    for (const pseudo of ['::before', '::after']) {
      const estiloPseudo = getComputedStyle(e, pseudo);
      const imagen = tipoImagenCss(estiloPseudo.backgroundImage) ?? tipoImagenCss(estiloPseudo.content);
      if (imagen) lista.push(`${pseudo} · ${imagen}`);
    }
    return lista;
  };

  const filtroPropio = (e) => {
    const estilo = getComputedStyle(e);
    const filtro = estilo.filter === 'none' ? '' : `filter ${estilo.filter}`;
    const fondo = (estilo.backdropFilter || estilo.webkitBackdropFilter || 'none') === 'none' ? '' : `backdrop-filter ${estilo.backdropFilter || estilo.webkitBackdropFilter}`;
    return [filtro, fondo].filter(Boolean).join(' · ') || 'ninguno';
  };
  const antecesorConFiltro = (e) => {
    for (let actual = e.parentElement, niveles = 1; actual; actual = actual.parentElement, niveles++) {
      if (getComputedStyle(actual).filter !== 'none') return `${describir(actual)} (${niveles} nivel${niveles === 1 ? '' : 'es'} arriba)`;
    }
    return 'ninguno';
  };
  const difuminado = (e) => {
    for (let actual = e; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return true;
    }
    return false;
  };

  const zonaDe = (e) => {
    if (!e.closest('#main')) return 'FUERA DE #main';
    if (e.closest('#main header')) return '#main header';
    if (e.closest('#main footer')) return '#main footer';
    if (e.closest(CONTENEDOR_MENSAJE)) return e.closest('#main [data-id]') ? 'mensaje (fila [data-id] › msg-container)' : 'msg-container SIN fila [data-id]';
    if (e.closest('#main [data-id]')) return 'fila [data-id] FUERA de msg-container';
    return 'en #main, FUERA DE LOS MENSAJES';
  };
  const sentido = (e) => {
    const fila = e.closest('[data-id]');
    const id = fila?.getAttribute('data-id') ?? '';
    if (id.startsWith('true_')) return 'enviado';
    if (id.startsWith('false_')) return 'recibido';
    if (e.closest('.message-out')) return 'enviado';
    if (e.closest('.message-in')) return 'recibido';
    return fila ? 'desconocido' : '—';
  };
  const coincide = (e, selector) => {
    try {
      return e.matches(selector);
    } catch {
      return false;
    }
  };
  const estadosDeRevelado = (e) => {
    const estados = [];
    for (const [nombre, contenedor] of [
      ['fila', e.closest(FILA_MENSAJE)],
      ['msg-container', e.closest(MENSAJE)],
    ]) {
      if (!contenedor) continue;
      if (contenedor.matches(':hover')) estados.push(`${nombre}:hover`);
      if (contenedor.matches(':focus-visible, :has(:focus-visible)')) estados.push(`${nombre}:focus-visible`);
      else if (contenedor.matches(':focus-within')) estados.push(`${nombre}: foco dentro (sin :focus-visible)`);
    }
    return estados.join(', ') || 'ninguno';
  };

  /** Lo que se pinta en el centro del elemento, de arriba abajo, hasta llegar a él. */
  const pilaEnElCentro = (e) => {
    const caja = e.getBoundingClientRect();
    const x = caja.left + caja.width / 2;
    const y = caja.top + caja.height / 2;
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return 'fuera de la pantalla';
    const pila = [];
    for (const capa of document.elementsFromPoint(x, y)) {
      if (capa === e) {
        pila.push('(el propio elemento)');
        break;
      }
      if (capa.contains(e)) {
        pila.push('(antecesor del elemento)');
        break;
      }
      pila.push(`${describir(capa)}${senalesVisuales(capa).length ? ' · PINTA IMAGEN' : ''}${difuminado(capa) ? ' · difuminado' : ' · visible'}`);
      if (pila.length >= 6) break;
    }
    return pila.join(' ▸ ');
  };

  // 1) Candidatos: todo lo que pinta una imagen de cierto tamaño, fuera de la lista de chats.
  const candidatos = [...document.querySelectorAll('body *')]
    .filter((e) => !e.closest('#pane-side') && !e.closest('#side'))
    .filter((e) => {
      const caja = e.getBoundingClientRect();
      return caja.width >= TAMANO_MINIMO && caja.height >= TAMANO_MINIMO && caja.bottom > 0 && caja.top < window.innerHeight;
    })
    .filter((e) => senalesVisuales(e).length > 0)
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left)
    .slice(0, MAXIMO_CANDIDATOS);

  // Relación de cada candidato con los demás del mismo `video-content` (o del mismo mensaje): hermanos, antecesor o descendiente.
  const relacion = (e) => {
    const grupo = e.closest('[data-testid="video-content"]') ?? e.closest(CONTENEDOR_MENSAJE);
    if (!grupo) return '—';
    const partes = candidatos
      .map((otro, indice) => [otro, indice + 1])
      .filter(([otro]) => otro !== e && grupo.contains(otro))
      .map(([otro, n]) => {
        if (e.contains(otro)) return `contiene a ${n}`;
        if (otro.contains(e)) return `dentro de ${n}`;
        if (otro.parentElement === e.parentElement) return `hermano de ${n}`;
        return `primo de ${n}`;
      });
    return `${grupo.matches('[data-testid="video-content"]') ? 'en video-content' : 'en el mensaje'}: ${partes.join(', ') || 'solo'}`;
  };

  const anchoMain = principal.getBoundingClientRect();
  const filas = candidatos.map((e, indice) => {
    const caja = e.getBoundingClientRect();
    const horizontal = caja.left + caja.width / 2 < anchoMain.left + anchoMain.width / 2 ? 'izquierda' : 'derecha';
    const vertical = caja.top + caja.height / 2 < anchoMain.top + anchoMain.height / 2 ? 'arriba' : 'abajo';
    const contenedor = e.closest(CONTENEDOR_MENSAJE);
    return {
      n: indice + 1,
      posicion: `${vertical} ${horizontal} (x ${Math.round(caja.left)}, y ${Math.round(caja.top)})`,
      tamano: `${Math.round(caja.width)}×${Math.round(caja.height)}`,
      elemento: describir(e),
      senales: senalesVisuales(e).join('; '),
      zona: zonaDe(e),
      sentido: sentido(e),
      enUnaCita: e.closest('[data-testid="quoted-message"], [data-testid*="quoted"]') ? 'sí' : 'no',
      enUnBoton: e.closest('button, [role="button"]') ? 'sí' : 'no',
      selectorMultimediaRF04:
        contenedor && e.closest('#main')
          ? coincide(e, MULTIMEDIA)
            ? 'multimedia'
            : coincide(e, MINIATURA_VIDEO)
              ? 'miniatura de vídeo (0.1.2-beta.7)'
              : e.closest(MINIATURA_VIDEO)
                ? 'dentro de una miniatura de vídeo'
                : 'NO lo alcanza'
          : 'fuera de un mensaje',
      revelado: estadosDeRevelado(e),
      filtroPropio: filtroPropio(e),
      antecesorConFiltro: antecesorConFiltro(e),
      filtroEnLinea: /(^|;)\s*filter\s*:/.test(e.getAttribute('style') ?? '') ? 'sí' : 'no',
      relacionConOtrasCapas: relacion(e),
      resultado: difuminado(e) ? 'difuminado' : 'VISIBLE',
      encimaDelCentro: pilaEnElCentro(e),
      rutaDesdeMain: e.closest('#main') ? rutaDesde(e, principal) : rutaDesde(e, document.body),
    };
  });

  const estilo = document.querySelector('style[data-veilix-estilo="mensajes-conversacion"]');
  const resumen = {
    rf04Activa: (estilo?.textContent ?? '') !== '',
    atajoPulsado: document.documentElement.hasAttribute('data-veilix-revelar-mensajes-conversacion'),
    ventanaConFoco: document.hasFocus(),
    elementoConFoco: document.activeElement && document.activeElement !== document.body ? describir(document.activeElement) : 'ninguno',
    cursorSobreLaConversacion: principal.matches(':hover'),
    filasDeMensaje: principal.querySelectorAll('[data-id]').length,
    contenedoresDeMensaje: principal.querySelectorAll(CONTENEDOR_MENSAJE).length,
    candidatos: filas.length,
    candidatosVisibles: filas.filter((f) => f.resultado === 'VISIBLE').length,
  };

  console.log('Veilix · multimedia de la conversación (RF-04): resumen.');
  console.table([resumen]);
  console.log('Veilix · elementos que pintan una imagen, de arriba abajo:');
  console.table(filas.map((fila) => Object.fromEntries(Object.entries(fila).filter(([clave]) => !['rutaDesdeMain', 'encimaDelCentro'].includes(clave)))));
  console.log('Veilix · resumen (JSON), con la ruta y lo que se pinta encima de cada elemento:\n' + JSON.stringify({ resumen, candidatos: filas }, null, 2));
})();

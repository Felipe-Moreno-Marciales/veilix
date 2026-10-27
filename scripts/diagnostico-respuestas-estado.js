/* global document, getComputedStyle, console, URL, Node, window -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de las respuestas a estados en la conversación
 * abierta (RF-04): la tarjeta que muestra el estado citado («Tú · Estados»)
 * dentro del mensaje recibido.
 *
 * No supone cómo se dibuja esa tarjeta. Clasifica los mensajes de `#main`
 * visibles en pantalla en cuatro grupos, de más a menos seguro:
 * - «respuesta a un estado (confirmada)»: un identificador inequívoco, como
 *   un `data-testid` que menciona estado o un icono `wds-ic-status…`;
 * - «posible respuesta a un estado»: una cita cuyo encabezado contiene la
 *   palabra «Estados» / «Estado» / «Status», sola o compuesta («Tú · Estados»).
 *   Es solo un texto de la interfaz, no un identificador;
 * - «cita con miniatura»: una cita (`quoted-message`) con una imagen o un fondo
 *   `data:image/jpeg`, sin más indicios. No se da por respuesta a un estado;
 * - «cita convencional»: el resto de citas (hasta dos, para comparar).
 * Una cita se reconoce por un `data-testid` que menciona `quoted` o, si no lo
 * tiene, por el botón que contiene un texto citado (`.quoted-mention`) o un
 * autor (`[data-testid="author"]`).
 *
 * De cada uno muestra el esqueleto anonimizado del mensaje, con las reglas de
 * RF-04 (y la de autores de RF-01) que alcanzan a cada elemento y dónde está
 * el filtro, y una tabla con lo que pinta una imagen o un texto: tipo (img,
 * video, canvas, SVG, fondos y máscaras CSS, también en pseudoelementos),
 * tipo de origen, tamaño, si está en la cita y en un elemento interactivo,
 * filtros propios y de antecesores, y lo que se pinta encima de su centro.
 * También indica si el mensaje está revelado por el cursor, el foco o el
 * atajo, y resume los rasgos estructurales de cada cita (sus `data-testid`,
 * iconos, autor, texto citado, miniaturas, encabezados, duración con sus
 * hijos y elementos interactivos), para distinguir una respuesta a un estado
 * de una cita convencional sin mirar su texto.
 *
 * Uso: con RF-04 activada, abre la conversación con la respuesta al estado y
 * déjala a la vista (si puedes, también un mensaje que cite otro mensaje).
 * Deja el cursor sobre la lista de chats, no pulses ninguna tecla, abre las
 * herramientas de desarrollo (F12) → Consola, pega este archivo completo y
 * pulsa Intro.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No modifica la página, no
 *   descarga archivos ni hace peticiones.
 * - No muestra textos, nombres, teléfonos, fechas, horas, `data-id`,
 *   `data-pre-plain-text`, `title`, `aria-label`, `alt` ni direcciones. Solo
 *   muestran su texto las etiquetas genéricas de la interfaz «Tú», «You»,
 *   «Estados», «Estado», «Status» y los separadores; del resto de textos,
 *   solo la longitud y si parece una hora o una duración.
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
  const MAXIMO_NODOS = 120;
  const TAMANO_MINIMO_IMAGEN = 16;
  // Mismos selectores que `selectores.ts` (RF-04 y autores de RF-01).
  const CONTENEDOR_MENSAJE = ':is([data-testid="msg-container"], .message-in, .message-out)';
  const TEXTO = ':is([data-pre-plain-text], .selectable-text:not([data-pre-plain-text] *)):not([data-icon], [data-icon] *)';
  const CAPA_MINIATURA_VIDEO = '[data-testid="video-content"] [style*="data:image/jpeg"]';
  const MULTIMEDIA = `:is(img[src^="blob:"], img[src^="data:image/jpeg"], video, canvas, [style*="blob:"]):not([data-icon] *):not(:where(${CAPA_MINIATURA_VIDEO}) *)`;
  const REGLAS = [
    ['RF-04 texto', `#main ${CONTENEDOR_MENSAJE} ${TEXTO}`],
    ['RF-04 multimedia', `#main ${CONTENEDOR_MENSAJE} ${MULTIMEDIA}`],
    ['RF-04 miniatura de vídeo', `[data-testid="msg-container"] ${CAPA_MINIATURA_VIDEO}:not(${CAPA_MINIATURA_VIDEO} *)`],
    ['RF-04 documento', '[data-testid="msg-container"] [data-testid="document-thumb"]'],
    [
      'RF-04 miniatura de cita (0.1.2-beta.10)',
      '[data-testid="msg-container"] [data-testid="quoted-message"] [style*="data:image/jpeg"]:not([data-testid="quoted-message"] [style*="data:image/jpeg"] *):not(:has([data-testid="selectable-text"], .selectable-text, span[dir="auto"], button, [role="button"]))',
    ],
    ['RF-04 hora (marca)', '[data-veilix-hora-mensaje]'],
    ['RF-04 reacción (marca)', '[data-veilix-reaccion]'],
    ['RF-04 estado (marca)', '[data-veilix-estado-mensaje]'],
    ['RF-04 duración de cita (marca, 0.1.2-beta.11)', '[data-veilix-duracion-cita]'],
    ['RF-04 encabezado de estado (marca, 0.1.2-beta.12)', '[data-veilix-encabezado-estado]'],
    ['RF-01 autor', '#main [data-testid="author"]'],
    ['RF-01 remitente (marca)', '[data-veilix-remitente]'],
  ];
  const ETIQUETA_ESTADO = /(^|[\s·•|])(estados?|status|statuses)$/i;
  const ETIQUETA_GENERICA = /^(t[uú]|you|estados?|status|statuses|[·•|,–-]|(t[uú]|you)\s*[·•]\s*(estados?|status|statuses))$/i;

  const principal = document.querySelector('#main');
  if (!principal) {
    console.log('Veilix · no hay ninguna conversación abierta (#main). Ábrela y vuelve a ejecutar el fragmento.');
    return;
  }

  const normalizar = (texto) => texto.replace(/[‎‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
  const textoPropio = (elemento) =>
    normalizar(
      [...elemento.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join(''),
    );
  const describirTexto = (texto) => {
    if (ETIQUETA_GENERICA.test(texto)) return `ETIQUETA=«${texto}»`;
    const partes = [`texto(${texto.length})`];
    if (/^\d{1,2}[:.]\d{2}(\s?[ap]\.?\s?m\.?)?$/i.test(texto)) partes.push('PARECE-HORA-O-DURACIÓN');
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
  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    if (!titulo) return 'ninguno';
    const texto = titulo.textContent.trim();
    if (/^wds-ic-[a-z0-9-]+$/.test(texto)) return texto;
    // Nombres de icono en minúsculas separadas por guiones (como `tail-in`): no son textos de usuario.
    if (texto.length <= 40 && /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(texto)) return `${texto} (nombre de icono)`;
    return `otro título (${texto.length})`;
  };
  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');

  const reglasQueAlcanzan = (elemento) =>
    REGLAS.filter(([, selector]) => {
      try {
        return elemento.closest(selector) !== null;
      } catch {
        return false;
      }
    })
      .map(([nombre]) => nombre)
      .join('+') || 'NINGUNA';
  const difuminado = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return true;
    }
    return false;
  };
  const filtroEn = (elemento) => {
    for (let actual = elemento, niveles = 0; actual; actual = actual.parentElement, niveles++) {
      const filtro = getComputedStyle(actual).filter;
      if (filtro !== 'none') return niveles === 0 ? `propio ${filtro}` : `antecesor (${niveles} arriba) ${filtro}`;
    }
    return 'NO difuminado';
  };
  const filtroDeFondo = (elemento) => {
    const estilo = getComputedStyle(elemento);
    const valor = estilo.backdropFilter || estilo.webkitBackdropFilter || 'none';
    return valor === 'none' ? '' : ` backdrop-filter ${valor}`;
  };

  /** Lo que pinta el elemento como imagen (vacío si no pinta ninguna). */
  const senalesVisuales = (e) => {
    const lista = [];
    if (e.localName === 'img') lista.push(`img · ${tipoOrigen(e.currentSrc || e.getAttribute('src'))}${e.hasAttribute('srcset') ? ' · srcset' : ''}`);
    if (e.localName === 'video') {
      const poster = e.getAttribute('poster');
      lista.push(`video · ${tipoOrigen(e.currentSrc || e.getAttribute('src'))}${poster !== null ? ` · poster ${tipoOrigen(poster)}` : ''}${e.paused ? ' · en pausa' : ' · reproduciéndose'}`);
    }
    if (e.localName === 'canvas') lista.push('canvas');
    if (e.localName === 'image' && e.closest('svg')) lista.push(`svg image · ${tipoOrigen(e.getAttribute('href') ?? e.getAttribute('xlink:href'))}`);
    if (e.localName === 'svg' && !e.parentElement?.closest('svg')) lista.push(`svg · título ${tituloIcono(e)}`);
    const estilo = getComputedStyle(e);
    const fondo = tipoImagenCss(estilo.backgroundImage);
    if (fondo) lista.push(`fondo CSS · ${fondo}${/blob:|data:/.test(e.getAttribute('style') ?? '') ? ' (en línea)' : ' (hoja de estilos)'}`);
    const mascara = tipoImagenCss(estilo.maskImage || estilo.webkitMaskImage);
    if (mascara) lista.push(`máscara CSS · ${mascara}`);
    for (const pseudo of ['::before', '::after']) {
      const estiloPseudo = getComputedStyle(e, pseudo);
      const imagen = tipoImagenCss(estiloPseudo.backgroundImage) ?? tipoImagenCss(estiloPseudo.content);
      if (imagen) lista.push(`${pseudo} · ${imagen}`);
    }
    return lista;
  };

  const describir = (elemento) => {
    const partes = [elemento.localName + clasesSemanticas(elemento)];
    for (const atributo of ['role', 'data-testid', 'data-icon', 'tabindex', 'dir']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['data-id', 'data-pre-plain-text', 'aria-label', 'title', 'alt', 'href', 'style']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    for (const atributo of elemento.getAttributeNames()) {
      if (atributo.startsWith('data-veilix-')) partes.push(`[${atributo}]`);
    }
    if (elemento.localName === 'svg') partes.push(` título=${tituloIcono(elemento)}`);
    const visuales = senalesVisuales(elemento).filter((s) => !s.startsWith('svg ·'));
    if (visuales.length) partes.push(` PINTA(${visuales.join('; ')})`);
    const texto = textoPropio(elemento);
    if (texto) partes.push(` ${describirTexto(texto)}`);
    return partes.join('');
  };

  const visible = (e) => {
    const caja = e.getBoundingClientRect();
    return caja.width > 0 && caja.height > 0 && caja.bottom > 0 && caja.top < window.innerHeight;
  };
  const identificadorDeEstado = (mensaje) =>
    [...mensaje.querySelectorAll('*')].some(
      (e) =>
        /status|estado/i.test(e.getAttribute('data-testid') ?? '') ||
        (e.localName === 'svg' && /^wds-ic-status/.test(tituloIcono(e))) ||
        /(^|-)status(-|$)/i.test(e.getAttribute('data-icon') ?? ''),
    );
  // Citas: por `data-testid` (`quoted…`) o, si no lo tienen, el botón que contiene un texto citado (`.quoted-mention`) o un autor.
  const TEXTO_CITADO = '[data-testid="selectable-text"], .selectable-text, .quoted-mention';
  const ENCABEZADO_CITA = `span[dir="auto"]:not(${TEXTO_CITADO}):not(:is(${TEXTO_CITADO}) *)`;
  const citasDe = (mensaje) => {
    const porTestId = [...mensaje.querySelectorAll('[data-testid*="quoted"]')];
    const porEstructura = [...mensaje.querySelectorAll('.quoted-mention, [role="button"] [data-testid="author"]')]
      .map((e) => e.closest('[role="button"]'))
      .filter((e) => e && mensaje.contains(e) && !e.closest('[data-testid*="quoted"]') && !e.querySelector('[data-testid*="quoted"]'));
    return [...new Set([...porTestId, ...porEstructura])];
  };
  // Encabezado con la palabra «Estados» (sola o compuesta): se mira el texto completo de elementos cortos de la cita.
  const etiquetaDeEstado = (mensaje) =>
    citasDe(mensaje).some((cita) =>
      [cita, ...cita.querySelectorAll('*')].some((e) => {
        const texto = normalizar(e.textContent ?? '');
        return texto.length <= 40 && ETIQUETA_ESTADO.test(texto);
      }),
    );
  const citaConMiniatura = (mensaje) => citasDe(mensaje).some((cita) => cita.querySelector('[style*="data:image/jpeg"], img, canvas, video') !== null);
  const clasificar = (mensaje) => {
    if (identificadorDeEstado(mensaje)) return 'respuesta a un estado (confirmada)';
    if (citasDe(mensaje).length === 0) return null;
    if (etiquetaDeEstado(mensaje)) return 'posible respuesta a un estado';
    if (citaConMiniatura(mensaje)) return 'cita con miniatura';
    return 'cita convencional';
  };

  const visibles = [...principal.querySelectorAll(CONTENEDOR_MENSAJE)].filter((m) => !m.parentElement?.closest(CONTENEDOR_MENSAJE) && visible(m));
  const clasificados = visibles.map((m) => ({ mensaje: m, tipo: clasificar(m) })).filter((m) => m.tipo !== null);
  const seleccion = [
    ...clasificados.filter((m) => m.tipo !== 'cita convencional').slice(-6),
    ...clasificados.filter((m) => m.tipo === 'cita convencional').slice(-2),
  ];
  const respuestasAEstados = seleccion.filter((m) => m.tipo === 'respuesta a un estado (confirmada)');

  if (seleccion.length === 0) {
    console.log('Veilix · no se encontró a la vista ninguna cita ni respuesta a un estado. Desplaza la conversación hasta verla y vuelve a ejecutar el fragmento.');
    return;
  }

  const estadoDeRevelado = (mensaje) => {
    const estados = [];
    const fila = mensaje.closest('#main [data-id]');
    for (const [nombre, contenedor] of [
      ['fila', fila],
      ['msg-container', mensaje],
    ]) {
      if (!contenedor) continue;
      if (contenedor.matches(':hover')) estados.push(`${nombre}:hover`);
      if (contenedor.matches(':focus-visible, :has(:focus-visible)')) estados.push(`${nombre}:focus-visible`);
      else if (contenedor.matches(':focus-within')) estados.push(`${nombre}: foco dentro`);
    }
    return estados.join(', ') || 'ninguno';
  };
  const pilaEnElCentro = (e) => {
    const caja = e.getBoundingClientRect();
    const x = caja.left + caja.width / 2;
    const y = caja.top + caja.height / 2;
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return 'fuera de la pantalla';
    const pila = [];
    for (const capa of document.elementsFromPoint(x, y)) {
      if (capa === e) return [...pila, '(el propio elemento)'].join(' ▸ ');
      if (capa.contains(e)) return [...pila, '(antecesor)'].join(' ▸ ');
      pila.push(`${describir(capa)} · ${difuminado(capa) ? 'difuminado' : 'visible'}`);
      if (pila.length >= 5) break;
    }
    return pila.join(' ▸ ');
  };

  const sentido = (m) => {
    const id = m.closest('[data-id]')?.getAttribute('data-id') ?? '';
    if (id.startsWith('true_')) return 'enviado';
    if (id.startsWith('false_')) return 'recibido';
    return 'desconocido';
  };

  const elementos = [];
  const esqueletos = [];
  const examinar = (mensaje, n, tipo) => {
    for (const e of mensaje.querySelectorAll('*')) {
      if (e.parentElement?.closest('svg')) continue;
      const texto = textoPropio(e);
      const visuales = senalesVisuales(e);
      const caja = e.getBoundingClientRect();
      const esImagen = visuales.length > 0 && (e.localName === 'svg' || (caja.width >= TAMANO_MINIMO_IMAGEN && caja.height >= TAMANO_MINIMO_IMAGEN));
      if (!texto && !esImagen) continue;
      elementos.push({
        mensaje: n,
        tipo,
        elemento: describir(e),
        tamano: `${Math.round(caja.width)}×${Math.round(caja.height)}`,
        enUnaCita: e.closest('[data-testid*="quoted"]') ? 'sí' : 'no',
        interactivo: e.closest('button, [role="button"], a[href], [tabindex]') ? 'sí (o un antecesor)' : 'no',
        zona: e.closest('[data-testid="msg-meta"]') ? 'msg-meta' : 'contenido',
        reglas: reglasQueAlcanzan(e),
        filtro: filtroEn(e) + filtroDeFondo(e),
        encimaDelCentro: esImagen ? pilaEnElCentro(e) : '—',
      });
    }
    const lineas = [];
    const recorrer = (elemento, nivel) => {
      if (lineas.length >= MAXIMO_NODOS) return;
      const reglas = reglasQueAlcanzan(elemento);
      lineas.push(`${'  '.repeat(nivel)}${describir(elemento)}${reglas === 'NINGUNA' ? '' : ` REGLAS=${reglas}`} · ${difuminado(elemento) ? 'difuminado' : 'visible'}`);
      if (elemento.localName === 'svg') return;
      for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
    };
    recorrer(mensaje, 0);
    const ascendencia = [];
    for (let actual = mensaje.parentElement; actual && actual !== principal && ascendencia.length < 6; actual = actual.parentElement) ascendencia.push(describir(actual));
    esqueletos.push(`Mensaje ${n} (${tipo}; ${sentido(mensaje)}; revelado: ${estadoDeRevelado(mensaje)})\n  ascendencia: ${ascendencia.join(' < ')}\n${lineas.join('\n')}`);
  };
  seleccion.forEach(({ mensaje, tipo }, i) => {
    examinar(mensaje, i + 1, tipo);
  });

  // Rasgos estructurales de cada cita, para comparar una respuesta a un estado con una cita convencional sin mirar su texto.
  const rutaDesde = (elemento, limite) => {
    const cadena = [];
    for (let actual = elemento.parentElement; actual && actual !== limite && cadena.length < 8; actual = actual.parentElement) cadena.push(describir(actual));
    return cadena.reverse().join(' › ') || '(directamente)';
  };
  const rasgos = [];
  seleccion.forEach(({ mensaje, tipo }, i) => {
    for (const cita of citasDe(mensaje).filter((c) => !c.parentElement?.closest('[data-testid*="quoted"]'))) {
      const detectadaPor = cita.matches('[data-testid*="quoted"]') ? 'data-testid' : 'estructura (.quoted-mention o autor en un botón)';
      const dentro = [cita, ...cita.querySelectorAll('*')];
      // Encabezado: un `span[dir="auto"]` que no es el texto citado (que también lleva `dir="auto"`).
      const encabezados = [...cita.querySelectorAll(ENCABEZADO_CITA)].filter((e) => !e.parentElement?.closest(ENCABEZADO_CITA));
      const duraciones = dentro.filter((e) => /^\d{1,2}:\d{2}$/.test(textoPropio(e)));
      rasgos.push({
        mensaje: i + 1,
        tipo,
        cita: describir(cita),
        detectadaPor,
        rutaDesdeElMensaje: rutaDesde(cita, mensaje),
        dataTestidDentro: [...new Set(dentro.map((e) => e.getAttribute('data-testid')).filter(Boolean).map(limpiarTestId))].join(', ') || '—',
        iconos: [...new Set(dentro.flatMap((e) => (e.localName === 'svg' ? [tituloIcono(e)] : e.hasAttribute('data-icon') ? [`data-icon=${e.getAttribute('data-icon')}`] : [])))].join(', ') || '—',
        conAutor: cita.querySelector('[data-testid="author"]') ? 'sí' : 'no',
        textosCitados: cita.querySelectorAll('[data-testid="selectable-text"], .selectable-text').length,
        miniaturas: dentro.filter((e) => /data:image\/jpeg/.test(e.getAttribute('style') ?? '') || e.localName === 'img').length,
        encabezados: encabezados.map((e) => `${describir(e)} · ${filtroEn(e)} · ruta ${rutaDesde(e, cita)}`).join(' | ') || '—',
        duracion:
          duraciones
            .map((e) => {
              // Hijos en orden, incluidos los nodos de texto directos (solo su longitud y su forma).
              const hijos = [...e.childNodes]
                .map((n) => (n.nodeType === Node.TEXT_NODE ? (normalizar(n.textContent ?? '') ? `#texto(${describirTexto(normalizar(n.textContent ?? ''))})` : null) : n.nodeType === Node.ELEMENT_NODE ? describir(n) : null))
                .filter(Boolean);
              const contiene = [
                ['encabezado', ENCABEZADO_CITA],
                ['autor', '[data-testid="author"]'],
                ['texto citado', '[data-testid="selectable-text"], .selectable-text'],
                ['miniatura', '[style*="data:image/jpeg"], img'],
                ['icono', 'svg, [data-icon]'],
                ['botón', 'button, [role="button"]'],
              ]
                .filter(([, selector]) => e.querySelector(selector))
                .map(([nombre]) => nombre);
              // Relaciones comprobadas con contains(): cada encabezado de la cita está dentro, fuera o es antecesor del contenedor.
              const relacionEncabezados = encabezados.map((encabezado) => (e.contains(encabezado) ? 'dentro' : encabezado.contains(e) ? 'antecesor' : 'fuera')).join(', ') || 'sin encabezado';
              return `${describir(e)} · encabezado de la cita: ${relacionEncabezados} · hijos en orden: ${hijos.join(' , ') || 'ninguno'} · contiene: ${contiene.join(', ') || 'nada más'} · textContent completo (${normalizar(e.textContent ?? '').length} caracteres) · ${filtroEn(e)} · ruta ${rutaDesde(e, cita)}`;
            })
            .join(' | ') || '—',
        interactivos: dentro.filter((e) => e.matches('button, [role="button"], a[href], [tabindex]')).map(describir).join(', ') || '—',
      });
    }
  });

  const resumen = {
    rf04Activa: (document.querySelector('style[data-veilix-estilo="mensajes-conversacion"]')?.textContent ?? '') !== '',
    rf01Activa: (document.querySelector('style[data-veilix-estilo="nombres"]')?.textContent ?? '') !== '',
    atajoPulsado: document.documentElement.hasAttribute('data-veilix-revelar-mensajes-conversacion'),
    cursorSobreLaConversacion: principal.matches(':hover'),
    elementoConFoco: document.activeElement && document.activeElement !== document.body ? describir(document.activeElement) : 'ninguno',
    respuestasAEstados: respuestasAEstados.length,
    posiblesRespuestasAEstados: seleccion.filter((m) => m.tipo === 'posible respuesta a un estado').length,
    citasConMiniatura: seleccion.filter((m) => m.tipo === 'cita con miniatura').length,
    citasConvencionales: seleccion.filter((m) => m.tipo === 'cita convencional').length,
    imagenesVisiblesEnCitas: elementos.filter((f) => f.enUnaCita === 'sí' && f.encimaDelCentro !== '—' && !f.elemento.startsWith('svg') && f.filtro.startsWith('NO')).length,
  };

  console.log('Veilix · respuestas a estados (RF-04): resumen.');
  console.table([resumen]);
  console.log('Veilix · rasgos de cada cita (para distinguir una respuesta a un estado de una cita convencional):');
  console.table(rasgos);
  console.log('Veilix · textos e imágenes de cada mensaje:');
  console.table(elementos.map((fila) => Object.fromEntries(Object.entries(fila).filter(([clave]) => clave !== 'encimaDelCentro'))));
  console.log('Veilix · resumen (JSON):\n' + JSON.stringify({ resumen, rasgos, elementos }, null, 2) + '\n\nVeilix · estructura anonimizada:\n' + esqueletos.join('\n\n'));
})();

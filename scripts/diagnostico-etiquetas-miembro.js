/* global document, getComputedStyle, console, Node, window, setTimeout -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de las etiquetas de miembro («Member Tags») de los
 * grupos de WhatsApp Web (RF-01): el apodo o rol personalizado que WhatsApp
 * muestra junto al nombre de un participante y que RF-01 deja visible.
 *
 * No supone la estructura ni reconoce ningún texto concreto. En cada mensaje
 * de la conversación clasifica cada elemento con texto propio por su zona:
 * - autor (`[data-testid="author"]`, que ya difumina RF-01);
 * - cuerpo (el texto que difumina RF-04: `[data-pre-plain-text]`,
 *   `.selectable-text`);
 * - hora y estado (`msg-meta`);
 * - cita (`quoted-message`: su autor, su texto citado y cualquier otro texto,
 *   «OTRO (en la cita)»);
 * - OTRO: cualquier texto fuera de esas zonas. Ahí debería estar la etiqueta.
 * De cada texto OTRO muestra su relación con el autor (hermano, antes o
 * después, niveles hasta el antecesor común, si está en la misma línea), con
 * el cuerpo y con `msg-container`; los `data-testid` de su cadena; las reglas
 * de Veilix que lo alcanzan; dónde está el filtro y si hay dos filtros
 * apilados. Revisa también las citas, el recuadro «Responder» y el panel
 * derecho («Info. del grupo», participantes), sin ampliar nada.
 *
 * Revelado: hace dos pasadas. La primera, con el cursor fuera. La segunda, a
 * los 8 segundos, con el cursor sobre el mensaje que muestra la etiqueta:
 * compara el filtro de cada texto entre las dos.
 *
 * Sección focalizada (candidatos a etiqueta): de cada texto OTRO no genérico
 * de un mensaje muestra su cadena de antecesores hasta `msg-container`, sus
 * atributos (solo nombres, salvo los estructurales), el control que lo
 * contiene y qué incluye ese control, su relación con el autor, su firma
 * estructural y cuántos mensajes la comparten, la unidad mínima que podría
 * difuminar RF-01 (sin controles, autor ni cuerpo) y si eso crearía filtros
 * superpuestos. Lee las hojas de Veilix de la página (`style[data-veilix-estilo]`)
 * para decir qué selector exacto de qué módulo difumina cada elemento, y
 * detalla cada filtro doble. Para reconocerlos en pantalla, rodea cada
 * candidato con un borde discontinuo durante 60 segundos (atributo temporal
 * `data-veilix-diagnostico-candidato` y una hoja `style[data-veilix-diagnostico]`,
 * que se retiran solos; no cambia ningún texto ni nodo de WhatsApp).
 *
 * Uso:
 * 1. Con RF-01, RF-02 y RF-04 activadas, abre el grupo y desplázate hasta que
 *    se vea algún mensaje con una etiqueta de miembro (por ejemplo, junto al
 *    nombre de un participante).
 * 2. Deja el cursor sobre la lista de chats, sin pulsar ninguna tecla. Abre
 *    la consola (F12), pega este archivo completo y pulsa Intro.
 * 3. Cuando la consola lo indique, coloca el cursor sobre el mensaje que
 *    muestra la etiqueta y déjalo quieto hasta que aparezca la segunda pasada.
 * 4. Si puedes, repite con un mensaje propio, con una respuesta (cita) a un
 *    participante con etiqueta y con «Info. del grupo» › participantes abierto.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. Lo único que añade es la marca
 *   temporal de los candidatos, que retira a los 60 segundos. No mueve el
 *   foco, no pulsa teclas, no descarga nada ni hace peticiones.
 * - No muestra nombres, etiquetas, teléfonos, mensajes, `id`, `data-id`,
 *   `title`, `aria-label`, `alt`, `data-pre-plain-text` ni direcciones.
 * - Solo muestran su texto los textos genéricos de una lista cerrada
 *   («Admin», «Tú», «Reenviado»…). Del resto, la longitud y su forma (parece
 *   teléfono, hora, empieza por «~»), y una clase anónima («T1», «T2»…) que
 *   solo indica qué textos son iguales entre sí, en cualquier zona, sin
 *   mostrarlos.
 * - Los `data-testid` se anonimizan. Revisa el resultado antes de compartirlo.
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
  const MAXIMO_MENSAJES = 10;
  const MAXIMO_NODOS = 70;
  const RETRASO_MS = 8000;
  const DURACION_MARCA_MS = 60000;
  const MARCA = 'data-veilix-diagnostico-candidato';
  // Una ejecución anterior pudo dejar marcas: se retiran antes de examinar nada.
  for (const e of document.querySelectorAll(`[${MARCA}]`)) e.removeAttribute(MARCA);
  document.querySelector('style[data-veilix-diagnostico]')?.remove();
  /** Textos genéricos de la interfaz (español e inglés). Cualquier otro texto se anonimiza. */
  const GENERICOS = new Set([
    'tú', 'you', 'admin', 'admin.', 'admin. del grupo', 'admin del grupo', 'group admin', 'administrador', 'administradora',
    'reenviado', 'forwarded', 'reenviado muchas veces', 'forwarded many times', 'editado', 'edited', 'fijado', 'pinned',
    'destacado', 'starred', 'leer más', 'read more', 'mensaje eliminado', 'se eliminó este mensaje', 'this message was deleted',
    'eliminaste este mensaje', 'you deleted this message', 'esperando el mensaje', 'waiting for this message', '·', '•', '~',
    'hoy', 'ayer', 'today', 'yesterday', 'participantes', 'participants', 'miembros', 'members', 'info. del grupo', 'group info',
  ]);

  const CONTENEDOR = ':is([data-testid="msg-container"], .message-in, .message-out)';
  const AUTOR = '[data-testid="author"]';
  const CUERPO = '[data-pre-plain-text], .selectable-text, [data-testid="selectable-text"]';
  const META = '[data-testid="msg-meta"]';
  const CITA = '[data-testid="quoted-message"]';
  const principal = document.querySelector('#main');

  const normalizar = (texto) => texto.replace(/[‎‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
  const textoPropio = (elemento) =>
    normalizar(
      [...elemento.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join(''),
    );
  // Clases anónimas de igualdad, en una sola serie para todas las zonas: el mismo texto recibe la misma clase, sin mostrarse nunca.
  const clases = new Map();
  const claseDe = (texto) => {
    if (!clases.has(texto)) clases.set(texto, `T${clases.size + 1}`);
    return clases.get(texto);
  };
  const describirTexto = (texto) => {
    if (GENERICOS.has(texto.toLowerCase())) return `GENÉRICO=«${texto}»`;
    const partes = [`texto(${texto.length}) ${claseDe(texto)}`];
    const digitos = texto.replace(/\D/g, '');
    if (/^[+~\s]*[\d\s().-]{7,}$/.test(texto) && digitos.length >= 6) partes.push('PARECE-TELÉFONO');
    else if (/^\d{1,2}[:.]\d{2}\s?([ap]\.?\s?m\.?)?$/i.test(texto)) partes.push('PARECE-HORA');
    if (/^~/.test(texto)) partes.push('EMPIEZA-POR-TILDE');
    if (/\p{Extended_Pictographic}/u.test(texto)) partes.push('CON-EMOJI');
    return partes.join(' ');
  };
  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');
  const describir = (elemento) => {
    const partes = [elemento.localName + clasesSemanticas(elemento)];
    for (const atributo of ['role', 'data-testid', 'data-icon', 'tabindex', 'dir', 'aria-hidden']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['id', 'data-id', 'aria-label', 'title', 'alt', 'style', 'data-pre-plain-text']) {
      if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    }
    for (const atributo of elemento.getAttributeNames()) if (atributo.startsWith('data-veilix-') && atributo !== MARCA) partes.push(`[${atributo}]`);
    const texto = textoPropio(elemento);
    if (texto) partes.push(` ${describirTexto(texto)}`);
    return partes.join('');
  };

  // Reglas de Veilix que pueden alcanzar estos elementos (mismos selectores que `selectores.ts` y los módulos).
  const REGLAS = [
    ['RF-01 autor', `#main ${AUTOR}`],
    ['RF-01 remitente (marca)', '[data-veilix-remitente]'],
    ['RF-01 encabezado', '#main header :is(span[dir="auto"], span[title])'],
    ['RF-01 fila de contacto (marca)', '[data-veilix-fila-contacto] [data-veilix-nombre-contacto]'],
    ['RF-01 «Info. del contacto»', '[data-testid="drawer-right"] [data-testid="chat-info-drawer"] [data-testid~="contact-info-subtitle"]'],
    ['RF-04 texto', `#main ${CONTENEDOR} :is([data-pre-plain-text], .selectable-text:not([data-pre-plain-text] *))`],
    ['RF-04 cita «Responder»', '#main footer [data-testid="quoted-message"] [data-testid="selectable-text"]'],
    ['RF-04 hora (marca)', '[data-veilix-hora-mensaje]'],
    ['RF-04 encabezado de estado (marca)', '[data-veilix-encabezado-estado]'],
    ['RF-04 duración de cita (marca)', '[data-veilix-duracion-cita]'],
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
  const filtroEn = (elemento) => {
    const filtros = [];
    for (let actual = elemento, niveles = 0; actual; actual = actual.parentElement, niveles++) {
      const filtro = getComputedStyle(actual).filter;
      if (filtro !== 'none') filtros.push(niveles === 0 ? `propio ${filtro}` : `antecesor (${niveles} arriba) ${filtro}`);
    }
    if (filtros.length === 0) return 'NO difuminado';
    return filtros.length > 1 ? `FILTRO-DOBLE: ${filtros.join(' | ')}` : filtros[0];
  };
  const testIdsCadena = (elemento, limite) => {
    const lista = [];
    for (let actual = elemento.parentElement; actual && actual !== limite; actual = actual.parentElement) {
      const valor = actual.getAttribute('data-testid');
      if (valor) lista.push(limpiarTestId(valor));
    }
    return lista.join(' < ') || '—';
  };
  const visible = (e) => {
    const caja = e.getBoundingClientRect();
    return caja.width > 0 && caja.height > 0 && caja.bottom > 0 && caja.top < window.innerHeight;
  };

  /** Zona de un texto dentro de un mensaje. */
  const zonaEnMensaje = (e) => {
    const enCita = e.closest(CITA) !== null;
    if (e.closest(AUTOR)) return enCita ? 'autor de la cita' : 'autor';
    if (enCita) return e.closest(CUERPO) ? 'texto citado' : 'OTRO (en la cita)';
    if (e.closest(META)) return 'hora y estado';
    if (e.closest(CUERPO)) return 'cuerpo';
    if (e.closest('button, [role="button"]')) return 'OTRO (dentro de un control)';
    return 'OTRO';
  };
  const antecesorComun = (a, b) => {
    const cadena = new Set();
    for (let actual = a; actual; actual = actual.parentElement) cadena.add(actual);
    for (let actual = b; actual; actual = actual.parentElement) if (cadena.has(actual)) return actual;
    return null;
  };
  const niveles = (desde, hasta) => {
    let n = 0;
    for (let actual = desde; actual && actual !== hasta; actual = actual.parentElement) n++;
    return n;
  };
  /** Relación estructural de un texto con otro elemento del mismo mensaje. */
  const relacion = (texto, otro) => {
    if (!otro) return 'sin ese elemento';
    if (otro.contains(texto)) return 'DENTRO';
    if (texto.contains(otro)) return 'LO CONTIENE';
    const comun = antecesorComun(texto, otro);
    const posicion = otro.compareDocumentPosition(texto) & Node.DOCUMENT_POSITION_FOLLOWING ? 'después' : 'antes';
    const hermanos = texto.parentElement === otro.parentElement ? 'HERMANO' : 'no hermano';
    const a = texto.getBoundingClientRect();
    const b = otro.getBoundingClientRect();
    const linea = a.top < b.bottom && b.top < a.bottom ? 'MISMA-LÍNEA' : a.top >= b.bottom ? 'debajo' : 'encima';
    return `${hermanos}, ${posicion}, ${linea}, antecesor común ${niveles(texto, comun)}↑ / ${niveles(otro, comun)}↑ (${comun ? describir(comun) : '—'})`;
  };

  // Elementos que se siguen entre las dos pasadas.
  const seguidos = [];

  const examinarMensajes = () => {
    const mensajes = principal ? [...principal.querySelectorAll(CONTENEDOR)].filter((m) => !m.parentElement.closest(CONTENEDOR) && visible(m)) : [];
    const conAutor = mensajes.filter((m) => m.querySelector(AUTOR));
    const elegidos = [...new Set([...conAutor, ...mensajes])].slice(-MAXIMO_MENSAJES);
    const filas = [];
    const esqueletos = [];
    elegidos.forEach((mensaje, i) => {
      const n = i + 1;
      const autores = [...mensaje.querySelectorAll(AUTOR)].filter((a) => !a.parentElement.closest(AUTOR));
      const autor = autores.find((a) => !a.closest(CITA)) ?? null;
      const cuerpo = [...mensaje.querySelectorAll(CUERPO)].find((c) => !c.closest(CITA) && !c.parentElement.closest(CUERPO)) ?? null;
      const textos = [...mensaje.querySelectorAll('*')].filter((e) => textoPropio(e) && !e.closest('svg'));
      const porZona = {};
      for (const e of textos) {
        const zona = zonaEnMensaje(e);
        porZona[zona] = (porZona[zona] ?? 0) + 1;
        if (zona === 'cuerpo') continue;
        seguidos.push(e);
        filas.push({
          mensaje: n,
          direccion: mensaje.closest('.message-out') || mensaje.matches('.message-out') ? 'enviado' : mensaje.closest('.message-in') || mensaje.matches('.message-in') ? 'recibido' : '¿?',
          zona,
          elemento: describir(e),
          relacionConElAutor: zona === 'autor' ? '—' : relacion(e, autor),
          relacionConElCuerpo: relacion(e, cuerpo),
          testIdsHastaElMensaje: testIdsCadena(e, mensaje),
          reglas: reglas(e),
          marcasVeilix: marcasVeilix(e),
          filtro: filtroEn(e),
          seguimiento: seguidos.length,
        });
      }
      // Esqueleto de la parte superior del mensaje: desde el antecesor común del autor y los textos OTRO.
      const otros = textos.filter((e) => zonaEnMensaje(e).startsWith('OTRO'));
      const raiz = [autor, ...otros].filter(Boolean).reduce((acc, e) => (acc ? antecesorComun(acc, e) : e), null);
      if (raiz && raiz !== mensaje && mensaje.contains(raiz) && otros.length) {
        const lineas = [];
        const recorrer = (elemento, nivel) => {
          if (lineas.length >= MAXIMO_NODOS) return;
          const zona = textoPropio(elemento) ? ` · ${zonaEnMensaje(elemento)}` : '';
          lineas.push(`${'  '.repeat(nivel)}${describir(elemento)}${zona} · ${filtroEn(elemento) === 'NO difuminado' ? 'visible' : 'difuminado'}`);
          if (elemento.localName === 'svg' || (elemento.matches(CUERPO) && !elemento.contains(autor))) return;
          for (const hijo of elemento.children) recorrer(hijo, nivel + 1);
        };
        recorrer(raiz, 0);
        esqueletos.push(`Mensaje ${n}: antecesor común del autor y los textos OTRO (${niveles(raiz, mensaje)} niveles bajo el mensaje; ${testIdsCadena(raiz, mensaje.parentElement)})\n${lineas.join('\n')}`);
      }
      filas.push({ mensaje: n, zona: 'resumen', elemento: `autor: ${autor ? 'sí' : 'no'} · textos por zona: ${Object.entries(porZona).map(([z, c]) => `${z}=${c}`).join(', ') || 'ninguno'}`, filtro: '' });
    });
    return { mensajes: elegidos.length, conAutor: conAutor.length, filas, esqueletos };
  };

  // Otras zonas (sin ampliar nada): recuadro «Responder» y panel derecho (información del grupo, participantes).
  const examinarOtrasZonas = () => {
    const filas = [];
    const responder = document.querySelector('#main footer [data-testid="quoted-message"]');
    if (responder) {
      for (const e of [...responder.querySelectorAll('*')].filter((x) => textoPropio(x) && !x.closest('svg'))) {
        seguidos.push(e);
        filas.push({ zona: 'recuadro «Responder»', subzona: e.closest(AUTOR) ? 'autor' : e.closest(CUERPO) ? 'texto citado' : 'OTRO', elemento: describir(e), reglas: reglas(e), filtro: filtroEn(e), seguimiento: seguidos.length });
      }
    }
    const panel = document.querySelector('[data-testid="drawer-right"]');
    if (panel && visible(panel)) {
      const conAvatar = [...panel.querySelectorAll('[role="listitem"], [role="row"], [role="button"], button')].filter(
        (f) => visible(f) && f.querySelector('img, svg:has(image), [data-icon^="default-"]') && !f.parentElement.closest('[role="listitem"], [role="row"]'),
      );
      conAvatar.slice(0, 8).forEach((fila, i) => {
        for (const e of [...fila.querySelectorAll('*')].filter((x) => textoPropio(x) && !x.closest('svg'))) {
          seguidos.push(e);
          filas.push({ zona: `panel derecho, fila ${i + 1}`, subzona: e.closest('span[title]') ? 'span[title]' : '—', elemento: describir(e), reglas: reglas(e), filtro: filtroEn(e), seguimiento: seguidos.length });
        }
      });
    }
    return filas;
  };

  const contexto = {
    hayConversacion: Boolean(principal),
    veilixCargado: document.querySelectorAll('style[data-veilix-estilo]').length > 0,
    estilosDeVeilix: [...document.querySelectorAll('style[data-veilix-estilo]')].map((e) => e.getAttribute('data-veilix-estilo')).join(', ') || 'ninguno',
    atajoPulsado: [...document.documentElement.getAttributeNames()].some((a) => a.startsWith('data-veilix-revelar-')),
    panelDerechoAbierto: Boolean(document.querySelector('[data-testid="drawer-right"]')),
  };
  const enMensajes = examinarMensajes();
  const otrasZonas = examinarOtrasZonas();
  const otros = enMensajes.filas.filter((f) => typeof f.zona === 'string' && f.zona.startsWith('OTRO'));
  const resumen = {
    ...contexto,
    mensajesExaminados: enMensajes.mensajes,
    mensajesConAutor: enMensajes.conAutor,
    textosOtroEnMensajes: otros.length,
    textosOtroVisibles: otros.filter((f) => f.filtro === 'NO difuminado' && !/GENÉRICO=/.test(f.elemento)).length,
    textosOtroEnLaMismaLineaQueElAutor: otros.filter((f) => /MISMA-LÍNEA/.test(f.relacionConElAutor)).length,
    textosOtroHermanosDelAutor: otros.filter((f) => /^HERMANO/.test(f.relacionConElAutor)).length,
    filtrosDobles: [...enMensajes.filas, ...otrasZonas].filter((f) => String(f.filtro).startsWith('FILTRO-DOBLE')).length,
    textosEnOtrasZonas: otrasZonas.length,
  };

  console.log('Veilix · etiquetas de miembro (RF-01): resumen (pasada 1, cursor fuera).');
  console.table([resumen]);
  console.log('Veilix · textos de los mensajes fuera del cuerpo (autor, OTRO, hora, cita):');
  console.table(enMensajes.filas);
  if (otrasZonas.length) {
    console.log('Veilix · recuadro «Responder» y panel derecho:');
    console.table(otrasZonas);
  }
  console.log(
    'Veilix · resumen (JSON):\n' +
      JSON.stringify({ resumen, mensajes: enMensajes.filas, otrasZonas }, null, 2) +
      `\n\nVeilix · estructura anonimizada:\n${enMensajes.esqueletos.join('\n\n') || '(ningún mensaje con textos OTRO)'}`,
  );

  // --- Sección focalizada: candidatos a etiqueta de miembro y filtros dobles ---

  /** Selectores de las reglas de difuminado de Veilix en la página, separados por comas de primer nivel. */
  const partir = (lista) => {
    const partes = [];
    let nivel = 0;
    let actual = '';
    for (const c of lista) {
      if (c === '(' || c === '[') nivel++;
      else if (c === ')' || c === ']') nivel--;
      if (c === ',' && nivel === 0) {
        partes.push(actual.trim());
        actual = '';
      } else actual += c;
    }
    if (actual.trim()) partes.push(actual.trim());
    return partes;
  };
  const MODULOS = { nombres: 'RF-01', fotos: 'RF-02', 'mensajes-recientes': 'RF-03', 'mensajes-conversacion': 'RF-04', 'campo-entrada': 'RF-05' };
  const selectoresVeilix = [];
  for (const estilo of document.querySelectorAll('style[data-veilix-estilo]')) {
    const modulo = estilo.getAttribute('data-veilix-estilo');
    let reglasCss;
    try {
      reglasCss = [...(estilo.sheet?.cssRules ?? [])];
    } catch {
      continue;
    }
    for (const regla of reglasCss) {
      if (!regla.selectorText || !/blur/.test(regla.style?.getPropertyValue('filter') ?? '')) continue;
      partir(regla.selectorText).forEach((selector, i) => {
        selectoresVeilix.push({ modulo: `${MODULOS[modulo] ?? modulo} (${modulo})`, n: i + 1, selector });
      });
    }
  }
  /** Selectores de difuminado de Veilix que alcanzan exactamente este elemento (no sus antecesores). */
  const difuminadoPor = (e) =>
    selectoresVeilix
      .filter((r) => {
        try {
          return e.matches(r.selector);
        } catch {
          return false;
        }
      })
      // Todos empiezan por su contenedor: se muestra el final, que es el objetivo.
      .map((r) => `${r.modulo} selector ${r.n}: ${r.selector.length > 120 ? `…${r.selector.slice(-120)}` : r.selector}`);

  const CONTROL = 'button, [role="button"], a[href], [role="link"], [tabindex]:not([tabindex="-1"])';
  const textosDe = (raiz) => [raiz, ...raiz.querySelectorAll('*')].filter((x) => textoPropio(x) && !x.closest('svg'));
  const firma = (e, hasta) => {
    const pasos = [];
    for (let actual = e; actual && actual !== hasta; actual = actual.parentElement) {
      const testid = actual.getAttribute('data-testid');
      const rol = actual.getAttribute('role');
      pasos.unshift(`${actual.localName}${rol ? `[role=${rol}]` : ''}${testid ? `[data-testid=${limpiarTestId(testid)}]` : ''}`);
    }
    return pasos.join(' > ');
  };

  const candidatos = [];
  const mensajesExaminados = principal ? [...principal.querySelectorAll(CONTENEDOR)].filter((m) => !m.parentElement.closest(CONTENEDOR) && visible(m)) : [];
  for (const mensaje of mensajesExaminados) {
    const autor = [...mensaje.querySelectorAll(AUTOR)].find((a) => !a.parentElement.closest(AUTOR) && !a.closest(CITA)) ?? null;
    const cuerpo = [...mensaje.querySelectorAll(CUERPO)].find((c) => !c.closest(CITA) && !c.parentElement.closest(CUERPO)) ?? null;
    for (const e of textosDe(mensaje)) {
      const zona = zonaEnMensaje(e);
      const texto = textoPropio(e);
      if (!zona.startsWith('OTRO') || GENERICOS.has(texto.toLowerCase()) || /^\d{1,2}[:.]\d{2}/.test(texto)) continue;
      candidatos.push({ e, mensaje, autor, cuerpo, zona });
    }
  }

  const tablaCandidatos = [];
  const cadenas = [];
  const firmas = new Map();
  candidatos.forEach((c, i) => {
    const id = `C${i + 1}`;
    const { e, mensaje, autor, cuerpo } = c;
    const control = e.closest(CONTROL);
    const controlDentroDelMensaje = control && mensaje.contains(control) ? control : null;
    // Unidad mínima: se sube mientras el antecesor no sea un control, no contenga el autor, el cuerpo, imágenes ni otros textos.
    let unidad = e;
    for (let padre = e.parentElement; padre && padre !== mensaje; padre = padre.parentElement) {
      if (padre.matches(CONTROL) || (autor && padre.contains(autor)) || (cuerpo && padre.contains(cuerpo))) break;
      if (padre.querySelector('img, svg, video, canvas, button, [role="button"]')) break;
      if (textosDe(padre).some((x) => !unidad.contains(x))) break;
      unidad = padre;
    }
    const filtrosEncima = [];
    for (let actual = unidad.parentElement; actual; actual = actual.parentElement) if (getComputedStyle(actual).filter !== 'none') filtrosEncima.push(describir(actual));
    const firmaCandidato = firma(e, mensaje);
    firmas.set(firmaCandidato, [...(firmas.get(firmaCandidato) ?? []), id]);
    const estilo = getComputedStyle(e);
    tablaCandidatos.push({
      candidato: id,
      mensaje: mensajesExaminados.indexOf(mensaje) + 1,
      zona: c.zona,
      elemento: describir(e),
      atributos: e.getAttributeNames().filter((a) => a !== MARCA).join(', ') || '—',
      propiedadesDelStyleEnLinea: [...e.style].join(', ') || '—',
      aspecto: `color ${estilo.color} · peso ${estilo.fontWeight} · tamaño ${estilo.fontSize} · display ${estilo.display}`,
      control: controlDentroDelMensaje ? describir(controlDentroDelMensaje) : 'ninguno',
      elControlContiene: controlDentroDelMensaje
        ? [
            autor && controlDentroDelMensaje.contains(autor) ? 'EL AUTOR' : null,
            cuerpo && controlDentroDelMensaje.contains(cuerpo) ? 'EL CUERPO' : null,
            controlDentroDelMensaje.querySelector('img') ? 'img' : null,
            controlDentroDelMensaje.querySelector('svg, [data-icon]') ? 'icono' : null,
            `${textosDe(controlDentroDelMensaje).length} textos`,
          ].filter(Boolean).join(', ')
        : '—',
      elControlEstaDentroDelAutor: controlDentroDelMensaje && autor?.contains(controlDentroDelMensaje) ? 'sí' : 'no',
      atributosDelControl: controlDentroDelMensaje ? ['aria-haspopup', 'aria-expanded', 'aria-pressed', 'tabindex', 'role'].map((a) => `${a}=${controlDentroDelMensaje.getAttribute(a) ?? '—'}`).join(' · ') : '—',
      relacionConElAutor: relacion(e, autor),
      mismoControlQueElAutor: controlDentroDelMensaje && autor && controlDentroDelMensaje.contains(autor) ? 'sí' : 'no',
      firma: firmaCandidato,
      unidadPropuesta: `${unidad === e ? 'el propio texto' : `${niveles(e, unidad)} nivel(es) por encima`}: ${describir(unidad)}`,
      filtrosVeilixDeLaUnidad: difuminadoPor(unidad).join(' | ') || 'ninguno',
      filtrosEnAntecesoresDeLaUnidad: filtrosEncima.length ? `SÍ (se superpondrían): ${filtrosEncima.join(' | ')}` : 'ninguno',
      dentroDeUnaFilaDeMensaje: unidad.closest('#main [data-id]') ? 'sí ([data-id])' : 'no',
      filtroActual: filtroEn(e),
    });
    const lineas = [];
    for (let actual = e, nivel = 0; actual && actual !== mensaje.parentElement; actual = actual.parentElement, nivel++) {
      lineas.push({
        candidato: id,
        nivel,
        elemento: describir(actual),
        hijos: actual.children.length,
        textosDentro: textosDe(actual).length,
        contieneAlAutor: autor && actual.contains(autor) ? 'sí' : 'no',
        contieneAlCuerpo: cuerpo && actual.contains(cuerpo) ? 'sí' : 'no',
        esControl: actual.matches(CONTROL) ? 'sí' : 'no',
        filtroPropio: getComputedStyle(actual).filter,
        difuminadoPor: difuminadoPor(actual).join(' | ') || '—',
      });
      if (actual === mensaje) break;
    }
    cadenas.push(...lineas);
  });
  // Firmas repetidas en mensajes distintos: indicio de un contenedor reutilizable.
  const tablaFirmas = [...firmas.entries()].map(([f, ids]) => ({ firma: f, candidatos: ids.join(', '), veces: ids.length }));

  // Filtros dobles: cada elemento filtrado de la cadena y qué selector de Veilix lo difumina.
  const zonasConTexto = [principal, document.querySelector('[data-testid="drawer-right"]')].filter(Boolean);
  const dobles = [];
  for (const zona of zonasConTexto) {
    for (const e of textosDe(zona)) {
      if (!filtroEn(e).startsWith('FILTRO-DOBLE') || dobles.length >= 30) continue;
      const n = new Set(dobles.map((d) => d.caso)).size + 1;
      for (let actual = e, nivel = 0; actual; actual = actual.parentElement, nivel++) {
        const filtro = getComputedStyle(actual).filter;
        if (filtro === 'none') continue;
        dobles.push({
          caso: n,
          zonaDelTexto: e.closest(CONTENEDOR) ? zonaEnMensaje(e) : e.closest('#main footer') ? 'pie de #main' : 'panel derecho',
          nivel,
          elemento: describir(actual),
          filtro,
          difuminadoPor: difuminadoPor(actual).join(' | ') || 'ningún selector de Veilix (¿filtro de WhatsApp?)',
          // Qué regla conocida de Veilix coincide con este mismo elemento (no con un antecesor).
          coincideCon: REGLAS.filter(([, selector]) => {
            try {
              return actual.matches(selector);
            } catch {
              return false;
            }
          }).map(([nombre]) => nombre).join(' + ') || '—',
        });
      }
    }
  }

  // Marca temporal para reconocer los candidatos en pantalla.
  if (candidatos.length) {
    candidatos.forEach((c, i) => {
      c.e.setAttribute(MARCA, `C${i + 1}`);
    });
    const hoja = document.createElement('style');
    hoja.setAttribute('data-veilix-diagnostico', '');
    hoja.textContent = `[${MARCA}] { outline: 2px dashed #d0007a !important; outline-offset: 2px !important; }`;
    document.head.append(hoja);
    setTimeout(() => {
      for (const e of document.querySelectorAll(`[${MARCA}]`)) e.removeAttribute(MARCA);
      hoja.remove();
      console.log('Veilix · marcas temporales de los candidatos retiradas.');
    }, DURACION_MARCA_MS);
  }

  console.log(`Veilix · candidatos a etiqueta de miembro: ${candidatos.length}. En pantalla, cada uno está rodeado con un borde discontinuo durante ${DURACION_MARCA_MS / 1000} segundos; en las herramientas de desarrollo, búscalos con el selector [${MARCA}="C1"].`);
  console.table(tablaCandidatos);
  console.log('Veilix · cadena de antecesores de cada candidato hasta el mensaje:');
  console.table(cadenas);
  console.log('Veilix · firmas estructurales de los candidatos:');
  console.table(tablaFirmas);
  console.log('Veilix · filtros dobles (cada elemento filtrado de la cadena):');
  console.table(dobles.length ? dobles : [{ aviso: 'ningún filtro doble' }]);
  console.log('Veilix · sección focalizada (JSON):\n' + JSON.stringify({ selectoresVeilixLeidos: selectoresVeilix.length, candidatos: tablaCandidatos, cadenas, firmas: tablaFirmas, filtrosDobles: dobles }, null, 2));

  // Segunda pasada: el filtro de los mismos elementos con el cursor sobre el mensaje.
  const antes = seguidos.map(filtroEn);
  console.log(`Veilix · ahora coloca el cursor sobre el mensaje que muestra la etiqueta y déjalo quieto: la segunda pasada se hace en ${RETRASO_MS / 1000} segundos.`);
  setTimeout(() => {
    const revelado = seguidos
      .map((e, i) => {
        const despues = e.isConnected ? filtroEn(e) : 'ya no está en la página';
        const fila = e.closest('#main [data-id]') ?? e.closest(CONTENEDOR);
        return {
          seguimiento: i + 1,
          zona: e.closest(CONTENEDOR) ? zonaEnMensaje(e) : e.closest('#main footer') ? 'recuadro «Responder»' : 'panel derecho',
          antes: antes[i],
          despues,
          cambio: antes[i] === despues ? 'igual' : 'CAMBIÓ',
          cursorSobreSuMensaje: fila?.matches(':hover') ? 'sí' : 'no',
          cursorSobreElPropioTexto: e.matches(':hover') ? 'sí' : 'no',
          focoDentroDeSuMensaje: fila?.matches(':focus-within') ? 'sí' : 'no',
          atajoPulsado: [...document.documentElement.getAttributeNames()].some((a) => a.startsWith('data-veilix-revelar-')) ? 'sí' : 'no',
        };
      })
      .filter((f) => f.cambio === 'CAMBIÓ' || f.cursorSobreSuMensaje === 'sí');
    console.log('Veilix · pasada 2 (cursor sobre el mensaje): elementos del mensaje bajo el cursor o cuyo filtro cambió.');
    console.table(revelado.length ? revelado : [{ aviso: 'el cursor no estaba sobre ningún mensaje examinado y ningún filtro cambió' }]);
    console.log('Veilix · pasada 2 (JSON):\n' + JSON.stringify(revelado, null, 2));
  }, RETRASO_MS);
})();

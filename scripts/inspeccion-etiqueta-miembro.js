/* global document, getComputedStyle, console, Node, window, setTimeout, $0 -- fragmento para la consola de DevTools */
/**
 * Inspección PUNTUAL y ANONIMIZADA de una etiqueta de miembro («Member Tag»)
 * elegida a mano en DevTools (RF-01), para decidir si existe un selector
 * estructural seguro antes de difuminarla.
 *
 * La etiqueta se identifica sin ambigüedad porque la eliges tú: clic derecho
 * sobre ella en la conversación → «Inspeccionar». DevTools la selecciona y la
 * consola la expone como `$0`. Si no hay ninguna selección, se usa el
 * candidato C1 que marca `diagnostico-etiquetas-miembro.js` durante 60 s.
 *
 * Muestra:
 * 1. La cadena de antecesores hasta `msg-container`, con todos los nombres de
 *    atributos (solo los valores estructurales: `role`, `tabindex`, `dir`,
 *    `data-testid` anonimizado) y, en cada nivel, sus hermanos resumidos:
 *    si contienen al autor, el cuerpo, una cita, la hora, imágenes o iconos.
 * 2. El control que la contiene y su relación con la rama del autor y la del
 *    cuerpo dentro del antecesor común (posición entre hermanos).
 * 3. Las COLISIONES: para cada variante de selector estructural que podría
 *    usarse, cuántos elementos de la conversación alcanza, si alcanza la
 *    etiqueta elegida y qué son los demás (zona, si el mensaje tiene autor,
 *    texto genérico o anonimizado). Una variante solo es segura si alcanza la
 *    etiqueta y nada más que etiquetas.
 * 4. Marca en pantalla, durante 60 segundos, la etiqueta elegida (borde
 *    continuo) y las colisiones de cada variante (borde discontinuo), con el
 *    atributo temporal `data-veilix-inspeccion`, que se retira solo.
 *
 * Uso:
 * 1. Con RF-01 y RF-04 activadas, abre el grupo con la etiqueta visible.
 *    Mejor si en la conversación también hay mensajes largos («Leer más»),
 *    enlaces con vista previa, encuestas, stickers, documentos, citas y
 *    reacciones: son los controles con los que podría confundirse.
 * 2. Clic derecho sobre el texto de la etiqueta → «Inspeccionar». En el panel
 *    «Elements», comprueba que está seleccionado el elemento del texto.
 * 3. Pasa a la pestaña «Console», pega este archivo completo y pulsa Intro.
 * 4. Mira la conversación: la etiqueta queda con un borde continuo y las
 *    colisiones con uno discontinuo. Indica qué ves en cada una.
 * 5. Repite en otro grupo o con otra etiqueta si puedes.
 *
 * Privacidad:
 * - No muestra nombres, etiquetas, teléfonos, mensajes, `id`, `data-id`,
 *   `title`, `aria-label`, `alt`, `style` ni clases generadas: de estos
 *   atributos solo indica que existen. Los textos genéricos de una lista
 *   cerrada («Leer más», «Reenviado»…) se muestran; del resto, la longitud.
 * - Solo lee el DOM, salvo la marca temporal. No hace peticiones.
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  const limpiarTestId = (valor) =>
    valor
      .replace(/^(list-item-).+$/, '$1…')
      .replace(/@.*$/, '@…')
      .replace(/[^-_.:@…]*[A-Z][^-_.:@…]*|[^-_.:@…]{25,}/g, '…')
      .replace(/\d+/g, '#');
  const DURACION_MARCA_MS = 60000;
  const MARCA = 'data-veilix-inspeccion';
  const GENERICOS = new Set([
    'leer más', 'read more', 'ver más', 'see more', 'mostrar más', 'show more', 'reenviado', 'forwarded', 'reenviado muchas veces',
    'forwarded many times', 'editado', 'edited', 'tú', 'you', 'admin', 'responder', 'reply', 'ver todo', 'view all', 'ver respuestas',
    'view replies', 'votar', 'vote', 'ver votos', 'view votes', 'abrir', 'open', 'descargar', 'download', 'reproducir', 'play',
    'unirse', 'join', 'ver canal', 'view channel', 'foto', 'photo', 'vídeo', 'video', 'ver una vez', 'view once', '·', '•',
  ]);
  const CONTENEDOR = '[data-testid="msg-container"]';
  const AUTOR = '[data-testid="author"]';
  const CUERPO = '[data-pre-plain-text], .selectable-text, [data-testid="selectable-text"]';
  const CITA = '[data-testid="quoted-message"]';
  const META = '[data-testid="msg-meta"]';
  const CONTROL = 'button, [role="button"], a[href], [role="link"]';

  for (const e of document.querySelectorAll(`[${MARCA}]`)) e.removeAttribute(MARCA);
  document.querySelector('style[data-veilix-inspeccion]')?.remove();

  const normalizar = (texto) => texto.replace(/[‎‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
  const textoPropio = (e) =>
    normalizar([...e.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(''));
  const describirTexto = (texto) => (GENERICOS.has(texto.toLowerCase()) ? `GENÉRICO=«${texto}»` : `texto(${texto.length})`);
  const textosDe = (raiz) => [raiz, ...raiz.querySelectorAll('*')].filter((x) => textoPropio(x) && !x.closest('svg'));
  const describir = (e) => {
    const partes = [e.localName];
    for (const atributo of ['role', 'tabindex', 'dir', 'data-testid', 'data-icon', 'aria-hidden', 'aria-haspopup', 'aria-expanded']) {
      const valor = e.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    const otros = e.getAttributeNames().filter((a) => !['role', 'tabindex', 'dir', 'data-testid', 'data-icon', 'aria-hidden', 'aria-haspopup', 'aria-expanded', MARCA].includes(a));
    if (otros.length) partes.push(`[${otros.join('][')}]`);
    const texto = textoPropio(e);
    if (texto) partes.push(` ${describirTexto(texto)}`);
    return partes.join('');
  };
  const resumirRama = (e) =>
    [
      e.matches(AUTOR) || e.querySelector(AUTOR) ? 'AUTOR' : null,
      e.matches(CUERPO) || e.querySelector(CUERPO) ? 'CUERPO' : null,
      e.matches(CITA) || e.querySelector(CITA) ? 'CITA' : null,
      e.matches(META) || e.querySelector(META) ? 'HORA' : null,
      e.querySelector('img, video, canvas') ? 'imagen' : null,
      e.querySelector('svg, [data-icon]') ? 'icono' : null,
      e.matches(CONTROL) || e.querySelector(CONTROL) ? 'control' : null,
      `${textosDe(e).length} textos`,
    ]
      .filter(Boolean)
      .join(' ');
  const zona = (e) => {
    if (!e.closest(CONTENEDOR)) return e.closest('#main') ? 'en #main, fuera de un mensaje' : 'fuera de #main';
    if (e.closest(AUTOR)) return 'autor';
    if (e.closest(CITA)) return 'cita';
    if (e.closest(META)) return 'hora';
    if (e.closest(CUERPO)) return 'cuerpo';
    return 'OTRO';
  };
  const antecesorComun = (a, b) => {
    const cadena = new Set();
    for (let actual = a; actual; actual = actual.parentElement) cadena.add(actual);
    for (let actual = b; actual; actual = actual.parentElement) if (cadena.has(actual)) return actual;
    return null;
  };
  const ramaEn = (comun, e) => {
    let actual = e;
    while (actual && actual.parentElement !== comun) actual = actual.parentElement;
    return actual;
  };

  // 1) Elemento elegido: `$0` de DevTools o, si no hay, el candidato C1 del diagnóstico.
  let elegido = null;
  let origen = '';
  try {
    if (typeof $0 !== 'undefined' && $0 instanceof window.Element) {
      elegido = $0;
      origen = 'selección de DevTools ($0)';
    }
  } catch {
    // `$0` solo existe en la consola de DevTools.
  }
  if (!elegido) {
    elegido = document.querySelector('[data-veilix-diagnostico-candidato="C1"]');
    origen = 'candidato C1 del diagnóstico';
  }
  if (!elegido) {
    console.log('Veilix · no hay ningún elemento elegido. Haz clic derecho sobre la etiqueta → «Inspeccionar» y vuelve a pegar el fragmento en la consola.');
    return;
  }
  // Si se eligió un contenedor sin texto propio, se baja a su único texto.
  if (!textoPropio(elegido)) {
    const textos = textosDe(elegido);
    if (textos.length === 1) elegido = textos[0];
  }
  const mensaje = elegido.closest(CONTENEDOR);
  const control = elegido.closest(CONTROL);
  const autor = mensaje ? [...mensaje.querySelectorAll(AUTOR)].find((a) => !a.parentElement.closest(AUTOR) && !a.closest(CITA)) ?? null : null;
  const cuerpo = mensaje ? [...mensaje.querySelectorAll(CUERPO)].find((c) => !c.closest(CITA) && !c.parentElement.closest(CUERPO)) ?? null : null;

  const identidad = {
    origen,
    elemento: describir(elegido),
    zona: zona(elegido),
    textosDentroDelElemento: textosDe(elegido).length,
    hijosElemento: elegido.children.length,
    control: control ? describir(control) : 'ninguno',
    textosEnElControl: control ? textosDe(control).length : '—',
    controlContiene: control ? resumirRama(control) : '—',
    elMensajeTieneAutor: autor ? 'sí' : 'no',
    filtroActual: getComputedStyle(elegido).filter,
  };

  // 2) Cadena hasta msg-container, con los hermanos de cada nivel.
  const cadena = [];
  for (let actual = elegido, nivel = 0; actual && actual !== document.body; actual = actual.parentElement, nivel++) {
    const padre = actual.parentElement;
    const hermanos = padre ? [...padre.children] : [];
    cadena.push({
      nivel,
      elemento: describir(actual),
      posicion: `${hermanos.indexOf(actual) + 1} de ${hermanos.length}`,
      contiene: resumirRama(actual),
      hermanos: hermanos.filter((h) => h !== actual).slice(0, 6).map((h) => `${h.localName}${h.getAttribute('role') ? `[role=${h.getAttribute('role')}]` : ''}${h.getAttribute('data-testid') ? `[data-testid=${limpiarTestId(h.getAttribute('data-testid'))}]` : ''} (${resumirRama(h)})`).join(' | ') || '—',
    });
    if (actual.matches(CONTENEDOR)) break;
  }

  // Relación con la rama del autor y la del cuerpo dentro del antecesor común.
  const relaciones = [autor, cuerpo].filter(Boolean).map((otro) => {
    const comun = antecesorComun(elegido, otro);
    const ramaElegido = ramaEn(comun, elegido);
    const ramaOtro = ramaEn(comun, otro);
    const hijos = comun ? [...comun.children] : [];
    return {
      con: otro === autor ? 'autor' : 'cuerpo',
      antecesorComun: comun ? describir(comun) : '—',
      nivelesDesdeElElegido: (() => {
        let n = 0;
        for (let a = elegido; a && a !== comun; a = a.parentElement) n++;
        return n;
      })(),
      ramaDelElegido: ramaElegido ? `${hijos.indexOf(ramaElegido) + 1} de ${hijos.length}: ${describir(ramaElegido)}` : '—',
      ramaDelOtro: ramaOtro ? `${hijos.indexOf(ramaOtro) + 1} de ${hijos.length}: ${describir(ramaOtro)}` : '—',
      contiguas: ramaElegido && ramaOtro && Math.abs(hijos.indexOf(ramaElegido) - hijos.indexOf(ramaOtro)) === 1 ? 'sí' : 'no',
    };
  });

  // 3) Colisiones de cada variante de selector estructural (medidas, no aplicadas).
  const FUERA = ':not(:is([data-testid="author"], [data-testid="quoted-message"], [data-testid="msg-meta"], [data-pre-plain-text], .selectable-text) *)';
  const CONTROL_SIMPLE = 'div[role="button"][tabindex="0"]';
  const SIN_MEDIOS = ':not([data-testid]):not(:has(svg, img, video, canvas, [data-icon], [data-testid], button, [role="button"]))';
  const VARIANTES = [
    ['V1 control con un span como único hijo', `#main ${CONTENEDOR} ${CONTROL_SIMPLE} > span:only-child`],
    ['V2 = V1, control sin data-testid, medios, iconos ni otros controles', `#main ${CONTENEDOR} ${CONTROL_SIMPLE}${SIN_MEDIOS} > span:only-child`],
    ['V3 = V2, fuera del autor, la cita, la hora y el cuerpo', `#main ${CONTENEDOR} ${CONTROL_SIMPLE}${SIN_MEDIOS}${FUERA} > span:only-child:not(:has(*))`],
    ['V4 = V3, solo en mensajes con autor', `#main ${CONTENEDOR}:has(${AUTOR}) ${CONTROL_SIMPLE}${SIN_MEDIOS}${FUERA} > span:only-child:not(:has(*))`],
    // Hipótesis a medir: la rama de la etiqueta es la hermana inmediatamente posterior a una rama que contiene al autor del mensaje.
    ['V5 = V3, en la rama inmediatamente posterior a la del autor', `#main ${CONTENEDOR} *:has(${AUTOR}):not(${CITA}, ${CITA} *) + * ${CONTROL_SIMPLE}${SIN_MEDIOS}${FUERA} > span:only-child:not(:has(*))`],
  ];
  const mensajes = [...document.querySelectorAll(`#main ${CONTENEDOR}`)];
  const colisiones = [];
  const resumenVariantes = VARIANTES.map(([nombre, selector], v) => {
    let lista;
    try {
      lista = [...document.querySelectorAll(selector)];
    } catch {
      return { variante: nombre, error: 'selector no admitido' };
    }
    const otras = lista.filter((e) => e !== elegido);
    otras.slice(0, 12).forEach((e, i) => {
      e.setAttribute(MARCA, `V${v + 1}-${i + 1}`);
      const suMensaje = e.closest(CONTENEDOR);
      colisiones.push({
        variante: `V${v + 1}`,
        marca: `V${v + 1}-${i + 1}`,
        elemento: describir(e),
        zona: zona(e),
        mensaje: mensajes.indexOf(suMensaje) + 1,
        mensajeConAutor: suMensaje?.querySelector(AUTOR) ? 'sí' : 'no',
        control: describir(e.closest(CONTROL) ?? e),
        mismaCadenaQueElElegido: (() => {
          const firma = (x) => {
            const pasos = [];
            for (let a = x; a && !a.matches(CONTENEDOR); a = a.parentElement) pasos.unshift(`${a.localName}${a.getAttribute('role') ? `[role=${a.getAttribute('role')}]` : ''}${a.getAttribute('data-testid') ? `[data-testid=${limpiarTestId(a.getAttribute('data-testid'))}]` : ''}`);
            return pasos.join('>');
          };
          return firma(e) === firma(elegido) ? 'SÍ (misma ruta: ¿otra etiqueta?)' : 'no';
        })(),
      });
    });
    return { variante: nombre, coincidencias: lista.length, incluyeLaElegida: lista.includes(elegido) ? 'sí' : 'NO', otras: otras.length };
  });

  // 4) Marca temporal en pantalla.
  elegido.setAttribute(MARCA, 'ELEGIDA');
  const hoja = document.createElement('style');
  hoja.setAttribute('data-veilix-inspeccion', '');
  hoja.textContent = `[${MARCA}="ELEGIDA"] { outline: 3px solid #d0007a !important; outline-offset: 2px !important; } [${MARCA}]:not([${MARCA}="ELEGIDA"]) { outline: 2px dashed #e07000 !important; outline-offset: 2px !important; }`;
  document.head.append(hoja);
  setTimeout(() => {
    for (const e of document.querySelectorAll(`[${MARCA}]`)) e.removeAttribute(MARCA);
    hoja.remove();
    console.log('Veilix · marcas de la inspección retiradas.');
  }, DURACION_MARCA_MS);

  console.log('Veilix · inspección de la etiqueta de miembro: elemento elegido (borde continuo en pantalla).');
  console.table([identidad]);
  console.log('Veilix · cadena de antecesores hasta el mensaje, con sus hermanos:');
  console.table(cadena);
  console.log('Veilix · relación con el autor y el cuerpo:');
  console.table(relaciones);
  console.log('Veilix · variantes de selector y sus coincidencias en esta conversación (medidas, no aplicadas):');
  console.table(resumenVariantes);
  console.log(`Veilix · colisiones (borde discontinuo en pantalla durante ${DURACION_MARCA_MS / 1000} s; en «Elements», búscalas con [${MARCA}="V3-1"]):`);
  console.table(colisiones.length ? colisiones : [{ aviso: 'ninguna variante alcanza otro elemento en esta conversación' }]);
  console.log('Veilix · inspección (JSON):\n' + JSON.stringify({ identidad, cadena, relaciones, variantes: resumenVariantes, colisiones, mensajesEnLaConversacion: mensajes.length }, null, 2));
})();

/* global document, getComputedStyle, console, Node -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de los nombres de remitentes en grupos (RF-01),
 * centrado en los que quedan visibles, como los participantes no guardados
 * («~ Nombre»).
 *
 * RF-01 difumina un nombre solo si su texto visible coincide exactamente con
 * el remitente de algún `data-pre-plain-text` de la conversación abierta
 * (`marcador-nombres.ts`). Este fragmento muestra, para cada mensaje, qué
 * texto hay en el lugar del nombre, cómo se relaciona con ese metadato, su
 * estructura y si está marcado y difuminado. Así se ve por qué un nombre
 * concreto no se protege.
 *
 * Uso: abrir el grupo afectado con RF-01 activada, desplazarse hasta que se
 * vean los nombres que siguen visibles, abrir las herramientas de desarrollo
 * (F12) → Consola, pegar este archivo completo y pulsar Intro. Conviene que
 * haya mensajes de contactos guardados y no guardados, y alguna foto o vídeo.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No hace peticiones ni guarda nada.
 * - No muestra textos, nombres, teléfonos, `data-id`, `data-pre-plain-text`,
 *   `title`, `aria-label`, `alt`, colores ni direcciones. Del texto solo
 *   indica su longitud, si empieza por «~», si parece un teléfono y si
 *   contiene emojis o símbolos. La relación con el metadato se da como una
 *   categoría («idéntico», «mismo teléfono», «distinto»…), sin mostrar
 *   ninguno de los dos.
 * - De `data-id` solo usa si empieza por `true_` (enviado) o `false_`
 *   (recibido). Los valores de `data-testid` se anonimizan.
 * - Los textos con forma de etiqueta HTML se leen como texto (`textContent`)
 *   y nunca se interpretan.
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  /** `data-testid` anonimizado: números como «#» y nada tras «@» (podrían ser identificadores). */
  const limpiarTestId = (valor) => valor.replace(/@.*$/, '@…').replace(/\d+/g, '#');
  const MAXIMO_MENSAJES = 60;
  const MAXIMO_CANDIDATOS = 3;
  const CONTENEDOR = ':is([data-testid="msg-container"], .message-in, .message-out)';

  const panel = document.querySelector('#main');
  if (!panel) {
    console.log('Veilix · no hay ninguna conversación abierta (#main no existe).');
    return;
  }

  // Misma normalización que `marcador-nombres.ts`.
  const normalizar = (texto) =>
    texto.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim().replace(/^~\s*/, '');
  // Normalización ampliada, solo para diagnosticar diferencias invisibles (emojis, compatibilidad Unicode).
  const normalizarAmpliado = (texto) =>
    normalizar(texto.normalize('NFKC').replace(/[\ufe0e\ufe0f\u200b-\u200d\u2060\ufeff]/g, '').replace(/^[\u223c\u301c\uff5e]\s*/, ''));
  const soloDigitos = (texto) => texto.replace(/\D/g, '');
  const pareceTelefono = (texto) => /^\+?[\d\s().\u00a0-]{7,}$/.test(texto.trim()) && soloDigitos(texto).length >= 7;
  const EXPRESION_REMITENTE = /^\s*\[[^\]]*\]\s*(.+?):\s*$/su;

  const textoPropio = (elemento) =>
    [...elemento.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join('')
      .trim();
  /** Texto visible como en `textoConEmojis` de Veilix: texto, `alt` de las imágenes y nada de los SVG. */
  const textoVisible = (elemento) => {
    let texto = '';
    for (const nodo of elemento.childNodes) {
      if (nodo.nodeType === Node.TEXT_NODE) texto += nodo.textContent;
      else if (nodo.nodeType === Node.ELEMENT_NODE && nodo.localName !== 'svg') {
        texto += nodo.localName === 'img' ? (nodo.getAttribute('alt') ?? '') : textoVisible(nodo);
      }
    }
    return texto;
  };
  const tieneTextoPropioVeilix = (elemento) =>
    textoPropio(elemento) !== '' || [...elemento.children].some((h) => h.localName === 'img' && (h.getAttribute('alt') ?? '') !== '');

  const difuminado = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return true;
    }
    return false;
  };

  const clasesSemanticas = (elemento) =>
    [...elemento.classList].filter((c) => /^[a-z]+(-[a-z]+)+$/.test(c)).map((c) => `.${c}`).join('');
  const describir = (elemento) => {
    const partes = [elemento.tagName.toLowerCase() + clasesSemanticas(elemento)];
    for (const atributo of ['role', 'data-testid', 'dir', 'tabindex']) {
      const valor = elemento.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    for (const atributo of ['aria-label', 'title', 'style']) if (elemento.hasAttribute(atributo)) partes.push(`[${atributo}]`);
    return partes.join('');
  };
  const ruta = (elemento, hasta) => {
    const cadena = [];
    for (let actual = elemento; actual && actual !== hasta && cadena.length < 8; actual = actual.parentElement) cadena.push(describir(actual));
    return cadena.reverse().join(' › ');
  };

  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    const texto = titulo?.textContent.trim() ?? '';
    return /^wds-ic-[a-z0-9-]+$/.test(texto) ? texto : null;
  };
  const tipoMensaje = (fila) => {
    const tipos = [];
    if (fila.querySelector('[data-pre-plain-text]')) tipos.push('texto');
    if (fila.querySelector('img[src^="blob:"], img[src^="data:image/jpeg"], [style*="blob:"]')) tipos.push('imagen');
    if (fila.querySelector('video')) tipos.push('vídeo');
    if (fila.querySelector('audio')) tipos.push('audio');
    const iconos = [...new Set([...fila.querySelectorAll('svg')].map(tituloIcono).filter(Boolean))];
    return { tipo: tipos.join('+') || 'otro', iconos: iconos.join(', ') || '—' };
  };

  // Remitentes de toda la conversación: solo para comparar; nunca se muestran.
  const metadatoDe = (fila) => {
    const valor = fila.querySelector('[data-pre-plain-text]')?.getAttribute('data-pre-plain-text');
    if (valor === undefined || valor === null) return null;
    const coincidencia = EXPRESION_REMITENTE.exec(valor);
    return coincidencia ? normalizar(coincidencia[1] ?? '') : '';
  };
  const filas = [...panel.querySelectorAll('[data-id]')].filter((f) => f.querySelector(CONTENEDOR) && !f.parentElement?.closest('[data-id]'));
  const todosLosMetadatos = new Set(filas.map(metadatoDe).filter(Boolean));
  const todosAmpliados = new Set([...todosLosMetadatos].map(normalizarAmpliado));
  const telefonos = new Set([...todosLosMetadatos].filter(pareceTelefono).map(soloDigitos));

  const relacion = (visible, metadato) => {
    const v = normalizar(visible);
    if (metadato === null) return '— (mensaje sin bloque de texto)';
    if (metadato === '') return 'formato de metadato NO reconocido';
    if (v === metadato) return 'idéntico (Veilix lo reconoce)';
    if (normalizarAmpliado(v) === normalizarAmpliado(metadato)) return 'igual solo con normalización ampliada (emojis o Unicode)';
    if (pareceTelefono(v) && pareceTelefono(metadato)) return soloDigitos(v) === soloDigitos(metadato) ? 'mismo teléfono con otro formato' : 'teléfonos distintos';
    if (pareceTelefono(metadato)) return 'el metadato es un teléfono y el visible no';
    if (pareceTelefono(v)) return 'el visible es un teléfono y el metadato no';
    if (v.length > 0 && metadato.includes(v)) return 'el visible es parte del metadato';
    if (metadato.length > 0 && v.includes(metadato)) return 'el metadato es parte del visible';
    return 'distinto';
  };
  const relacionConLaConversacion = (visible) => {
    const v = normalizar(visible);
    if (todosLosMetadatos.has(v)) return 'coincide con un remitente de la conversación';
    if (todosAmpliados.has(normalizarAmpliado(v))) return 'coincide solo con normalización ampliada';
    if (pareceTelefono(v) && telefonos.has(soloDigitos(v))) return 'mismo teléfono que un remitente, con otro formato';
    return 'no coincide con ningún remitente';
  };

  const esHora = (texto) => /^\d{1,2}[:.]\d{2}/.test(texto);
  const FUERA_DEL_NOMBRE = '[data-pre-plain-text], [data-testid="msg-meta"], svg, [contenteditable], button';
  /**
   * Textos en el lugar del nombre: elementos con texto propio (los que examina
   * Veilix), fuera del bloque de texto, de `msg-meta`, de los SVG, de los
   * botones y del editor, en orden de aparición.
   */
  const candidatosDe = (fila) =>
    [...fila.querySelectorAll('*')].filter((e) => {
      if (e.closest(FUERA_DEL_NOMBRE) || e.querySelector('[data-pre-plain-text]')) return false;
      const texto = textoVisible(e).trim();
      return tieneTextoPropioVeilix(e) && texto !== '' && !esHora(texto) && !/^\d+$/.test(texto);
    });
  /** Contenedor inmediato con más texto que el candidato (por si el nombre está repartido en varios elementos). */
  const contenedorDelNombre = (elemento, fila) => {
    const padre = elemento.parentElement;
    if (!padre || padre === fila || !fila.contains(padre) || padre.closest(FUERA_DEL_NOMBRE) || padre.querySelector('[data-pre-plain-text]')) return null;
    const texto = textoVisible(padre).replace(/[\u200e\u200f]/g, '').trim();
    return texto.length <= 100 && texto !== textoVisible(elemento).replace(/[\u200e\u200f]/g, '').trim() ? texto : null;
  };

  const colorDe = (elemento) => getComputedStyle(elemento).color;
  const porMensaje = [];
  for (const [indice, fila] of filas.slice(-MAXIMO_MENSAJES).entries()) {
    const contenedor = fila.querySelector(CONTENEDOR);
    const prefijo = fila.getAttribute('data-id') ?? '';
    const metadato = metadatoDe(fila);
    const { tipo, iconos } = tipoMensaje(fila);
    const colorTexto = colorDe(fila.querySelector('[data-pre-plain-text]') ?? contenedor ?? fila);
    const candidatos = candidatosDe(fila).slice(0, MAXIMO_CANDIDATOS);
    const base = {
      mensaje: indice + 1,
      direccion: prefijo.startsWith('true_') ? 'enviado' : prefijo.startsWith('false_') ? 'recibido' : '?',
      tipo,
      iconos,
      metadato: metadato === null ? 'sin bloque' : metadato === '' ? 'formato NO reconocido' : pareceTelefono(metadato) ? `teléfono(${metadato.length})` : `nombre(${metadato.length})`,
    };
    if (candidatos.length === 0) {
      porMensaje.push({ ...base, candidato: '—', nota: 'sin texto en el lugar del nombre (mensaje seguido del mismo remitente o propio)' });
      continue;
    }
    for (const [posicion, elemento] of candidatos.entries()) {
      const texto = textoVisible(elemento).replace(/[\u200e\u200f]/g, '').trim();
      const marcado = elemento.closest('[data-veilix-remitente]') ?? elemento.querySelector('[data-veilix-remitente]');
      porMensaje.push({
        ...base,
        candidato: posicion + 1,
        estructura: ruta(elemento, fila),
        hijosConTexto: [...elemento.children].filter((h) => textoVisible(h).trim() !== '').length,
        longitud: texto.length,
        empiezaConVirgulilla: /^[~\u223c\u301c\uff5e]/.test(texto) ? 'sí' : 'no',
        pareceTelefono: pareceTelefono(texto) ? 'sí' : 'no',
        emojis: elemento.querySelector('img[alt]') ? 'img' : /\p{Extended_Pictographic}/u.test(texto) ? 'texto' : 'no',
        simbolos: /[^\p{L}\p{N}\p{M}\s~\p{Extended_Pictographic}]/u.test(texto.replace(/\u200d|\ufe0f/g, '')) ? 'sí' : 'no',
        colorPropio: colorDe(elemento) !== colorTexto ? 'sí' : 'no',
        relacionConSuMetadato: relacion(texto, metadato),
        relacionConLaConversacion: relacionConLaConversacion(texto),
        contenedorInmediato: (() => {
          const textoPadre = contenedorDelNombre(elemento, fila);
          return textoPadre === null ? '—' : `${relacion(textoPadre, metadato)} · ${relacionConLaConversacion(textoPadre)}`;
        })(),
        marcado: marcado ? (marcado === elemento ? 'sí' : 'sí (otro elemento)') : 'NO',
        difuminado: difuminado(elemento) ? 'sí' : 'NO',
      });
    }
  }

  // Resumen: combinaciones de estructura y relación, con cuántos se ven sin difuminar.
  const grupos = new Map();
  for (const fila of porMensaje.filter((f) => f.candidato === 1)) {
    const clave = [fila.empiezaConVirgulilla === 'sí' ? 'con «~»' : 'sin «~»', fila.metadato.replace(/\(\d+\)/, ''), fila.relacionConSuMetadato, fila.estructura].join(' | ');
    const grupo = grupos.get(clave) ?? { grupo: clave, mensajes: 0, visibles: 0 };
    grupo.mensajes++;
    if (fila.difuminado === 'NO') grupo.visibles++;
    grupos.set(clave, grupo);
  }
  const resumen = [...grupos.values()].sort((a, b) => b.visibles - a.visibles);

  const estiloNombres = document.querySelector('style[data-veilix-estilo="nombres"]')?.textContent ?? '';
  const cargado = {
    rf01Activa: estiloNombres !== '',
    reglaRemitentes: estiloNombres.includes('data-veilix-remitente'),
    remitentesMarcados: panel.querySelectorAll('[data-veilix-remitente]').length,
    mensajesAnalizados: Math.min(filas.length, MAXIMO_MENSAJES),
    remitentesDistintos: todosLosMetadatos.size,
    remitentesQueSonTelefono: [...todosLosMetadatos].filter(pareceTelefono).length,
  };

  console.log('Veilix · remitentes (RF-01): reglas cargadas y totales, sin nombres:');
  console.table([cargado]);
  console.log('Veilix · resumen por tipo de nombre (primer texto de cada mensaje), con los que siguen visibles primero:');
  console.table(resumen);
  console.log('Veilix · detalle por mensaje (hasta 3 textos en el lugar del nombre):');
  console.table(porMensaje);
  console.log('Veilix · resumen (JSON):\n' + JSON.stringify({ cargado, resumen, porMensaje }, null, 2));
})();

/* global document, getComputedStyle, console, Node, window, setTimeout -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO del indicador «Editado» de los mensajes de WhatsApp
 * Web (RF-04).
 *
 * No supone la estructura ni depende solo del texto. Localiza candidatos por
 * dos vías independientes y dice cuál encontró cada uno:
 * - ESTRUCTURA: cualquier texto de la zona de la hora (`msg-meta` y sus
 *   hermanos dentro del mensaje) que no sea una hora;
 * - TEXTO: un texto genérico de edición de una lista cerrada («Editado»,
 *   «Edited»…) en cualquier parte del mensaje fuera del cuerpo.
 * También busca iconos cuyo nombre (`<title>` o `data-icon`) mencione la
 * edición.
 *
 * De cada candidato muestra:
 * - su cadena de antecesores hasta `msg-container`, con roles y `data-testid`
 *   anonimizados, y sus hermanos resumidos;
 * - su relación con la hora (`msg-meta`) y con el cuerpo del mensaje;
 * - qué selector exacto de las hojas de Veilix de la página
 *   (`style[data-veilix-estilo]`) difumina cada nivel, las marcas de Veilix y
 *   si hay filtros dobles;
 * - el esqueleto anonimizado de la zona de la hora, para comparar mensajes
 *   editados con mensajes normales.
 * Para reconocerlos en pantalla, rodea cada candidato con un borde
 * discontinuo durante 60 segundos (atributo temporal
 * `data-veilix-diagnostico-editado`, que se retira solo y no cambia ningún
 * texto ni nodo de WhatsApp).
 *
 * Uso:
 * 1. Con RF-04 activada, abre una conversación con al menos un mensaje
 *    editado a la vista y, si puedes, otro sin editar. Mejor si hay uno
 *    editado recibido y otro enviado.
 * 2. Deja el cursor sobre la lista de chats, sin pulsar ninguna tecla. Abre la
 *    consola (F12), pega este archivo completo y pulsa Intro.
 * 3. Comprueba en pantalla qué candidato (E1, E2…) rodea el borde discontinuo
 *    del indicador «Editado».
 *
 * Privacidad:
 * - Solo lee el DOM, salvo la marca temporal. No descarga nada ni hace
 *   peticiones.
 * - No muestra nombres, mensajes, horas, teléfonos, `id`, `data-id`, `title`,
 *   `aria-label`, `alt`, `data-pre-plain-text` ni direcciones.
 * - Solo muestran su texto los textos genéricos de una lista cerrada
 *   («Editado», «Reenviado»…). Del resto, la longitud y si parece una hora.
 * - Los `data-testid` se anonimizan. Revisa el resultado antes de compartirlo.
 */
(() => {
  const limpiarTestId = (valor) =>
    valor
      .replace(/^(list-item-).+$/, '$1…')
      .replace(/@.*$/, '@…')
      .replace(/[^-_.:@…]*[A-Z][^-_.:@…]*|[^-_.:@…]{25,}/g, '…')
      .replace(/\d+/g, '#');
  const MAXIMO_MENSAJES = 12;
  const MAXIMO_NODOS_META = 40;
  const DURACION_MARCA_MS = 60000;
  const MARCA = 'data-veilix-diagnostico-editado';
  for (const e of document.querySelectorAll(`[${MARCA}]`)) e.removeAttribute(MARCA);
  document.querySelector('style[data-veilix-diagnostico-editado-estilo]')?.remove();

  /** Textos genéricos de edición (español, inglés y portugués). */
  const EDICION = /^(editado|editada|edited|mensaje editado|edited message|mensagem editada)$/i;
  const GENERICOS = new Set([
    'editado', 'editada', 'edited', 'mensaje editado', 'edited message', 'mensagem editada', 'reenviado', 'forwarded',
    'reenviado muchas veces', 'forwarded many times', 'destacado', 'starred', 'fijado', 'pinned', 'leer más', 'read more',
    'tú', 'you', '·', '•',
  ]);
  const ICONO_EDICION = /edit|pencil|lapiz|lápiz/i;
  const CONTENEDOR = '[data-testid="msg-container"]';
  const META = '[data-testid="msg-meta"]';
  const CUERPO = '[data-pre-plain-text], .selectable-text, [data-testid="selectable-text"]';
  const AUTOR = '[data-testid="author"]';
  const CITA = '[data-testid="quoted-message"]';
  const EDITOR = '[contenteditable="true"], [role="textbox"]';
  const HORA = /^\d{1,2}[:.]\d{2}(\s?[ap]\.?\s?m\.?)?$/i;
  const principal = document.querySelector('#main');

  const normalizar = (texto) => texto.replace(/[‎‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
  const textoPropio = (e) =>
    normalizar([...e.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(''));
  const describirTexto = (texto) => {
    if (GENERICOS.has(texto.toLowerCase())) return `GENÉRICO=«${texto}»`;
    return `texto(${texto.length})${HORA.test(texto) ? ' PARECE-HORA' : ''}`;
  };
  const tituloIcono = (svg) => {
    const titulo = [...svg.children].find((hijo) => hijo.localName === 'title');
    if (!titulo) return 'ninguno';
    const texto = titulo.textContent.trim();
    if (/^wds-ic-[a-z0-9-]+$/.test(texto)) return texto;
    if (texto.length <= 40 && /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(texto)) return `${texto} (nombre de icono)`;
    return `otro título (${texto.length})`;
  };
  const describir = (e) => {
    const partes = [e.localName];
    for (const atributo of ['role', 'data-testid', 'data-icon', 'tabindex', 'dir', 'aria-hidden']) {
      const valor = e.getAttribute(atributo);
      if (valor !== null) partes.push(`[${atributo}=${atributo === 'data-testid' ? limpiarTestId(valor) : valor}]`);
    }
    const otros = e.getAttributeNames().filter((a) => !['role', 'data-testid', 'data-icon', 'tabindex', 'dir', 'aria-hidden', MARCA].includes(a));
    if (otros.length) partes.push(`[${otros.join('][')}]`);
    if (e.localName === 'svg') partes.push(` título=${tituloIcono(e)}`);
    const texto = textoPropio(e);
    if (texto) partes.push(` ${describirTexto(texto)}`);
    return partes.join('');
  };
  const textosDe = (raiz) => [raiz, ...raiz.querySelectorAll('*')].filter((x) => textoPropio(x) && !x.closest('svg'));
  const visible = (e) => {
    const caja = e.getBoundingClientRect();
    return caja.width > 0 && caja.height > 0 && caja.bottom > 0 && caja.top < window.innerHeight;
  };

  // Selectores de difuminado de las hojas de Veilix de la página, separados por comas de primer nivel.
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
        selectoresVeilix.push({ modulo: `${MODULOS[modulo] ?? modulo}`, n: i + 1, selector });
      });
    }
  }
  const difuminadoPor = (e) =>
    selectoresVeilix
      .filter((r) => {
        try {
          return e.matches(r.selector);
        } catch {
          return false;
        }
      })
      .map((r) => `${r.modulo} #${r.n}: ${r.selector.length > 100 ? `…${r.selector.slice(-100)}` : r.selector}`)
      .join(' | ') || '—';
  const marcas = (e) => {
    const lista = new Set();
    for (let a = e; a; a = a.parentElement) for (const n of a.getAttributeNames()) if (n.startsWith('data-veilix-') && n !== MARCA) lista.add(n.replace('data-veilix-', ''));
    return [...lista].join(', ') || '—';
  };
  const filtroEn = (e) => {
    const filtros = [];
    for (let a = e, n = 0; a; a = a.parentElement, n++) {
      const f = getComputedStyle(a).filter;
      if (f !== 'none') filtros.push(n === 0 ? `propio ${f}` : `antecesor (${n} arriba) ${f}`);
    }
    if (!filtros.length) return 'NO difuminado';
    return filtros.length > 1 ? `FILTRO-DOBLE: ${filtros.join(' | ')}` : filtros[0];
  };
  const zona = (e) => {
    if (e.closest(META)) return 'dentro de msg-meta';
    if (e.closest(CITA)) return 'cita';
    if (e.closest(AUTOR)) return 'autor';
    if (e.closest(CUERPO)) return 'cuerpo';
    return 'fuera de msg-meta y del cuerpo';
  };
  const antecesorComun = (a, b) => {
    const cadena = new Set();
    for (let x = a; x; x = x.parentElement) cadena.add(x);
    for (let x = b; x; x = x.parentElement) if (cadena.has(x)) return x;
    return null;
  };
  const relacion = (e, otro) => {
    if (!otro) return 'no existe';
    if (otro.contains(e)) return 'DENTRO';
    if (e.contains(otro)) return 'LO CONTIENE';
    const comun = antecesorComun(e, otro);
    let n = 0;
    for (let x = e; x && x !== comun; x = x.parentElement) n++;
    const posicion = otro.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING ? 'después' : 'antes';
    const hermanos = e.parentElement === otro.parentElement ? 'HERMANO' : 'no hermano';
    const a = e.getBoundingClientRect();
    const b = otro.getBoundingClientRect();
    const linea = a.top < b.bottom && b.top < a.bottom ? 'MISMA-LÍNEA' : a.top >= b.bottom ? 'debajo' : 'encima';
    return `${hermanos}, ${posicion}, ${linea}, antecesor común a ${n} nivel(es): ${comun ? describir(comun) : '—'}`;
  };

  // 1) Mensajes visibles y candidatos.
  const mensajes = principal ? [...principal.querySelectorAll(CONTENEDOR)].filter((m) => !m.parentElement.closest(CONTENEDOR) && visible(m)).slice(-MAXIMO_MENSAJES) : [];
  const candidatos = [];
  for (const mensaje of mensajes) {
    const meta = mensaje.querySelector(META);
    const hora = meta ? textosDe(meta).find((t) => HORA.test(textoPropio(t))) ?? null : null;
    const cuerpo = [...mensaje.querySelectorAll(CUERPO)].find((c) => !c.closest(CITA) && !c.parentElement.closest(CUERPO)) ?? null;
    // Zona de la hora: msg-meta y los hermanos de msg-meta (o de su contenedor) dentro del mensaje.
    const zonaHora = meta ? [meta, ...(meta.parentElement ? [...meta.parentElement.children] : [])] : [];
    const porEstructura = new Set(zonaHora.flatMap((z) => textosDe(z)).filter((t) => !HORA.test(textoPropio(t)) && !t.closest(CUERPO) && !t.closest(AUTOR) && !t.closest(CITA)));
    const porTexto = new Set(textosDe(mensaje).filter((t) => EDICION.test(textoPropio(t)) && !t.closest(CUERPO) && !t.closest(EDITOR)));
    const porIcono = new Set([...mensaje.querySelectorAll('svg, [data-icon]')].filter((i) => ICONO_EDICION.test(i.localName === 'svg' ? tituloIcono(i) : i.getAttribute('data-icon') ?? '') && !/^otro título/.test(i.localName === 'svg' ? tituloIcono(i) : '')));
    for (const e of new Set([...porEstructura, ...porTexto, ...porIcono])) {
      candidatos.push({
        e,
        mensaje,
        meta,
        hora,
        cuerpo,
        indicios: [porEstructura.has(e) ? 'estructura (zona de la hora)' : null, porTexto.has(e) ? 'texto de edición' : null, porIcono.has(e) ? 'icono de edición' : null].filter(Boolean).join(' + '),
      });
    }
  }

  const direccion = (m) => (m.closest('.message-out') ? 'enviado' : m.closest('.message-in') ? 'recibido' : '¿?');
  const tablaCandidatos = candidatos.map((c, i) => ({
    candidato: `E${i + 1}`,
    mensaje: mensajes.indexOf(c.mensaje) + 1,
    direccion: direccion(c.mensaje),
    indicios: c.indicios,
    elemento: describir(c.e),
    zona: zona(c.e),
    relacionConLaHora: relacion(c.e, c.hora),
    relacionConMsgMeta: relacion(c.e, c.meta),
    relacionConElCuerpo: relacion(c.e, c.cuerpo),
    difuminadoPor: difuminadoPor(c.e),
    marcasVeilix: marcas(c.e),
    filtro: filtroEn(c.e),
  }));

  // 2) Cadena de antecesores de cada candidato hasta msg-container.
  const cadenas = [];
  candidatos.forEach((c, i) => {
    for (let a = c.e, nivel = 0; a; a = a.parentElement, nivel++) {
      const hermanos = a.parentElement ? [...a.parentElement.children].filter((h) => h !== a) : [];
      cadenas.push({
        candidato: `E${i + 1}`,
        nivel,
        elemento: describir(a),
        posicion: a.parentElement ? `${[...a.parentElement.children].indexOf(a) + 1} de ${a.parentElement.children.length}` : '—',
        contieneHora: c.hora && a.contains(c.hora) ? 'sí' : 'no',
        contieneCuerpo: c.cuerpo && a.contains(c.cuerpo) ? 'sí' : 'no',
        hermanos: hermanos.slice(0, 5).map((h) => `${h.localName}${h.getAttribute('data-testid') ? `[data-testid=${limpiarTestId(h.getAttribute('data-testid'))}]` : ''}${h.getAttribute('role') ? `[role=${h.getAttribute('role')}]` : ''} (${textosDe(h).length} textos)`).join(' | ') || '—',
        difuminadoPor: difuminadoPor(a),
      });
      if (a.matches(CONTENEDOR)) break;
    }
  });

  // 3) Esqueleto de la zona de la hora de cada mensaje, para comparar editados y normales.
  const esqueletos = mensajes.map((m, i) => {
    const meta = m.querySelector(META);
    if (!meta) return `Mensaje ${i + 1} (${direccion(m)}): sin msg-meta`;
    const raiz = meta.parentElement && meta.parentElement !== m ? meta.parentElement : meta;
    const lineas = [];
    const recorrer = (e, n) => {
      if (lineas.length >= MAXIMO_NODOS_META) return;
      if (e.matches(CUERPO) || e.matches(CITA)) {
        lineas.push(`${'  '.repeat(n)}${e.localName} (cuerpo o cita, omitido)`);
        return;
      }
      const indice = candidatos.findIndex((c) => c.e === e);
      lineas.push(`${'  '.repeat(n)}${describir(e)}${indice >= 0 ? ` ← E${indice + 1}` : ''} · ${filtroEn(e) === 'NO difuminado' ? 'visible' : 'difuminado'}`);
      if (e.localName === 'svg') return;
      for (const h of e.children) recorrer(h, n + 1);
    };
    recorrer(raiz, 0);
    const tieneCandidato = candidatos.some((c) => c.mensaje === m);
    return `Mensaje ${i + 1} (${direccion(m)}${tieneCandidato ? ', CON candidato' : ', sin candidato'}):\n${lineas.join('\n')}`;
  });

  // 4) Marca temporal en pantalla.
  if (candidatos.length) {
    candidatos.forEach((c, i) => c.e.setAttribute(MARCA, `E${i + 1}`));
    const hoja = document.createElement('style');
    hoja.setAttribute('data-veilix-diagnostico-editado-estilo', '');
    hoja.textContent = `[${MARCA}] { outline: 2px dashed #d0007a !important; outline-offset: 2px !important; }`;
    document.head.append(hoja);
    setTimeout(() => {
      for (const e of document.querySelectorAll(`[${MARCA}]`)) e.removeAttribute(MARCA);
      hoja.remove();
      console.log('Veilix · marcas temporales retiradas.');
    }, DURACION_MARCA_MS);
  }

  const resumen = {
    hayConversacion: Boolean(principal),
    veilixCargado: document.querySelectorAll('style[data-veilix-estilo]').length > 0,
    estilosDeVeilix: [...document.querySelectorAll('style[data-veilix-estilo]')].map((e) => e.getAttribute('data-veilix-estilo')).join(', ') || 'ninguno',
    atajoPulsado: [...document.documentElement.getAttributeNames()].some((a) => a.startsWith('data-veilix-revelar-')),
    selectoresVeilixLeidos: selectoresVeilix.length,
    mensajesExaminados: mensajes.length,
    mensajesConMsgMeta: mensajes.filter((m) => m.querySelector(META)).length,
    candidatos: candidatos.length,
    candidatosPorTextoDeEdicion: candidatos.filter((c) => /texto/.test(c.indicios)).length,
    candidatosVisibles: tablaCandidatos.filter((c) => c.filtro === 'NO difuminado').length,
    filtrosDobles: tablaCandidatos.filter((c) => c.filtro.startsWith('FILTRO-DOBLE')).length,
  };

  console.log('Veilix · indicador «Editado» (RF-04): resumen.');
  console.table([resumen]);
  console.log(`Veilix · candidatos (en pantalla, con borde discontinuo durante ${DURACION_MARCA_MS / 1000} s; en «Elements», búscalos con [${MARCA}="E1"]):`);
  console.table(tablaCandidatos.length ? tablaCandidatos : [{ aviso: 'ningún candidato: ¿hay un mensaje editado a la vista?' }]);
  console.log('Veilix · cadena de antecesores de cada candidato:');
  console.table(cadenas);
  console.log(
    'Veilix · resumen (JSON):\n' +
      JSON.stringify({ resumen, candidatos: tablaCandidatos, cadenas }, null, 2) +
      `\n\nVeilix · esqueleto anonimizado de la zona de la hora de cada mensaje:\n${esqueletos.join('\n\n')}`,
  );
})();

/* global document, getComputedStyle, console, URL -- fragmento para la consola del navegador */
/**
 * Diagnóstico ANONIMIZADO de avatares en WhatsApp Web (RF-02).
 *
 * Uso: con WhatsApp Web abierto y RF-02 activada, abrir las herramientas de
 * desarrollo (F12) → Consola, pegar este archivo completo y pulsar Intro.
 *
 * Privacidad:
 * - Solo LEE el DOM y escribe en la consola. No hace peticiones ni guarda nada.
 * - No incluye textos, nombres, títulos, `aria-label`, `alt` ni direcciones
 *   completas: de cada URL solo muestra el esquema, el dominio y un patrón
 *   de ruta. Se conservan los segmentos que indican el tipo de recurso (por
 *   ejemplo, `v` o `t61.24694-24`) y en el resto los números se sustituyen
 *   por «#». Nunca se muestran los parámetros de la URL.
 * - Revisa el resultado antes de compartirlo.
 *
 * Lista las imágenes, imágenes de fondo e iconos de al menos 20 px, e indica
 * si Veilix los está difuminando, para localizar los avatares que se escapan.
 */
(() => {
  const TAMANO_MINIMO = 20;

  const zonaDe = (elemento) => {
    if (elemento.closest('#pane-side')) return 'lista de chats (#pane-side)';
    if (elemento.closest('#main header')) return 'encabezado (#main header)';
    if (elemento.closest('#main footer')) return 'pie (#main footer)';
    if (elemento.closest('#main')) return 'conversación (#main)';
    if (elemento.closest('#side')) return 'panel lateral (#side)';
    return 'otra zona';
  };

  const patronUrl = (url) => {
    try {
      const { protocol, hostname, pathname } = new URL(url, document.baseURI);
      if (protocol === 'data:' || protocol === 'blob:') return protocol;
      const ruta = pathname
        .split('/')
        .slice(0, 4)
        .map((segmento) => (/^(v|t\d+\.\d+-\d+)$/.test(segmento) ? segmento : segmento.replace(/\d+/g, '#')))
        .join('/');
      return `${protocol}//${hostname}${ruta}…`;
    } catch {
      return 'no válida';
    }
  };

  const descripcion = (elemento) => {
    const partes = [elemento.tagName.toLowerCase()];
    const rol = elemento.getAttribute('role');
    if (rol) partes.push(`[role=${rol}]`);
    if (elemento.id === 'main' || elemento.id === 'side' || elemento.id === 'pane-side') partes.push(`#${elemento.id}`);
    const icono = elemento.getAttribute('data-icon');
    if (icono) partes.push(`[data-icon=${icono}]`);
    return partes.join('');
  };

  const ascendencia = (elemento) => {
    const cadena = [];
    for (let actual = elemento.parentElement; actual && cadena.length < 6; actual = actual.parentElement) {
      cadena.push(descripcion(actual));
    }
    return cadena.join(' < ');
  };

  const difuminado = (elemento) => {
    for (let actual = elemento; actual; actual = actual.parentElement) {
      if (getComputedStyle(actual).filter !== 'none') return true;
    }
    return false;
  };

  const candidatos = new Set([
    ...document.querySelectorAll('img, svg, [data-icon], canvas, image'),
    ...[...document.querySelectorAll('[style*="background"]')].filter((e) =>
      /url\(/.test(e.getAttribute('style') ?? ''),
    ),
  ]);

  const filas = [];
  for (const elemento of candidatos) {
    const caja = elemento.getBoundingClientRect();
    if (caja.width < TAMANO_MINIMO || caja.height < TAMANO_MINIMO) continue;
    const estilo = elemento.getAttribute('style') ?? '';
    const fondo = /url\(["']?([^"')]+)/.exec(estilo)?.[1];
    filas.push({
      zona: zonaDe(elemento),
      elemento: descripcion(elemento),
      origen: elemento.tagName === 'IMG' ? patronUrl(elemento.getAttribute('src') ?? '') : fondo ? `fondo: ${patronUrl(fondo)}` : '—',
      atributos: elemento.getAttributeNames().filter((n) => !['alt', 'title', 'aria-label', 'src', 'style', 'class'].includes(n)).join(' '),
      // Solo nombres de etiquetas de la estructura interna de los SVG.
      contenido:
        elemento.tagName.toLowerCase() === 'svg'
          ? ['mask', 'circle', 'image', 'foreignObject'].filter((etiqueta) => elemento.querySelector(etiqueta)).join(' ') || '—'
          : '—',
      tamano: `${Math.round(caja.width)}×${Math.round(caja.height)}`,
      difuminado: difuminado(elemento) ? 'sí' : 'NO',
      ascendencia: ascendencia(elemento),
    });
  }

  filas.sort((a, b) => a.difuminado.localeCompare(b.difuminado) || a.zona.localeCompare(b.zona));
  console.table(filas);
  console.log('Veilix · diagnóstico anonimizado de avatares (JSON):\n' + JSON.stringify(filas, null, 2));
})();

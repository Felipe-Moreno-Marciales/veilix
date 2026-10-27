/* global document, window, console, chrome, getComputedStyle, MutationObserver, setTimeout, performance */
/**
 * Diagnóstico ANONIMIZADO de la inicialización de Veilix en WhatsApp Web.
 *
 * Sirve cuando los interruptores del panel están activados, pero la página no
 * tiene ningún `<style data-veilix-estilo>` ni elementos marcados. Distingue
 * entre:
 * - el script de contenido no se ha inyectado en la pestaña;
 * - se inyectó, pero su contexto quedó invalidado (por ejemplo, al recargar o
 *   actualizar la extensión sin recargar WhatsApp Web);
 * - está vivo, pero lee otras preferencias o no inserta los estilos;
 * - inserta los estilos y algo los elimina después.
 *
 * Uso, en la pestaña de WhatsApp Web, con las herramientas de desarrollo
 * (F12) → Consola:
 * 1. Con el contexto «top» seleccionado (arriba a la izquierda de la consola),
 *    pega este archivo y pulsa Intro. Durante los 20 segundos siguientes,
 *    desactiva y vuelve a activar un interruptor en el panel de Veilix,
 *    esperando un par de segundos entre ambos pasos, y déjalo activado.
 * 2. Abre la lista de contextos («top») y comprueba si aparece «Veilix». Si
 *    aparece, selecciónalo, pega de nuevo el archivo y pulsa Intro.
 *
 * Privacidad:
 * - Solo LEE el DOM y el almacenamiento de preferencias, y escribe en la
 *   consola. No hace peticiones, no guarda nada y no modifica la página.
 * - No muestra textos, nombres, mensajes, URL completas, identificadores de
 *   la extensión ni credenciales. De las preferencias solo muestra qué
 *   funcionalidades están activadas y el tema.
 * - Revisa el resultado antes de compartirlo.
 */
(() => {
  const SEGUNDOS_OBSERVACION = 20;
  const FUNCIONALIDADES_DISPONIBLES = [
    'difuminarNombres',
    'difuminarFotos',
    'difuminarMensajesRecientes',
    'difuminarMensajesConversacion',
    'difuminarCampoEntrada',
  ];

  const api = typeof chrome !== 'undefined' ? chrome : undefined;
  const enContextoExtension = typeof api?.runtime?.getManifest === 'function';

  const estadoDom = () => {
    const estilos = [...document.querySelectorAll('style[data-veilix-estilo]')];
    const marcados = [...document.querySelectorAll('*')].filter((e) => e.getAttributeNames().some((a) => a.startsWith('data-veilix-'))).length;
    const muestra = document.querySelector('#pane-side span[title], #pane-side span[dir="auto"]');
    return {
      estilosVeilix: estilos.map((e) => e.getAttribute('data-veilix-estilo')),
      estilosEn: [...new Set(estilos.map((e) => e.parentElement?.localName ?? 'fuera del documento'))].join(', ') || '—',
      elementosMarcados: marcados,
      filtroEnUnNombreDeLaLista: muestra ? getComputedStyle(muestra).filter : 'sin nombre visible',
    };
  };

  const pagina = {
    contexto: enContextoExtension ? 'Veilix (mundo aislado de la extensión)' : 'página (top)',
    origenWhatsApp: window.location.origin === 'https://web.whatsapp.com',
    marcoPrincipal: window.top === window,
    estadoDocumento: document.readyState,
    pestañaVisible: document.visibilityState,
    estructura: ['#app', '#pane-side', '#main'].filter((s) => document.querySelector(s)).join(', ') || 'ninguna',
    ...estadoDom(),
  };

  if (!enContextoExtension) {
    console.log('Veilix · paso 1 (contexto «top»): estado de la página');
    console.table([pagina]);

    // Observación en vivo: altas y bajas de las hojas de estilo de Veilix, y avisos de arranque del script.
    const inicio = performance.now();
    const eventos = [];
    const tiempo = () => `${((performance.now() - inicio) / 1000).toFixed(1)} s`;
    const observador = new MutationObserver((registros) => {
      for (const registro of registros) {
        for (const nodo of registro.addedNodes) {
          if (nodo.nodeType === 1 && nodo.matches('style[data-veilix-estilo]')) eventos.push({ momento: tiempo(), evento: 'estilo añadido', modulo: nodo.getAttribute('data-veilix-estilo') });
        }
        for (const nodo of registro.removedNodes) {
          if (nodo.nodeType === 1 && nodo.matches('style[data-veilix-estilo]')) eventos.push({ momento: tiempo(), evento: 'estilo eliminado', modulo: nodo.getAttribute('data-veilix-estilo') });
        }
      }
    });
    observador.observe(document, { childList: true, subtree: true });
    const alArrancar = (evento) => {
      if (String(evento.data?.type ?? '').endsWith(':wxt:content-script-started')) eventos.push({ momento: tiempo(), evento: 'aviso de arranque de un script de contenido WXT', modulo: '—' });
    };
    window.addEventListener('message', alArrancar);
    console.log(`Veilix · observando ${SEGUNDOS_OBSERVACION} s: desactiva ahora un interruptor en el panel de Veilix, espera dos segundos y vuelve a activarlo…`);
    setTimeout(() => {
      observador.disconnect();
      window.removeEventListener('message', alArrancar);
      const final = estadoDom();
      const altas = eventos.filter((e) => e.evento === 'estilo añadido').length;
      const bajas = eventos.filter((e) => e.evento === 'estilo eliminado').length;
      let lectura;
      if (altas === 0 && bajas === 0) {
        lectura = 'Sin cambios: ningún script de Veilix vivo respondió al interruptor. Revisa el paso 2 (contexto «Veilix»).';
      } else if (final.estilosVeilix.length === 0 && altas > 0) {
        lectura = 'Veilix insertó estilos, pero al final no queda ninguno. Si dejaste el interruptor activado, algo los eliminó: compártelo con la tabla de eventos. (Al desactivar, Veilix retira su propio estilo; es normal).';
      } else if (pagina.estilosVeilix.length === 0 && final.estilosVeilix.length > 0) {
        lectura = 'Al principio no había estilos; al alternar el interruptor, Veilix los insertó y se mantienen. El script está vivo, pero sus estilos iniciales se perdieron: indica si recargaste la extensión o la pestaña antes de la prueba.';
      } else {
        lectura = 'Veilix responde al interruptor y sus estilos permanecen.';
      }
      console.log(`Veilix · paso 1, resultado tras ${SEGUNDOS_OBSERVACION} s: ${lectura}`);
      console.table(eventos.length > 0 ? eventos : [{ momento: '—', evento: 'ningún evento', modulo: '—' }]);
      console.table([{ ...final, altas, bajas }]);
      console.log('Veilix · paso 1 (JSON):\n' + JSON.stringify({ pagina, eventos, final, lectura }, null, 2));
    }, SEGUNDOS_OBSERVACION * 1000);
    return;
  }

  // Paso 2: contexto «Veilix». Si el contexto está invalidado, `runtime.id` deja de existir.
  const contextoValido = Boolean(api.runtime?.id);
  let manifiesto = { version: 'no disponible', version_name: 'no disponible' };
  try {
    const m = api.runtime.getManifest();
    manifiesto = { version: m.version, version_name: m.version_name ?? '—' };
  } catch (error) {
    manifiesto = { version: `error: ${error?.message ?? error}`, version_name: '—' };
  }
  const informar = (preferencias) => {
    const resultado = {
      ...pagina,
      contextoValido,
      versionInyectada: manifiesto.version,
      versionNombre: manifiesto.version_name,
      ...preferencias,
    };
    let lectura;
    if (!contextoValido) lectura = 'Contexto INVALIDADO: este script pertenece a una versión anterior de la extensión. Recarga la pestaña de WhatsApp Web.';
    else if (resultado.errorAlmacenamiento) lectura = 'No se pudieron leer las preferencias: compártelo con el error.';
    else if (resultado.funcionalidadesActivas === 0) lectura = 'El script está vivo pero lee todas las funcionalidades desactivadas: el panel podría estar guardando en otra instalación o perfil.';
    else if (resultado.estilosVeilix.length === 0) lectura = 'El script está vivo y lee funcionalidades activas, pero no hay estilos: revisa la consola filtrando por «Veilix» y el paso 1.';
    else lectura = 'El script está vivo, lee las preferencias y los estilos están presentes.';
    console.log(`Veilix · paso 2 (contexto «Veilix»): ${lectura}`);
    console.table([resultado]);
    console.log('Veilix · paso 2 (JSON):\n' + JSON.stringify({ resultado, lectura }, null, 2));
  };
  if (!contextoValido) {
    informar({ errorAlmacenamiento: 'contexto invalidado', funcionalidadesActivas: '—' });
    return;
  }
  try {
    api.storage.local
      .get('preferencias')
      .then((datos) => {
        const preferencias = datos?.preferencias;
        const funcionalidades = preferencias && typeof preferencias === 'object' ? preferencias.funcionalidades ?? {} : {};
        const activas = FUNCIONALIDADES_DISPONIBLES.filter((id) => funcionalidades[id] === true);
        informar({
          preferenciasGuardadas: preferencias === undefined ? 'no (valores predeterminados)' : 'sí',
          funcionalidadesActivas: activas.length,
          activas: activas.join(', ') || '—',
          tema: typeof preferencias?.tema === 'string' ? preferencias.tema : '—',
        });
      })
      .catch((error) => informar({ errorAlmacenamiento: String(error?.message ?? error), funcionalidadesActivas: '—' }));
  } catch (error) {
    informar({ errorAlmacenamiento: String(error?.message ?? error), funcionalidadesActivas: '—' });
  }
})();

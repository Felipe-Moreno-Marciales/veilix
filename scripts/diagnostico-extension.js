/* global chrome, console, fetch */
/**
 * Diagnóstico ANONIMIZADO de la instalación de Veilix: comprueba si Chrome
 * puede inyectar el script de contenido en WhatsApp Web.
 *
 * Sirve cuando el panel muestra los interruptores activados, pero en la
 * pestaña de WhatsApp Web no aparece el contexto «Veilix» en DevTools ni
 * ningún estilo de Veilix. Distingue entre:
 * - una compilación de desarrollo (`npm run dev`), cuyo manifiesto no declara
 *   el script de contenido y depende del servidor de desarrollo;
 * - un manifiesto o un archivo del script ausentes;
 * - el acceso al sitio retirado por el usuario («Al hacer clic» o sitios
 *   específicos sin web.whatsapp.com);
 * - las preferencias que lee la extensión.
 *
 * Uso: en `chrome://extensions`, abre «Detalles» de Veilix → «Opciones de
 * extensión». En esa pestaña, abre las herramientas de desarrollo (F12) →
 * Consola, pega este archivo completo y pulsa Intro. Debe ejecutarse en una
 * página de la extensión (`chrome-extension://…`), no en WhatsApp Web.
 *
 * Privacidad:
 * - Solo LEE el manifiesto, los permisos, la lista de pestañas de WhatsApp Web
 *   que la extensión puede ver (solo cuántas hay) y las preferencias, y escribe
 *   en la consola. Solo consulta archivos de la propia extensión; no hace
 *   peticiones a Internet ni guarda nada.
 * - No muestra el identificador de la extensión, rutas del equipo, URL de
 *   pestañas, títulos ni contenidos. De las preferencias solo muestra qué
 *   funcionalidades están activadas.
 * - Revisa el resultado antes de compartirlo.
 */
(async () => {
  if (typeof chrome === 'undefined' || typeof chrome.runtime?.getManifest !== 'function' || !chrome.permissions) {
    console.log('Veilix · este fragmento debe ejecutarse en una página de la extensión (por ejemplo, «Opciones de extensión»), no en WhatsApp Web.');
    return;
  }
  const ORIGEN_WHATSAPP = 'https://web.whatsapp.com/*';
  const FUNCIONALIDADES = ['difuminarNombres', 'difuminarFotos', 'difuminarMensajesRecientes', 'difuminarMensajesConversacion', 'difuminarCampoEntrada'];
  const intentar = async (accion) => {
    try {
      return await accion();
    } catch (error) {
      return `error: ${String(error?.message ?? error)}`;
    }
  };

  const manifiesto = chrome.runtime.getManifest();
  const scripts = manifiesto.content_scripts ?? [];
  const scriptWhatsApp = scripts.find((s) => (s.matches ?? []).some((m) => m.includes('web.whatsapp.com')));
  const anfitriones = manifiesto.host_permissions ?? [];
  const politica = JSON.stringify(manifiesto.content_security_policy ?? '');
  const esDesarrollo = anfitriones.some((h) => h.includes('localhost')) || politica.includes('localhost');

  const archivoScript = scriptWhatsApp?.js?.[0]
    ? await intentar(async () => {
        const respuesta = await fetch(chrome.runtime.getURL(scriptWhatsApp.js[0]));
        const contenido = respuesta.ok ? await respuesta.text() : '';
        return respuesta.ok ? `presente (${contenido.length} caracteres)` : `NO encontrado (${respuesta.status})`;
      })
    : '—';
  const accesoEfectivo = await intentar(() => chrome.permissions.contains({ origins: [ORIGEN_WHATSAPP] }));
  const origenesConcedidos = await intentar(async () => (await chrome.permissions.getAll()).origins ?? []);
  const incognito = await intentar(async () => ({
    estaPaginaEnIncognito: chrome.extension?.inIncognitoContext ?? '—',
    permitidaEnIncognito: chrome.extension?.isAllowedIncognitoAccess ? await chrome.extension.isAllowedIncognitoAccess() : '—',
  }));
  const pestanasWhatsApp = chrome.tabs?.query
    ? await intentar(async () => (await chrome.tabs.query({ url: ORIGEN_WHATSAPP })).length)
    : 'sin acceso a la API de pestañas';
  const preferencias = await intentar(async () => {
    const guardadas = (await chrome.storage.local.get('preferencias')).preferencias;
    const activas = FUNCIONALIDADES.filter((id) => guardadas?.funcionalidades?.[id] === true);
    return { guardadas: guardadas === undefined ? 'no (predeterminadas)' : 'sí', activas: activas.join(', ') || '—' };
  });

  const resultado = {
    version: manifiesto.version,
    versionNombre: manifiesto.version_name ?? '—',
    tipoDeCompilacion: esDesarrollo ? 'DESARROLLO (npm run dev)' : 'producción (npm run build)',
    scriptDeContenidoDeclarado: scriptWhatsApp ? 'sí' : 'NO',
    coincidencias: scriptWhatsApp ? scriptWhatsApp.matches.join(', ') : '—',
    momento: scriptWhatsApp?.run_at ?? '—',
    rutaDelScript: scriptWhatsApp?.js?.join(', ') ?? '—',
    archivoDelScript: archivoScript,
    permisos: (manifiesto.permissions ?? []).join(', ') || '—',
    accesoEfectivoAWhatsApp: accesoEfectivo === true ? 'sí' : accesoEfectivo === false ? 'NO' : accesoEfectivo,
    origenesConcedidos: Array.isArray(origenesConcedidos) ? origenesConcedidos.join(', ') || '—' : origenesConcedidos,
    pestanasDeWhatsAppVisibles: pestanasWhatsApp,
    ...(typeof incognito === 'object' ? incognito : { incognito }),
    ...(typeof preferencias === 'object' ? { preferenciasGuardadas: preferencias.guardadas, funcionalidadesActivas: preferencias.activas } : { preferencias }),
  };

  let lectura;
  if (esDesarrollo || !scriptWhatsApp) {
    lectura = esDesarrollo
      ? 'Está cargada una compilación de DESARROLLO: su manifiesto no declara el script de contenido y depende del servidor de `npm run dev`. Quita esta carga, ejecuta `npm run build:chrome` y carga `.output/chrome-mv3`.'
      : 'El manifiesto cargado NO declara el script de contenido de WhatsApp Web: la carpeta cargada no es una compilación válida de Veilix. Carga `.output/chrome-mv3` tras `npm run build:chrome`.';
  } else if (!String(archivoScript).startsWith('presente')) {
    lectura = 'El manifiesto declara el script, pero su archivo no está en la carpeta cargada: vuelve a compilar y recarga la extensión.';
  } else if (accesoEfectivo !== true) {
    lectura = 'Veilix NO tiene acceso a web.whatsapp.com: el acceso al sitio está restringido. En chrome://extensions → Veilix → Detalles → «Acceso a sitios», elige «En todos los sitios» o añade https://web.whatsapp.com en «En sitios específicos», y recarga WhatsApp Web.';
  } else if (resultado.funcionalidadesActivas === '—') {
    lectura = 'La instalación es correcta, pero esta extensión lee todas las funcionalidades desactivadas: comprueba que no haya otra copia de Veilix instalada.';
  } else {
    lectura = 'La instalación es correcta y Chrome puede inyectar el script. Si en WhatsApp Web sigue sin aparecer el contexto «Veilix», revisa en el menú de extensiones (icono de pieza) que las extensiones estén permitidas en web.whatsapp.com y que la pestaña sea una pestaña normal (no una ventana de aplicación ni de incógnito).';
  }
  console.log(`Veilix · instalación: ${lectura}`);
  console.table([resultado]);
  console.log('Veilix · instalación (JSON):\n' + JSON.stringify({ resultado, lectura }, null, 2));
})();

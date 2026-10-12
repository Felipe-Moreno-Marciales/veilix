/**
 * Script de contenido para WhatsApp Web.
 *
 * Lee las preferencias locales y delega en el gestor la activación de los
 * módulos. No lee conversaciones, no almacena datos de WhatsApp y no realiza
 * peticiones de red.
 */
import { defineContentScript } from 'wxt/utils/define-content-script';
import { leerPreferencias, observarPreferencias } from '@/almacenamiento/almacen-preferencias';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { GestorModulos } from '@/nucleo/gestor-modulos';

export default defineContentScript({
  matches: ['https://web.whatsapp.com/*'],
  runAt: 'document_idle',
  async main(contexto) {
    const gestor = new GestorModulos({
      modulos: MODULOS_FUNCIONALIDADES,
      documento: document,
      senal: contexto.signal,
    });

    const dejarDeObservar = observarPreferencias((preferencias) => {
      gestor.aplicar(preferencias);
    });
    contexto.onInvalidated(() => {
      dejarDeObservar();
      gestor.detenerTodo();
    });

    gestor.aplicar(await leerPreferencias());
  },
});

/**
 * Módulo: difuminar mensajes recientes (RF-03).
 *
 * Difumina la vista previa del último mensaje de cada fila de la lista de
 * chats. Las filas se reclasifican con cada mutación, por lo que la
 * protección se mantiene al llegar mensajes nuevos o al reordenarse la lista.
 */
import { crearMarcadorListaChats } from '@/nucleo/difuminado/marcador-lista-chats';
import { crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import { FILA_CHAT } from '@/nucleo/difuminado/selectores';

export const ATRIBUTO_VISTA_PREVIA = 'data-veilix-vista-previa';

export const moduloDifuminarMensajesRecientes = crearModuloDifuminado({
  id: 'difuminarMensajesRecientes',
  sufijo: 'mensajes-recientes',
  reglas: [{ contenedor: FILA_CHAT, objetivo: `[${ATRIBUTO_VISTA_PREVIA}]`, revelarConFoco: true }],
  marcador: crearMarcadorListaChats('vistaPrevia', ATRIBUTO_VISTA_PREVIA),
});

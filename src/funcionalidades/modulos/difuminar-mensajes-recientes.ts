/**
 * Módulo: difuminar mensajes recientes (RF-03).
 *
 * Difumina, en cada fila de la lista de chats:
 * - La vista previa del último mensaje (`data-veilix-vista-previa`).
 * - El indicador de estado asociado a esa vista previa cuando el último
 *   mensaje es propio (`data-veilix-estado-vista-previa`). Solo se reconoce el
 *   icono confirmado `wds-ic-read` (ver `TITULOS_ICONO_ESTADO`).
 *
 * Ambos se revelan juntos con la fila. Las filas se reclasifican con cada
 * mutación, por lo que la protección se mantiene al llegar mensajes nuevos o
 * al reordenarse la lista. Los demás iconos (silenciado, fijado, estados,
 * mensajes temporales, stickers…) y el contador de no leídos siguen visibles.
 */
import {
  crearMarcadorEstadoVistaPrevia,
  crearMarcadorListaChats,
} from '@/nucleo/difuminado/marcador-lista-chats';
import { combinarMarcadores, crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import { FILA_CHAT } from '@/nucleo/difuminado/selectores';

export const ATRIBUTO_VISTA_PREVIA = 'data-veilix-vista-previa';
export const ATRIBUTO_ESTADO_VISTA_PREVIA = 'data-veilix-estado-vista-previa';

export const moduloDifuminarMensajesRecientes = crearModuloDifuminado({
  id: 'difuminarMensajesRecientes',
  sufijo: 'mensajes-recientes',
  reglas: [
    {
      contenedor: FILA_CHAT,
      objetivo: `[${ATRIBUTO_VISTA_PREVIA}], [${ATRIBUTO_ESTADO_VISTA_PREVIA}]`,
      revelarConFoco: true,
    },
  ],
  marcador: combinarMarcadores(
    crearMarcadorListaChats('vistaPrevia', ATRIBUTO_VISTA_PREVIA),
    crearMarcadorEstadoVistaPrevia(ATRIBUTO_ESTADO_VISTA_PREVIA),
  ),
});

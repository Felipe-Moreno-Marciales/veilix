/**
 * Módulo: difuminar mensajes de conversaciones (RF-04).
 *
 * Difumina, dentro de cada mensaje:
 * - Con CSS: el texto y la multimedia de los mensajes recibidos y enviados
 *   (`TEXTO_MENSAJE` y `MULTIMEDIA_MENSAJE`). Se aplica solo a los mensajes
 *   nuevos, al desplazarse y al cambiar de conversación.
 * - Con un marcador (`marcador-mensajes.ts`): la hora y las reacciones, que no
 *   pueden seleccionarse solo con CSS.
 * - Con el mismo marcador: el indicador de estado de los mensajes enviados
 *   dentro de `msg-meta`. Solo se reconoce el icono confirmado `wds-ic-read`
 *   (ver `TITULOS_ICONO_ESTADO`).
 * - Con CSS (desde 0.1.2-beta.0): el texto citado del recuadro «Responder»,
 *   encima del editor (`CITA_RESPUESTA`, estructura confirmada). Solo el
 *   texto: el autor corresponde a RF-01, y la X para cancelar y los demás
 *   controles siguen visibles. Se revela con el recuadro.
 *
 * La fila del mensaje no se difumina entera: los botones de reaccionar,
 * descargar, responder y reproducir, los demás iconos, los separadores y el
 * editor siguen visibles. El revelado temporal abarca el
 * mensaje completo (su fila).
 */
import { crearMarcadorMensajes } from '@/nucleo/difuminado/marcador-mensajes';
import { crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import {
  CITA_RESPUESTA,
  CONTENIDO_MENSAJE,
  FILA_MENSAJE,
  MENSAJE,
  TEXTO_CITA_RESPUESTA,
} from '@/nucleo/difuminado/selectores';

export const ATRIBUTO_HORA_MENSAJE = 'data-veilix-hora-mensaje';
export const ATRIBUTO_REACCION = 'data-veilix-reaccion';
export const ATRIBUTO_ESTADO_MENSAJE = 'data-veilix-estado-mensaje';

export const moduloDifuminarMensajesConversacion = crearModuloDifuminado({
  id: 'difuminarMensajesConversacion',
  sufijo: 'mensajes-conversacion',
  reglas: [
    {
      contenedor: `${FILA_MENSAJE}, ${MENSAJE}`,
      objetivo: [
        CONTENIDO_MENSAJE,
        `[${ATRIBUTO_HORA_MENSAJE}]`,
        `[${ATRIBUTO_REACCION}]`,
        `[${ATRIBUTO_ESTADO_MENSAJE}]`,
      ].join(', '),
      revelarConFoco: true,
    },
    { contenedor: CITA_RESPUESTA, objetivo: TEXTO_CITA_RESPUESTA, revelarConFoco: true },
  ],
  marcador: crearMarcadorMensajes({
    hora: ATRIBUTO_HORA_MENSAJE,
    reaccion: ATRIBUTO_REACCION,
    estado: ATRIBUTO_ESTADO_MENSAJE,
  }),
});

/**
 * Módulo: difuminar mensajes de conversaciones (RF-04).
 *
 * Difumina, dentro de cada mensaje:
 * - Con CSS: el texto y la multimedia de los mensajes recibidos y enviados
 *   (`TEXTO_MENSAJE` y `MULTIMEDIA_MENSAJE`). Se aplica solo a los mensajes
 *   nuevos, al desplazarse y al cambiar de conversación. Desde 0.1.2-beta.7,
 *   también las miniaturas de vídeo dibujadas como fondos `data:image/jpeg`
 *   dentro de `video-content` (`MINIATURA_VIDEO`, estructura confirmada).
 *   Desde 0.1.2-beta.8, el nombre, el formato y el tamaño de los documentos
 *   adjuntos (`DATOS_DOCUMENTO`, estructura confirmada), sin la tarjeta, que es
 *   el control que abre o descarga el archivo. Desde 0.1.2-beta.9, también la
 *   etiqueta de la extensión del icono (`ETIQUETA_ICONO_DOCUMENTO`), sin el
 *   dibujo del icono. Desde 0.1.2-beta.10, la miniatura de las citas dentro de
 *   los mensajes (`MINIATURA_CITA`, estructura confirmada), sin la cita entera.
 * - Con el marcador (desde 0.1.2-beta.11): la duración de una cita («0:18»),
 *   que es un nodo de texto directo de su contenedor y no puede seleccionarse
 *   con CSS. Se difumina el contenedor entero, con su icono
 *   `chat-msg-symbol` y su texto citado, que no recibe un segundo filtro.
 *   El encabezado de la cita no cambia.
 * - Con el marcador (desde 0.1.2-beta.12): el encabezado de un estado citado
 *   («Tú · Estados»), reconocido por su estructura confirmada y, como
 *   criterio complementario, por la forma de su texto (español e inglés).
 *   Solo el `span`: la barra de color y la cita no cambian.
 * - Con un marcador (`marcador-mensajes.ts`): la hora y las reacciones, que no
 *   pueden seleccionarse solo con CSS.
 * - Con el mismo marcador: el indicador de estado de los mensajes enviados
 *   dentro de `msg-meta`. Solo se reconoce el icono confirmado `wds-ic-read`
 *   (ver `TITULOS_ICONO_ESTADO`).
 * - Con CSS (desde 0.1.2-beta.4): el texto de la copia del mensaje en «Info.
 *   del mensaje», que se abre fuera de `#main` (`MENSAJE_INFO`, estructura
 *   confirmada). Solo el texto: el título, el cierre, la hora, los
 *   indicadores y los estados de entrega y lectura siguen visibles. Se revela
 *   con la copia del mensaje. Desde 0.1.2-beta.5, también los stickers de esa
 *   copia (`VISUAL_STICKER_INFO`: su `canvas` y su `img` de origen `blob:`),
 *   con una regla aparte y el mismo revelado. Las fotos y los vídeos de esa
 *   pantalla no están observados.
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
  MENSAJE_INFO,
  TEXTO_CITA_RESPUESTA,
  TEXTO_MENSAJE_INFO,
  VISUAL_STICKER_INFO,
} from '@/nucleo/difuminado/selectores';

export const ATRIBUTO_HORA_MENSAJE = 'data-veilix-hora-mensaje';
export const ATRIBUTO_REACCION = 'data-veilix-reaccion';
export const ATRIBUTO_ESTADO_MENSAJE = 'data-veilix-estado-mensaje';
export const ATRIBUTO_DURACION_CITA = 'data-veilix-duracion-cita';
export const ATRIBUTO_ENCABEZADO_ESTADO = 'data-veilix-encabezado-estado';

export const moduloDifuminarMensajesConversacion = crearModuloDifuminado({
  id: 'difuminarMensajesConversacion',
  sufijo: 'mensajes-conversacion',
  reglas: [
    {
      contenedor: `${FILA_MENSAJE}, ${MENSAJE}`,
      objetivo: [
        // Lo que está dentro de la duración de una cita se difumina con ella, con un solo filtro.
        `:is(${CONTENIDO_MENSAJE}):not([${ATRIBUTO_DURACION_CITA}] *)`,
        `[${ATRIBUTO_DURACION_CITA}]`,
        `[${ATRIBUTO_ENCABEZADO_ESTADO}]`,
        `[${ATRIBUTO_HORA_MENSAJE}]`,
        `[${ATRIBUTO_REACCION}]`,
        `[${ATRIBUTO_ESTADO_MENSAJE}]`,
      ].join(', '),
      revelarConFoco: true,
    },
    { contenedor: CITA_RESPUESTA, objetivo: TEXTO_CITA_RESPUESTA, revelarConFoco: true },
    // «Info. del mensaje» (fuera de `#main`): solo el texto de la copia del mensaje.
    { contenedor: MENSAJE_INFO, objetivo: TEXTO_MENSAJE_INFO, revelarConFoco: true },
    // «Info. del mensaje»: stickers de la copia del mensaje (canvas e img de blob:), con el mismo revelado.
    { contenedor: MENSAJE_INFO, objetivo: VISUAL_STICKER_INFO, revelarConFoco: true },
  ],
  marcador: crearMarcadorMensajes({
    hora: ATRIBUTO_HORA_MENSAJE,
    reaccion: ATRIBUTO_REACCION,
    estado: ATRIBUTO_ESTADO_MENSAJE,
    duracionCita: ATRIBUTO_DURACION_CITA,
    encabezadoEstado: ATRIBUTO_ENCABEZADO_ESTADO,
  }),
});

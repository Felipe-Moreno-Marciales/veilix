/**
 * Módulo: difuminar mensajes de conversaciones (RF-04).
 *
 * Difumina con CSS el contenido (texto, citas e imágenes) de los mensajes
 * entrantes y salientes de la conversación abierta. No requiere observar el
 * DOM: las reglas se aplican automáticamente a los mensajes nuevos y al
 * cambiar de conversación. Los controles del mensaje no se difuminan.
 */
import { crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import { CONTENIDO_MENSAJE, MENSAJE } from '@/nucleo/difuminado/selectores';

export const moduloDifuminarMensajesConversacion = crearModuloDifuminado({
  id: 'difuminarMensajesConversacion',
  sufijo: 'mensajes-conversacion',
  reglas: [{ contenedor: MENSAJE, objetivo: CONTENIDO_MENSAJE, revelarConFoco: true }],
});

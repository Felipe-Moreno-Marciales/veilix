/**
 * Módulo: difuminar fotografías de contactos (RF-02).
 *
 * Difumina con CSS las fotografías (`<img>`) de la lista de chats y del
 * encabezado de la conversación. Las imágenes originales no se modifican y
 * los iconos funcionales (`[data-icon]`, SVG) quedan excluidos.
 */
import { crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import {
  ENCABEZADO_CONVERSACION,
  FILA_CHAT,
  FOTOGRAFIA,
} from '@/nucleo/difuminado/selectores';

export const moduloDifuminarFotos = crearModuloDifuminado({
  id: 'difuminarFotos',
  sufijo: 'fotos',
  reglas: [
    { contenedor: FILA_CHAT, objetivo: FOTOGRAFIA, revelarConFoco: true },
    { contenedor: ENCABEZADO_CONVERSACION, objetivo: FOTOGRAFIA, revelarConFoco: true },
  ],
});

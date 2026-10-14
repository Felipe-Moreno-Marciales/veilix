/**
 * Módulo: difuminar nombres de contactos (RF-01).
 *
 * - Lista de chats: el nombre de cada fila se marca con
 *   `data-veilix-nombre` (ver `marcador-lista-chats.ts`) y se difumina.
 * - Encabezado de la conversación: se difuminan el nombre y el subtítulo.
 *
 * Revelado temporal: cursor sobre la fila o el encabezado, foco de teclado
 * en la fila, o Ctrl + Mayús + Espacio.
 */
import { crearMarcadorListaChats } from '@/nucleo/difuminado/marcador-lista-chats';
import { crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import {
  ENCABEZADO_CONVERSACION,
  FILA_CHAT,
  TEXTO_ENCABEZADO,
} from '@/nucleo/difuminado/selectores';

export const ATRIBUTO_NOMBRE = 'data-veilix-nombre';

export const moduloDifuminarNombres = crearModuloDifuminado({
  id: 'difuminarNombres',
  sufijo: 'nombres',
  reglas: [
    { contenedor: FILA_CHAT, objetivo: `[${ATRIBUTO_NOMBRE}]`, revelarConFoco: true },
    { contenedor: ENCABEZADO_CONVERSACION, objetivo: TEXTO_ENCABEZADO, revelarConFoco: true },
  ],
  marcador: crearMarcadorListaChats('nombre', ATRIBUTO_NOMBRE),
});

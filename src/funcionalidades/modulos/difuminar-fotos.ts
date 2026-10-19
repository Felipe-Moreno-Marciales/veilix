/**
 * Módulo: difuminar fotografías de contactos (RF-02).
 *
 * Difumina con CSS, sin modificar las imágenes:
 * 1. Los avatares de las filas de la lista de chats y del encabezado de la
 *    conversación (por ubicación): `<svg>` con máscara que contiene una
 *    `<image>` o un `<foreignObject>` (estructura observada en WhatsApp Web
 *    real), `<img>` y avatares predeterminados con `data-icon`.
 * 2. Las fotos de perfil en cualquier otra zona (panel de información,
 *    remitentes en grupos, paneles laterales…), reconocidas por su origen,
 *    en `<img>`, en `<image>` dentro de un SVG o en imágenes de fondo en línea.
 *
 * No afecta a iconos funcionales, contadores, botones ni imágenes de los
 * mensajes. Salvo la estructura SVG de la lista, los selectores son
 * hipótesis pendientes de validar en WhatsApp Web real (ver `selectores.ts`).
 */
import { crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import {
  AVATAR_PREDETERMINADO,
  AVATAR_SVG,
  ENCABEZADO_CONVERSACION,
  FILA_CHAT,
  FOTO_PERFIL,
  FOTO_PERFIL_SVG,
  FOTOGRAFIA,
} from '@/nucleo/difuminado/selectores';

// Incluye también los avatares reconocidos por su origen, para que el
// revelado con la fila o el encabezado funcione con cualquier representación.
const AVATAR_POR_UBICACION = [
  AVATAR_SVG,
  FOTOGRAFIA,
  FOTO_PERFIL,
  FOTO_PERFIL_SVG,
  AVATAR_PREDETERMINADO,
].join(', ');

export const moduloDifuminarFotos = crearModuloDifuminado({
  id: 'difuminarFotos',
  sufijo: 'fotos',
  reglas: [
    { contenedor: FILA_CHAT, objetivo: AVATAR_POR_UBICACION, revelarConFoco: true },
    { contenedor: ENCABEZADO_CONVERSACION, objetivo: AVATAR_POR_UBICACION, revelarConFoco: true },
    // Fuera de la lista y del encabezado, el propio avatar delimita el revelado.
    {
      contenedor: `${FOTO_PERFIL}, ${FOTO_PERFIL_SVG}, ${AVATAR_PREDETERMINADO}`,
      objetivo: null,
      revelarConFoco: true,
    },
  ],
});

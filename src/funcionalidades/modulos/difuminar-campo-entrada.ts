/**
 * Módulo: difuminar el campo de entrada (RF-05).
 *
 * Difumina visualmente el editor de mensajes. El texto, el cursor, la
 * selección, la copia y el envío no se ven afectados porque solo se aplica
 * `filter` mediante CSS.
 *
 * El foco no revela el contenido (el editor está enfocado mientras se
 * escribe); se revela con el cursor encima o con Ctrl + Mayús + Espacio.
 */
import { crearModuloDifuminado } from '@/nucleo/difuminado/modulo-difuminado';
import { CAMPO_ENTRADA } from '@/nucleo/difuminado/selectores';

export const moduloDifuminarCampoEntrada = crearModuloDifuminado({
  id: 'difuminarCampoEntrada',
  sufijo: 'campo-entrada',
  reglas: [{ contenedor: CAMPO_ENTRADA, objetivo: null, revelarConFoco: false }],
});

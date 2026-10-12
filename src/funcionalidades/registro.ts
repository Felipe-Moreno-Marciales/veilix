/** Registro de todos los módulos de funcionalidad disponibles para el gestor. */
import type { ModuloFuncionalidad } from '@/nucleo/modulo';
import { moduloDifuminarCampoEntrada } from './modulos/difuminar-campo-entrada';
import { moduloDifuminarFotos } from './modulos/difuminar-fotos';
import { moduloDifuminarMensajesConversacion } from './modulos/difuminar-mensajes-conversacion';
import { moduloDifuminarMensajesRecientes } from './modulos/difuminar-mensajes-recientes';
import { moduloDifuminarNombres } from './modulos/difuminar-nombres';
import { moduloOcultarEnLinea } from './modulos/ocultar-en-linea';
import { moduloOcultarEscritura } from './modulos/ocultar-escritura';
import { moduloRestaurarMensajesEliminados } from './modulos/restaurar-mensajes-eliminados';
import { moduloVerEstadosPrivado } from './modulos/ver-estados-privado';

export const MODULOS_FUNCIONALIDADES: readonly ModuloFuncionalidad[] = [
  moduloDifuminarNombres,
  moduloDifuminarFotos,
  moduloDifuminarMensajesRecientes,
  moduloDifuminarMensajesConversacion,
  moduloDifuminarCampoEntrada,
  moduloOcultarEscritura,
  moduloVerEstadosPrivado,
  moduloOcultarEnLinea,
  moduloRestaurarMensajesEliminados,
];

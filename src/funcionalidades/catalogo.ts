/**
 * Catálogo de las funcionalidades aprobadas para Veilix.
 *
 * Es la única fuente de verdad sobre qué funcionalidades existen, cómo se
 * presentan en el panel y si ya están implementadas. Una funcionalidad solo
 * puede activarse cuando su estado es `disponible`.
 */
import { ATAJO_REVELADO } from '@/nucleo/difuminado/revelado-teclado';

// El foco solo revela cuando WhatsApp permite enfocar con el teclado la fila,
// el mensaje o el panel (`:focus-visible`). En el editor, el foco no revela:
// si lo hiciera, el texto quedaría visible siempre mientras se escribe.
const REVELADO_GENERAL = `Revelar: cursor encima o ${ATAJO_REVELADO}; también con el foco del teclado donde WhatsApp lo permita.`;
const REVELADO_EDITOR = `Revelar: cursor encima o ${ATAJO_REVELADO}.`;

export const IDS_FUNCIONALIDADES = [
  'difuminarNombres',
  'difuminarFotos',
  'difuminarMensajesRecientes',
  'difuminarMensajesConversacion',
  'difuminarCampoEntrada',
  'ocultarEscritura',
  'restaurarMensajesEliminados',
  'verEstadosPrivado',
  'ocultarEnLinea',
] as const;

export type IdFuncionalidad = (typeof IDS_FUNCIONALIDADES)[number];

/**
 * `pendiente`: aún sin implementar; no se ofrece ningún control.
 * `disponible`: implementada; el panel muestra su interruptor.
 */
export type EstadoImplementacion = 'pendiente' | 'disponible';

export type CategoriaFuncionalidad = 'difuminado' | 'actividad' | 'mensajes';

export interface DefinicionFuncionalidad {
  readonly id: IdFuncionalidad;
  readonly titulo: string;
  readonly descripcion: string;
  readonly categoria: CategoriaFuncionalidad;
  readonly estado: EstadoImplementacion;
  /** Consideraciones de privacidad o de diseño que se mostrarán al usuario. */
  readonly nota?: string;
}

export const CATEGORIAS: readonly {
  readonly id: CategoriaFuncionalidad;
  readonly titulo: string;
}[] = [
  { id: 'difuminado', titulo: 'Difuminado visual' },
  { id: 'actividad', titulo: 'Actividad y presencia' },
  { id: 'mensajes', titulo: 'Mensajes' },
];

export const CATALOGO_FUNCIONALIDADES: readonly DefinicionFuncionalidad[] = [
  {
    id: 'difuminarNombres',
    titulo: 'Difuminar nombres de contactos',
    descripcion: 'Difumina la identidad de contactos y grupos: sus nombres en la lista de chats, el encabezado de la conversación, los remitentes de los mensajes de grupo, el autor citado al responder y «Nuevo chat», y el nombre, el usuario, el teléfono y la descripción en «Info. del contacto».',
    categoria: 'difuminado',
    estado: 'disponible',
    nota: REVELADO_GENERAL,
  },
  {
    id: 'difuminarFotos',
    titulo: 'Difuminar fotografías de contactos',
    descripcion: 'Difumina las fotografías y los avatares de contactos y grupos, incluidos los predeterminados y los de iniciales, en la lista de chats, el encabezado, «Nuevo chat» y junto a los mensajes de grupo.',
    categoria: 'difuminado',
    estado: 'disponible',
    nota: REVELADO_GENERAL,
  },
  {
    id: 'difuminarMensajesRecientes',
    titulo: 'Difuminar mensajes recientes',
    descripcion: 'Difumina la vista previa del último mensaje de cada chat en la lista, con sus emojis, sus reacciones y el indicador de leído.',
    categoria: 'difuminado',
    estado: 'disponible',
    nota: REVELADO_GENERAL,
  },
  {
    id: 'difuminarMensajesConversacion',
    titulo: 'Difuminar mensajes de conversaciones',
    descripcion: 'Difumina el texto, la multimedia, la hora y las reacciones de los mensajes, el texto citado al responder y el texto y los stickers de «Info. del mensaje».',
    categoria: 'difuminado',
    estado: 'disponible',
    nota: REVELADO_GENERAL,
  },
  {
    id: 'difuminarCampoEntrada',
    titulo: 'Difuminar el campo de entrada',
    descripcion: 'Difumina lo que escribes en el campo de mensaje, sin impedir escribir, corregir ni enviar.',
    categoria: 'difuminado',
    estado: 'disponible',
    nota: REVELADO_EDITOR,
  },
  {
    id: 'ocultarEscritura',
    titulo: 'Ocultar el estado de escritura',
    descripcion: 'Evita que los contactos vean el indicador «escribiendo…».',
    categoria: 'actividad',
    estado: 'pendiente',
    nota: 'Su viabilidad técnica se evaluará antes de implementarla.',
  },
  {
    id: 'verEstadosPrivado',
    titulo: 'Ver estados de forma privada',
    descripcion: 'Permite ver estados sin notificar la visualización.',
    categoria: 'actividad',
    estado: 'pendiente',
    nota: 'Se priorizará la configuración oficial de privacidad de WhatsApp.',
  },
  {
    id: 'ocultarEnLinea',
    titulo: 'Ocultar el estado en línea',
    descripcion: 'Evita mostrar que se está «en línea».',
    categoria: 'actividad',
    estado: 'pendiente',
    nota: 'Se priorizará la configuración oficial de privacidad de WhatsApp.',
  },
  {
    id: 'restaurarMensajesEliminados',
    titulo: 'Restaurar mensajes eliminados',
    descripcion: 'Muestra mensajes eliminados que se hayan almacenado previamente en este equipo.',
    categoria: 'mensajes',
    estado: 'pendiente',
    nota: 'Requerirá consentimiento explícito. Los datos se guardarán solo de forma local.',
  },
];

const DEFINICIONES_POR_ID: ReadonlyMap<IdFuncionalidad, DefinicionFuncionalidad> = new Map(
  CATALOGO_FUNCIONALIDADES.map((definicion) => [definicion.id, definicion]),
);

export function esIdFuncionalidad(valor: unknown): valor is IdFuncionalidad {
  return typeof valor === 'string' && (IDS_FUNCIONALIDADES as readonly string[]).includes(valor);
}

export function obtenerDefinicion(id: IdFuncionalidad): DefinicionFuncionalidad {
  const definicion = DEFINICIONES_POR_ID.get(id);
  if (!definicion) {
    throw new Error(`Funcionalidad desconocida: ${id}`);
  }
  return definicion;
}

export function estaDisponible(id: IdFuncionalidad): boolean {
  return obtenerDefinicion(id).estado === 'disponible';
}

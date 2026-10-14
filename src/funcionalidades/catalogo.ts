/**
 * Catálogo de las funcionalidades aprobadas para Veilix.
 *
 * Es la única fuente de verdad sobre qué funcionalidades existen, cómo se
 * presentan en el panel y si ya están implementadas. Una funcionalidad solo
 * puede activarse cuando su estado es `disponible`.
 */
import { ATAJO_REVELADO } from '@/nucleo/difuminado/revelado-teclado';

const REVELADO_GENERAL = `Revelar: cursor encima, foco del teclado o ${ATAJO_REVELADO}.`;
const REVELADO_EDITOR = `Revelar: cursor encima o ${ATAJO_REVELADO}. Se escribe con normalidad.`;

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
    descripcion: 'Oculta los nombres de contactos y grupos hasta pasar el cursor sobre ellos.',
    categoria: 'difuminado',
    estado: 'disponible',
    nota: REVELADO_GENERAL,
  },
  {
    id: 'difuminarFotos',
    titulo: 'Difuminar fotografías de contactos',
    descripcion: 'Difumina las fotografías de perfil de contactos y grupos.',
    categoria: 'difuminado',
    estado: 'disponible',
    nota: REVELADO_GENERAL,
  },
  {
    id: 'difuminarMensajesRecientes',
    titulo: 'Difuminar mensajes recientes',
    descripcion: 'Difumina la vista previa del último mensaje en la lista de chats.',
    categoria: 'difuminado',
    estado: 'disponible',
    nota: REVELADO_GENERAL,
  },
  {
    id: 'difuminarMensajesConversacion',
    titulo: 'Difuminar mensajes de conversaciones',
    descripcion: 'Difumina el contenido de los mensajes dentro de la conversación abierta.',
    categoria: 'difuminado',
    estado: 'disponible',
    nota: REVELADO_GENERAL,
  },
  {
    id: 'difuminarCampoEntrada',
    titulo: 'Difuminar el campo de entrada',
    descripcion: 'Difumina el texto que se está escribiendo en el campo de mensaje.',
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

/**
 * Modelo de preferencias del usuario y su validación.
 *
 * Todo valor leído del almacenamiento se considera no confiable y se
 * normaliza antes de usarse: los campos desconocidos se descartan y las
 * funcionalidades pendientes se fuerzan a `false`.
 */
import { IDS_FUNCIONALIDADES, estaDisponible, type IdFuncionalidad } from '@/funcionalidades/catalogo';

export const TEMAS = ['sistema', 'claro', 'oscuro'] as const;
export type Tema = (typeof TEMAS)[number];

export type EstadoFuncionalidades = Readonly<Record<IdFuncionalidad, boolean>>;

export interface Preferencias {
  readonly tema: Tema;
  readonly funcionalidades: EstadoFuncionalidades;
}

function crearEstadoInicialFuncionalidades(): EstadoFuncionalidades {
  return Object.fromEntries(IDS_FUNCIONALIDADES.map((id) => [id, false])) as Record<
    IdFuncionalidad,
    boolean
  >;
}

export const PREFERENCIAS_PREDETERMINADAS: Preferencias = Object.freeze({
  tema: 'sistema',
  funcionalidades: Object.freeze(crearEstadoInicialFuncionalidades()),
});

export function esTema(valor: unknown): valor is Tema {
  return typeof valor === 'string' && (TEMAS as readonly string[]).includes(valor);
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/** Devuelve siempre un objeto de preferencias válido y completo. */
export function normalizarPreferencias(valor: unknown): Preferencias {
  if (!esObjeto(valor)) {
    return PREFERENCIAS_PREDETERMINADAS;
  }

  const tema = esTema(valor['tema']) ? valor['tema'] : PREFERENCIAS_PREDETERMINADAS.tema;
  const origen = esObjeto(valor['funcionalidades']) ? valor['funcionalidades'] : {};
  const funcionalidades = crearEstadoInicialFuncionalidades() as Record<IdFuncionalidad, boolean>;

  for (const id of IDS_FUNCIONALIDADES) {
    funcionalidades[id] = origen[id] === true && estaDisponible(id);
  }

  return { tema, funcionalidades };
}

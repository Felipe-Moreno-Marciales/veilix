import { describe, expect, it } from 'vitest';
import {
  CATALOGO_FUNCIONALIDADES,
  CATEGORIAS,
  IDS_FUNCIONALIDADES,
  esIdFuncionalidad,
  estaDisponible,
  obtenerDefinicion,
} from '@/funcionalidades/catalogo';

describe('catálogo de funcionalidades', () => {
  it('contiene exactamente las nueve funcionalidades aprobadas', () => {
    expect(IDS_FUNCIONALIDADES).toHaveLength(9);
    expect(CATALOGO_FUNCIONALIDADES.map((f) => f.id).sort()).toEqual([...IDS_FUNCIONALIDADES].sort());
  });

  it('no repite identificadores', () => {
    expect(new Set(CATALOGO_FUNCIONALIDADES.map((f) => f.id)).size).toBe(9);
  });

  it('asigna cada funcionalidad a una categoría existente', () => {
    const categorias = new Set(CATEGORIAS.map((c) => c.id));
    for (const funcionalidad of CATALOGO_FUNCIONALIDADES) {
      expect(categorias.has(funcionalidad.categoria)).toBe(true);
    }
  });

  it('tiene disponibles solo las cinco funcionalidades de difuminado (fase 2)', () => {
    const disponibles = IDS_FUNCIONALIDADES.filter((id) => estaDisponible(id));
    expect(disponibles.sort()).toEqual(
      [
        'difuminarCampoEntrada',
        'difuminarFotos',
        'difuminarMensajesConversacion',
        'difuminarMensajesRecientes',
        'difuminarNombres',
      ].sort(),
    );
    for (const id of ['ocultarEscritura', 'verEstadosPrivado', 'ocultarEnLinea', 'restaurarMensajesEliminados'] as const) {
      expect(obtenerDefinicion(id).estado).toBe('pendiente');
    }
  });

  it('valida identificadores', () => {
    expect(esIdFuncionalidad('difuminarNombres')).toBe(true);
    expect(esIdFuncionalidad('desconocida')).toBe(false);
    expect(esIdFuncionalidad(42)).toBe(false);
  });
});

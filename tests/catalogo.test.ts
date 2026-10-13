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

  it('marca todas las funcionalidades como pendientes en la fase 1', () => {
    for (const id of IDS_FUNCIONALIDADES) {
      expect(obtenerDefinicion(id).estado).toBe('pendiente');
      expect(estaDisponible(id)).toBe(false);
    }
  });

  it('valida identificadores', () => {
    expect(esIdFuncionalidad('difuminarNombres')).toBe(true);
    expect(esIdFuncionalidad('desconocida')).toBe(false);
    expect(esIdFuncionalidad(42)).toBe(false);
  });
});

// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { IDS_FUNCIONALIDADES } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';

describe('registro de módulos', () => {
  it('tiene un módulo independiente por cada funcionalidad del catálogo', () => {
    const ids = MODULOS_FUNCIONALIDADES.map((modulo) => modulo.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...IDS_FUNCIONALIDADES].sort());
  });

  it('impide activar módulos pendientes', () => {
    const contexto = { documento: document, senal: new AbortController().signal };
    for (const modulo of MODULOS_FUNCIONALIDADES) {
      expect(() => {
        modulo.activar(contexto);
      }).toThrow(/pendiente/);
      expect(() => {
        modulo.desactivar();
      }).not.toThrow();
    }
  });
});

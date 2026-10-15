import { describe, expect, it } from 'vitest';
import { IDS_FUNCIONALIDADES } from '@/funcionalidades/catalogo';
import {
  PREFERENCIAS_PREDETERMINADAS,
  esTema,
  normalizarPreferencias,
} from '@/almacenamiento/preferencias';

describe('normalizarPreferencias', () => {
  it('usa los valores predeterminados ante datos inválidos', () => {
    for (const valor of [undefined, null, 'texto', 3, [], true]) {
      expect(normalizarPreferencias(valor)).toEqual(PREFERENCIAS_PREDETERMINADAS);
    }
  });

  it('desactiva todas las funcionalidades por defecto', () => {
    for (const id of IDS_FUNCIONALIDADES) {
      expect(PREFERENCIAS_PREDETERMINADAS.funcionalidades[id]).toBe(false);
    }
  });

  it('conserva un tema válido y descarta uno inválido', () => {
    expect(normalizarPreferencias({ tema: 'oscuro' }).tema).toBe('oscuro');
    expect(normalizarPreferencias({ tema: 'rosa' }).tema).toBe('sistema');
  });

  it('fuerza a falso las funcionalidades pendientes', () => {
    const resultado = normalizarPreferencias({
      funcionalidades: { ocultarEscritura: true, ocultarEnLinea: true },
    });
    expect(resultado.funcionalidades.ocultarEscritura).toBe(false);
    expect(resultado.funcionalidades.ocultarEnLinea).toBe(false);
  });

  it('conserva las funcionalidades disponibles activadas', () => {
    const resultado = normalizarPreferencias({
      funcionalidades: { difuminarNombres: true, difuminarFotos: false },
    });
    expect(resultado.funcionalidades.difuminarNombres).toBe(true);
    expect(resultado.funcionalidades.difuminarFotos).toBe(false);
  });

  it('descarta claves desconocidas y valores no booleanos', () => {
    const resultado = normalizarPreferencias({
      tema: 'claro',
      extra: 'x',
      funcionalidades: { desconocida: true, difuminarFotos: 'sí' },
    });
    expect(Object.keys(resultado).sort()).toEqual(['funcionalidades', 'tema']);
    expect(Object.keys(resultado.funcionalidades).sort()).toEqual([...IDS_FUNCIONALIDADES].sort());
  });

  it('reconoce los temas admitidos', () => {
    expect(esTema('sistema')).toBe(true);
    expect(esTema('claro')).toBe(true);
    expect(esTema('oscuro')).toBe(true);
    expect(esTema('azul')).toBe(false);
  });
});

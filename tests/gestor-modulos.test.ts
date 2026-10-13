// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { IDS_FUNCIONALIDADES, type IdFuncionalidad } from '@/funcionalidades/catalogo';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import { GestorModulos, calcularFuncionalidadesActivas } from '@/nucleo/gestor-modulos';
import type { ModuloFuncionalidad } from '@/nucleo/modulo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';

function preferenciasCon(cambios: Partial<Preferencias['funcionalidades']>): Preferencias {
  return {
    ...PREFERENCIAS_PREDETERMINADAS,
    funcionalidades: { ...PREFERENCIAS_PREDETERMINADAS.funcionalidades, ...cambios },
  };
}

function crearModuloEspia(id: IdFuncionalidad) {
  return { id, activar: vi.fn(), desactivar: vi.fn() } satisfies ModuloFuncionalidad;
}

/** Simula que ciertas funcionalidades ya están implementadas. */
function disponibles(...ids: IdFuncionalidad[]) {
  return (id: IdFuncionalidad) => ids.includes(id);
}

describe('calcularFuncionalidadesActivas', () => {
  it('ignora las funcionalidades pendientes aunque estén habilitadas', () => {
    const activas = calcularFuncionalidadesActivas(preferenciasCon({ difuminarNombres: true }));
    expect(activas.size).toBe(0);
  });

  it('incluye solo las funcionalidades disponibles y habilitadas', () => {
    const activas = calcularFuncionalidadesActivas(
      preferenciasCon({ difuminarNombres: true, difuminarFotos: true }),
      disponibles('difuminarNombres', 'ocultarEnLinea'),
    );
    expect([...activas]).toEqual(['difuminarNombres']);
  });
});

describe('GestorModulos', () => {
  it('no activa ningún módulo real durante la fase 1', () => {
    const gestor = new GestorModulos({
      modulos: MODULOS_FUNCIONALIDADES,
      documento: document,
      senal: new AbortController().signal,
    });
    const todas = Object.fromEntries(IDS_FUNCIONALIDADES.map((id) => [id, true]));
    gestor.aplicar(preferenciasCon(todas));
    expect(gestor.activos.size).toBe(0);
  });

  it('activa y desactiva módulos disponibles según las preferencias', () => {
    const modulo = crearModuloEspia('difuminarNombres');
    const gestor = new GestorModulos({
      modulos: [modulo],
      documento: document,
      senal: new AbortController().signal,
      esDisponible: disponibles('difuminarNombres'),
    });

    gestor.aplicar(preferenciasCon({ difuminarNombres: true }));
    gestor.aplicar(preferenciasCon({ difuminarNombres: true }));
    expect(modulo.activar).toHaveBeenCalledTimes(1);
    const contexto = modulo.activar.mock.calls[0]?.[0] as { senal: AbortSignal } | undefined;
    expect(contexto?.senal.aborted).toBe(false);

    gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
    expect(modulo.desactivar).toHaveBeenCalledTimes(1);
    expect(contexto?.senal.aborted).toBe(true);
    expect(gestor.activos.size).toBe(0);
  });

  it('aísla los errores de un módulo', () => {
    const defectuoso = crearModuloEspia('difuminarNombres');
    defectuoso.activar.mockImplementation(() => {
      throw new Error('fallo');
    });
    const sano = crearModuloEspia('difuminarFotos');
    const registrarError = vi.fn();
    const gestor = new GestorModulos({
      modulos: [defectuoso, sano],
      documento: document,
      senal: new AbortController().signal,
      registrarError,
      esDisponible: disponibles('difuminarNombres', 'difuminarFotos'),
    });

    gestor.aplicar(preferenciasCon({ difuminarNombres: true, difuminarFotos: true }));
    expect(registrarError).toHaveBeenCalledOnce();
    expect([...gestor.activos]).toEqual(['difuminarFotos']);
  });

  it('detiene todos los módulos al invalidarse el contexto', () => {
    const modulo = crearModuloEspia('difuminarFotos');
    const controlador = new AbortController();
    const gestor = new GestorModulos({
      modulos: [modulo],
      documento: document,
      senal: controlador.signal,
      esDisponible: disponibles('difuminarFotos'),
    });

    gestor.aplicar(preferenciasCon({ difuminarFotos: true }));
    gestor.detenerTodo();
    controlador.abort();
    gestor.aplicar(preferenciasCon({ difuminarFotos: true }));

    expect(modulo.desactivar).toHaveBeenCalledOnce();
    expect(modulo.activar).toHaveBeenCalledOnce();
  });
});

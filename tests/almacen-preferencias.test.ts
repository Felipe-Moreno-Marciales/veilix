import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  cambiarFuncionalidad,
  cambiarTema,
  leerPreferencias,
  observarPreferencias,
} from '@/almacenamiento/almacen-preferencias';
import { PREFERENCIAS_PREDETERMINADAS } from '@/almacenamiento/preferencias';

describe('almacén de preferencias', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('devuelve los valores predeterminados si no hay nada guardado', async () => {
    await expect(leerPreferencias()).resolves.toEqual(PREFERENCIAS_PREDETERMINADAS);
  });

  it('persiste el tema en storage.local', async () => {
    await cambiarTema('oscuro');
    await expect(leerPreferencias()).resolves.toMatchObject({ tema: 'oscuro' });
    const guardado = await fakeBrowser.storage.local.get('preferencias');
    expect(guardado['preferencias']).toMatchObject({ tema: 'oscuro' });
  });

  it('no utiliza storage.sync', async () => {
    await cambiarTema('claro');
    await expect(fakeBrowser.storage.sync.get(null)).resolves.toEqual({});
  });

  it('rechaza activar funcionalidades pendientes', async () => {
    await expect(cambiarFuncionalidad('difuminarNombres', true)).rejects.toThrow(/pendiente/);
    const preferencias = await leerPreferencias();
    expect(preferencias.funcionalidades.difuminarNombres).toBe(false);
  });

  it('normaliza datos manipulados en el almacenamiento', async () => {
    await fakeBrowser.storage.local.set({
      preferencias: { tema: '<script>', funcionalidades: { ocultarEnLinea: true } },
    });
    await expect(leerPreferencias()).resolves.toEqual(PREFERENCIAS_PREDETERMINADAS);
  });

  it('notifica los cambios a los observadores', async () => {
    const observador = vi.fn();
    const dejarDeObservar = observarPreferencias(observador);
    await cambiarTema('oscuro');
    await vi.waitFor(() => {
      expect(observador).toHaveBeenCalledWith(expect.objectContaining({ tema: 'oscuro' }));
    });
    dejarDeObservar();
  });
});

import { describe, expect, it } from 'vitest';
import configuracion from '../wxt.config';

type Navegador = 'chrome' | 'edge' | 'opera' | 'firefox' | 'safari';

function generarManifiesto(browser: Navegador): Record<string, unknown> {
  const { manifest } = configuracion;
  if (typeof manifest !== 'function') {
    throw new Error('Se esperaba un manifiesto dinámico.');
  }
  return manifest({
    browser,
    manifestVersion: 3,
    mode: 'production',
    command: 'build',
  }) as Record<string, unknown>;
}

describe('manifiesto', () => {
  it.each<Navegador>(['chrome', 'edge', 'opera', 'firefox', 'safari'])('solo solicita el permiso storage en %s', (navegador) => {
    const manifiesto = generarManifiesto(navegador);
    expect(manifiesto['permissions']).toEqual(['storage']);
    expect(manifiesto).not.toHaveProperty('host_permissions');
    expect(manifiesto).not.toHaveProperty('optional_permissions');
  });

  it('declara en Firefox que no se recopilan datos', () => {
    expect(generarManifiesto('firefox')).toMatchObject({
      browser_specific_settings: {
        gecko: { data_collection_permissions: { required: ['none'] } },
      },
    });
  });

  it.each<Navegador>(['chrome', 'edge', 'opera'])(
    'exige Chromium 116 (AbortSignal.any) y no incluye ajustes de otros navegadores en %s',
    (navegador) => {
      const manifiesto = generarManifiesto(navegador);
      expect(manifiesto['minimum_chrome_version']).toBe('116');
      expect(manifiesto).not.toHaveProperty('browser_specific_settings');
    },
  );

  it('exige Safari 17.4 y no incluye ajustes de Firefox ni de Chromium en Safari', () => {
    const manifiesto = generarManifiesto('safari');
    expect(manifiesto['browser_specific_settings']).toEqual({ safari: { strict_min_version: '17.4' } });
    expect(manifiesto).not.toHaveProperty('minimum_chrome_version');
  });

  it('no incluye ajustes de Chromium en Firefox', () => {
    expect(generarManifiesto('firefox')).not.toHaveProperty('minimum_chrome_version');
  });
});

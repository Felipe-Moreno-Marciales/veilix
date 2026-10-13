import { describe, expect, it } from 'vitest';
import configuracion from '../wxt.config';

type Navegador = 'chrome' | 'edge' | 'firefox';

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
  it.each<Navegador>(['chrome', 'edge', 'firefox'])('solo solicita el permiso storage en %s', (navegador) => {
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

  it('no incluye ajustes específicos de Firefox en Chromium', () => {
    expect(generarManifiesto('chrome')).not.toHaveProperty('browser_specific_settings');
    expect(generarManifiesto('edge')).not.toHaveProperty('browser_specific_settings');
  });
});

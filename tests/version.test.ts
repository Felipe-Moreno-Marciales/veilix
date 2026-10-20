import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import configuracion from '../wxt.config';
import {
  VERSION,
  analizarVersion,
  componenteCompilacion,
  nombreVersionManifiesto,
  versionDescriptiva,
  versionManifiesto,
} from '@/version';

const RAIZ = resolve(import.meta.dirname, '..');
const leerJson = (ruta: string) => JSON.parse(readFileSync(join(RAIZ, ruta), 'utf8')) as Record<string, unknown>;
const paquete = leerJson('package.json') as { version: string; scripts: Record<string, string> };
const bloqueo = leerJson('package-lock.json') as {
  version: string;
  packages: Record<string, { version?: string }>;
};

/** Compara versiones de manifiesto como Chrome y Firefox: componente a componente, con 0 si falta. */
function compararManifiesto(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 4; i++) {
    const diferencia = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diferencia !== 0) return diferencia;
  }
  return 0;
}

describe('analizarVersion', () => {
  it.each([
    ['0.1.0', { mayor: 0, menor: 1, parche: 0, canal: null, numero: null }],
    ['0.2.0-beta.2', { mayor: 0, menor: 2, parche: 0, canal: 'beta', numero: 2 }],
    ['1.10.3-rc.0', { mayor: 1, menor: 10, parche: 3, canal: 'rc', numero: 0 }],
    ['2.0.0-alpha.15', { mayor: 2, menor: 0, parche: 0, canal: 'alpha', numero: 15 }],
  ])('acepta %s', (texto, esperado) => {
    expect(analizarVersion(texto)).toEqual(esperado);
  });

  it.each(['1.0', '01.0.0', '1.0.0-beta', '1.0.0-beta.01', '1.0.0-dev.1', '1.0.0+build.5', 'v1.0.0', '1.0.0-beta.1000', '70000.0.0', ''])(
    'rechaza %s',
    (texto) => {
      expect(() => analizarVersion(texto)).toThrow(/no válida/);
    },
  );
});

describe('versión del manifiesto', () => {
  /** Versiones estables, en orden creciente: son las únicas que se publican. */
  const ESTABLES = ['0.1.0', '0.1.1', '0.2.0', '0.10.0', '1.0.0', '1.0.10', '2.0.0'];
  /** Versiones previas de un mismo MAYOR.MENOR.PARCHE, en orden creciente. */
  const PREVIAS = ['0.1.1-alpha.0', '0.1.1-alpha.7', '0.1.1-beta.0', '0.1.1-beta.2', '0.1.1-beta.10', '0.1.1-rc.1', '0.1.1-rc.999'];
  const TODAS = [...ESTABLES, ...PREVIAS, '0.2.0-beta.8'];

  it('una versión estable es exactamente MAYOR.MENOR.PARCHE en todos los navegadores', () => {
    for (const version of ESTABLES) {
      for (const navegador of ['chrome', 'edge', 'opera', 'firefox', 'safari']) {
        expect(versionManifiesto(version, navegador), `${version} en ${navegador}`).toBe(version);
      }
    }
  });

  it('asigna a 0.2.0-beta.2 la versión 0.2.0.2002 en Chromium y Firefox, y 0.2.0 en Safari', () => {
    expect(versionManifiesto('0.2.0-beta.2', 'chrome')).toBe('0.2.0.2002');
    expect(versionManifiesto('0.2.0-beta.2', 'edge')).toBe('0.2.0.2002');
    expect(versionManifiesto('0.2.0-beta.2', 'firefox')).toBe('0.2.0.2002');
    expect(versionManifiesto('0.2.0-beta.2', 'safari')).toBe('0.2.0');
  });

  it.each(['chrome', 'firefox', 'safari'])('las estables crecen estrictamente entre sí en %s', (navegador) => {
    for (let i = 1; i < ESTABLES.length; i++) {
      const anterior = versionManifiesto(ESTABLES[i - 1] ?? '', navegador);
      const actual = versionManifiesto(ESTABLES[i] ?? '', navegador);
      expect(compararManifiesto(actual, anterior), `${anterior} → ${actual}`).toBeGreaterThan(0);
    }
  });

  it.each(['chrome', 'firefox'])('las versiones previas crecen estrictamente entre sí en %s', (navegador) => {
    for (let i = 1; i < PREVIAS.length; i++) {
      const anterior = versionManifiesto(PREVIAS[i - 1] ?? '', navegador);
      const actual = versionManifiesto(PREVIAS[i] ?? '', navegador);
      expect(compararManifiesto(actual, anterior), `${anterior} → ${actual}`).toBeGreaterThan(0);
    }
  });

  it('una versión previa queda por encima de la estable anterior y de la de su mismo número (consecuencia aceptada)', () => {
    // Las versiones previas son internas y nunca se suben a una tienda.
    expect(compararManifiesto(versionManifiesto('0.1.1-beta.0', 'chrome'), versionManifiesto('0.1.0', 'chrome'))).toBeGreaterThan(0);
    expect(compararManifiesto(versionManifiesto('0.1.1-beta.0', 'chrome'), versionManifiesto('0.1.1', 'chrome'))).toBeGreaterThan(0);
  });

  it('cumple los formatos de cada plataforma', () => {
    for (const version of TODAS) {
      const chromium = versionManifiesto(version, 'chrome');
      // Chrome y Firefox: de 1 a 4 enteros sin ceros a la izquierda, ≤ 65535.
      expect(chromium).toMatch(/^(0|[1-9]\d{0,4})(\.(0|[1-9]\d{0,4})){2,3}$/);
      expect(chromium.split('.').every((parte) => Number(parte) <= 65_535)).toBe(true);
      // Safari (CFBundleShortVersionString): como máximo tres enteros.
      expect(versionManifiesto(version, 'safari')).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('solo las versiones previas tienen cuarto componente', () => {
    expect(componenteCompilacion(analizarVersion('0.2.0'))).toBeNull();
    expect(componenteCompilacion(analizarVersion('0.2.0-rc.3'))).toBe(3003);
    expect(componenteCompilacion(analizarVersion('0.2.0-alpha.7'))).toBe(1007);
  });

  it('usa version_name solo en Chromium y solo en versiones previas', () => {
    expect(nombreVersionManifiesto('0.2.0-beta.2', 'chrome')).toBe('0.2.0-beta.2');
    expect(nombreVersionManifiesto('0.2.0-beta.2', 'opera')).toBe('0.2.0-beta.2');
    expect(nombreVersionManifiesto('0.2.0-beta.2', 'firefox')).toBeUndefined();
    expect(nombreVersionManifiesto('0.2.0-beta.2', 'safari')).toBeUndefined();
    expect(nombreVersionManifiesto('0.1.0', 'chrome')).toBeUndefined();
  });

  it('genera la versión descriptiva del panel', () => {
    expect(versionDescriptiva('0.2.0-beta.2')).toBe('0.2.0-beta.2 (beta)');
    expect(versionDescriptiva('0.2.0-rc.1')).toBe('0.2.0-rc.1 (candidata)');
    expect(versionDescriptiva('1.0.0')).toBe('1.0.0');
    expect(versionDescriptiva('0.1.0')).toBe('0.1.0');
  });
});

describe('coherencia del versionado', () => {
  it('la versión actual procede de package.json y es válida', () => {
    expect(VERSION).toBe(paquete.version);
    expect(() => analizarVersion(VERSION)).not.toThrow();
  });

  it('package.json y package-lock.json están sincronizados', () => {
    expect(bloqueo.version).toBe(paquete.version);
    expect(bloqueo.packages['']?.version).toBe(paquete.version);
  });

  it('el manifiesto generado usa la versión de package.json en cada navegador', () => {
    const { manifest } = configuracion;
    if (typeof manifest !== 'function') throw new Error('Se esperaba un manifiesto dinámico.');
    for (const browser of ['chrome', 'edge', 'opera', 'firefox', 'safari']) {
      const resultado = manifest({ browser, manifestVersion: 3, mode: 'production', command: 'build' }) as Record<
        string,
        unknown
      >;
      expect(resultado['version']).toBe(versionManifiesto(VERSION, browser));
      expect(resultado['version_name']).toBe(nombreVersionManifiesto(VERSION, browser));
    }
  });

  it('si la versión actual es estable, todos los manifiestos usan exactamente ese número y sin version_name', () => {
    const { manifest } = configuracion;
    if (typeof manifest !== 'function') throw new Error('Se esperaba un manifiesto dinámico.');
    if (analizarVersion(VERSION).canal !== null) return;
    for (const browser of ['chrome', 'edge', 'opera', 'firefox', 'safari']) {
      const resultado = manifest({ browser, manifestVersion: 3, mode: 'production', command: 'build' }) as Record<string, unknown>;
      expect(resultado['version'], browser).toBe(VERSION);
      expect(resultado).not.toHaveProperty('version_name');
    }
  });

  it('los ZIP incluyen la versión completa y el navegador', () => {
    expect(configuracion.zip?.artifactTemplate).toContain('{{packageVersion}}');
    expect(configuracion.zip?.artifactTemplate).toContain('{{browser}}');
    expect(configuracion.zip?.sourcesTemplate).toContain('{{packageVersion}}');
  });

  it('compilar o empaquetar nunca cambia la versión', () => {
    const ganchos = Object.entries(paquete.scripts).filter(([nombre]) =>
      /^(pre|post)?(build|zip|dev|test|compile|lint|check)(:|$)/.test(nombre),
    );
    expect(ganchos.length).toBeGreaterThan(0);
    for (const [nombre, comando] of ganchos) {
      expect(comando, nombre).not.toMatch(/npm version|version:/);
    }
  });

  it('los scripts de versión no crean commits ni etiquetas de Git', () => {
    const scriptsVersion = Object.entries(paquete.scripts).filter(([nombre]) => nombre.startsWith('version:') && nombre !== 'version:comprobar');
    expect(scriptsVersion.length).toBeGreaterThanOrEqual(3);
    for (const [, comando] of scriptsVersion) expect(comando).toContain('--no-git-tag-version');
  });
});

describe('version-renumeraciones.json', () => {
  const registro = leerJson('version-renumeraciones.json') as {
    renumeraciones: { version: string; sustituye: string; commitsBase: string[]; motivo: string; aprobadaPor: string; fecha: string }[];
  };

  it('contiene solo la renumeración aprobada de 0.1.0, limitada a los commits históricos', () => {
    // Añadir otra renumeración exige aprobación expresa del propietario y actualizar esta prueba.
    expect(registro.renumeraciones).toHaveLength(1);
    const [entrada] = registro.renumeraciones;
    expect(entrada?.version).toBe('0.1.0');
    expect(entrada?.sustituye).toBe('0.2.0-beta.8');
    expect(entrada?.commitsBase.sort()).toEqual([
      '9ba34bf904239d3f1e2ab2fe97e3e7aa40f69a93',
      'a283fda5e4fea9b22e6f78dce014bbc9c478ece2',
    ]);
    expect(entrada?.motivo.length).toBeGreaterThan(40);
    expect(entrada?.aprobadaPor).toMatch(/propietario/);
  });
});

describe('CHANGELOG.md', () => {
  const historial = readFileSync(join(RAIZ, 'CHANGELOG.md'), 'utf8');
  const versiones = [...historial.matchAll(/^## \[([^\]]+)\]/gm)]
    .map((coincidencia) => coincidencia[1] ?? '')
    .filter((version) => version !== 'Sin publicar');

  it('registra la versión actual como la más reciente', () => {
    expect(versiones[0]).toBe(VERSION);
  });

  it('contiene versiones válidas, únicas y en orden descendente', () => {
    expect(new Set(versiones).size).toBe(versiones.length);
    for (let i = 1; i < versiones.length; i++) {
      const reciente = versionManifiesto(versiones[i - 1] ?? '', 'chrome');
      const anterior = versionManifiesto(versiones[i] ?? '', 'chrome');
      expect(compararManifiesto(reciente, anterior)).toBeGreaterThan(0);
    }
  });

  it('conserva íntegro el historial de desarrollo anterior a 0.1.0', () => {
    const indice = historial.indexOf('## Historial de desarrollo anterior a 0.1.0');
    expect(indice).toBeGreaterThan(historial.indexOf('## [0.1.0]'));
    const previo = historial.slice(indice);
    const betas = [...previo.matchAll(/^### \[(0\.2\.0-beta\.\d+)\]/gm)].map((c) => c[1] ?? '');
    expect(betas).toEqual([8, 7, 6, 5, 4, 3, 2, 1].map((n) => `0.2.0-beta.${n}`));
    expect(previo).toMatch(/^### Fase 1 — hito interno de desarrollo \(número `0\.1\.0`\) — 2026-10-12$/m);
    expect(previo).toContain('Registro original de la Fase 1');
  });

  it('registra que las compilaciones anteriores usaban la versión 0.1.0', () => {
    expect(versiones).toContain('0.1.0');
    expect(historial).toMatch(/retroactivamente/);
    expect(historial).toMatch(/se generaron con la versión `0\.1\.0`/);
  });
});

describe('comprobar-cambio-version.mjs', () => {
  const SCRIPT = join(RAIZ, 'scripts/comprobar-cambio-version.mjs');

  function repositorioTemporal(): string {
    const dir = mkdtempSync(join(tmpdir(), 'veilix-version-'));
    const git = (...args: string[]) =>
      execFileSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@example.invalid', ...args], {
        cwd: dir,
        stdio: 'ignore',
      });
    git('init', '-q');
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ version: '0.2.0-beta.1' }));
    writeFileSync(join(dir, 'src/a.ts'), 'export const a = 1;\n');
    writeFileSync(join(dir, 'README.md'), 'x\n');
    git('add', '.');
    git('commit', '-q', '-m', 'base');
    return dir;
  }

  const ejecutar = (dir: string) => spawnSync('node', [SCRIPT, 'HEAD'], { cwd: dir, encoding: 'utf8' });

  it('acepta recompilar sin cambios y cambios solo de documentación', () => {
    const dir = repositorioTemporal();
    expect(ejecutar(dir).status).toBe(0);
    writeFileSync(join(dir, 'README.md'), 'y\n');
    expect(ejecutar(dir).status).toBe(0);
    rmSync(dir, { recursive: true, force: true });
  });

  it('rechaza cambios de código sin versión nueva, también en archivos nuevos', () => {
    const dir = repositorioTemporal();
    writeFileSync(join(dir, 'src/a.ts'), 'export const a = 2;\n');
    expect(ejecutar(dir).status).toBe(1);
    execFileSync('git', ['checkout', '-q', '--', 'src/a.ts'], { cwd: dir });
    writeFileSync(join(dir, 'src/nuevo.ts'), 'export {};\n');
    const resultado = ejecutar(dir);
    expect(resultado.status).toBe(1);
    expect(resultado.stderr).toContain('src/nuevo.ts');
    rmSync(dir, { recursive: true, force: true });
  });

  function commitActual(dir: string): string {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
  }

  function registrar(dir: string, entrada: Record<string, unknown>): void {
    writeFileSync(join(dir, 'version-renumeraciones.json'), JSON.stringify({ renumeraciones: [entrada] }));
  }

  it('acepta una renumeración aprobada solo frente a sus commits base', () => {
    const dir = repositorioTemporal();
    registrar(dir, {
      version: '0.2.0-beta.1',
      sustituye: '0.3.0-beta.9',
      commitsBase: [commitActual(dir)],
      motivo: 'Prueba de renumeración aprobada',
      aprobadaPor: 'propietario',
    });
    writeFileSync(join(dir, 'src/a.ts'), 'export const a = 2;\n');
    const resultado = ejecutar(dir);
    expect(resultado.status).toBe(0);
    expect(resultado.stdout).toContain('Renumeración aprobada');
    rmSync(dir, { recursive: true, force: true });
  });

  it('la renumeración deja de aplicarse en cuanto cambia el commit base', () => {
    const dir = repositorioTemporal();
    registrar(dir, {
      version: '0.2.0-beta.1',
      commitsBase: [commitActual(dir)],
      motivo: 'Prueba',
      aprobadaPor: 'propietario',
    });
    execFileSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@example.invalid', 'add', '.'], { cwd: dir });
    execFileSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@example.invalid', 'commit', '-q', '-m', 'renumeración confirmada'], { cwd: dir });
    writeFileSync(join(dir, 'src/a.ts'), 'export const a = 3;\n');
    expect(ejecutar(dir).status).toBe(1);
    rmSync(dir, { recursive: true, force: true });
  });

  it('no se aplica a otra versión ni con un registro inválido', () => {
    const dir = repositorioTemporal();
    writeFileSync(join(dir, 'src/a.ts'), 'export const a = 2;\n');
    registrar(dir, { version: '9.9.9', commitsBase: [commitActual(dir)], motivo: 'Prueba', aprobadaPor: 'propietario' });
    expect(ejecutar(dir).status).toBe(1);
    registrar(dir, { version: '0.2.0-beta.1', commitsBase: [commitActual(dir)], motivo: '', aprobadaPor: 'propietario' });
    expect(ejecutar(dir).status).toBe(1);
    writeFileSync(join(dir, 'version-renumeraciones.json'), '{no es json');
    expect(ejecutar(dir).status).toBe(1);
    rmSync(dir, { recursive: true, force: true });
  });

  it('acepta cambios de código con versión nueva', () => {
    const dir = repositorioTemporal();
    writeFileSync(join(dir, 'src/a.ts'), 'export const a = 2;\n');
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ version: '0.2.0-beta.2' }));
    expect(ejecutar(dir).status).toBe(0);
    rmSync(dir, { recursive: true, force: true });
  });
});

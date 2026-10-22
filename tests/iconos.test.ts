import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const RAIZ = resolve(import.meta.dirname, '..');
const ICONOS = join(RAIZ, 'public/icon');
const TAMANOS = [16, 32, 48, 96, 128];
const ACENTO = [0, 168, 132];
const BLANCO = [255, 255, 255];

interface Imagen {
  readonly ancho: number;
  readonly alto: number;
  readonly pixeles: Buffer;
}

/** Decodifica los PNG RGBA de 8 bits sin filtros que produce `generar-iconos.mjs`. */
function decodificarPng(datos: Buffer): Imagen {
  let posicion = 8;
  let ancho = 0;
  let alto = 0;
  const comprimidos: Buffer[] = [];
  while (posicion < datos.length) {
    const longitud = datos.readUInt32BE(posicion);
    const tipo = datos.toString('ascii', posicion + 4, posicion + 8);
    const cuerpo = datos.subarray(posicion + 8, posicion + 8 + longitud);
    if (tipo === 'IHDR') {
      ancho = cuerpo.readUInt32BE(0);
      alto = cuerpo.readUInt32BE(4);
    } else if (tipo === 'IDAT') {
      comprimidos.push(cuerpo);
    }
    posicion += 12 + longitud;
  }
  const filas = inflateSync(Buffer.concat(comprimidos));
  const pixeles = Buffer.alloc(ancho * alto * 4);
  for (let y = 0; y < alto; y++) {
    const inicio = y * (1 + ancho * 4);
    expect(filas[inicio]).toBe(0);
    filas.copy(pixeles, y * ancho * 4, inicio + 1, inicio + 1 + ancho * 4);
  }
  return { ancho, alto, pixeles };
}

/** Color RGBA del píxel que contiene el punto (x, y) de la cuadrícula de 32 del logotipo. */
function colorEn(imagen: Imagen, x: number, y: number): number[] {
  const px = Math.floor((x / 32) * imagen.ancho);
  const py = Math.floor((y / 32) * imagen.alto);
  const indice = (py * imagen.ancho + px) * 4;
  return [...imagen.pixeles.subarray(indice, indice + 4)];
}

/** Opaco y con cada canal a menos de 24 del esperado (margen para el suavizado de bordes a 16 px). */
function seParece(color: readonly number[], esperado: readonly number[]): boolean {
  return color[3] === 255 && esperado.every((canal, i) => Math.abs((color[i] ?? 0) - canal) < 24);
}

const leerIcono = (tamano: number) => decodificarPng(readFileSync(join(ICONOS, `${tamano}.png`)));

describe('iconos de la extensión', () => {
  let temporal = '';

  beforeAll(() => {
    temporal = mkdtempSync(join(tmpdir(), 'veilix-iconos-'));
  });

  afterAll(() => {
    rmSync(temporal, { recursive: true, force: true });
  });

  it('public/icon contiene exactamente los tamaños generados', () => {
    expect(readdirSync(ICONOS).sort()).toEqual(TAMANOS.map((t) => `${t}.png`).sort());
  });

  it('los iconos de public/icon coinciden con lo que genera el script oficial', () => {
    const resultado = spawnSync('node', [join(RAIZ, 'scripts/generar-iconos.mjs'), temporal], { encoding: 'utf8' });
    expect(resultado.status).toBe(0);
    for (const tamano of TAMANOS) {
      expect(readFileSync(join(temporal, `${tamano}.png`)).equals(readFileSync(join(ICONOS, `${tamano}.png`)))).toBe(true);
    }
  });

  it.each(TAMANOS)('el icono de %i px es un candado blanco sobre el verde de Veilix', (tamano) => {
    const imagen = leerIcono(tamano);
    expect([imagen.ancho, imagen.alto]).toEqual([tamano, tamano]);
    const comprobar = (x: number, y: number, esperado: readonly number[]) => {
      expect(seParece(colorEn(imagen, x, y), esperado), `(${x}, ${y}) a ${tamano} px: ${colorEn(imagen, x, y).join(', ')}`).toBe(true);
    };
    // Esquina transparente del cuadrado redondeado y fondo verde.
    expect(colorEn(imagen, 0.2, 0.2)[3]).toBe(0);
    comprobar(3, 16, ACENTO);
    // Arco: parte superior y patas, blancas; hueco interior, verde.
    comprobar(16, 7, BLANCO);
    comprobar(10.5, 12.5, BLANCO);
    comprobar(21.5, 12.5, BLANCO);
    comprobar(16, 12.5, ACENTO);
    // Cuerpo blanco con la bocallave en verde.
    comprobar(11, 23, BLANCO);
    comprobar(21, 17, BLANCO);
    comprobar(16, 19, ACENTO);
    // Debajo del cuerpo vuelve el fondo.
    comprobar(16, 28, ACENTO);
  });

  it('el logotipo del panel usa la misma geometría que el generador', () => {
    const logotipo = readFileSync(join(RAIZ, 'src/ui/componentes/Logotipo.tsx'), 'utf8');
    const generador = readFileSync(join(RAIZ, 'scripts/generar-iconos.mjs'), 'utf8');
    expect(logotipo).toContain('<rect x="8" y="14" width="16" height="12" rx="3" fill="#fff" />');
    expect(generador).toContain('const CUERPO = { x: 8, y: 14, ancho: 16, alto: 12, radio: 3 };');
    expect(logotipo).toContain('<path d="M12 15V12a4 4 0 0 1 8 0V15" fill="none" stroke="#fff" strokeWidth="4" />');
    expect(generador).toContain('const ARCO = { cx: 16, cy: 12, radio: 4, grosor: 4, finY: 15 };');
    expect(logotipo).toContain('<circle cx="16" cy="19" r="2" fill="currentColor" />');
    expect(generador).toContain('const BOCALLAVE = { cx: 16, cy: 19, radio: 2 };');
    expect(logotipo).toContain('<rect x="15" y="19" width="2" height="4" rx="1" fill="currentColor" />');
    expect(generador).toContain('const TALLO = { x: 15, y: 19, ancho: 2, alto: 4, radio: 1 };');
  });
});

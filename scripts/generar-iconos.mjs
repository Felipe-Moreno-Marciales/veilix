/**
 * Genera los iconos PNG de la extensión sin dependencias externas.
 *
 * Uso: node scripts/generar-iconos.mjs
 * Salida: public/icon/{16,32,48,96,128}.png
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const TAMANOS = [16, 32, 48, 96, 128];
// Verde de interfaz de WhatsApp Web (#00A884), el mismo acento que el panel.
const ACENTO = [0, 168, 132];
const BLANCO = [255, 255, 255];
const SUBMUESTRAS = 4;
const DESTINO = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icon');

const TABLA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(datos) {
  let c = 0xffffffff;
  for (const byte of datos) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function bloque(tipo, datos) {
  const longitud = Buffer.alloc(4);
  longitud.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([longitud, cuerpo, crc]);
}

/** Color del icono en coordenadas normalizadas [0, 1] o `null` si es transparente. */
function muestrear(x, y) {
  const radio = 0.25;
  const cx = Math.min(Math.max(x, radio), 1 - radio);
  const cy = Math.min(Math.max(y, radio), 1 - radio);
  if ((x - cx) ** 2 + (y - cy) ** 2 > radio ** 2) return null;

  // Ojo: intersección de dos círculos (forma de lente) con pupila central.
  const dx = x - 0.5;
  const dy = y - 0.5;
  const rLente = 0.46;
  const desplazamiento = 0.28;
  const enLente =
    dx ** 2 + (dy - desplazamiento) ** 2 < rLente ** 2 &&
    dx ** 2 + (dy + desplazamiento) ** 2 < rLente ** 2;
  if (enLente && dx ** 2 + dy ** 2 > 0.13 ** 2) return BLANCO;
  return ACENTO;
}

function generarPng(tamano) {
  const filas = [];
  for (let y = 0; y < tamano; y++) {
    const fila = Buffer.alloc(1 + tamano * 4);
    for (let x = 0; x < tamano; x++) {
      const suma = [0, 0, 0, 0];
      for (let sy = 0; sy < SUBMUESTRAS; sy++) {
        for (let sx = 0; sx < SUBMUESTRAS; sx++) {
          const color = muestrear(
            (x + (sx + 0.5) / SUBMUESTRAS) / tamano,
            (y + (sy + 0.5) / SUBMUESTRAS) / tamano,
          );
          if (color) {
            suma[0] += color[0];
            suma[1] += color[1];
            suma[2] += color[2];
            suma[3] += 1;
          }
        }
      }
      const desplazamiento = 1 + x * 4;
      if (suma[3] > 0) {
        fila[desplazamiento] = Math.round(suma[0] / suma[3]);
        fila[desplazamiento + 1] = Math.round(suma[1] / suma[3]);
        fila[desplazamiento + 2] = Math.round(suma[2] / suma[3]);
      }
      fila[desplazamiento + 3] = Math.round((suma[3] / SUBMUESTRAS ** 2) * 255);
    }
    filas.push(fila);
  }

  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(tamano, 0);
  cabecera.writeUInt32BE(tamano, 4);
  cabecera.set([8, 6, 0, 0, 0], 8);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', cabecera),
    bloque('IDAT', deflateSync(Buffer.concat(filas))),
    bloque('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(DESTINO, { recursive: true });
for (const tamano of TAMANOS) {
  writeFileSync(join(DESTINO, `${tamano}.png`), generarPng(tamano));
}
console.log(`Iconos generados en ${DESTINO}`);

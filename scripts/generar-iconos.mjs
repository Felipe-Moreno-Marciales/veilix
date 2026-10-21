/**
 * Genera los iconos PNG de la extensión sin dependencias externas.
 *
 * El dibujo es el logotipo de Veilix: un candado cerrado blanco sobre un
 * cuadrado redondeado verde. Es la fuente original de los iconos, y su
 * geometría coincide con la de `src/ui/componentes/Logotipo.tsx`.
 *
 * Uso: node scripts/generar-iconos.mjs [carpeta]
 * Salida: public/icon/{16,32,48,96,128}.png, o la carpeta indicada.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

export const TAMANOS = [16, 32, 48, 96, 128];
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

/**
 * Geometría en una cuadrícula de 32 × 32, la misma que el `viewBox` de `Logotipo.tsx`.
 * Los bordes rectos caen en múltiplos de 2 para que coincidan con píxeles enteros
 * a 16 × 16 y el candado se vea nítido en la barra de herramientas.
 */
const FONDO = { x: 0, y: 0, ancho: 32, alto: 32, radio: 8 };
const CUERPO = { x: 8, y: 14, ancho: 16, alto: 12, radio: 3 };
/** Arco: semicírculo de centro (cx, cy) y patas verticales hasta `finY`, dentro del cuerpo. */
const ARCO = { cx: 16, cy: 12, radio: 4, grosor: 4, finY: 15 };
const BOCALLAVE = { cx: 16, cy: 19, radio: 2 };
const TALLO = { x: 15, y: 19, ancho: 2, alto: 4, radio: 1 };

function enRectanguloRedondeado(x, y, { x: izquierda, y: arriba, ancho, alto, radio }) {
  const cx = Math.min(Math.max(x, izquierda + radio), izquierda + ancho - radio);
  const cy = Math.min(Math.max(y, arriba + radio), arriba + alto - radio);
  return (x - cx) ** 2 + (y - cy) ** 2 <= radio ** 2;
}

function enArco(x, y) {
  const mitad = ARCO.grosor / 2;
  if (y <= ARCO.cy) return Math.abs(Math.hypot(x - ARCO.cx, y - ARCO.cy) - ARCO.radio) <= mitad;
  if (y > ARCO.finY) return false;
  return Math.abs(Math.abs(x - ARCO.cx) - ARCO.radio) <= mitad;
}

/** Color del icono en coordenadas normalizadas [0, 1] o `null` si es transparente. */
export function muestrear(xNormalizada, yNormalizada) {
  const x = xNormalizada * 32;
  const y = yNormalizada * 32;
  if (!enRectanguloRedondeado(x, y, FONDO)) return null;
  const enBocallave =
    (x - BOCALLAVE.cx) ** 2 + (y - BOCALLAVE.cy) ** 2 <= BOCALLAVE.radio ** 2 || enRectanguloRedondeado(x, y, TALLO);
  if (enRectanguloRedondeado(x, y, CUERPO)) return enBocallave ? ACENTO : BLANCO;
  return enArco(x, y) ? BLANCO : ACENTO;
}

export function generarPng(tamano) {
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

export function generarIconos(destino = DESTINO) {
  mkdirSync(destino, { recursive: true });
  for (const tamano of TAMANOS) {
    writeFileSync(join(destino, `${tamano}.png`), generarPng(tamano));
  }
  return destino;
}

// Solo escribe los archivos al ejecutarse directamente, no al importarse desde las pruebas.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const destino = generarIconos(process.argv[2] ? resolve(process.argv[2]) : DESTINO);
  console.log(`Iconos generados en ${destino}`);
}

/**
 * Comprueba que una entrega con cambios en el código tiene una versión nueva.
 *
 * Uso: node scripts/comprobar-cambio-version.mjs [referencia-base]
 *      (por defecto, HEAD: la última versión confirmada)
 *
 * Compara el árbol de trabajo actual (incluidos los cambios sin confirmar y
 * los archivos nuevos) con la referencia base:
 * - Si cambió el código de la extensión y la versión es la misma → error.
 * - Si solo cambiaron documentación o pruebas, la versión puede mantenerse.
 * - Recompilar sin cambios nunca exige una versión nueva.
 *
 * Excepción controlada: `version-renumeraciones.json` registra las
 * renumeraciones aprobadas por el propietario. Una entrada solo exime de la
 * regla si la versión actual coincide con la suya y si la referencia base
 * apunta exactamente a uno de sus `commitsBase`. Con cualquier otro commit
 * base (por ejemplo, después de confirmar el trabajo), la regla se aplica.
 *
 * Solo usa comandos de Git de lectura (`diff`, `ls-files`, `show`).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Rutas cuyo cambio altera la extensión distribuida. */
const RUTAS_CODIGO = ['src/', 'public/', 'wxt.config.ts'];

const ARCHIVO_RENUMERACIONES = 'version-renumeraciones.json';

const base = process.argv[2] ?? 'HEAD';
const directorio = process.cwd();

function git(...argumentos) {
  return execFileSync('git', argumentos, { cwd: directorio, encoding: 'utf8' }).trim();
}

function lineas(texto) {
  return texto.split('\n').filter(Boolean);
}

const archivosCambiados = [
  ...lineas(git('diff', '--name-only', base, '--', ...RUTAS_CODIGO)),
  ...lineas(git('ls-files', '--others', '--exclude-standard', '--', ...RUTAS_CODIGO)),
];

const versionActual = JSON.parse(readFileSync(join(directorio, 'package.json'), 'utf8')).version;
const versionBase = JSON.parse(git('show', `${base}:package.json`)).version;

/** Renumeración aprobada aplicable a esta comparación, o `null`. Falla si el registro es inválido. */
function renumeracionAplicable(version, commitBase) {
  const ruta = join(directorio, ARCHIVO_RENUMERACIONES);
  if (!existsSync(ruta)) return null;
  let registro;
  try {
    registro = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch {
    throw new Error(`${ARCHIVO_RENUMERACIONES} no es JSON válido.`);
  }
  if (!Array.isArray(registro?.renumeraciones)) {
    throw new Error(`${ARCHIVO_RENUMERACIONES} debe contener una lista «renumeraciones».`);
  }
  for (const entrada of registro.renumeraciones) {
    const valida =
      typeof entrada?.version === 'string' &&
      Array.isArray(entrada.commitsBase) &&
      entrada.commitsBase.every((c) => typeof c === 'string' && /^[0-9a-f]{40}$/.test(c)) &&
      typeof entrada.motivo === 'string' &&
      entrada.motivo.trim() !== '' &&
      typeof entrada.aprobadaPor === 'string' &&
      entrada.aprobadaPor.trim() !== '';
    if (!valida) {
      throw new Error(
        `${ARCHIVO_RENUMERACIONES}: cada renumeración necesita «version», «commitsBase» (hashes completos), «motivo» y «aprobadaPor».`,
      );
    }
  }
  return (
    registro.renumeraciones.find((entrada) => entrada.version === version && entrada.commitsBase.includes(commitBase)) ??
    null
  );
}

if (archivosCambiados.length === 0) {
  console.log(`✔ Sin cambios de código respecto a ${base}. Versión ${versionActual}.`);
} else if (versionActual === versionBase) {
  let renumeracion;
  try {
    renumeracion = renumeracionAplicable(versionActual, git('rev-parse', '--verify', `${base}^{commit}`));
  } catch (error) {
    console.error(`✘ ${error.message}`);
    process.exit(1);
  }
  if (renumeracion) {
    console.log(
      `✔ Renumeración aprobada (${ARCHIVO_RENUMERACIONES}): ${versionActual} sustituye a ${renumeracion.sustituye ?? '—'} ` +
        `respecto al commit base ${base}.\n  Motivo: ${renumeracion.motivo}\n  Aprobada por: ${renumeracion.aprobadaPor}`,
    );
    process.exit(0);
  }
  console.error(
    `✘ Hay ${archivosCambiados.length} archivo(s) de código modificados respecto a ${base}, ` +
      `pero la versión sigue siendo ${versionActual}.\n` +
      '  Asigna una versión nueva (por ejemplo, `npm run version:beta`) y regístrala en CHANGELOG.md.\n' +
      archivosCambiados.map((archivo) => `  - ${archivo}`).join('\n'),
  );
  process.exit(1);
} else {
  console.log(`✔ Cambios de código con versión nueva: ${versionBase} → ${versionActual}.`);
}

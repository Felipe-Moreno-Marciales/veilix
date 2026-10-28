/**
 * Generación de las hojas de estilo del motor de difuminado.
 *
 * Todo el difuminado es visual (`filter: blur`): el DOM y el texto de
 * WhatsApp no se alteran, los eventos de puntero siguen llegando a sus
 * elementos y la selección, la copia y la escritura funcionan con normalidad.
 */

/** Intensidad del difuminado. */
export const DESENFOQUE = '6px';

export interface ReglaDifuminado {
  /**
   * Zona que delimita el revelado temporal: al pasar el cursor sobre ella
   * (o enfocarla con el teclado, si `revelarConFoco`) se revela su contenido.
   */
  readonly contenedor: string;
  /** Elementos a difuminar dentro del contenedor; `null` difumina el propio contenedor. */
  readonly objetivo: string | null;
  /**
   * Revela el contenido cuando el contenedor o un descendiente tiene foco
   * visible de teclado. Debe ser `false` en editores, donde el foco es
   * permanente mientras se escribe.
   */
  readonly revelarConFoco: boolean;
}

/** Atributo de `<html>` que activa el revelado mediante el atajo de teclado. */
export function atributoRevelado(sufijo: string): string {
  return `data-veilix-revelar-${sufijo}`;
}

function componer(contenedor: string, objetivo: string | null): string {
  return objetivo === null ? contenedor : `${contenedor} :is(${objetivo})`;
}

/**
 * Genera el CSS de un módulo.
 *
 * El estado revelado tiene mayor especificidad que el difuminado, por lo que
 * prevalece sin depender del orden. La transición solo se aplica al revelar:
 * al volver a difuminar (o al activar el módulo) el cambio es inmediato y el
 * contenido nunca queda visible durante una animación.
 */
export function generarHojaEstilos(reglas: readonly ReglaDifuminado[], sufijo: string): string {
  const revelarTeclado = `:root[${atributoRevelado(sufijo)}]`;
  const difuminados: string[] = [];
  const revelados: string[] = [];

  for (const { contenedor, objetivo, revelarConFoco } of reglas) {
    const base = `:is(${contenedor})`;
    const estados = revelarConFoco ? ':hover, :focus-visible, :has(:focus-visible)' : ':hover';
    difuminados.push(componer(base, objetivo));
    revelados.push(componer(`${base}:is(${estados})`, objetivo));
    revelados.push(`${revelarTeclado} ${componer(base, objetivo)}`);
  }

  return [
    `${difuminados.join(',\n')} {\n  filter: blur(${DESENFOQUE}) !important;\n}`,
    `${revelados.join(',\n')} {\n  filter: none !important;\n  transition: filter 150ms ease-out;\n}`,
    `@media (prefers-reduced-motion: reduce) {\n  ${revelados.join(',\n  ')} {\n    transition: none;\n  }\n}`,
  ].join('\n\n');
}

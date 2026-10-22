/**
 * Bandera de Colombia en SVG, en proporción 3:2: franja amarilla en la mitad
 * superior y franjas azul y roja de un cuarto de la altura cada una. Sustituye
 * al emoji 🇨🇴, que Windows muestra como las letras «CO» porque sus fuentes no
 * incluyen banderas. Las franjas usan unidades enteras del `viewBox` y
 * `crispEdges` para que los bordes se vean nítidos a tamaño de texto.
 */
export function BanderaColombia() {
  return (
    <svg
      className="bandera"
      viewBox="0 0 6 4"
      width="12"
      height="8"
      role="img"
      aria-label="Bandera de Colombia"
      focusable="false"
      shapeRendering="crispEdges"
    >
      <rect width="6" height="2" fill="#FCD116" />
      <rect y="2" width="6" height="1" fill="#003893" />
      <rect y="3" width="6" height="1" fill="#CE1126" />
    </svg>
  );
}

/**
 * Logotipo de Veilix: candado cerrado blanco sobre un cuadrado redondeado del
 * color de acento. La geometría coincide con la de `scripts/generar-iconos.mjs`,
 * que genera los iconos de la extensión.
 */
export function Logotipo() {
  return (
    <svg className="logotipo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M12 15V12a4 4 0 0 1 8 0V15" fill="none" stroke="#fff" strokeWidth="4" />
      <rect x="8" y="14" width="16" height="12" rx="3" fill="#fff" />
      <circle cx="16" cy="19" r="2" fill="currentColor" />
      <rect x="15" y="19" width="2" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

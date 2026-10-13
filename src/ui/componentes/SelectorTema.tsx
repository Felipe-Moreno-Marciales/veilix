import type { Tema } from '@/almacenamiento/preferencias';

const OPCIONES: readonly { readonly valor: Tema; readonly etiqueta: string }[] = [
  { valor: 'sistema', etiqueta: 'Sistema' },
  { valor: 'claro', etiqueta: 'Claro' },
  { valor: 'oscuro', etiqueta: 'Oscuro' },
];

interface Propiedades {
  readonly tema: Tema;
  readonly alCambiar: (tema: Tema) => void;
}

export function SelectorTema({ tema, alCambiar }: Propiedades) {
  return (
    <div className="selector-tema" role="radiogroup" aria-label="Tema del panel">
      {OPCIONES.map(({ valor, etiqueta }) => (
        <button
          key={valor}
          type="button"
          role="radio"
          aria-checked={tema === valor}
          className="selector-tema__opcion"
          onClick={() => {
            alCambiar(valor);
          }}
        >
          {etiqueta}
        </button>
      ))}
    </div>
  );
}

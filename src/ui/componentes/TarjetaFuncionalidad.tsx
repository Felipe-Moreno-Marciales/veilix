import type { DefinicionFuncionalidad } from '@/funcionalidades/catalogo';

interface Propiedades {
  readonly definicion: DefinicionFuncionalidad;
  readonly activa: boolean;
  readonly alCambiar: (activa: boolean) => void;
}

/**
 * Muestra una funcionalidad. Si está pendiente solo se informa de ello:
 * no se muestra ningún interruptor para no sugerir una protección inexistente.
 */
export function TarjetaFuncionalidad({ definicion, activa, alCambiar }: Propiedades) {
  const idTitulo = `funcionalidad-${definicion.id}`;
  const pendiente = definicion.estado === 'pendiente';

  return (
    <li className="tarjeta" data-estado={definicion.estado} aria-labelledby={idTitulo}>
      <div className="tarjeta__texto">
        <h3 id={idTitulo} className="tarjeta__titulo">
          {definicion.titulo}
        </h3>
        <p className="tarjeta__descripcion">{definicion.descripcion}</p>
        {definicion.nota ? <p className="tarjeta__nota">{definicion.nota}</p> : null}
      </div>
      {pendiente ? (
        <span className="insignia">Pendiente</span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={activa}
          aria-labelledby={idTitulo}
          className="interruptor"
          onClick={() => {
            alCambiar(!activa);
          }}
        >
          <span className="interruptor__guia" aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

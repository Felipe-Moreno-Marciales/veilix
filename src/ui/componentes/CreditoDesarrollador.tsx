import { BanderaColombia } from './BanderaColombia';

/** Crédito del desarrollador, fijo en el pie del panel. La bandera es un SVG local, no el emoji. */
export function CreditoDesarrollador() {
  return (
    <p className="panel__credito">
      Hecho con ❤️ por Felipe Moreno Marciales
      <BanderaColombia />
    </p>
  );
}

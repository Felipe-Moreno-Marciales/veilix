/**
 * Revelado temporal mediante teclado.
 *
 * Mientras se mantiene pulsado Ctrl + Mayús + Espacio se añade un atributo a
 * `<html>` que desactiva el difuminado del módulo. Al soltar cualquiera de
 * las teclas, o si la ventana pierde el foco, el difuminado se restaura.
 */

/** Descripción legible del atajo, para la interfaz y la documentación. */
export const ATAJO_REVELADO = 'Ctrl + Mayús + Espacio';

export function esAtajoRevelado(evento: KeyboardEvent): boolean {
  return (
    evento.code === 'Space' && evento.ctrlKey && evento.shiftKey && !evento.altKey && !evento.metaKey
  );
}

const TECLAS_DEL_ATAJO = new Set(['Space', 'ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight']);

export function escucharAtajoRevelado(documento: Document, atributo: string, senal: AbortSignal): void {
  const raiz = documento.documentElement;
  const ventana = documento.defaultView;
  const opciones = { capture: true, signal: senal } as const;

  const ocultar = () => {
    raiz.removeAttribute(atributo);
  };

  documento.addEventListener(
    'keydown',
    (evento) => {
      if (esAtajoRevelado(evento)) {
        // Evita que el espacio llegue al editor de WhatsApp.
        evento.preventDefault();
        raiz.setAttribute(atributo, '');
      }
    },
    opciones,
  );
  documento.addEventListener(
    'keyup',
    (evento) => {
      if (TECLAS_DEL_ATAJO.has(evento.code)) {
        ocultar();
      }
    },
    opciones,
  );
  ventana?.addEventListener('blur', ocultar, opciones);
  documento.addEventListener('visibilitychange', ocultar, opciones);
  senal.addEventListener('abort', ocultar, { once: true });
}

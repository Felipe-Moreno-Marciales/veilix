// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { contarObservadores, suscribirMutaciones } from '@/nucleo/difuminado/observador-dom';

describe('observador de mutaciones compartido', () => {
  it('usa un único MutationObserver para varios suscriptores', async () => {
    const espiaObserve = vi.spyOn(MutationObserver.prototype, 'observe');
    const a = new AbortController();
    const b = new AbortController();
    const alMutarA = vi.fn();
    const alMutarB = vi.fn();

    suscribirMutaciones(document, alMutarA, a.signal);
    suscribirMutaciones(document, alMutarB, b.signal);
    expect(espiaObserve).toHaveBeenCalledOnce();
    expect(contarObservadores(document)).toBe(1);

    document.body.append(document.createElement('div'));
    await Promise.resolve();
    expect(alMutarA).toHaveBeenCalledOnce();
    expect(alMutarB).toHaveBeenCalledOnce();

    a.abort();
    expect(contarObservadores(document)).toBe(1);
    b.abort();
    expect(contarObservadores(document)).toBe(0);
  });

  it('deja de notificar y desconecta al cancelar la suscripción', async () => {
    const espiaDisconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const controlador = new AbortController();
    const alMutar = vi.fn();
    suscribirMutaciones(document, alMutar, controlador.signal);
    controlador.abort();
    expect(espiaDisconnect).toHaveBeenCalledOnce();

    document.body.append(document.createElement('div'));
    await Promise.resolve();
    expect(alMutar).not.toHaveBeenCalled();
  });

  it('ignora suscripciones con la señal ya abortada', () => {
    suscribirMutaciones(document, vi.fn(), AbortSignal.abort());
    expect(contarObservadores(document)).toBe(0);
  });

  it('no observa cambios de atributos (evita bucles)', async () => {
    const controlador = new AbortController();
    const alMutar = vi.fn();
    suscribirMutaciones(document, alMutar, controlador.signal);
    document.body.setAttribute('data-veilix-prueba', '');
    await Promise.resolve();
    expect(alMutar).not.toHaveBeenCalled();
    controlador.abort();
    document.body.removeAttribute('data-veilix-prueba');
  });

  it('aísla los errores de un suscriptor', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const controlador = new AbortController();
    const sano = vi.fn();
    suscribirMutaciones(document, () => {
      throw new Error('fallo');
    }, controlador.signal);
    suscribirMutaciones(document, sano, controlador.signal);
    document.body.append(document.createElement('div'));
    await Promise.resolve();
    expect(sano).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledOnce();
    controlador.abort();
  });
});

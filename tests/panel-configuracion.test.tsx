// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { leerPreferencias } from '@/almacenamiento/almacen-preferencias';
import { CATALOGO_FUNCIONALIDADES } from '@/funcionalidades/catalogo';
import { PanelConfiguracion } from '@/ui/PanelConfiguracion';

describe('PanelConfiguracion', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    delete document.documentElement.dataset['tema'];
  });

  afterEach(() => {
    cleanup();
  });

  it('muestra las nueve funcionalidades como pendientes', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    for (const { titulo } of CATALOGO_FUNCIONALIDADES) {
      const encabezado = await screen.findByRole('heading', { name: titulo });
      const tarjeta = encabezado.closest('li');
      expect(tarjeta).not.toBeNull();
      expect(within(tarjeta as HTMLElement).getByText('Pendiente')).toBeDefined();
    }
  });

  it('no ofrece interruptores para funcionalidades pendientes', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    await screen.findByRole('radiogroup', { name: 'Tema del panel' });
    expect(screen.queryAllByRole('switch')).toHaveLength(0);
  });

  it('guarda y aplica el tema seleccionado', async () => {
    render(<PanelConfiguracion variante="pagina" />);
    fireEvent.click(await screen.findByRole('radio', { name: 'Oscuro' }));

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Oscuro' }).getAttribute('aria-checked')).toBe('true');
    });
    expect(document.documentElement.dataset['tema']).toBe('oscuro');
    await expect(leerPreferencias()).resolves.toMatchObject({ tema: 'oscuro' });
  });
});

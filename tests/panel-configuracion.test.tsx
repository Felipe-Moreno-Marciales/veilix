// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { cambiarTema, leerPreferencias } from '@/almacenamiento/almacen-preferencias';
import { CATALOGO_FUNCIONALIDADES } from '@/funcionalidades/catalogo';
import { PanelConfiguracion } from '@/ui/PanelConfiguracion';
import { VERSION, versionDescriptiva } from '@/version';

const DISPONIBLES = CATALOGO_FUNCIONALIDADES.filter((f) => f.estado === 'disponible');
const PENDIENTES = CATALOGO_FUNCIONALIDADES.filter((f) => f.estado === 'pendiente');

async function tarjetaDe(titulo: string): Promise<HTMLElement> {
  const encabezado = await screen.findByRole('heading', { name: titulo });
  const tarjeta = encabezado.closest('li');
  if (!tarjeta) throw new Error(`Sin tarjeta para ${titulo}`);
  return tarjeta;
}

describe('PanelConfiguracion', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    delete document.documentElement.dataset['tema'];
  });

  afterEach(() => {
    cleanup();
  });

  it('muestra las cuatro funcionalidades pendientes sin interruptor', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    expect(PENDIENTES).toHaveLength(4);
    for (const { titulo } of PENDIENTES) {
      const tarjeta = await tarjetaDe(titulo);
      expect(within(tarjeta).getByText('Pendiente')).toBeDefined();
      expect(within(tarjeta).queryByRole('switch')).toBeNull();
    }
  });

  it('muestra un interruptor desactivado por cada funcionalidad disponible', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    expect(DISPONIBLES).toHaveLength(5);
    for (const { titulo } of DISPONIBLES) {
      const interruptor = await screen.findByRole('switch', { name: titulo });
      expect(interruptor.getAttribute('aria-checked')).toBe('false');
      expect(within(await tarjetaDe(titulo)).queryByText('Pendiente')).toBeNull();
    }
    expect(screen.getAllByRole('switch')).toHaveLength(5);
  });

  it('cada interruptor guarda solo su funcionalidad', async () => {
    await cambiarTema('oscuro');
    render(<PanelConfiguracion variante="emergente" />);
    fireEvent.click(await screen.findByRole('switch', { name: 'Difuminar fotografías de contactos' }));

    await waitFor(async () => {
      const preferencias = await leerPreferencias();
      expect(preferencias.funcionalidades.difuminarFotos).toBe(true);
    });
    const preferencias = await leerPreferencias();
    expect(preferencias.tema).toBe('oscuro');
    const otras = Object.entries(preferencias.funcionalidades).filter(([id]) => id !== 'difuminarFotos');
    expect(otras.every(([, activa]) => !activa)).toBe(true);
    expect(
      screen.getByRole('switch', { name: 'Difuminar fotografías de contactos' }).getAttribute('aria-checked'),
    ).toBe('true');
  });

  it('mantiene el estado al volver a abrir el panel', async () => {
    const { unmount } = render(<PanelConfiguracion variante="emergente" />);
    fireEvent.click(await screen.findByRole('switch', { name: 'Difuminar nombres de contactos' }));
    await waitFor(async () => {
      expect((await leerPreferencias()).funcionalidades.difuminarNombres).toBe(true);
    });
    unmount();

    render(<PanelConfiguracion variante="pagina" />);
    const interruptor = await screen.findByRole('switch', { name: 'Difuminar nombres de contactos' });
    await waitFor(() => {
      expect(interruptor.getAttribute('aria-checked')).toBe('true');
    });
  });

  it('refleja cambios hechos desde otro contexto', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    const interruptor = await screen.findByRole('switch', { name: 'Difuminar el campo de entrada' });
    await fakeBrowser.storage.local.set({
      preferencias: { tema: 'sistema', funcionalidades: { difuminarCampoEntrada: true } },
    });
    await waitFor(() => {
      expect(interruptor.getAttribute('aria-checked')).toBe('true');
    });
  });

  it('usa botones nativos accesibles con teclado', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    for (const { titulo } of DISPONIBLES) {
      const interruptor = await screen.findByRole('switch', { name: titulo });
      expect(interruptor.tagName).toBe('BUTTON');
      expect(interruptor.getAttribute('type')).toBe('button');
      expect(interruptor.tabIndex).toBe(0);
    }
  });

  it('muestra «Veilix <versión>» con la versión de package.json', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    expect(await screen.findByText(`Veilix ${versionDescriptiva(VERSION)}`)).toBeDefined();
  });

  it('guarda y aplica el tema seleccionado', async () => {
    render(<PanelConfiguracion variante="pagina" />);
    fireEvent.click(await screen.findByRole('radio', { name: 'Oscuro' }));

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Oscuro' }).getAttribute('aria-checked')).toBe('true');
    });
    // El tema se aplica a <html> en un efecto, después del renderizado.
    await waitFor(() => {
      expect(document.documentElement.dataset['tema']).toBe('oscuro');
    });
    await expect(leerPreferencias()).resolves.toMatchObject({ tema: 'oscuro' });
  });
});

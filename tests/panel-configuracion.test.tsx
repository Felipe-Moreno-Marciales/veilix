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

  it('cada interruptor se describe con la descripción y la nota de su tarjeta', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    for (const { titulo, descripcion, nota } of DISPONIBLES) {
      const interruptor = await screen.findByRole('switch', { name: titulo });
      const ids = interruptor.getAttribute('aria-describedby')?.split(' ') ?? [];
      const textos = ids.map((id) => document.getElementById(id)?.textContent);
      expect(textos).toEqual(nota ? [descripcion, nota] : [descripcion]);
    }
  });

  it('muestra «Veilix <versión>» con la versión de package.json', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    expect(await screen.findByText(`Veilix ${versionDescriptiva(VERSION)}`)).toBeDefined();
  });

  it.each(['emergente', 'pagina'] as const)(
    'muestra el crédito exacto justo después de la versión, sin enlaces (%s)',
    async (variante) => {
      render(<PanelConfiguracion variante={variante} />);
      const version = await screen.findByText(`Veilix ${versionDescriptiva(VERSION)}`);
      const credito = screen.getByText('Hecho con ❤️ por Felipe Moreno Marciales');
      // El texto y el corazón se conservan; la bandera es el SVG, sin el emoji 🇨🇴.
      expect(credito.textContent).toBe('Hecho con \u2764\uFE0F por Felipe Moreno Marciales');
      expect(version.nextElementSibling).toBe(credito);
      const bandera = within(credito).getByRole('img', { name: 'Bandera de Colombia' });
      expect(credito.lastElementChild).toBe(bandera);
      expect(credito.lastChild).toBe(bandera);
      expect(document.body.textContent).not.toMatch(/\u{1F1E8}|\u{1F1F4}/u);
      const pie = credito.closest('footer');
      if (!pie) throw new Error('El crédito no está en el pie del panel');
      expect(within(pie).getByText('Todo se procesa en este equipo. Sin telemetría ni servidores externos.')).toBeDefined();
      expect(within(pie).getByText('Veilix no está afiliado a WhatsApp ni a Meta.')).toBeDefined();
      expect(pie.querySelector('a')).toBeNull();
    },
  );

  it('el crédito no depende de las funcionalidades activas', async () => {
    render(<PanelConfiguracion variante="emergente" />);
    const interruptores = await screen.findAllByRole('switch');
    for (const interruptor of interruptores) fireEvent.click(interruptor);
    await waitFor(async () => {
      expect(Object.values((await leerPreferencias()).funcionalidades).filter(Boolean)).toHaveLength(5);
    });
    expect(screen.getByText('Hecho con ❤️ por Felipe Moreno Marciales')).toBeDefined();
    expect(screen.getByRole('img', { name: 'Bandera de Colombia' })).toBeDefined();
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

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PanelConfiguracion } from './PanelConfiguracion';
import './estilos/panel.css';

export function montarPanel(variante: 'emergente' | 'pagina'): void {
  const raiz = document.getElementById('raiz');
  if (!raiz) {
    throw new Error('No se encontró el elemento raíz del panel.');
  }
  createRoot(raiz).render(
    <StrictMode>
      <PanelConfiguracion variante={variante} />
    </StrictMode>,
  );
}

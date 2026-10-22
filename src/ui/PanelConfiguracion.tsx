import { useEffect } from 'react';
import { CATALOGO_FUNCIONALIDADES, CATEGORIAS } from '@/funcionalidades/catalogo';
import type { Tema } from '@/almacenamiento/preferencias';
import { VERSION, versionDescriptiva } from '@/version';
import { CreditoDesarrollador } from './componentes/CreditoDesarrollador';
import { Logotipo } from './componentes/Logotipo';
import { SelectorTema } from './componentes/SelectorTema';
import { TarjetaFuncionalidad } from './componentes/TarjetaFuncionalidad';
import { usePreferencias } from './use-preferencias';

interface Propiedades {
  /** `emergente`: ventana de la barra de herramientas; `pagina`: página de opciones. */
  readonly variante: 'emergente' | 'pagina';
}

function aplicarTema(tema: Tema): void {
  document.documentElement.dataset['tema'] = tema;
}

export function PanelConfiguracion({ variante }: Propiedades) {
  const { preferencias, error, establecerTema, establecerFuncionalidad } = usePreferencias();

  useEffect(() => {
    if (preferencias) aplicarTema(preferencias.tema);
  }, [preferencias]);

  return (
    <div className="panel" data-variante={variante}>
      <header className="panel__cabecera">
        <Logotipo />
        <div>
          <h1 className="panel__titulo">Veilix</h1>
          <p className="panel__subtitulo">Privacidad para WhatsApp Web</p>
        </div>
      </header>

      {error ? (
        <p className="aviso aviso--error" role="alert">
          {error}
        </p>
      ) : null}

      {preferencias ? (
        <main className="panel__contenido">
          <section className="seccion" aria-labelledby="seccion-apariencia">
            <h2 id="seccion-apariencia" className="seccion__titulo">
              Apariencia
            </h2>
            <SelectorTema tema={preferencias.tema} alCambiar={establecerTema} />
          </section>

          {CATEGORIAS.map((categoria) => (
            <section
              key={categoria.id}
              className="seccion"
              aria-labelledby={`seccion-${categoria.id}`}
            >
              <h2 id={`seccion-${categoria.id}`} className="seccion__titulo">
                {categoria.titulo}
              </h2>
              <ul className="lista-tarjetas">
                {CATALOGO_FUNCIONALIDADES.filter((f) => f.categoria === categoria.id).map(
                  (definicion) => (
                    <TarjetaFuncionalidad
                      key={definicion.id}
                      definicion={definicion}
                      activa={preferencias.funcionalidades[definicion.id]}
                      alCambiar={(activa) => {
                        establecerFuncionalidad(definicion.id, activa);
                      }}
                    />
                  ),
                )}
              </ul>
            </section>
          ))}
        </main>
      ) : error ? null : (
        <p className="panel__cargando" aria-live="polite">
          Cargando preferencias…
        </p>
      )}

      <footer className="panel__pie">
        <p>Todo se procesa en este equipo. Sin telemetría ni servidores externos.</p>
        <p>Veilix no está afiliado a WhatsApp ni a Meta.</p>
        <p className="panel__version">
          Veilix {versionDescriptiva(VERSION)}
        </p>
        <CreditoDesarrollador />
      </footer>
    </div>
  );
}

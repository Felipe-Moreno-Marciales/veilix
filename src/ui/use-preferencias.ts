import { useCallback, useEffect, useState } from 'react';
import {
  cambiarFuncionalidad,
  cambiarTema,
  leerPreferencias,
  observarPreferencias,
} from '@/almacenamiento/almacen-preferencias';
import type { Preferencias, Tema } from '@/almacenamiento/preferencias';
import type { IdFuncionalidad } from '@/funcionalidades/catalogo';

export interface EstadoPreferencias {
  readonly preferencias: Preferencias | null;
  readonly error: string | null;
  readonly establecerTema: (tema: Tema) => void;
  readonly establecerFuncionalidad: (id: IdFuncionalidad, activa: boolean) => void;
}

const MENSAJE_ERROR = 'No se pudieron guardar las preferencias. Inténtalo de nuevo.';

/**
 * Hook de React (el prefijo `use` es obligatorio para las reglas de hooks).
 * Carga las preferencias, las mantiene sincronizadas y expone acciones para modificarlas. */
export function usePreferencias(): EstadoPreferencias {
  const [preferencias, setPreferencias] = useState<Preferencias | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    leerPreferencias()
      .then((valor) => {
        if (vigente) setPreferencias(valor);
      })
      .catch(() => {
        if (vigente) setError('No se pudieron cargar las preferencias.');
      });
    const dejarDeObservar = observarPreferencias((valor) => {
      if (vigente) setPreferencias(valor);
    });
    return () => {
      vigente = false;
      dejarDeObservar();
    };
  }, []);

  const ejecutar = useCallback((operacion: Promise<Preferencias>) => {
    operacion
      .then((valor) => {
        setPreferencias(valor);
        setError(null);
      })
      .catch(() => {
        setError(MENSAJE_ERROR);
      });
  }, []);

  const establecerTema = useCallback(
    (tema: Tema) => {
      ejecutar(cambiarTema(tema));
    },
    [ejecutar],
  );

  const establecerFuncionalidad = useCallback(
    (id: IdFuncionalidad, activa: boolean) => {
      ejecutar(cambiarFuncionalidad(id, activa));
    },
    [ejecutar],
  );

  return { preferencias, error, establecerTema, establecerFuncionalidad };
}

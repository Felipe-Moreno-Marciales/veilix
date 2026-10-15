// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  cambiarFuncionalidad,
  leerPreferencias,
  observarPreferencias,
} from '@/almacenamiento/almacen-preferencias';
import { PREFERENCIAS_PREDETERMINADAS, type Preferencias } from '@/almacenamiento/preferencias';
import { type IdFuncionalidad } from '@/funcionalidades/catalogo';
import { MODULOS_FUNCIONALIDADES } from '@/funcionalidades/registro';
import { ATRIBUTO_ESTILO } from '@/nucleo/difuminado/modulo-difuminado';
import { contarObservadores } from '@/nucleo/difuminado/observador-dom';
import { GestorModulos } from '@/nucleo/gestor-modulos';
import { montarWhatsAppSimulado, type WhatsAppSimulado } from '../apoyo/whatsapp-simulado';

const DIFUMINADO: readonly { id: IdFuncionalidad; sufijo: string; marca: string | null }[] = [
  { id: 'difuminarNombres', sufijo: 'nombres', marca: 'data-veilix-nombre' },
  { id: 'difuminarFotos', sufijo: 'fotos', marca: null },
  { id: 'difuminarMensajesRecientes', sufijo: 'mensajes-recientes', marca: 'data-veilix-vista-previa' },
  { id: 'difuminarMensajesConversacion', sufijo: 'mensajes-conversacion', marca: null },
  { id: 'difuminarCampoEntrada', sufijo: 'campo-entrada', marca: null },
];

function preferenciasCon(...ids: IdFuncionalidad[]): Preferencias {
  const funcionalidades = { ...PREFERENCIAS_PREDETERMINADAS.funcionalidades };
  for (const id of ids) funcionalidades[id] = true;
  return { ...PREFERENCIAS_PREDETERMINADAS, funcionalidades };
}

function estilos(): string[] {
  return [...document.querySelectorAll(`style[${ATRIBUTO_ESTILO}]`)].map(
    (e) => e.getAttribute(ATRIBUTO_ESTILO) ?? '',
  );
}

function atributosVeilix(): string[] {
  const nombres = new Set<string>();
  for (const elemento of document.querySelectorAll('*')) {
    for (const { name } of elemento.attributes) {
      if (name.startsWith('data-veilix')) nombres.add(name);
    }
  }
  return [...nombres];
}

describe('módulos de difuminado con el gestor', () => {
  let wa: WhatsAppSimulado;
  let contexto: AbortController;
  let gestor: GestorModulos;
  let htmlOriginal: string;

  beforeEach(() => {
    wa = montarWhatsAppSimulado();
    htmlOriginal = wa.app.outerHTML;
    contexto = new AbortController();
    gestor = new GestorModulos({
      modulos: MODULOS_FUNCIONALIDADES,
      documento: document,
      senal: contexto.signal,
    });
  });

  afterEach(() => {
    gestor.detenerTodo();
    contexto.abort();
    wa.desmontar();
  });

  it.each(DIFUMINADO)('activa y desactiva $id de forma individual', ({ id, sufijo, marca }) => {
    gestor.aplicar(preferenciasCon(id));
    expect([...gestor.activos]).toEqual([id]);
    expect(estilos()).toEqual([sufijo]);
    if (marca) {
      expect(document.querySelectorAll(`[${marca}]`).length).toBeGreaterThan(0);
      expect(contarObservadores(document)).toBe(1);
    } else {
      expect(contarObservadores(document)).toBe(0);
    }

    gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
    expect(gestor.activos.size).toBe(0);
    expect(estilos()).toEqual([]);
    expect(atributosVeilix()).toEqual([]);
    expect(contarObservadores(document)).toBe(0);
  });

  it('funciona con las cinco protecciones a la vez y un solo observador', () => {
    gestor.aplicar(preferenciasCon(...DIFUMINADO.map((m) => m.id)));
    expect(gestor.activos.size).toBe(5);
    expect(estilos().sort()).toEqual(DIFUMINADO.map((m) => m.sufijo).sort());
    expect(contarObservadores(document)).toBe(1);
  });

  it('desactivar un módulo no afecta a los demás', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesRecientes', 'difuminarFotos'));
    gestor.aplicar(preferenciasCon('difuminarMensajesRecientes', 'difuminarFotos'));

    expect(estilos().sort()).toEqual(['fotos', 'mensajes-recientes']);
    expect(document.querySelectorAll('[data-veilix-nombre]')).toHaveLength(0);
    expect(document.querySelectorAll('[data-veilix-vista-previa]').length).toBeGreaterThan(0);
    expect(contarObservadores(document)).toBe(1);
  });

  it('no altera el contenido ni la estructura de WhatsApp', () => {
    gestor.aplicar(preferenciasCon(...DIFUMINADO.map((m) => m.id)));
    gestor.detenerTodo();
    expect(wa.app.outerHTML).toBe(htmlOriginal);
  });

  it('limpia todo al invalidarse el script de contenido', () => {
    gestor.aplicar(preferenciasCon(...DIFUMINADO.map((m) => m.id)));
    contexto.abort();
    expect(estilos()).toEqual([]);
    expect(atributosVeilix()).toEqual([]);
    expect(contarObservadores(document)).toBe(0);
  });

  it('se puede reactivar tras desactivar', () => {
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    gestor.aplicar(PREFERENCIAS_PREDETERMINADAS);
    gestor.aplicar(preferenciasCon('difuminarNombres'));
    expect(estilos()).toEqual(['nombres']);
    expect(document.querySelectorAll('[data-veilix-nombre]')).toHaveLength(3);
  });

  it('protege elementos que aparecen después de activar (carga inicial)', async () => {
    wa.desmontar();
    gestor.aplicar(preferenciasCon('difuminarNombres', 'difuminarMensajesRecientes'));
    wa = montarWhatsAppSimulado();
    await Promise.resolve();
    expect(document.querySelectorAll('[data-veilix-nombre]')).toHaveLength(3);
    expect(document.querySelectorAll('[data-veilix-vista-previa]').length).toBeGreaterThan(0);
  });

  it('no deja restos si se activa con la señal ya abortada', () => {
    for (const modulo of MODULOS_FUNCIONALIDADES.filter((m) => DIFUMINADO.some((d) => d.id === m.id))) {
      modulo.activar({ documento: document, senal: AbortSignal.abort() });
    }
    expect(estilos()).toEqual([]);
    expect(atributosVeilix()).toEqual([]);
    expect(contarObservadores(document)).toBe(0);
  });

  it('inserta los estilos aunque todavía no exista <head>', () => {
    const documento = document.implementation.createHTMLDocument('');
    documento.head.remove();
    const otroGestor = new GestorModulos({
      modulos: MODULOS_FUNCIONALIDADES,
      documento,
      senal: contexto.signal,
    });
    otroGestor.aplicar(preferenciasCon('difuminarCampoEntrada'));
    expect(documento.documentElement.querySelector(`style[${ATRIBUTO_ESTILO}]`)).not.toBeNull();
    otroGestor.detenerTodo();
    expect(documento.documentElement.querySelector(`style[${ATRIBUTO_ESTILO}]`)).toBeNull();
  });
});

describe('actualización de preferencias sin recargar', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('el flujo del script de contenido aplica cada cambio guardado', async () => {
    const wa = montarWhatsAppSimulado();
    const contexto = new AbortController();
    const gestor = new GestorModulos({
      modulos: MODULOS_FUNCIONALIDADES,
      documento: document,
      senal: contexto.signal,
    });
    const dejarDeObservar = observarPreferencias((p) => {
      gestor.aplicar(p);
    });
    gestor.aplicar(await leerPreferencias());
    expect(gestor.activos.size).toBe(0);

    await cambiarFuncionalidad('difuminarFotos', true);
    await expect.poll(() => [...gestor.activos]).toEqual(['difuminarFotos']);

    await cambiarFuncionalidad('difuminarCampoEntrada', true);
    await expect.poll(() => gestor.activos.size).toBe(2);

    await cambiarFuncionalidad('difuminarFotos', false);
    await expect.poll(() => [...gestor.activos]).toEqual(['difuminarCampoEntrada']);

    dejarDeObservar();
    contexto.abort();
    wa.desmontar();
  });
});

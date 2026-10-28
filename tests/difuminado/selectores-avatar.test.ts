// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  AVATAR_PREDETERMINADO,
  AVATAR_SVG,
  FOTO_PERFIL,
  FOTO_PERFIL_SVG,
  FOTOGRAFIA,
} from '@/nucleo/difuminado/selectores';
import {
  crearForeignObject,
  crearImagenSvg,
  crearSvgConMascara,
  URL_FOTO_PERFIL,
  URL_MULTIMEDIA_MENSAJE,
  montarWhatsAppConAvatares,
  type WhatsAppSimulado,
} from '../apoyo/whatsapp-simulado';

function crear(html: { etiqueta: string; atributos: Record<string, string> }): Element {
  const elemento = document.createElement(html.etiqueta);
  for (const [nombre, valor] of Object.entries(html.atributos)) elemento.setAttribute(nombre, valor);
  return elemento;
}

describe('selectores de avatares (RF-02)', () => {
  it('FOTO_PERFIL reconoce fotos de perfil en <img> y en imagen de fondo', () => {
    expect(crear({ etiqueta: 'img', atributos: { src: URL_FOTO_PERFIL } }).matches(FOTO_PERFIL)).toBe(true);
    expect(
      crear({ etiqueta: 'img', atributos: { src: 'https://cdn.invalid/v/t61.24694-24/1_n.jpg' } }).matches(FOTO_PERFIL),
    ).toBe(true);
    expect(
      crear({ etiqueta: 'div', atributos: { style: `background-image: url("${URL_FOTO_PERFIL}")` } }).matches(FOTO_PERFIL),
    ).toBe(true);
  });

  it('FOTO_PERFIL no reconoce multimedia de mensajes ni otras imágenes', () => {
    for (const src of [URL_MULTIMEDIA_MENSAJE, 'blob:https://web.whatsapp.com/abc', 'data:image/png;base64,AAAA']) {
      expect(crear({ etiqueta: 'img', atributos: { src } }).matches(FOTO_PERFIL)).toBe(false);
    }
    expect(crear({ etiqueta: 'div', atributos: { style: 'color: red' } }).matches(FOTO_PERFIL)).toBe(false);
  });

  it('AVATAR_PREDETERMINADO reconoce solo iconos de avatar', () => {
    for (const icono of ['default-user', 'default-group', 'default-contact-refreshed', 'default-community']) {
      expect(crear({ etiqueta: 'span', atributos: { 'data-icon': icono } }).matches(AVATAR_PREDETERMINADO)).toBe(true);
    }
    for (const icono of ['muted', 'pinned', 'menu', 'search', 'send', 'x']) {
      expect(crear({ etiqueta: 'span', atributos: { 'data-icon': icono } }).matches(AVATAR_PREDETERMINADO)).toBe(false);
    }
  });

  it('AVATAR_SVG exige máscara y <image> o <foreignObject>', () => {
    const conImagen = crearSvgConMascara(document, crearImagenSvg(document));
    const conForeignObject = crearSvgConMascara(document, crearForeignObject(document));
    const sinContenido = crearSvgConMascara(document, null);
    const sinMascara = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sinMascara.append(crearImagenSvg(document));
    const contenedor = document.createElement('div');
    contenedor.append(conImagen, conForeignObject, sinContenido, sinMascara);
    document.body.append(contenedor);

    expect(conImagen.matches(AVATAR_SVG)).toBe(true);
    expect(conForeignObject.matches(AVATAR_SVG)).toBe(true);
    expect(sinContenido.matches(AVATAR_SVG)).toBe(false);
    expect(sinMascara.matches(AVATAR_SVG)).toBe(false);
    expect(conImagen.matches(FOTO_PERFIL_SVG)).toBe(true);
    expect(conForeignObject.matches(FOTO_PERFIL_SVG)).toBe(false);

    const icono = document.createElement('span');
    icono.setAttribute('data-icon', 'muted');
    const svgEnIcono = crearSvgConMascara(document, crearImagenSvg(document));
    icono.append(svgEnIcono);
    contenedor.append(icono);
    expect(svgEnIcono.matches(AVATAR_SVG)).toBe(false);
    contenedor.remove();
  });

  describe('FOTOGRAFIA dentro de filas', () => {
    let wa: WhatsAppSimulado;
    beforeEach(() => {
      wa = montarWhatsAppConAvatares();
    });
    afterEach(() => {
      wa.desmontar();
    });

    it('excluye emojis dentro de nombres e imágenes dentro de iconos', () => {
      const emoji = wa.lista.querySelector('img.emoji');
      expect(emoji).not.toBeNull();
      expect(emoji?.matches(FOTOGRAFIA)).toBe(false);
      const imagenEnIcono = document.createElement('img');
      wa.lista.querySelector('[data-icon="muted"]')?.append(imagenEnIcono);
      expect(imagenEnIcono.matches(FOTOGRAFIA)).toBe(false);
    });

    it('incluye la imagen del avatar', () => {
      expect(wa.lista.querySelector('[data-prueba="avatar"] img')?.matches(FOTOGRAFIA)).toBe(true);
    });
  });
});

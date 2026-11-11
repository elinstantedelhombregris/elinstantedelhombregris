/**
 * El kit de prensa ofrece sólo lo que existe (D-157).
 *
 * La página enlazaba cinco descargas en `/assets/` que nunca se habían subido:
 * las cinco daban 404 en producción y cada una tenía un tamaño inventado al
 * lado. Ningún test miraba la página. Lo que se cuida acá es la clase entera del
 * defecto: una descarga que la página promete y el disco no tiene.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DESCARGAS, KitDePrensa, PARA_LEER } from '../KitDePrensa';

const PUBLICO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../public');
const enDisco = (ruta: string) => resolve(PUBLICO, `.${ruta}`);

/** Ancho y alto de un PNG, leídos de su cabecera (bloque IHDR). */
function medidaDePng(ruta: string): { ancho: number; alto: number } {
  const bytes = readFileSync(enDisco(ruta));
  return { ancho: bytes.readUInt32BE(16), alto: bytes.readUInt32BE(20) };
}

describe('Kit de prensa', () => {
  it('cada descarga que ofrece la página existe en disco y no está vacía', () => {
    render(<KitDePrensa />);
    const descargas = screen.getAllByRole('link', { name: /^Descargar: / });
    expect(descargas).toHaveLength(DESCARGAS.length);
    for (const enlace of descargas) {
      const ruta = enlace.getAttribute('href') ?? '';
      expect(enlace).toHaveAttribute('download');
      expect(existsSync(enDisco(ruta)), `la página ofrece ${ruta} y el archivo no está`).toBe(true);
      expect(statSync(enDisco(ruta)).size).toBeGreaterThan(0);
    }
  });

  it('ningún enlace apunta a /assets/, que es donde vive el bundle y no hay nada de esto', () => {
    const { container } = render(<KitDePrensa />);
    for (const enlace of container.querySelectorAll('a[href]')) {
      expect(enlace.getAttribute('href')).not.toMatch(/^\/assets\//);
    }
  });

  it('no dice el tamaño de ningún archivo: eran números escritos a mano', () => {
    const { container } = render(<KitDePrensa />);
    expect(container.textContent).not.toMatch(/\d\s?(KB|MB)\b/);
  });

  it('los PNG miden lo que la página dice', () => {
    for (const descarga of DESCARGAS.filter((d) => d.archivo.endsWith('.png'))) {
      const { ancho, alto } = medidaDePng(descarga.archivo);
      expect(descarga.detalle).toBe(`${String(ancho)} × ${String(alto)} px.`);
    }
  });

  it('la marca va en contornos, con los signos en violeta', () => {
    const clara = readFileSync(enDisco('/media/prensa/basta-marca-clara.svg'), 'utf8');
    const oscura = readFileSync(enDisco('/media/prensa/basta-marca.svg'), 'utf8');
    for (const svg of [clara, oscura]) {
      // Sin texto: no depende de que quien lo abre tenga Anton instalada.
      expect(svg).not.toMatch(/<text|font-family/);
      expect(svg.match(/<path /g)).toHaveLength(2);
    }
    // Letras en tinta y signos en violeta; sobre oscuro, papel y violeta claro.
    expect(oscura).toContain('fill="#16130E"');
    expect(oscura).toContain('fill="#5227CC"');
    expect(clara).toContain('fill="#F2EFE7"');
    expect(clara).toContain('fill="#9D85E8"');
  });

  it('lo que no es un archivo se lee en el sitio: el manifiesto y quién está detrás', () => {
    render(<KitDePrensa />);
    expect(PARA_LEER.map((p) => p.href)).toEqual(['/manifiesto', '/quien-esta-detras']);
    for (const pagina of PARA_LEER) {
      const enlace = screen.getByRole('link', { name: `Abrir: ${pagina.nombre}` });
      expect(enlace).toHaveAttribute('href', pagina.href);
      expect(enlace).not.toHaveAttribute('download');
    }
    // La ficha técnica nunca se escribió: la página dejó de prometerla.
    expect(screen.queryByText(/ficha técnica/i)).not.toBeInTheDocument();
  });
});

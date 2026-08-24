import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { ACTAS_DE_EJEMPLO } from '../actas-de-ejemplo';

import { esRutaPapel } from '~/layouts/papel-routes';
import { ElMandatoVivoEjemplo } from '~/pages/ElMandatoVivoEjemplo';

/**
 * El segundo ejemplo, con su enmienda propia —
 * `docs/specs/2026-08-20-enmienda-los-ejemplos-ii-las-actas.md`.
 *
 * Lo que se verifica es lo que la enmienda pidió a cambio de autorizarlo:
 * ruta propia con chrome, el título y el encabezado dicen «ejemplo» antes que
 * el contenido, cada acta lleva su sello adentro del área recortable, y el
 * fuente del ejemplo no puede tocar la base ni la API (E1, como guarda de
 * código y no como promesa).
 */

const TITULO_DEL_SITIO = '¡BASTA! — El país lo diseña la gente';

const envolver = (nodo: React.ReactNode) => {
  const { hook } = memoryLocation({ path: '/mandato-vivo/ejemplo' });
  return render(<Router hook={hook}>{nodo}</Router>);
};

afterEach(() => {
  document.title = TITULO_DEL_SITIO;
});

describe('la ruta propia', () => {
  it('`/mandato-vivo/ejemplo` recibe el chrome papel', () => {
    expect(esRutaPapel('/mandato-vivo/ejemplo')).toBe(true);
    expect(esRutaPapel('/mandato-vivo')).toBe(true);
  });
});

describe('el título y el encabezado lo dicen antes que el contenido', () => {
  it('escribe «Ejemplo» en el título, y como primera palabra', () => {
    document.title = TITULO_DEL_SITIO;
    envolver(<ElMandatoVivoEjemplo />);
    expect(document.title).toMatch(/^Ejemplo\b/);
    expect(document.title).toContain('El mandato');
  });

  it('devuelve el título al salir: la pestaña no se queda diciendo «Ejemplo»', () => {
    document.title = TITULO_DEL_SITIO;
    const { unmount } = envolver(<ElMandatoVivoEjemplo />);
    expect(document.title).not.toBe(TITULO_DEL_SITIO);
    unmount();
    expect(document.title).toBe(TITULO_DEL_SITIO);
  });

  it('el encabezado dice que es un ejemplo, y que no lo dijo nadie', () => {
    const { container } = envolver(<ElMandatoVivoEjemplo />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(/ejemplo/i);
    expect(container.textContent).toContain('Nadie dijo ninguna de estas cosas.');
  });
});

describe('las actas', () => {
  it('son cinco, una por camino, y cada una lleva su sello adentro de la tarjeta', () => {
    envolver(<ElMandatoVivoEjemplo />);
    const tarjetas = screen.getAllByRole('article');
    expect(tarjetas).toHaveLength(5);
    for (const tarjeta of tarjetas) {
      // El sello sobrevive al recorte: viaja adentro del área capturable,
      // no en el encabezado de la página (enmienda §2).
      expect(tarjeta.textContent).toContain('ejemplo inventado');
    }
  });

  it('las cuatro clases del canon están representadas', () => {
    const clases = new Set(ACTAS_DE_EJEMPLO.map((a) => a.clase));
    expect(clases).toEqual(new Set(['hecho', 'deseo', 'acto', 'meta']));
  });

  it('los conteos hablan de personas distintas, nunca de filas', () => {
    for (const acta of ACTAS_DE_EJEMPLO) {
      expect(acta.respaldo).toMatch(/personas distintas/);
    }
  });

  it('vuelve al documento vivo por un link explícito, en las dos puntas', () => {
    envolver(<ElMandatoVivoEjemplo />);
    const links = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/mandato-vivo');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});

describe('E1 — el fuente del ejemplo no puede tocar la base ni la API', () => {
  // `fileURLToPath` sobre la cadena, como en guarda-del-color: bajo happy-dom
  // el `URL` global es el del DOM.
  const AQUI = dirname(fileURLToPath(import.meta.url));
  const FUENTES = [
    join(AQUI, '..', '..', 'ElMandatoVivoEjemplo.tsx'),
    join(AQUI, '..', 'actas-de-ejemplo.ts'),
    join(AQUI, '..', 'sections', 'LasActasDeEjemplo.tsx'),
  ];

  it('ni Drizzle, ni el cliente de la API, ni un fetch propio', () => {
    for (const ruta of FUENTES) {
      const codigo = readFileSync(ruta, 'utf8');
      expect(codigo).not.toMatch(/@v2\/db/);
      expect(codigo).not.toMatch(/~\/lib\/api/);
      expect(codigo).not.toMatch(/\bfetch\s*\(/);
      expect(codigo).not.toMatch(/useQuery|useMutation/);
    }
  });

  it('ni un color propio: todo sale de `colorDeClase`', () => {
    for (const ruta of FUENTES) {
      const codigo = readFileSync(ruta, 'utf8');
      expect(codigo).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    }
  });
});

/**
 * La guardia de D-048: que la CSP siga llegando al navegador.
 *
 * La política es una sola tabla (`packages/shared/src/seguridad/csp.ts`) y dos
 * superficies la emiten: helmet, para `/api/*`, y `vercel.json`, para el
 * documento. Express no sirve el documento en producción, así que **sin el
 * bloque de `vercel.json` la CSP no existe para el navegador** — que es el
 * estado exacto en el que estuvo el producto hasta el 13/8/2026, con la
 * política escrita, testeada y jamás aplicada.
 *
 * Este archivo verifica lo que un test de la API no puede ver: que el JSON
 * commiteado siga siendo el que sale de la tabla. El otro lado del lazo lo
 * cierra `apps/api/tests/cabeceras-seguridad.test.ts`.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { conBloqueDeHeaders, hostsExternosDe, RUTA_DE_LA_PAGINA } from '../seguridad/csp-vercel.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

const vercelTexto = readFileSync(join(raizV2, 'vercel.json'), 'utf8');
const indexHtml = readFileSync(join(raizV2, 'apps', 'web', 'index.html'), 'utf8');

interface CabeceraVercel {
  key: string;
  value: string;
}
interface ReglaVercel {
  source: string;
  headers: CabeceraVercel[];
}
interface Vercel {
  headers?: ReglaVercel[];
}

const vercel = JSON.parse(vercelTexto) as Vercel;

const regla = (): ReglaVercel => {
  const reglas = vercel.headers ?? [];
  const encontrada = reglas.find((r) => r.source === RUTA_DE_LA_PAGINA);
  if (encontrada === undefined) {
    throw new Error(`vercel.json no tiene una regla de headers para ${RUTA_DE_LA_PAGINA}`);
  }
  return encontrada;
};

const valor = (nombre: string): string =>
  regla().headers.find((h) => h.key.toLowerCase() === nombre.toLowerCase())?.value ?? '';

const directiva = (nombre: string): string =>
  valor('Content-Security-Policy')
    .split(';')
    .map((d) => d.trim())
    .find((d) => d === nombre || d.startsWith(`${nombre} `)) ?? '';

describe('cabeceras del documento en vercel.json', () => {
  it('está al día con la tabla compartida', () => {
    expect(
      conBloqueDeHeaders(vercelTexto),
      'vercel.json quedó viejo respecto de packages/shared/src/seguridad/csp.ts. Corré `pnpm csp:generar`.',
    ).toBe(vercelTexto);
  });

  it('el documento recibe una CSP', () => {
    expect(valor('Content-Security-Policy')).not.toBe('');
  });

  it('no se la aplica a la API, que pone la suya', () => {
    // El lookahead negativo es lo que evita el header duplicado en /api/*.
    expect(RUTA_DE_LA_PAGINA).toContain('(?!api/)');
    expect(regla().source).toBe(RUTA_DE_LA_PAGINA);
  });

  it('los scripts salen del propio origen y de ningún otro lado', () => {
    // Ni `'unsafe-inline'` ni `'unsafe-eval'`: el build de Vite no los
    // necesita —`index.html` no lleva un solo script inline— y ponerlos
    // vaciaría la única directiva que frena un XSS.
    expect(directiva('script-src')).toBe("script-src 'self'");
    expect(valor('Content-Security-Policy')).not.toContain("'unsafe-eval'");
    expect(valor('Content-Security-Policy')).not.toContain('*');
  });

  it('el único host de terceros es el basemap de Carto, y sólo en dos directivas', () => {
    // Lista blanca y no «ninguno», porque hoy hay uno: el basemap todavía sale
    // de Carto mientras el `.pmtiles` de 1,2 GB no tenga dónde vivir (D-051).
    // Lo que este test fija es que no aparezca un SEGUNDO, y que el permiso no
    // se derrame a otra directiva — sobre todo a `script-src`, donde un host
    // ajeno es ejecución de código y no una imagen.
    const permitidos = new Set(["'self'", "'none'", "'unsafe-inline'", 'data:', 'blob:']);
    const carto = /^https:\/\/tiles(-[abcd])?\.basemaps\.cartocdn\.com$/;
    const conCarto = new Set(['img-src', 'connect-src']);

    for (const bruta of valor('Content-Security-Policy').split(';')) {
      const [nombre = '', ...fuentes] = bruta.trim().split(/\s+/);
      for (const fuente of fuentes) {
        if (carto.test(fuente)) {
          expect(conCarto, `Carto se derramó a ${nombre}`).toContain(nombre);
          continue;
        }
        expect(permitidos, `${nombre} → ${fuente}`).toContain(fuente);
      }
    }
  });

  it('las tipografías no salen de ningún lado de afuera, y eso no depende de D-051', () => {
    // La mitad de D-003 que se cerró para siempre: los glyphs del mapa y las
    // seis familias de la interfaz salen del propio origen. Si alguien vuelve a
    // pegar un host acá, este test cae aunque el basemap siga en Carto.
    expect(directiva('font-src')).toBe("font-src 'self' data:");
  });

  it('el mapa conserva lo que necesita para dibujar', () => {
    // maplibre arma el worker desde un blob y las texturas también; sin esto
    // el mapa queda en blanco y el único aviso es una violación en consola.
    expect(directiva('worker-src')).toContain('blob:');
    expect(directiva('child-src')).toContain('blob:');
    expect(directiva('img-src')).toContain('blob:');
    // maplibre pide las teselas con `fetch`, no con `<img>`: hacen falta las
    // dos directivas. Omitir ésta deja el mapa en blanco sin error de red.
    expect(directiva('connect-src')).toContain("'self'");
    expect(directiva('connect-src')).toContain('https://tiles.basemaps.cartocdn.com');
  });

  it('trae las cabeceras que no son la CSP', () => {
    expect(valor('X-Content-Type-Options')).toBe('nosniff');
    expect(valor('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(valor('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(valor('Cross-Origin-Opener-Policy')).toBe('same-origin');
  });

  it('no declara HSTS, que ya manda Vercel más larga', () => {
    // Producción contesta `max-age=63072000`; la de helmet es la mitad.
    // Escribirla acá sería acortarla creyendo que se la refuerza.
    expect(valor('Strict-Transport-Security')).toBe('');
  });

  it('el documento no pide nada afuera que la CSP vaya a bloquear', () => {
    expect(
      hostsExternosDe(indexHtml),
      'apps/web/index.html volvió a pedir un host de terceros: o se lo trae al origen, o la CSP lo bloquea y el recurso no carga.',
    ).toEqual([]);
  });
});

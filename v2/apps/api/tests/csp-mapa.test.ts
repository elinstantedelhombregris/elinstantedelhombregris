/**
 * La CSP del mapa, que desde el 12/8/2026 no nombra un solo host de afuera.
 *
 * Este archivo empezó fijando lo contrario: que los cinco hosts de Carto
 * estuvieran permitidos, porque permitir sólo `tiles.basemaps.cartocdn.com`
 * dejaba el mapa en blanco —el `tiles.json` apunta las teselas a cuatro hosts
 * más— y un mapa vacío sin error visible es la peor forma de fallar. Ese
 * problema dejó de existir cuando las teselas pasaron a salir de un `.pmtiles`
 * del propio origen (D-003), y el test cambió de bando: ahora lo que fija es
 * que **ninguno de esos hosts vuelva**.
 *
 * No es una formalidad. Cada host de tercero en `img-src`, `connect-src` o
 * `font-src` es la dirección IP de cada persona que abre el mapa, entregada a
 * alguien más — y encima sobre la pantalla donde se miran señales políticas. La
 * política de privacidad ya no lo declara porque ya no pasa; si alguien
 * reintroduce un host acá, el documento pasa a ser falso y esto tiene que
 * romperse antes.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

/** Los que servían el basemap hasta el 12/8/2026. Ninguno puede volver. */
const HOSTS_QUE_SE_FUERON = [
  'tiles.basemaps.cartocdn.com',
  'tiles-a.basemaps.cartocdn.com',
  'tiles-b.basemaps.cartocdn.com',
  'tiles-c.basemaps.cartocdn.com',
  'tiles-d.basemaps.cartocdn.com',
  'fonts.openmaptiles.org',
];

/** Las tres que el mapa usaba para salir a buscar cosas afuera. */
const DIRECTIVAS_DEL_MAPA = ['img-src', 'connect-src', 'font-src'];

describe('CSP del mapa', () => {
  const request = supertest(createApp());

  const csp = async (): Promise<string> => {
    const res = await request.get('/api/health');
    return String(res.headers['content-security-policy'] ?? '');
  };

  const directiva = (politica: string, nombre: string): string =>
    politica
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith(`${nombre} `)) ?? '';

  it('no nombra a ninguno de los seis hosts que servían el basemap', async () => {
    const politica = await csp();
    for (const host of HOSTS_QUE_SE_FUERON) {
      expect(politica, host).not.toContain(host);
    }
  });

  it('las tres directivas del mapa no tienen un solo host externo', async () => {
    const politica = await csp();
    for (const nombre of DIRECTIVAS_DEL_MAPA) {
      const valor = directiva(politica, nombre);
      expect(valor, nombre).not.toBe('');
      // Lo único permitido además de `'self'` son los esquemas que produce la
      // propia app: `data:` para los SVG embebidos y `blob:` para lo que
      // maplibre arma en memoria. Cualquier cosa con un punto es un dominio.
      const permitidos = new Set(["'self'", 'data:', 'blob:']);
      const fuentes = valor.split(/\s+/).slice(1);
      for (const fuente of fuentes) {
        expect(permitidos, `${nombre} → ${fuente}`).toContain(fuente);
      }
    }
  });

  it('sigue sin abrirse a comodines', async () => {
    const politica = await csp();
    expect(politica).not.toContain('*');
    expect(politica).not.toContain("'unsafe-eval'");
    expect(directiva(politica, 'script-src')).toBe("script-src 'self'");
  });

  it('el default sigue siendo self', async () => {
    expect(directiva(await csp(), 'default-src')).toBe("default-src 'self'");
  });
});

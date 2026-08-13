/**
 * La CSP contra los hosts que el mapa realmente usa.
 *
 * El bug que este test fija: la CSP permitía solo
 * `tiles.basemaps.cartocdn.com`, que es donde viven el `tiles.json`, los
 * glyphs y el sprite — pero el `tiles.json` apunta las teselas a CUATRO hosts
 * distintos (`tiles-a` … `tiles-d`). Con esa CSP el estilo cargaba, maplibre
 * inicializaba, y las teselas se bloqueaban: un mapa vacío sin ningún error
 * visible, que es la peor forma de fallar.
 *
 * Se verifica contra la lista de hosts leída del endpoint real de Carto en
 * julio de 2026. Si Carto agrega un `tiles-e`, este test NO lo va a detectar —
 * lo detecta un mapa en blanco. Por eso el comentario de `security.ts` dice de
 * dónde sale la lista.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

/** Los hosts que sirven las teselas vectoriales, según el tiles.json de Carto. */
const HOSTS_DE_TESELAS = [
  'https://tiles-a.basemaps.cartocdn.com',
  'https://tiles-b.basemaps.cartocdn.com',
  'https://tiles-c.basemaps.cartocdn.com',
  'https://tiles-d.basemaps.cartocdn.com',
];

/** El que sirve el tiles.json. */
const HOST_DE_ESTILO = 'https://tiles.basemaps.cartocdn.com';

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

  it('permite los cuatro hosts de teselas en connect-src', async () => {
    const connect = directiva(await csp(), 'connect-src');
    for (const host of HOSTS_DE_TESELAS) {
      expect(connect, host).toContain(host);
    }
  });

  it('permite el host que sirve el tiles.json', async () => {
    const politica = await csp();
    expect(directiva(politica, 'connect-src')).toContain(HOST_DE_ESTILO);
  });

  it('no le pide las tipografías a nadie de afuera', async () => {
    const politica = await csp();
    // Los glyphs viven en /fonts/ del propio origen desde el 12/8/2026. Si este
    // host vuelve a aparecer es que alguien reintrodujo la fuga de IP que la
    // política de privacidad ya no declara.
    expect(politica).not.toContain('openmaptiles.org');
    expect(directiva(politica, 'font-src')).toContain("'self'");
  });

  it('sigue sin abrirse a comodines: los hosts van pinneados uno por uno', async () => {
    const politica = await csp();
    expect(politica).not.toContain('*.cartocdn.com');
    expect(politica).not.toContain("'unsafe-eval'");
    expect(directiva(politica, 'script-src')).toBe("script-src 'self'");
  });

  it('el default sigue siendo self', async () => {
    expect(directiva(await csp(), 'default-src')).toBe("default-src 'self'");
  });
});

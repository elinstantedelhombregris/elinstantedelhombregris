/**
 * El otro lado del lazo de D-048.
 *
 * `packages/shared/src/seguridad/csp.ts` dice ser lo que las dos superficies
 * emiten. De `vercel.json` se ocupa `scripts/build/__tests__/csp-vercel.test.ts`,
 * que compara contra el archivo commiteado. Acá se verifica la otra mitad:
 * que lo que la API contesta de verdad sea esa tabla y no otra cosa.
 *
 * Importa sobre todo por `CABECERAS_DE_SEGURIDAD`, que son valores **de
 * helmet** copiados a mano —nueve son sus defaults y no los configura nadie—.
 * Una copia a mano sin guardia se vuelve mentira sola: alcanza con que una
 * versión de helmet cambie un default para que `vercel.json` siga anunciando el
 * viejo. Si eso pasa, esto se rompe primero.
 */
import '../src/load-env.js';

import { CABECERAS_DE_SEGURIDAD, CSP, serializarCsp } from '@v2/shared/seguridad';
import supertest from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

describe('cabeceras de seguridad de la API', () => {
  const request = supertest(createApp());
  let cabeceras: Record<string, string | string[] | undefined> = {};

  beforeAll(async () => {
    const res = await request.get('/api/health');
    cabeceras = res.headers;
  });

  it('emite exactamente la CSP de la tabla compartida', () => {
    expect(cabeceras['content-security-policy']).toBe(serializarCsp(CSP));
  });

  it('emite las demás cabeceras con los valores que la tabla le promete a vercel.json', () => {
    for (const [nombre, esperado] of Object.entries(CABECERAS_DE_SEGURIDAD)) {
      expect(cabeceras[nombre.toLowerCase()], nombre).toBe(esperado);
    }
  });

  it('la política sigue siendo entera y no la mitad', () => {
    // Con `useDefaults` prendido, helmet agregaba tres directivas que no
    // estaban escritas en ningún archivo nuestro y que `vercel.json` —que no
    // tiene helmet— habría perdido en silencio. Están en la tabla; que sigan.
    const politica = String(cabeceras['content-security-policy'] ?? '');
    for (const directiva of ['frame-ancestors', 'script-src-attr', 'upgrade-insecure-requests']) {
      expect(politica, directiva).toContain(directiva);
    }
  });
});

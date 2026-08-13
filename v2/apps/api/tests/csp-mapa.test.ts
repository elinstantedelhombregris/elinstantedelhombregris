/**
 * La CSP del mapa, y las dos mitades de D-003 que van a velocidades distintas.
 *
 * **La mitad cerrada, y no vuelve:** las tipografías. Los glyphs del mapa salen
 * de `/fonts/` y las seis familias de la interfaz de `/fonts-ui/`, así que
 * `font-src` no tiene un solo host ajeno y no depende de ninguna decisión de
 * infraestructura. `fonts.openmaptiles.org` además nunca sirvió lo que el
 * estilo le pedía —no tiene `Noto Sans Regular` y ante un fontstack desconocido
 * devuelve su home con un 200— así que el mapa estuvo mudo mientras estuvo ahí.
 * Ese host no puede volver por ninguna razón.
 *
 * **La mitad abierta:** el basemap todavía sale de Carto. Las teselas propias
 * están generadas y su estilo listo en `/maps/oscuro-propio.json`; lo único que
 * falta es dónde vive el archivo de 1,2 GB, que no entra en el artefacto de
 * Vercel. Es D-051.
 *
 * Por eso este archivo NO fija «ningún host de afuera», que sería un test que
 * miente. Fija lo que de verdad protege: que el permiso de Carto **no se
 * derrame** a una directiva donde un dominio ajeno es ejecución de código en vez
 * de una imagen, que **no aparezca un segundo host**, y que las tipografías
 * sigan en casa. Cada host de tercero acá es la dirección IP de cada persona que
 * abre el mapa, entregada a alguien más, sobre la pantalla donde se miran
 * señales políticas.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

/**
 * Los que se fueron para siempre. `fonts.openmaptiles.org` encabeza la lista
 * porque además de filtrar la IP servía HTML con un 200 y dejaba el mapa mudo.
 */
const HOSTS_QUE_SE_FUERON = ['fonts.openmaptiles.org', 'fonts.googleapis.com', 'fonts.gstatic.com'];

/** Los cinco del basemap: temporales, y sólo donde las teselas los necesitan. */
const CARTO = /^https:\/\/tiles(-[abcd])?\.basemaps\.cartocdn\.com$/;

/** Las únicas dos directivas donde Carto puede aparecer mientras dure D-051. */
const CON_CARTO = new Set(['img-src', 'connect-src']);

/** Las tres que el mapa usa para salir a buscar cosas afuera. */
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

  it('ninguno de los que se fueron vuelve, en ninguna directiva', async () => {
    const politica = await csp();
    for (const host of HOSTS_QUE_SE_FUERON) {
      expect(politica, host).not.toContain(host);
    }
  });

  it('las tipografías no salen de afuera, y eso ya no depende de nada', async () => {
    // La mitad cerrada de D-003. Si esto cae, la política de privacidad pasa a
    // ser falsa en la frase que dice que las tipografías son propias.
    const valor = directiva(await csp(), 'font-src');
    const fuentes = valor.split(/\s+/).slice(1);
    for (const fuente of fuentes) {
      expect(new Set(["'self'", 'data:']), `font-src → ${fuente}`).toContain(fuente);
    }
  });

  it('Carto es el único de afuera, y sólo en img-src y connect-src', async () => {
    const politica = await csp();
    for (const bruta of politica.split(';')) {
      const [nombre = '', ...fuentes] = bruta.trim().split(/\s+/);
      for (const fuente of fuentes) {
        if (CARTO.test(fuente)) {
          // Que no se derrame: en `script-src` un dominio ajeno es ejecución de
          // código, no una imagen.
          expect(CON_CARTO, `Carto se derramó a ${nombre}`).toContain(nombre);
          continue;
        }
        // Lo único permitido además de `'self'` son los esquemas que produce la
        // propia app: `data:` para los SVG embebidos y `blob:` para lo que
        // maplibre arma en memoria. Cualquier cosa con un punto es un dominio.
        const permitidos = new Set(["'self'", "'none'", "'unsafe-inline'", 'data:', 'blob:']);
        expect(permitidos, `${nombre} → ${fuente}`).toContain(fuente);
      }
    }
  });

  it('las tres directivas del mapa siguen declaradas', async () => {
    const politica = await csp();
    for (const nombre of DIRECTIVAS_DEL_MAPA) {
      expect(directiva(politica, nombre), nombre).not.toBe('');
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

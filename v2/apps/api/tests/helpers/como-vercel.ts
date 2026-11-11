/**
 * Un servidor que le entrega el request a una función igual que el runtime de
 * Node de Vercel: con `req.query` ya puesta **antes** de llamarla.
 *
 * Es una réplica de lo que hace `@vercel/node` 5.9.5 (`addHelpers`,
 * `getQueryParser` y `setLazyProp`), y los dos detalles que importan son
 * deliberados:
 *
 * - el parser **captura la URL al adjuntarse**, no al leerse: si la función
 *   corrige `req.url` después, `req.query` sigue saliendo de la URL vieja;
 * - la propiedad es propia del request, perezosa y `configurable`.
 *
 * Con eso alcanza para que Express no vuelva a calcular la consulta: su
 * middleware sólo lo hace `if (!req.query)`. De ahí salió D-156, y por eso los
 * tests de `apps/api/src/vercel/` pasan por acá en vez de llamar a la app
 * directo: sin esta réplica, el camino de producción no lo recorre nadie.
 */
import { createServer } from 'node:http';

import type { IncomingMessage, RequestListener, Server } from 'node:http';

type ConsultaDeVercel = Record<string, string | string[]>;

function parserDeConsulta({ url = '/' }: IncomingMessage): () => ConsultaDeVercel {
  return () => {
    const consulta: ConsultaDeVercel = {};
    new URL(url, 'http://localhost').searchParams.forEach((valor, clave) => {
      const previo = consulta[clave];
      if (previo === undefined) consulta[clave] = valor;
      else consulta[clave] = Array.isArray(previo) ? [...previo, valor] : [previo, valor];
    });
    return consulta;
  };
}

function propiedadPerezosa(req: IncomingMessage, nombre: string, calcular: () => unknown): void {
  const base = { configurable: true, enumerable: true };
  const fijar = (value: unknown): void => {
    Object.defineProperty(req, nombre, { ...base, writable: true, value });
  };
  Object.defineProperty(req, nombre, {
    ...base,
    get: () => {
      const valor = calcular();
      fijar(valor);
      return valor;
    },
    set: fijar,
  });
}

/** Sirve `funcion` como la serviría Vercel. Se le pasa a `supertest`. */
export function servidorComoVercel(funcion: RequestListener): Server {
  return createServer((req, res) => {
    propiedadPerezosa(req, 'query', parserDeConsulta(req));
    funcion(req, res);
  });
}

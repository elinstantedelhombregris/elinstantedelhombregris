/**
 * El callejero del Estado, servido desde casa.
 *
 *   GET    /api/v1/geo/lugares                              — el árbol territorial
 *   GET    /api/v1/geo/calles                               — el autocompletado
 *   GET    /api/v1/geo/calles/:id                           — una calle, con su marca
 *   GET    /api/v1/geo/paquete/:corrida/localidad/:id       — offline por localidad
 *   GET    /api/v1/geo/paquete/:corrida/departamento/:id    — offline por zona
 *   GET    /api/v1/geo/version                              — la cobertura declarada
 *   DELETE /api/v1/geo/direccion/:tabla/:id?c=<código>      — el olvido de §4.5
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §4.1 a §4.6.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 4.
 *
 * Todos los GET son públicos y sin autenticación: el callejero es dato público y
 * espejarlo es el punto de la spec. El prefijo va VERSIONADO porque esto es
 * contrato entre la web y la app de campo, igual que `/api/v1/civic`.
 */
import { Router, type Router as RouterType } from 'express';

import { HttpError } from '../../middleware/error-handler.js';

import {
  CACHE,
  canonicoDeCalle,
  canonicoDeLugar,
  codigoDeOlvidoValido,
  conCache,
  destinoDelPaquete,
  repositoriosDelCatalogo,
  rutaDelPaquete,
  TABLAS_CON_DIRECCION,
  urlCanonica,
} from './service.js';
import {
  codigoDeOlvidoSchema,
  consultaDeCallesSchema,
  consultaDeLugaresSchema,
  corridaDeRutaSchema,
  idDeRutaSchema,
  olvidoDeDireccionSchema,
} from './validation.js';

import type { FiltroDeLugares } from '@v2/db';

const router: RouterType = Router();

/**
 * `GET /lugares?nivel=&padre=&municipio=&q=&limite=`
 *
 * Caché de 24 h: inmutable entre siembras y con espacio de URLs acotado — los
 * niveles son cinco y los ids son 17.986.
 */
router.get('/lugares', async (req, res, next) => {
  try {
    const consulta = consultaDeLugaresSchema.parse(req.query);
    const { lugares } = repositoriosDelCatalogo();

    const filtro: FiltroDeLugares = { limite: consulta.limite };
    if (consulta.nivel !== undefined) filtro.nivel = consulta.nivel;
    if (consulta.padre !== undefined) filtro.padreId = consulta.padre;
    if (consulta.municipio !== undefined) filtro.municipioId = consulta.municipio;

    if (consulta.q !== undefined) {
      const normalizado = canonicoDeLugar(consulta.q);
      if (normalizado.length === 0) {
        // `q=%` normaliza a la cadena vacía, y una cadena vacía adentro de un
        // `LIKE '%%'` devuelve la tabla entera. Se corta acá y no en la base.
        throw new HttpError(
          400,
          'TEXTO_VACIO',
          'Después de normalizar ese texto no queda nada para buscar.',
        );
      }
      if (normalizado !== consulta.q) {
        // La URL canónica se arma con lo que YA validó Zod, nunca con
        // `req.query` crudo: un `Location` que devuelve lo que entró es cómo se
        // regala un redirect abierto, y además `req.query` puede traer arrays.
        const parametros: Record<string, string | number> = { q: normalizado };
        if (consulta.nivel !== undefined) parametros.nivel = consulta.nivel;
        if (consulta.padre !== undefined) parametros.padre = consulta.padre;
        if (consulta.municipio !== undefined) parametros.municipio = consulta.municipio;
        parametros.limite = consulta.limite;

        conCache(res, CACHE.unDia);
        res.redirect(308, urlCanonica('/api/v1/geo/lugares', parametros));
        return;
      }
      filtro.qNorm = normalizado;
    }

    conCache(res, CACHE.unDia);
    res.json({ data: { lugares: await lugares.listPlaces(filtro) } });
  } catch (err) {
    next(err);
  }
});

/**
 * `GET /calles?localidad|departamento|provincia=&q=&limite=`
 *
 * Caché de 300 s y no de 24 h: el espacio de URLs de una búsqueda por texto es
 * **infinito**, así que un TTL largo no protege nada y le regala a quien quiera
 * un fallo de caché por cada tipeo. El 308 a la forma canónica es la otra mitad
 * de lo mismo: un objeto por consulta real.
 */
router.get('/calles', async (req, res, next) => {
  try {
    const consulta = consultaDeCallesSchema.parse(req.query);
    const { calles } = repositoriosDelCatalogo();

    // La lista de categorías es dato, no literal (§3.3), y la necesitan tanto la
    // normalización como la respuesta. Diez filas o menos.
    const categorias = await calles.listarCategorias();
    const normalizado = canonicoDeCalle(consulta.q, categorias);

    if (normalizado.length > 0 && normalizado !== consulta.q) {
      conCache(res, CACHE.cortita);
      res.redirect(
        308,
        urlCanonica('/api/v1/geo/calles', {
          [consulta.scope.ambito]: consulta.scope.id,
          q: normalizado,
          limite: consulta.limite,
        }),
      );
      return;
    }

    const resultado = await calles.buscarCalles({
      scope: consulta.scope,
      q: consulta.q,
      categorias,
      limite: consulta.limite,
    });

    conCache(res, CACHE.cortita);
    if (resultado.estado === 'consulta_corta') {
      // No es un array vacío: «no miramos» y «miramos y no hay» son cosas
      // distintas, y un `[]` para las dos es el cero que significa «no sé».
      res.json({
        data: {
          estado: 'consulta_corta',
          normalizado: resultado.normalizado,
          minimo: resultado.minimo,
          mensaje: `Escribí al menos ${String(resultado.minimo)} ${
            resultado.minimo === 1 ? 'letra' : 'letras'
          } para buscar en ${etiquetaDelAmbito(consulta.scope.ambito)}.`,
        },
      });
      return;
    }

    res.json({
      data: { estado: 'buscada', normalizado: resultado.normalizado, calles: resultado.calles },
    });
  } catch (err) {
    next(err);
  }
});

const etiquetaDelAmbito = (ambito: 'localidad' | 'departamento' | 'provincia'): string =>
  ambito === 'localidad'
    ? 'una localidad'
    : ambito === 'departamento'
      ? 'un departamento'
      : 'una provincia';

/**
 * `GET /calles/:id`
 *
 * **La única puerta por la que salen las `sin_nombre` y las retiradas**, con su
 * marca: una señal vieja tiene que poder seguir mostrando la dirección que
 * tenía, y por eso el catálogo marca con `vigente_hasta` en vez de borrar.
 */
router.get('/calles/:id', async (req, res, next) => {
  try {
    const { id } = idDeRutaSchema.parse(req.params);
    const { calles } = repositoriosDelCatalogo();
    const calle = await calles.porId(id);

    if (calle === undefined) {
      throw new HttpError(404, 'CALLE_NO_ENCONTRADA', 'No encontramos esa calle en el callejero.');
    }

    conCache(res, CACHE.unDia);
    res.json({ data: { calle } });
  } catch (err) {
    next(err);
  }
});

/**
 * `GET /paquete/:corrida/localidad/:id` y `/departamento/:id`
 *
 * Se sirven `immutable` porque el contenido de una corrida no cambia nunca: una
 * corrida nueva es una URL nueva. De ahí sale la regla que hace honesta esa
 * promesa — **una corrida que no es la vigente da 404 y no el catálogo de hoy
 * con la etiqueta de ayer**. Servir datos nuevos bajo una corrida vieja, con
 * `immutable` encima, congelaría la mentira por un año.
 */
for (const ambito of ['localidad', 'departamento'] as const) {
  router.get(`/paquete/:corrida/${ambito}/:id`, async (req, res, next) => {
    try {
      const { corrida } = corridaDeRutaSchema.parse(req.params);
      const { id } = idDeRutaSchema.parse(req.params);
      const { calles, lugares } = repositoriosDelCatalogo();

      const vigente = await calles.versionVigente();
      if (vigente === undefined) {
        throw new HttpError(
          503,
          'CATALOGO_SIN_SEMBRAR',
          'Todavía no hay un catálogo de calles sembrado.',
        );
      }
      if (vigente.corrida !== corrida) {
        throw new HttpError(
          404,
          'CORRIDA_VIEJA',
          `Esa corrida del catálogo ya no está. La vigente es ${vigente.corrida}.`,
        );
      }

      const ancestros = await lugares.resolveAncestors(id);
      if (ancestros === undefined) {
        throw new HttpError(404, 'LUGAR_NO_ENCONTRADO', 'No encontramos ese lugar.');
      }

      const destino = destinoDelPaquete(ambito, ancestros);
      if (destino.estado === 'sin_paquete') {
        throw new HttpError(404, 'SIN_PAQUETE', destino.razon);
      }
      if (destino.estado === 'redirige') {
        // Un asentamiento no tiene paquete propio: se lo manda al de su
        // localidad ancestro. El 308 —y no servirlo acá— es lo que hace que el
        // edge y el teléfono guarden UN paquete por territorio real, en vez de
        // uno por cada asentamiento que lo pidió.
        conCache(res, CACHE.inmutable);
        res.redirect(308, rutaDelPaquete(corrida, destino.ambito, destino.id));
        return;
      }

      const paquete =
        ambito === 'localidad'
          ? await calles.paqueteDeLocalidad(id, corrida)
          : await calles.paqueteDeDepartamento(id, corrida);

      conCache(res, CACHE.inmutable);
      res.json({ data: { paquete } });
    } catch (err) {
      next(err);
    }
  });
}

/**
 * `GET /version`
 *
 * `no-cache`, y es lo único de este router que lo lleva: son 200 bytes y es lo
 * que le dice al teléfono si su catálogo quedó viejo. Un `max-age` de 24 h acá
 * volvería falsa la promesa del paquete `immutable`.
 *
 * La cobertura se SIRVE, no se calcula: la escribió el seed en la misma
 * transacción que marcó la corrida vigente. Calcularla al vuelo sería un
 * agregado sobre 326.832 filas en un endpoint público.
 *
 * Ese `cobertura.rangoDeAltura` es la razón por la que el endpoint existe. Sin
 * él, alguien lee «en Córdoba nadie confirma alturas» como un dato sobre
 * Córdoba, cuando es un dato sobre el INDEC.
 */
router.get('/version', async (_req, res, next) => {
  // El `no-cache` va ANTES de consultar y no después: si la consulta falla, la
  // respuesta de error tiene que salir igual de fresca. Un fallo cacheado en el
  // único endpoint que dice si el catálogo quedó viejo se pega solo.
  conCache(res, CACHE.ninguna);
  try {
    const { calles } = repositoriosDelCatalogo();
    const vigente = await calles.versionVigente();

    if (vigente === undefined) {
      // No es un 404 y no es un objeto con ceros: es un hecho sobre la base que
      // el teléfono tiene que poder leer para saber que no hay nada que bajar.
      res.json({
        data: {
          catalogo: {
            estado: 'sin_catalogo',
            mensaje: 'Todavía no sembramos el callejero. No hay nada que descargar.',
          },
        },
      });
      return;
    }

    res.json({
      data: {
        catalogo: {
          estado: 'vigente',
          corrida: vigente.corrida,
          fuente: vigente.fuente,
          fechaDeCorte: vigente.fechaDeCorte,
          totales: vigente.totales,
          cobertura: vigente.cobertura,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * `DELETE /direccion/:tabla/:id?c=<código>` — el olvido de §4.5.
 *
 * La regla 9 pide consentimiento comprensible **y revocable**, y sobre el dato
 * más sensible que la plataforma guardó nunca hacen falta las dos mitades. El
 * código es un HMAC del par (tabla, id) contra el secreto del servidor: cero
 * columnas nuevas, sin cuenta, y sólo lo tiene quien recibió el recibo.
 *
 * Es **idempotente**: un segundo pedido con el mismo código sigue siendo válido.
 * Un código ajeno da 403.
 *
 * TODO(Task 11 · migración `0015`, y Task 13 · la ingesta): hoy
 * `TABLAS_CON_DIRECCION` está vacío porque las columnas de dirección todavía no
 * existen en ninguna tabla, así que esta ruta responde 404 a todo. La
 * verificación del código sí es real y está testeada; lo único que falta es la
 * fila del registro y la sentencia de `olvidarDireccion`.
 */
router.delete('/direccion/:tabla/:id', (req, res, next) => {
  try {
    const { tabla, id } = olvidoDeDireccionSchema.parse(req.params);
    const { c } = codigoDeOlvidoSchema.parse(req.query);

    if (!codigoDeOlvidoValido(tabla, id, c)) {
      throw new HttpError(
        403,
        'CODIGO_INVALIDO',
        'Ese código no corresponde a este registro. Fijate en el recibo que te dimos cuando cargaste.',
      );
    }

    const destino = TABLAS_CON_DIRECCION.get(tabla);
    if (destino === undefined) {
      throw new HttpError(404, 'REGISTRO_DESCONOCIDO', 'No conocemos ese registro.');
    }

    throw new HttpError(
      501,
      'OLVIDO_NO_DISPONIBLE',
      'Todavía no podemos borrar direcciones. Escribinos y lo hacemos a mano.',
    );
  } catch (err) {
    next(err);
  }
});

export { router as geoRouter };

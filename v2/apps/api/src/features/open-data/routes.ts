/**
 * Open data HTTP slice — dreams, provinces, aggregations.
 *
 *   GET  /api/open-data/provinces            — 24 Argentine provinces
 *   GET  /api/open-data/dreams               — recent dreams (filters)
 *   POST /api/open-data/dreams               — submit a dream (anon ok)
 *   GET  /api/open-data/dreams/by-province   — count + top categories per province
 */
import { prepareRecordLocation } from '@v2/civic-core';
import { dreams as dreamsTable, DreamsRepository, eq, GeographicRepository, getDb, normalizeProvinceName, SenalesRepository, sql } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { optionalAuthenticate } from '../../middleware/auth.js';
import { anonSubmitRateLimit } from '../../middleware/rate-limit.js';

const router: RouterType = Router();

const submitSchema = z.object({
  body: z.string().trim().min(1, 'Tu sueño no puede estar vacío.').max(2000),
  category: z.string().trim().max(60).optional(),
  /** Either provinceId (preferred) or provinceName (we'll normalize). */
  provinceId: z.number().int().positive().optional(),
  provinceName: z.string().trim().max(120).optional(),
  submittedAs: z.string().trim().max(80).optional(),
  /**
   * La ubicación precisa, cuando quien habla la eligió (D2 — la precisión la
   * elige quien habla, spec 2 §6). Todo opcional: sin esto el envío se comporta
   * exactamente como antes, a nivel provincia, y los 30 segundos no cambian.
   */
  punto: z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .optional(),
  precisionPedida: z.enum(['exact', '100m', '500m', 'neighborhood', 'city', 'province']).optional(),
  /**
   * `locationRole` y `sensitivity` **ya no se aceptan del cuerpo**, y su
   * ausencia acá es el arreglo.
   *
   * Estaban declarados como opcionales y se pasaban tal cual a
   * `prepareRecordLocation`, con default `sensitivity: 'low'`. O sea que un
   * cliente que mandara `{"sensitivity":"low","locationRole":"capture"}`
   * **desactivaba el engrosado de su propio punto** y publicaba coordenada
   * fina: el eje de privacidad entero decidido por quien envía. Es exactamente
   * la puerta que `senales.sensitivity` cierra con su default `'high'`, y que
   * esta ruta dejaba abierta.
   *
   * Zod los descarta en silencio si igual llegan —el objeto no es `strict()`—,
   * que es el comportamiento correcto para un cliente viejo: se ignora lo que
   * pidió y se lo protege de más, en vez de rechazarle el envío.
   */
});

const listQuery = z.object({
  provinceId: z.coerce.number().int().positive().optional(),
  category: z.string().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
});

router.get('/provinces', async (_req, res, next) => {
  try {
    const repo = new GeographicRepository(getDb());
    const provinces = await repo.listProvinces();
    res.json({ data: { provinces } });
  } catch (err) {
    next(err);
  }
});

/**
 * El feed y el mapa de papel — ahora leen `senales`.
 *
 * La RUTA no cambia de nombre y la FORMA de la respuesta tampoco: `body`,
 * `category`, `submittedAs` siguen llamándose igual aunque adentro sean
 * `texto`, `tipo` y `firma`. No es pereza — es que esta ruta la consumen el
 * feed, el mapa SVG y el ticker de la portada, y renombrar el contrato el
 * mismo día que cambia la tabla mezcla dos migraciones. El renombre va
 * después, solo, y con los tres consumidores a la vista.
 *
 * Lo que sí cambia y se nota: `category` ahora trae uno de los NUEVE del canon
 * en vez de uno de los seis viejos, y `clase` viaja al lado para que el color
 * salga de ahí sin que el cliente tenga que derivarlo.
 */
router.get('/dreams', async (req, res, next) => {
  try {
    const filters = listQuery.parse(req.query);
    const repo = new SenalesRepository(getDb());
    /**
     * DOS fuentes, por lo mismo que la capa `voz` del mapa (D-064).
     *
     * `POST /api/open-data/dreams` y `POST /api/v1/civic/capturas` **siguen
     * escribiendo `dreams`**. Cuando esta lista pasó a leer sólo `senales`, el
     * feed y el mapa de papel dejaron de mostrar lo que esas dos rutas cargan —
     * o sea que se podía postear a esta misma ruta y no verlo en su propia
     * lista. Lo cazó `open-data-flows`, que hace exactamente ese viaje de ida y
     * vuelta.
     *
     * Se va cuando las dos ingestas viejas escriban `senales`. Hasta entonces,
     * leer de menos es perder datos que alguien ya cargó.
     */
    const viejoRepo = new DreamsRepository(getDb());
    const viejoOpts: Parameters<typeof viejoRepo.listApproved>[0] = { limit: filters.limit };
    if (filters.provinceId !== undefined) viejoOpts.provinceId = filters.provinceId;
    if (filters.category !== undefined) viejoOpts.category = filters.category;

    const [nuevas, viejas] = await Promise.all([
      repo.listar({
        limite: filters.limit,
        ...(filters.provinceId === undefined ? {} : { provinceId: filters.provinceId }),
        ...(filters.category === undefined ? {} : { tipos: [filters.category] }),
      }),
      viejoRepo.listApproved(viejoOpts),
    ]);

    const items = [
      ...nuevas.map((d) => ({
        id: d.idPublico,
        body: d.texto,
        category: d.tipo,
        clase: d.clase,
        provinceId: d.provinceId,
        submittedAs: d.firma,
        createdAt: d.creadaEn,
        lat: d.lat,
        lng: d.lng,
        precision: d.precision,
      })),
      ...viejas.map((d) => ({
        /**
         * El ordinal se conserva COMO NÚMERO y no se estampa a string.
         *
         * Es el contrato que los consumidores viejos ya tienen: quien posteó a
         * esta misma ruta recibe un `id` numérico en el 201 y después lo busca
         * en esta lista con `===`. Con el id convertido a string, `'123' === 123`
         * es falso y el round-trip se rompe en silencio — lo cazó
         * `open-data-flows`. La lista queda con `id: string | number`, que es
         * honesto: son dos espacios de identidad distintos y uno de ellos es un
         * uuid.
         */
        id: d.id,
        body: d.body,
        category: d.category,
        // Sin clase: estos tipos no son del canon, y darles una sería inventarla.
        clase: null,
        provinceId: d.provinceId,
        submittedAs: d.submittedAs,
        createdAt: d.createdAt,
        // El mapa de conversión también dibuja con honestidad (spec 1 §5):
        // sin la precisión no puede distinguir un punto clavado de una voz que
        // solo sabe su provincia, y volvería al jitter que miente. Son tres
        // columnas más sobre una consulta que ya se hace — el instrumento
        // sigue siendo lo único que se paga aparte.
        lat: d.lat === null ? null : Number(d.lat),
        lng: d.lng === null ? null : Number(d.lng),
        precision: d.precision,
      })),
    ]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, filters.limit);

    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

router.post('/dreams', anonSubmitRateLimit(), optionalAuthenticate, async (req, res, next) => {
  try {
    const input = submitSchema.parse(req.body);
    const dreamsRepo = new DreamsRepository(getDb());
    const geoRepo = new GeographicRepository(getDb());

    let provinceId = input.provinceId;
    if (provinceId === undefined && input.provinceName) {
      const normalized = normalizeProvinceName(input.provinceName);
      const province = await geoRepo.findProvinceByName(normalized);
      if (province) provinceId = province.id;
    }

    const insertArgs: Parameters<typeof dreamsRepo.create>[0] = {
      body: input.body,
      status: 'approved',
    };
    if (req.user) insertArgs.userId = req.user.id;
    if (input.submittedAs !== undefined) insertArgs.submittedAs = input.submittedAs;
    if (input.category !== undefined) insertArgs.category = input.category;
    if (provinceId !== undefined) insertArgs.provinceId = provinceId;

    /**
     * La precisión la decide el servidor, no el cliente (D7 y spec 4 §4). Sin
     * punto, `prepareRecordLocation` devuelve `province` y nada cambia respecto
     * del comportamiento anterior.
     */
    /**
     * Falla CERRADO: `subject` + `high` fijos, no lo que diga el cuerpo.
     *
     * Esta ruta no hace la pregunta de la casa —la hace `/api/v1/civic/senales`,
     * que es la que la web usa hoy—, así que acá el sistema no sabe si el punto
     * habla de la vivienda de alguien. No saber tiene que costar protección de
     * más y no de menos: el default permisivo era un `0` que significaba «no
     * sé» con el valor más peligroso.
     */
    const ubicacion = prepareRecordLocation({
      point: input.punto ?? null,
      requestedPrecision: input.precisionPedida ?? 'province',
      role: 'subject',
      sensitivity: 'high',
      audience: 'collective',
    });
    if (ubicacion.publicPoint) {
      insertArgs.lat = String(ubicacion.publicPoint.lat);
      insertArgs.lng = String(ubicacion.publicPoint.lng);
    }
    insertArgs.precision = ubicacion.publishedPrecision;
    insertArgs.locationRole = 'subject';
    // Fijo, por lo mismo que arriba: esta ruta no sabe de quién es el lugar.
    insertArgs.sensitivity = 'high';

    const dream = await dreamsRepo.create(insertArgs);
    res.status(201).json({
      data: {
        id: dream.id,
        precisionPublicada: ubicacion.publishedPrecision,
        // Cuando el servidor engrosa, quien habló se entera en la misma
        // respuesta — nunca después.
        engrosado: ubicacion.coarsenedBecause,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/dreams/by-province', async (_req, res, next) => {
  try {
    const db = getDb();
    const rows = await db
      .select({
        provinceId: dreamsTable.provinceId,
        count: sql<number>`count(*)::int`,
      })
      .from(dreamsTable)
      .where(eq(dreamsTable.status, 'approved'))
      .groupBy(dreamsTable.provinceId);
    res.json({
      data: {
        byProvince: rows.map((r) => ({
          provinceId: r.provinceId,
          count: r.count,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export { router as openDataRouter };

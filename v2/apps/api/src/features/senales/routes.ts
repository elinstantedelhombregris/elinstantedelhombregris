/**
 * La superficie HTTP de una señal.
 *
 *   POST /api/v1/civic/senales   — el contrato único de ingesta (spec B §4.7)
 *   GET  /api/v1/civic/senales   — la lectura pública, con filtro por clase
 *
 * `origen` sale de la ruta y no del cuerpo. Esta ruta es la de la web, así que
 * escribe `'web'`; la de campo va a colgar de su propio montaje con su propia
 * credencial. Si el cliente pudiera declararlo, un script se diría `campo` y
 * lavaría spam de web como si fuera terreno recorrido.
 */
import {
  brilloDeCelda,
  metodoCuenta,
  UMBRAL_CORROBORACION,
  focoDeNitidez,
  intensidadDeBrillo,
  nitidezDeCelda,
  PROVINCIAS_REF,
} from '@v2/civic-core';
import {
  AdhesionesRepository,
  ConfirmacionesRepository,
  GeographicRepository,
  LuzRepository,
  SenalesRepository,
  getDb,
} from '@v2/db';
import { senalSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { anonSubmitRateLimit } from '../../middleware/rate-limit.js';

import { olvidarActor, ponerCookieDeActor, resolverActor } from './actor.js';
import { barrerRelojes } from './relojes.js';
import { ingerirSenal } from './service.js';
import { confirmacionSchema, consultaDeSenalesSchema, respuestaSchema } from './validation.js';

const router: RouterType = Router();

/**
 * La ingesta.
 *
 * Contesta **201 también al reintento**, con el mismo cuerpo. Un outbox que
 * reintenta hasta ver un 2xx, contra un servidor que le contesta 409 cuando la
 * señal ya estaba, reintenta para siempre — y el `yaExistia` del recibo es lo
 * que le permite al cliente distinguir sin necesidad de un código distinto.
 */
router.post('/senales', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const cuerpo = senalSchema.parse(req.body);

    /**
     * El actor se resuelve ACÁ y no en un endpoint aparte: un round-trip previo
     * agrega un modo de falla —la señal llega, el actor no— que deja filas
     * huérfanas sin que nadie lo note. Si algo sale mal, `actorId` vuelve nulo
     * y la señal se escribe igual: nadie pierde su voz porque el navegador
     * rechace una cookie.
     */
    const actor = await resolverActor(req);
    const recibo = await ingerirSenal(cuerpo, { origen: 'web', actorId: actor.actorId });
    ponerCookieDeActor(res, actor.claveNueva);
    res.status(201).json({ data: recibo });
  } catch (err) {
    next(err);
  }
});

router.get('/senales', async (req, res, next) => {
  try {
    const q = consultaDeSenalesSchema.parse(req.query);
    const repo = new SenalesRepository(getDb());
    const senales = await repo.listar({
      ...(q.clases.length > 0 ? { clases: q.clases } : {}),
      ...(q.tipos.length > 0 ? { tipos: q.tipos } : {}),
      ...(q.provinceId === undefined ? {} : { provinceId: q.provinceId }),
      ...(q.soloConPunto ? { soloConPunto: true } : {}),
      limite: q.limite,
    });
    res.json({ data: { senales } });
  } catch (err) {
    next(err);
  }
});

/** El conteo por clase, para el contador de la portada y la composición. */
router.get('/senales/conteo', async (_req, res, next) => {
  try {
    const repo = new SenalesRepository(getDb());
    const [porClase, total] = await Promise.all([repo.contarPorClase(), repo.total()]);
    res.json({ data: { porClase, total } });
  } catch (err) {
    next(err);
  }
});

router.get('/senales/:idPublico', async (req, res, next) => {
  try {
    const senal = await new SenalesRepository(getDb()).porIdPublico(req.params.idPublico);
    if (senal === null) {
      res.status(404).json({
        error: { code: 'NO_ESTA', message: 'No encontramos esa señal.' },
      });
      return;
    }
    res.json({ data: { senal } });
  } catch (err) {
    next(err);
  }
});

/**
 * Olvidar el actor de este navegador.
 *
 * Borra el hash de la base y la cookie. Después de esto la persona es
 * irrecuperable incluso para el sistema: nadie puede volver a atar esa clave a
 * esa fila. Sus señales quedan, sin dueño — es un archivo público, no se borran
 * porque alguien se vaya.
 */
router.post('/actor/olvidar', async (req, res, next) => {
  try {
    const borrado = await olvidarActor(req, res);
    res.json({ data: { olvidado: borrado } });
  } catch (err) {
    next(err);
  }
});

/* ── La adhesión ──────────────────────────────────────────────────────────── */

/**
 * «Yo también».
 *
 * Necesita actor —hay que saber que dos adhesiones son de dos personas— así que
 * acá sí se crea si no existe, igual que en la ingesta. Un 409 pidiendo que
 * primero se registre sería empujar a alguien a un trámite por el gesto más
 * barato del producto.
 *
 * **No es un voto.** El contador que devuelve no mide quién gana: mide cuánta
 * gente dice que eso también le pasa.
 */
router.post('/senales/:idPublico/adhesion', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const actor = await resolverActor(req);
    if (actor.actorId === null) {
      res.status(503).json({
        error: {
          code: 'SIN_ACTOR',
          message: 'No pudimos guardar el identificador de este navegador. Probá de nuevo.',
        },
      });
      return;
    }
    const id = typeof req.params.idPublico === 'string' ? req.params.idPublico : '';
    const r = await new AdhesionesRepository(getDb()).adherir(id, actor.actorId);
    if (r === null) {
      res.status(404).json({ error: { code: 'NO_ESTA', message: 'No encontramos esa señal.' } });
      return;
    }
    ponerCookieDeActor(res, actor.claveNueva);
    res.status(201).json({ data: r });
  } catch (err) {
    next(err);
  }
});

router.delete('/senales/:idPublico/adhesion', async (req, res, next) => {
  try {
    const actor = await resolverActor(req);
    if (actor.actorId === null) {
      res.json({ data: { total: 0, esNueva: false } });
      return;
    }
    const id = typeof req.params.idPublico === 'string' ? req.params.idPublico : '';
    const r = await new AdhesionesRepository(getDb()).retirar(id, actor.actorId);
    if (r === null) {
      res.status(404).json({ error: { code: 'NO_ESTA', message: 'No encontramos esa señal.' } });
      return;
    }
    res.json({ data: r });
  } catch (err) {
    next(err);
  }
});

/**
 * Responder una pregunta con un hecho.
 *
 * Las dos clases están amarradas por CHECK: una `meta` se responde con un
 * `hecho`, nunca con un deseo. Un sueño no afirma nada del mundo, así que no
 * contesta nada.
 */
router.post('/senales/:idPublico/respuesta', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const cuerpo = respuestaSchema.parse(req.body);
    const actor = await resolverActor(req);
    // Express tipa el param como `string | string[] | undefined` cuando el
    // handler también parsea cuerpo. Es siempre un string acá — la ruta lo
    // declara— pero se estrecha en vez de castear.
    const idPregunta = typeof req.params.idPublico === 'string' ? req.params.idPublico : '';
    const r = await new AdhesionesRepository(getDb()).responder(
      idPregunta,
      cuerpo.senalId,
      actor.actorId,
    );
    if (r === 'noExiste') {
      res.status(404).json({ error: { code: 'NO_ESTA', message: 'Una de las dos señales no existe.' } });
      return;
    }
    if (r === 'claseIncorrecta') {
      res.status(400).json({
        error: {
          code: 'CLASE_INCORRECTA',
          message: 'Una pregunta se responde con un hecho: algo que pasa en el mundo y se puede comprobar.',
        },
      });
      return;
    }
    ponerCookieDeActor(res, actor.claveNueva);
    res.status(201).json({ data: { yaEstaba: r === 'yaEstaba' } });
  } catch (err) {
    next(err);
  }
});

/* ── La luz del país ──────────────────────────────────────────────────────── */

/**
 * Brillo y nitidez, por provincia.
 *
 * Las dos fórmulas viven en `civic-core` y **están escritas y testeadas desde
 * hace tiempo** — lo que faltaba era que la web las pudiera pedir: hasta hoy
 * sólo las consumía la app de campo, sobre la base del propio teléfono. Sin
 * este endpoint, el mapa de la web dibujaba puntos y ningún territorio.
 *
 * La unidad es la PROVINCIA y no una grilla arbitraria. Es una unidad
 * territorial real, tiene población conocida —`PROVINCIAS_REF`, que ya
 * existía— y es el nivel al que trabaja la regla del mandato. Una grilla fina
 * necesita el plan de cobertura y un cron que la recalcule; eso es otra
 * rebanada y no hace falta para que el país se encienda.
 *
 * El conteo lo hace la base y el CÁLCULO lo hace el núcleo. Que estén separados
 * es lo que impide que la web y el teléfono midan distinto la misma cosa.
 */
router.get('/map/luz', async (_req, res, next) => {
  try {
    const [conteos, provincias] = await Promise.all([
      new LuzRepository(getDb()).conteosPorProvincia(),
      new GeographicRepository(getDb()).listProvinces(),
    ]);

    const nombrePorId = new Map(provincias.map((p) => [p.id, p.name]));

    const territorios = conteos.map((c) => {
      const nombre = nombrePorId.get(c.provinceId) ?? null;
      const ref = nombre === null ? undefined : PROVINCIAS_REF[nombre];

      /**
       * `habitantes: null` y no `0` cuando la provincia no está en la tabla de
       * referencia. Un cero acá haría que el brillo dividiera por cero; el null
       * hace que `brilloDeCelda` devuelva `sinDenominador` con su razón, y
       * quien dibuja tiene que elegir el gris de «no sé» — nunca el oscuro, que
       * ya significa «acá no habló nadie».
       */
      const conteo = {
        cellId: `provincia:${String(c.provinceId)}`,
        vocesDistintas: c.vocesDistintas,
        senalesSinActor: c.senalesSinActor,
        verificables: c.verificables,
        confirmaciones: c.confirmaciones,
        habitantes: ref === undefined ? null : ref.pob * 1000,
      };

      const brillo = brilloDeCelda(conteo);
      const nitidez = nitidezDeCelda(conteo);

      return {
        provinceId: c.provinceId,
        provincia: nombre,
        vocesDistintas: c.vocesDistintas,
        senalesSinActor: c.senalesSinActor,
        verificables: c.verificables,
        confirmaciones: c.confirmaciones,
        brillo,
        nitidez,
        intensidad: intensidadDeBrillo(brillo),
        foco: focoDeNitidez(nitidez),
      };
    });

    res.json({ data: { territorios } });
  } catch (err) {
    next(err);
  }
});

/* ── La corroboración ─────────────────────────────────────────────────────── */

const PORQUE: Record<string, { estado: number; mensaje: string }> = {
  noExiste: { estado: 404, mensaje: 'No encontramos esa señal.' },
  noSeVerifica: {
    estado: 409,
    mensaje: 'Esta señal no está pidiendo un segundo par de ojos ahora mismo.',
  },
  esTuya: {
    estado: 409,
    mensaje: 'No podés confirmar tu propia señal. Corroborar es que la mire otra persona.',
  },
  yaConfirmaste: { estado: 409, mensaje: 'Ya la miraste. Una mirada por persona.' },
  sinActor: {
    estado: 503,
    mensaje: 'No pudimos guardar el identificador de este navegador, y sin eso no se puede saber que sos otra persona.',
  },
};

/**
 * El segundo par de ojos.
 *
 * **Dos confirmaciones independientes corroboran un hecho.** El umbral vive en
 * `civic-core` con su razón al lado y se SELLA en cada fila: subirlo a tres
 * mañana no reescribe lo que ya se juzgó con dos.
 *
 * Qué NO compra este endpoint, dicho para no inflar la garantía: la proximidad
 * la declara quien confirma y el servidor no la puede atestar. Falsificar
 * cuesta aparatos, no desplazamiento. Sybil no se impide — se encarece y se
 * declara.
 */
router.post('/senales/:idPublico/confirmacion', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const cuerpo = confirmacionSchema.parse(req.body);
    const actor = await resolverActor(req);
    const id = typeof req.params.idPublico === 'string' ? req.params.idPublico : '';

    const senal = await new SenalesRepository(getDb()).porIdPublico(id);
    /**
     * `cuenta` lo decide el SERVIDOR, no el cuerpo. Y depende de si la señal
     * tiene punto: sin punto la presencia no significa nada —no hay a dónde
     * ir— así que cualquier método salvo `cannot_verify` cuenta. Con punto,
     * sólo los dos que afirman haber estado.
     */
    const hayPunto = senal !== null && senal.lat !== null;
    const cuenta =
      cuerpo.veredicto === 'confirm' && metodoCuenta(cuerpo.metodo as never, hayPunto);

    const r = await new ConfirmacionesRepository(getDb()).confirmar({
      idPublico: id,
      actorId: actor.actorId,
      veredicto: cuerpo.veredicto,
      metodo: cuerpo.metodo,
      proximidad: cuerpo.proximidad,
      cuenta,
      umbral: UMBRAL_CORROBORACION,
      nota: cuerpo.nota,
    });

    if (!r.ok) {
      const porque = PORQUE[r.motivo] ?? { estado: 400, mensaje: 'No se pudo registrar.' };
      res.status(porque.estado).json({
        error: { code: r.motivo.toUpperCase(), message: porque.mensaje },
      });
      return;
    }

    ponerCookieDeActor(res, actor.claveNueva);
    res.status(201).json({ data: r });
  } catch (err) {
    next(err);
  }
});

/** Las confirmaciones de una señal, para su ficha. **Nunca sale quién.** */
router.get('/senales/:idPublico/confirmaciones', async (req, res, next) => {
  try {
    const id = typeof req.params.idPublico === 'string' ? req.params.idPublico : '';
    const confirmaciones = await new ConfirmacionesRepository(getDb()).deSenal(id);
    res.json({ data: { confirmaciones, umbral: UMBRAL_CORROBORACION } });
  } catch (err) {
    next(err);
  }
});

/**
 * El barrido de relojes, disparable por cron.
 *
 * Va protegido por `CRON_SECRET` como el resto de los crons del sistema: es una
 * ruta que ESCRIBE sobre todo el corpus, así que abierta sería un botón para
 * envejecer el país entero.
 */
router.post('/relojes/barrer', async (req, res, next) => {
  try {
    const esperado = process.env.CRON_SECRET;
    const dado = req.get('authorization');
    if (esperado === undefined || esperado === '' || dado !== `Bearer ${esperado}`) {
      res.status(401).json({ error: { code: 'NO_AUTORIZADO', message: 'Esta ruta la corre el cron.' } });
      return;
    }
    res.json({ data: await barrerRelojes() });
  } catch (err) {
    next(err);
  }
});

export { router as senalesRouter };

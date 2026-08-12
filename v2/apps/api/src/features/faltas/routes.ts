/**
 * Lo que falta — la boca HTTP del canal de escucha.
 *
 * Spec: `docs/specs/2026-08-12-lo-que-falta.md` §4.
 *
 *   GET    /api/v1/faltas                — el registro, cronológico, por cursor
 *   GET    /api/v1/faltas/conteos        — cuántas hay por estado
 *   GET    /api/v1/faltas/:idPublico     — una ficha
 *   POST   /api/v1/faltas                — dejar una (anónimo; devuelve la llave)
 *   POST   /api/v1/faltas/:id/firmas     — «me pasa lo mismo» (anónimo, por llave)
 *   DELETE /api/v1/faltas/:idPublico     — retirar la propia (con la llave)
 *   PATCH  /api/v1/faltas/:idPublico     — mover de estado (sólo admin)
 *
 * Lo que **no** hace esta ruta: no reimplementa la máquina de estados. La
 * pregunta «¿se puede pasar de acá a allá, y alcanza la razón que trajo?» se
 * la hace a `transicionValida()` de `@v2/civic-core`, que se prueba sin
 * levantar nada. Acá sólo se traduce el rechazo a un status.
 */
import {
  esEstadoDeFalta,
  ESTADOS_DE_FALTA,
  leerIdPublico,
  ORIGENES_DE_FALTA,
  SUPERFICIES_DE_FALTA,
  transicionValida,
  type EstadoDeFalta,
} from '@v2/civic-core';
import { FaltasRepository, getDb, LIMITE_DE_PAGINA_MAXIMO, type FaltaPublica } from '@v2/db';
import { Router, type RequestHandler, type Router as RouterType } from 'express';
import { z } from 'zod';

import { getConfig } from '../../lib/config.js';
import { authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { anonSubmitRateLimit, dejarFaltaRateLimit } from '../../middleware/rate-limit.js';

const router: RouterType = Router();

const listadoSchema = z.object({
  estado: z.enum(ESTADOS_DE_FALTA).optional(),
  superficie: z.enum(SUPERFICIES_DE_FALTA).optional(),
  origen: z.enum(ORIGENES_DE_FALTA).optional(),
  cursor: z.string().datetime().optional(),
  limite: z.coerce.number().int().min(1).max(LIMITE_DE_PAGINA_MAXIMO).optional(),
});

const encuadreSchema = z.object({
  oeste: z.number().min(-180).max(180),
  sur: z.number().min(-90).max(90),
  este: z.number().min(-180).max(180),
  norte: z.number().min(-90).max(90),
});

/**
 * El contexto es cerrado a propósito: tres campos y nada más. Un `passthrough`
 * acá sería una vía por la que el cliente escribe lo que quiera en una columna
 * que después se publica — que es exactamente cómo `submitted_as` terminó
 * llevando el UUID del teléfono.
 */
const contextoSchema = z
  .object({
    ruta: z.string().trim().max(200).optional(),
    encuadre: encuadreSchema.optional(),
    capa: z.string().trim().max(40).optional(),
  })
  .strict();

const dejarSchema = z.object({
  superficie: z.enum(SUPERFICIES_DE_FALTA, {
    errorMap: () => ({ message: 'Elegí de qué parte de la plataforma estás hablando.' }),
  }),
  titulo: z
    .string()
    .trim()
    .min(3, 'El título necesita al menos tres caracteres.')
    .max(140, 'El título es una línea: máximo 140 caracteres.'),
  cuerpo: z
    .string()
    .trim()
    .min(10, 'Contá un poco más — al menos diez caracteres.')
    .max(4000, 'Máximo 4000 caracteres.'),
  contexto: contextoSchema.optional(),
});

const llaveSchema = z.object({
  llave: z.string().trim().min(16, 'Llave inválida.').max(200, 'Llave inválida.'),
});

const moverSchema = z.object({
  estado: z.enum(ESTADOS_DE_FALTA),
  razon: z.string().trim().max(2000).optional(),
  anotadaComo: z
    .string()
    .trim()
    .regex(/^D-\d{3,6}$/, 'El id de la deuda va como D-0NN.')
    .optional(),
  cierreUrl: z.string().trim().url('El cierre va con una URL.').max(500).optional(),
});

/**
 * Techo de la descarga. Existe para que un registro que crezca sin control no
 * tumbe la función serverless, y **se declara acá y no en silencio**: el día
 * que se toque, la descarga tiene que partirse por fecha y decirlo en la
 * cabecera. Cortar sin avisar sería publicar un registro incompleto que se
 * lee como completo.
 */
const TECHO_DE_DESCARGA = 20_000;

const COLUMNAS_CSV = [
  'idPublico',
  'origen',
  'superficie',
  'estado',
  'severidad',
  'titulo',
  'cuerpo',
  'razon',
  'anotadaComo',
  'cierreUrl',
  'firmas',
  'creadaEn',
  'movidaEn',
] as const;

/**
 * Una celda de CSV. `contexto` no está entre las columnas justamente porque es
 * un objeto: si algún día entra, tiene que entrar serializado a propósito y no
 * caer acá a que `String()` lo convierta en `[object Object]`.
 */
function celda(valor: string | number | null): string {
  if (valor === null) return '';
  const texto = String(valor);
  return /[",\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function aCsv(filas: readonly FaltaPublica[]): string {
  const lineas = [COLUMNAS_CSV.join(',')];
  for (const fila of filas) {
    lineas.push(COLUMNAS_CSV.map((columna) => celda(fila[columna])).join(','));
  }
  return `${lineas.join('\n')}\n`;
}

/** El id público llega por la URL: se valida contra la gramática, no contra la base. */
function exigirIdPublico(valor: unknown): string {
  if (typeof valor !== 'string' || !leerIdPublico(valor)) {
    throw new HttpError(400, 'ID_INVALIDO', 'Ese identificador no tiene forma de falta.');
  }
  return valor.trim().toUpperCase();
}

function exigirAdmin(username: string): void {
  if (!new Set(getConfig().admin.usernames).has(username)) {
    throw new HttpError(403, 'NOT_ADMIN', 'Esta acción requiere permisos de administrador.');
  }
}

router.get('/', async (req, res, next) => {
  try {
    const consulta = listadoSchema.parse(req.query);
    const pagina = await new FaltasRepository(getDb()).listar(consulta);
    res.json({ data: pagina });
  } catch (err) {
    next(err);
  }
});

router.get('/conteos', async (_req, res, next) => {
  try {
    const porEstado = await new FaltasRepository(getDb()).contarPorEstado();
    const total = Object.values(porEstado).reduce((suma, n) => suma + n, 0);
    res.json({ data: { total, porEstado } });
  } catch (err) {
    next(err);
  }
});

/**
 * La descarga. Va **antes** de `/:idPublico` porque `descarga.csv` no tiene
 * forma de id y caería en un 400 en vez de servir el archivo.
 *
 * El registro entero, sin cursor y sin paginar: una descarga que hay que
 * pedir de a cuarenta no es una descarga. Y con las mismas columnas que la
 * API pública — ni la llave, ni su hash, ni el id interno.
 */
router.get('/descarga.csv', descargar('csv'));
router.get('/descarga.jsonl', descargar('jsonl'));

function descargar(formato: 'csv' | 'jsonl'): RequestHandler {
  return async (_req, res, next) => {
    try {
      const repo = new FaltasRepository(getDb());
      const todas: FaltaPublica[] = [];
      let cursor: string | undefined;

      do {
        const pagina = await repo.listar({
          limite: LIMITE_DE_PAGINA_MAXIMO,
          ...(cursor ? { cursor } : {}),
        });
        todas.push(...pagina.faltas);
        cursor = pagina.siguiente ?? undefined;
      } while (cursor && todas.length < TECHO_DE_DESCARGA);

      const esCsv = formato === 'csv';
      res.setHeader(
        'Content-Type',
        esCsv ? 'text/csv; charset=utf-8' : 'application/x-ndjson; charset=utf-8',
      );
      res.setHeader('Content-Disposition', `attachment; filename="lo-que-falta.${formato}"`);
      res.send(esCsv ? aCsv(todas) : todas.map((f) => JSON.stringify(f)).join('\n'));
    } catch (err) {
      next(err);
    }
  };
}


router.get('/:idPublico', async (req, res, next) => {
  try {
    const idPublico = exigirIdPublico(req.params.idPublico);
    const falta = await new FaltasRepository(getDb()).leer(idPublico);
    if (!falta) throw new HttpError(404, 'NO_EXISTE', `No hay ninguna falta ${idPublico}.`);
    res.json({ data: falta });
  } catch (err) {
    next(err);
  }
});

/**
 * Dejar una falta. Anónimo por diseño: no se pide cuenta, no se pide mail, no
 * se guarda user-agent y la IP sólo la ve el freno de cadencia, en memoria.
 *
 * La llave vuelve **una sola vez** — el servidor guarda su SHA-256. Quien la
 * pierde pierde el hilo, y ése es el precio explícito de no guardar nada.
 */
router.post('/', anonSubmitRateLimit(), dejarFaltaRateLimit(), async (req, res, next) => {
  try {
    const input = dejarSchema.parse(req.body);
    const dejada = await new FaltasRepository(getDb()).dejar(input);
    res.status(201).json({
      data: {
        idPublico: dejada.idPublico,
        url: `/lo-que-falta/${dejada.idPublico}`,
        llave: dejada.llave,
      },
    });
  } catch (err) {
    next(err);
  }
});

/** «Me pasa lo mismo.» Una por llave por falta; el número no reordena nada. */
router.post('/:idPublico/firmas', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const idPublico = exigirIdPublico(req.params.idPublico);
    const { llave } = llaveSchema.parse(req.body);
    const repo = new FaltasRepository(getDb());

    const estado = await repo.estadoDe(idPublico);
    if (!estado) throw new HttpError(404, 'NO_EXISTE', `No hay ninguna falta ${idPublico}.`);
    if (estado === 'bajada') {
      throw new HttpError(409, 'FALTA_BAJADA', 'Esa falta se bajó y no se firma.');
    }

    const { firmas, nueva } = await repo.firmar(idPublico, llave);
    res.status(nueva ? 201 : 200).json({ data: { firmas, nueva } });
  } catch (err) {
    next(err);
  }
});

/**
 * Retirar lo propio. No borra la fila: la baja, que es lo mismo que hace la
 * moderación (§2.2). Queda el número, la fecha y el motivo.
 */
router.delete('/:idPublico', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const idPublico = exigirIdPublico(req.params.idPublico);
    const { llave } = llaveSchema.parse(req.body);
    const repo = new FaltasRepository(getDb());

    const estado = await repo.estadoDe(idPublico);
    if (!estado) throw new HttpError(404, 'NO_EXISTE', `No hay ninguna falta ${idPublico}.`);
    if (!(await repo.llaveCoincide(idPublico, llave))) {
      throw new HttpError(403, 'LLAVE_INVALIDA', 'Esa llave no es la de esta falta.');
    }

    exigirTransicion(estado, 'bajada', { razon: 'retirada por quien la dejó' });
    const falta = await repo.mover(idPublico, 'bajada', { razon: 'retirada por quien la dejó' });
    res.json({ data: falta });
  } catch (err) {
    next(err);
  }
});

/**
 * Mover de estado. Sólo admin, y **sólo después de que la función pura diga
 * que sí**: el `no va` sin razón muere acá con un 400 y un mensaje que dice
 * qué falta, no con un 500 del CHECK de la base.
 */
router.patch('/:idPublico', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'NO_AUTH', 'Ingresá para hacer eso.');
    exigirAdmin(req.user.username);

    const idPublico = exigirIdPublico(req.params.idPublico);
    const patch = moverSchema.parse(req.body);
    const repo = new FaltasRepository(getDb());

    const actual = await repo.estadoDe(idPublico);
    if (!actual) throw new HttpError(404, 'NO_EXISTE', `No hay ninguna falta ${idPublico}.`);

    exigirTransicion(actual, patch.estado, patch);
    const falta = await repo.mover(idPublico, patch.estado, patch);
    res.json({ data: falta });
  } catch (err) {
    next(err);
  }
});

/** Traduce el rechazo de la función pura a un status, sin reescribir la regla. */
function exigirTransicion(
  desde: EstadoDeFalta,
  hacia: EstadoDeFalta,
  patch: { razon?: string | undefined },
): void {
  if (!esEstadoDeFalta(hacia)) {
    throw new HttpError(400, 'ESTADO_DESCONOCIDO', 'Ese estado no existe.');
  }
  const veredicto = transicionValida(desde, hacia, patch);
  if (veredicto.ok) return;
  const status = veredicto.codigo === 'RAZON_REQUERIDA' ? 400 : 409;
  throw new HttpError(status, veredicto.codigo, veredicto.mensaje);
}

export { router as faltasRouter };

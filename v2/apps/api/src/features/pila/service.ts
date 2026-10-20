/**
 * Mirar — lo que hay entre la ruta y el repositorio (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §4; plan de la entrega 1, tarea 6).
 *
 * La región de quien opina se deriva acá, de la provincia, con `regionDe` de
 * civic-core: el cliente manda la provincia y nunca la región. Los techos por
 * persona se cuentan en la base (`PilaRepository.actividadReciente`), no en
 * memoria: la API corre serverless y un contador de proceso se resetea solo.
 */
import { armarTanda, esRegion, regionDe, type Region } from '@v2/civic-core';
import { ImpulsoRepository, PilaGestionRepository, PilaRepository, getDb } from '@v2/db';

import { getConfig } from '../../lib/config.js';
import { logger } from '../../lib/logger.js';
import { HttpError } from '../../middleware/error-handler.js';

import type {
  MotivoDeReporte,
  ResultadoOpinion,
  TandaPila,
  TarjetaPila,
  ValorDeOpinion,
} from '@v2/shared';

/** Los techos por persona. La IP tiene el suyo, más alto (`pilaRateLimit`). */
export const TECHOS = { opinionesPorHora: 300, tandasPorHora: 60, reportesPorDia: 30 } as const;

const NO_ESTA = () => new HttpError(404, 'NO_ESTA', 'Ese aporte no está para mirar.');

export interface QuienMira {
  actorId: number;
  userId: number | null;
}

/** La campaña que se mira, por su slug. 404 si no existe o no se está mirando. */
export async function campanaParaMirar(slug: string): Promise<string> {
  const campana = await new PilaRepository(getDb()).campanaParaMirar(slug);
  if (!campana)
    throw new HttpError(
      404,
      'CAMPANA_NO_DISPONIBLE',
      'Esa campaña no está abierta para mirar aportes. Fijate en las campañas que siguen en curso.',
    );
  return campana.id;
}

/**
 * Una tanda: el estado de quien mira, los candidatos, el orden de `armarTanda`
 * y el registro de lo que se le muestra. `priorizarRegion` sólo se honra si es la
 * región de quien mira (llega desde «Completar los de tu región»).
 */
export async function pedirTanda(
  campanaId: string,
  quien: QuienMira,
  priorizarRegion: string | undefined,
): Promise<TandaPila> {
  const repo = new PilaRepository(getDb());
  if ((await repo.actividadReciente(quien.actorId)).tandas >= TECHOS.tandasPorHora)
    throw new HttpError(
      429,
      'RATE_LIMITED',
      'Ya miraste muchas tandas en esta hora. Tomate un rato y volvé: los aportes no se van a ningún lado.',
    );
  const estado = await repo.estadoDelActor(campanaId, quien.actorId, quien.userId);
  const provinciaIso = estado.provincia?.iso ?? null;
  const region = regionDe(provinciaIso);
  const candidatos = await repo.candidatos({ campanaId, ...quien, region });
  const prioridad: Region | null =
    esRegion(priorizarRegion) && priorizarRegion === region ? region : null;
  const elegidos = armarTanda(
    candidatos.map((c) => ({
      id: c.id,
      respuestas: c.respuestas,
      opinionesDeMiRegion: c.opinionesDeMiRegion,
      publicadaEn: c.publicadaEn,
      tema: c.tema?.clave ?? null,
      provinciaIso: c.provincia?.iso ?? null,
    })),
    { provinciaIso, priorizarRegion: prioridad },
  );
  await repo.registrarExposicion(elegidos, quien.actorId, quien.userId);
  const porId = new Map(candidatos.map((c) => [c.id, c]));
  const tarjetas = elegidos.flatMap((id): TarjetaPila[] => {
    const c = porId.get(id);
    if (!c) return [];
    return [
      {
        id: c.id,
        texto: c.texto,
        origen: c.origen,
        provincia: c.provincia === null ? null : { id: c.provincia.id, nombre: c.provincia.nombre },
        tema: c.tema,
      },
    ];
  });
  return {
    tarjetas,
    estado: {
      provincia:
        estado.provincia === null
          ? null
          : { id: estado.provincia.id, nombre: estado.provincia.nombre },
      preguntarProvincia: estado.provincia === null && !estado.yaPregunto,
      yaAporto: estado.yaAporto,
      paresComparados: estado.paresComparados,
      acuerdos: estado.acuerdos,
    },
  };
}

/**
 * Guardar una opinión. Devuelve también cuántas respuestas lleva el actor, para
 * que la ruta acredite el impulso de una campaña con la quinta.
 */
export async function opinar(
  idPublico: string,
  quien: QuienMira,
  valor: ValorDeOpinion,
  provinciaId: number | null,
): Promise<{ resultado: ResultadoOpinion; respuestasDelActor: number }> {
  const repo = new PilaRepository(getDb());
  let region: Region | null = null;
  if (provinciaId !== null) {
    const provincia = await repo.provincia(provinciaId);
    if (!provincia)
      throw new HttpError(
        400,
        'PROVINCIA_DESCONOCIDA',
        'Elegí una provincia de la lista, o «Prefiero no decirlo».',
      );
    region = regionDe(provincia.iso);
  }
  if ((await repo.actividadReciente(quien.actorId)).opiniones >= TECHOS.opinionesPorHora)
    throw new HttpError(
      429,
      'RATE_LIMITED',
      'Respondiste muchos aportes en esta hora. Tomate un rato y volvé: los aportes no se van a ningún lado.',
    );
  const r = await repo.opinar({ idPublico, ...quien, valor, provinciaId, region });
  if (!r) throw NO_ESTA();
  return {
    resultado: {
      coinciden: r.coinciden,
      regionCompleta: r.regionCompleta && region !== null ? { region } : null,
    },
    respuestasDelActor: r.respuestasDelActor,
  };
}

/** ¿Cuál va primero? 404 si no corresponde, sin decir por qué. */
export async function comparar(
  par: { a: string; b: string; primero: string | null },
  quien: QuienMira,
): Promise<void> {
  if (!(await new PilaRepository(getDb()).comparar({ ...par, ...quien }))) throw NO_ESTA();
}

/**
 * Un reporte. La API no cuenta nada de lo que pasó: ni si contó, ni si con él el
 * aporte salió. Lo que pasó lo sabe la coordinación, por los avisos.
 */
export async function reportar(
  idPublico: string,
  quien: QuienMira,
  motivo: MotivoDeReporte,
): Promise<void> {
  const db = getDb();
  if (
    (await new PilaRepository(db).actividadReciente(quien.actorId)).reportes >=
    TECHOS.reportesPorDia
  )
    throw new HttpError(
      429,
      'RATE_LIMITED',
      'Ya mandaste muchos reportes hoy. Mañana vas a poder mandar más.',
    );
  const r = await new PilaGestionRepository(db).reportar({ idPublico, ...quien, motivo });
  if (!r) throw NO_ESTA();
  if (!r.retenido && !r.primerReporteDeDatos) return;
  try {
    const impulso = new ImpulsoRepository(db);
    const admins = await impulso.idsDe(getConfig().admin.usernames);
    if (r.retenido)
      await impulso.avisar(
        admins,
        `pila:retenido:${idPublico}`,
        'Un aporte salió de Mirar por reportes',
        '/gestion/pila',
      );
    if (r.primerReporteDeDatos)
      await impulso.avisar(
        admins,
        `pila:datos:${idPublico}`,
        'Reportaron datos personales en un aporte',
        '/gestion/pila',
      );
  } catch (err) {
    // El reporte ya quedó: un aviso que falla no lo deshace.
    logger.warn({ err }, 'no se pudo avisar a la coordinación de un reporte');
  }
}

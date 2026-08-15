/**
 * AdhesionesRepository — «yo también», y responder una pregunta.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §2.9 y §3.4/§3.5.
 *
 * ## Por qué la adhesión importa más de lo que parece
 *
 * Es **el gesto más barato y el que más gente va a hacer**. Escribir una señal
 * pide tiempo, teclado y ganas; apretar «yo también» pide un segundo. Si la
 * adhesión no moviera el brillo, el mapa terminaría midiendo a quien tuvo tiempo
 * de escribir y no a quien está — y la palanca principal del producto no
 * aparecería en el único canal visual que mide participación.
 *
 * Por eso **una adhesión enciende la celda de la señal que apoya**, no la de
 * quien adhiere: el adherente no tiene punto propio, y contarlo donde está él
 * pintaría el mapa con la geografía de quien mira en vez de la de lo que pasa.
 *
 * ## Lo que una adhesión NO es
 *
 * No es un voto y no es un acuerdo. Nadie está midiendo quién gana. Un `deseo`
 * con mil adhesiones sigue siendo un deseo sin deliberar — la deliberación es
 * otra máquina y **no está construida**. Confundir las dos cosas es exactamente
 * lo que la regla 11 prohíbe, y por eso la pantalla lo dice con esas palabras
 * en vez de mostrar un contador que se lea como un resultado.
 */
import { and, eq, inArray, sql } from 'drizzle-orm';

import { adhesiones, respuestas } from '../schema/adhesiones.js';
import { senales } from '../schema/senales.js';

import type { Db } from '../client.js';

export interface ResultadoDeAdhesion {
  readonly total: number;
  /** `false` cuando ya había adherido: la segunda vez no suma y no es un error. */
  readonly esNueva: boolean;
}

export class AdhesionesRepository {
  constructor(private readonly db: Db) {}

  /**
   * Adherir a una señal por su id público.
   *
   * Idempotente por clave primaria `(senal_id, actor_id)`: apretar dos veces es
   * la misma adhesión, no dos. Devuelve el total actualizado para que la
   * pantalla no tenga que pedirlo aparte.
   */
  async adherir(idPublico: string, actorId: number): Promise<ResultadoDeAdhesion | null> {
    const [senal] = await this.db
      .select({ id: senales.id })
      .from(senales)
      .where(and(eq(senales.idPublico, idPublico), sql`${senales.retenidaEn} is null`))
      .limit(1);
    if (senal === undefined) return null;

    const escritas = await this.db
      .insert(adhesiones)
      .values({ senalId: senal.id, actorId })
      .onConflictDoNothing()
      .returning({ senalId: adhesiones.senalId });

    return { total: await this.contar(senal.id), esNueva: escritas.length > 0 };
  }

  /** Retirar la adhesión. Lo mismo al revés, y también idempotente. */
  async retirar(idPublico: string, actorId: number): Promise<ResultadoDeAdhesion | null> {
    const [senal] = await this.db
      .select({ id: senales.id })
      .from(senales)
      .where(eq(senales.idPublico, idPublico))
      .limit(1);
    if (senal === undefined) return null;

    const borradas = await this.db
      .delete(adhesiones)
      .where(and(eq(adhesiones.senalId, senal.id), eq(adhesiones.actorId, actorId)))
      .returning({ senalId: adhesiones.senalId });

    return { total: await this.contar(senal.id), esNueva: borradas.length > 0 };
  }

  private async contar(senalId: number): Promise<number> {
    const [fila] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(adhesiones)
      .where(eq(adhesiones.senalId, senalId));
    return fila?.n ?? 0;
  }

  /**
   * Cuántas adhesiones tiene cada señal de una lista, y si este actor adhirió.
   *
   * Una consulta para toda la página y no una por fila: el feed muestra veinte
   * señales, y veinte round-trips por pintar un contador es cómo una lista
   * simple se vuelve lenta sin que nadie sepa por qué.
   */
  async porSenales(
    idsPublicos: readonly string[],
    actorId: number | null,
  ): Promise<Map<string, { total: number; mia: boolean }>> {
    if (idsPublicos.length === 0) return new Map();

    const filas = await this.db
      .select({
        idPublico: senales.idPublico,
        total: sql<number>`count(${adhesiones.actorId})::int`,
        mia: sql<boolean>`bool_or(${adhesiones.actorId} = ${actorId ?? -1})`,
      })
      .from(senales)
      .leftJoin(adhesiones, eq(adhesiones.senalId, senales.id))
      .where(inArray(senales.idPublico, [...idsPublicos]))
      .groupBy(senales.idPublico);

    return new Map(filas.map((f) => [f.idPublico, { total: f.total, mia: f.mia === true }]));
  }

  /**
   * Responder una pregunta con un hecho.
   *
   * Los dos CHECK de la tabla amarran las clases: la pregunta tiene que ser
   * `meta` y la respuesta tiene que ser `hecho`. No se puede contestar una
   * pregunta con un sueño — un deseo no afirma nada del mundo, así que no
   * responde nada.
   */
  async responder(
    idPregunta: string,
    idRespuesta: string,
    actorId: number | null,
  ): Promise<'ok' | 'noExiste' | 'claseIncorrecta' | 'yaEstaba'> {
    const filas = await this.db
      .select({ idPublico: senales.idPublico, id: senales.id, clase: senales.clase })
      .from(senales)
      .where(inArray(senales.idPublico, [idPregunta, idRespuesta]));

    const pregunta = filas.find((f) => f.idPublico === idPregunta);
    const respuesta = filas.find((f) => f.idPublico === idRespuesta);
    if (pregunta === undefined || respuesta === undefined) return 'noExiste';
    if (pregunta.clase !== 'meta' || respuesta.clase !== 'hecho') return 'claseIncorrecta';

    const escritas = await this.db
      .insert(respuestas)
      .values({
        preguntaId: pregunta.id,
        preguntaClase: 'meta',
        senalId: respuesta.id,
        senalClase: 'hecho',
        actorId,
      })
      .onConflictDoNothing()
      .returning({ preguntaId: respuestas.preguntaId });

    return escritas.length > 0 ? 'ok' : 'yaEstaba';
  }

  /** Las respuestas de una pregunta, por id público. */
  async respuestasDe(idPregunta: string): Promise<string[]> {
    const filas = await this.db
      .select({ idPublico: senales.idPublico })
      .from(respuestas)
      .innerJoin(senales, eq(senales.id, respuestas.senalId))
      .where(
        sql`${respuestas.preguntaId} = (select id from senales where id_publico = ${idPregunta})`,
      );
    return filas.map((f) => f.idPublico);
  }
}

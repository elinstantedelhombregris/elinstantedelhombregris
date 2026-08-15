/**
 * ActoresRepository — contar personas y no clicks.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §2.10 y §3.2.
 *
 * ## Qué guarda, y qué deliberadamente no
 *
 * Un actor es **un identificador al azar que vive en el navegador de una
 * persona**, y de este lado sólo queda su HMAC. No hay fingerprinting, no hay
 * IP, no hay user-agent: lo único que la base sabe es que dos señales llegaron
 * con la misma clave, que es exactamente lo que hace falta para no contar dos
 * veces a la misma persona y nada más.
 *
 * `actor_hash` **nunca sale a una respuesta**. La clave la tiene sólo el
 * navegador; el servidor no la puede reconstruir. Eso hace que el retiro sea
 * real: al borrar el hash, la fila queda sin forma de volver a asociarse con
 * nadie —ni siquiera con quien la creó— y las señales que escribió siguen
 * existiendo, huérfanas, como corresponde a un archivo público.
 *
 * ## Por qué el actor es NULLABLE en `senales` y esto igual importa
 *
 * Si el navegador rechaza la cookie, la señal **existe igual**: se escribe con
 * `actor_id` en nulo y se cuenta aparte, en `senalesSinActor`. Lo que no puede
 * es entrar al circuito de corroboración —nadie sabe quién la escribió, así que
 * no se puede saber si quien la confirma es otra persona— ni sumar al numerador
 * del brillo, que cuenta *personas distintas*.
 */
import { and, eq, isNull, sql } from 'drizzle-orm';

import { actores } from '../schema/actores.js';

import type { Db } from '../client.js';

export interface ActorVivo {
  readonly id: number;
  readonly origen: string;
  readonly esNuevo: boolean;
}

export class ActoresRepository {
  constructor(private readonly db: Db) {}

  /**
   * Resolver un actor por su hash, o crearlo si es la primera vez.
   *
   * Va en dos sentencias y no en una, y la razón es el `UNIQUE` parcial: el
   * `on conflict` necesita un índice que cubra exactamente la condición, y
   * `actores_actor_hash_unique` es sobre una columna nullable — un `NULL` no
   * colisiona con otro `NULL`, así que dos retirados no se pisan, que es lo
   * correcto, pero también significa que el `DO NOTHING` no sirve de candado
   * para el caso vivo. Se hace SELECT y después INSERT, y si dos requests
   * empatan, el `UNIQUE` frena a la segunda y se relee.
   */
  async resolverOCrear(hash: Buffer, origen: 'web' | 'campo'): Promise<ActorVivo> {
    const previo = await this.porHash(hash);
    if (previo !== null) return { ...previo, esNuevo: false };

    try {
      const [creado] = await this.db
        .insert(actores)
        .values({ actorHash: hash, origen, primerEventoEn: new Date() })
        .returning({ id: actores.id, origen: actores.origen });
      if (creado !== undefined) return { ...creado, esNuevo: true };
    } catch {
      // Perdió la carrera contra otra request con la misma clave: la fila
      // existe y es la misma persona. Releer es la respuesta correcta.
    }

    const releido = await this.porHash(hash);
    if (releido === null) {
      throw new Error('El actor no se pudo crear ni encontrar. Algo lo borró entre las dos sentencias.');
    }
    return { ...releido, esNuevo: false };
  }

  /** `null` si no existe o si fue retirado — un retirado no tiene hash. */
  async porHash(hash: Buffer): Promise<{ id: number; origen: string } | null> {
    const [fila] = await this.db
      .select({ id: actores.id, origen: actores.origen })
      .from(actores)
      .where(and(eq(actores.actorHash, hash), isNull(actores.retiradoEn)))
      .limit(1);
    return fila ?? null;
  }

  /**
   * Retirar: borra el hash y deja la fila.
   *
   * El CHECK `actores_retiro_chk` amarra las dos cosas —`(retirado_en is null)
   * = (actor_hash is not null)`— así que van juntas o la base rechaza. Después
   * de esto, la persona es irrecuperable **incluso para el sistema**: nadie
   * puede volver a atar esa clave a esta fila. Sus señales quedan, sin dueño.
   */
  async retirar(hash: Buffer): Promise<boolean> {
    const filas = await this.db
      .update(actores)
      .set({ actorHash: null, retiradoEn: new Date() })
      .where(and(eq(actores.actorHash, hash), isNull(actores.retiradoEn)))
      .returning({ id: actores.id });
    return filas.length > 0;
  }

  /**
   * Atar un actor seudónimo a una cuenta.
   *
   * Es la única migración de identidad que existe y va en un solo sentido: de
   * seudónimo a cuenta, nunca al revés. El unique parcial `actores_user_unico`
   * impide que una misma cuenta acumule actores y lave su propia participación.
   */
  async atarACuenta(hash: Buffer, userId: number): Promise<boolean> {
    const filas = await this.db
      .update(actores)
      .set({ userId })
      .where(and(eq(actores.actorHash, hash), isNull(actores.retiradoEn), isNull(actores.userId)))
      .returning({ id: actores.id });
    return filas.length > 0;
  }

  async total(): Promise<number> {
    const [fila] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(actores)
      .where(isNull(actores.retiradoEn));
    return fila?.n ?? 0;
  }
}

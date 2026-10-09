/**
 * La siembra de la campaña nacional, contra la base que le pasen.
 *
 * No elige base, no lee el entorno y no imprime: eso es de la línea de comandos
 * (`../seed-campana-nacional.ts`). Acá están las decisiones que sí importan y
 * que un test de integración afirma contra Postgres:
 *
 *   1. El responsable tiene que ser UNA cuenta activa con el correo verificado;
 *      si no, se corta antes de leer nada más.
 *   2. Si la campaña ya existe y es de esa cuenta, no se toca (ni el contrato,
 *      que pudo haberse editado a propósito). Si es de otra, se corta.
 *   3. Si no existe, nace en un solo enunciado SQL —campaña y edición juntas—,
 *      así que no queda una sin la otra. `on conflict (slug) do nothing` cubre
 *      la carrera de dos corridas a la vez; después se vuelve a leer.
 *
 * Nace en `revision 1` y `abierta`, sin pasar por borrador: la edición 1 que se
 * escribe es la que ya recibe aportes (un aporte entra solo si su edición es la
 * revisión vigente y la campaña está abierta).
 */
import { sql } from 'drizzle-orm';

import {
  ID_LOCAL_CAMPANA_NACIONAL,
  MOTIVO_APERTURA_NACIONAL,
  SLUG_CAMPANA_NACIONAL,
  construirContratoNacional,
} from './contrato.js';

import type { Db } from '../../src/client.js';
import type { ContratoCampana } from '@v2/shared';

/** Un corte esperado, con el mensaje que se le muestra a quien corrió el script. */
export class ErrorDeSiembra extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeSiembra';
  }
}

export interface Responsable {
  id: number;
  username: string;
}

export async function resolverResponsable(db: Db, username: string): Promise<Responsable> {
  const r = await db.execute<{
    id: number;
    username: string;
    is_active: boolean;
    email_verified: boolean;
  }>(sql`select id, username, is_active, email_verified from users where username = ${username}`);
  if (r.rows.length === 0) {
    throw new ErrorDeSiembra(
      `No existe ninguna cuenta con el usuario «${username}» en esta base. Revisá que sea el nombre de la cuenta en v2.`,
    );
  }
  const cuenta = r.rows[0];
  if (r.rows.length > 1 || !cuenta) {
    throw new ErrorDeSiembra(`Hay más de una cuenta con el usuario «${username}». No se eligió ninguna.`);
  }
  if (!cuenta.is_active) {
    throw new ErrorDeSiembra(`La cuenta «${username}» no está activa.`);
  }
  if (!cuenta.email_verified) {
    throw new ErrorDeSiembra(
      `La cuenta «${username}» no tiene el correo verificado. Quien abre la campaña tiene que poder recibir aviso de ella: verificalo y volvé a correr.`,
    );
  }
  return { id: cuenta.id, username: cuenta.username };
}

type CampanaExistente = {
  id: string;
  creador_id: number;
  revision: number;
  estado: string;
};

async function leerCampana(db: Db, slug: string): Promise<CampanaExistente | undefined> {
  const r = await db.execute<CampanaExistente>(
    sql`select id, creador_id, revision, estado from campanas where slug = ${slug}`,
  );
  return r.rows[0];
}

export type ResultadoSiembra =
  | { resultado: 'a_crear'; contrato: ContratoCampana }
  | { resultado: 'creada'; campanaId: string; contrato: ContratoCampana }
  | { resultado: 'ya_existe'; campanaId: string; revision: number; estado: string };

export interface OpcionesSiembra {
  username: string;
  aplicar: boolean;
  /** El día de hoy en Buenos Aires, `AAAA-MM-DD`. */
  hoy: string;
  /** Solo para las pruebas: las corridas reales usan el slug y el `id_local` fijos. */
  slug?: string;
  idLocal?: string;
}

function resultadoDeExistente(
  existente: CampanaExistente,
  responsable: Responsable,
  slug: string,
): ResultadoSiembra {
  if (existente.creador_id !== responsable.id) {
    throw new ErrorDeSiembra(
      `La campaña «${slug}» ya existe y la abrió otra cuenta (id ${String(existente.creador_id)}), no «${responsable.username}». No se cambió nada.`,
    );
  }
  return {
    resultado: 'ya_existe',
    campanaId: existente.id,
    revision: existente.revision,
    estado: existente.estado,
  };
}

export async function sembrarCampanaNacional(
  db: Db,
  opciones: OpcionesSiembra,
): Promise<ResultadoSiembra> {
  const slug = opciones.slug ?? SLUG_CAMPANA_NACIONAL;
  const idLocal = opciones.idLocal ?? ID_LOCAL_CAMPANA_NACIONAL;
  const responsable = await resolverResponsable(db, opciones.username);

  const existente = await leerCampana(db, slug);
  if (existente) return resultadoDeExistente(existente, responsable, slug);

  // Recién acá: re-correr sobre una campaña ya sembrada no depende de qué día sea.
  const contrato = construirContratoNacional(opciones.hoy);
  if (!opciones.aplicar) return { resultado: 'a_crear', contrato };

  let creada: { campana_id: string } | undefined;
  try {
    const r = await db.execute<{ campana_id: string }>(sql`with nueva as (
      insert into campanas (id_local, creador_id, slug, revision, estado, contrato)
      values (${idLocal}::uuid, ${responsable.id}, ${slug}, 1, 'abierta', ${JSON.stringify(contrato)}::jsonb)
      on conflict (slug) do nothing
      returning id, revision, contrato, estado
    )
    insert into campana_ediciones (campana_id, revision, contrato, estado, motivo)
    select id, revision, contrato, estado, ${MOTIVO_APERTURA_NACIONAL} from nueva
    returning campana_id`);
    creada = r.rows[0];
  } catch (e) {
    if (e instanceof Error && e.message.includes('campanas_envio_unique')) {
      throw new ErrorDeSiembra(
        `La cuenta «${responsable.username}» ya tiene otra campaña con el mismo envío, pero con otro slug. No se cambió nada.`,
      );
    }
    throw e;
  }

  // Se vuelve a leer siempre: si otra corrida ganó la carrera, esta no creó nada.
  const final = await leerCampana(db, slug);
  if (!final) {
    throw new ErrorDeSiembra('La campaña no quedó en la base después de escribirla. Revisá antes de volver a correr.');
  }
  if (creada) {
    if (final.id !== creada.campana_id || final.creador_id !== responsable.id) {
      throw new ErrorDeSiembra('La campaña que quedó en la base no es la que se escribió. Revisá antes de volver a correr.');
    }
    return { resultado: 'creada', campanaId: final.id, contrato };
  }
  return resultadoDeExistente(final, responsable, slug);
}

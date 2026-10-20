/**
 * Los avisos del paso previo (spec 2026-10-19-mi-argentina-ideal-la-pila.md §11), en
 * Mi espacio (`eventos_civicos`). Cada clave es idempotente: repetir el aviso no lo duplica.
 */
import { getConfig } from '../../lib/config.js';

import type { ImpulsoRepository } from '@v2/db';
import type { EstadoCampana } from '@v2/shared';

interface CampanaAvisada {
  id: string;
  slug: string;
  creadorId: number;
}

/** Llegó al umbral: la administración la revisa y quien la impulsa se entera. */
export async function avisarQuePasoARevision(
  repo: ImpulsoRepository,
  campana: CampanaAvisada,
): Promise<void> {
  const admins = await repo.idsDe(getConfig().admin.usernames);
  await repo.avisar(
    admins,
    `impulso:revisar:${campana.id}`,
    'Una campaña juntó la gente que necesitaba y espera tu revisión.',
    '/gestion/campanas',
  );
  await repo.avisar(
    [campana.creadorId],
    `impulso:lista:${campana.id}`,
    'Tu campaña juntó la gente que necesitaba. Ahora la revisa la coordinación.',
    `/campanas/${campana.slug}`,
  );
}

const DECISIONES: Partial<Record<EstadoCampana, string>> = {
  abierta: 'La coordinación abrió tu campaña: ya recibe aportes.',
  programada: 'La coordinación revisó tu campaña y la programó.',
  reuniendo: 'La coordinación te devolvió la campaña con un motivo. Leelo en su historial.',
  pausada: 'La coordinación pausó tu campaña programada.',
};

/**
 * La administración decidió sobre la campaña de otra persona. La clave lleva la revisión
 * nueva: una campaña devuelta dos veces avisa dos veces.
 */
export async function avisarDecision(
  repo: ImpulsoRepository,
  campana: CampanaAvisada & { revision: number },
  estado: EstadoCampana,
): Promise<void> {
  const titulo = DECISIONES[estado];
  if (!titulo) return;
  await repo.avisar(
    [campana.creadorId],
    `impulso:${estado}:${campana.id}:${String(campana.revision)}`,
    titulo,
    `/campanas/${campana.slug}`,
  );
}

import { sql } from 'drizzle-orm';

import { senales } from '../schema/senales.js';

/** La autorización se aplica antes de devolver datos al navegador. */
export const textoDeSenalPublica = sql<string>`case when ${senales.cesionLicencia}
  then ${senales.texto} else 'Texto reservado por su autoría.' end`;
export const tituloDeSenalPublica = sql<string | null>`case when ${senales.cesionLicencia}
  then ${senales.titulo} else null end`;

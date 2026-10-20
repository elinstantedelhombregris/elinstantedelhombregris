import { REGLAS_DE_VISION } from '@v2/civic-core';

import {
  REGION_CORTA,
  fraseDeDistancia,
  fraseMiOpinion,
  lecturaDeRegiones,
  regionesDe,
} from './formato';
import { FilaAporte, Meta, Seccion, Vacio } from './piezas';

import type { AporteEnVision } from '@v2/shared';

import { cn } from '~/lib/utils';

const TOPE = 4;

/** Seis columnas chicas, una por región; rayada donde faltan opiniones. */
export function RegionesMini({ aporte }: { aporte: AporteEnVision }) {
  return (
    <div
      role="img"
      aria-label={lecturaDeRegiones(aporte)}
      className="grid max-w-[360px] grid-cols-6 gap-1"
    >
      {regionesDe(aporte).map((r) => (
        <div
          key={r.region}
          className="font-space text-tinta-50 flex flex-col gap-[3px] text-[9.5px] uppercase tracking-[0.02em]"
        >
          <span
            className={cn(
              'relative block h-[34px]',
              r.acuerdo === null
                ? 'bg-[repeating-linear-gradient(135deg,#ECE8DC_0_4px,transparent_4px_8px)]'
                : 'bg-papel-presionado',
            )}
          >
            {r.acuerdo === null ? null : (
              <i
                className="bg-violeta absolute inset-x-0 bottom-0 block"
                style={{ height: `${Math.round(r.acuerdo * 100)}%` }}
              />
            )}
          </span>
          <span aria-hidden>{REGION_CORTA[r.region]}</span>
        </div>
      ))}
    </div>
  );
}

/** Lo que parte al medio, o lo que en una región se quiere y en otra no. */
export function DondeNoCoincidimos({
  divide,
  enDiscusion,
}: {
  divide: AporteEnVision[];
  enDiscusion: number;
}) {
  const R = REGLAS_DE_VISION;
  return (
    <Seccion
      titulo="Donde no coincidimos"
      bajada="Lo que parte al medio, o lo que en una región se quiere y en otra no."
    >
      {divide.length === 0 ? (
        <Vacio>
          {enDiscusion === 0
            ? `Para saber dónde no coincidimos, un aporte tiene que juntar ${R.MINIMO_OPINIONES} opiniones de por lo menos dos regiones. Todavía ninguno llegó.`
            : 'Por ahora, en lo que se está discutiendo, ningún aporte parte al medio y ninguna región se separa de otra.'}
        </Vacio>
      ) : (
        <ul>
          {divide.slice(0, TOPE).map((a) => {
            const mia = fraseMiOpinion(a.miOpinion);
            return (
              <FilaAporte key={a.id} texto={a.texto}>
                <RegionesMini aporte={a} />
                <Meta>
                  <span>{fraseDeDistancia(a)}</span>
                  {mia ? <span className="text-tinta">{mia}</span> : null}
                </Meta>
              </FilaAporte>
            );
          })}
        </ul>
      )}
    </Seccion>
  );
}

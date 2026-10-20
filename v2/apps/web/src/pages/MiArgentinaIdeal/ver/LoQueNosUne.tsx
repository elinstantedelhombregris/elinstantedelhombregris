import { REGLAS_DE_VISION } from '@v2/civic-core';

import { deCadaDiez, fraseMiOpinion, lecturaDeRegiones, numero, regionesDe } from './formato';
import { FilaAporte, Meta, Seccion, Vacio } from './piezas';
import { SeguiConstruyendo } from './SeguiConstruyendo';

import type { AporteEnVision } from '@v2/shared';

import { cn } from '~/lib/utils';

const TOPE = 6;
const UMBRAL = REGLAS_DE_VISION.ACUERDO_QUE_UNE;

/** El puntito de una región: lleno con acuerdo, vacío sin él, punteado si faltan opiniones. */
export function Punto({ acuerdo }: { acuerdo: number | null }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block h-[11px] w-[11px] shrink-0 rounded-full border-[1.5px]',
        acuerdo === null
          ? 'border-tinta-30 border-dotted'
          : acuerdo >= UMBRAL
            ? 'border-violeta bg-violeta'
            : 'border-tinta-50',
      )}
    />
  );
}

export function Puntos({ aporte }: { aporte: AporteEnVision }) {
  return (
    <span role="img" aria-label={lecturaDeRegiones(aporte)} className="inline-flex gap-[5px]">
      {regionesDe(aporte).map((r) => (
        <Punto key={r.region} acuerdo={r.acuerdo} />
      ))}
    </span>
  );
}

/** La barra del acuerdo general, con la marca del 70 % que pide la regla. */
export function BarraAcuerdo({ acuerdo }: { acuerdo: number }) {
  return (
    <div aria-hidden className="bg-papel-presionado relative h-2">
      <i
        className="bg-violeta absolute inset-y-0 left-0 block"
        style={{ width: `${Math.round(acuerdo * 100)}%` }}
      />
      <i
        className="bg-tinta absolute -bottom-[3px] -top-[3px] block w-[2px]"
        style={{ left: `${UMBRAL * 100}%` }}
      />
    </div>
  );
}

function Leyenda() {
  return (
    <p className="text-tinta-50 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px]">
      <span className="inline-flex items-center gap-[5px]">
        <Punto acuerdo={1} />
        {deCadaDiez(UMBRAL)} de cada 10 o más
      </span>
      <span className="inline-flex items-center gap-[5px]">
        <Punto acuerdo={0} />
        menos
      </span>
      <span className="inline-flex items-center gap-[5px]">
        <Punto acuerdo={null} />
        faltan opiniones
      </span>
      <span>· NOA, NEA, Cuyo, Centro, Bs. As., Patagonia</span>
    </p>
  );
}

function FilaUne({ aporte: a }: { aporte: AporteEnVision }) {
  const mia = fraseMiOpinion(a.miOpinion);
  return (
    <FilaAporte texto={a.texto}>
      <BarraAcuerdo acuerdo={a.acuerdo} />
      <Meta>
        <span>
          {deCadaDiez(a.acuerdo)} de cada 10 que opinaron
          {a.peor === null ? '' : ` · en la región donde menos, ${deCadaDiez(a.peor)}`}
        </span>
      </Meta>
      <Meta>
        <Puntos aporte={a} />
        {a.tema ? <span>{a.tema.etiqueta}</span> : null}
        {mia ? <span className="text-tinta">{mia}</span> : null}
      </Meta>
      <SeguiConstruyendo aporteId={a.id} />
    </FilaAporte>
  );
}

/**
 * Lo que comparte la mayoría en cada región que opinó lo suficiente, no sólo en el total.
 * El orden ya viene del servidor: por la región donde el aporte anda peor.
 */
export function LoQueNosUne({ une, enDiscusion }: { une: AporteEnVision[]; enDiscusion: number }) {
  const R = REGLAS_DE_VISION;
  return (
    <Seccion
      titulo="Lo que nos une"
      bajada="Lo que quiere la mayoría en cada región que opinó lo suficiente, no sólo en el total."
    >
      <p className="text-tinta-50 text-[13.5px]">
        Para estar acá, un aporte tiene que tener al menos {deCadaDiez(UMBRAL)} de cada 10 «yo
        también» en cada región con cinco opiniones o más, y al menos dos regiones así.
      </p>
      {une.length === 0 ? (
        <Vacio>
          {enDiscusion === 0
            ? `Todavía ningún aporte llegó: hace falta que uno junte ${R.MINIMO_OPINIONES} opiniones y que dos regiones lleguen a cinco.`
            : `Hay ${numero(enDiscusion)} ${enDiscusion === 1 ? 'aporte' : 'aportes'} en discusión y ninguno junta ${deCadaDiez(UMBRAL)} de cada 10 en todas las regiones que opinaron.`}
        </Vacio>
      ) : (
        <>
          <Leyenda />
          <ul>
            {une.slice(0, TOPE).map((a) => (
              <FilaUne key={a.id} aporte={a} />
            ))}
          </ul>
          {une.length > TOPE ? (
            <p className="text-tinta-50 text-[13.5px]">
              Y {numero(une.length - TOPE)} más que también cumplen la regla.
            </p>
          ) : null}
        </>
      )}
    </Seccion>
  );
}

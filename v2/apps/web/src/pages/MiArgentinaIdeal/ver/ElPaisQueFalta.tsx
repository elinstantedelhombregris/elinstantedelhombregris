import { DE_REGION, REGIONES, REGLAS_DE_VISION, esRegion } from '@v2/civic-core';

import { MIRAR_HREF, completarHref, frasePersonas, numero } from './formato';
import { MapaPais } from './MapaPais';
import { EnlaceVer, Seccion, Vacio } from './piezas';

import type { RegionEnVision, VisionCampana } from '@v2/shared';

import { EnlaceAccion } from '~/components/participacion/Elementos';
import { cn } from '~/lib/utils';

function FilaRegion({
  region,
  enDiscusion,
  tuya,
}: {
  region: RegionEnVision;
  enDiscusion: number;
  tuya: boolean;
}) {
  const k = Math.min(region.cuentaEn, enDiscusion);
  const ancho = enDiscusion > 0 ? Math.round((k / enDiscusion) * 100) : 0;
  return (
    <li className="border-papel-borde flex flex-col gap-1.5 border-b py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-2.5">
        <h3 className="font-anton text-[19px] font-normal leading-[1.1]">
          {region.region}
          {tuya ? (
            <span className="font-space text-tinta-50 ml-1 text-[11px] font-bold uppercase tracking-[0.12em]">
              · tu región
            </span>
          ) : null}
        </h3>
        <span className="font-space text-tinta-50 text-[11px] font-bold uppercase tabular-nums tracking-[0.12em]">
          {frasePersonas(region.personas)}
        </span>
      </div>
      {enDiscusion > 0 ? (
        <>
          <div aria-hidden className="bg-papel-presionado h-2.5">
            <i
              className={cn('block h-full', tuya ? 'bg-violeta' : 'bg-[#7F8B98]')}
              style={{ width: `${ancho}%` }}
            />
          </div>
          <p className="text-tinta-50 text-[13.5px] tabular-nums">
            Ya cuenta en {numero(k)} de los {numero(enDiscusion)} aportes que se están discutiendo.
          </p>
          {tuya && esRegion(region.region) ? (
            k < enDiscusion ? (
              <EnlaceAccion href={completarHref(region.region)} className="mt-1 justify-center">
                Completar los {DE_REGION[region.region]}
              </EnlaceAccion>
            ) : (
              <p className="text-tinta-75 text-[13.5px]">
                Tu región ya cuenta en todos los que se están discutiendo.
              </p>
            )
          ) : null}
        </>
      ) : null}
    </li>
  );
}

/**
 * Lo único que se rescata de la simulación (spec §5, D4): a partir de cuánta gente cuenta
 * una región, contestado con datos reales y atado al gesto que lo resuelve.
 */
export function ElPaisQueFalta({
  regiones,
  provincias,
  enDiscusion,
  miRegion,
}: Pick<VisionCampana, 'regiones' | 'provincias' | 'enDiscusion' | 'miRegion'>) {
  const R = REGLAS_DE_VISION;
  const ordenadas = REGIONES.map(
    (nombre): RegionEnVision =>
      regiones.find((r) => r.region === nombre) ?? { region: nombre, personas: 0, cuentaEn: 0 },
  );
  return (
    <Seccion
      titulo="El país que falta"
      bajada={
        enDiscusion > 0
          ? `Una región cuenta en un aporte cuando tiene cinco opiniones de ahí. Se están discutiendo ${numero(enDiscusion)} ${enDiscusion === 1 ? 'aporte' : 'aportes'}.`
          : 'Una región cuenta en un aporte cuando tiene cinco opiniones de ahí.'
      }
    >
      <MapaPais provincias={provincias} />
      {enDiscusion === 0 ? (
        <Vacio>
          Un aporte se empieza a discutir cuando junta {R.MINIMO_OPINIONES} opiniones. Cuando el
          primero llegue, acá vas a ver en cuántos cuenta cada región.
        </Vacio>
      ) : null}
      <ul>
        {ordenadas.map((r) => (
          <FilaRegion
            key={r.region}
            region={r}
            enDiscusion={enDiscusion}
            tuya={miRegion === r.region}
          />
        ))}
      </ul>
      {miRegion === null ? (
        <EnlaceVer href={`${MIRAR_HREF}?provincia=elegir`}>
          Contá de qué provincia sos en Mirar, para ver dónde falta tu respuesta →
        </EnlaceVer>
      ) : null}
    </Seccion>
  );
}

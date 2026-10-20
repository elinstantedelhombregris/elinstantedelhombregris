import { useState } from 'react';

import { Pasos } from './comun/Pasos';
import { Cabecera } from './ver/Cabecera';
import { DondeNoCoincidimos } from './ver/DondeNoCoincidimos';
import { ElPaisQueFalta } from './ver/ElPaisQueFalta';
import { EnCadaTema } from './ver/EnCadaTema';
import { LoQueNosUne } from './ver/LoQueNosUne';
import { LoQueRecienLlega } from './ver/LoQueRecienLlega';
import { LoQueVaPrimero } from './ver/LoQueVaPrimero';
import { PieHonesto } from './ver/PieHonesto';
import { Vacio } from './ver/piezas';
import { TuAporte } from './ver/TuAporte';

import type { AporteEnVision, VisionCampana } from '@v2/shared';

import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { ApiError } from '~/lib/api';
import { useVision } from '~/lib/queries/vision';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

/** Todos los aportes que trae la visión, para encontrar el propio entre ellos. */
function aportesDe(v: VisionCampana): AporteEnVision[] {
  return [
    ...v.une,
    ...v.primero,
    ...v.divide,
    ...v.recien,
    ...v.temas.flatMap((t) => (t.aporte ? [t.aporte] : [])),
  ];
}

/**
 * La visión, en el orden de la spec §5. Cada sección se explica sola en cero: dice qué
 * falta para que aparezca algo y ofrece sumar el aporte propio.
 */
export function Vision({ vision: v, ahora }: { vision: VisionCampana; ahora: number }) {
  return (
    <>
      <Cabecera campana={v.campana} cifras={v.cifras} ahora={ahora} />
      {v.tuyo ? <TuAporte tuyo={v.tuyo} aportes={aportesDe(v)} /> : null}
      <LoQueNosUne une={v.une} enDiscusion={v.enDiscusion} />
      <LoQueVaPrimero primero={v.primero} />
      <DondeNoCoincidimos divide={v.divide} enDiscusion={v.enDiscusion} />
      <EnCadaTema temas={v.temas} />
      <ElPaisQueFalta
        regiones={v.regiones}
        provincias={v.provincias}
        enDiscusion={v.enDiscusion}
        miRegion={v.miRegion}
      />
      <LoQueRecienLlega recien={v.recien} />
      <PieHonesto />
    </>
  );
}

function NoLlego({ error, reintentar }: { error: Error; reintentar: () => void }) {
  if (error instanceof ApiError && error.status === 404)
    return (
      <Vacio>
        Mi Argentina ideal todavía no abrió su primera edición. Mientras tanto, podés escribir lo
        que imaginás.
      </Vacio>
    );
  return (
    <div className="flex flex-col items-start gap-3">
      <ErrorOperacion mensaje="No pudimos traer la visión. Puede ser la conexión: probá de nuevo." />
      <BotonAccion tono="papel" onClick={reintentar}>
        Reintentar
      </BotonAccion>
    </div>
  );
}

/** `/mi-argentina-ideal` — Ver: cómo se va armando el país que imaginamos (spec §5). */
export function Ver() {
  useTituloDePagina('Mi Argentina ideal');
  const vision = useVision();
  const [ahora] = useState(() => Date.now());
  return (
    <main className="mx-auto flex w-full max-w-[680px] flex-col gap-9 px-4 pb-16 pt-6 min-[961px]:px-0">
      <Pasos actual="ver" />
      {vision.data ? (
        <Vision vision={vision.data} ahora={ahora} />
      ) : vision.isError ? (
        <NoLlego error={vision.error} reintentar={() => void vision.refetch()} />
      ) : (
        <p role="status" className="font-space text-tinta-50 text-[13px]">
          Juntando lo que se dijo…
        </p>
      )}
    </main>
  );
}

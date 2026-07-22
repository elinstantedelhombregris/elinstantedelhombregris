import { useRoute } from 'wouter';

import { ORIGEN_SENAL } from './ElMandatoVivo/el-mandato-data';
import { humanizarTema } from './ElMandatoVivo/mandato-regimen';
import { CargandoFicha, FichaExtraviada, MarcoAnexo } from './ElMandatoVivo/sections/MarcoAnexo';

import { usePulsoById } from '~/lib/queries/mandato';
import { useProvincias } from '~/lib/queries/open-data';

/**
 * Anexo señal (spec 2.3, «Los anexos») — ficha del expediente de una señal
 * del mandato. Vive dentro de `MarcoAnexo`; el chrome glass del v1-port
 * muere acá.
 */
export function PulsoDetail() {
  const [, params] = useRoute<{ id: string }>('/mandato-vivo/pulso/:id');
  const id = Number(params?.id ?? 0);
  const { data, isLoading, isError } = usePulsoById(id);
  const provincias = useProvincias();

  if (isLoading) {
    return (
      <MarcoAnexo>
        <CargandoFicha />
      </MarcoAnexo>
    );
  }

  if (isError || !data) {
    return (
      <MarcoAnexo>
        <FichaExtraviada titulo="Esa señal no está." />
      </MarcoAnexo>
    );
  }

  const signal = data.signal;
  const fecha = new Date(signal.createdAt).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const provincia =
    signal.provinceId === null
      ? 'Argentina'
      : (provincias.data?.find((p) => p.id === signal.provinceId)?.name ?? 'Argentina');
  const origen = ORIGEN_SENAL[signal.source] ?? signal.source;

  return (
    <MarcoAnexo>
      <p className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]">
        Señal N° {signal.id} · {fecha}
      </p>
      <h1 className="font-archivo mt-3 text-[19px] leading-relaxed">«{signal.body}»</h1>
      <dl className="border-tinta mt-8 flex flex-col gap-3 border-t pt-6">
        <div className="font-space flex gap-2 text-[13px]">
          <dt className="text-tinta-50">tema:</dt>
          <dd>{signal.theme ? humanizarTema(signal.theme) : 'sin clasificar todavía'}</dd>
        </div>
        <div className="font-space flex gap-2 text-[13px]">
          <dt className="text-tinta-50">provincia:</dt>
          <dd>{provincia}</dd>
        </div>
        <div className="font-space flex gap-2 text-[13px]">
          <dt className="text-tinta-50">origen:</dt>
          <dd>{origen}</dd>
        </div>
      </dl>
    </MarcoAnexo>
  );
}

export default PulsoDetail;

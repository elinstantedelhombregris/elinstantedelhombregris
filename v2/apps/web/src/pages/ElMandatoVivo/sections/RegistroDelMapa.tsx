import { RELLENO_TIPO_OSCURO } from '../el-mandato-data';
import { formatoPorcentaje, plegarTipos, regimenDe } from '../mandato-regimen';

import { Palitos } from '~/components/papel/primitives';
import { useMandatoDocumento } from '~/lib/queries/mandato';
import { cn } from '~/lib/utils';

/** §3 de la spec — el registro del mapa: barras §13 en oscuro, por régimen N. */
export function RegistroDelMapa() {
  const documento = useMandatoDocumento();
  if (documento.isLoading || documento.isError) return null; // la card papel (Task 4) es la dueña de carga/error

  const data = documento.data;
  if (!data) return null;
  const tipos = plegarTipos(data.voces.porTipo);
  const regimen = regimenDe(data.voces.total);
  const maximo = tipos[0]?.total ?? 1;
  const fecha = new Date(data.generadoEl).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section aria-labelledby="registro-titulo" className="mx-auto max-w-[1100px] px-10 pb-16 max-[560px]:px-5">
      <h2 id="registro-titulo" className="font-space text-oscuro-meta mb-6 text-[11px] uppercase tracking-[0.16em]">
        El registro del mapa — lo que la gente vino a decir
      </h2>

      {regimen === 'cero' ? (
        <p className="font-space text-oscuro-meta text-[13px]">
          Todavía no hay voces en el mapa. El registro arranca con la primera — puede ser la tuya.
        </p>
      ) : (
        <div className="flex flex-col gap-[18px]">
          {tipos.map(({ tipo, total }, i) => (
            <div
              key={tipo}
              className="grid grid-cols-[170px_1fr_auto] items-center gap-[18px] max-[560px]:grid-cols-[90px_1fr_auto]"
            >
              <span className="font-space text-oscuro-texto text-[13px] uppercase tracking-[0.06em]">{tipo}</span>
              {regimen === 'porcentaje' ? (
                <div aria-hidden className="bg-oscuro-barra relative h-[22px]">
                  <div
                    className={cn('anim-growbar absolute inset-y-0 left-0', RELLENO_TIPO_OSCURO[tipo])}
                    style={{ width: `${String((total / maximo) * 100)}%`, animationDelay: `${String(i * 0.08)}s` }}
                  />
                </div>
              ) : (
                <Palitos n={total} claseRelleno={RELLENO_TIPO_OSCURO[tipo]} />
              )}
              <span className="font-space text-oscuro-meta text-right text-[13px]">
                {regimen === 'porcentaje'
                  ? `${formatoPorcentaje(total, data.voces.total)} · ${total.toLocaleString('es-AR')}`
                  : total.toLocaleString('es-AR')}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.voces.total >= 1 ? (
        <p className="font-space text-oscuro-tenue mt-4 text-[10px] uppercase tracking-[0.12em]">
          fuente: {data.voces.total.toLocaleString('es-AR')} voces del mapa · {fecha}
        </p>
      ) : null}
    </section>
  );
}

import { rellenoDeTipo } from '../el-mandato-data';
import { formatoPorcentaje, plegarTipos, regimenDe } from '../mandato-regimen';

import { Palitos } from '~/components/papel/primitives';
import { useMandatoDocumento } from '~/lib/queries/mandato';
import { cn } from '~/lib/utils';
import { cuantos } from '~/lib/vocabulario';

/** §3 de la spec — lo que dijo la gente en el mapa, por tipo: barras §13 en oscuro, por régimen N. */
export function RegistroDelMapa() {
  const documento = useMandatoDocumento();
  if (documento.isLoading || documento.isError) return null; // la card papel (Task 4) es la dueña de carga/error

  const data = documento.data;
  if (!data) return null;
  const { porTipo: tipos, sinReconocer } = plegarTipos(data.voces.porTipo);
  const regimen = regimenDe(data.voces.total);
  const fecha = new Date(data.generadoEl).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section
      aria-labelledby="registro-titulo"
      className="mx-auto max-w-[1100px] px-10 pb-16 max-[560px]:px-5"
    >
      <h2
        id="registro-titulo"
        className="font-space text-oscuro-secundario mb-6 text-[13px] uppercase tracking-[0.12em]"
      >
        Qué dijo la gente, por tipo
        {data.voces.total >= 1
          ? ` (${cuantos(data.voces.total, 'aporte', 'aportes')}, ${fecha})`
          : ''}
      </h2>

      {regimen === 'cero' ? (
        <p className="font-space text-oscuro-meta text-[13px]">
          Todavía no hay aportes en el mapa.
        </p>
      ) : (
        <div className="flex flex-col gap-[18px]">
          {tipos.map(({ tipo, total }, i) => (
            <div
              key={tipo}
              className="grid grid-cols-[170px_1fr_auto] items-center gap-[18px] max-[560px]:grid-cols-[90px_1fr_auto]"
            >
              <span className="font-space text-oscuro-texto text-[13px] uppercase tracking-[0.06em]">
                {tipo}
              </span>
              {regimen === 'porcentaje' ? (
                <div aria-hidden className="bg-oscuro-barra relative h-[22px]">
                  <div
                    className={cn('anim-growbar absolute inset-y-0 left-0', rellenoDeTipo(tipo))}
                    style={{
                      // Escala al TOTAL de aportes, como dice el rótulo «% del total»:
                      // normalizar al mayor hacía parecer 100 % a un tipo del 40 %.
                      width: `${String((total / data.voces.total) * 100)}%`,
                      animationDelay: `${String(i * 0.08)}s`,
                    }}
                  />
                </div>
              ) : (
                <Palitos n={total} claseRelleno={rellenoDeTipo(tipo)} />
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

      {/*
        Lo que no se supo leer va dicho, no repartido. Antes estas voces se
        sumaban a «valor» y el registro publicaba como preferencia de la gente
        lo que era un hueco del sistema.
      */}
      {sinReconocer > 0 ? (
        <p className="font-space text-oscuro-meta mt-4 text-[12px]">
          {sinReconocer === 1
            ? 'Y 1 aporte llegó con una categoría que esta página todavía no sabe leer. No se cuenta como ningún tipo: contarlo ahí sería inventarle lo que dijo.'
            : `Y ${sinReconocer.toLocaleString('es-AR')} aportes llegaron con una categoría que esta página todavía no sabe leer. No se cuentan como ningún tipo: contarlos ahí sería inventarles lo que dijeron.`}
        </p>
      ) : null}

      {data.voces.total >= 1 ? (
        <p className="font-space text-oscuro-meta mt-4 text-[10px] uppercase tracking-[0.12em]">
          fuente: {cuantos(data.voces.total, 'aporte', 'aportes')} del mapa · {fecha}
        </p>
      ) : null}
    </section>
  );
}

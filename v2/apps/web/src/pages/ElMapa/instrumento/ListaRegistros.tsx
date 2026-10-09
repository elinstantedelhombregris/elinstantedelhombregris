import { ubicacionDelAporte } from '../lienzo/precision';

import { enlaceDeRegistro } from './enlace-registro';

import type { LecturaMapa, SenalMapa } from '~/lib/queries/civic-map';

import { ESTADO_EN_CASTELLANO } from '~/lib/vocabulario';

export function ListaRegistros({
  datos,
  seleccionada,
  seleccionar,
}: {
  datos: LecturaMapa;
  seleccionada: string | null;
  seleccionar: (senal: SenalMapa) => void;
}) {
  return (
    <section
      aria-label="Lista de aportes"
      className="text-oscuro-texto border-oscuro-borde border-t p-4"
    >
      <h3 className="font-anton text-[28px]">Los aportes, uno por uno</h3>
      <p className="text-oscuro-meta mb-4 mt-2 text-sm">
        Cada aporte es un hecho por comprobar, un deseo o una propuesta; ninguno es un acuerdo.
      </p>
      {datos.metadata.total === 0 ? (
        <p role="status">
          Ningún aporte cumple estos filtros. Que no haya no quiere decir que no pase nada: nadie lo
          cargó acá.
        </p>
      ) : null}
      <ul className="grid max-h-[32rem] gap-3 overflow-auto md:grid-cols-2 xl:grid-cols-3">
        {datos.signals.map((senal) => {
          const enlace = enlaceDeRegistro(senal);
          return (
            <li
              key={senal.id}
              className={`border p-4 ${seleccionada === senal.id ? 'border-violeta-claro' : 'border-oscuro-borde'}`}
            >
              <p className="text-violeta-claro mb-2 text-xs">
                {senal.tipo ?? 'Tipo sin clasificar'} ·{' '}
                {senal.estado
                  ? (ESTADO_EN_CASTELLANO[senal.estado] ?? senal.estado)
                  : 'Estado no informado por este origen'}
              </p>
              <p className="break-words text-sm leading-relaxed">{senal.texto}</p>
              <p className="text-oscuro-meta mt-3 text-xs">
                {new Date(senal.createdAt).toLocaleDateString('es-AR')} ·{' '}
                {ubicacionDelAporte(senal)}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 text-sm">
                <button
                  type="button"
                  className="min-h-11 underline"
                  onClick={() => {
                    seleccionar(senal);
                  }}
                >
                  {senal.lat !== null && senal.lng !== null
                    ? 'Ubicar en el mapa'
                    : 'Leer este aporte'}
                </button>
                {enlace ? (
                  <a className="inline-flex min-h-11 items-center underline" href={enlace}>
                    Abrir aporte y seguimiento →
                  </a>
                ) : (
                  <span className="text-oscuro-meta py-3 text-xs">
                    Aporte anterior · {senal.id}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

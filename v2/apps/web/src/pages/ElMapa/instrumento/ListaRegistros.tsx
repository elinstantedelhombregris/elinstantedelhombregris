import type { LecturaMapa, SenalMapa } from '~/lib/queries/civic-map';

import { ESTADO_EN_CASTELLANO } from '~/lib/vocabulario';

function enlaceDe(senal: SenalMapa): string | null {
  const [origen, id] = senal.id.split(':');
  if (origen === 'voz' && id && /^[0-9a-f-]{36}$/i.test(id)) return `/senal/${id}`;
  if ((origen === 'pulso' || origen === 'propuesta') && id && /^\d+$/.test(id))
    return `/mandato-vivo/${origen}/${id}`;
  return null;
}

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
      aria-label="Lista de registros"
      className="text-oscuro-texto border-oscuro-borde border-t p-4"
    >
      <h3 className="font-anton text-xl">Los aportes de esta consulta</h3>
      <p className="text-oscuro-meta mb-4 mt-2 text-sm">
        {datos.metadata.entregados} registros cargados de {datos.metadata.total} coincidentes. Cada
        una es un hecho por corroborar, un deseo o una propuesta — ninguna es un acuerdo.
      </p>
      {datos.metadata.total === 0 ? (
        <p role="status">
          Con estos filtros no hay nada. Que nadie haya hablado no dice qué le pasa a la gente de
          acá.
        </p>
      ) : null}
      <ul className="grid max-h-[32rem] gap-3 overflow-auto md:grid-cols-2 xl:grid-cols-3">
        {datos.signals.map((senal) => {
          const enlace = enlaceDe(senal);
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
                {new Date(senal.createdAt).toLocaleDateString('es-AR')} · Precisión:{' '}
                {senal.precision}.{' '}
                {senal.lat === null || senal.lng === null
                  ? 'Sin punto publicado; se conserva en esta lista.'
                  : 'Ubicación publicada, que puede estar aproximada.'}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 text-sm">
                {senal.lat !== null && senal.lng !== null ? (
                  <button
                    type="button"
                    className="min-h-11 underline"
                    onClick={() => {
                      seleccionar(senal);
                    }}
                  >
                    Ubicar en el mapa
                  </button>
                ) : null}
                {enlace ? (
                  <a className="inline-flex min-h-11 items-center underline" href={enlace}>
                    Abrir aporte y seguimiento →
                  </a>
                ) : (
                  <span className="text-oscuro-meta py-3 text-xs">
                    Registro anterior · {senal.id}
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

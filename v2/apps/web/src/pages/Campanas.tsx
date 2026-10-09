import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { Link, useLocation, useSearch } from 'wouter';

import { filtrarCatalogo } from './Campanas/filtrar-catalogo';
import { FiltrosCatalogo } from './Campanas/FiltrosCatalogo';
import { TarjetaCampana } from './Campanas/TarjetaCampana';

import type { LugarMapa } from './ElMapa/instrumento/BusquedaTerritorial';

import { MarcoParticipacion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useCampanas } from '~/lib/queries/participacion';

export function Campanas() {
  const consulta = useCampanas();
  const search = useSearch();
  const [, navegar] = useLocation();
  const filtros = new URLSearchParams(search);
  const territorio = Number(filtros.get('territorio'));
  const lugar = useQuery({
    queryKey: ['geo', 'lugar', territorio],
    enabled: Number.isSafeInteger(territorio) && territorio > 0,
    queryFn: ({ signal }) => api.get<LugarMapa>(`/api/v1/geo/lugares/${territorio}`, { signal }),
  });
  const campanas = filtrarCatalogo(consulta.data ?? [], filtros, lugar.data);
  return (
    <MarcoParticipacion
      titulo="Una pregunta. Muchas vidas posibles."
      entrada="Diseñar un país también es abrir una conversación cerca de casa. Elegí un lugar, un tema y una pregunta que valga la pena construir con otros."
      kicker="La ciudadanía diseña · Campañas"
    >
      <div className="border-tinta/25 mb-9 flex flex-wrap items-center justify-between gap-5 border-y py-5">
        <p className="max-w-[550px] text-sm leading-relaxed">
          Cada convocatoria cuenta qué quiere escuchar, quién cuida el proceso y cuándo vuelve una
          lectura a quienes participan.
        </p>
        <Link
          href="/gestion/campanas"
          className="font-space inline-flex min-h-11 items-center gap-3 text-xs uppercase tracking-wide underline underline-offset-4"
        >
          Abrir una pregunta
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <FiltrosCatalogo
        campanas={consulta.data ?? []}
        filtros={filtros}
        lugar={lugar.data}
        errorLugar={lugar.isError}
        cambiar={(q) => {
          navegar('/campanas' + (q.size ? '?' + q.toString() : ''));
        }}
      />
      <ErrorOperacion mensaje={consulta.error?.message} />
      {consulta.isLoading || (territorio > 0 && lugar.isLoading) ? (
        <p role="status" className="py-10">
          Buscando conversaciones para este alcance…
        </p>
      ) : consulta.data?.length === 0 ? (
        <Nota>
          Todavía no hay campañas públicas. Una convocatoria necesita un equipo que escuche y
          devuelva. Mientras se preparan, podés empezar por tu vida ideal.
        </Nota>
      ) : campanas.length === 0 && !consulta.isError ? (
        <Nota>
          No encontramos campañas con estos filtros. Podés ampliar la búsqueda; una zona sin
          convocatoria también tiene algo que decir.
        </Nota>
      ) : (
        <section aria-label="Convocatorias del alcance elegido" className="space-y-6">
          {campanas[0] ? <TarjetaCampana campana={campanas[0]} numero={1} destacada /> : null}
          <div className="grid gap-6 md:grid-cols-2">
            {campanas.slice(1).map((c, i) => (
              <TarjetaCampana key={c.id} campana={c} numero={i + 2} />
            ))}
          </div>
        </section>
      )}
      <aside className="border-tinta mt-12 grid gap-6 border-t pt-8 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="font-anton text-3xl">¿Tu pregunta todavía no tiene mesa?</h2>
          <p className="text-tinta-75 mt-4 max-w-[660px] leading-relaxed">
            Podés imaginar tu vida ideal sin esperar una convocatoria. O preparar una conversación
            para tu comunidad, con un propósito claro y el cuidado de volver a escuchar.
          </p>
        </div>
        <Link
          href="/el-mapa?participar=imaginar#instrumento"
          className="font-space text-violeta inline-flex min-h-11 items-center gap-3 text-xs uppercase tracking-wide underline underline-offset-4"
        >
          Imaginar desde mi lugar
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    </MarcoParticipacion>
  );
}

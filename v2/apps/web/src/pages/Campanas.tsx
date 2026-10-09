import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useSearch } from 'wouter';

import { filtrarCatalogo } from './Campanas/filtrar-catalogo';
import { FiltrosCatalogo } from './Campanas/FiltrosCatalogo';

import type { LugarMapa } from './ElMapa/instrumento/BusquedaTerritorial';

import { FASES_ROTULO } from '~/components/participacion/constantes';
import {
  MarcoParticipacion,
  EnlaceAccion,
  ErrorOperacion,
  Nota,
} from '~/components/participacion/Elementos';
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
    queryFn: () => api.get<LugarMapa>(`/api/v1/geo/lugares/${territorio}`),
  });
  const campanas = filtrarCatalogo(consulta.data ?? [], filtros, lugar.data);
  return (
    <MarcoParticipacion
      titulo="Una pregunta puede reunir un territorio."
      entrada="Las campañas abren una conversación con propósito, equipo y devolución. Elegí dónde querés imaginar y diseñar con otros."
      kicker="Campañas de diseño"
    >
      <div className="mb-8 flex flex-wrap gap-3">
        <EnlaceAccion href="/imaginar">Imaginar mi Argentina</EnlaceAccion>
        <EnlaceAccion secundario href="/gestion/campanas">
          Preparar una campaña
        </EnlaceAccion>
      </div>
      <ErrorOperacion mensaje={consulta.error?.message} />
      <FiltrosCatalogo campanas={consulta.data ?? []} filtros={filtros} lugar={lugar.data} errorLugar={lugar.isError} cambiar={(q) => { navegar('/campanas' + (q.size ? '?' + q.toString() : '')); }} />
      {consulta.isLoading || (territorio > 0 && lugar.isLoading) ? (
        <p>Buscando las mesas abiertas…</p>
      ) : consulta.data?.length === 0 ? (
        <Nota>
          Todavía no hay campañas públicas. Una convocatoria necesita un equipo que escuche y
          devuelva. Mientras se preparan, podés empezar por tu vida ideal.
        </Nota>
      ) : campanas.length === 0 && !consulta.isError ? (
        <Nota>No encontramos campañas en el catálogo recibido con estos filtros. Podés ampliar la búsqueda; esto no demuestra ausencia de necesidades ni de participación.</Nota>
      ) : (
        <div className="bg-tinta grid gap-px border sm:grid-cols-2">
          {campanas.map((c) => (
            <article key={c.id} className="bg-papel p-6">
              <p className="font-space text-violeta text-xs uppercase">{FASES_ROTULO[c.estado]}</p>
              <h2 className="font-anton mt-4 text-3xl">
                <Link href={`/campanas/${c.slug}`}>{c.contrato.titulo}</Link>
              </h2>
              <p className="mt-4 leading-relaxed">{c.contrato.pregunta}</p>
              <p className="text-tinta-50 mt-4 text-sm">
                {c.contrato.temas.join(' · ')} ·{' '}
                {c.contrato.territorios.length
                  ? `${c.contrato.territorios.length} ámbitos elegidos`
                  : 'Alcance nacional'}
              </p>
              <p className="mt-3 text-sm">Devolución prevista: {c.contrato.fechaDevolucion}</p>
              <Link
                href={`/campanas/${c.slug}`}
                className="text-violeta mt-5 inline-flex min-h-11 items-center underline"
              >
                Conocer el proceso →
              </Link>
            </article>
          ))}
        </div>
      )}
    </MarcoParticipacion>
  );
}

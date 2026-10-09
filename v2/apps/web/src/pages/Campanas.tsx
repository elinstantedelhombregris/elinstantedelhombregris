import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { useLocation, useSearch } from 'wouter';

import { filtrarCatalogo, ordenarCatalogo } from './Campanas/filtrar-catalogo';
import { FiltrosCatalogo } from './Campanas/FiltrosCatalogo';
import { TarjetaCampana } from './Campanas/TarjetaCampana';

import type { LugarMapa } from './ElMapa/instrumento/BusquedaTerritorial';

import {
  MarcoParticipacion,
  BotonAccion,
  EnlaceAccion,
  ErrorOperacion,
  Nota,
} from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { APORTAR_HREF } from '~/lib/participacion/aportar';
import { useCampanas } from '~/lib/queries/participacion';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export function Campanas() {
  useTituloDePagina('Campañas');
  const auth = useAuth();
  const esAdmin = auth.user?.esAdmin === true;
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
  const campanas = ordenarCatalogo(filtrarCatalogo(consulta.data ?? [], filtros, lugar.data));
  return (
    <MarcoParticipacion
      titulo="Campañas"
      entrada="Una campaña es una pregunta abierta por un equipo: dice qué quiere escuchar, quién la coordina y cuándo devuelve lo que escuchó. Elegí una y sumá tu aporte."
    >
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
          Buscando campañas…
        </p>
      ) : consulta.data?.length === 0 ? (
        <Nota>
          Todavía no hay campañas públicas. Mientras se abren, podés sumar tu aporte igual: entra en
          la campaña nacional.
        </Nota>
      ) : campanas.length === 0 && !consulta.isError ? (
        <Nota>
          <p>No hay campañas con estos filtros.</p>
          <div className="mt-4">
            <BotonAccion
              tono="papel"
              onClick={() => {
                navegar('/campanas');
              }}
            >
              Ver todas
            </BotonAccion>
          </div>
        </Nota>
      ) : (
        <section aria-label="Campañas" className="space-y-6">
          {campanas[0] ? <TarjetaCampana campana={campanas[0]} destacada /> : null}
          <div className="grid gap-6 md:grid-cols-2">
            {campanas.slice(1).map((c) => (
              <TarjetaCampana key={c.id} campana={c} />
            ))}
          </div>
        </section>
      )}
      <aside className="border-tinta mt-12 grid gap-6 border-t pt-8 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="font-anton text-3xl">¿Ninguna campaña es para lo que querés decir?</h2>
          <p className="text-tinta-75 mt-4 max-w-[660px] leading-relaxed">
            Podés sumar tu aporte igual. Si no elegís una campaña, entra en la campaña nacional «Mi
            Argentina ideal».
          </p>
        </div>
        <EnlaceAccion href={APORTAR_HREF} className="gap-3 self-center">
          Sumar mi aporte a la campaña nacional
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </EnlaceAccion>
      </aside>
      {esAdmin ? (
        <div className="border-tinta/25 mt-8 border-t pt-6">
          <EnlaceAccion secundario href="/gestion/campanas">
            Abrir una campaña
          </EnlaceAccion>
        </div>
      ) : null}
    </MarcoParticipacion>
  );
}

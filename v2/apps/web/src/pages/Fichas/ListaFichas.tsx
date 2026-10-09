import { Link, useLocation, useSearch } from 'wouter';

import { useLugar } from './consultas';
import {
  LEAD_FICHA,
  cantidadDe,
  esUuid,
  etiquetaVersion,
  fechaDeFicha,
  numeroDeLugar,
} from './presentacion';

import { BotonPapel } from '~/components/papel/primitives';
import { MarcoParticipacion, Nota } from '~/components/participacion/Elementos';
import { useFichas } from '~/lib/queries/fichas';
import { useCampana } from '~/lib/queries/participacion';

function Filtro({ rotulo, quitar }: { rotulo: string; quitar: () => void }) {
  return (
    <button
      type="button"
      onClick={quitar}
      aria-label={`Quitar el filtro: ${rotulo}`}
      className="font-space border-tinta hover:bg-tinta hover:text-papel inline-flex min-h-11 items-center gap-2 border px-4 text-xs transition-colors"
    >
      {rotulo} <span aria-hidden="true">×</span>
    </button>
  );
}

export function ListaFichas() {
  const search = useSearch();
  const [, navegar] = useLocation();
  const params = new URLSearchParams(search);
  const lugarId = numeroDeLugar(params.get('lugar'));
  const campanaParam = params.get('campana');
  const campanaId = esUuid(campanaParam) ? campanaParam : undefined;
  const lista = useFichas(lugarId, campanaId);
  const lugar = useLugar(lugarId);
  const campana = useCampana(campanaId);
  const sinFiltro = (...claves: string[]) => {
    const resto = new URLSearchParams(search);
    claves.forEach((clave) => {
      resto.delete(clave);
    });
    navegar(`/fichas${resto.size ? `?${resto.toString()}` : ''}`);
  };
  const nombreDelLugar =
    params.get('nombre') ?? lugar.data?.name ?? (lugar.isError ? 'Un lugar del mapa' : 'Lugar…');
  const fichas = lista.data?.fichas ?? [];
  const total = lista.data?.total ?? 0;
  return (
    <MarcoParticipacion titulo="Fichas" entrada={LEAD_FICHA} kicker="La ciudadanía diseña · Fichas">
      <p className="max-w-[720px] text-sm leading-relaxed">
        En cada ficha podés ver los aportes que la inspiran, responder afirmaciones, comparar
        alternativas y seguir pruebas.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <BotonPapel asChild>
          <Link href={`/fichas/nueva${search ? `?${search}` : ''}`}>Crear una ficha</Link>
        </BotonPapel>
        {lugarId !== undefined ? (
          <Filtro
            rotulo={nombreDelLugar}
            quitar={() => {
              sinFiltro('lugar', 'nombre');
            }}
          />
        ) : null}
        {campanaId ? (
          <Filtro
            rotulo={`Campaña: ${campana.data?.contrato.titulo ?? 'esta campaña'}`}
            quitar={() => {
              sinFiltro('campana');
            }}
          />
        ) : null}
      </div>
      <div className="mt-8">
        {lista.isLoading ? (
          <p role="status">Buscando fichas…</p>
        ) : lista.isError ? (
          <p role="alert">
            No pudimos cargar las fichas.{' '}
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => {
                void lista.refetch();
              }}
            >
              Reintentar
            </button>
          </p>
        ) : fichas.length === 0 ? (
          <Nota>Todavía no hay fichas acá. Podés crear la primera.</Nota>
        ) : (
          <>
            <p className="mb-4 text-sm">
              {total > fichas.length
                ? `Mostramos las ${fichas.length} fichas más recientes, de ${total}.`
                : `Hay ${cantidadDe(fichas.length, 'ficha', 'fichas')}.`}
            </p>
            <ul className="space-y-4">
              {fichas.map((f) => (
                <li key={f.id} className="border-tinta bg-papel border p-6">
                  <p className="font-space text-violeta text-[10px] uppercase tracking-[.12em]">
                    {etiquetaVersion(f.revision)}
                  </p>
                  <h2 className="font-anton mt-3 text-3xl leading-[1.1]">
                    <Link
                      href={`/fichas/${f.id}`}
                      className="hover:text-violeta focus-visible:underline"
                    >
                      {f.titulo}
                    </Link>
                  </h2>
                  <p className="text-tinta-75 mt-3 text-sm">
                    {f.territorioNombre ?? 'Todo el país'} · Actualizada el{' '}
                    {fechaDeFicha(f.actualizadaEn)}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </MarcoParticipacion>
  );
}

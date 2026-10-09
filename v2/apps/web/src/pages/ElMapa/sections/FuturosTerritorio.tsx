import { Link, useSearch } from 'wouter';

import type { LugarMapa } from '../instrumento/BusquedaTerritorial';

import { ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { Seguir } from '~/components/participacion/Seguir';
import { useFichas } from '~/lib/queries/fichas';
import { useCampanas } from '~/lib/queries/participacion';

export function FuturosTerritorio({ lugar }: { lugar: LugarMapa | null }) {
  const search = useSearch();
  const campana = new URLSearchParams(search).get('campana') ?? undefined;
  const q = useFichas(lugar?.id, campana);
  const campanas = useCampanas();
  const alcance = {
    ...(lugar ? { territorio: String(lugar.id) } : {}),
    ...(campana ? { campana } : {}),
  };
  return (
    <aside
      className="mx-auto w-full max-w-[1440px] border-t px-5 py-7 min-[961px]:px-10"
      aria-labelledby="futuros-territorio"
    >
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <p className="font-space text-violeta text-xs uppercase">
            Futuro · {lugar?.name ?? 'Argentina'}
          </p>
          <h2 id="futuros-territorio" className="font-anton mt-3 text-3xl">
            Lo que queremos hacer posible acá.
          </h2>
          <p className="mt-3 leading-relaxed">
            El mapa ubica las voces. Las fichas desarrollan el futuro que imaginan, con fuentes,
            diferencias y próximos pasos.
          </p>
          <ErrorOperacion mensaje={q.error?.message} />
          {q.data?.fichas.length ? (
            <ul className="mt-5 divide-y border-y">
              {q.data.fichas.map((f) => (
                <li key={f.id} className="py-4">
                  <Link href={`/fichas/${f.id}`} className="text-violeta underline">
                    {f.titulo}
                  </Link>
                  <p className="text-tinta-50 mt-2 text-sm">
                    {f.territorioNombre ?? 'Alcance nacional'} · revisión {f.revision}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Nota>
              {q.isLoading
                ? 'Buscando los futuros en elaboración…'
                : 'Todavía no encontramos fichas para este ámbito. Podés abrir una pregunta o aportar tu mirada.'}
            </Nota>
          )}
          <div className="mt-4 flex flex-wrap gap-5">
            <Link
              href={`/fichas/nueva${lugar ? `?lugar=${lugar.id}` : ''}`}
              className="text-violeta inline-flex min-h-11 items-center underline"
            >
              Abrir una ficha de futuro
            </Link>
            <Link
              href={`/la-radiografia?${new URLSearchParams(alcance).toString()}`}
              className="text-violeta inline-flex min-h-11 items-center underline"
            >
              Leer patrones y diferencias
            </Link>
            <Link
              href={`/datos-abiertos?${new URLSearchParams(alcance).toString()}`}
              className="text-violeta inline-flex min-h-11 items-center underline"
            >
              Descargar este alcance
            </Link>
          </div>
          {lugar ? (
            <div className="mt-5">
              <Seguir tipo="territorio" objeto={String(lugar.id)} />
            </div>
          ) : null}
        </section>
        <section>
          <h2 className="font-anton text-3xl">Campañas para encontrarnos.</h2>
          <p className="mt-3 leading-relaxed">
            Una convocatoria pone una pregunta, un equipo y una fecha de devolución. Podés entrar
            desde ella sin empezar por un mapa.
          </p>
          <ul className="mt-5 space-y-4">
            {campanas.data
              ?.filter(
                (c) =>
                  !lugar ||
                  !c.contrato.territorios.length ||
                  c.contrato.territorios.includes(lugar.id) ||
                  c.contrato.territorios.includes(lugar.provinceId),
              )
              .slice(0, 5)
              .map((c) => (
                <li key={c.id}>
                  <Link
                    className="text-violeta inline-flex min-h-11 items-center underline"
                    href={`/campanas/${c.slug}`}
                  >
                    {c.contrato.titulo}
                  </Link>
                </li>
              ))}
          </ul>
          <Link
            href="/campanas"
            className="text-violeta mt-5 inline-flex min-h-11 items-center underline"
          >
            Explorar todas las campañas →
          </Link>
          <Nota>
            Las alternativas y las pruebas se consultan desde cada ficha. Una ubicación aproximada
            conserva su precisión; no es un domicilio ni una representación de habitantes.
          </Nota>
        </section>
      </div>
    </aside>
  );
}

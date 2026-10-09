import { Link, useSearch } from 'wouter';

import type { LugarMapa } from '../instrumento/BusquedaTerritorial';

import { ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { Seguir } from '~/components/participacion/Seguir';
import { useFichas } from '~/lib/queries/fichas';
import { useCampanas } from '~/lib/queries/participacion';

export function FuturosTerritorio({ lugar }: { lugar: LugarMapa | null }) {
  const search = useSearch();
  // `campana` también puede ser un slug (lo usa el panel de aportes); las fichas
  // y las campañas se filtran por id, así que un slug no filtra nada.
  const pedida = new URLSearchParams(search).get('campana');
  const campana = pedida && /^[0-9a-f-]{36}$/i.test(pedida) ? pedida : undefined;
  const q = useFichas(lugar?.id, campana);
  const campanas = useCampanas();
  const convocatorias = (campanas.data ?? []).filter(
    (c) =>
      (!campana || c.id === campana) &&
      (!lugar ||
        !c.contrato.territorios.length ||
        c.contrato.territorios.includes(lugar.id) ||
        c.contrato.territorios.includes(lugar.provinceId)),
  );
  const alcance = {
    ...(lugar ? { territorio: String(lugar.id) } : {}),
    ...(campana ? { campana } : {}),
  };
  return (
    <aside
      className="mx-auto w-full max-w-[1440px] px-5 py-14 min-[961px]:px-10"
      aria-labelledby="futuros-territorio"
    >
      <header className="border-tinta mb-8 grid gap-5 border-b pb-8 min-[961px]:grid-cols-[1.3fr_1fr]">
        <h2 className="font-anton text-[clamp(32px,4vw,52px)] leading-tight">
          Una mirada abre una pregunta.
          <br />
          <span className="text-violeta">Una pregunta puede cambiar un lugar.</span>
        </h2>
        <p className="text-tinta-75 self-end text-base leading-relaxed">
          Los aportes del mapa pueden convertirse en futuros compartidos. Acá se organizan las
          preguntas, las diferencias y las formas de probar lo que imaginamos.
        </p>
      </header>
      <div className="grid gap-10 min-[961px]:grid-cols-[1.3fr_1fr]">
        <section>
          <p className="font-space text-violeta text-xs uppercase">
            Futuro · {lugar?.name ?? 'Argentina'}
          </p>
          <h2 id="futuros-territorio" className="font-anton mt-3 text-3xl">
            Preguntas que están tomando forma.
          </h2>
          <p className="mt-3 leading-relaxed">
            El mapa ubica las voces. Las fichas desarrollan el futuro que imaginan, con fuentes,
            diferencias y próximos pasos.
          </p>
          <ErrorOperacion mensaje={q.error?.message} />
          {q.data?.fichas.length ? (
            <ul className="mt-5 divide-y border-y">
              {q.data.fichas.slice(0, 4).map((f, i) => (
                <li key={f.id} className="py-4">
                  <Link
                    href={`/fichas/${f.id}`}
                    className="font-anton hover:text-violeta flex items-start gap-4 text-2xl"
                  >
                    <span className="font-space text-tinta-50 mt-1 text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {f.titulo}
                  </Link>
                  <p className="text-tinta-50 mt-2 text-sm">
                    {f.territorioNombre ?? 'Alcance nacional'} · revisión {f.revision}
                  </p>
                </li>
              ))}
            </ul>
          ) : q.isError ? null : (
            <Nota>
              {q.isLoading
                ? 'Buscando los futuros en elaboración…'
                : 'Todavía no encontramos fichas para este ámbito. Podés abrir una pregunta o aportar tu mirada.'}
            </Nota>
          )}
          <div className="mt-4 flex flex-wrap gap-5">
            <Link
              href={`/fichas?${new URLSearchParams({ ...(lugar ? { lugar: String(lugar.id) } : {}), ...(campana ? { campana } : {}) })}`}
              className="text-violeta inline-flex min-h-11 items-center underline"
            >
              Ver todas las preguntas de este ámbito →
            </Link>
            <Link
              href={`/fichas/nueva?${new URLSearchParams({ ...(lugar ? { lugar: String(lugar.id), nombre: lugar.name } : {}), ...(campana ? { campana } : {}) })}`}
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
          <p className="font-space text-violeta text-xs uppercase">
            Convocatorias · mismo territorio
          </p>
          <h2 className="font-anton mt-3 text-3xl">Campañas para encontrarnos.</h2>
          <p className="mt-3 leading-relaxed">
            Una convocatoria pone una pregunta, un equipo y una fecha de devolución. Podés entrar
            desde ella sin empezar por un mapa.
          </p>
          <ul className="mt-5 space-y-4">
            {convocatorias.slice(0, 3).map((c) => (
              <li key={c.id}>
                <Link
                  className="font-anton hover:text-violeta inline-flex min-h-11 items-center text-2xl"
                  href={`/campanas/${c.slug}`}
                >
                  {c.contrato.titulo}
                </Link>
              </li>
            ))}
          </ul>
          {campanas.isLoading ? (
            <p role="status" className="text-tinta-50 mt-4 text-sm">
              Buscando convocatorias de este ámbito…
            </p>
          ) : null}
          <ErrorOperacion mensaje={campanas.error?.message} />
          {!campanas.isLoading && !campanas.isError && convocatorias.length === 0 ? (
            <p className="text-tinta-50 mt-4 text-sm">
              Todavía no hay una convocatoria publicada acá. La próxima puede empezar con tu
              pregunta.
            </p>
          ) : null}
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

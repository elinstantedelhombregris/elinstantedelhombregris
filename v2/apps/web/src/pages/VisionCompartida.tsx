import { Link, useLocation, useSearch } from 'wouter';

import { BusquedaTerritorial } from './ElMapa/instrumento/BusquedaTerritorial';
import { useLugar } from './Fichas/consultas';
import { numeroDeLugar } from './Fichas/presentacion';
import { TarjetaVision } from './VisionCompartida/TarjetaVision';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion, MarcoParticipacion } from '~/components/participacion/Elementos';
import { useVisionCompartida } from '~/lib/queries/deliberacion';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export function VisionCompartida() {
  useTituloDePagina('Una visión compartida del país');
  const search = useSearch();
  const [, navegar] = useLocation();
  const territorioId = numeroDeLugar(new URLSearchParams(search).get('lugar'));
  const lugar = useLugar(territorioId);
  const q = useVisionCompartida(territorioId);
  const lectura = q.data?.pages[0];
  const fichas = q.data?.pages.flatMap((p) => p.fichas) ?? [];
  const nombre = territorioId
    ? (lugar.data?.name ?? 'Territorio seleccionado')
    : 'Todos los territorios';
  return (
    <MarcoParticipacion
      titulo="Una visión compartida del país"
      entrada="Qué futuro se está proponiendo, qué evidencia lo sostiene y qué decisiones necesitan conectar lugares y escalas."
      kicker="Lectura de las fichas públicas"
    >
      <div className="border-violeta bg-papel-crudo border-l-4 p-5">
        <p>
          Esta lectura reúne fichas de quienes participan. No representa por sí sola a la población
          ni decide prioridades por cantidad de menciones. En los lugares sin fichas hay personas y
          necesidades que todavía falta escuchar.
        </p>
        <p className="mt-3 text-sm">
          Cada objetivo conserva su fuente y su versión en la ficha de origen. Los acuerdos
          publicados corresponden a su proceso de conversación; las propuestas pendientes siguen
          identificadas.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 print:hidden">
        <BusquedaTerritorial
          superficie="papel"
          rotulo="Explorar un territorio"
          onElegir={(l) => {
            navegar(`/vision-compartida?lugar=${l.id}`);
          }}
        />
        <nav className="flex flex-wrap gap-4" aria-label="Continuar la lectura">
          <Link className="inline-flex min-h-11 items-center underline" href="/fichas/ejemplos">
            Ver ejemplos cotidianos
          </Link>
          <Link
            className="inline-flex min-h-11 items-center underline"
            href={territorioId ? `/el-mapa?lugar=${territorioId}` : '/el-mapa'}
          >
            Volver al mapa
          </Link>
        </nav>
      </div>
      <p className="mt-5 font-semibold">Alcance: {nombre}</p>
      {territorioId ? (
        <>
          <p className="mt-2 text-sm">
            Incluye fichas de este lugar y objetivos que lo nombran explícitamente. No suma
            automáticamente localidades de una provincia.
          </p>
          <Link
            className="mt-2 inline-flex min-h-11 underline print:hidden"
            href="/vision-compartida"
          >
            Quitar filtro territorial
          </Link>
        </>
      ) : null}
      {q.isPending ? (
        <p role="status" className="mt-6">
          Consultando objetivos y territorios…
        </p>
      ) : null}
      <ErrorOperacion mensaje={q.error?.message} />
      {q.isError ? (
        <button
          className="min-h-11 underline"
          onClick={() => {
            void q.refetch();
          }}
        >
          Reintentar lectura del país
        </button>
      ) : null}
      {lectura ? (
        <>
          <dl className="my-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              [lectura.total, 'Fichas en el alcance'],
              [lectura.objetivos, 'Objetivos propuestos'],
              [lectura.territorios, 'Lugares de origen distintos'],
            ].map(([v, t]) => (
              <div key={t} className="border-tinta border-t pt-3">
                <dt className="text-sm">{t}</dt>
                <dd className="font-anton mt-2 text-4xl">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm">
            Consulta del {new Date(lectura.fecha).toLocaleString('es-AR')}. Los totales abarcan el
            filtro completo; debajo se cargaron {fichas.length} de {lectura.total} fichas. La vista
            se actualiza y puede cambiar mientras navegás.
          </p>
          {lectura.total === 0 ? (
            <div className="mt-6">
              <p>
                Todavía no hay fichas en este alcance. Empezá con una pregunta cotidiana y documentá
                qué falta conocer.
              </p>
              <BotonPapel asChild className="mt-4">
                <Link href={`/fichas/nueva${territorioId ? `?lugar=${territorioId}` : ''}`}>
                  Crear una ficha de este alcance
                </Link>
              </BotonPapel>
            </div>
          ) : null}
          <ul className="mt-7 space-y-5">
            {fichas.map((f) => (
              <TarjetaVision key={f.id} ficha={f} />
            ))}
          </ul>
          {q.hasNextPage ? (
            <BotonPapel
              className="mt-6 print:hidden"
              variant="fantasma"
              disabled={q.isFetchingNextPage}
              onClick={() => {
                void q.fetchNextPage();
              }}
            >
              Cargar más fichas
            </BotonPapel>
          ) : null}
          <p className="my-5">
            <Link className="inline-flex min-h-11 items-center underline" href="/sintesis-nacional">
              Preparar o consultar una síntesis con revisión del equipo
            </Link>
          </p>
          <section className="border-tinta mt-9 border-t pt-6">
            <h2 className="font-anton text-2xl">Compartir esta lectura</h2>
            <p className="mt-3 text-sm">
              El enlace conserva el filtro y consulta la versión actual. Podés imprimir lo cargado
              con su fecha, versiones y límites; no es un archivo histórico inmutable. Volvé a las
              fichas para revisar cambios y retiros.
            </p>
            <BotonPapel
              className="mt-4 print:hidden"
              variant="fantasma"
              onClick={() => {
                window.print();
              }}
            >
              Imprimir lectura cargada
            </BotonPapel>
          </section>
        </>
      ) : null}
    </MarcoParticipacion>
  );
}

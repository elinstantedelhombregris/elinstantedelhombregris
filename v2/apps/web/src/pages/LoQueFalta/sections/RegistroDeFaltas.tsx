import { useMemo, useState } from 'react';

import { esPropia, ESTADOS, leerLlavero, SUPERFICIES } from '../lo-que-falta-data';

import { FilaFalta } from './FilaFalta';


import { BotonPapel } from '~/components/papel/primitives';
import {
  useFaltas,
  type EstadoDeFalta,
  type FiltroDeFaltas,
} from '~/lib/queries/faltas';

const ESTADOS_FILTRABLES: readonly EstadoDeFalta[] = [
  'dicha',
  'anotada',
  'en_curso',
  'hecha',
  'no_va',
];

/**
 * § El registro. Cronológico descendente, por cursor, con dos filtros.
 *
 * `bajada` no está entre los estados filtrables: las bajadas siguen en la
 * lista —la fila nunca se borra— pero darles una pestaña propia sería armar
 * una vitrina de lo que se retiró, que es justo lo contrario de por qué la
 * fila queda.
 */
export function RegistroDeFaltas() {
  const [filtro, setFiltro] = useState<FiltroDeFaltas>({});
  const llavero = useMemo(() => leerLlavero(), []);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFaltas(filtro);

  const faltas = data?.pages.flatMap((pagina) => pagina.faltas) ?? [];

  const alternar = <K extends keyof FiltroDeFaltas>(clave: K, valor: FiltroDeFaltas[K]) => {
    setFiltro((actual) => ({ ...actual, [clave]: actual[clave] === valor ? undefined : valor }));
  };

  return (
    <section>
      <div className="border-papel-borde mb-6 border-t pt-6">
        <div className="font-space text-tinta-50 mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">
          Por estado
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {ESTADOS_FILTRABLES.map((estado) => (
            <Pastilla
              key={estado}
              activa={filtro.estado === estado}
              onClick={() => {
                alternar('estado', estado);
              }}
            >
              {ESTADOS[estado].etiqueta}
            </Pastilla>
          ))}
        </div>

        <div className="font-space text-tinta-50 mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">
          Por parte
        </div>
        <div className="flex flex-wrap gap-2">
          {SUPERFICIES.map((superficie) => (
            <Pastilla
              key={superficie.valor}
              activa={filtro.superficie === superficie.valor}
              onClick={() => {
                alternar('superficie', superficie.valor);
              }}
            >
              {superficie.etiqueta}
            </Pastilla>
          ))}
        </div>
      </div>

      {isLoading ? <Aviso>Trayendo el registro…</Aviso> : null}
      {isError ? <Aviso>No se pudo traer el registro. Recargá en un momento.</Aviso> : null}

      {!isLoading && !isError && faltas.length === 0 ? (
        <Aviso>
          {Object.values(filtro).some(Boolean)
            ? 'Con esos filtros no hay nada. Probá sacando uno.'
            : 'Todavía no hay nada acá. Sé la primera persona en dejar algo.'}
        </Aviso>
      ) : null}

      <div>
        {faltas.map((falta) => (
          <FilaFalta key={falta.idPublico} falta={falta} propia={esPropia(falta, llavero)} />
        ))}
      </div>

      {hasNextPage ? (
        <div className="mt-8">
          <BotonPapel
            variant="fantasma"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Trayendo…' : 'Traer más'}
          </BotonPapel>
        </div>
      ) : null}
    </section>
  );
}

function Pastilla({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`font-space border px-[14px] py-[9px] text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
        activa
          ? 'bg-violeta border-violeta text-papel'
          : 'border-tinta text-tinta hover:bg-papel-presionado'
      }`}
    >
      {children}
    </button>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="text-tinta-50 py-10 text-center text-[15px] leading-relaxed">{children}</p>;
}

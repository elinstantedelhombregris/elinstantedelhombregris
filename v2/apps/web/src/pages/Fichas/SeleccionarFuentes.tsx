import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { RELACIONES, type RelacionFicha } from './presentacion';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';

interface Props {
  campana: string | null | undefined;
  /** Cómo se vincula cada aporte que se elija. */
  relacion: RelacionFicha;
  /** Los aportes que ya están vinculados con esa relación. */
  vinculados: readonly string[];
  /** El texto es `null` cuando su autor lo reservó. */
  elegir: (id: string, texto: string | null) => void;
}

const LARGO_MAXIMO = 240;

/** El registro público de aportes, a la vista, para vincular los que sostienen la ficha. */
export function SeleccionarFuentes({ campana, relacion, vinculados, elegir }: Props) {
  const [cursor, setCursor] = useState('');
  const q = useQuery({
    queryKey: ['seleccion-fuentes', campana, cursor],
    queryFn: () =>
      api.get<{
        registros: { id: string; tipo: string; texto: string | null }[];
        siguiente: string | null;
        total: number;
      }>(
        `/api/v1/exportaciones/publica?${new URLSearchParams({ limite: '20', ...(campana ? { campana } : {}), ...(cursor ? { cursor } : {}) }).toString()}`,
      ),
  });
  return (
    <section className="mt-5" aria-labelledby="elegir-aportes">
      <h3 id="elegir-aportes" className="font-bold">
        Elegir entre los aportes públicos
      </h3>
      <p className="text-tinta-75 mt-2 text-sm leading-relaxed">
        Cada aporte que vincules queda como «{RELACIONES[relacion]}». Si su autor reservó el texto,
        se vincula igual pero el texto no se muestra.
      </p>
      <ErrorOperacion mensaje={q.error?.message} />
      {q.isLoading ? (
        <p role="status" className="mt-3 text-sm">
          Buscando aportes…
        </p>
      ) : (
        <ul className="divide-tinta/25 mt-3 divide-y">
          {q.data?.registros.map((v) => {
            const hecho = vinculados.includes(v.id);
            return (
              <li key={v.id} className="py-3">
                <p className="font-space text-tinta-50 text-[10px] uppercase tracking-[.12em]">
                  {v.tipo}
                </p>
                <p className="mt-1 text-sm">
                  {v.texto?.slice(0, LARGO_MAXIMO) ?? 'Texto reservado por su autor.'}
                </p>
                {hecho ? (
                  <p className="text-violeta mt-2 text-sm">Vinculado: {RELACIONES[relacion]}</p>
                ) : (
                  <BotonPapel
                    type="button"
                    variant="fantasma"
                    className="mt-2"
                    onClick={() => {
                      elegir(v.id, v.texto);
                    }}
                  >
                    Vincular este aporte
                  </BotonPapel>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {q.data?.registros.length === 0 ? (
        <p className="mt-3 text-sm">Todavía no hay aportes públicos para elegir.</p>
      ) : null}
      {q.data?.siguiente ? (
        <BotonPapel
          type="button"
          variant="fantasma"
          className="mt-3"
          onClick={() => {
            setCursor(q.data.siguiente ?? '');
          }}
        >
          Ver más aportes
        </BotonPapel>
      ) : null}
    </section>
  );
}

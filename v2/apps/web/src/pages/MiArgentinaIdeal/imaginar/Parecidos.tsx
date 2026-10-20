import { useState } from 'react';

import { deDonde } from '../comun/lugar';

import { BotonAccion } from '~/components/participacion/Elementos';
import { useParecidos, useSumarmeAParecido } from '~/lib/queries/parecidos';

/**
 * «Otras personas imaginan algo parecido» (spec §3, entrega 2): hasta tres aportes
 * que ya existen y se parecen en las palabras a lo que la persona está escribiendo.
 * «Me sumo» cuenta como «Yo también» en Mirar, y no impide publicar el propio.
 *
 * Si la API falla o no encuentra nada, no se muestra nada: no es un paso.
 */
export function Parecidos({ texto, provinciaId }: { texto: string; provinciaId: number | null }) {
  const parecidos = useParecidos(texto);
  const sumarme = useSumarmeAParecido();
  const [sumados, setSumados] = useState<ReadonlySet<string>>(() => new Set());
  const [fallo, setFallo] = useState<string | null>(null);
  const lista = parecidos.data ?? [];
  if (parecidos.isError || lista.length === 0) return null;

  const sumar = (id: string) => {
    setFallo(null);
    sumarme.mutate(
      { id, provinciaId },
      {
        onSuccess: () => {
          setSumados((antes) => new Set(antes).add(id));
        },
        onError: () => {
          setFallo(id);
        },
      },
    );
  };

  return (
    <section
      aria-labelledby="parecidos-titulo"
      className="border-papel-borde flex flex-col gap-3 border-t pt-4"
    >
      <h3 id="parecidos-titulo" className="font-anton text-[22px] leading-tight">
        Otras personas imaginan algo parecido
      </h3>
      <p className="text-tinta-50 text-sm leading-relaxed">
        Se parecen en las palabras. Sumarte cuenta como «Yo también», y además podés publicar el
        tuyo.
      </p>
      <ul className="flex flex-col gap-3">
        {lista.map((p) => (
          <li
            key={p.id}
            className="bg-papel-crudo border-papel-borde flex flex-col gap-3 border px-4 py-3"
          >
            <p className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.12em]">
              Alguien de {deDonde(p.provincia)} imagina
            </p>
            <p
              id={`parecido-${p.id}`}
              className="font-archivo text-tinta text-[17px] font-semibold leading-snug"
            >
              «{p.texto}»
            </p>
            {sumados.has(p.id) ? (
              <p
                role="status"
                className="font-space text-violeta text-xs font-bold uppercase tracking-[0.08em]"
              >
                Te sumaste
              </p>
            ) : (
              <BotonAccion
                type="button"
                tono="papel"
                className="min-h-11 self-start px-5 py-3"
                aria-describedby={`parecido-${p.id}`}
                ocupado={sumarme.isPending && sumarme.variables.id === p.id}
                onClick={() => {
                  sumar(p.id);
                }}
              >
                Me sumo
              </BotonAccion>
            )}
            {fallo === p.id ? (
              <p role="alert" className="text-sello text-sm">
                No pudimos sumarte. Probá de nuevo.
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

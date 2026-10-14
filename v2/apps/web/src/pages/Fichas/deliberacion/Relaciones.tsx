import { relacionEntreFichasSchema, type FichaFuturo } from '@v2/shared';
import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { CampoDato } from '../cuaderno/CampoDato';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useRelacionesFichas } from '~/lib/queries/deliberacion';
import { useOperacionPersonal } from '~/lib/queries/participacion';

export const TIPOS_RELACION = [
  ['objetivo_compartido', 'Comparte un objetivo con'],
  ['complementa', 'Complementa a'],
  ['depende', 'Depende de'],
  ['tension', 'Entra en tensión con'],
  ['hipotesis_causal', 'Podría influir en (hipótesis causal)'],
] as const;
export function Relaciones({ ficha }: { ficha: FichaFuturo }) {
  const q = useRelacionesFichas(ficha.id);
  const op = useOperacionPersonal();
  const [retirar, setRetirar] = useState<string | null>(null);
  return (
    <section
      className="border-tinta mt-10 border-t-2 pt-8"
      id="relaciones"
      aria-labelledby="titulo-relaciones"
    >
      <h2 id="titulo-relaciones" className="font-anton text-4xl">
        Cómo se conecta con otras fichas
      </h2>
      <p className="mt-4">
        Los vínculos los propone el equipo de la ficha de origen. Expresan una relación a revisar;
        no prueban causalidad ni el acuerdo del otro equipo.
      </p>
      <Link className="mt-3 inline-flex min-h-11 underline" href="/vision-compartida">
        Explorar la visión compartida del país →
      </Link>
      {q.isPending ? <p role="status">Consultando relaciones…</p> : null}
      <ErrorOperacion mensaje={q.error?.message ?? op.error?.message} />
      {q.isError ? (
        <button
          className="min-h-11 underline"
          onClick={() => {
            void q.refetch();
          }}
        >
          Reintentar relaciones
        </button>
      ) : null}
      {q.data?.relaciones.length === 0 ? (
        <p className="mt-4">Todavía no hay relaciones documentadas.</p>
      ) : null}
      <ul className="mt-4 space-y-4">
        {q.data?.relaciones.map((r) => (
          <li key={r.id} className="border-tinta border p-5">
            <p>
              <Link href={`/fichas/${r.origenId}`} className="underline">
                {r.origenTitulo}
              </Link>{' '}
              · {TIPOS_RELACION.find(([v]) => v === r.tipo)?.[1]} ·{' '}
              <Link href={`/fichas/${r.destinoId}`} className="underline">
                {r.destinoTitulo}
              </Link>
            </p>
            <p className="mt-3 whitespace-pre-wrap break-words">{r.justificacion}</p>
            {r.fuente ? (
              <a
                className="mt-2 inline-flex min-h-11 underline"
                href={r.fuente}
                target="_blank"
                rel="noreferrer"
              >
                Consultar fuente de la relación
              </a>
            ) : null}
            {r.puedoRetirar ? (
              retirar === r.id ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  <BotonPapel
                    disabled={op.isPending}
                    onClick={() => {
                      op.mutate(
                        { metodo: 'delete', ruta: `/api/v1/fichas/relaciones/${r.id}` },
                        {
                          onSuccess: () => {
                            setRetirar(null);
                          },
                        },
                      );
                    }}
                  >
                    Confirmar retiro del vínculo
                  </BotonPapel>
                  <button
                    className="min-h-11 underline"
                    onClick={() => {
                      setRetirar(null);
                    }}
                  >
                    Cancelar retiro
                  </button>
                </div>
              ) : (
                <button
                  className="mt-2 block min-h-11 underline"
                  onClick={() => {
                    setRetirar(r.id);
                  }}
                >
                  Retirar vínculo
                </button>
              )
            ) : null}
          </li>
        ))}
      </ul>
      {q.data && !q.data.completa ? (
        <p className="mt-3">Se muestran las primeras 200 relaciones. Esta lista es parcial.</p>
      ) : null}
      {ficha.puedoEditar ? <NuevaRelacion fichaId={ficha.id} /> : null}
    </section>
  );
}
function NuevaRelacion({ fichaId }: { fichaId: string }) {
  const [v, setV] = useState({
    destinoId: '',
    tipo: 'objetivo_compartido',
    justificacion: '',
    fuente: '',
  });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const recibo = useRef(crypto.randomUUID());
  const op = useOperacionPersonal();
  return (
    <details className="mt-5">
      <summary className="min-h-11 cursor-pointer underline">
        Proponer un vínculo con otra ficha
      </summary>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          setAviso('');
          const destinoId = v.destinoId.trim().split('/fichas/').at(-1)?.split(/[?#]/)[0];
          const r = relacionEntreFichasSchema.safeParse({
            ...v,
            destinoId,
            fuente: v.fuente || null,
            idLocal: recibo.current,
          });
          if (!r.success || destinoId === fichaId) {
            setError(
              'Ingresá el enlace o identificador de otra ficha, explicá la relación y agregá una fuente si proponés una hipótesis causal.',
            );
            return;
          }
          op.mutate(
            { metodo: 'post', ruta: `/api/v1/fichas/${fichaId}/relaciones`, cuerpo: r.data },
            {
              onSuccess: () => {
                recibo.current = crypto.randomUUID();
                setV({ destinoId: '', tipo: 'objetivo_compartido', justificacion: '', fuente: '' });
                setAviso('Registramos el vínculo propuesto.');
              },
            },
          );
        }}
      >
        <fieldset disabled={op.isPending}>
          <Link href="/fichas" target="_blank" className="inline-flex min-h-11 underline">
            Buscar otra ficha en una pestaña nueva
          </Link>
          <CampoDato
            etiqueta="Enlace o identificador de la otra ficha"
            valor={v.destinoId}
            cambiar={(destinoId) => {
              setV({ ...v, destinoId });
            }}
          />
          <CampoDato
            etiqueta="Relación desde esta ficha hacia la otra"
            valor={v.tipo}
            opciones={TIPOS_RELACION}
            cambiar={(tipo) => {
              setV({ ...v, tipo });
            }}
          />
          <CampoDato
            etiqueta="Por qué proponés esta relación y cuáles son sus límites"
            tipo="largo"
            valor={v.justificacion}
            cambiar={(justificacion) => {
              setV({ ...v, justificacion });
            }}
          />
          <CampoDato
            etiqueta="Fuente de la relación (enlace)"
            tipo="url"
            valor={v.fuente}
            cambiar={(fuente) => {
              setV({ ...v, fuente });
            }}
          />
          <ErrorOperacion mensaje={error || op.error?.message} />
          <BotonPapel type="submit" className="mt-4">
            Registrar vínculo propuesto
          </BotonPapel>
        </fieldset>
        {aviso ? (
          <p role="status" className="mt-3">
            {aviso}
          </p>
        ) : null}
      </form>
    </details>
  );
}

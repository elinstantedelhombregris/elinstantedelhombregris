import { argumentoFichaSchema, type FichaFuturo, type ArgumentoFicha } from '@v2/shared';
import { useRef, useState } from 'react';

import { CampoDato } from '../cuaderno/CampoDato';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal, useDisenoFicha } from '~/lib/queries/participacion';

export const TIPOS_ARGUMENTO = [
  ['argumento', 'Argumento'],
  ['objecion', 'Objeción'],
  ['evidencia', 'Evidencia'],
  ['respuesta', 'Respuesta'],
] as const;
export function NuevoArgumento({
  ficha,
  argumentos,
}: {
  ficha: FichaFuturo;
  argumentos: ArgumentoFicha[];
}) {
  const auth = useAuth();
  const diseno = useDisenoFicha(ficha.id, auth.user?.id);
  const [valor, setValor] = useState({
    tipo: 'argumento',
    texto: '',
    firma: '',
    respondeA: '',
    alternativaId: '',
    fuenteIds: [] as string[],
  });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const recibo = useRef(crypto.randomUUID());
  const op = useOperacionPersonal();
  return (
    <form
      className="border-tinta mt-6 border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError('');
        setAviso('');
        const r = argumentoFichaSchema.safeParse({
          ...valor,
          idLocal: recibo.current,
          respondeA: valor.respondeA || null,
          alternativaId: valor.alternativaId || null,
        });
        if (!r.success) {
          setError(
            'Escribí al menos 10 caracteres y una firma de 3 a 120 caracteres. Si respondés, elegí un argumento.',
          );
          return;
        }
        op.mutate(
          { metodo: 'post', ruta: `/api/v1/fichas/${ficha.id}/argumentos`, cuerpo: r.data },
          {
            onSuccess: () => {
              setValor({ ...valor, texto: '', respondeA: '', tipo: 'argumento', fuenteIds: [] });
              recibo.current = crypto.randomUUID();
              setAviso('Publicamos tu intervención.');
            },
          },
        );
      }}
    >
      <h3 className="font-anton text-2xl">Sumá una razón, una objeción o evidencia</h3>
      <p className="mt-3 text-sm">
        El texto y la firma elegida serán públicos. Evitá datos de salud, domicilios, teléfonos y
        datos de otras personas. Una firma es una declaración de autoría, no una identidad
        verificada.
      </p>
      <fieldset disabled={op.isPending}>
        <CampoDato
          etiqueta="Tipo de intervención"
          valor={valor.tipo}
          opciones={TIPOS_ARGUMENTO}
          cambiar={(tipo) => {
            setValor({ ...valor, tipo });
          }}
        />
        <CampoDato
          etiqueta="Tu intervención"
          tipo="largo"
          valor={valor.texto}
          cambiar={(texto) => {
            setValor({ ...valor, texto });
          }}
        />
        <CampoDato
          etiqueta="Firma pública"
          valor={valor.firma}
          cambiar={(firma) => {
            setValor({ ...valor, firma });
          }}
        />
        <CampoDato
          etiqueta="Responde a"
          valor={valor.respondeA}
          opciones={[
            ['', 'Intervención independiente'],
            ...argumentos
              .filter((a) => !a.retirado)
              .map((a): [string, string] => [
                a.id,
                `${a.firma ?? 'Sin firma'}: ${a.texto?.slice(0, 100) ?? ''}`,
              ]),
          ]}
          cambiar={(respondeA) => {
            setValor({ ...valor, respondeA });
          }}
        />
        <CampoDato
          etiqueta="Alternativa discutida"
          valor={valor.alternativaId}
          opciones={[
            ['', 'La ficha en general'],
            ...(diseno.data?.alternativas ?? []).map((a): [string, string] => [a.id, a.titulo]),
          ]}
          cambiar={(alternativaId) => {
            setValor({ ...valor, alternativaId });
          }}
        />
        {diseno.isError ? (
          <p role="alert">
            No pudimos consultar las alternativas.{' '}
            <button
              type="button"
              className="underline"
              onClick={() => {
                void diseno.refetch();
              }}
            >
              Reintentar alternativas
            </button>
          </p>
        ) : null}
        <fieldset className="mt-4">
          <legend>Fuentes del cuaderno que usás</legend>
          {(ficha.contenido.cuaderno?.fuentes ?? []).map((f) => (
            <label key={f.id} className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                checked={valor.fuenteIds.includes(f.id)}
                onChange={(e) => {
                  setValor({
                    ...valor,
                    fuenteIds: e.target.checked
                      ? [...valor.fuenteIds, f.id]
                      : valor.fuenteIds.filter((id) => id !== f.id),
                  });
                }}
              />
              {f.titulo}
            </label>
          ))}
          {!ficha.contenido.cuaderno?.fuentes.length ? (
            <p className="mt-2 text-sm">
              Todavía no hay fuentes documentadas. Incluí la referencia y sus límites en el texto.
            </p>
          ) : null}
        </fieldset>
        <ErrorOperacion mensaje={error || op.error?.message} />
        <BotonPapel type="submit" className="mt-4">
          Publicar intervención
        </BotonPapel>
      </fieldset>
      {aviso ? (
        <p role="status" className="mt-4">
          {aviso}
        </p>
      ) : null}
    </form>
  );
}

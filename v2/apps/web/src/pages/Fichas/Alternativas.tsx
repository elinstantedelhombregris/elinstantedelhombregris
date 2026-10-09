import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { Campo } from './Campo';
import { TITULOS_DE_DISENO } from './presentacion';

import type { DisenoFicha } from '@v2/shared';

import { BotonPapel } from '~/components/papel/primitives';
import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';

const CAMPOS = [
  ['titulo', 'Nombre de la alternativa'],
  ['funcionamiento', 'Cómo funcionaría'],
  ['resultado', 'Qué condición de vida haría posible'],
  ['dependencias', 'Qué necesita de otros sistemas o equipos'],
  ['presupuesto', 'Costos, recursos y supuestos que necesitamos contrastar'],
  ['prueba', 'Qué prueba pequeña permitiría aprender'],
  ['criterioPausa', 'Qué resultado nos haría detenernos o rediseñar'],
] as const;
type Clave = (typeof CAMPOS)[number][0];
type Valores = Record<Clave, string>;

const VACIO: Valores = {
  titulo: '',
  funcionamiento: '',
  resultado: '',
  dependencias: '',
  presupuesto: '',
  prueba: '',
  criterioPausa: '',
};
/** Lo que pide el servidor, con el mensaje que ve quien escribe. */
const MINIMOS: Partial<Record<Clave, [number, string]>> = {
  titulo: [5, 'Poné un nombre de al menos 5 caracteres.'],
  funcionamiento: [20, 'Contá cómo funcionaría, en al menos 20 caracteres.'],
  resultado: [10, 'Decí qué condición de vida haría posible, en al menos 10 caracteres.'],
  prueba: [15, 'Proponé una prueba pequeña, en al menos 15 caracteres.'],
  criterioPausa: [10, 'Decí qué resultado nos haría frenar, en al menos 10 caracteres.'],
};

function validar(v: Valores): Partial<Record<Clave, string>> {
  const errores: Partial<Record<Clave, string>> = {};
  for (const [clave, [minimo, mensaje]] of Object.entries(MINIMOS) as [Clave, [number, string]][])
    if (v[clave].trim().length < minimo) errores[clave] = mensaje;
  return errores;
}

export function Alternativas({
  fichaId,
  datos,
  hrefIngreso,
}: {
  fichaId: string;
  datos: DisenoFicha;
  hrefIngreso: string;
}) {
  const auth = useAuth();
  const op = useOperacionPersonal();
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState('');
  const [errores, setErrores] = useState<Partial<Record<Clave, string>>>({});
  const [v, setV] = useState<Valores>(VACIO);
  const id = useRef(crypto.randomUUID());
  const formulario = useRef<HTMLFormElement>(null);
  return (
    <section aria-labelledby="alternativas-titulo">
      <h3 id="alternativas-titulo" className="font-anton text-3xl">
        {TITULOS_DE_DISENO.alternativas}
      </h3>
      <p className="mt-4 leading-relaxed">
        Una alternativa cuenta cómo funcionaría, qué necesita de otros y cómo se podría probar.
        Leelas por su funcionamiento y sus condiciones: un mismo propósito puede pedir alternativas
        distintas según el lugar.
      </p>
      <p
        role="status"
        className={aviso ? 'border-violeta my-4 border-l-2 pl-4 text-sm' : 'sr-only'}
      >
        {aviso}
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {datos.alternativas.map((a) => (
          <article key={a.id} className="bg-papel-crudo border-tinta border p-5">
            <h4 className="font-anton text-2xl">{a.titulo}</h4>
            {CAMPOS.filter(([k]) => k !== 'titulo').map(([k, label]) => (
              <div key={k} className="mt-5">
                <h5 className="font-semibold">{label}</h5>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                  {a[k] || 'Todavía pendiente de desarrollo.'}
                </p>
              </div>
            ))}
          </article>
        ))}
      </div>
      {!datos.alternativas.length ? (
        <Nota>
          Todavía no hay alternativas. Una alternativa necesita decir cómo funcionaría y cómo se
          podría aprender de una prueba.
        </Nota>
      ) : null}
      {auth.user ? (
        <>
          <BotonPapel
            type="button"
            variant="fantasma"
            className="mt-6"
            onClick={() => {
              setAviso('');
              setAbierto(!abierto);
            }}
          >
            {abierto ? 'Cerrar el formulario' : 'Proponer una alternativa'}
          </BotonPapel>
          {abierto ? (
            <form
              ref={formulario}
              noValidate
              className="border-tinta mt-5 border p-5"
              onSubmit={(e) => {
                e.preventDefault();
                const problemas = validar(v);
                setErrores(problemas);
                if (Object.keys(problemas).length) {
                  requestAnimationFrame(() => {
                    formulario.current
                      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
                      ?.focus();
                  });
                  return;
                }
                op.mutate(
                  {
                    metodo: 'post',
                    ruta: `/api/v1/fichas/${fichaId}/alternativas`,
                    cuerpo: { ...v, idLocal: id.current },
                  },
                  {
                    onSuccess: () => {
                      setV(VACIO);
                      id.current = crypto.randomUUID();
                      setAbierto(false);
                      setAviso('Publicamos la alternativa.');
                    },
                  },
                );
              }}
            >
              {CAMPOS.map(([k, label]) => (
                <Campo key={k} className="mt-5" etiqueta={label} error={errores[k]}>
                  {(a) =>
                    k === 'titulo' ? (
                      <input
                        {...a}
                        className={CAMPO}
                        maxLength={160}
                        value={v[k]}
                        onChange={(e) => {
                          setV((p) => ({ ...p, [k]: e.target.value }));
                        }}
                      />
                    ) : (
                      <textarea
                        {...a}
                        className={CAMPO}
                        rows={3}
                        maxLength={4000}
                        value={v[k]}
                        onChange={(e) => {
                          setV((p) => ({ ...p, [k]: e.target.value }));
                        }}
                      />
                    )
                  }
                </Campo>
              ))}
              <Nota>
                Esta alternativa se publica como propuesta. No afirma que haya presupuesto, recursos
                ni acuerdo institucional. Sus supuestos quedan a la vista para contrastarlos.
              </Nota>
              <ErrorOperacion mensaje={op.error?.message} />
              <div className="flex flex-wrap items-center gap-3">
                <BotonConMotivo type="submit" motivo={null} ocupado={op.isPending}>
                  Publicar alternativa
                </BotonConMotivo>
              </div>
            </form>
          ) : null}
        </>
      ) : (
        <p className="mt-5">
          Las alternativas se pueden leer sin cuenta.{' '}
          <Link href={hrefIngreso} className="text-violeta underline">
            Ingresá para proponer una
          </Link>
          .
        </p>
      )}
    </section>
  );
}

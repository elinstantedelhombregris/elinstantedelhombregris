import { useRef, useState } from 'react';

import type { DisenoFicha } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';

const CAMPOS = [
  ['titulo', 'Nombre del diseño'],
  ['funcionamiento', 'Cómo funcionaría'],
  ['resultado', 'Qué condición de vida haría posible'],
  ['dependencias', 'Qué necesita de otros sistemas o equipos'],
  ['presupuesto', 'Costos, recursos y supuestos que necesitamos contrastar'],
  ['prueba', 'Qué prueba pequeña permitiría aprender'],
  ['criterioPausa', 'Qué resultado nos haría detenernos o rediseñar'],
] as const;
export function Alternativas({ fichaId, datos }: { fichaId: string; datos: DisenoFicha }) {
  const auth = useAuth();
  const op = useOperacionPersonal();
  const [abierto, setAbierto] = useState(false);
  const [v, setV] = useState({
    titulo: '',
    funcionamiento: '',
    resultado: '',
    dependencias: '',
    presupuesto: '',
    prueba: '',
    criterioPausa: '',
  });
  const id = useRef(crypto.randomUUID());
  return (
    <section>
      <h3 className="font-anton text-3xl">
        Varias formas de hacer
        <br />
        posible una misma vida.
      </h3>
      <p className="mt-4 leading-relaxed">
        Compará funcionamiento y condiciones, no solo nombres. Podemos compartir un propósito y
        necesitar diseños diferentes según el territorio.
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {datos.alternativas.map((a) => (
          <article key={a.id} className="bg-papel-crudo border p-5">
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
          El diseño sigue abierto. Una alternativa necesita decir cómo funcionaría y cómo podríamos
          aprender de una prueba.
        </Nota>
      ) : null}
      {auth.user ? (
        <>
          <BotonAccion
            tono="papel"
            className="mt-6"
            onClick={() => {
              setAbierto(!abierto);
            }}
          >
            {abierto ? 'Cerrar el formulario' : 'Proponer otro diseño'}
          </BotonAccion>
          {abierto ? (
            <form
              className="mt-5 border p-5"
              onSubmit={(e) => {
                e.preventDefault();
                op.mutate(
                  {
                    metodo: 'post',
                    ruta: `/api/v1/fichas/${fichaId}/alternativas`,
                    cuerpo: { ...v, idLocal: id.current },
                  },
                  {
                    onSuccess: () => {
                      setV({
                        titulo: '',
                        funcionamiento: '',
                        resultado: '',
                        dependencias: '',
                        presupuesto: '',
                        prueba: '',
                        criterioPausa: '',
                      });
                      id.current = crypto.randomUUID();
                      setAbierto(false);
                    },
                  },
                );
              }}
            >
              {CAMPOS.map(([k, label]) => (
                <label key={k} className="mt-5 block">
                  {label}
                  {k === 'titulo' ? (
                    <input
                      className={CAMPO}
                      maxLength={160}
                      value={v[k]}
                      onChange={(e) => {
                        setV((p) => ({ ...p, [k]: e.target.value }));
                      }}
                    />
                  ) : (
                    <textarea
                      className={CAMPO}
                      rows={3}
                      maxLength={4000}
                      value={v[k]}
                      onChange={(e) => {
                        setV((p) => ({ ...p, [k]: e.target.value }));
                      }}
                    />
                  )}
                </label>
              ))}
              <Nota>
                Este diseño se publica como propuesta. No afirma que haya presupuesto, recursos ni
                acuerdo institucional. Sus supuestos quedan a la vista para contrastarlos.
              </Nota>
              <ErrorOperacion mensaje={op.error?.message} />
              <BotonAccion type="submit" disabled={op.isPending}>
                Publicar alternativa
              </BotonAccion>
            </form>
          ) : null}
        </>
      ) : (
        <p className="mt-5">
          Ingresá para proponer una alternativa. Las propuestas públicas siguen abiertas a lectura.
        </p>
      )}
    </section>
  );
}

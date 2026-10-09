import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';

import type { AnalisisOpiniones } from '@v2/civic-core';
import type { DisenoFicha } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal, escribir } from '~/lib/queries/participacion';

export function Afirmaciones({
  fichaId,
  datos,
}: {
  fichaId: string;
  datos: DisenoFicha & { analisisOpiniones: AnalisisOpiniones };
}) {
  const auth = useAuth();
  const [texto, setTexto] = useState('');
  const idLocal = useRef(crypto.randomUUID());
  const op = useOperacionPersonal();
  return (
    <section>
      <h3 className="font-anton text-3xl">
        Qué podemos compartir
        <br />y dónde pensamos distinto.
      </h3>
      <p className="mt-4 leading-relaxed">
        Una afirmación contiene una idea. Las respuestas expresan acuerdo, desacuerdo o la elección
        de pasar. No comprueban un hecho ni autorizan una política por sí solas.
      </p>
      <ul className="mt-6 space-y-5">
        {datos.afirmaciones.map((a) => (
          <Tarjeta key={a.id} afirmacion={a} />
        ))}
      </ul>
      {!datos.afirmaciones.length ? (
        <Nota>
          Todavía no hay afirmaciones. Podés proponer una condición de vida para que otros la
          examinen.
        </Nota>
      ) : null}
      {auth.user ? (
        <form
          className="mt-7 border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            op.mutate(
              {
                metodo: 'post',
                ruta: `/api/v1/fichas/${fichaId}/afirmaciones`,
                cuerpo: { idLocal: idLocal.current, texto },
              },
              {
                onSuccess: () => {
                  setTexto('');
                  idLocal.current = crypto.randomUUID();
                },
              },
            );
          }}
        >
          <label className="block">
            Una condición o idea para conversar
            <textarea
              rows={3}
              maxLength={500}
              className={CAMPO}
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
              }}
              placeholder="Que podamos elegir dónde vivir sin renunciar a nuestras oportunidades."
            />
          </label>
          <p className="text-tinta-50 mt-3 text-sm">
            La afirmación se publica con esta ficha. Su autoría de cuenta permanece privada.
          </p>
          <ErrorOperacion mensaje={op.error?.message} />
          <BotonAccion
            type="submit"
            className="mt-4"
            disabled={texto.trim().length < 10 || op.isPending}
          >
            Proponer esta afirmación
          </BotonAccion>
        </form>
      ) : (
        <Link
          href="/ingresar?volver=%2Fmi-espacio"
          className="text-violeta mt-4 inline-flex min-h-11 items-center underline"
        >
          Ingresar para responder o proponer
        </Link>
      )}
      <section className="mt-9 border-t pt-6">
        <h4 className="font-anton text-2xl">Lectura de las respuestas</h4>
        <p className="mt-3 text-sm leading-relaxed">{datos.analisisOpiniones.motivo}</p>
        <p className="text-tinta-50 mt-3 text-sm">
          {datos.analisisOpiniones.participantes} cuentas con exposición o respuesta ·{' '}
          {datos.analisisOpiniones.incluidos} incluidas en la proyección.
        </p>
        {datos.analisisOpiniones.grupos.length ? (
          <>
            <ul className="mt-4 flex flex-wrap gap-4">
              {datos.analisisOpiniones.grupos.map((g) => (
                <li key={g.nombre} className="border px-4 py-3">
                  {g.nombre}: {g.cuentas} cuentas
                </li>
              ))}
            </ul>
            <ul className="mt-5 space-y-3">
              {datos.analisisOpiniones.condiciones.map((c) => (
                <li key={c.afirmacion} className="border p-4">
                  <p>{datos.afirmaciones.find((a) => a.id === c.afirmacion)?.texto}</p>
                  <p className="mt-2 text-sm">
                    {c.grupos
                      .map(
                        (g) =>
                          `${g.nombre}: ${g.acuerdos === null ? 'datos insuficientes' : `${g.acuerdos} acuerdos de ${g.respuestas ?? '—'} respuestas`}`,
                      )
                      .join(' · ')}
                  </p>
                  <p className="text-tinta-50 mt-2 text-sm">
                    Indicador de apoyo distribuido:{' '}
                    {c.apoyo === null ? 'pendiente' : c.apoyo.toFixed(3)}. Se compara dentro de esta
                    lectura.
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <details className="mt-4">
          <summary className="min-h-11 cursor-pointer py-3 underline">Método y límites</summary>
          <p className="text-tinta-75 mt-2 text-sm leading-relaxed">
            {datos.analisisOpiniones.metodo} El pase cuenta como respuesta; la ausencia no se
            interpreta como acuerdo. Los grupos son una hipótesis de esta ficha y no una identidad
            política ni una representación del país.
          </p>
        </details>
      </section>
    </section>
  );
}
function Tarjeta({ afirmacion: a }: { afirmacion: DisenoFicha['afirmaciones'][number] }) {
  const auth = useAuth();
  const op = useOperacionPersonal();
  const ref = useRef<HTMLLIElement>(null);
  const registrada = useRef<string | null>(null);
  useEffect(() => {
    if (!auth.user || a.miExpuesta || !ref.current) return;
    const clave = `${auth.user.id}:${a.id}`;
    if (registrada.current === clave) return;
    const registrar = () => {
      registrada.current = clave;
      void escribir('post', `/api/v1/fichas/afirmaciones/${a.id}/exposicion`).catch(() => {
        registrada.current = null;
      });
    };
    if (typeof IntersectionObserver === 'undefined') return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          registrar();
          observador.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observador.observe(ref.current);
    return () => {
      observador.disconnect();
    };
  }, [auth.user, a.id, a.miExpuesta]);
  return (
    <li ref={ref} className="bg-papel-crudo border p-5">
      <p className="text-lg leading-relaxed">{a.texto}</p>
      {auth.user ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {(
            [
              ['acuerdo', 'Estoy de acuerdo'],
              ['desacuerdo', 'No estoy de acuerdo'],
              ['paso', 'Prefiero pasar'],
            ] as const
          ).map(([valor, rotulo]) => (
            <BotonAccion
              key={valor}
              tono={a.miRespuesta === valor ? 'violeta' : 'papel'}
              disabled={op.isPending}
              aria-pressed={a.miRespuesta === valor}
              onClick={() => {
                op.mutate({
                  metodo: 'post',
                  ruta: `/api/v1/fichas/afirmaciones/${a.id}/respuesta`,
                  cuerpo: { valor },
                });
              }}
            >
              {rotulo}
            </BotonAccion>
          ))}
        </div>
      ) : null}
      <p className="text-tinta-50 mt-4 text-sm">
        {a.acuerdo === null
          ? `${a.respuestas} respuestas; el desglose público espera al menos cinco.`
          : `${a.acuerdo} acuerdos · ${a.desacuerdo ?? '—'} desacuerdos · ${a.paso ?? '—'} pases.`}
      </p>
      <ErrorOperacion mensaje={op.error?.message} />
      {a.puedoRetirar ? (
        <button
          type="button"
          className="text-sello mt-3 min-h-11 underline"
          onClick={() => {
            op.mutate({ metodo: 'delete', ruta: `/api/v1/fichas/afirmaciones/${a.id}` });
          }}
        >
          Retirar mi afirmación
        </button>
      ) : null}
    </li>
  );
}

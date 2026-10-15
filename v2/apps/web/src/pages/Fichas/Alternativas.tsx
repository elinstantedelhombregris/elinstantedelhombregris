import {
  alternativaSchema,
  type DisenoFicha,
  type DetalleAlternativa,
  type RevisionAlternativa,
} from '@v2/shared';
import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { ComparadorAlternativas } from './alternativas/ComparadorAlternativas';
import { DETALLE_VACIO } from './alternativas/detalle';
import {
  FormularioDetalleAlternativa,
  LeerDetalleAlternativa,
} from './alternativas/DetalleAlternativa';
import { ExplorarDisponibilidad } from './alternativas/ExplorarDisponibilidad';
import { CAMPOS, VACIO, validar, type Valores } from './alternativas/formulario';
import { RevisionPorObjecion } from './alternativas/RevisionPorObjecion';
import { Campo } from './Campo';
import { TITULOS_DE_DISENO } from './presentacion';

import { BotonPapel } from '~/components/papel/primitives';
import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';

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
  const [errores, setErrores] = useState<Partial<Record<keyof Valores, string>>>({});
  const [v, setV] = useState<Valores>(VACIO);
  const [detalle, setDetalle] = useState<DetalleAlternativa>(DETALLE_VACIO);
  const [revisionDe, setRevisionDe] = useState<RevisionAlternativa | null>(null);
  const [errorDetalle, setErrorDetalle] = useState('');
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
      <ComparadorAlternativas alternativas={datos.alternativas} />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {datos.alternativas.map((a) => (
          <article
            id={`alternativa-${a.id}`}
            key={a.id}
            className="bg-papel-crudo border-tinta border p-5"
          >
            <h4 className="font-anton text-2xl">{a.titulo}</h4>
            {a.revisionDe ? (
              <div className="mt-3 text-sm">
                <a
                  className="inline-flex min-h-11 underline"
                  href={`#alternativa-${a.revisionDe.anteriorId}`}
                >
                  Consultar propuesta anterior
                </a>
                <p>
                  {a.revisionPendiente
                    ? 'La objeción fue retirada. Esta revisión necesita revisar su fundamento; la explicación asociada queda oculta.'
                    : a.revisionDe.motivo}
                </p>
                {!a.revisionPendiente ? (
                  <a
                    className="inline-flex min-h-11 underline"
                    href={`#argumento-${a.revisionDe.objecionId}`}
                  >
                    Ver objeción en la conversación
                  </a>
                ) : null}
              </div>
            ) : null}
            {CAMPOS.filter(([k]) => k !== 'titulo').map(([k, label]) => (
              <div key={k} className="mt-5">
                <h5 className="font-semibold">{label}</h5>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                  {a[k] || 'Todavía pendiente de desarrollo.'}
                </p>
              </div>
            ))}
            <LeerDetalleAlternativa detalle={a.detalle} />
            <ExplorarDisponibilidad titulo={a.titulo} />
            {auth.user ? (
              <button
                className="mt-4 min-h-11 underline"
                onClick={() => {
                  setV({
                    titulo: a.titulo,
                    funcionamiento: a.funcionamiento,
                    resultado: a.resultado,
                    dependencias: a.dependencias,
                    presupuesto: a.presupuesto,
                    prueba: a.prueba,
                    criterioPausa: a.criterioPausa,
                  });
                  setDetalle(a.detalle ?? DETALLE_VACIO);
                  setRevisionDe({ anteriorId: a.id, objecionId: '', motivo: '' });
                  id.current = crypto.randomUUID();
                  setErrores({});
                  setErrorDetalle('');
                  setAbierto(true);
                  setAviso('Preparando una revisión. La propuesta anterior se conserva.');
                  requestAnimationFrame(() => {
                    formulario.current?.scrollIntoView({ block: 'start' });
                  });
                }}
              >
                Proponer revisión de esta alternativa
              </button>
            ) : null}
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
              if (!abierto) {
                setRevisionDe(null);
                setV(VACIO);
                setDetalle(DETALLE_VACIO);
                id.current = crypto.randomUUID();
              }
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
                const cuerpo = alternativaSchema.safeParse({
                  ...v,
                  idLocal: id.current,
                  detalle: {
                    ...detalle,
                    referencias: detalle.referencias.map((r) => r.trim()).filter(Boolean),
                  },
                  ...(revisionDe ? { revisionDe } : {}),
                });
                if (!cuerpo.success) {
                  setErrorDetalle(cuerpo.error.issues[0]?.message ?? 'Revisá los detalles.');
                  return;
                }
                setErrorDetalle('');
                op.mutate(
                  {
                    metodo: 'post',
                    ruta: `/api/v1/fichas/${fichaId}/alternativas`,
                    cuerpo: cuerpo.data,
                  },
                  {
                    onSuccess: () => {
                      setV(VACIO);
                      setDetalle(DETALLE_VACIO);
                      setRevisionDe(null);
                      id.current = crypto.randomUUID();
                      setAbierto(false);
                      setAviso('Publicamos la alternativa.');
                    },
                  },
                );
              }}
            >
              <fieldset disabled={op.isPending}>
                {revisionDe ? (
                  <RevisionPorObjecion
                    fichaId={fichaId}
                    valor={revisionDe}
                    cambiar={setRevisionDe}
                  />
                ) : null}
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
                <FormularioDetalleAlternativa valor={detalle} cambiar={setDetalle} />
                <Nota>
                  Esta alternativa se publica como propuesta. No afirma que haya presupuesto,
                  recursos ni acuerdo institucional. Sus supuestos quedan a la vista para
                  contrastarlos.
                </Nota>
                <ErrorOperacion mensaje={errorDetalle || op.error?.message} />
                <div className="flex flex-wrap items-center gap-3">
                  <BotonConMotivo type="submit" motivo={null} ocupado={op.isPending}>
                    Publicar alternativa
                  </BotonConMotivo>
                </div>
              </fieldset>
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

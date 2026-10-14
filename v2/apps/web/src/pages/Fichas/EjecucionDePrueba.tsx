import { vincularEjecucionSchema } from '@v2/shared';
import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { Campo } from './Campo';

import type { DisenoFicha } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useOperacionPersonal } from '~/lib/queries/participacion';

export function EjecucionDePrueba({
  prueba: p,
  avisar,
}: {
  prueba: DisenoFicha['pruebas'][number];
  avisar: (texto: string) => void;
}) {
  const op = useOperacionPersonal();
  const idLocal = useRef(crypto.randomUUID());
  const [revision, setRevision] = useState<number | null>(null);
  const [tipo, setTipo] = useState<'nueva' | 'existente'>('nueva');
  const [titulo, setTitulo] = useState(p.titulo);
  const [resumen, setResumen] = useState(p.alcance);
  const [slug, setSlug] = useState('');
  const [hito, setHito] = useState('Revisar qué pasó y qué necesitamos cambiar');
  const [recursos, setRecursos] = useState('');
  const [consentimiento, setConsentimiento] = useState(false);
  const [error, setError] = useState('');
  if (p.ejecucion) {
    const e = p.ejecucion;
    return (
      <aside className="border-tinta/25 mt-5 border-t pt-4" aria-label="Acción organizada">
        <p>
          Iniciativa:{' '}
          <Link className="text-violeta underline" href={`/iniciativas/${e.iniciativa.slug}`}>
            {e.iniciativa.titulo}
          </Link>
        </p>
        <p className="mt-2">
          Hito de revisión: {e.hito} · {e.revisionRealizada ? 'revisión registrada' : 'pendiente'}.
        </p>
        <p className="mt-2 whitespace-pre-wrap">Recursos y condiciones: {e.recursos}</p>
        <p className="text-tinta-50 mt-2 text-sm">
          La tarea sigue los pasos de esta prueba. La ejecución declarada y el resultado revisado se
          muestran por separado.
        </p>
      </aside>
    );
  }
  if (!p.puedoGestionar) return null;
  return (
    <div className="border-tinta/25 mt-5 border-t pt-4">
      {revision === null ? (
        <button
          className="text-violeta underline"
          type="button"
          onClick={() => {
            setRevision(p.revision);
          }}
        >
          Organizar en una iniciativa
        </button>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (revision !== p.revision || op.isPending) return;
            const resultado = vincularEjecucionSchema.safeParse({
              idLocal: idLocal.current,
              revision,
              iniciativa: tipo === 'nueva' ? { tipo, titulo, resumen } : { tipo, slug },
              hito,
              recursos,
              autorizoPublicacion: consentimiento,
            });
            if (!resultado.success) {
              setError(resultado.error.issues[0]?.message ?? 'Revisá los campos.');
              return;
            }
            setError('');
            op.mutate(
              {
                metodo: 'post',
                ruta: `/api/v1/fichas/pruebas/${p.id}/ejecucion`,
                cuerpo: resultado.data,
              },
              {
                onSuccess: () => {
                  setRevision(null);
                  idLocal.current = crypto.randomUUID();
                  avisar(
                    'Vinculamos la prueba con una iniciativa, su tarea y su hito de revisión.',
                  );
                },
              },
            );
          }}
        >
          <h5 className="font-semibold">Organizar esta prueba</h5>
          <p className="text-sm">
            Se creará una tarea con este alcance y fecha de revisión. La responsabilidad se acepta
            en un paso separado. Para usar una iniciativa existente necesitás administrarla.
          </p>
          <Campo etiqueta="Dónde organizarla">
            {(attrs) => (
              <select
                {...attrs}
                className={CAMPO}
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value === 'existente' ? 'existente' : 'nueva');
                }}
              >
                <option value="nueva">Crear una iniciativa comunitaria</option>
                <option value="existente">Usar una iniciativa que administro</option>
              </select>
            )}
          </Campo>
          {tipo === 'nueva' ? (
            <>
              <Campo etiqueta="Nombre de la iniciativa">
                {(attrs) => (
                  <input
                    {...attrs}
                    className={CAMPO}
                    value={titulo}
                    onChange={(e) => {
                      setTitulo(e.target.value);
                    }}
                    maxLength={160}
                  />
                )}
              </Campo>
              <Campo etiqueta="Propósito de la iniciativa">
                {(attrs) => (
                  <textarea
                    {...attrs}
                    className={CAMPO}
                    value={resumen}
                    onChange={(e) => {
                      setResumen(e.target.value);
                    }}
                    maxLength={2000}
                  />
                )}
              </Campo>
            </>
          ) : (
            <Campo
              etiqueta="Identificador de la iniciativa"
              ayuda="Copiá la parte que sigue a /iniciativas/ en su enlace."
            >
              {(attrs) => (
                <input
                  {...attrs}
                  className={CAMPO}
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                  }}
                  maxLength={200}
                />
              )}
            </Campo>
          )}
          <Campo etiqueta="Hito: qué vamos a revisar">
            {(attrs) => (
              <input
                {...attrs}
                className={CAMPO}
                value={hito}
                onChange={(e) => {
                  setHito(e.target.value);
                }}
                maxLength={160}
              />
            )}
          </Campo>
          <Campo
            etiqueta="Recursos disponibles y pendientes"
            ayuda="Por ejemplo: sala reservada, falta confirmar dos personas para acompañar. Las reservas se aceptan en Capacidades; este texto no reserva existencias."
          >
            {(attrs) => (
              <textarea
                {...attrs}
                className={CAMPO}
                value={recursos}
                onChange={(e) => {
                  setRecursos(e.target.value);
                }}
                maxLength={2000}
              />
            )}
          </Campo>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={consentimiento}
              onChange={(e) => {
                setConsentimiento(e.target.checked);
              }}
            />
            Autorizo publicar este vínculo, hito y condiciones. Revisé que no contengan datos
            personales ni solicitudes privadas.
          </label>
          <ErrorOperacion mensaje={error || op.error?.message} />
          {revision !== p.revision ? (
            <p role="alert">
              La prueba cambió. Cerrá y volvé a abrir este formulario para revisar su nueva versión;
              conservamos lo escrito.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            <BotonConMotivo
              type="submit"
              ocupado={op.isPending}
              motivo={
                revision !== p.revision
                  ? 'Revisá la nueva versión.'
                  : !consentimiento
                    ? 'Falta autorizar la publicación.'
                    : null
              }
            >
              Crear tarea y vincular
            </BotonConMotivo>
            <button
              type="button"
              className="underline"
              disabled={op.isPending}
              onClick={() => {
                setRevision(null);
              }}
            >
              Cerrar formulario
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

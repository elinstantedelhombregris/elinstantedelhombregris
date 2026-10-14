import { useRef, useState } from 'react';
import { ZodError } from 'zod';

import { texto, type CampoGestion, type ValoresGestion } from './campos';

import { BotonPapel } from '~/components/papel/primitives';
import { CAMPO } from '~/components/participacion/constantes';
import { useGestionOperacion } from '~/lib/queries/gestion-iniciativas';

export function FormularioGestion({
  campos,
  iniciales = {},
  ruta,
  metodo = 'post',
  revision,
  preparar,
  boton,
  onSuccess,
}: {
  campos: CampoGestion[];
  iniciales?: ValoresGestion;
  ruta: string;
  metodo?: 'post' | 'patch';
  revision?: number;
  preparar: (v: ValoresGestion, recibo: { idLocal: string; revision?: number }) => unknown;
  boton: string;
  onSuccess?: (r: { id: number; slug?: string }) => void;
}) {
  const [v, setV] = useState(iniciales),
    [error, setError] = useState(''),
    [aviso, setAviso] = useState('');
  const [version, setVersion] = useState(revision);
  const recibo = useRef(crypto.randomUUID());
  const op = useGestionOperacion();
  const cambio = version !== revision;
  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (cambio || op.isPending) return;
        setError('');
        setAviso('');
        try {
          const cuerpo = preparar(v, {
            idLocal: recibo.current,
            ...(version !== undefined ? { revision: version } : {}),
          });
          op.mutate(
            { ruta, metodo, cuerpo },
            {
              onSuccess: (r) => {
                recibo.current = crypto.randomUUID();
                if (version !== undefined) setVersion(version + 1);
                setAviso('Guardado.');
                onSuccess?.(r);
              },
            },
          );
        } catch (e) {
          setError(
            e instanceof ZodError
              ? (e.issues[0]?.message ?? 'Revisá los campos.')
              : 'Revisá los campos.',
          );
        }
      }}
    >
      {campos.map((c) => (
        <label key={c.clave} className="block text-sm font-semibold">
          {c.tipo === 'checkbox' ? (
            <span className="flex items-start gap-3">
              <input
                className="mt-1"
                type="checkbox"
                checked={v[c.clave] === true}
                onChange={(e) => {
                  setV({ ...v, [c.clave]: e.target.checked });
                }}
              />
              {c.etiqueta}
            </span>
          ) : (
            <>
              {c.etiqueta}
              {c.opciones ? (
                <select
                  className={CAMPO}
                  value={texto(v, c.clave)}
                  onChange={(e) => {
                    setV({ ...v, [c.clave]: e.target.value });
                  }}
                >
                  <option value="">Elegí una opción</option>
                  {c.opciones.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.etiqueta}
                    </option>
                  ))}
                </select>
              ) : c.tipo === 'textarea' ? (
                <textarea
                  className={CAMPO}
                  rows={3}
                  value={texto(v, c.clave)}
                  onChange={(e) => {
                    setV({ ...v, [c.clave]: e.target.value });
                  }}
                  maxLength={12000}
                />
              ) : (
                <input
                  className={CAMPO}
                  type={c.tipo ?? 'text'}
                  value={texto(v, c.clave)}
                  onChange={(e) => {
                    setV({ ...v, [c.clave]: e.target.value });
                  }}
                  maxLength={2000}
                />
              )}
            </>
          )}
          {c.ayuda ? <span className="text-tinta-50 mt-2 block font-normal">{c.ayuda}</span> : null}
        </label>
      ))}
      {cambio ? (
        <div role="alert">
          <p>
            Hay una versión nueva. Conservamos lo escrito; revisá los cambios antes de continuar.
          </p>
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() => {
              setVersion(revision);
              recibo.current = crypto.randomUUID();
            }}
          >
            Revisé la nueva versión
          </button>
        </div>
      ) : null}
      {error || op.error ? (
        <p role="alert" className="text-sello">
          {error || op.error?.message}
        </p>
      ) : null}
      <p role="status">{aviso}</p>
      <BotonPapel type="submit" disabled={cambio || op.isPending}>
        {op.isPending ? 'Guardando…' : boton}
      </BotonPapel>
    </form>
  );
}

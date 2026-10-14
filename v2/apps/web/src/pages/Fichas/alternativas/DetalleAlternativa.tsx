import { CampoDato } from '../cuaderno/CampoDato';

import { CAMPOS_DETALLE } from './detalle';

import type { DetalleAlternativa as Detalle } from '@v2/shared';

export function FormularioDetalleAlternativa({
  valor: v,
  cambiar,
}: {
  valor: Detalle;
  cambiar: (v: Detalle) => void;
}) {
  return (
    <fieldset className="mt-6 border-t pt-5">
      <legend className="font-semibold">Consecuencias y recursos para comparar</legend>
      {CAMPOS_DETALLE.map(([key, etiqueta]) => (
        <CampoDato
          key={key}
          etiqueta={etiqueta}
          valor={v[key]}
          tipo="largo"
          cambiar={(valor) => {
            cambiar({ ...v, [key]: valor });
          }}
        />
      ))}
      <CampoDato
        etiqueta="Costo estimado (vacío si falta estimar)"
        tipo="number"
        valor={v.costo}
        cambiar={(valor) => {
          cambiar({ ...v, costo: valor === '' ? null : Number(valor) });
        }}
      />
      <CampoDato
        etiqueta="Moneda o unidad y período del costo"
        valor={v.costoUnidad}
        cambiar={(costoUnidad) => {
          cambiar({ ...v, costoUnidad });
        }}
      />
      <CampoDato
        etiqueta="Fuente del costo (enlace)"
        tipo="url"
        valor={v.fuenteCosto}
        cambiar={(fuenteCosto) => {
          cambiar({ ...v, fuenteCosto: fuenteCosto || null });
        }}
      />
      <CampoDato
        etiqueta="Plazo propuesto"
        tipo="date"
        valor={v.plazo}
        cambiar={(plazo) => {
          cambiar({ ...v, plazo: plazo || null });
        }}
      />
      <CampoDato
        etiqueta="Referencias para estudiar, incluidos planes editoriales (un enlace por línea, hasta cinco)"
        tipo="largo"
        valor={v.referencias.join('\n')}
        cambiar={(texto) => {
          cambiar({ ...v, referencias: texto.split('\n') });
        }}
      />
      <label className="mt-4 flex gap-3">
        <input
          type="checkbox"
          checked={v.situacionActual}
          onChange={(e) => {
            cambiar({ ...v, situacionActual: e.target.checked });
          }}
        />
        Esta alternativa conserva la situación actual como referencia para comparar.
      </label>
      <p className="mt-3 text-sm">
        Los campos vacíos quedan pendientes. Un costo numérico necesita fuente, unidad y período.
        Citar un plan no implica que el grupo lo haya elegido.
      </p>
    </fieldset>
  );
}
export function LeerDetalleAlternativa({ detalle: d }: { detalle: Detalle | undefined }) {
  if (!d)
    return (
      <p className="mt-4 text-sm">
        Falta documentar personas afectadas, capacidades, plazos e incertidumbre.
      </p>
    );
  return (
    <div className="mt-5 border-t pt-4">
      {d.situacionActual ? (
        <p className="font-semibold">Referencia: mantener la situación actual</p>
      ) : null}
      <dl>
        {CAMPOS_DETALLE.map(([key, etiqueta]) => (
          <div className="mt-3" key={key}>
            <dt className="font-semibold">{etiqueta}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words">
              {d[key] || 'Pendiente de documentar.'}
            </dd>
          </div>
        ))}
        <div className="mt-3">
          <dt className="font-semibold">Costo estimado</dt>
          <dd>
            {d.costo === null
              ? 'Pendiente de estimar.'
              : `${d.costo.toLocaleString('es-AR')} ${d.costoUnidad}`}
            {d.fuenteCosto ? (
              <a
                href={d.fuenteCosto}
                target="_blank"
                rel="noreferrer"
                className="ml-3 inline-flex min-h-11 underline"
              >
                Fuente del costo
              </a>
            ) : null}
          </dd>
        </div>
        <div className="mt-3">
          <dt className="font-semibold">Plazo propuesto</dt>
          <dd>{d.plazo ?? 'Pendiente de acordar.'}</dd>
        </div>
      </dl>
      {d.referencias.length ? (
        <div className="mt-3">
          <p>Referencias para estudiar; su inclusión no implica acuerdo.</p>
          <ul>
            {d.referencias.map((url, i) => (
              <li key={url}>
                <a
                  className="inline-flex min-h-11 underline"
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar referencia {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

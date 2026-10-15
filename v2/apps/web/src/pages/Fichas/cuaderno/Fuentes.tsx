import { fuenteFichaSchema, coincideConCatalogo, type FuenteFicha } from '@v2/shared';
import { useState } from 'react';

import { BusquedaTerritorial } from '../../ElMapa/instrumento/BusquedaTerritorial';

import { CampoDato } from './CampoDato';
import { TerritorioDocumentado } from './TerritorioDocumentado';

const CAMPOS = [
  ['titulo', 'Indicador o dato', 'texto'],
  ['institucion', 'Institución o equipo que produjo el dato', 'texto'],
  ['url', 'Enlace a la fuente', 'url'],
  ['referencia', 'Fecha de referencia del dato', 'date'],
  ['obtenida', 'Fecha en que se consultó', 'date'],
  ['unidad', 'Unidad de medida', 'texto'],
  ['universo', 'Qué universo abarca', 'largo'],
  ['metodo', 'Cómo se obtuvo', 'largo'],
  ['licencia', 'Licencia o condiciones de uso', 'texto'],
  ['frecuencia', 'Frecuencia de actualización esperada', 'texto'],
  ['limites', 'Límites de interpretación y comparabilidad', 'largo'],
] as const;
export function FormularioFuente({
  inicial,
  guardar,
  cancelar,
}: {
  inicial: FuenteFicha;
  guardar: (f: FuenteFicha) => void;
  cancelar: () => void;
}) {
  const [v, setV] = useState(inicial);
  const [error, setError] = useState('');
  const [lugar, setLugar] = useState('');
  return (
    <form
      className="border-tinta mt-5 border p-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const r = fuenteFichaSchema.safeParse(v);
        if (!r.success) {
          setError(r.error.issues[0]?.message ?? 'Revisá los datos de la fuente.');
          return;
        }
        guardar(r.data);
      }}
    >
      <h3 className="font-anton text-2xl">Documentar una fuente</h3>
      <p className="mt-3 text-sm">
        La fuente y su método permiten comprobar el dato. Una actualización fallida conserva el
        último valor disponible.
      </p>
      {v.catalogo ? (
        <div className="border-violeta mt-4 border-l-2 pl-3">
          <p>
            Esta fuente conserva una edición contrastada. Para modificar sus datos primero
            desvinculá la referencia.
          </p>
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() => {
              const { catalogo: _c, ...manual } = v;
              setV(manual);
            }}
          >
            Desvincular para adaptar la fuente
          </button>
        </div>
      ) : null}
      <fieldset disabled={!!v.catalogo}>
        {CAMPOS.map(([k, etiqueta, tipo]) => (
          <CampoDato
            key={k}
            etiqueta={etiqueta}
            tipo={tipo}
            valor={v[k]}
            cambiar={(valor) => {
              setV({ ...v, [k]: valor });
            }}
          />
        ))}
        <CampoDato
          etiqueta="Disponibilidad del dato"
          valor={v.estado}
          opciones={[
            ['no_disponible', 'Dato no disponible'],
            ['no_publicado', 'Dato no publicado'],
            ['disponible', 'Valor disponible'],
          ]}
          cambiar={(estado) => {
            if (estado === 'disponible' || estado === 'no_publicado' || estado === 'no_disponible')
              setV({ ...v, estado, valor: estado === 'disponible' ? v.valor : null });
          }}
        />
        {v.estado === 'disponible' ? (
          <CampoDato
            etiqueta="Valor observado"
            tipo="number"
            valor={v.valor}
            cambiar={(valor) => {
              setV({ ...v, valor: valor === '' ? null : Number(valor) });
            }}
            ayuda="Cero es un valor válido. No lo uses cuando falta el dato."
          />
        ) : null}
        <div className="mt-4">
          <BusquedaTerritorial
            superficie="papel"
            rotulo="Territorio de esta fuente"
            onElegir={(l) => {
              setV({ ...v, territorioId: l.id });
              setLugar(l.name);
            }}
          />
          <p className="mt-2 text-sm">
            {v.territorioId ? lugar || `Territorio del catálogo ${v.territorioId}` : 'Todo el país'}
          </p>
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() => {
              setV({ ...v, territorioId: null });
            }}
          >
            Usar todo el país
          </button>
        </div>
        <label className="mt-4 flex gap-3">
          <input
            type="checkbox"
            checked={v.actualizacion?.estado === 'fallida'}
            onChange={(e) => {
              if (e.target.checked)
                setV({ ...v, actualizacion: { estado: 'fallida', fecha: '', detalle: '' } });
              else {
                const { actualizacion: _a, ...resto } = v;
                setV(resto);
              }
            }}
          />
          La última actualización falló
        </label>
        {v.actualizacion ? (
          <>
            <CampoDato
              etiqueta="Fecha del intento de actualización"
              tipo="date"
              valor={v.actualizacion.fecha}
              cambiar={(fecha) => {
                if (v.actualizacion) setV({ ...v, actualizacion: { ...v.actualizacion, fecha } });
              }}
            />
            <CampoDato
              etiqueta="Qué falló y qué dato se conserva"
              tipo="largo"
              valor={v.actualizacion.detalle}
              cambiar={(detalle) => {
                if (v.actualizacion) setV({ ...v, actualizacion: { ...v.actualizacion, detalle } });
              }}
            />
          </>
        ) : null}
      </fieldset>
      {error ? (
        <p role="alert" className="mt-4">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex gap-5">
        <button type="submit" className="min-h-11 underline">
          Incorporar al borrador
        </button>
        <button type="button" className="min-h-11 underline" onClick={cancelar}>
          Cancelar fuente
        </button>
      </div>
    </form>
  );
}
export function LeerFuente({ fuente: f }: { fuente: FuenteFicha }) {
  return (
    <article className="border-tinta border p-5" id={`fuente-${f.id}`}>
      <h3 className="font-anton text-2xl">{f.titulo}</h3>
      {f.catalogo && !f.actualizacion && coincideConCatalogo(f, f.catalogo) ? (
        <a
          className="mt-3 inline-flex min-h-11 items-center underline"
          href={`/fuentes?version=${encodeURIComponent(f.catalogo.version)}#${encodeURIComponent(f.catalogo.id)}`}
        >
          Procedencia y transcripción contrastadas · ver edición
        </a>
      ) : (
        <p className="mt-3 text-sm">
          Fuente documentada por participantes; sin verificación del catálogo.
        </p>
      )}
      <p className="mt-3 font-semibold">
        {f.estado === 'disponible'
          ? `${f.valor?.toLocaleString('es-AR') ?? 'Valor pendiente'} ${f.unidad}`
          : f.estado === 'no_publicado'
            ? 'Dato no publicado'
            : 'Dato no disponible'}
      </p>
      <a
        href={f.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex min-h-11 underline"
      >
        Consultar fuente · {f.institucion}
      </a>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-semibold">Fechas</dt>
          <dd>
            Referencia: {f.referencia} · consulta: {f.obtenida}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Universo y territorio</dt>
          <dd>
            {f.universo} ·{' '}
            {f.territorioId ? <TerritorioDocumentado id={f.territorioId} /> : 'Nacional'}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Método</dt>
          <dd>{f.metodo}</dd>
        </div>
        <div>
          <dt className="font-semibold">Condiciones de uso y actualización</dt>
          <dd>
            {f.licencia} · {f.frecuencia}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Límites</dt>
          <dd>{f.limites}</dd>
        </div>
      </dl>
      {f.actualizacion?.estado === 'fallida' ? (
        <p role="status" className="border-violeta mt-4 border-l-2 pl-3">
          Falló la actualización del {f.actualizacion.fecha}: {f.actualizacion.detalle}. Se conserva
          el dato anterior.
        </p>
      ) : null}
    </article>
  );
}

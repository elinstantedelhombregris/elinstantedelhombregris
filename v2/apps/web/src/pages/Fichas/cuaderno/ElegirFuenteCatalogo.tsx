import { CATALOGO_FUENTES, type FuenteFicha } from '@v2/shared';
import { useState } from 'react';
import { Link } from 'wouter';

export function ElegirFuenteCatalogo({
  agregar,
  completo,
}: {
  agregar: (fuente: FuenteFicha) => void;
  completo: boolean;
}) {
  const [id, setId] = useState('');
  const indicador = CATALOGO_FUENTES.indicadores.find((i) => i.id === id);
  return (
    <fieldset className="border-tinta/30 mt-5 border p-4" disabled={completo}>
      <legend className="px-2 font-semibold">Agregar desde el catálogo</legend>
      <p className="text-sm">
        Estos datos describen el total del país en 2022. Se conservan como contexto nacional aunque
        tu ficha sea local.
      </p>
      <label className="mt-3 block">
        Indicador del catálogo
        <select
          className="border-tinta/40 bg-papel mt-2 min-h-11 w-full border p-2"
          value={id}
          onChange={(e) => {
            setId(e.target.value);
          }}
        >
          <option value="">Elegí un indicador</option>
          {CATALOGO_FUENTES.indicadores.map((i) => (
            <option value={i.id} key={i.id}>
              {i.dato.titulo}
            </option>
          ))}
        </select>
      </label>
      {indicador ? (
        <p className="mt-3 text-sm">
          {indicador.dato.valor?.toLocaleString('es-AR')} % · {indicador.dato.limites}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-x-6">
        <button
          type="button"
          className="min-h-11 underline disabled:opacity-50"
          disabled={!indicador}
          onClick={() => {
            if (indicador)
              agregar({
                ...indicador.dato,
                id: crypto.randomUUID(),
                catalogo: { version: CATALOGO_FUENTES.version, id: indicador.id },
              });
            setId('');
          }}
        >
          Incorporar fuente del catálogo al borrador
        </button>
        <Link
          className="inline-flex min-h-11 items-center underline"
          href="/fuentes"
          target="_blank"
        >
          Revisar fuentes y límites
        </Link>
      </div>
    </fieldset>
  );
}

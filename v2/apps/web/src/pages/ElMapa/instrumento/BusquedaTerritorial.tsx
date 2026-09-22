import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { api } from '~/lib/api';
import { useProvincias } from '~/lib/queries/open-data';

export interface LugarMapa {
  id: number;
  name: string;
  level: string;
  provinceId: number;
  latitude: string | null;
  longitude: string | null;
}
const NIVELES: Record<string, string> = {
  province: 'Provincia',
  department: 'Departamento',
  municipality: 'Municipio',
  locality: 'Localidad',
  settlement: 'Asentamiento',
};

export function BusquedaTerritorial({ onElegir }: { onElegir: (lugar: LugarMapa) => void }) {
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const provincias = useProvincias();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBusqueda(texto.trim());
    }, 300);
    return () => {
      window.clearTimeout(timer);
    };
  }, [texto]);
  const consulta = useQuery({
    queryKey: ['geo', 'lugares', busqueda],
    enabled: busqueda.length >= 2,
    queryFn: ({ signal }) =>
      api.get<{ lugares: LugarMapa[] }>(
        `/api/v1/geo/lugares?${new URLSearchParams({ q: busqueda, limite: '12' }).toString()}`,
        { signal },
      ),
  });
  const nombres = new Map((provincias.data ?? []).map((p) => [p.id, p.name]));
  return (
    <div className="relative min-w-0 basis-full min-[640px]:basis-auto min-[640px]:flex-1">
      <label htmlFor="buscar-territorio" className="mb-1 block text-xs">
        Buscá provincia, municipio o localidad
      </label>
      <input
        id="buscar-territorio"
        type="search"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
        }}
        className="bg-papel text-tinta min-h-11 w-full border px-3"
        placeholder="Por ejemplo, San Martín"
        autoComplete="off"
      />
      {busqueda.length >= 2 ? (
        <div className="bg-tinta border-oscuro-borde absolute z-30 mt-1 max-h-72 w-full overflow-auto border p-2 shadow-xl">
          {consulta.isFetching ? (
            <p role="status" className="p-2">
              Buscando lugares…
            </p>
          ) : null}
          {consulta.isError ? (
            <p role="alert" className="p-2">
              No pudimos buscar.{' '}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  void consulta.refetch();
                }}
              >
                Reintentar
              </button>
            </p>
          ) : null}
          {consulta.data?.lugares.length === 0 ? (
            <p role="status" className="p-2">
              No encontramos ese nombre en el catálogo.
            </p>
          ) : null}
          <ul>
            {consulta.data?.lugares.map((lugar) => (
              <li key={lugar.id}>
                <button
                  type="button"
                  className="hover:bg-oscuro-borde min-h-11 w-full px-3 py-2 text-left"
                  onClick={() => {
                    onElegir(lugar);
                    setTexto('');
                    setBusqueda('');
                  }}
                >
                  {lugar.name}
                  <span className="text-oscuro-meta block text-xs">
                    {NIVELES[lugar.level] ?? lugar.level} ·{' '}
                    {nombres.get(lugar.provinceId) ?? `Provincia ${lugar.provinceId}`} · ID{' '}
                    {lugar.id}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

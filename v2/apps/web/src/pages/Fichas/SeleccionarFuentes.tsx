import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
export function SeleccionarFuentes({
  campana,
  elegir,
}: {
  campana: string | null | undefined;
  elegir: (id: string) => void;
}) {
  const [cursor, setCursor] = useState('');
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const q = useQuery({
    queryKey: ['seleccion-fuentes', campana, cursor],
    queryFn: () =>
      api.get<{
        registros: { id: string; tipo: string; texto: string | null }[];
        siguiente: string | null;
        total: number;
      }>(
        `/api/v1/exportaciones/publica?${new URLSearchParams({ limite: '20', ...(campana ? { campana } : {}), ...(cursor ? { cursor } : {}) }).toString()}`,
      ),
  });
  return (
    <details className="mt-3 border p-4">
      <summary className="cursor-pointer underline">
        Elegir entre voces del registro público
      </summary>
      <Nota>
        La relación elegida en el formulario se aplica a cada voz que agregás. Un texto reservado
        conserva su existencia y permiso; no lo usamos para inventar una interpretación.
      </Nota>
      <ErrorOperacion mensaje={q.error?.message} />
      {q.isLoading ? (
        <p>Buscando voces…</p>
      ) : (
        <ul className="divide-y">
          {q.data?.registros.map((v) => (
            <li key={v.id} className="py-3">
              <p className="text-sm">
                {v.tipo} · {v.texto?.slice(0, 240) ?? 'Texto reservado por su autor.'}
              </p>
              <BotonAccion
                tono="papel"
                className="mt-2"
                disabled={seleccion.includes(v.id)}
                onClick={() => {
                  elegir(v.id);
                  setSeleccion((x) => [...x, v.id]);
                }}
              >
                {seleccion.includes(v.id) ? 'Vínculo agregado' : 'Agregar esta voz'}
              </BotonAccion>
            </li>
          ))}
        </ul>
      )}
      {q.data?.siguiente && (
        <BotonAccion
          tono="papel"
          className="mt-3"
          onClick={() => {
            setCursor(q.data.siguiente ?? '');
          }}
        >
          Leer más voces
        </BotonAccion>
      )}
      {q.data?.registros.length === 0 && <p>No encontramos voces elegibles en este alcance.</p>}
    </details>
  );
}

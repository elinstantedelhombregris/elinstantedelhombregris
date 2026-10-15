import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { DispositivoCampo } from '@v2/shared';

import { api } from '~/lib/api';
import { tokenParticipacion } from '~/lib/queries/participacion';

export function DispositivosCampo({ uid }: { uid: number }) {
  const q = useQuery({
    queryKey: ['dispositivos-campo', uid],
    queryFn: () => api.get<DispositivoCampo[]>('/api/campo/dispositivos'),
  });
  const [nombre, setNombre] = useState(''),
    [token, setToken] = useState(''),
    [error, setError] = useState(''),
    [ocupado, setOcupado] = useState(false);
  async function actuar(id?: string) {
    setOcupado(true);
    setError('');
    try {
      const csrfToken = await tokenParticipacion();
      if (id) {
        await api.del(`/api/campo/dispositivos/${id}`, { csrfToken });
        setToken('');
      } else {
        const r = await api.post<{ token: string }>(
          '/api/campo/dispositivos',
          { nombre, usuarioId: uid },
          { csrfToken },
        );
        setToken(r.token);
      }
      await q.refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos actualizar la vinculación.');
    } finally {
      setOcupado(false);
    }
  }
  return (
    <details className="border-tinta space-y-4 border p-5">
      <summary className="cursor-pointer font-semibold">
        Vincular la app nativa con mis tareas
      </summary>
      <p>
        En la app, abrí «Tareas de campo v2». Pegá la clave que generes acá. Dura 30 días y sólo
        permite trabajar con tus tareas asignadas y retirar tus resultados. Revocala si perdés el
        teléfono.
      </p>
      <p>
        Antes de salir, aceptá e iniciá la tarea en su iniciativa y descargala en la app. Cada
        cuaderno conserva sus propias notas privadas.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void actuar();
        }}
        className="space-y-3"
      >
        <label className="block">
          Nombre del teléfono
          <input
            className="border-tinta mt-2 block w-full border p-3"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
            }}
            minLength={3}
            maxLength={80}
            required
          />
        </label>
        <button disabled={ocupado} className="min-h-11 underline">
          Generar clave de campo
        </button>
      </form>
      {token ? (
        <div className="space-y-2">
          <p>Copiá esta clave ahora. No la compartas con otras personas.</p>
          <input
            aria-label="Clave de campo"
            className="w-full border p-3 font-mono"
            readOnly
            value={token}
          />
          <button
            className="min-h-11 underline"
            onClick={() => {
              setToken('');
            }}
          >
            Ya la guardé; ocultar clave
          </button>
        </div>
      ) : null}
      {error || q.isError ? (
        <p role="alert">{error || 'No pudimos cargar los dispositivos.'}</p>
      ) : null}
      {q.data?.map((d) => (
        <div key={d.id} className="border-tinta/30 border-t py-3">
          <p>
            {d.nombre} ·{' '}
            {d.revocado ? 'Revocado' : `Vence ${new Date(d.expira).toLocaleDateString('es-AR')}`}
          </p>
          {!d.revocado ? (
            <button
              disabled={ocupado}
              className="min-h-11 underline"
              onClick={() => {
                void actuar(d.id);
              }}
            >
              Revocar {d.nombre}
            </button>
          ) : null}
        </div>
      ))}
    </details>
  );
}

import { useState } from 'react';
import { useLocation } from 'wouter';

import type { TareaIniciativa } from '@v2/shared';

import { useAuth } from '~/lib/auth/use-auth';
import { guardarCuaderno, leerCuadernos } from '~/lib/campo/archivo';
import { nuevoCuaderno } from '~/lib/campo/modelo';

export function AbrirCuaderno({ id, t }: { id: number; t: TareaIniciativa }) {
  const { user } = useAuth();
  const [, ir] = useLocation();
  const [error, setError] = useState(''),
    [ocupado, setOcupado] = useState(false);
  if (!user || !t.escucha || t.derivada || !(t.puedoGestionar || t.puedoEvidenciar)) return null;
  return (
    <div>
      <button
        className="min-h-11 underline"
        disabled={ocupado}
        onClick={() => {
          setOcupado(true);
          setError('');
          void (async () => {
            const guardados = await leerCuadernos(user.id);
            let c = guardados.find(
              (c) => c.iniciativaId === id && c.tareaId === t.id && c.estado !== 'enviado',
            );
            c ??= await guardarCuaderno(
              nuevoCuaderno(
                user.id,
                id,
                t,
                window.location.pathname + `?seccion=tareas&tarea=${t.id}`,
              ),
            );
            ir(`/campo?cuaderno=${c.id}`);
          })()
            .catch((e: unknown) => {
              setError(e instanceof Error ? e.message : 'No pudimos abrir el cuaderno.');
            })
            .finally(() => {
              setOcupado(false);
            });
        }}
      >
        Abrir cuaderno de campo
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

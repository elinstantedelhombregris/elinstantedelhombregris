import { useState } from 'react';

import type { PaginaGestion, TareaIniciativa } from '@v2/shared';
import type { Cuaderno } from '~/lib/campo/modelo';

import { api } from '~/lib/api';
export function RevisionCampo({
  c,
  ocupado,
  operar,
  recuperar,
}: {
  c: Cuaderno;
  ocupado: boolean;
  operar: (fn: () => Promise<void>) => Promise<void>;
  recuperar: (v: Cuaderno) => Promise<void>;
}) {
  const [actual, setActual] = useState<TareaIniciativa | null>(null);
  return (
    <div className="space-y-3">
      <button
        className="min-h-11 underline"
        disabled={ocupado}
        onClick={() => {
          void operar(async () => {
            const r = await api.get<PaginaGestion<TareaIniciativa>>(
              `/api/iniciativas/${c.iniciativaId}/tareas?tareaId=${c.tareaId}`,
            );
            const t = r.items[0];
            if (
              !t?.escucha ||
              t.derivada ||
              !(t.puedoGestionar || t.puedoEvidenciar) ||
              !['in_progress', 'done'].includes(t.estado)
            )
              throw new Error(
                'La tarea no está lista para recibir tu resultado. Consultá su estado y tus permisos.',
              );
            setActual(t);
          });
        }}
      >
        Consultar versión actual para revisar
      </button>
      {actual ? (
        <div className="border-tinta space-y-3 border p-3">
          <p>
            Versión actual {actual.revision}: {actual.titulo}
          </p>
          <p>{actual.alcance}</p>
          <p>Zona: {actual.escucha?.zona}</p>
          <p>
            Fecha: {actual.fecha}. Método: {actual.escucha?.metodo}. Invitación:{' '}
            {actual.escucha?.convocatoria}
          </p>
          <button
            className="min-h-11 underline"
            disabled={ocupado}
            onClick={() => {
              void operar(async () => {
                await recuperar({
                  ...c,
                  revisionTarea: actual.revision,
                  tarea: actual.titulo,
                  alcance: actual.alcance,
                  zona: actual.escucha?.zona ?? '',
                  estado: 'borrador',
                  sobre: null,
                  intentos: 0,
                  siguienteIntento: 0,
                  mensaje: '',
                });
              });
            }}
          >
            Revisé los cambios; recuperar borrador sin autorización
          </button>
        </div>
      ) : null}
    </div>
  );
}

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { CAMPO } from './constantes';
import { BotonAccion, ErrorOperacion, Nota } from './Elementos';

import { api } from '~/lib/api';
import { escribir } from '~/lib/queries/participacion';
export function Equipo({ tipo, objeto }: { tipo: 'ficha' | 'campana'; objeto: string }) {
  const [rol, setRol] = useState('editor');
  const [enlace, setEnlace] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['equipo', tipo, objeto],
    queryFn: () =>
      api.get<
        {
          id: string;
          rol: string;
          aceptadaEn: string | null;
          revocadaEn: string | null;
          venceEn: string;
        }[]
      >(`/api/v1/equipo/invitaciones?tipo=${tipo}&objeto=${objeto}`),
  });
  const invitar = async () => {
    setBusy(true);
    setError('');
    try {
      const v = await escribir<{ codigo: string }>('post', '/api/v1/equipo/invitaciones', {
        tipo,
        objeto,
        rol,
      });
      setEnlace(window.location.origin + '/colaborar#' + v.codigo);
      void qc.invalidateQueries({ queryKey: ['equipo'] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos preparar la invitación.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <details className="mt-8 border p-5">
      <summary className="font-anton cursor-pointer text-2xl">
        Invitar a cuidar este proceso
      </summary>
      <Nota>
        La invitación dura siete días y se acepta con una cuenta. Compartila con la persona elegida.
        Editor puede revisar contenido; facilitador puede acompañar la conversación, sin cambiar el
        contrato ni publicar en tu nombre. La publicación de campañas sigue a cargo de quien
        convoca.
      </Nota>
      <label>
        Permiso
        <select
          className={CAMPO}
          value={rol}
          onChange={(e) => {
            setRol(e.target.value);
          }}
        >
          <option value="editor">Editor de contenido</option>
          <option value="facilitador">Facilitador de conversación</option>
        </select>
      </label>
      <BotonAccion
        className="mt-4"
        disabled={busy}
        onClick={() => {
          void invitar();
        }}
      >
        Crear invitación
      </BotonAccion>
      {enlace && (
        <label className="mt-4 block">
          Enlace privado de invitación
          <input
            readOnly
            className={CAMPO}
            value={enlace}
            onFocus={(e) => {
              e.target.select();
            }}
          />
        </label>
      )}
      <ErrorOperacion mensaje={error || q.error?.message} />
      <ul className="mt-5 divide-y">
        {q.data?.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-4 py-3">
            <span>
              {i.rol === 'editor' ? 'Editor' : 'Facilitador'} ·{' '}
              {i.revocadaEn
                ? 'Revocada'
                : i.aceptadaEn
                  ? 'Aceptada'
                  : new Date(i.venceEn) < new Date()
                    ? 'Vencida'
                    : 'Pendiente'}
            </span>
            {!i.revocadaEn && (
              <BotonAccion
                tono="papel"
                onClick={() => {
                  void escribir('delete', '/api/v1/equipo/invitaciones/' + i.id)
                    .then(() => qc.invalidateQueries({ queryKey: ['equipo'] }))
                    .catch((e: unknown) => {
                      setError(e instanceof Error ? e.message : 'No pudimos revocar.');
                    });
                }}
              >
                Revocar
              </BotonAccion>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

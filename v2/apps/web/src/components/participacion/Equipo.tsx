import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { CAMPO } from './constantes';
import { BotonAccion, ErrorOperacion, Nota } from './Elementos';
import { fechaDeRegistro } from './fechas';

import { api } from '~/lib/api';
import { escribir } from '~/lib/queries/participacion';

interface Invitacion {
  id: string;
  rol: string;
  aceptadaEn: string | null;
  revocadaEn: string | null;
  venceEn: string;
}

const ROLES: Record<string, string> = { editor: 'Editor', facilitador: 'Facilitador' };
const ESTADOS = {
  revocada: 'Revocada',
  aceptada: 'Aceptada',
  vencida: 'Vencida',
  pendiente: 'Pendiente',
} as const;
const estadoDe = (i: Invitacion): keyof typeof ESTADOS =>
  i.revocadaEn
    ? 'revocada'
    : i.aceptadaEn
      ? 'aceptada'
      : new Date(i.venceEn) < new Date()
        ? 'vencida'
        : 'pendiente';
const QUE: Record<'ficha' | 'campana', string> = { ficha: 'esta ficha', campana: 'esta campaña' };

export function Equipo({ tipo, objeto }: { tipo: 'ficha' | 'campana'; objeto: string }) {
  const [rol, setRol] = useState('editor');
  const [enlace, setEnlace] = useState('');
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['equipo', tipo, objeto],
    queryFn: () =>
      api.get<Invitacion[]>(`/api/v1/equipo/invitaciones?tipo=${tipo}&objeto=${objeto}`),
  });
  const invitar = async () => {
    setBusy(true);
    setError('');
    setAviso('');
    try {
      const v = await escribir<{ codigo: string }>('post', '/api/v1/equipo/invitaciones', {
        tipo,
        objeto,
        rol,
      });
      setEnlace(window.location.origin + '/colaborar#' + v.codigo);
      setAviso('Invitación creada. Copiá el enlace y mandáselo a la persona elegida.');
      void qc.invalidateQueries({ queryKey: ['equipo'] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos preparar la invitación.');
    } finally {
      setBusy(false);
    }
  };
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace);
      setAviso('Enlace copiado.');
    } catch {
      setAviso('No pudimos copiarlo solo. Seleccioná el enlace y copiálo a mano.');
    }
  };
  const revocar = async (i: Invitacion) => {
    setError('');
    try {
      await escribir('delete', '/api/v1/equipo/invitaciones/' + i.id);
      setConfirmando(null);
      setAviso(`Invitación de ${ROLES[i.rol]?.toLowerCase() ?? i.rol} revocada.`);
      await qc.invalidateQueries({ queryKey: ['equipo'] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos revocar la invitación.');
    }
  };
  return (
    <details className="mt-8 border p-5">
      <summary className="font-anton cursor-pointer text-2xl">Invitar a cuidar {QUE[tipo]}</summary>
      <Nota>
        La invitación dura siete días y se acepta con una cuenta. Compartí el enlace solo con la
        persona elegida. El editor puede revisar el contenido; el facilitador puede acompañar la
        conversación, sin cambiar las reglas ni publicar en tu nombre.
        {tipo === 'campana' ? ' Publicar la campaña sigue a cargo de quien la coordina.' : ''}
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
        <div className="mt-4">
          <label className="block">
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
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <BotonAccion
              tono="papel"
              onClick={() => {
                void copiar();
              }}
            >
              Copiar enlace
            </BotonAccion>
            <p className="text-tinta-75 text-sm">Este enlace se muestra una sola vez.</p>
          </div>
        </div>
      )}
      <p role="status" className="text-tinta-75 mt-4 text-sm">
        {aviso}
      </p>
      <ErrorOperacion mensaje={error || q.error?.message} />
      <ul className="mt-5 divide-y">
        {q.data?.map((i) => {
          const estado = estadoDe(i);
          const quien = `${ROLES[i.rol]?.toLowerCase() ?? i.rol}, ${estado}`;
          return (
            <li key={i.id} className="flex flex-wrap items-center gap-4 py-3">
              <span>
                {ROLES[i.rol] ?? i.rol} · {ESTADOS[estado]}
                {estado === 'pendiente' ? ` · vence el ${fechaDeRegistro(i.venceEn)}` : ''}
              </span>
              {!i.revocadaEn &&
                (confirmando === i.id ? (
                  <span className="flex flex-wrap items-center gap-3 text-sm">
                    ¿Revocar la invitación de {quien}? Ese enlace deja de servir.
                    <BotonAccion
                      tono="sello"
                      onClick={() => {
                        void revocar(i);
                      }}
                    >
                      Sí, revocar
                    </BotonAccion>
                    <BotonAccion
                      tono="papel"
                      onClick={() => {
                        setConfirmando(null);
                      }}
                    >
                      No, dejarla
                    </BotonAccion>
                  </span>
                ) : (
                  <BotonAccion
                    tono="papel"
                    aria-label={`Revocar la invitación de ${quien}`}
                    onClick={() => {
                      setConfirmando(i.id);
                    }}
                  >
                    Revocar
                  </BotonAccion>
                ))}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

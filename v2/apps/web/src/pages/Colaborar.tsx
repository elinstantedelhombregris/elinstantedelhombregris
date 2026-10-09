import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';

import { CAMPO } from '~/components/participacion/constantes';
import {
  MarcoParticipacion,
  BotonAccion,
  ErrorOperacion,
  Nota,
} from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { escribir } from '~/lib/queries/participacion';
export function Colaborar() {
  const auth = useAuth();
  const qc = useQueryClient();
  const [codigo, setCodigo] = useState(() => window.location.hash.slice(1));
  const [invitacion, setInvitacion] = useState<{
    tipo: string;
    objeto: string;
    rol: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [aceptada, setAceptada] = useState(false);
  const leer = async () => {
    try {
      setInvitacion(await escribir('post', '/api/v1/equipo/invitaciones/leer', { codigo }));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos leer la invitación.');
    }
  };
  return (
    <MarcoParticipacion
      titulo="Cuidar juntos lo que imaginamos."
      entrada="Un permiso es una responsabilidad concreta. Revisá qué te están invitando a hacer antes de aceptarlo."
    >
      {!auth.user ? (
        <Nota>
          Ingresá y volvé a este enlace. La invitación permanece en su fragmento privado; también
          podés copiar el código para retomarla.{' '}
          <Link href="/ingresar?volver=%2Fcolaborar" className="text-violeta underline">
            Ingresar
          </Link>
        </Nota>
      ) : (
        <>
          <label>
            Código de invitación
            <input
              className={CAMPO}
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value);
                setInvitacion(null);
              }}
              maxLength={64}
            />
          </label>
          <BotonAccion
            className="mt-4"
            disabled={codigo.length !== 64}
            onClick={() => {
              void leer();
            }}
          >
            Revisar invitación
          </BotonAccion>
          {invitacion && (
            <Nota>
              Permiso:{' '}
              {invitacion.rol === 'editor'
                ? 'editar contenido con revisión'
                : 'acompañar la conversación'}
              . Este permiso no acredita representación institucional ni permite publicar una
              campaña en nombre de su responsable.
              <div className="mt-4">
                {aceptada ? (
                  <Link
                    className="text-violeta underline"
                    href={
                      invitacion.tipo === 'ficha'
                        ? '/fichas/' + invitacion.objeto
                        : '/gestion/campanas'
                    }
                  >
                    Abrir el proceso →
                  </Link>
                ) : (
                  <BotonAccion
                    onClick={() => {
                      void escribir('post', '/api/v1/equipo/invitaciones/aceptar', { codigo })
                        .then(() => {
                          setAceptada(true);
                          void qc.invalidateQueries({ queryKey: ['fichas'] });
                          void qc.invalidateQueries({ queryKey: ['campanas'] });
                        })
                        .catch((e: unknown) => {
                          setError(e instanceof Error ? e.message : 'No pudimos aceptar.');
                        });
                    }}
                  >
                    Aceptar esta responsabilidad
                  </BotonAccion>
                )}
              </div>
            </Nota>
          )}
        </>
      )}
      <ErrorOperacion mensaje={error} />
    </MarcoParticipacion>
  );
}

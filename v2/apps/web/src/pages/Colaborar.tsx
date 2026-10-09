import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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
const TIPOS: Record<string, string> = { ficha: 'ficha', campana: 'campaña' };
/** Dónde se sigue el proceso una vez aceptado. Una campaña acepta su UUID o su slug. */
const rutaDelProceso = (i: { tipo: string; objeto: string }) =>
  i.tipo === 'ficha' ? `/fichas/${i.objeto}` : `/campanas/${i.objeto}`;
/**
 * El código vive en el fragmento (`#...`) del enlace: el navegador no lo manda en el pedido de la
 * página, y el servidor sólo guarda su hash. Por eso no se lo copia a ninguna URL con query (el
 * retorno de `/ingresar?volver=` viaja al servidor) y la frase de abajo es cierta.
 */
const QUE_ES_ESTA_PAGINA =
  'Si alguien te invitó a sumarte a una campaña o a una ficha, abrí el enlace que te mandó. El código viaja en el enlace y no se guarda en el servidor.';
export function Colaborar() {
  const auth = useAuth();
  const qc = useQueryClient();
  const [codigo, setCodigo] = useState(() => window.location.hash.slice(1));
  const [conEnlace, setConEnlace] = useState(() => window.location.hash.length > 1);
  const [invitacion, setInvitacion] = useState<{
    tipo: string;
    objeto: string;
    rol: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [aceptada, setAceptada] = useState(false);
  /** Otro código es otra invitación: nada de lo que se leyó, aceptó o falló de la anterior sigue valiendo. */
  const cambiarCodigo = (nuevo: string) => {
    setCodigo(nuevo);
    setInvitacion(null);
    setAceptada(false);
    setError('');
  };
  // Abrir un segundo enlace en la misma pestaña sólo cambia el fragmento: la página no se recarga.
  useEffect(() => {
    const alCambiarElFragmento = () => {
      const fragmento = window.location.hash.slice(1);
      setConEnlace(fragmento.length > 0);
      cambiarCodigo(fragmento);
    };
    window.addEventListener('hashchange', alCambiarElFragmento);
    return () => {
      window.removeEventListener('hashchange', alCambiarElFragmento);
    };
  }, []);
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
      {conEnlace ? null : <p className="text-tinta-75 mb-6 max-w-[720px]">{QUE_ES_ESTA_PAGINA}</p>}
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
                cambiarCodigo(e.target.value);
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
              <p className="mb-3 break-words font-bold">
                {`Te invitan a ser ${invitacion.rol} de «${invitacion.objeto}» (${TIPOS[invitacion.tipo] ?? invitacion.tipo}).`}
              </p>
              Permiso:{' '}
              {invitacion.rol === 'editor'
                ? 'editar contenido con revisión'
                : 'acompañar la conversación'}
              . Este permiso no acredita representación institucional ni permite publicar una
              campaña en nombre de su responsable.
              <div className="mt-4">
                {aceptada ? (
                  <Link className="text-violeta underline" href={rutaDelProceso(invitacion)}>
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

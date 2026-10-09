import { useState } from 'react';

import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { escribir } from '~/lib/queries/participacion';

/**
 * «Reenviar correo» para quien todavía no verificó el suyo.
 *
 * Usa `POST /api/auth/email/send-verification`, que ya existe: responde igual
 * exista o no la cuenta (para no revelar quién está registrado) y limita a tres
 * pedidos por hora, así que el error de límite se muestra tal cual lo dice el
 * servidor.
 */
export function ReenviarCorreo({ email }: { email: string }) {
  const [estado, setEstado] = useState<'quieto' | 'enviando' | 'enviado'>('quieto');
  const [error, setError] = useState('');
  const reenviar = () => {
    setEstado('enviando');
    setError('');
    void escribir('post', '/api/auth/email/send-verification', { email })
      .then(() => {
        setEstado('enviado');
      })
      .catch((e: unknown) => {
        setEstado('quieto');
        setError(e instanceof Error ? e.message : 'No pudimos reenviar el correo.');
      });
  };
  return (
    <div className="mt-3">
      <BotonAccion tono="papel" disabled={estado === 'enviando'} onClick={reenviar}>
        {estado === 'enviando' ? 'Enviando…' : 'Reenviar correo'}
      </BotonAccion>
      {estado === 'enviado' ? (
        <p role="status" className="mt-3 text-sm leading-relaxed">
          Te mandamos un enlace a {email}. Si no llega en unos minutos, mirá también el correo no
          deseado.
        </p>
      ) : null}
      <ErrorOperacion mensaje={error} />
    </div>
  );
}

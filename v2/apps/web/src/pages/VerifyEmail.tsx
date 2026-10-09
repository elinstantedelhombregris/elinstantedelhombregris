import { useEffect, useState } from 'react';
import { Link } from 'wouter';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth';

type Status = 'pending' | 'success' | 'error';

function readTokenFromQuery(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('token') ?? '';
}

export function VerifyEmail() {
  const [status, setStatus] = useState<Status>('pending');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = readTokenFromQuery();
    if (!token) {
      setStatus('error');
      setErrorMsg('Falta el token. Pedí un nuevo email de verificación.');
      return;
    }
    void api
      .post('/api/auth/email/verify', { token }, { csrfToken: readCsrfToken() })
      .then(() => {
        setStatus('success');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Token inválido o vencido.');
      });
  }, []);

  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="border-tinta bg-papel-crudo border p-8">
        <h1 className="font-anton text-tinta mb-3 text-4xl">Verificación de email</h1>
        {status === 'pending' && (
          <p role="status" className="text-tinta-75 text-sm">
            Estamos verificando tu email…
          </p>
        )}
        {status === 'success' && (
          <>
            <p role="status" className="text-tinta-75 mb-6 text-sm">
              ¡Listo! Tu email quedó verificado.
            </p>
            <BotonPapel asChild className="inline-flex items-center">
              <Link href="/">Ir al inicio</Link>
            </BotonPapel>
          </>
        )}
        {status === 'error' && (
          <>
            <ErrorOperacion mensaje={errorMsg} className="mt-0" />
            <BotonPapel asChild variant="fantasma" className="inline-flex items-center">
              <Link href="/ingresar">Volver a ingresar</Link>
            </BotonPapel>
          </>
        )}
      </div>
    </main>
  );
}

export default VerifyEmail;

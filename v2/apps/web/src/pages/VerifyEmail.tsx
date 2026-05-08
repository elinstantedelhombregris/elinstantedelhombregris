import { useEffect, useState } from 'react';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';
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
      <div className="glass rounded-2xl p-8 text-center">
        <h1 className="mb-3 font-serif text-3xl font-semibold">Verificación de email</h1>
        {status === 'pending' && (
          <p className="text-sm text-muted-foreground">Estamos verificando tu email…</p>
        )}
        {status === 'success' && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">¡Listo! Tu email quedó verificado.</p>
            <Button asChild>
              <Link href="/">Ir al inicio</Link>
            </Button>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="mb-4 text-sm text-red-400">{errorMsg}</p>
            <Button asChild variant="secondary">
              <Link href="/ingresar">Volver a iniciar sesión</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

export default VerifyEmail;

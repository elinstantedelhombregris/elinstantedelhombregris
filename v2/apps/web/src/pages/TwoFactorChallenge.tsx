/**
 * Page rendered when /api/auth/login returns `needsTwoFactor`.
 * Reads the partial-auth ticket from the URL and exchanges a TOTP
 * code (or backup code) for real cookies via /api/auth/2fa/verify.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation, useSearch } from 'wouter';

import type { ApiError } from '~/lib/api';
import type { AuthenticatedUser } from '~/lib/auth/types';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth';
import { adoptarSesion } from '~/lib/auth/sesion';
import { volverTrasIngresar } from '~/lib/auth/volver';

interface VerifyResponse {
  user: AuthenticatedUser;
  csrfToken: string;
}

export function TwoFactorChallenge() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const ticket = params.get('ticket') ?? '';
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyMutation = useMutation<VerifyResponse, ApiError, { ticket: string; code: string }>({
    mutationFn: async (vars) =>
      api.post<VerifyResponse>('/api/auth/2fa/verify', vars, { csrfToken: readCsrfToken() }),
    onSuccess: async (data) => {
      await adoptarSesion(queryClient, data.user);
      navigate(volverTrasIngresar(window.location.search));
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!ticket) {
      setErrorMessage('Falta el ticket. Volvé a iniciar sesión.');
      return;
    }
    if (code.trim().length < 6) {
      setErrorMessage('El código tiene al menos 6 caracteres.');
      return;
    }
    verifyMutation.mutate({ ticket, code: code.trim() });
  };

  return (
    <main className="container mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="border-tinta bg-papel-crudo border p-8">
        <h1 className="font-anton text-tinta mb-2 text-4xl">Verificación en dos pasos</h1>
        <p className="text-tinta-75 mb-6 text-sm">
          Ingresá el código de seis dígitos de tu app de autenticación, o un código de respaldo.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
              }}
              placeholder="123456"
              maxLength={20}
              autoFocus
            />
          </div>
          {errorMessage ? (
            <p role="alert" className="text-sm text-red-400">
              {errorMessage}
            </p>
          ) : null}
          <Button type="submit" disabled={verifyMutation.isPending} className="w-full">
            {verifyMutation.isPending ? 'Verificando…' : 'Verificar'}
          </Button>
        </form>
      </div>
    </main>
  );
}

export default TwoFactorChallenge;

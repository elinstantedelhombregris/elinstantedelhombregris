import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { FieldError } from '~/components/ui/field-error';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth';

const schema = z.object({
  newPassword: z.string().min(12, 'Tiene que tener al menos 12 caracteres.').max(128),
});
type FormValues = z.infer<typeof schema>;

function readTokenFromQuery(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('token') ?? '';
}

export function ResetPassword() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(readTokenFromQuery());
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setError('root', { message: 'Falta el token. Pedí un nuevo link de recuperación.' });
      return;
    }
    try {
      await api.post('/api/auth/password/reset', { ...values, token }, { csrfToken: readCsrfToken() });
      setDone(true);
      setTimeout(() => { navigate('/ingresar'); }, 2000);
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Algo salió mal.' });
    }
  });

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="glass rounded-2xl p-8">
        <h1 className="mb-2 font-serif text-3xl font-semibold">Crear contraseña nueva</h1>
        {done ? (
          <p className="text-sm text-muted-foreground">
            ¡Listo! Te mandamos a iniciar sesión…
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Elegí una contraseña nueva. Mínimo 12 caracteres.
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Contraseña nueva</Label>
                <Input id="newPassword" type="password" autoComplete="new-password" {...register('newPassword')} />
                <FieldError message={errors.newPassword?.message} />
              </div>
              {errors.root ? (
                <p role="alert" className="text-sm text-red-400">
                  {errors.root.message}
                </p>
              ) : null}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
              </Button>
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/ingresar" className="hover:text-foreground">
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

export default ResetPassword;

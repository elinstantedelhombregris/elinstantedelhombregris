import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';

import { CampoPapel } from '~/components/auth/CampoPapel';
import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

const schema = z.object({
  newPassword: z.string().min(12, 'Tiene que tener al menos 12 caracteres.').max(128),
});
type FormValues = z.infer<typeof schema>;

function readTokenFromQuery(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('token') ?? '';
}

export function ResetPassword() {
  useTituloDePagina('Crear contraseña nueva');
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
      await api.post(
        '/api/auth/password/reset',
        { ...values, token },
        { csrfToken: readCsrfToken() },
      );
      setDone(true);
      setTimeout(() => {
        navigate('/ingresar');
      }, 2000);
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Algo salió mal.' });
    }
  });

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="border-tinta bg-papel-crudo border p-8">
        <h1 className="font-anton text-tinta mb-2 text-4xl">Crear contraseña nueva</h1>
        {done ? (
          <p role="status" className="text-tinta-75 text-sm">
            ¡Listo! Guardamos tu contraseña nueva. Te llevamos a ingresar…
          </p>
        ) : (
          <>
            <p className="text-tinta-75 mb-6 text-sm">Elegí una contraseña nueva.</p>
            <form onSubmit={onSubmit} className="space-y-4">
              <CampoPapel
                id="newPassword"
                etiqueta="Contraseña nueva"
                type="password"
                autoComplete="new-password"
                ayuda="Mínimo 12 caracteres."
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <ErrorOperacion mensaje={errors.root?.message} />
              <BotonPapel type="submit" loading={isSubmitting} className="w-full">
                Guardar contraseña
              </BotonPapel>
            </form>
          </>
        )}
        <p className="text-tinta-75 mt-6 text-center text-sm">
          <Link href="/ingresar" className="hover:text-violeta underline">
            ← Volver a ingresar
          </Link>
        </p>
      </div>
    </main>
  );
}

export default ResetPassword;

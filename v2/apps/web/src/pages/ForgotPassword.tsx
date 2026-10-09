import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'wouter';
import { z } from 'zod';

import { CampoPapel } from '~/components/auth/CampoPapel';
import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

const schema = z.object({
  email: z.string().email('Ingresá un email válido.'),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPassword() {
  useTituloDePagina('Recuperar contraseña');
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.post('/api/auth/password/request-reset', values, { csrfToken: readCsrfToken() });
      setSubmitted(true);
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Algo salió mal.' });
    }
  });

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="border-tinta bg-papel-crudo border p-8">
        <h1 className="font-anton text-tinta mb-2 text-4xl">Recuperar contraseña</h1>
        {submitted ? (
          <p role="status" className="text-tinta-75 text-sm">
            Si ese email tiene una cuenta, te mandamos un link para crear una contraseña nueva.
            Revisá tu bandeja de entrada (y la carpeta de spam, por las dudas).
          </p>
        ) : (
          <>
            <p className="text-tinta-75 mb-6 text-sm">
              Ingresá tu email y te enviamos un link para reestablecer la contraseña.
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <CampoPapel
                id="email"
                etiqueta="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <ErrorOperacion mensaje={errors.root?.message} />
              <BotonPapel type="submit" loading={isSubmitting} className="w-full">
                Enviar link
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

export default ForgotPassword;

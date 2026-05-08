import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'wouter';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { FieldError } from '~/components/ui/field-error';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth';

const schema = z.object({
  email: z.string().email('Ingresá un email válido.'),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPassword() {
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
      <div className="glass rounded-2xl p-8">
        <h1 className="mb-2 font-serif text-3xl font-semibold">Recuperar contraseña</h1>
        {submitted ? (
          <p className="text-sm text-muted-foreground">
            Si ese email tiene una cuenta, te mandamos un link para crear una contraseña nueva.
            Revisá tu bandeja de entrada (y la carpeta de spam, por las dudas).
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Ingresá tu email y te enviamos un link para reestablecer la contraseña.
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register('email')} />
                <FieldError message={errors.email?.message} />
              </div>
              {errors.root ? (
                <p role="alert" className="text-sm text-red-400">
                  {errors.root.message}
                </p>
              ) : null}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Enviando…' : 'Enviar link'}
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

export default ForgotPassword;

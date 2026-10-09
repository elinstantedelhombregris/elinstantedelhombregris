import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';

import { CampoPapel } from '~/components/auth/CampoPapel';
import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth';
import { volverTrasIngresar } from '~/lib/auth/volver';

const schema = z.object({
  identifier: z.string().min(1, 'Ingresá tu email o usuario.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
});

type FormValues = z.infer<typeof schema>;

export function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login.mutateAsync(values);
      if (result.needsTwoFactor) {
        navigate(
          `/2fa-desafio?ticket=${encodeURIComponent(result.ticket)}&volver=${encodeURIComponent(volverTrasIngresar(window.location.search))}`,
        );
        return;
      }
      navigate(volverTrasIngresar(window.location.search));
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Algo salió mal.' });
    }
  });

  return (
    <main className="container mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="border-tinta bg-papel-crudo border p-8">
        <h1 className="font-anton text-tinta mb-2 text-4xl">Ingresar</h1>
        <p className="text-tinta-75 mb-6 text-sm">
          ¿No tenés cuenta?{' '}
          <Link
            href={`/registrarse?volver=${encodeURIComponent(volverTrasIngresar(window.location.search))}`}
            className="text-violeta underline"
          >
            Crear mi cuenta
          </Link>
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <CampoPapel
            id="identifier"
            etiqueta="Email o usuario"
            type="text"
            autoComplete="username"
            error={errors.identifier?.message}
            {...register('identifier')}
          />
          <CampoPapel
            id="password"
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <ErrorOperacion mensaje={errors.root?.message} />
          <BotonPapel type="submit" loading={isSubmitting} className="w-full">
            Ingresar
          </BotonPapel>
        </form>
        <p className="text-tinta-75 mt-6 text-center text-sm">
          <Link href="/recuperar-contrasena" className="hover:text-violeta underline">
            ¿Olvidaste la contraseña?
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;

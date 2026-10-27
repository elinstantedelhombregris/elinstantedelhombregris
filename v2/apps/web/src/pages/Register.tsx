import { zodResolver } from '@hookform/resolvers/zod';
import { passwordSchema, registerInputSchema } from '@v2/shared';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'wouter';

import { CampoPapel } from '~/components/auth/CampoPapel';
import { IngresoExterno } from '~/components/auth/IngresoExterno';
import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth';
import { volverTrasIngresar } from '~/lib/auth/volver';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

interface FormValues {
  username: string;
  email: string;
  name: string;
  password: string;
}

/** El mínimo sale del esquema que valida el servidor: si cambia, la pista cambia con él. */
const AYUDA_CONTRASENA =
  passwordSchema.minLength === null ? undefined : `Mínimo ${passwordSchema.minLength} caracteres.`;

export function Register() {
  useTituloDePagina('Crear mi cuenta');
  const { register: registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(registerInputSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values);
      navigate(volverTrasIngresar(window.location.search));
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Algo salió mal.' });
    }
  });

  return (
    <main className="container mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="border-tinta bg-papel-crudo border p-8">
        <h1 className="font-anton text-tinta mb-2 text-4xl">Crear mi cuenta</h1>
        <p className="text-tinta-75 mb-3 text-sm">
          Con una cuenta, tus aportes te siguen a cualquier dispositivo. Para participar no hace
          falta, y tu nombre no se publica.
        </p>
        <p className="text-tinta-75 mb-6 text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link
            href={`/ingresar?volver=${encodeURIComponent(volverTrasIngresar(window.location.search))}`}
            className="text-violeta underline"
          >
            Ingresar
          </Link>
        </p>
        <IngresoExterno volver={volverTrasIngresar(window.location.search)} />
        <form onSubmit={onSubmit} className="space-y-4">
          <CampoPapel
            id="name"
            etiqueta="Nombre"
            type="text"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <CampoPapel
            id="username"
            etiqueta="Usuario"
            type="text"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />
          <CampoPapel
            id="email"
            etiqueta="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <CampoPapel
            id="password"
            etiqueta="Contraseña"
            type="password"
            autoComplete="new-password"
            ayuda={AYUDA_CONTRASENA}
            error={errors.password?.message}
            {...register('password')}
          />
          <ErrorOperacion mensaje={errors.root?.message} />
          <BotonPapel type="submit" loading={isSubmitting} className="w-full">
            Crear mi cuenta
          </BotonPapel>
        </form>
      </div>
    </main>
  );
}

export default Register;

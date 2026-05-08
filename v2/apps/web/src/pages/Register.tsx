import { zodResolver } from '@hookform/resolvers/zod';
import { registerInputSchema } from '@v2/shared';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'wouter';

import { Button } from '~/components/ui/button';
import { FieldError } from '~/components/ui/field-error';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useAuth } from '~/lib/auth';

interface FormValues {
  username: string;
  email: string;
  name: string;
  password: string;
}

export function Register() {
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
      navigate('/');
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Algo salió mal.' });
    }
  });

  return (
    <main className="container mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="glass rounded-2xl p-8">
        <h1 className="mb-2 font-serif text-3xl font-semibold">Crear cuenta</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          ¿Ya tenés una?{' '}
          <Link href="/ingresar" className="text-primary hover:underline">
            Iniciar sesión
          </Link>
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" type="text" autoComplete="name" {...register('name')} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" type="text" autoComplete="username" {...register('username')} />
            <FieldError message={errors.username?.message} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </div>
          {errors.root ? (
            <p role="alert" className="text-sm text-red-400">
              {errors.root.message}
            </p>
          ) : null}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </form>
      </div>
    </main>
  );
}

export default Register;

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { FieldError } from '~/components/ui/field-error';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useAuth } from '~/lib/auth';

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
        navigate(`/2fa-desafio?ticket=${encodeURIComponent(result.ticket)}`);
        return;
      }
      navigate('/');
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Algo salió mal.' });
    }
  });

  return (
    <main className="container mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="glass rounded-2xl p-8">
        <h1 className="mb-2 font-serif text-3xl font-semibold">Iniciá sesión</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          ¿Sin cuenta?{' '}
          <Link href="/registrarse" className="text-primary hover:underline">
            Crear una
          </Link>
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="identifier">Email o usuario</Label>
            <Input id="identifier" type="text" autoComplete="username" {...register('identifier')} />
            <FieldError message={errors.identifier?.message} />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </div>
          {errors.root ? (
            <p role="alert" className="text-sm text-red-400">
              {errors.root.message}
            </p>
          ) : null}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/recuperar-contrasena" className="hover:text-foreground">
            ¿Olvidaste la contraseña?
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;

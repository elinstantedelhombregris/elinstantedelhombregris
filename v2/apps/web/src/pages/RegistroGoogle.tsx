/**
 * `/registrarse/google` — el «Último paso» de quien entra nuevo con Google (spec
 * 2026-10-27-ingreso-con-google.md): elegir el nombre de usuario y cómo quiere que lo llamen.
 * El correo ya viene verificado por Google; no hay contraseña.
 */
import { nameSchema, usernameSchema } from '@v2/shared';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';

import { CampoPapel } from '~/components/auth/CampoPapel';
import { BotonGoogle } from '~/components/auth/IngresoExterno';
import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { ApiError } from '~/lib/api';
import { volverTrasIngresar } from '~/lib/auth/volver';
import { useAltaPendiente, useCompletarAlta } from '~/lib/queries/ingreso-externo';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <main className="container mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="border-tinta bg-papel-crudo border p-8">{children}</div>
    </main>
  );
}

export function RegistroGoogle() {
  useTituloDePagina('Último paso');
  const [, navigate] = useLocation();
  const volver = volverTrasIngresar(window.location.search);
  const pendiente = useAltaPendiente();
  const completar = useCompletarAlta();
  const [usuario, setUsuario] = useState('');
  const [nombre, setNombre] = useState('');
  const [errores, setErrores] = useState<{ usuario?: string; nombre?: string; general?: string }>(
    {},
  );

  const sugerencia = pendiente.data?.sugerencia;
  useEffect(() => {
    if (sugerencia) setUsuario((actual) => actual || sugerencia);
  }, [sugerencia]);

  if (pendiente.isPending) {
    return (
      <Marco>
        <p role="status" className="text-tinta-75 text-sm">
          Volviendo de Google…
        </p>
      </Marco>
    );
  }

  if (pendiente.isError) {
    const vencida = pendiente.error instanceof ApiError && pendiente.error.status === 401;
    return (
      <Marco>
        <h1 className="font-anton text-tinta mb-3 text-4xl">Último paso</h1>
        <ErrorOperacion
          mensaje={
            vencida
              ? 'Pasó demasiado tiempo desde que volviste de Google. Entrá de nuevo y seguimos.'
              : 'No pudimos traer tu cuenta de Google. Probá de nuevo en un momento.'
          }
        />
        <BotonGoogle volver={volver} className="mt-4" />
        <p className="text-tinta-75 mt-6 text-center text-sm">
          <Link href="/registrarse" className="hover:text-violeta underline">
            Crear la cuenta con tu correo
          </Link>
        </p>
      </Marco>
    );
  }

  const enviar = async () => {
    const u = usernameSchema.safeParse(usuario);
    const n = nameSchema.safeParse(nombre);
    const nuevos = {
      ...(u.success ? {} : { usuario: u.error.issues[0]?.message ?? 'Revisá el usuario.' }),
      ...(n.success ? {} : { nombre: n.error.issues[0]?.message ?? 'Revisá el nombre.' }),
    };
    setErrores(nuevos);
    if (!u.success || !n.success) return;
    try {
      const r = await completar.mutateAsync({ username: u.data, name: n.data });
      navigate(r.volver);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'USERNAME_TAKEN')
        setErrores({ usuario: 'Ese nombre de usuario ya está en uso. Probá con otro.' });
      else setErrores({ general: e instanceof Error ? e.message : 'Algo salió mal.' });
    }
  };

  return (
    <Marco>
      <p className="font-space text-tinta-50 mb-2 text-[11px] font-bold uppercase tracking-[0.12em]">
        Crear mi cuenta
      </p>
      <h1 className="font-anton text-tinta mb-2 text-4xl">Último paso</h1>
      <p className="text-tinta-75 mb-6 text-sm">
        Entraste con Google como{' '}
        <strong className="text-tinta break-all">{pendiente.data.correo}</strong>. Elegí cómo te
        vamos a reconocer en el sitio.
      </p>
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void enviar();
        }}
      >
        <CampoPapel
          id="usuario"
          etiqueta="Usuario"
          type="text"
          autoComplete="username"
          ayuda="De 3 a 32 caracteres: letras, números, guion o guion bajo."
          error={errores.usuario}
          value={usuario}
          onChange={(e) => {
            setUsuario(e.target.value);
          }}
        />
        <CampoPapel
          id="nombre"
          etiqueta="Nombre"
          type="text"
          autoComplete="name"
          ayuda="Cómo querés que te llamemos. No se publica."
          error={errores.nombre}
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
          }}
        />
        <ErrorOperacion mensaje={errores.general} />
        <BotonPapel type="submit" loading={completar.isPending} className="w-full">
          Crear mi cuenta
        </BotonPapel>
      </form>
    </Marco>
  );
}

export default RegistroGoogle;

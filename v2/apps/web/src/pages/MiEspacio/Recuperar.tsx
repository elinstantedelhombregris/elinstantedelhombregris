import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';

export function Recuperar() {
  const auth = useAuth();
  const q = useQuery({
    queryKey: ['recuperables', auth.user?.id],
    queryFn: () =>
      api.get<{ id: string; texto: string; tipo: string; fecha: string }[]>(
        '/api/v1/mi-espacio/recuperables',
      ),
  });
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [control, setControl] = useState(false);
  const op = useOperacionPersonal();
  // Mientras carga, o si no hay nada que recuperar, no ocupa lugar: solo sube a
  // la cabeza de «Mis aportes» cuando hay algo que decidir.
  if (q.isLoading || q.data?.length === 0) return null;
  return (
    <section aria-labelledby="titulo-recuperar" className="mb-10 border p-5">
      <h2 id="titulo-recuperar" className="font-anton text-2xl">
        Aportes de este navegador para sumar a tu cuenta
      </h2>
      <p className="mt-3 text-sm leading-relaxed">
        Estos aportes los publicaste desde este navegador, antes de tener cuenta o sin haber
        ingresado. Elegí los que querés poder corregir y retirar desde acá. Tu nombre no se publica
        por sumarlos.
      </p>
      <ErrorOperacion mensaje={q.error?.message ?? op.error?.message} />
      <ul className="mt-5 space-y-4">
        {q.data?.map((a) => (
          <li key={a.id}>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={elegidos.includes(a.id)}
                onChange={(e) => {
                  setElegidos((p) =>
                    e.target.checked ? [...p, a.id] : p.filter((x) => x !== a.id),
                  );
                }}
                className="mt-1"
              />
              <span className="break-words">{a.texto}</span>
            </label>
          </li>
        ))}
      </ul>
      <label className="mt-5 flex items-start gap-3">
        <input
          type="checkbox"
          checked={control}
          onChange={(e) => {
            setControl(e.target.checked);
          }}
          className="mt-1"
        />
        <span>Reconozco estos aportes como míos y elijo vincular su gestión con mi cuenta.</span>
      </label>
      <Nota>
        Si borrás los datos de este navegador antes de sumarlos, no vamos a poder devolvértelos:
        no hay otra forma de comprobar que eran tuyos.
      </Nota>
      <BotonAccion
        disabled={!control || !elegidos.length || op.isPending}
        onClick={() => {
          op.mutate(
            {
              metodo: 'post',
              ruta: '/api/v1/mi-espacio/vincular',
              cuerpo: { senales: elegidos, confirmaControl: true },
            },
            {
              onSuccess: () => {
                setElegidos([]);
                setControl(false);
              },
            },
          );
        }}
      >
        Sumar a mi cuenta
      </BotonAccion>
    </section>
  );
}

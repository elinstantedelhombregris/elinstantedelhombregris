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
  if (q.data?.length === 0) return null;
  return (
    <section className="mt-8 border p-5">
      <h2 className="font-anton text-2xl">Lo que conserva este navegador.</h2>
      <p className="mt-3 text-sm leading-relaxed">
        No vamos a dar por hecho que todo es tuyo. Revisá los aportes y elegí cuáles querés poder
        gestionar también desde tu cuenta. No se publicará tu identidad por vincularlos.
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
        Si el navegador ya no conserva su credencial y no había un vínculo previo, no podemos
        recuperar autoría por una firma o por parecido del texto.
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
        Vincular la selección
      </BotonAccion>
    </section>
  );
}

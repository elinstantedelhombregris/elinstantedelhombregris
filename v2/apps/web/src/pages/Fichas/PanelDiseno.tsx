import { useState } from 'react';

import { Afirmaciones } from './Afirmaciones';
import { Alternativas } from './Alternativas';
import { Pruebas } from './Pruebas';

import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useDisenoFicha } from '~/lib/queries/participacion';

export function PanelDiseno({ id }: { id: string }) {
  const auth = useAuth();
  const q = useDisenoFicha(id, auth.user?.id);
  const [vista, setVista] = useState('conversar');
  return (
    <section className="mt-12 border-t-2 pt-8">
      <h2 className="font-anton text-4xl">Aprender a diseñar juntos.</h2>
      <nav className="my-6 flex flex-wrap gap-3" aria-label="Diseño de esta ficha">
        {[
          ['conversar', 'Condiciones y diferencias'],
          ['alternativas', 'Diseños alternativos'],
          ['pruebas', 'Pruebas y aprendizaje'],
        ].map(([clave, titulo]) => (
          <button
            type="button"
            key={clave}
            className={`font-space min-h-11 border px-4 py-3 text-xs ${vista === clave ? 'bg-tinta text-papel' : 'text-tinta'}`}
            aria-pressed={vista === clave}
            onClick={() => {
              setVista(clave ?? 'conversar');
            }}
          >
            {titulo}
          </button>
        ))}
      </nav>
      <ErrorOperacion mensaje={q.error?.message} />
      {q.isLoading ? (
        <p>Trayendo la conversación y sus diseños…</p>
      ) : q.data ? (
        vista === 'conversar' ? (
          <Afirmaciones fichaId={id} datos={q.data} />
        ) : vista === 'alternativas' ? (
          <Alternativas fichaId={id} datos={q.data} />
        ) : (
          <Pruebas datos={q.data} />
        )
      ) : (
        <p>No pudimos leer este recorrido.</p>
      )}
    </section>
  );
}

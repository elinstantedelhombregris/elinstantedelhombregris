import { Link } from 'wouter';

import type { EspacioPersonal } from '@v2/shared';

import { BotonAccion, EnlaceAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useOperacionPersonal } from '~/lib/queries/participacion';

export function AnalisisGuardados({ espacio }: { espacio: EspacioPersonal }) {
  const op = useOperacionPersonal();
  return (
    <section aria-labelledby="titulo-analisis">
      <h2 id="titulo-analisis" className="font-anton text-3xl">
        Mis análisis
      </h2>
      <p className="mt-3 text-sm">
        Guardamos los filtros de cada análisis y la fecha de su última lectura. Los textos se leen
        siempre al día: si alguien corrige o retira un aporte, el análisis lo refleja. No guardamos
        una copia aparte.
      </p>
      <ul className="mt-6 divide-y border-y">
        {espacio.analisis.map((a) => (
          <li key={a.id} className="py-5">
            <Link
              href={`/la-radiografia?${new URLSearchParams(a.consulta).toString()}`}
              className="text-violeta underline"
            >
              {a.nombre}
            </Link>
            <p className="mt-2 text-sm">
              {a.corte
                ? `Guardado con la lectura del ${new Date(a.corte).toLocaleString('es-AR')}.`
                : 'Guardado sin una lectura todavía.'}
            </p>
            <BotonAccion
              tono="papel"
              className="mt-3"
              disabled={op.isPending}
              onClick={() => {
                op.mutate({ metodo: 'delete', ruta: `/api/v1/mi-espacio/analisis/${a.id}` });
              }}
            >
              Quitar de mis análisis
            </BotonAccion>
          </li>
        ))}
      </ul>
      <ErrorOperacion mensaje={op.error?.message} />
      {!espacio.analisis.length ? (
        <Nota>Desde la Radiografía podés guardar un análisis y ver cómo cambia.</Nota>
      ) : null}
      <EnlaceAccion href="/la-radiografia">Abrir la Radiografía</EnlaceAccion>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { Link, useLocation, useSearch } from 'wouter';

import { Afirmaciones } from './Afirmaciones';
import { Alternativas } from './Alternativas';
import { TITULOS_DE_DISENO, VISTAS_DE_DISENO, leerVista } from './presentacion';
import { Pruebas } from './Pruebas';

import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { useDisenoFicha } from '~/lib/queries/participacion';

/** Afirmaciones, alternativas y pruebas de una ficha; la parte abierta va en `?vista=`. */
export function PanelDiseno({ id }: { id: string }) {
  const auth = useAuth();
  const q = useDisenoFicha(id, auth.user?.id);
  const search = useSearch();
  const [ruta] = useLocation();
  const vista = leerVista(new URLSearchParams(search).get('vista'));
  const seccion = useRef<HTMLElement>(null);
  const llegoConVista = useRef(new URLSearchParams(search).has('vista'));
  // Un enlace con `?vista=` lleva a quien lo abre hasta esta parte de la página.
  useEffect(() => {
    if (llegoConVista.current) seccion.current?.scrollIntoView();
  }, []);
  const enlace = (clave: string) => `${ruta}?vista=${clave}#diseno`;
  const hrefIngreso = hrefIngresar(enlace(vista));
  return (
    <section ref={seccion} id="diseno" className="border-tinta mt-12 border-t-2 pt-8">
      <h2 className="font-anton text-4xl">Afirmaciones, alternativas y pruebas</h2>
      <nav className="my-6 flex flex-wrap gap-3" aria-label="Partes de esta sección">
        {VISTAS_DE_DISENO.map((clave) => (
          <Link
            key={clave}
            href={enlace(clave)}
            replace
            aria-current={vista === clave ? 'true' : undefined}
            className={`font-space inline-flex min-h-11 items-center border px-4 py-3 text-xs ${vista === clave ? 'border-tinta bg-tinta text-papel' : 'border-tinta text-tinta'}`}
          >
            {TITULOS_DE_DISENO[clave]}
          </Link>
        ))}
      </nav>
      <ErrorOperacion mensaje={q.error?.message} />
      {q.isLoading ? (
        <p role="status">Cargando afirmaciones, alternativas y pruebas…</p>
      ) : q.data ? (
        vista === 'afirmaciones' ? (
          <Afirmaciones fichaId={id} datos={q.data} hrefIngreso={hrefIngreso} />
        ) : vista === 'alternativas' ? (
          <Alternativas fichaId={id} datos={q.data} hrefIngreso={hrefIngreso} />
        ) : (
          <Pruebas datos={q.data} hrefIngreso={hrefIngreso} />
        )
      ) : (
        <p>No pudimos cargar esta parte de la ficha.</p>
      )}
    </section>
  );
}

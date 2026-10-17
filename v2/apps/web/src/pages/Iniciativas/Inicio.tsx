import { nuevaIniciativaSchema } from '@v2/shared';
import { Link, useLocation, useSearch } from 'wouter';

import { AUTORIZACION, texto } from './campos';
import { FormularioGestion } from './Formulario';
import { ListaGestion } from './Lista';
import { TareasDisponibles } from './TareasDisponibles';

import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { esUuid } from '~/pages/Fichas/presentacion';

export function InicioIniciativas() {
  const auth = useAuth();
  const [ruta, navegar] = useLocation();
  const parametros = new URLSearchParams(useSearch());
  const escucha = parametros.get('escucha') === 'si';
  const fichaId = parametros.get('fichaId');
  const creando = ruta === '/iniciativas/nueva';
  return (
    <MarcoParticipacion
      titulo={creando ? 'Organizar una iniciativa' : 'Sumate a una tarea'}
      entrada="Un propósito, un equipo y tareas que alguien acepta. Los resultados se documentan y revisan después de actuar."
      kicker="De la escucha a la acción"
    >
      <Link href="/escucha-territorial" className="underline">
        Consultar la escucha territorial
      </Link>
      <p className="mt-3">
        <Link
          href="/recorridos/llegar-a-tiempo-a-la-escuela"
          className="mr-5 inline-flex min-h-11 items-center underline"
        >
          Llegar a tiempo a la escuela: recorrer el ejemplo completo
        </Link>
        <Link href="/iniciativas/ejemplo" className="underline">
          Ver un ejemplo paso a paso
        </Link>
      </p>
      {!creando ? (
        <TareasDisponibles {...(esUuid(fichaId) && fichaId ? { fichaId } : {})} />
      ) : (
        <Link href="/iniciativas" className="mt-4 inline-flex min-h-11 items-center underline">
          Explorar tareas antes de crear una iniciativa
        </Link>
      )}
      {auth.user ? (
        <>
          <h2 className="font-anton mt-8 text-3xl">
            {escucha ? 'Iniciativas que administrás' : 'Iniciativas que integrás o administrás'}
          </h2>
          <ListaGestion<{ id: number; slug: string; titulo: string }>
            ruta={escucha ? '/gestionadas' : '/mias'}
          >
            {(i) => (
              <Link
                key={i.id}
                className="block min-h-11 underline"
                href={`/iniciativas/${i.slug}${escucha ? '?seccion=tareas&escucha=si' : ''}`}
              >
                {i.titulo}
              </Link>
            )}
          </ListaGestion>
          <details open={creando} className="border-tinta mt-8 border p-5">
            <summary className="cursor-pointer font-semibold">
              Crear una iniciativa comunitaria
            </summary>
            <FormularioGestion
              ruta=""
              boton="Crear iniciativa"
              campos={[
                { clave: 'titulo', etiqueta: 'Nombre de la iniciativa' },
                { clave: 'resumen', etiqueta: 'Propósito y alcance', tipo: 'textarea' },
                {
                  clave: 'documento',
                  etiqueta: 'Documento público inicial, opcional',
                  tipo: 'textarea',
                },
                AUTORIZACION,
              ]}
              preparar={(v, r) =>
                nuevaIniciativaSchema.parse({
                  ...r,
                  titulo: texto(v, 'titulo'),
                  resumen: texto(v, 'resumen'),
                  documento: texto(v, 'documento'),
                  autorizoPublicacion: v.autorizo,
                })
              }
              onSuccess={(r) => {
                if (r.slug)
                  navegar(`/iniciativas/${r.slug}?seccion=tareas${escucha ? '&escucha=si' : ''}`);
              }}
            />
          </details>
        </>
      ) : auth.isLoading ? (
        <p role="status">Consultando tu sesión…</p>
      ) : (
        <Link
          className="mt-5 block underline"
          href={`/ingresar?volver=${encodeURIComponent('/iniciativas/nueva' + (escucha ? '?escucha=si' : ''))}`}
        >
          Ingresá para crear o administrar iniciativas
        </Link>
      )}
    </MarcoParticipacion>
  );
}

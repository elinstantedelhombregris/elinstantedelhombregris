import { UMBRAL_IMPULSO } from '@v2/shared';
import { useState } from 'react';
import { Link } from 'wouter';

import { ReenviarCorreo } from '../MiEspacio/VerificarCorreo';

import { FormularioCampana } from './Formulario';
import { esPropuestaActiva, juntaGente } from './impulso';
import { PresentarPropuesta } from './PresentarPropuesta';

import type { CampanaDeLista } from '~/lib/queries/campanas-propuestas';

import { ENLACE_DE_TEXTO } from '~/components/participacion/constantes';
import {
  EnlaceAccion,
  ErrorOperacion,
  MarcoParticipacion,
  Nota,
} from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import {
  PROPONER_HREF,
  useDetalleDeCampana,
  useTusCampanas,
} from '~/lib/queries/campanas-propuestas';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

/** Proponer una campaña (spec 2026-10-19-mi-argentina-ideal-la-pila.md §11). */
export function ProponerCampana() {
  useTituloDePagina('Proponer una campaña');
  const auth = useAuth();
  return (
    <MarcoParticipacion
      titulo="Proponer una campaña"
      entrada="Una campaña es una pregunta para tu lugar o para todo el país, con alguien que se compromete a devolver lo que escuche. Cualquiera con cuenta puede proponer una."
    >
      {auth.isLoading ? (
        <p role="status">Un momento…</p>
      ) : !auth.user ? (
        <Nota>
          <p>Ingresá para proponer una campaña.</p>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <EnlaceAccion href={hrefIngresar(PROPONER_HREF)}>Ingresar</EnlaceAccion>
            <Link className={ENLACE_DE_TEXTO} href={hrefIngresar(PROPONER_HREF, '/registrarse')}>
              Crear una cuenta
            </Link>
          </div>
        </Nota>
      ) : !auth.user.emailVerified ? (
        <Nota>
          <p>
            Para proponer una campaña, primero verificá tu correo: quien impulsa una campaña queda
            como responsable pública de su devolución. Te mandamos un enlace a {auth.user.email}{' '}
            cuando creaste la cuenta.
          </p>
          <ReenviarCorreo email={auth.user.email} />
          <Link className={ENLACE_DE_TEXTO} href="/mi-espacio?pestana=cuenta">
            Ver tu cuenta
          </Link>
        </Nota>
      ) : (
        <ConCuenta />
      )}
    </MarcoParticipacion>
  );
}

function ConCuenta() {
  const tuyas = useTusCampanas();
  const [guardada, setGuardada] = useState<string | null>(null);
  const [yaTenia, setYaTenia] = useState(false);
  const activa = tuyas.data?.find((c) => juntaGente(c.estado));
  if (guardada) return <Guardada id={guardada} />;
  return (
    <>
      <PasoPrevio />
      {tuyas.isLoading ? (
        <p role="status">Buscando tus campañas…</p>
      ) : activa && !yaTenia ? (
        <PropuestaActiva campana={activa} />
      ) : (
        <>
          {yaTenia ? <PropuestaActiva campana={activa} /> : null}
          <FormularioCampana
            nota={
              <Nota>
                Proponer una campaña es comprometerse a devolver lo que se escuche. Guardar crea un
                borrador que sólo ves vos; después la presentás para empezar a juntar gente.
              </Nota>
            }
            alGuardar={setGuardada}
            alFallar={(e) => {
              if (!esPropuestaActiva(e)) return;
              setYaTenia(true);
              void tuyas.refetch();
            }}
          />
        </>
      )}
    </>
  );
}

function PasoPrevio() {
  return (
    <section aria-labelledby="paso-previo" className="mb-9 max-w-[720px]">
      <h2 id="paso-previo" className="font-anton text-3xl">
        Antes de abrirse, junta gente
      </h2>
      <p className="mt-4 text-lg leading-relaxed">
        Para abrirse, tu campaña tiene que traer {UMBRAL_IMPULSO} personas nuevas a imaginar el
        país. Cada persona que trae tu campaña suma a la visión de todos.
      </p>
      <ol className="mt-5 list-decimal space-y-2 pl-6 leading-relaxed">
        <li>Escribís las reglas de la campaña y la guardás.</li>
        <li>La presentás y compartís su página.</li>
        <li>
          Con {UMBRAL_IMPULSO} personas nuevas, la coordinación de ¡BASTA! revisa que sus reglas se
          cumplan y la abre.
        </li>
      </ol>
    </section>
  );
}

/** Cada cuenta propone una campaña por vez: la que ya tiene, con su enlace. */
function PropuestaActiva({ campana }: { campana: CampanaDeLista | undefined }) {
  return (
    <Nota>
      <p>
        <strong>Ya tenés una campaña propuesta</strong>
        {campana ? `: «${campana.contrato.titulo}».` : '.'} Cada cuenta propone una por vez. Cuando
        abra, o si la retirás para corregirla, podés proponer otra.
      </p>
      <div className="mt-4">
        <EnlaceAccion secundario href={campana ? `/campanas/${campana.slug}` : '/mi-espacio'}>
          {campana ? 'Ver tu campaña' : 'Ver tus campañas en Mi espacio'}
        </EnlaceAccion>
      </div>
    </Nota>
  );
}

/** Recién guardada: el borrador y el paso de presentarla. */
function Guardada({ id }: { id: string }) {
  const q = useDetalleDeCampana(id);
  return (
    <>
      <p role="status" className="text-lg">
        Guardamos tu campaña.
      </p>
      <ErrorOperacion mensaje={q.error?.message} />
      {q.data ? (
        <>
          <PresentarPropuesta campana={q.data} />
          <Link className={`${ENLACE_DE_TEXTO} mt-5`} href={`/campanas/${q.data.slug}`}>
            Ver el borrador antes de presentarlo
          </Link>
        </>
      ) : q.isLoading ? (
        <p className="mt-4">Trayendo tu borrador…</p>
      ) : null}
    </>
  );
}

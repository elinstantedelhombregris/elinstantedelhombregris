import { Link, useLocation, useSearch } from 'wouter';

import { useLugar } from './consultas';
import { FormularioFicha } from './FormularioFicha';
import { LEAD_FICHA, RELACION_INICIAL, esUuid, numeroDeLugar } from './presentacion';
import { VolverALasFichas } from './VolverALasFichas';

import type { ContenidoFicha } from '@v2/shared';

import { BotonPapel } from '~/components/papel/primitives';
import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

/** `/fichas/nueva`, con lo que el mapa, una campaña o un aporte ya saben: lugar, campaña, aporte. */
export function NuevaFicha() {
  useTituloDePagina('Crear una ficha');
  const search = useSearch();
  const [ruta, navegar] = useLocation();
  const auth = useAuth();
  const params = new URLSearchParams(search);
  const lugarId = numeroDeLugar(params.get('lugar'));
  const lugar = useLugar(lugarId);
  const campana = params.get('campana');
  const senal = params.get('senal');
  const nombre =
    params.get('nombre') ??
    (lugarId === undefined
      ? 'Todo el país'
      : (lugar.data?.name ?? (lugar.isError ? 'Un lugar del mapa' : 'Consultando el lugar…')));
  const inicial: ContenidoFicha = {
    titulo: '',
    territorioId: lugarId ?? null,
    temas: [],
    situacion: '',
    futuro: '',
    proximaTarea: '',
    campanaId: esUuid(campana) ? campana : null,
    condiciones: [],
    vinculos: esUuid(senal) ? [{ senalId: senal, relacion: RELACION_INICIAL }] : [],
  };
  return (
    <MarcoParticipacion
      titulo="Crear una ficha"
      entrada={LEAD_FICHA}
      kicker="La ciudadanía diseña · Fichas"
    >
      <VolverALasFichas className="mb-6" />
      {auth.isLoading ? (
        <p role="status">Revisando sesión…</p>
      ) : auth.isAuthenticated ? (
        <FormularioFicha
          inicial={inicial}
          nombreTerritorio={nombre}
          guardada={(nuevoId) => {
            navegar(`/fichas/${nuevoId}`);
          }}
        />
      ) : (
        <div className="max-w-[720px]">
          <p className="leading-relaxed">
            Para crear una ficha necesitás una cuenta. Leer fichas y sumar aportes al mapa no la
            pide.
          </p>
          <BotonPapel asChild className="mt-5 inline-block">
            <Link href={hrefIngresar(`${ruta}${search ? `?${search}` : ''}`)}>Ingresar</Link>
          </BotonPapel>
        </div>
      )}
    </MarcoParticipacion>
  );
}

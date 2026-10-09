import { useEffect } from 'react';
import { useRoute, useSearch } from 'wouter';

import { Devolucion } from './Campanas/Devolucion';
import { LecturaDatosContrato } from './Campanas/LecturaDatosContrato';
import { CabeceraCampana } from './Campanas/sections/CabeceraCampana';
import { EnlacesDeLaCampana } from './Campanas/sections/EnlacesDeLaCampana';
import { FichaCampana } from './Campanas/sections/FichaCampana';
import { HistorialCampana } from './Campanas/sections/HistorialCampana';
import { PanelCoordinacion } from './Campanas/sections/PanelCoordinacion';
import { PropositoYDevolucion } from './Campanas/sections/PropositoYDevolucion';
import { Recorrido } from './Campanas/sections/Recorrido';

import { CompartirProceso } from '~/components/participacion/CompartirProceso';
import {
  MarcoParticipacion,
  EnlaceAccion,
  ErrorOperacion,
} from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useCampana } from '~/lib/queries/participacion';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export function CampanaDetail() {
  const [, params] = useRoute('/campanas/:slug');
  const [, devolucion] = useRoute('/campanas/:slug/devolucion');
  const auth = useAuth();
  const search = useSearch();
  const edicion = Number(new URLSearchParams(search).get('edicion'));
  const q = useCampana(
    params?.slug ?? devolucion?.slug,
    Number.isSafeInteger(edicion) && edicion > 0 ? edicion : undefined,
  );
  // Mientras la campaña carga (o no existe) la pestaña dice «Campaña»; después, su título.
  useTituloDePagina(q.data?.contrato.titulo ?? 'Campaña');
  const cargada = Boolean(q.data);
  const iraLaDevolucion = devolucion !== null;
  // `/campanas/:slug/devolucion` es el destino del aviso a quien sigue la campaña: abre en el texto.
  useEffect(() => {
    if (iraLaDevolucion && cargada)
      document.getElementById('devolucion')?.scrollIntoView({ block: 'start' });
  }, [iraLaDevolucion, cargada]);
  if (!q.data) {
    const buscando = q.isLoading || (q.isPending && auth.isLoading);
    return (
      <MarcoParticipacion
        titulo={buscando ? 'Buscando esta campaña…' : 'No encontramos esta campaña.'}
        entrada={
          buscando
            ? 'Un momento.'
            : 'El enlace puede estar mal escrito o la campaña todavía no es pública.'
        }
      >
        {q.error ? (
          <ErrorOperacion mensaje={q.error.message} />
        ) : buscando ? (
          <p role="status">Trayendo la campaña…</p>
        ) : null}
        <EnlaceAccion href="/campanas">Ver las campañas</EnlaceAccion>
      </MarcoParticipacion>
    );
  }
  const c = q.data;
  const esAdmin = auth.user?.esAdmin === true;
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 py-9 min-[961px]:px-10">
      <CabeceraCampana campana={c} esAdmin={esAdmin} />
      <PropositoYDevolucion campana={c} />
      <FichaCampana campana={c} />
      <Recorrido campana={c} />
      <LecturaDatosContrato contrato={c.contrato} />
      <EnlacesDeLaCampana campana={c} />
      <Devolucion campana={c} />
      <div className="mt-9">
        <CompartirProceso
          href={`/campanas/${c.slug}?edicion=${c.revision}`}
          titulo="Compartir esta campaña"
        />
      </div>
      <HistorialCampana campana={c} />
      <PanelCoordinacion campana={c} esAdmin={esAdmin} />
    </main>
  );
}

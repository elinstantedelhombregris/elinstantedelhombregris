import { useEffect } from 'react';
import { useRoute, useSearch } from 'wouter';

import { Devolucion } from './Campanas/Devolucion';
import { juntaGente } from './Campanas/impulso';
import { LecturaDatosContrato } from './Campanas/LecturaDatosContrato';
import { esEdicionAnterior } from './Campanas/presentacion';
import { PresentarPropuesta } from './Campanas/PresentarPropuesta';
import { CabeceraCampana } from './Campanas/sections/CabeceraCampana';
import { EnlacesDeLaCampana } from './Campanas/sections/EnlacesDeLaCampana';
import { FichaCampana } from './Campanas/sections/FichaCampana';
import { HistorialCampana } from './Campanas/sections/HistorialCampana';
import { JuntarGente } from './Campanas/sections/JuntarGente';
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
  // Una campaña propuesta que todavía no abrió (§11): junta gente o espera la revisión.
  const propuesta = juntaGente(c.estado);
  // Quien la propuso y no administra la presenta desde acá; quien administra usa sus etapas.
  const presentar = c.estado === 'borrador' && c.puedoEditar && !esAdmin && !esEdicionAnterior(c);
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 py-9 min-[961px]:px-10">
      <CabeceraCampana campana={c} esAdmin={esAdmin} />
      {propuesta ? <JuntarGente campana={c} /> : null}
      {presentar ? <PresentarPropuesta campana={c} /> : null}
      <PropositoYDevolucion campana={c} conProposito={!propuesta} />
      <FichaCampana campana={c} conAportes={!propuesta} />
      <Recorrido campana={c} />
      <LecturaDatosContrato contrato={c.contrato} />
      {/* Sin abrir no hay fichas, escucha ni devolución que mirar todavía. */}
      {propuesta ? null : (
        <>
          <EnlacesDeLaCampana campana={c} />
          <Devolucion campana={c} />
        </>
      )}
      {/* Quien la impulsa ya tiene arriba su forma de compartirla, con la imagen. */}
      {propuesta && c.impulsadaPorMi ? null : (
        <div className="mt-9">
          {/* Mientras junta gente cada paso cambia la edición: se comparte la vigente. */}
          <CompartirProceso
            href={propuesta ? `/campanas/${c.slug}` : `/campanas/${c.slug}?edicion=${c.revision}`}
            titulo="Compartir esta campaña"
          />
        </div>
      )}
      <HistorialCampana campana={c} />
      <PanelCoordinacion campana={c} esAdmin={esAdmin} />
    </main>
  );
}

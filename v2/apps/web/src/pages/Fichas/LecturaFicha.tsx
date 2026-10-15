import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

import { useTemasDelCatalogo } from './consultas';
import { Cuaderno } from './cuaderno/Cuaderno';
import { Deliberacion } from './deliberacion/Deliberacion';
import { Relaciones } from './deliberacion/Relaciones';
import { FormularioFicha } from './FormularioFicha';
import { HistorialFicha } from './HistorialFicha';
import { PanelDiseno } from './PanelDiseno';
import { LEAD_FICHA, RELACIONES, enLista, etiquetaVersion, fechaDeFicha } from './presentacion';
import { ResultadosCampo } from './ResultadosCampo';
import { VolverALasFichas } from './VolverALasFichas';

import type { FichaFuturo } from '@v2/shared';

import { BotonPapel, Kicker } from '~/components/papel/primitives';
import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { Equipo } from '~/components/participacion/Equipo';
import { Seguir } from '~/components/participacion/Seguir';
import { aportarHref } from '~/lib/participacion/aportar';
import { ESTADO_EN_CASTELLANO } from '~/lib/vocabulario';

const SECCIONES = [
  ['futuro', 'Futuro deseado'],
  ['situacion', 'Situación actual'],
  ['proximaTarea', 'Próxima tarea de investigación'],
] as const;

/**
 * A dónde llevar a quien quiere ver lo escuchado: sólo con filtros que la Radiografía
 * entiende (una campaña por su id, un lugar por su id). Sin ninguno, no hay enlace.
 */
function destinosRadiografia(ficha: FichaFuturo): { href: string; rotulo: string }[] {
  const { campanaId, territorioId } = ficha.contenido;
  const destinos: { href: string; rotulo: string }[] = [];
  if (campanaId)
    destinos.push({
      href: `/la-radiografia?${new URLSearchParams({ campana: campanaId }).toString()}`,
      rotulo: 'Ver en la Radiografía lo escuchado en esta campaña',
    });
  if (territorioId !== null)
    destinos.push({
      href: `/la-radiografia?${new URLSearchParams({ territorio: String(territorioId) }).toString()}`,
      rotulo: `Ver en la Radiografía lo escuchado en ${ficha.territorioNombre ?? 'este lugar'}`,
    });
  return destinos;
}

export function LecturaFicha({ ficha }: { ficha: FichaFuturo }) {
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState('');
  const catalogo = useTemasDelCatalogo();
  const contenido = ficha.contenido;
  if (editando)
    return (
      <MarcoParticipacion
        titulo="Editar la ficha"
        entrada={LEAD_FICHA}
        kicker={etiquetaVersion(ficha.revision)}
      >
        <button
          type="button"
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
          onClick={() => {
            setEditando(false);
          }}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a la ficha
        </button>
        <FormularioFicha
          inicial={contenido}
          nombreTerritorio={ficha.territorioNombre ?? 'Todo el país'}
          ficha={ficha}
          guardada={() => {
            setEditando(false);
            setAviso('Guardamos tus cambios en la ficha.');
          }}
        />
      </MarcoParticipacion>
    );
  const etiquetasDeTemas = catalogo.isLoading
    ? []
    : contenido.temas.map(
        (clave) => catalogo.data?.temas?.find((t) => t.clave === clave)?.etiqueta ?? clave,
      );
  const radiografia = destinosRadiografia(ficha);
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 py-9 min-[961px]:px-10">
      <header className="border-tinta border-b pb-9">
        <VolverALasFichas />
        <Kicker className="mt-5">{etiquetaVersion(ficha.revision)}</Kicker>
        <h1 className="font-anton mt-5 max-w-[950px] text-[clamp(36px,5vw,64px)] leading-[1.08]">
          {contenido.titulo}
        </h1>
        <p className="text-tinta-75 mt-5 max-w-[720px] text-lg leading-relaxed">{LEAD_FICHA}</p>
        <p className="mt-5 text-sm">
          {ficha.territorioNombre ?? 'Todo el país'}
          {etiquetasDeTemas.length ? ` · Temas: ${enLista(etiquetasDeTemas)}` : ''} · Actualizada el{' '}
          {fechaDeFicha(ficha.actualizadaEn)}
        </p>
        {ficha.puedoEditar ? (
          <BotonPapel
            type="button"
            variant="fantasma"
            className="mt-5"
            onClick={() => {
              setAviso('');
              setEditando(true);
            }}
          >
            Editar esta ficha
          </BotonPapel>
        ) : null}
      </header>
      <nav aria-label="Recorrer esta ficha" className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        <a href="#evidencia" className="inline-flex min-h-11 items-center underline">
          Evidencia y objetivos
        </a>
        <a href="#diseno" className="inline-flex min-h-11 items-center underline">
          Alternativas y pruebas
        </a>
        <a href="#conversacion" className="inline-flex min-h-11 items-center underline">
          Conversación y síntesis
        </a>
        <a href="#relaciones" className="inline-flex min-h-11 items-center underline">
          Relaciones entre fichas
        </a>
      </nav>
      {aviso ? (
        <p role="status" className="border-violeta mt-6 border-l-2 pl-4 text-sm">
          {aviso}
        </p>
      ) : null}
      {SECCIONES.map(([campo, titulo]) => (
        <section key={campo} className="mt-8">
          <h2 className="font-anton text-2xl">{titulo}</h2>
          <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed">
            {contenido[campo] || 'Pendiente: todavía no hay una formulación.'}
          </p>
        </section>
      ))}
      {contenido.condiciones?.length ? (
        <section className="mt-8">
          <h2 className="font-anton text-2xl">Condiciones deseadas</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            {contenido.condiciones.map((c, i) => (
              <li key={`${i}-${c}`}>{c}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-8">
        <h2 className="font-anton text-2xl">Aportes vinculados</h2>
        <p className="my-3 text-sm">
          Cada vínculo lo propuso quien escribió la ficha. Mirá el aporte y su estado antes de dar
          algo por comprobado.
        </p>
        {ficha.aportes.length === 0 ? (
          <p>Todavía no hay aportes vinculados.</p>
        ) : (
          <ul className="space-y-3">
            {ficha.aportes.map((a) => (
              <li key={a.senalId + a.relacion} className="border-tinta border p-4">
                <p className="text-violeta text-sm">
                  {RELACIONES[a.relacion]} ·{' '}
                  {a.disponible
                    ? ((a.estado ? ESTADO_EN_CASTELLANO[a.estado] : undefined) ?? 'Sin estado')
                    : 'No disponible'}
                </p>
                <p className="my-2 break-words">
                  {a.disponible
                    ? (a.texto ?? 'Texto reservado por su autor.')
                    : 'Este aporte dejó de estar disponible. La ficha necesita revisar esta referencia.'}
                </p>
                {a.disponible ? (
                  <Link
                    className="inline-flex min-h-11 items-center underline"
                    href={`/senal/${a.senalId}`}
                  >
                    Ver el aporte y su estado →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="border-tinta mt-9 border-t pt-7" aria-labelledby="hacer-con-la-ficha">
        <h2 id="hacer-con-la-ficha" className="font-anton text-2xl">
          Qué podés hacer con esta ficha
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {radiografia.map((destino) => (
            <BotonPapel key={destino.href} asChild variant="fantasma">
              <Link href={destino.href}>{destino.rotulo}</Link>
            </BotonPapel>
          ))}
          {contenido.campanaId ? (
            <BotonPapel asChild variant="fantasma">
              <Link href={aportarHref({ campana: contenido.campanaId })}>
                Imaginar mi Argentina
              </Link>
            </BotonPapel>
          ) : null}
          <BotonPapel asChild variant="fantasma">
            <Link href={`/capacidades?fichaId=${ficha.id}`}>
              Buscar capacidades para esta ficha
            </Link>
          </BotonPapel>
          <Seguir tipo="ficha" objeto={ficha.id} />
        </div>
        {ficha.puedoInvitar ? <Equipo tipo="ficha" objeto={ficha.id} /> : null}
      </section>
      <Cuaderno ficha={ficha} />
      <ResultadosCampo id={ficha.id} />
      <PanelDiseno id={ficha.id} />
      <Deliberacion ficha={ficha} />
      <Relaciones ficha={ficha} />
      <HistorialFicha historial={ficha.historial} />
    </main>
  );
}

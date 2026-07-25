import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';

import { PreguntaPractica } from './Entrenamientos/sections/PreguntaPractica';

import { BandaCta, BotonPapel, Kicker, Palitos, RitoTinta, Sello } from '~/components/papel/primitives';
import { cargarPractica, findCursoBySlug, type PracticaEntry } from '~/lib/courses-registry';
import { cn } from '~/lib/utils';

/** 404 §5: el expediente extraviado, sobre papel — mismo texto que la portada del curso (spec, «Estados mudos»: no hay copy propio de práctica para el curso inexistente). */
function EntrenamientoExtraviado() {
  return (
    <main className="mx-auto max-w-md px-10 py-24 text-center max-[560px]:px-5">
      <Kicker className="mb-4">expediente extraviado</Kicker>
      <h1 className="font-anton mb-6 text-4xl leading-none">Ese entrenamiento no está.</h1>
      <div className="mb-8">
        <Sello color="rojo">Extraviado</Sello>
      </div>
      <BotonPapel asChild variant="tinta">
        <Link href="/entrenamientos">Ver los entrenamientos →</Link>
      </BotonPapel>
    </main>
  );
}

/** Skeleton §5 + microcopy de carga §10.9 — mientras baja el quiz.json (registry perezoso). */
function EsqueletoPractica() {
  return (
    <div className="mt-10">
      <div className="anim-pulso-papel bg-papel-presionado h-7 w-3/4" />
      <div className="anim-pulso-papel bg-papel-presionado mt-4 h-24 w-full" />
      <div className="anim-pulso-papel bg-papel-presionado mt-4 h-24 w-full" />
      <p className="font-space text-tinta-50 mt-4 text-[11px] uppercase tracking-[0.12em]">
        Cargando — menos que un trámite.
      </p>
    </div>
  );
}

/** Error de carga §10.9 — misma honestidad que el resto del sistema, con el camino de vuelta. */
function PracticaRota({ cursoSlug }: { cursoSlug: string }) {
  return (
    <div className="mt-10">
      <p className="font-archivo text-tinta-75 text-[15px] leading-relaxed">
        Esto se rompió. Lo decimos porque publicamos todo.
      </p>
      <Link
        href={`/entrenamientos/${cursoSlug}`}
        className="font-space text-tinta-50 hover:text-tinta mt-6 inline-block text-xs uppercase tracking-[0.1em]"
      >
        ← Volver al entrenamiento
      </Link>
    </div>
  );
}

type EstadoPractica = { fase: 'cargando' } | { fase: 'listo'; practica: PracticaEntry } | { fase: 'error' };

/** Carga perezosa del quiz normalizado (el registry no lo trae eager). */
function usePractica(cursoSlug: string): EstadoPractica {
  const [estado, setEstado] = useState<EstadoPractica>({ fase: 'cargando' });
  useEffect(() => {
    let vivo = true;
    setEstado({ fase: 'cargando' });
    cargarPractica(cursoSlug)
      .then((practica) => {
        if (!vivo) return;
        setEstado(practica === null ? { fase: 'error' } : { fase: 'listo', practica });
      })
      .catch(() => {
        if (vivo) setEstado({ fase: 'error' });
      });
    return () => {
      vivo = false;
    };
  }, [cursoSlug]);
  return estado;
}

const CLASE_ACCION = 'font-space text-tinta hover:text-violeta text-xs font-bold uppercase tracking-[0.08em]';

/**
 * La práctica — página 3.5 «Página D»
 * (docs/specs/2026-07-24-entrenamientos-papel-y-tinta.md). No es un examen
 * (Decisión 6): la corrección es instantánea, la explicación es siempre
 * verbatim del `quiz.json`, y el resultado se muestra en palitos + conteo
 * mono — nunca en porcentaje, nota o veredicto (§13 + umbral 100). Nada se
 * guarda: `respuestas` vive solo en el estado de esta página.
 */
export function PracticaDetail() {
  const [match, params] = useRoute<{ slug: string }>('/entrenamientos/:slug/practica');
  const cursoSlug = params?.slug ?? '';
  const curso = findCursoBySlug(cursoSlug);
  const estado = usePractica(curso ? cursoSlug : '');
  const [respuestas, setRespuestas] = useState<ReadonlyMap<number, number>>(new Map());

  if (!match) return null;
  if (!curso) return <EntrenamientoExtraviado />;

  function elegir(indice: number, opcion: number) {
    setRespuestas((anterior) => {
      if (anterior.has(indice)) return anterior; // una respuesta por pregunta y por visita (Decisión 13)
      return new Map(anterior).set(indice, opcion);
    });
  }

  function reiniciar() {
    setRespuestas(new Map());
  }

  const practica = estado.fase === 'listo' ? estado.practica : null;
  const total = practica?.preguntas.length ?? 0;
  const completa = practica !== null && respuestas.size === total;
  const aciertos = [...respuestas.entries()].filter(
    ([i, opcion]) => practica?.preguntas[i]?.correcta === opcion,
  ).length;

  return (
    <>
      <main className="mx-auto max-w-[800px] px-10 pb-20 pt-12 max-[560px]:px-5">
        <Link
          href={`/entrenamientos/${cursoSlug}`}
          className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em]"
        >
          ← {curso.title}
        </Link>

        {practica ? <Kicker className="mb-4 mt-10">Práctica · {total} preguntas</Kicker> : null}
        <h1
          aria-label="La práctica."
          className={cn(
            'font-anton riso-hover mb-6 text-pretty text-[clamp(36px,5.4vw,68px)] leading-none',
            practica === null && 'mt-10',
          )}
        >
          <RitoTinta lineas={['La práctica.']} />
        </h1>

        {estado.fase === 'cargando' ? <EsqueletoPractica /> : null}
        {estado.fase === 'error' ? <PracticaRota cursoSlug={cursoSlug} /> : null}

        {practica ? (
          <>
            <p className="text-tinta-75 mb-8 max-w-[620px] text-pretty text-[17px] leading-[1.6]">
              {practica.descripcion}
            </p>
            <div className="bg-papel-crudo border-tinta mb-2 border p-6">
              <p className="font-space text-tinta-90 text-[13px] leading-relaxed">
                Esto no es un examen. No se puntúa, no se guarda y no da certificado: es para que veas
                qué te quedó y qué no.
              </p>
            </div>

            <div>
              {practica.preguntas.map((pregunta, i) => (
                <PreguntaPractica
                  key={i}
                  pregunta={pregunta}
                  indice={i}
                  total={total}
                  elegida={respuestas.get(i) ?? null}
                  onElegir={(opcion) => {
                    elegir(i, opcion);
                  }}
                />
              ))}
            </div>

            {completa ? (
              <div className="border-tinta mt-4 border-t-2 pt-7">
                <p className="font-space text-tinta-50 mb-4 text-[11px] uppercase tracking-[0.12em]">
                  Resultado
                </p>
                <div className="flex items-end justify-between gap-4">
                  <Palitos n={aciertos} claseRelleno="bg-violeta" />
                  <p className="font-space text-tinta text-[13px]">
                    {aciertos} de {total}
                  </p>
                </div>
                <p className="text-tinta-75 mt-5 max-w-[620px] text-[15px] leading-relaxed">
                  Las que fallaste tienen la explicación al lado. Si te quedó floja, volvé a la lección.
                </p>
                <div className="mt-6 flex flex-wrap gap-6">
                  <button type="button" onClick={reiniciar} className={CLASE_ACCION}>
                    Empezar de nuevo ↺
                  </button>
                  <Link href={`/entrenamientos/${cursoSlug}`} className={CLASE_ACCION}>
                    ← Volver al entrenamiento
                  </Link>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </main>

      {practica ? (
        <BandaCta fondo="tinta">
          <div className="flex flex-wrap items-center justify-between gap-6 text-left">
            <h2 className="font-anton text-[clamp(30px,4vw,52px)] leading-none">
              Ya lo pensaste. Ahora decilo.
            </h2>
            <BotonPapel asChild variant="violeta" surface="oscuro">
              <Link href="/el-mapa">Soltar mi voz en el mapa →</Link>
            </BotonPapel>
          </div>
        </BandaCta>
      ) : null}
    </>
  );
}

export default PracticaDetail;

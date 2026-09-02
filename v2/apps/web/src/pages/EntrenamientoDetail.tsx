import { Link, useRoute } from 'wouter';

import { BotonPapel, Kicker, RitoTinta, Sello } from '~/components/papel/primitives';
import { findCursoBySlug } from '~/lib/courses-registry';
import {
  duracionLarga,
  numeroDeFila,
  rotuloNivel,
  ubicarCurso,
  type VecinoCurso,
} from '~/pages/Entrenamientos/entrenamientos-data';

const ETAPAS_RUTA = ['Observar', 'Poner a prueba', 'Llevar a la práctica'] as const;

/** 404 §5: el expediente extraviado, sobre papel (esta portada es un índice, no un documento). */
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

/** Un eslabón de la cadena del recorrido; avisa cuando el vecino cruza de grupo. */
function Eslabon({ vecino, lado }: { vecino: VecinoCurso; lado: 'anterior' | 'siguiente' }) {
  const siguiente = lado === 'siguiente';
  return (
    <Link
      href={`/entrenamientos/${vecino.curso.slug}`}
      className={`font-space max-w-[300px] text-xs uppercase tracking-[0.06em] ${
        siguiente
          ? 'text-tinta hover:text-violeta ml-auto text-right font-bold'
          : 'text-tinta-50 hover:text-tinta'
      }`}
    >
      {vecino.cruzaGrupo ? (
        <span className="text-tinta-50 block text-[10px] tracking-[0.1em]">
          {vecino.grupo.rotulo}
        </span>
      ) : null}
      {siguiente ? `${vecino.curso.title} →` : `← ${vecino.curso.title}`}
    </Link>
  );
}

/**
 * Portada del entrenamiento — página 3.5 «Página B»
 * (docs/specs/2026-07-24-entrenamientos-papel-y-tinta.md). De qué se trata,
 * qué lecciones tiene, cuánto dura y la puerta a la práctica. No es un
 * lector: no trae cuerpo de lección, y por eso no define edición impresa
 * (es un índice, no un documento).
 */
export function EntrenamientoDetail() {
  const [match, params] = useRoute<{ slug: string }>('/entrenamientos/:slug');
  if (!match) return null;
  const curso = findCursoBySlug(params.slug);
  const ubicacion = curso ? ubicarCurso(curso.slug) : null;
  if (!curso || !ubicacion) return <EntrenamientoExtraviado />;

  return (
    <main className="mx-auto max-w-[860px] px-10 pb-20 pt-12 max-[560px]:px-5">
      <Link
        href="/entrenamientos"
        className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em]"
      >
        ← Todos los entrenamientos
      </Link>

      <Kicker className="mb-4 mt-10">
        Entrenamiento · {rotuloNivel(curso.level)} · {duracionLarga(curso.duration)}
      </Kicker>
      <h1
        aria-label={curso.title}
        className="font-anton riso-hover mb-6 text-pretty text-[clamp(30px,4.4vw,56px)] leading-[1.05]"
      >
        <RitoTinta lineas={[curso.title]} />
      </h1>
      <p className="text-tinta-75 mb-10 max-w-[620px] text-pretty text-[17px] leading-[1.6]">
        {curso.description}
      </p>

      {curso.coverImage ? (
        <figure className="border-tinta mb-10 overflow-hidden border">
          <img
            src={curso.coverImage}
            alt=""
            className="bg-papel-crudo block aspect-[16/7] w-full object-cover"
          />
          <figcaption className="font-space text-tinta-50 border-tinta border-t px-4 py-2 text-[10px] uppercase tracking-[0.1em]">
            Mapa visual del entrenamiento · ilustración editorial
          </figcaption>
        </figure>
      ) : null}

      {curso.promesa?.length ? (
        <section
          aria-labelledby="resultado-entrenamiento"
          className="border-tinta mb-10 grid border md:grid-cols-2"
        >
          <div className="bg-papel-crudo border-tinta p-6 md:border-r">
            <Kicker className="mb-3">Al terminar</Kicker>
            <h2 id="resultado-entrenamiento" className="font-anton text-2xl leading-tight">
              Te llevás algo que podés usar.
            </h2>
            {curso.productoFinal ? (
              <p className="text-tinta-75 mt-4 text-[15px] leading-relaxed">
                <strong className="text-tinta">Producto final:</strong> {curso.productoFinal}
              </p>
            ) : null}
          </div>
          <ol aria-label="Ruta de trabajo" className="divide-papel-borde divide-y">
            {curso.promesa.map((resultado, i) => (
              <li
                key={resultado}
                className="grid grid-cols-[34px_1fr] gap-3 px-5 py-4 text-[15px] leading-relaxed"
              >
                <span className="font-space text-violeta text-xs font-bold">0{String(i + 1)}</span>
                <span>
                  <span className="font-space text-tinta-50 mb-1 block text-[10px] font-bold uppercase tracking-[0.1em]">
                    {ETAPAS_RUTA[i] ?? 'Integrar'}
                  </span>
                  {resultado}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {curso.paraQuien || curso.noCubre?.length || curso.prerrequisitos.length ? (
        <section className="border-tinta mb-10 grid border md:grid-cols-2">
          <div className="border-tinta p-6 md:border-r">
            <Kicker className="mb-3">Para quién</Kicker>
            <p className="text-tinta-75 text-[15px] leading-relaxed">
              {curso.paraQuien ??
                'Para cualquier persona que quiera pasar de la intuición a una práctica concreta.'}
            </p>
            <p className="text-tinta-50 mt-4 text-sm leading-relaxed">
              <strong className="text-tinta">Antes de empezar:</strong>{' '}
              {curso.prerrequisitos.length
                ? curso.prerrequisitos.join(' · ')
                : 'No necesitás conocimientos previos.'}
            </p>
          </div>
          <div className="bg-papel-crudo p-6">
            <Kicker className="mb-3">Límite honesto</Kicker>
            {curso.noCubre?.length ? (
              <ul className="space-y-3 text-[15px] leading-relaxed">
                {curso.noCubre.map((limite) => (
                  <li key={limite} className="flex gap-3">
                    <span aria-hidden="true">—</span>
                    <span>{limite}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-tinta-75 text-[15px] leading-relaxed">
                Este entrenamiento orienta una primera práctica; no reemplaza acompañamiento
                profesional.
              </p>
            )}
          </div>
        </section>
      ) : null}

      <div className="border-tinta border">
        <div className="bg-papel-crudo border-tinta font-space flex justify-between border-b px-[22px] py-3.5 text-[11px] font-bold uppercase tracking-[0.14em]">
          <span>Lecciones</span>
          <span className="text-tinta-50">gratis · a tu ritmo</span>
        </div>
        {curso.lecciones.map((l, i) => (
          <Link
            key={l.slug}
            href={`/entrenamientos/${curso.slug}/leccion/${String(i + 1)}`}
            className="border-papel-borde text-tinta hover:bg-papel-presionado grid grid-cols-[52px_1fr_70px] items-center gap-[18px] border-b px-[22px] py-[17px] transition-colors duration-150 max-[560px]:grid-cols-[40px_1fr]"
          >
            <span className="font-space text-tinta-30 text-xs">{numeroDeFila(i)}</span>
            <span>
              <span className="block text-base font-semibold">{l.titulo}</span>
              {l.resumen ? (
                <span className="text-tinta-50 mt-1 block text-sm leading-snug">{l.resumen}</span>
              ) : null}
            </span>
            <span className="font-space text-tinta-50 text-[11px] max-[560px]:col-start-2 min-[561px]:text-right">
              {l.minutos} min
            </span>
          </Link>
        ))}
      </div>

      {curso.fuentesBase.length ? (
        <section aria-labelledby="fuentes-entrenamiento" className="border-tinta mt-8 border p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Kicker className="mb-2">Rigor abierto</Kicker>
              <h2 id="fuentes-entrenamiento" className="font-anton text-2xl leading-tight">
                Para ampliar y contrastar.
              </h2>
            </div>
            {curso.revisarAntesDe ? (
              <p className="font-space text-tinta-50 text-[10px] uppercase tracking-[0.08em]">
                revisar antes del {curso.revisarAntesDe.split('-').reverse().join('/')}
              </p>
            ) : null}
          </div>
          <ul className="divide-papel-borde border-papel-borde mt-5 divide-y border-t">
            {curso.fuentesBase.map((fuente) => (
              <li
                key={fuente.url}
                className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4"
              >
                <a
                  href={fuente.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-tinta decoration-tinta/30 hover:text-violeta font-semibold underline underline-offset-4"
                >
                  {fuente.titulo} ↗
                </a>
                <span className="font-space text-tinta-50 text-[10px] uppercase tracking-[0.08em]">
                  consultada {fuente.consultada.split('-').reverse().join('/')}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-tinta-50 mt-4 text-sm leading-relaxed">
            Estas fuentes abren el trabajo: no convierten una interpretación del curso en un hecho
            ni reemplazan la normativa vigente.
          </p>
        </section>
      ) : null}

      <div className="border-violeta mt-8 border-2 px-8 py-[30px] max-[560px]:px-6 max-[560px]:py-6">
        <Kicker className="mb-3">La práctica</Kicker>
        <p className="text-tinta-90 mb-6 max-w-[620px] text-pretty text-[17px] leading-[1.6]">
          Preguntas sobre lo que acabás de leer. No las corrige nadie: te las corregís vos, con la
          explicación al lado. No se guarda nada.
        </p>
        <BotonPapel asChild variant="violeta">
          <Link href={`/entrenamientos/${curso.slug}/practica`}>Hacer la práctica →</Link>
        </BotonPapel>
      </div>

      <nav className="border-tinta mt-11 flex flex-wrap justify-between gap-5 border-t pt-[22px]">
        {ubicacion.anterior ? <Eslabon vecino={ubicacion.anterior} lado="anterior" /> : null}
        {ubicacion.siguiente ? <Eslabon vecino={ubicacion.siguiente} lado="siguiente" /> : null}
      </nav>
    </main>
  );
}

export default EntrenamientoDetail;

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
          ? 'text-tinta ml-auto text-right font-bold hover:text-violeta'
          : 'text-tinta-50 hover:text-tinta'
      }`}
    >
      {vecino.cruzaGrupo ? (
        <span className="text-tinta-30 block text-[10px] tracking-[0.1em]">{vecino.grupo.rotulo}</span>
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
            <span className="text-base font-semibold">{l.titulo}</span>
            <span className="font-space text-tinta-50 text-[11px] max-[560px]:col-start-2 min-[561px]:text-right">
              {l.minutos} min
            </span>
          </Link>
        ))}
      </div>

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

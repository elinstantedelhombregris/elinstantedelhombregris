import { Link } from 'wouter';

import { CURSOS_DESTACADOS } from '../biblioteca-data';

import { Kicker } from '~/components/papel/primitives';
import { CURSO_COUNT } from '~/lib/courses-registry';
import { rotuloNivel } from '~/pages/Entrenamientos/entrenamientos-data';

/**
 * § 5 de la spec de la biblioteca (docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md)
 * — la vidriera de entrenamientos, montada como última tarea de 3.5. Curación
 * real (`isFeatured` + `orderIndex`, `CURSOS_DESTACADOS`); el catálogo
 * entero con los {CURSO_COUNT} vive detrás, en /entrenamientos — la curación
 * afecta el display de este hub, nunca la disponibilidad.
 */
export function EntrenamientosCurados() {
  return (
    <section className="border-tinta bg-papel-crudo border-y">
      <div className="mx-auto max-w-[1100px] px-10 py-14 max-[560px]:px-5">
        <Kicker className="mb-4">Entrenamiento · el ojo se educa</Kicker>
        <h2 className="font-anton mb-5 text-[clamp(30px,3.6vw,48px)] leading-[1.05]">
          Para diseñar un país,
          <br />
          primero entrená la mirada.
        </h2>
        <p className="text-tinta-50 mb-8 max-w-[560px] text-pretty text-[15px] leading-[1.6]">
          Guías cortas, en criollo, sin jerga. Cada una termina en algo que podés hacer esta
          semana.
        </p>

        <div className="border-tinta bg-tinta grid grid-cols-3 gap-px border max-[960px]:grid-cols-1">
          {CURSOS_DESTACADOS.map((curso) => (
            <Link
              key={curso.slug}
              href={`/entrenamientos/${curso.slug}`}
              className="bg-papel-crudo hover:bg-papel flex min-h-[200px] flex-col gap-2.5 px-6 py-[26px] transition-colors duration-150"
            >
              <span className="font-space flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.1em]">
                <span className="text-tinta font-bold">{rotuloNivel(curso.level)}</span>
                <span className="text-tinta-50">{curso.duration} min</span>
              </span>
              <span className="font-anton text-[25px] leading-tight">{curso.title}</span>
              <span className="text-tinta-75 text-pretty text-sm leading-[1.5]">
                {curso.excerpt}
              </span>
              <span className="font-space text-violeta mt-auto text-xs font-bold uppercase tracking-[0.1em]">
                {curso.lecciones.length} lecciones · Empezar →
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/entrenamientos"
          className="font-space text-violeta mt-8 inline-block text-xs font-bold uppercase tracking-[0.1em]"
        >
          Ver los {CURSO_COUNT} entrenamientos →
        </Link>
      </div>
    </section>
  );
}

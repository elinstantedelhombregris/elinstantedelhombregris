import { Link } from 'wouter';

import { useFichas } from '~/lib/queries/fichas';
import { useCampanas } from '~/lib/queries/participacion';

export function EntradaIdeal() {
  const campanas = useCampanas();
  const fichas = useFichas();
  return (
    <>
      <section className="mx-auto max-w-[1100px] px-5 py-12 min-[961px]:px-10">
        <p className="font-space text-violeta text-xs uppercase tracking-[.14em]">
          Una vida se conecta con un país
        </p>
        <div className="bg-tinta mt-6 grid gap-px border md:grid-cols-3">
          {[
            [
              '01',
              'Imaginá',
              'La vida que querrías vivir. Lo que harías, con quién, qué cuidarías.',
            ],
            [
              '02',
              'Encontrá',
              'Otras voces, condiciones compartidas y diferencias que vale la pena entender.',
            ],
            [
              '03',
              'Diseñá',
              'Alternativas, pruebas y resultados. Lo aprendido vuelve a quienes participaron.',
            ],
          ].map(([n, titulo, cuerpo]) => (
            <article key={n} className="bg-papel p-6">
              <span className="font-space text-violeta text-xs">{n}</span>
              <h2 className="font-anton mt-4 text-3xl">{titulo}</h2>
              <p className="mt-4 leading-relaxed">{cuerpo}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-[1100px] gap-10 px-5 py-10 md:grid-cols-2 min-[961px]:px-10">
        <div>
          <h2 className="font-anton text-4xl">Preguntas que nos reúnen.</h2>
          <p className="mt-4 leading-relaxed">
            Una campaña necesita una pregunta, un equipo que escuche y una devolución. Cada mesa
            dice qué podemos esperar.
          </p>
          {campanas.data?.length ? (
            <ul className="mt-5 divide-y border-y">
              {campanas.data.slice(0, 3).map((c) => (
                <li key={c.id} className="py-4">
                  <Link href={`/campanas/${c.slug}`} className="text-violeta underline">
                    {c.contrato.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-tinta-50 mt-5 text-sm">
              Las convocatorias aparecen acá cuando sus equipos las publican.
            </p>
          )}
          <Link
            href="/campanas"
            className="text-violeta mt-5 inline-flex min-h-11 items-center underline"
          >
            Explorar campañas →
          </Link>
        </div>
        <div>
          <h2 className="font-anton text-4xl">Futuros en elaboración.</h2>
          <p className="mt-4 leading-relaxed">
            Una ficha conserva el deseo, sus fuentes y la siguiente pregunta. El diseño puede
            cambiar cuando aprendemos algo.
          </p>
          {fichas.data?.fichas.length ? (
            <ul className="mt-5 divide-y border-y">
              {fichas.data.fichas.slice(0, 3).map((f) => (
                <li key={f.id} className="py-4">
                  <Link href={`/fichas/${f.id}`} className="text-violeta underline">
                    {f.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-tinta-50 mt-5 text-sm">
              Todavía estamos buscando las primeras preguntas de futuro.
            </p>
          )}
          <Link
            href="/fichas"
            className="text-violeta mt-5 inline-flex min-h-11 items-center underline"
          >
            Ver los futuros →
          </Link>
        </div>
      </section>
    </>
  );
}

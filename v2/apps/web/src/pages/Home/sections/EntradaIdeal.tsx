import { Link } from 'wouter';

import { Kicker } from '~/components/papel/primitives';
import { useFichas } from '~/lib/queries/fichas';
import { useCampanas } from '~/lib/queries/participacion';

/** El registro entra como contenido editorial, con sus vacíos y errores reales. */
export function EntradaIdeal() {
  const campanas = useCampanas();
  const fichas = useFichas();
  const abiertas = campanas.data?.filter((c) => c.estado === 'abierta') ?? [];
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-16 min-[961px]:px-10 min-[961px]:py-20" aria-labelledby="inicio-en-comun">
      <Kicker className="mb-6">§ 01 — En común</Kicker>
      <div className="grid items-end gap-6 min-[961px]:grid-cols-[1.3fr_1fr] min-[961px]:gap-16">
        <h2 id="inicio-en-comun" className="font-anton text-[clamp(38px,4.8vw,68px)] leading-[1.02]">
          Lo que empieza<br /><span className="text-violeta">entre nosotros.</span>
        </h2>
        <p className="text-tinta-75 max-w-[500px] text-pretty text-[17px] leading-relaxed">
          Las campañas reúnen miradas sobre un tema y un lugar. Las fichas conservan lo que deseamos,
          lo que todavía pensamos distinto y el próximo paso.
        </p>
      </div>
      <div className="border-tinta mt-9 grid gap-10 border-t-2 pt-8 min-[961px]:grid-cols-[1.3fr_1fr] min-[961px]:gap-16">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-anton text-[30px] leading-tight">Preguntas que nos reúnen</h3>
            <Link href="/campanas" className="font-space text-violeta inline-flex min-h-11 items-center text-xs underline underline-offset-4">Ver las campañas ↗</Link>
          </div>
          {campanas.isLoading ? (
            <p role="status" className="text-tinta-50 py-7 leading-relaxed">Buscando las preguntas abiertas…</p>
          ) : campanas.isError ? (
            <p role="alert" className="text-tinta-75 py-7 leading-relaxed">No pudimos leer las convocatorias. Podés volver a consultarlas desde su catálogo.</p>
          ) : abiertas.length ? (
            <ul className="mt-3 divide-y border-b">
              {abiertas.slice(0, 3).map((c) => (
                <li key={c.id} className="py-5">
                  <p className="font-space text-tinta-50 text-[10px] uppercase tracking-[.1em]">{c.contrato.temas.join(' · ')} · {c.contrato.territorios.length ? 'Convocatoria territorial' : 'Alcance nacional'}</p>
                  <Link href={`/campanas/${c.slug}`} className="font-anton text-tinta hover:text-violeta mt-2 block text-[27px] leading-tight transition-colors">{c.contrato.titulo}</Link>
                  <p className="text-tinta-75 mt-3 max-w-[540px] text-pretty text-[15px] leading-relaxed">{c.contrato.pregunta}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-papel-borde mt-3 border-b py-7">
              <p className="text-tinta-75 max-w-[490px] text-pretty leading-relaxed">Una pregunta necesita un equipo dispuesto a escuchar y devolver. Las convocatorias aparecerán acá cuando estén abiertas.</p>
            </div>
          )}
        </div>
        <div className="border-papel-borde min-[961px]:border-l min-[961px]:pl-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-anton text-[30px] leading-tight">Futuros en elaboración</h3>
            <Link href="/fichas" className="font-space text-violeta inline-flex min-h-11 items-center text-xs underline underline-offset-4">Abrir las fichas ↗</Link>
          </div>
          {fichas.isLoading ? (
            <p role="status" className="text-tinta-50 py-7 leading-relaxed">Buscando los diseños en elaboración…</p>
          ) : fichas.isError ? (
            <p role="alert" className="text-tinta-75 py-7 leading-relaxed">No pudimos leer las fichas. Una consulta fallida no significa que falten ideas.</p>
          ) : fichas.data?.fichas.length ? (
            <ol className="mt-3 divide-y border-b">
              {fichas.data.fichas.slice(0, 3).map((f, i) => (
                <li key={f.id} className="grid grid-cols-[30px_1fr] gap-3 py-5">
                  <span aria-hidden className="font-space text-tinta-50 pt-1 text-[11px]">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <Link href={`/fichas/${f.id}`} className="font-anton text-tinta hover:text-violeta block text-[26px] leading-tight transition-colors">{f.titulo}</Link>
                    <p className="font-space text-tinta-50 mt-3 text-[10px] uppercase tracking-[.08em]">{f.territorioNombre ?? 'Alcance nacional'} · borrador en revisión</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="border-papel-borde mt-3 border-b py-7">
              <p className="text-tinta-75 max-w-[430px] text-pretty leading-relaxed">El primer futuro compartido todavía está por escribirse. Una ficha empieza con una posibilidad y una pregunta para seguirla.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

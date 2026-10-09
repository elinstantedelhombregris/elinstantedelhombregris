import { SLUG_CAMPANA_NACIONAL } from '@v2/shared';
import { Link } from 'wouter';

import { Kicker } from '~/components/papel/primitives';
import { APORTAR_HREF } from '~/lib/participacion/aportar';
import { useFichas } from '~/lib/queries/fichas';
import { useCampanas } from '~/lib/queries/participacion';

const MAXIMO = 3;

/** La fecha en castellano, o `null` si el dato no trae una que se pueda leer. */
function fechaLarga(iso: string | undefined): string | null {
  if (iso === undefined) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Qué se sabe de una ficha, sacado del dato y nunca escrito a mano. */
function metaDeFicha(territorioNombre: string | null, actualizadaEn: string | undefined): string {
  const fecha = fechaLarga(actualizadaEn);
  const lugar = territorioNombre ?? 'Todo el país';
  return fecha === null ? lugar : `${lugar} · actualizada el ${fecha}`;
}

/** La campaña nacional va primera cuando está; el resto conserva el orden del servidor. */
function conLaNacionalPrimero<T extends { slug: string }>(campanas: readonly T[]): T[] {
  const nacional = campanas.filter((c) => c.slug === SLUG_CAMPANA_NACIONAL);
  const otras = campanas.filter((c) => c.slug !== SLUG_CAMPANA_NACIONAL);
  return [...nacional, ...otras];
}

/** El registro entra como contenido editorial, con sus vacíos y errores reales. */
export function EntradaIdeal() {
  const campanas = useCampanas();
  const fichas = useFichas();
  const abiertas = conLaNacionalPrimero(campanas.data?.filter((c) => c.estado === 'abierta') ?? []);
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-16 min-[961px]:px-10 min-[961px]:py-20" aria-labelledby="inicio-en-comun">
      <Kicker className="mb-6">§ 01 — En común</Kicker>
      <div className="grid items-end gap-6 min-[961px]:grid-cols-[1.3fr_1fr] min-[961px]:gap-16">
        <h2 id="inicio-en-comun" className="font-anton text-[clamp(38px,4.8vw,68px)] leading-[1.02]">
          Lo que empieza<br /><span className="text-violeta">entre nosotros.</span>
        </h2>
        <p className="text-tinta-75 max-w-[500px] text-pretty text-[17px] leading-relaxed">
          Una campaña es una pregunta abierta sobre un tema y un lugar. Una ficha es una propuesta
          que un grupo va armando.
        </p>
      </div>
      <div className="border-tinta mt-9 grid gap-10 border-t-2 pt-8 min-[961px]:grid-cols-[1.3fr_1fr] min-[961px]:gap-16">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-anton text-[30px] leading-tight">Campañas abiertas</h3>
            <Link href="/campanas" className="font-space text-violeta inline-flex min-h-11 items-center text-xs underline underline-offset-4">Ver las campañas ↗</Link>
          </div>
          {campanas.isLoading ? (
            <p role="status" className="text-tinta-50 py-7 leading-relaxed">Buscando las campañas abiertas…</p>
          ) : campanas.isError ? (
            <p role="alert" className="text-tinta-75 py-7 leading-relaxed">No pudimos cargar las campañas. Probá de nuevo en un rato.</p>
          ) : abiertas.length ? (
            <ul className="mt-3 divide-y border-b">
              {abiertas.slice(0, MAXIMO).map((c) => {
                const alcance = c.contrato.territorios.length ? 'En lugares puntuales' : 'Todo el país';
                return (
                  <li key={c.id} className="py-5">
                    <p className="font-space text-tinta-50 text-[10px] uppercase tracking-[0.1em]">{[...c.contrato.temas, alcance].join(' · ')}</p>
                    <Link href={`/campanas/${c.slug}`} className="font-anton text-tinta hover:text-violeta mt-2 block text-[27px] leading-tight transition-colors">{c.contrato.titulo}</Link>
                    <p className="text-tinta-75 mt-3 max-w-[540px] text-pretty text-[15px] leading-relaxed">{c.contrato.pregunta}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border-papel-borde mt-3 border-b py-7">
              <p className="text-tinta-75 max-w-[490px] text-pretty leading-relaxed">
                Todavía no hay campañas abiertas. Mientras tanto,{' '}
                <Link href={APORTAR_HREF} className="text-violeta underline underline-offset-4">imaginá tu Argentina</Link>.
              </p>
            </div>
          )}
        </div>
        <div className="border-papel-borde min-[961px]:border-l min-[961px]:pl-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-anton text-[30px] leading-tight">Fichas en armado</h3>
            <Link href="/fichas" className="font-space text-violeta inline-flex min-h-11 items-center text-xs underline underline-offset-4">Abrir las fichas ↗</Link>
          </div>
          {fichas.isLoading ? (
            <p role="status" className="text-tinta-50 py-7 leading-relaxed">Buscando las fichas en armado…</p>
          ) : fichas.isError ? (
            <p role="alert" className="text-tinta-75 py-7 leading-relaxed">No pudimos cargar las fichas. Probá de nuevo en un rato.</p>
          ) : fichas.data?.fichas.length ? (
            <ol className="mt-3 divide-y border-b">
              {fichas.data.fichas.slice(0, MAXIMO).map((f, i) => (
                <li key={f.id} className="grid grid-cols-[30px_1fr] gap-3 py-5">
                  <span aria-hidden className="font-space text-tinta-50 pt-1 text-[11px]">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <Link href={`/fichas/${f.id}`} className="font-anton text-tinta hover:text-violeta block text-[26px] leading-tight transition-colors">{f.titulo}</Link>
                    <p className="font-space text-tinta-50 mt-3 text-[10px] uppercase tracking-[0.08em]">{metaDeFicha(f.territorioNombre, f.actualizadaEn)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="border-papel-borde mt-3 border-b py-7">
              <p className="text-tinta-75 max-w-[430px] text-pretty leading-relaxed">Las fichas nacen de los aportes: cuando un grupo arma una propuesta, aparece acá.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import { Link, useRoute } from 'wouter';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
import { findPlanBySlug } from '~/lib/plans-registry';
import { expedienteDe, PLAN_COUNT } from '~/pages/Planes/la-prueba-data';

/** 404 §5: el expediente extraviado, en el mismo marco oscuro. */
function ExpedienteExtraviado() {
  return (
    <main className="bg-tinta py-24">
      <div className="bg-papel text-tinta mx-auto max-w-md p-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <Kicker className="mb-4">expediente extraviado</Kicker>
        <h1 className="font-anton mb-6 text-4xl leading-none">Ese plan no está.</h1>
        <div className="mb-8">
          <Sello color="rojo">Extraviado</Sello>
        </div>
        <BotonPapel asChild variant="tinta">
          <Link href="/planes">Volver a la prueba →</Link>
        </BotonPapel>
      </div>
    </main>
  );
}

/**
 * La prueba — lector de plan (spec 2.4): expediente papel-sobre-oscuro
 * con sello EJEMPLO permanente y la primera edición impresa del sistema.
 * El cuerpo MDX se renderiza VERBATIM; su # H1 es el título del documento.
 */
export function PlanDetail() {
  const [match, params] = useRoute<{ slug: string }>('/planes/:slug');
  if (!match) return null;
  const plan = findPlanBySlug(params.slug);
  if (!plan) return <ExpedienteExtraviado />;

  const num = expedienteDe(plan.slug);
  const expediente = plan.isMeta ? 'el plan meta' : `expediente ${num ?? '—'}/${String(PLAN_COUNT)}`;
  const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="bg-tinta print:bg-transparent">
      <div className="mx-auto max-w-[860px] px-10 py-16 max-[560px]:px-5 print:p-0">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 print:hidden">
          <Kicker className="text-violeta-claro">La prueba · {expediente}</Kicker>
          <Link href="/planes" className="font-space text-oscuro-meta text-xs uppercase tracking-[0.1em]">
            ← Volver a la prueba
          </Link>
        </div>

        <article className="edicion-impresa bg-papel text-tinta relative px-14 py-[52px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-[560px]:p-6 print:p-0 print:shadow-none">
          <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
            ¡BASTA! · edición del lector · {fecha}
          </p>
          <div className="absolute right-8 top-7 max-[560px]:static max-[560px]:mb-4">
            <Sello color="rojo" rotate={6}>
              Ejemplo
            </Sello>
          </div>
          <div className="font-space text-tinta-50 border-papel-borde mb-2 flex flex-wrap justify-between gap-2 border-b pb-3 text-[11px] uppercase tracking-[0.12em]">
            <span>{plan.code} · prueba, no doctrina</span>
            <span>{expediente}</span>
          </div>
          <p className="font-space text-tinta-50 mb-8 text-[11px] tracking-[0.04em]">
            Esto lo escribió uno solo. Leelo para criticarlo, mejorarlo o reemplazarlo.
          </p>

          <MdxPapel raw={plan.body} />

          <footer className="border-papel-borde mt-12 border-t pt-6">
            <p className="font-space text-tinta-50 text-[13px] print:hidden">
              ¿Lo podés mejorar? Esa es la idea.{' '}
              <Link href="/el-mapa" className="text-violeta font-bold uppercase tracking-[0.08em]">
                Soltá tu voz en el mapa →
              </Link>
            </p>
            <p className="font-space text-tinta-30 mt-4 text-right text-xs">— El hombre gris</p>
          </footer>
        </article>
      </div>
    </main>
  );
}

export default PlanDetail;

import { useEffect, useMemo, useState } from 'react';
import { Link, useRoute } from 'wouter';

import { IndiceLector, type SeccionDelIndice } from '~/components/papel/IndiceLector';
import { MdxPapel } from '~/components/papel/MdxPapel';
import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
import { extraerEncabezados } from '~/lib/markdown';
import {
  cargarCuerpoPlan,
  findPlanBySlug,
  type PlanCuerpo,
  type PlanRegistryEntry,
} from '~/lib/plans-registry';
import { expedienteDe, PLAN_COUNT } from '~/pages/Planes/la-prueba-data';

const ETIQUETA_INDICE = 'Índice del expediente';

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
          <Link href="/planes">Volver a los ejemplos →</Link>
        </BotonPapel>
      </div>
    </main>
  );
}

/**
 * El cuerpo del documento llega por `import()` — son hasta 4.473 líneas por
 * plan y no pueden viajar en el bundle. Vive en un hook y no en el cuerpo
 * porque el índice (fuera del papel) y el documento (adentro) leen lo mismo.
 */
function useCuerpoDelPlan(code: string): { contenido: PlanCuerpo | null; fallo: boolean } {
  const [contenido, setContenido] = useState<PlanCuerpo | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let vigente = true;
    // Cambió el código: reseteá al estado de carga antes de pedir el cuerpo
    // nuevo, así el documento anterior no queda pegado bajo la cabecera nueva.
    setContenido(null);
    setFallo(false);
    void cargarCuerpoPlan(code)
      .then((c) => {
        if (vigente) setContenido(c);
      })
      .catch(() => {
        if (vigente) setFallo(true);
      });
    return () => {
      vigente = false;
    };
  }, [code]);

  return { contenido, fallo };
}

/**
 * El documento como se lee. La ficha del expediente (cabecera de auditoría
 * + parches) entra plegada: es aparato de producción, no lectura.
 */
function CuerpoDelPlan({ contenido, fallo }: { contenido: PlanCuerpo | null; fallo: boolean }) {
  if (fallo) {
    return (
      <div className="py-16 text-center">
        <p className="font-space text-tinta-50 mb-6 text-[13px] tracking-[0.04em]">
          Este expediente no abrió. Puede ser la conexión, o que tengas cargada una edición
          vieja de esta página.
        </p>
        <BotonPapel
          variant="tinta"
          onClick={() => {
            // Recarga entera, no un reintento del mismo import(): si el chunk
            // quedó podado por un deploy nuevo, pedirlo de vuelta falla igual.
            window.location.reload();
          }}
        >
          Recargar la página
        </BotonPapel>
      </div>
    );
  }

  if (!contenido) {
    return (
      <p className="font-space text-tinta-50 py-16 text-center text-[13px] uppercase tracking-[0.12em]">
        Abriendo el expediente…
      </p>
    );
  }

  return (
    <>
      <MdxPapel raw={contenido.cuerpo} />

      {contenido.ficha === '' ? null : (
        <details className="border-papel-borde mt-12 border-t pt-6 print:mt-8">
          <summary className="font-space text-tinta-50 hover:text-tinta cursor-pointer text-[11px] uppercase tracking-[0.12em]">
            Ficha del expediente — presupuesto, instrumento legal, tranche, gates
          </summary>
          <div className="mt-6">
            <MdxPapel raw={contenido.ficha} />
          </div>
        </details>
      )}
    </>
  );
}

/**
 * El lector de un plan que existe: expediente papel-sobre-oscuro con sello
 * EJEMPLO permanente, la primera edición impresa del sistema, y —desde la
 * spec 2026-09-01 (D-082)— un índice de secciones: columna fija a la
 * izquierda del papel en pantallas anchas, `<details>` arriba del documento
 * en las angostas. Un PLAN mide 68.000 palabras; sin índice no se recorre.
 */
function LectorDelPlan({ plan }: { plan: PlanRegistryEntry }) {
  const { contenido, fallo } = useCuerpoDelPlan(plan.code);
  const secciones = useMemo<SeccionDelIndice[]>(
    () =>
      contenido
        ? extraerEncabezados(contenido.cuerpo, 2).map((e) => ({ id: e.id, texto: e.texto }))
        : [],
    [contenido],
  );
  const hayIndice = secciones.length > 0;

  const num = expedienteDe(plan.slug);
  const expediente = plan.isMeta
    ? 'el plan meta'
    : `expediente ${num ?? '—'}/${String(PLAN_COUNT)}`;
  const fecha = new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="bg-tinta print:bg-transparent">
      <div className="mx-auto max-w-[860px] px-10 py-16 max-[560px]:px-5 min-[1141px]:grid min-[1141px]:max-w-[1140px] min-[1141px]:grid-cols-[240px_minmax(0,860px)] min-[1141px]:gap-x-10 print:p-0">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 min-[1141px]:col-start-2 print:hidden">
          <Kicker className="text-violeta-claro">El ejemplo · {expediente}</Kicker>
          <Link
            href="/planes"
            className="font-space text-oscuro-meta text-xs uppercase tracking-[0.1em]"
          >
            ← Volver a los ejemplos
          </Link>
        </div>

        {hayIndice ? (
          <aside className="hidden min-[1141px]:col-start-1 min-[1141px]:row-start-2 min-[1141px]:block print:hidden">
            <IndiceLector
              secciones={secciones}
              etiqueta={ETIQUETA_INDICE}
              presentacion="columna"
              superficie="oscuro"
            />
          </aside>
        ) : null}

        <article className="edicion-impresa bg-papel text-tinta relative px-14 py-[52px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-[560px]:p-6 min-[1141px]:col-start-2 min-[1141px]:row-start-2 print:p-0 print:shadow-none">
          <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
            ¡BASTA! · edición del lector · {fecha}
          </p>
          <div className="absolute right-8 top-7 max-[560px]:static max-[560px]:mb-4">
            <Sello color="rojo" rotate={6}>
              Ejemplo
            </Sello>
          </div>
          <div className="font-space text-tinta-50 border-papel-borde mb-2 flex flex-wrap justify-between gap-2 border-b pb-3 text-[11px] uppercase tracking-[0.12em]">
            <span>{plan.code} · ejemplo, no doctrina</span>
            <span>{expediente}</span>
          </div>
          <p className="font-space text-tinta-50 mb-8 text-[11px] tracking-[0.04em]">
            Primero el ideal, después el camino. Leelo para criticarlo, mejorarlo o reemplazarlo.
          </p>

          {hayIndice ? (
            <IndiceLector
              secciones={secciones}
              etiqueta={ETIQUETA_INDICE}
              presentacion="plegado"
              className="mb-8 min-[1141px]:hidden print:hidden"
            />
          ) : null}

          <CuerpoDelPlan contenido={contenido} fallo={fallo} />

          <footer className="border-papel-borde mt-12 border-t pt-6">
            <p className="font-space text-tinta-50 text-[13px] print:hidden">
              ¿Lo podés mejorar? Esa es la idea.{' '}
              <Link href="/el-mapa" className="text-violeta font-bold uppercase tracking-[0.08em]">
                Soltá tu voz en el mapa →
              </Link>
            </p>
            <p className="font-space text-tinta-50 mt-4 text-right text-xs">— El hombre gris</p>
          </footer>
        </article>
      </div>
    </main>
  );
}

/**
 * El ejemplo — lector de plan (spec 2.4): resuelve el slug contra el registry
 * y entrega el lector; el cuerpo MDX se renderiza VERBATIM y su # H1 es el
 * título del documento.
 */
export function PlanDetail() {
  const [match, params] = useRoute<{ slug: string }>('/planes/:slug');
  if (!match) return null;
  const plan = findPlanBySlug(params.slug);
  if (!plan) return <ExpedienteExtraviado />;
  return <LectorDelPlan plan={plan} />;
}

export default PlanDetail;

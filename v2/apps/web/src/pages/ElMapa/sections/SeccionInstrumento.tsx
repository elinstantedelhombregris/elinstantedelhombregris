import { Suspense, lazy } from 'react';

/**
 * El instrumento, debajo del panel de carga (§ pedido de rediseño).
 *
 * Se monta SIEMPRE: el mapa es la pieza principal de la página, no una sección
 * opcional detrás de un botón. Antes estaba escondido abajo del pliegue y había
 * que ir a buscarlo, que es exactamente lo que hacía que no se usara.
 *
 * Sigue perezoso por `lazy()` para que maplibre no entre en el bundle inicial:
 * carga mientras la persona lee el panel de arriba, no antes.
 */
const Instrumento = lazy(() =>
  import('../instrumento/Instrumento').then((m) => ({ default: m.Instrumento })),
);

export function SeccionInstrumento() {
  return (
    <section id="instrumento" aria-labelledby="instrumento-titulo" className="mt-10">
      <div className="mx-auto mb-5 max-w-[1440px] px-5 min-[961px]:px-10">
        <h2
          id="instrumento-titulo"
          className="font-anton text-tinta text-[clamp(24px,3.5vw,38px)] leading-[1.05]"
        >
          El país, cuadra por cuadra.
        </h2>
        <p className="text-tinta mt-2 max-w-[62ch] text-[16px] leading-relaxed">
          Movete por el mapa y el contador te contesta. Cambiá de lente arriba: dónde se dijo cada
          cosa, qué provincia habla más, cómo se fue llenando, y dónde todavía no habló nadie.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-tinta border-oscuro-borde flex h-[min(78vh,760px)] items-center justify-center border-y">
            <p className="font-space text-oscuro-meta text-[11px] uppercase tracking-[0.14em]">
              Cargando el instrumento…
            </p>
          </div>
        }
      >
        <Instrumento />
      </Suspense>
    </section>
  );
}

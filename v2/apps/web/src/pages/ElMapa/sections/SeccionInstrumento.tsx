import { Suspense, lazy } from 'react';

import type { LugarMapa } from '../instrumento/BusquedaTerritorial';

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

export function SeccionInstrumento({
  onAportar,
}: {
  onAportar?: (lugar: LugarMapa | null) => void;
}) {
  return (
    <section id="instrumento" aria-labelledby="instrumento-titulo" className="mt-2">
      <div className="mx-auto mb-4 max-w-[1440px] px-5 min-[961px]:px-10">
        {/* El título queda para los lectores de pantalla: a la vista, la portada
            ya lo dice, y dos titulares apilados empujaban el mapa fuera de la
            primera pantalla del teléfono. */}
        <h2 id="instrumento-titulo" className="sr-only">
          El país, cuadra por cuadra.
        </h2>
        <p className="text-tinta-75 max-w-[62ch] text-[15px] leading-relaxed max-[639px]:sr-only">
          Buscá tu lugar o recorré el país. Cambiá de lente: dónde se dijo cada cosa, qué provincia
          habla más, cómo se fue llenando y dónde todavía no habló nadie. Se cuentan registros, no
          personas.
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
        <Instrumento {...(onAportar ? { onAportar } : {})} />
      </Suspense>
    </section>
  );
}

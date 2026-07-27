import { Suspense, lazy, useEffect, useState } from 'react';

import { leerAreaDelHash } from '../instrumento/area-url';

import type { GeoPoint } from '@v2/civic-core';
import type { CapaMapa } from '~/lib/queries/civic-map';

import { CAPAS } from '~/lib/queries/civic-map';

const Instrumento = lazy(() =>
  import('../instrumento/Instrumento').then((m) => ({ default: m.Instrumento })),
);

/**
 * El instrumento abajo del pliegue (spec 3 §2, decisión D1).
 *
 * NO se monta hasta que se lo pide. Ni el componente ni sus queries existen
 * mientras la invitación no se toca: los 30 segundos de arriba —la conversión
 * primaria de todo el sitio— no pagan un byte del análisis de abajo.
 *
 * `#instrumento` es el ancla profunda: `/el-mapa#instrumento` lo monta directo,
 * y `/explorar-datos` redirige acá. Un link con `?area=` además dibuja el
 * recorte y abre el panel sin que nadie tenga que dibujar nada.
 */
export function SeccionInstrumento() {
  const [abierto, setAbierto] = useState(false);
  const [area, setArea] = useState<{ poligono: GeoPoint[]; capas: CapaMapa[] } | null>(null);

  useEffect(() => {
    const leer = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#instrumento')) return;
      setAbierto(true);
      const leida = leerAreaDelHash(hash);
      if (leida) {
        const capas = leida.capas.filter((c): c is CapaMapa => (CAPAS as readonly string[]).includes(c));
        setArea({ poligono: leida.poligono, capas: capas.length > 0 ? capas : [...CAPAS] });
      }
    };
    leer();
    window.addEventListener('hashchange', leer);
    return () => {
      window.removeEventListener('hashchange', leer);
    };
  }, []);

  return (
    <section
      id="instrumento"
      className="mx-auto max-w-[1440px] px-5 pb-[88px] min-[961px]:px-10"
      aria-labelledby="instrumento-titulo"
    >
      <div className="border-tinta/20 border-t pt-12">
        <h2
          id="instrumento-titulo"
          className="font-anton text-tinta mb-3 text-[clamp(28px,4vw,48px)] leading-[1.05]"
        >
          Cercá tu zona.
        </h2>
        <p className="text-tinta mb-6 max-w-[52ch] text-[17px] leading-relaxed">
          Dibujá un área sobre el mapa y mirá qué se dijo ahí adentro: cuántas voces, de qué tipo,
          sobre qué temas — y en qué partes de tu zona no habló nadie todavía.
        </p>

        {abierto ? (
          <Suspense
            fallback={
              <p className="font-space text-tinta-30 text-[11px] uppercase tracking-[0.12em]">
                Cargando el instrumento…
              </p>
            }
          >
            <Instrumento
              {...(area ? { areaInicial: area.poligono, capasIniciales: area.capas } : {})}
            />
          </Suspense>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAbierto(true);
              window.history.replaceState(null, '', '#instrumento');
            }}
            className="border-tinta bg-tinta text-papel font-space focus-visible:ring-violeta border px-6 py-3 text-[12px] uppercase tracking-[0.1em] outline-none focus-visible:ring-2"
          >
            Abrir el instrumento
          </button>
        )}
      </div>
    </section>
  );
}

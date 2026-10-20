import { useEffect, useMemo, useState } from 'react';

import { fraseDeProvincia } from './formato';

import type { ProvinciaEnVision } from '@v2/shared';
import type { KeyboardEvent } from 'react';

/** Un camino simplificado (`scripts/geo/simplificar-provincias.ts`). */
export interface CaminoDeProvincia {
  nombre: string;
  iso: string;
  d: string;
}

/**
 * La rampa plata de Papel y Tinta, del papel presionado a un gris azulado: cuánta gente
 * participó por habitante, de 0 (nadie) a 5. En hexadecimal porque va en `fill`.
 */
export const LUZ = ['#E6E1D4', '#D3D6D8', '#B9C0C7', '#9CA6B1', '#7F8B98', '#5F6C7B'] as const;

const PAPEL = '#F2EFE7';
const TINTA = '#16130E';
const TINTA_50 = '#6B665C';

const luzDe = (nivel: number) => LUZ[Math.max(0, Math.min(5, Math.round(nivel)))] ?? LUZ[0];

/** Los caminos van aparte (≈41 KB) y se piden recién cuando el mapa se monta. */
function useCaminos() {
  const [caminos, setCaminos] = useState<readonly CaminoDeProvincia[] | null>(null);
  const [fallo, setFallo] = useState(false);
  useEffect(() => {
    let vivo = true;
    import('./provincias-simples.json')
      .then((m) => {
        if (vivo) setCaminos(m.default);
      })
      .catch(() => {
        if (vivo) setFallo(true);
      });
    return () => {
      vivo = false;
    };
  }, []);
  return { caminos, fallo };
}

/**
 * El país en plata: cada provincia se enciende según cuánta gente participó por habitante.
 * SVG liviano, sin maplibre. Cada provincia se toca o se elige con el teclado.
 */
export function MapaPais({ provincias }: { provincias: ProvinciaEnVision[] }) {
  const { caminos, fallo } = useCaminos();
  const [elegida, setElegida] = useState<string | null>(null);
  const porIso = useMemo(() => new Map(provincias.map((p) => [p.iso, p])), [provincias]);
  const elegidaCamino = caminos?.find((c) => c.iso === elegida);

  const teclear = (iso: string) => (e: KeyboardEvent<SVGPathElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setElegida(iso);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {caminos ? (
        <svg
          viewBox="0 0 166 340"
          role="group"
          aria-label="Mapa de la Argentina: cada provincia se enciende según cuánta gente participó por habitante"
          className="block h-auto w-[min(230px,62vw)]"
        >
          {caminos.map((c) => {
            const p = porIso.get(c.iso);
            const nivel = p?.nivel ?? 0;
            const esta = elegida === c.iso;
            return (
              <path
                key={c.iso}
                d={c.d}
                data-iso={c.iso}
                fill={luzDe(nivel)}
                fillRule="evenodd"
                stroke={esta ? TINTA : nivel === 0 ? TINTA_50 : PAPEL}
                strokeWidth={esta ? 1.6 : 0.6}
                strokeDasharray={nivel === 0 && !esta ? '2 2' : undefined}
                tabIndex={0}
                role="button"
                aria-pressed={esta}
                aria-label={fraseDeProvincia(c.nombre, c.iso, p)}
                className="focus-visible:stroke-violeta cursor-pointer focus-visible:[stroke-dasharray:none] focus-visible:[stroke-width:2]"
                // El foco se ve en el trazo violeta: el contorno de `.papel-root :focus-visible`
                // dibujaría el rectángulo de la provincia entera encima de sus vecinas.
                style={{ outline: 'none' }}
                onClick={() => {
                  setElegida(c.iso);
                }}
                onKeyDown={teclear(c.iso)}
              />
            );
          })}
        </svg>
      ) : (
        <div
          aria-hidden
          className="bg-papel-presionado aspect-[166/340] w-[min(230px,62vw)] motion-safe:animate-pulse"
        />
      )}
      <Rampa />
      <p role="status" className="text-tinta-75 min-h-[2.5em] text-center text-[13.5px]">
        {fallo
          ? 'El mapa no cargó. Las regiones de abajo dicen lo mismo en palabras.'
          : elegidaCamino
            ? fraseDeProvincia(
                elegidaCamino.nombre,
                elegidaCamino.iso,
                porIso.get(elegidaCamino.iso),
              )
            : 'Tocá una provincia para ver cuánta gente participó desde ahí.'}
      </p>
    </div>
  );
}

function Rampa() {
  return (
    <div className="text-tinta-50 flex flex-col items-center gap-1 text-[12px]">
      <p className="flex items-center gap-1">
        Menos gente
        {LUZ.slice(1).map((color) => (
          <i
            key={color}
            aria-hidden
            className="inline-block h-2.5 w-[18px]"
            style={{ background: color }}
          />
        ))}
        más gente, por habitante
      </p>
      <p className="flex items-center gap-1.5">
        <i
          aria-hidden
          className="border-tinta-50 inline-block h-2.5 w-[18px] border border-dashed"
          style={{ background: LUZ[0] }}
        />
        Borde punteado: todavía no se encendió
      </p>
    </div>
  );
}

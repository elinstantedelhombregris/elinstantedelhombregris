import { CapaSenales } from './CapaSenales';
import { MigaDePan } from './MigaDePan';
import { aAtributo } from './useAltitud';

import type { SenalDibujable } from './CapaSenales';
import type { EstadoAltitud } from './useAltitud';
import type { ProvinciaSvg } from '~/geo/pais.generated';

import { PROVINCIAS_SVG } from '~/geo/pais.generated';
import { cn } from '~/lib/utils';

/**
 * El lienzo: un solo SVG que cambia de altitud moviendo su viewBox (spec 1 §4).
 *
 * Nunca se remonta ni se cambia por otro componente al entrar a una provincia
 * — es el mismo lienzo acercándose, y por eso la transición se puede animar y
 * uno no pierde de vista dónde estaba.
 *
 * Accesibilidad (§4.2): la unidad interactiva es la región, no el punto. En
 * altitud país eso son 24 tab-stops como máximo; los lavados y los halos son
 * textura `aria-hidden`. Al cambiar de altitud, un `aria-live` lo anuncia,
 * porque un zoom silencioso deja a quien no ve el mapa sin saber que se movió.
 */

export interface LienzoProps {
  estado: EstadoAltitud;
  senales: readonly SenalDibujable[];
  /** Señales a nivel provincia, contadas por nombre de provincia. */
  conteoProvincial: ReadonlyMap<string, number>;
  /** Total autoritativo por provincia — el número que se dibuja al lado. */
  totalPorProvincia: ReadonlyMap<string, number>;
  /** Provincias que se pueden activar, por nombre. */
  activables: ReadonlySet<string>;
  onProvincia: (provincia: ProvinciaSvg) => void;
  onSenal?: (id: string) => void;
  etiquetaProvincia: (nombre: string, total: number) => string;
}

export function Lienzo({
  estado,
  senales,
  conteoProvincial,
  totalPorProvincia,
  activables,
  onProvincia,
  onSenal,
  etiquetaProvincia,
}: LienzoProps) {
  const { altitud, provincia, viewBox } = estado;
  const enPais = altitud === 'pais';

  // En altitud provincia, el trazo tiene que adelgazar a la par del zoom: si
  // no, un borde de 1,2 unidades a 6x se ve como una franja.
  const trazo = 1.2 / estado.escala;

  return (
    <>
      <MigaDePan altitud={altitud} provincia={provincia?.nombre ?? null} onVolver={estado.volver} />

      <svg
        viewBox={aAtributo(viewBox)}
        className="mx-auto block max-h-[76vh] w-full transition-[view-box] duration-500 ease-out"
        role="group"
        aria-label="Mapa de la Argentina: las voces por provincia"
      >
        {PROVINCIAS_SVG.map((prov) => {
          const total = totalPorProvincia.get(prov.nombre) ?? 0;
          // Al entrar a una provincia, las demás dejan de ser interactivas:
          // los tab-stops son los de la altitud actual, no la suma de todas.
          const interactiva = enPais && activables.has(prov.nombre);
          const atenuada = !enPais && provincia?.nombre !== prov.nombre;

          return (
            <path
              key={prov.nombre}
              d={prov.path}
              strokeWidth={trazo}
              className={cn(
                'fill-papel-mapa stroke-tinta',
                atenuada && 'opacity-30',
                interactiva &&
                  'hover:fill-papel-presionado focus-visible:stroke-violeta cursor-pointer outline-none transition-colors focus-visible:stroke-2',
              )}
              {...(interactiva
                ? {
                    id: `prov-${prov.nombre}`,
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': etiquetaProvincia(prov.nombre, total),
                    onClick: () => {
                      onProvincia(prov);
                    },
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onProvincia(prov);
                      }
                    },
                  }
                : { 'aria-hidden': true })}
            />
          );
        })}

        <CapaSenales
          senales={senales}
          provincias={PROVINCIAS_SVG}
          conteoProvincial={conteoProvincial}
          escala={estado.escala}
          {...(enPais ? {} : onSenal ? { onSenal } : {})}
        />

        {/* El número del racimo: el conteo autoritativo por provincia. */}
        <g aria-hidden className="pointer-events-none">
          {PROVINCIAS_SVG.map((prov) => {
            const total = totalPorProvincia.get(prov.nombre) ?? 0;
            if (total <= 0) return null;
            if (!enPais && provincia?.nombre !== prov.nombre) return null;
            return (
              <text
                key={`n-${prov.nombre}`}
                x={prov.cx}
                y={prov.cy}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-tinta font-space font-bold"
                style={{ fontSize: `${String(13 / estado.escala)}px` }}
              >
                {total}
              </text>
            );
          })}
        </g>
      </svg>

      <p role="status" aria-live="polite" className="sr-only">
        {enPais
          ? 'Mirando todo el país.'
          : `Mirando ${provincia?.nombre ?? ''}. Volvé con el enlace «Argentina».`}
      </p>
    </>
  );
}

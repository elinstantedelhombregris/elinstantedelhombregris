import { dibujoDe, haloVisible, opacidadLavado, precisionValida, puntoDeSenal } from './precision';

import type { ProvinciaSvg } from '~/geo/pais.generated';

import { cn } from '~/lib/utils';

/**
 * El dibujo de las señales, según la precisión con la que fueron publicadas
 * (spec 1 §5). Dos regímenes que conviven en el mismo lienzo:
 *
 *   provincia → lavado de tinta sobre la forma entera, opacidad por cantidad
 *   punto     → símbolo, más su halo de incertidumbre cuando el halo dice algo
 *
 * Una señal a nivel provincia NO se dibuja como punto. Es la diferencia entre
 * decir «hay 400 voces en Buenos Aires» y decir «hay una voz acá», y el lazo de
 * la spec 3 vuelve esa diferencia medible.
 *
 * El halo es el radio geográfico verdadero, sin piso: a escala país la
 * incertidumbre de 100 m es invisible, y eso es la verdad a esa escala.
 * Mientras tanto la certeza la carga el aspecto — el punto exacto va con borde
 * nítido, los demás sin borde.
 */

export interface SenalDibujable {
  id: string;
  lat: number | null;
  lng: number | null;
  precision: string;
  /** Clase de relleno del tipo — `fill-sello`, `fill-violeta`, etc. */
  fill: string;
  /** Texto para el lector de pantalla, ya con la precisión adentro. */
  etiqueta: string;
}

export interface CapaSenalesProps {
  senales: readonly SenalDibujable[];
  provincias: readonly ProvinciaSvg[];
  /** Cuántas señales a nivel provincia tiene cada provincia, por nombre. */
  conteoProvincial: ReadonlyMap<string, number>;
  /** Acercamiento respecto del país: 1 = país entero. */
  escala: number;
  onSenal?: (id: string) => void;
}

export function CapaSenales({
  senales,
  provincias,
  conteoProvincial,
  escala,
  onSenal,
}: CapaSenalesProps) {
  const conPunto = senales
    .map((senal) => ({
      senal,
      dibujo: dibujoDe(precisionValida(senal.precision)),
      punto: puntoDeSenal(senal.lat, senal.lng),
    }))
    .filter((entrada) => entrada.punto !== null);

  return (
    <>
      {/* Lavado provincial — las señales que solo saben su provincia. */}
      <g aria-hidden className="pointer-events-none">
        {provincias.map((provincia) => {
          const cantidad = conteoProvincial.get(provincia.nombre) ?? 0;
          if (cantidad <= 0) return null;
          return (
            <path
              key={`lavado-${provincia.nombre}`}
              d={provincia.path}
              className="fill-tinta"
              opacity={opacidadLavado(cantidad)}
            />
          );
        })}
      </g>

      {/* Halos: todos antes que los símbolos, para que ninguno tape a otro. */}
      <g aria-hidden className="pointer-events-none">
        {conPunto.map(({ senal, dibujo, punto }) =>
          haloVisible(dibujo, escala) ? (
            <circle
              key={`halo-${senal.id}`}
              cx={punto?.x}
              cy={punto?.y}
              r={dibujo.radioHalo}
              className={cn(senal.fill, 'opacity-[0.16]')}
            />
          ) : null,
        )}
      </g>

      {/* Los símbolos. Son la unidad interactiva cuando hay coordenada. */}
      <g>
        {conPunto.map(({ senal, dibujo, punto }) => (
          <circle
            key={senal.id}
            cx={punto?.x}
            cy={punto?.y}
            // El símbolo encoge con el zoom: es una marca en pantalla, no una
            // huella en el terreno. Así el halo termina superándolo al acercar.
            r={dibujo.radio / escala}
            strokeWidth={dibujo.nitido ? 0.9 / escala : 0}
            className={cn(
              senal.fill,
              dibujo.nitido ? 'stroke-papel' : 'stroke-none',
              onSenal &&
                'focus-visible:stroke-violeta cursor-pointer outline-none focus-visible:stroke-2',
            )}
            {...(onSenal
              ? {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': senal.etiqueta,
                  onClick: () => {
                    onSenal(senal.id);
                  },
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSenal(senal.id);
                    }
                  },
                }
              : { 'aria-hidden': true })}
          />
        ))}
      </g>
    </>
  );
}

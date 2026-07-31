import { useCallback, useMemo, useState } from 'react';

import { tipoDe } from './paleta';

import type { MapRef } from 'react-map-gl/maplibre';
import type { TipoVoz } from '~/components/papel/primitives';
import type { SenalMapa } from '~/lib/queries/civic-map';

/**
 * Lo que está EN VISTA.
 *
 * El contador de deflock («123.111 cámaras en vista») no es un adorno: es lo
 * que convierte navegar en medir. Uno arrastra el mapa sobre una provincia y el
 * número le contesta. Sin eso, el mapa es una postal con puntos.
 *
 * El recorte se hace en el cliente sobre lo que ya se trajo. Pedirle al
 * servidor un conteo por cada movimiento del mapa sería un round-trip por
 * arrastre — y el servidor ya recorta por bbox cuando hace falta.
 */

export interface Recuadro {
  oeste: number;
  sur: number;
  este: number;
  norte: number;
}

export interface SenalConTipo extends SenalMapa {
  tipoVoz: TipoVoz;
}

export interface VistaMapa {
  recuadro: Recuadro | null;
  /** Se le pasa al `onMove` del mapa. */
  alMover: (mapa: MapRef | null) => void;
}

export function useVistaMapa(): VistaMapa {
  const [recuadro, setRecuadro] = useState<Recuadro | null>(null);

  const alMover = useCallback((mapa: MapRef | null) => {
    if (!mapa) return;
    const b = mapa.getBounds();
    setRecuadro({
      oeste: b.getWest(),
      sur: b.getSouth(),
      este: b.getEast(),
      norte: b.getNorth(),
    });
  }, []);

  return { recuadro, alMover };
}

const dentro = (senal: SenalMapa, r: Recuadro): boolean =>
  typeof senal.lat === 'number' &&
  typeof senal.lng === 'number' &&
  senal.lat >= r.sur &&
  senal.lat <= r.norte &&
  senal.lng >= r.oeste &&
  senal.lng <= r.este;

/**
 * Las señales que caen en el recuadro. Sin recuadro todavía (primer render),
 * devuelve todas: es mejor mostrar el total que un cero que parpadea.
 */
export function useSenalesEnVista(
  senales: readonly SenalMapa[],
  recuadro: Recuadro | null,
): SenalConTipo[] {
  return useMemo(() => {
    const base = recuadro ? senales.filter((s) => dentro(s, recuadro)) : senales;
    return base.map((s) => ({ ...s, tipoVoz: tipoDe(s.tipo) }));
  }, [senales, recuadro]);
}

/** Cuántas de cada tipo, para la barra apilada de composición. */
export function componerPorTipo(senales: readonly SenalConTipo[]): { tipo: TipoVoz; n: number }[] {
  const cuenta = new Map<TipoVoz, number>();
  for (const s of senales) cuenta.set(s.tipoVoz, (cuenta.get(s.tipoVoz) ?? 0) + 1);
  return [...cuenta.entries()]
    .map(([tipo, n]) => ({ tipo, n }))
    .sort((a, b) => b.n - a.n);
}

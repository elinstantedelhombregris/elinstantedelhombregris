import { useCallback, useMemo, useState } from 'react';



import { claseDeCategoria } from '../el-mapa-data';

import type { MapRef } from 'react-map-gl/maplibre';
import type { SenalMapa } from '~/lib/queries/civic-map';
import type { ClaseSenal } from '~/lib/vocabulario';

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
  /**
   * La CLASE, y puede ser `null`.
   *
   * Antes esto era `tipoVoz: TipoVoz` y nunca era null porque `tipoDe` plegaba
   * con `?? 'valor'` lo que no reconocía. El null es el arreglo: una señal cuyo
   * tipo el canon no conoce se cuenta aparte y se pinta neutra, en vez de
   * sumarse a una clase que nadie declaró.
   */
  claseSenal: ClaseSenal | null;
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
    return base.map((s) => ({ ...s, claseSenal: claseDeCategoria(s.tipo) }));
  }, [senales, recuadro]);
}

/**
 * Cuántas de cada CLASE, para la barra apilada de composición.
 *
 * Las que el canon no reconoce **no entran en la barra**: una composición es
 * una afirmación sobre de qué habla el país, y meterlas adentro de cualquiera
 * de las cuatro la vuelve falsa en la misma medida en que haya basura.
 */
export function componerPorClase(senales: readonly SenalConTipo[]): { clase: ClaseSenal; n: number }[] {
  const cuenta = new Map<ClaseSenal, number>();
  for (const s of senales) {
    if (s.claseSenal === null) continue;
    cuenta.set(s.claseSenal, (cuenta.get(s.claseSenal) ?? 0) + 1);
  }
  return [...cuenta.entries()]
    .map(([clase, n]) => ({ clase, n }))
    .sort((a, b) => b.n - a.n);
}

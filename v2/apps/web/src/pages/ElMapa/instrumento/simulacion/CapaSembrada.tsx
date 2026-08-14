import { useCallback, useEffect, useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';

import { SelloDeVoces } from './DeclaracionDelSembrado';

import type { CeldaDeSenales, ProyectarAPixel } from '~/components/mapa/pintor-senales';

import { RADIO_DE_MARCA } from '~/components/mapa/pintor-senales';
import { PintorDeSenales } from '~/components/mapa/PintorDeSenales';

/**
 * § El país simulado, dibujado voz por voz — el pintor compartido enchufado a
 * maplibre.
 *
 * ## Qué hace este archivo, que es poco a propósito
 *
 * Tres cosas y ninguna más: le da al pintor la proyección del mapa, le avisa
 * cuándo el mapa se movió, y le pasa el sello de la página. Las reglas
 * visuales, el techo por celda, el reparto de los puntos y el texto que declara
 * qué es dato y qué es dibujo ya están escritos en
 * `components/mapa/pintor-senales.ts` y en `civic-core/simulacion/sembrado.ts`.
 * Acá no se reescribe ninguna: si algo del dibujo hay que cambiar, se cambia
 * allá y esto no se entera.
 *
 * **La proyección la da el mapa.** El pintor no sabe de grados, recibe una
 * función; arriba de maplibre esa función es `map.project`, que es la misma que
 * ubica cualquier capa del instrumento. Por eso el mismo calco sirve arriba de
 * este mapa y arriba de una hoja sin mapa, y por eso acá no hay ni una cuenta
 * de longitudes.
 *
 * ## Por qué reemplaza al lavado de provincia y no se le monta encima
 *
 * En el lado simulado la `CapaProvincias` pintaba la misma cifra que estos
 * puntos —cuántas voces tiene cada provincia—, con dos problemas: el lavado
 * afirma presencia pareja en todo el polígono, que es justo lo que el modelo no
 * sabe, y su rampa es violeta, o sea el color de la clase `deseo`. Un punto
 * violeta arriba de un lavado violeta pierde el contraste que el pintor
 * garantiza contra el fondo del tema. Así que del otro lado de la cortina el
 * lavado se apaga y quedan los bordes —incluido el grueso del territorio con
 * mandato, que sigue diciendo algo que los puntos no dicen— y las voces.
 *
 * El calco no recibe el puntero: es un dibujo, no un control. Va envuelto en su
 * propio `pointer-events-none` para que eso no dependa de quién lo monte.
 */

/**
 * La semilla de la corrida: fija.
 *
 * Con una semilla que cambiara al mover una perilla, cada palanca redibujaría
 * el país entero y sería imposible ver qué cambió. Fija, mover la
 * participación agrega o saca puntos sobre el mismo reparto — que es lo que se
 * quiere leer.
 */
const SEMILLA_DEL_SEMBRADO = 20260814;

export interface CapaSembradaProps {
  readonly celdas: readonly CeldaDeSenales[];
  /**
   * Cuántas celdas lleva cada provincia. El techo de puntos de `sembrado.ts`
   * está calibrado para una: con cuatro clases por territorio, la tinta se
   * cuadruplicaría sobre la misma superficie y una provincia grande sería un
   * disco opaco. El radio se divide por la raíz, así que el área pintada por
   * provincia queda donde el autor del pintor la dejó.
   */
  readonly clasesPorTerritorio: number;
}

export function CapaSembrada({ celdas, clasesPorTerritorio }: CapaSembradaProps) {
  const mapa = useMap().current;

  /**
   * El cuadro que tiene dibujado el calco. Se incrementa en CADA cuadro del
   * movimiento y no al terminar: el mapa de la derecha de la cortina sigue al
   * de abajo con `jumpTo` mientras se arrastra, y un calco que se acomodara
   * recién al soltar quedaría corrido de su propio mapa todo el arrastre.
   */
  const [epoca, setEpoca] = useState(0);

  useEffect(() => {
    if (mapa === undefined) return;
    const alMover = (): void => {
      setEpoca((previa) => previa + 1);
    };
    mapa.on('move', alMover);
    mapa.on('resize', alMover);
    return () => {
      mapa.off('move', alMover);
      mapa.off('resize', alMover);
    };
  }, [mapa]);

  const proyectar = useCallback<ProyectarAPixel>(
    (lng, lat) => {
      if (mapa === undefined) return null;
      const punto = mapa.project([lng, lat]);
      // Sin mapa listo no se inventa un píxel: la marca se cuenta como no
      // proyectada, que es lo que el contrato del pintor pide para este caso.
      if (!Number.isFinite(punto.x) || !Number.isFinite(punto.y)) return null;
      return { x: punto.x, y: punto.y };
    },
    [mapa],
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      <PintorDeSenales
        celdas={celdas}
        proyectar={proyectar}
        /* Ninguna clase fuera de foco: el mapa no tiene todavía un control que
           las filtre, y desteñir sin control sería decir que algo está apagado
           cuando nadie lo apagó. */
        foco={null}
        tema="nocturno"
        semilla={SEMILLA_DEL_SEMBRADO}
        epoca={epoca}
        radio={RADIO_DE_MARCA / Math.sqrt(Math.max(1, clasesPorTerritorio))}
        sello={<SelloDeVoces />}
      />
    </div>
  );
}

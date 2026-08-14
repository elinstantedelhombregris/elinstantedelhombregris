import { conSeparadorDeMiles, DECLARACION_DEL_SEMBRADO } from '@v2/civic-core';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  FONDO_DEL_TEMA,
  marcasDeCeldas,
  pintarSenales,
  RADIO_DE_MARCA,
  saturacionDeCeldas,
  TINTA_DEL_TEMA,
} from './pintor-senales';

import type {
  CeldaDeSenales,
  FocoDeClases,
  ProyectarAPixel,
  TemaDelMapa,
} from './pintor-senales';
import type { ReactNode } from 'react';

/**
 * § El pintor de señales — el calco que va arriba de cualquier mapa.
 *
 * Acá sólo vive la cáscara de React: el lienzo, el efecto que redibuja y el
 * texto que declara qué es dato y qué es dibujo. Todas las reglas visuales
 * están en `./pintor-senales.ts`, que es puro y se verifica con un contexto 2D
 * falso.
 *
 * **No sabe de proyecciones.** Recibe `proyectar`, y por eso el mismo
 * componente sirve arriba de maplibre —donde `proyectar` es `map.project`— y en
 * una vista sin mapa, donde es una equirectangular propia. Quien mueva el mapa
 * incrementa `epoca` y el calco se rehace.
 *
 * **El sello NO se reescribe.** La frase «Nadie dijo ninguna de estas cosas.»
 * ya existe en `pages/LaSimulacion/sections/SelloSintetico.tsx` y es la
 * afirmación más importante de esa pantalla; acá hay un hueco —`sello`— para
 * que la página la pase entera. Este componente declara otra cosa, que es la
 * suya: que el conteo por celda es el dato y la posición del punto es dibujo.
 *
 * El lienzo es `aria-hidden` y no recibe el puntero: es un calco. El camino
 * accesible al MISMO dato es la lista de conteos por provincia que se rinde
 * abajo, y no es una versión de consuelo — es el dato, que es justamente lo que
 * el dibujo no puede afirmar con precisión.
 */

export interface PintorDeSenalesProps {
  readonly celdas: readonly CeldaDeSenales[];
  readonly proyectar: ProyectarAPixel;
  /**
   * Qué clases están en foco. `null` es todas.
   *
   * No hay ninguna prop para sacar una clase del dibujo, y eso es a propósito:
   * lo que queda fuera de foco se destiñe a gris y sigue estando. Un país
   * filtrado que parece vacío es un país que miente.
   */
  readonly foco: FocoDeClases;
  readonly tema: TemaDelMapa;
  /** La semilla de la corrida. La misma corrida dibuja siempre lo mismo. */
  readonly semilla: number;
  /** Se incrementa cuando el mapa se mueve: es lo que dispara el redibujo. */
  readonly epoca?: number;
  readonly radio?: number;
  /** El sello de la página, tal cual. Este componente no lo escribe. */
  readonly sello?: ReactNode;
}

export function PintorDeSenales({
  celdas,
  proyectar,
  foco,
  tema,
  semilla,
  epoca = 0,
  radio = RADIO_DE_MARCA,
  sello,
}: PintorDeSenalesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // La saturación no depende de la proyección: no puede parpadear al arrastrar.
  const saturadas = useMemo(() => saturacionDeCeldas(celdas), [celdas]);
  const voces = useMemo(() => celdas.reduce((total, c) => total + Math.max(0, c.voces), 0), [
    celdas,
  ]);

  const redibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // En el entorno de test no hay contexto 2D. Todo lo demás tiene que montar
    // igual: el dato vive en la lista de abajo, no en el lienzo.
    if (!ctx) return;

    // Deja a la vista qué cuadro tiene dibujado el lienzo, y es lo que hace que
    // `epoca` sea una dependencia usada y no una excusa para redibujar.
    canvas.dataset.epoca = String(epoca);

    const dpr = window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
    const ancho = canvas.clientWidth;
    const alto = canvas.clientHeight;
    if (canvas.width !== Math.round(ancho * dpr) || canvas.height !== Math.round(alto * dpr)) {
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
    }

    const { marcas } = marcasDeCeldas(celdas, semilla, proyectar);
    pintarSenales(ctx, { ancho, alto, dpr }, { marcas, foco, tema, radio });
  }, [celdas, proyectar, foco, tema, semilla, epoca, radio]);

  useEffect(() => {
    redibujar();
  }, [redibujar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver !== 'function') return;
    const observador = new ResizeObserver(() => {
      redibujar();
    });
    observador.observe(canvas);
    return () => {
      observador.disconnect();
    };
  }, [redibujar]);

  const tinta = TINTA_DEL_TEMA[tema];
  const fondo = FONDO_DEL_TEMA[tema];

  return (
    <div className="absolute inset-0" data-testid="pintor-de-senales">
      <canvas
        ref={canvasRef}
        aria-hidden
        data-testid="lienzo-de-senales"
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 space-y-2 p-4"
        style={{ background: `linear-gradient(to top, ${fondo}, transparent)` }}
      >
        {sello}

        <p className="max-w-[62ch] text-[13px] leading-[1.5]" style={{ color: tinta }}>
          {DECLARACION_DEL_SEMBRADO}
        </p>

        <p className="max-w-[62ch] text-[13px] leading-[1.5]" style={{ color: tinta }}>
          Los filtros destiñen: lo que sacás de foco se dibuja en gris y sigue estando. Un país
          filtrado que parece vacío es un país que miente.
        </p>

        {saturadas.length > 0 && (
          <p
            className="font-space max-w-[62ch] text-[11px] uppercase tracking-[0.1em]"
            style={{ color: tinta }}
            data-testid="celdas-saturadas"
          >
            Donde no entra un punto por voz, se dice cuántas faltan:{' '}
            {saturadas.map((c) => `${c.nombre} ${c.leyenda}`).join(' · ')}
          </p>
        )}
      </div>

      <ul className="sr-only" data-testid="conteos-por-celda">
        <li>{`${conSeparadorDeMiles(voces)} voces en ${conSeparadorDeMiles(celdas.length)} celdas.`}</li>
        {celdas.map((celda) => (
          <li key={`${celda.id}|${celda.clase}`}>
            {`${celda.nombre}: ${conSeparadorDeMiles(celda.voces)} voces de clase ${celda.clase}.`}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useRef } from 'react';

import { golpear, pintar, type Escena, type OrigenDelCielo } from '../constelacion-pintor';
import { colorDeClase, radioDeNodo, type NucleoEnPantalla, type Tema } from '../radiografia-data';

import type { AristaDeConvergencia, MiembroDeNucleo } from '~/lib/queries/radiografia';

import { FONDO_DEL_TEMA } from '~/components/mapa/pintor-senales';

/**
 * § La constelación — niveles 0 y 1 (spec §5.1, §5.4).
 *
 * Acá sólo vive la cáscara de React: el lienzo, el bucle de cuadros y el
 * mouse. Toda la proyección y el trazo están en `../constelacion-pintor.ts`,
 * que es puro y se puede verificar con un contexto 2D falso.
 *
 * **Canvas-2D con proyección propia, no WebGL.** La ADR 0003 tiene `three` en
 * *Defer* y su gatillo para reabrirse pide que el dato **no pueda** servirse a
 * la fidelidad buscada en SVG o canvas-2D. Con el corpus de hoy no se cumple
 * ni de cerca: cien nodos con sus aristas giran a 60 fps sin una dependencia
 * nueva. La migración a WebGL es el día que ese gatillo se cumpla solo, y no
 * antes.
 *
 * El lienzo es `aria-hidden`: es opaco para un lector de pantalla y para el
 * teclado. El camino accesible al MISMO dato es la tabla de abajo (R11), que
 * no es una versión de consuelo.
 */

export interface ConstelacionProps {
  nucleos: readonly NucleoEnPantalla[];
  solas: readonly MiembroDeNucleo[];
  aristas: readonly AristaDeConvergencia[];
  tema: Tema;
  enfocado: string | null;
  onEnfocar: (nucleoId: string | null) => void;
  /**
   * De qué corpus es este cielo. **Obligatorio y sin valor por defecto.**
   *
   * Es lo que decide si el lienzo se sella por dentro con «Nadie dijo ninguna
   * de estas cosas · ejemplo» (`SELLO_DEL_LIENZO`). No hay una prop que apague
   * el sello ni una que cambie su texto: lo único que se declara acá es un
   * hecho —de dónde salieron estas voces— y el pintor decide solo. Un default
   * volvería el sello opcional por olvido, que es exactamente el riesgo que la
   * enmienda §4 existe para cubrir.
   */
  origen: OrigenDelCielo;
  /**
   * Con qué nombre se la busca en un test.
   *
   * El sitio monta **dos** cielos —el del corpus vivo en `/la-radiografia` y el
   * de los tres escenarios en `/la-radiografia/ejemplo`—, y aunque hoy viven en
   * dos rutas distintas, un test que pide «la constelación» tiene que poder
   * decir cuál.
   */
  testId?: string;
}

/** Radianes por cuadro de la rotación automática: una vuelta cada ~70 s. */
const GIRO = 0.0015;

export function Constelacion({
  nucleos,
  solas,
  aristas,
  tema,
  enfocado,
  onEnfocar,
  origen,
  testId = 'constelacion',
}: ConstelacionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const escenaRef = useRef<Escena>({
    nodos: [],
    aristas: [],
    tema,
    enfocado: null,
    onEnfocar,
    origen,
  });
  /**
   * Pintar un cuadro **ya**, sin esperar al `requestAnimationFrame`. Lo instala
   * el bucle de abajo y lo usa el efecto de la escena: el navegador no programa
   * cuadros en una pestaña que no se está mirando, así que sin esto un cambio
   * de tema o de umbral podía quedar dibujado con lo anterior hasta que alguien
   * volviera a mirar la pestaña. Verificado en el navegador con
   * `visibilityState: 'hidden'`: el fondo seguía en papel después de pasar a
   * nocturno.
   */
  const pintarYaRef = useRef<() => void>(() => undefined);

  // La escena se le pasa al bucle por una referencia y no por dependencias: el
  // `requestAnimationFrame` arranca una sola vez en el montaje y lee siempre
  // lo último. Sin esto, cada movimiento del deslizador reiniciaría el bucle y
  // la rotación pegaría un salto.
  useEffect(() => {
    escenaRef.current = {
      nodos: [
        ...nucleos.flatMap((nucleo) =>
          nucleo.miembros.map((m) => ({
            id: m.id,
            nucleoId: nucleo.id,
            x: m.x,
            y: m.y,
            z: m.z,
            color: colorDeClase(m.clase, tema),
            radio: radioDeNodo(nucleo.senales),
          })),
        ),
        ...solas.map((m) => ({
          id: m.id,
          nucleoId: null,
          x: m.x,
          y: m.y,
          z: m.z,
          color: colorDeClase(m.clase, tema),
          // Una voz sola no se dibuja más chica por estar sola: se dibuja sola.
          radio: radioDeNodo(1),
        })),
      ],
      aristas,
      tema,
      enfocado,
      onEnfocar,
      origen,
    };
    pintarYaRef.current();
  }, [nucleos, solas, aristas, tema, enfocado, onEnfocar, origen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // En el entorno de test no hay contexto 2D. La página tiene que montar
    // entera igual: el dato vive en la tabla, no acá.
    if (!ctx) return;

    const quieto =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let giroY = 0.6;
    let giroX = -0.25;
    let arrastrando = false;
    let recorrido = 0;
    let ultimo: { x: number; y: number } | null = null;
    let cuadro = 0;

    const alPresionar = (e: PointerEvent) => {
      arrastrando = true;
      recorrido = 0;
      ultimo = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };
    const alMover = (e: PointerEvent) => {
      if (!arrastrando || !ultimo) return;
      recorrido += Math.abs(e.clientX - ultimo.x) + Math.abs(e.clientY - ultimo.y);
      giroY += (e.clientX - ultimo.x) * 0.006;
      giroX = Math.max(-1.2, Math.min(1.2, giroX + (e.clientY - ultimo.y) * 0.006));
      ultimo = { x: e.clientX, y: e.clientY };
    };
    const alSoltar = (e: PointerEvent) => {
      arrastrando = false;
      ultimo = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    const alClickear = (e: MouseEvent) => {
      // Girar el cielo no es elegir nada: un arrastre termina en `click`, y sin
      // este freno soltar el mouse cerraba el núcleo que el lector tenía abierto.
      if (recorrido > 6) return;
      const caja = canvas.getBoundingClientRect();
      const escena = escenaRef.current;
      escena.onEnfocar(
        golpear(escena.nodos, giroY, giroX, caja, {
          x: e.clientX - caja.left,
          y: e.clientY - caja.top,
        }),
      );
    };

    canvas.addEventListener('pointerdown', alPresionar);
    canvas.addEventListener('pointermove', alMover);
    canvas.addEventListener('pointerup', alSoltar);
    canvas.addEventListener('pointercancel', alSoltar);
    canvas.addEventListener('click', alClickear);

    const unCuadro = () => {
      const dpr = window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
      const ancho = canvas.clientWidth;
      const alto = canvas.clientHeight;
      // El tamaño del buffer se sincroniza acá y no con un `ResizeObserver`:
      // el bucle ya corre en cada cuadro, y comparar dos enteros es más barato
      // que sostener un observador.
      if (canvas.width !== Math.round(ancho * dpr) || canvas.height !== Math.round(alto * dpr)) {
        canvas.width = Math.round(ancho * dpr);
        canvas.height = Math.round(alto * dpr);
      }
      pintar(ctx, { width: ancho, height: alto, dpr }, escenaRef.current, giroY, giroX);
    };

    pintarYaRef.current = unCuadro;
    // El primer cuadro, en el montaje y sin esperar a nadie: una pestaña de
    // fondo no recibe `requestAnimationFrame`, y sin esto el lienzo se quedaba
    // en su buffer de 300×150 sin una sola línea hasta que alguien la mirara.
    unCuadro();

    const dibujar = () => {
      cuadro = requestAnimationFrame(dibujar);
      if (!arrastrando && !quieto) giroY += GIRO;
      unCuadro();
    };
    cuadro = requestAnimationFrame(dibujar);

    return () => {
      cancelAnimationFrame(cuadro);
      pintarYaRef.current = () => undefined;
      canvas.removeEventListener('pointerdown', alPresionar);
      canvas.removeEventListener('pointermove', alMover);
      canvas.removeEventListener('pointerup', alSoltar);
      canvas.removeEventListener('pointercancel', alSoltar);
      canvas.removeEventListener('click', alClickear);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-testid={testId}
      // El origen queda escrito en el DOM para que una guarda pueda leerlo: el
      // sello del lienzo no se puede verificar desde afuera —no hay contexto 2D
      // en un test de componente— pero sí se puede verificar que la página del
      // ejemplo declara que su cielo es el del ejemplo.
      data-origen={origen}
      className="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
      style={{ background: FONDO_DEL_TEMA[tema] }}
    />
  );
}

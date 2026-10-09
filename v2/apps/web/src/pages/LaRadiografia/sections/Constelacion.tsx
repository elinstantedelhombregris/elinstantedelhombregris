import { useEffect, useRef } from 'react';

import { type Escena, type OrigenDelCielo } from '../constelacion-pintor';
import { colorDeClase, radioDeNodo, type NucleoEnPantalla, type Tema } from '../radiografia-data';
import { useCieloInteractivo, type AjustesDelCielo } from '../use-cielo-interactivo';

import type { LenteDelCielo } from '../lentes';
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
  lente?: LenteDelCielo;
  zoom?: number;
  girando?: boolean;
  centrar?: number;
  seleccionado?: string | null;
  onSeleccionar?: (id: string | null) => void;
  onSobrevolar?: (id: string | null) => void;
  onZoom?: (zoom: number) => void;
}

export function Constelacion({
  nucleos,
  solas,
  aristas,
  tema,
  enfocado,
  onEnfocar,
  origen,
  testId = 'constelacion',
  lente = 'vinculos',
  zoom = 1,
  girando = true,
  centrar = 0,
  seleccionado = null,
  onSeleccionar,
  onSobrevolar,
  onZoom,
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
            clase: m.clase,
            x: m.x,
            y: m.y,
            z: m.z,
            color: colorDeClase(m.clase, tema),
            radio: Math.max(2.2, radioDeNodo(nucleo.senales) * 1.15),
          })),
        ),
        ...solas.map((m) => ({
          id: m.id,
          nucleoId: null,
          clase: m.clase,
          x: m.x,
          y: m.y,
          z: m.z,
          color: colorDeClase(m.clase, tema),
          // Una voz sola no se dibuja más chica por estar sola: se dibuja sola.
          radio: 2.2,
        })),
      ],
      aristas,
      tema,
      enfocado,
      onEnfocar,
      origen,
      seleccionado,
    };
    pintarYaRef.current();
  }, [nucleos, solas, aristas, tema, enfocado, onEnfocar, origen, seleccionado]);

  const ajustesRef = useRef<AjustesDelCielo>({ lente, zoom, girando, centrar });
  useEffect(() => {
    ajustesRef.current = {
      lente,
      zoom,
      girando,
      centrar,
      ...(onSeleccionar ? { elegir: onSeleccionar } : {}),
      ...(onSobrevolar ? { sobrevolar: onSobrevolar } : {}),
      ...(onZoom ? { cambiarZoom: onZoom } : {}),
    };
    pintarYaRef.current();
  }, [lente, zoom, girando, centrar, onSeleccionar, onSobrevolar, onZoom]);
  useCieloInteractivo(canvasRef, escenaRef, ajustesRef, pintarYaRef);

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
      data-lente={lente}
      className="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
      style={{ background: FONDO_DEL_TEMA[tema] }}
    />
  );
}

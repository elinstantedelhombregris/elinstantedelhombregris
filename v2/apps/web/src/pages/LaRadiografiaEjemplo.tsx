import { useEffect, useLayoutEffect, useState } from 'react';
import { Link } from 'wouter';

import { LOS_TRES_ESCENARIOS } from './LaRadiografia/ejemplos';
import { guardarTema, leerTema, type Tema } from './LaRadiografia/radiografia-data';
import { InterruptorDeTema } from './LaRadiografia/sections/InterruptorDeTema';
import { LosTresEjemplos } from './LaRadiografia/sections/LosTresEjemplos';

import { Kicker, RitoTinta } from '~/components/papel/primitives';

/**
 * El ejemplo de La Radiografía — **su propia ruta, y no un pie de la página viva**.
 *
 * Enmienda: `docs/specs/2026-08-16-enmienda-v1-los-ejemplos.md` §3 y §4.4.
 *
 * Hasta el 16 de agosto de 2026 los tres escenarios se montaban debajo del
 * corpus vivo, en el mismo scroll de `/la-radiografia`. Eso rompía lo único que
 * la enmienda pidió a cambio de autorizar el ejemplo: **el modo es excluyente**
 * (E5). O mirás el ejemplo o mirás el país, nunca los dos en la misma pantalla,
 * porque una captura de un scroll con las dos cosas adentro es exactamente el
 * riesgo de §4 con la coartada puesta.
 *
 * Lo que esta ruta cambia, y por qué cada cosa:
 *
 *  1. **La URL lo dice** —`/la-radiografia/ejemplo`— y una URL viaja pegada a
 *     cualquier link que alguien mande.
 *  2. **El `<title>` lo dice, y lo dice primero.** `Ejemplo` es la primera
 *     palabra de la pestaña, no un sufijo que la pestaña recorta. Se escribe en
 *     un efecto de layout, que corre **antes** de que el lienzo pinte su primer
 *     cuadro: la constelación se dibuja en un efecto pasivo de `Constelacion`,
 *     y los pasivos van después de los de layout. O sea que no hay un instante
 *     en el que se vea la imagen bajo el título del sitio.
 *  3. **El encabezado lo dice** antes de que haya nada que capturar.
 *  4. Y el sello vive **adentro del lienzo** (`SELLO_DEL_LIENZO`), que es lo
 *     único de esta lista que sobrevive a un recorte.
 *
 * Lo que **no** cambia: la base sigue en cero. Este ejemplo no tiene una fila
 * en ninguna tabla, no entra en ningún conteo y no se exporta en el volcado —
 * E2 a E5 de la enmienda §3.1.
 *
 * **E1 se cumple a medias, y hay que decirlo con precisión.** Ninguna línea de
 * esta página ni de su corpus pide nada a la red: los vectores están
 * commiteados y todo el cálculo pasa en el navegador. Pero la ruta monta el
 * chrome papel, y `components/papel/PapelHeader.tsx` pide
 * `/api/analytics/voces-count` para su contador —lo hace en todas las páginas
 * del sitio, no acá—. O sea que la afirmación cierta es «el ejemplo no consulta
 * la API», no «esta ruta no toca `/api`». La diferencia importa porque E1
 * existe para garantizar que el ejemplo no pueda contaminarse con dato real, y
 * eso se sostiene: ese contador escribe en el header, jamás en el ejemplo.
 *
 * Y lo que la enmienda §4 deja escrito y esta página no puede arreglar: **esto
 * reduce el riesgo, no lo elimina.** Alguien decidido puede recortar el sello.
 * La respuesta a eso no es técnica.
 */

/**
 * El título de la pestaña. **«Ejemplo» va primero**, y ése es todo el diseño:
 * una pestaña angosta recorta el final, no el principio.
 */
const TITULO = 'Ejemplo — La Radiografía · ¡BASTA!';

/** Cuántas frases hay en total. Se cuenta, no se escribe: el corpus cambia. */
const FRASES = LOS_TRES_ESCENARIOS.reduce((total, e) => total + e.voces.length, 0);

/**
 * Escribe el título antes del primer cuadro y lo devuelve al salir.
 *
 * `useLayoutEffect` y no `useEffect` por lo que dice el bloque de arriba: el
 * lienzo pinta en un efecto pasivo, y React corre todos los de layout antes que
 * cualquier pasivo. Devolverlo en la limpieza evita que la pestaña se quede
 * diciendo «Ejemplo» después de navegar a otra parte del sitio.
 */
function useTituloDelEjemplo(): void {
  useLayoutEffect(() => {
    const anterior = document.title;
    document.title = TITULO;
    return () => {
      document.title = anterior;
    };
  }, []);
}

export function LaRadiografiaEjemplo() {
  const [tema, setTema] = useState<Tema>('papel');

  useTituloDelEjemplo();

  useEffect(() => {
    setTema(leerTema());
  }, []);

  const cambiarTema = (nuevo: Tema) => {
    setTema(nuevo);
    guardarTema(nuevo);
  };

  const nocturno = tema === 'nocturno';

  return (
    <main
      className={nocturno ? 'bg-oscuro-barra text-oscuro-texto' : ''}
      style={nocturno ? { minHeight: '100vh' } : undefined}
    >
      <div className="mx-auto max-w-[1180px] px-10 py-[72px] max-[560px]:px-5">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div>
            <Kicker className="anim-fadeup mb-4">Un ejemplo, no el país</Kicker>
            <h1
              aria-label="La Radiografía: un ejemplo."
              className="font-anton riso-hover mb-5 text-[clamp(40px,5.4vw,76px)] leading-[0.98]"
            >
              <RitoTinta lineas={['La Radiografía:', 'un ejemplo.']} />
            </h1>
            <p
              className={`anim-fadeup max-w-[640px] text-pretty text-[18px] leading-[1.6] ${
                nocturno ? 'text-oscuro-secundario' : 'text-tinta-75'
              }`}
              style={{ animationDelay: '0.9s' }}
            >
              <strong className="font-semibold">Nadie dijo ninguna de estas cosas.</strong> Las{' '}
              {FRASES.toLocaleString('es-AR')} frases de esta página las escribió una persona a mano
              para mostrar qué hace el instrumento —y, sobre todo, qué no hace—. No salieron de la
              base, no las dijo nadie y no las generó un modelo. El país de verdad se mira en{' '}
              <Link
                href="/la-radiografia"
                className="underline decoration-1 underline-offset-4 hover:opacity-70"
              >
                La Radiografía
              </Link>
              , que está en otra pantalla a propósito: o mirás el ejemplo o mirás el país, nunca los
              dos mezclados.
            </p>
          </div>

          <InterruptorDeTema tema={tema} onCambiar={cambiarTema} />
        </div>

        <LosTresEjemplos tema={tema} />

        <nav
          aria-label="Volver al corpus vivo"
          className={`mt-16 border-t-2 pt-8 ${nocturno ? 'border-oscuro-borde' : 'border-tinta'}`}
        >
          <Link
            href="/la-radiografia"
            className={`font-space text-[13px] font-bold uppercase tracking-[0.1em] underline decoration-1 underline-offset-4 hover:opacity-70 ${
              nocturno ? 'text-oscuro-texto' : 'text-tinta'
            }`}
          >
            ← Ir a La Radiografía, que lee el corpus vivo
          </Link>
          <p
            className={`mt-3 max-w-[70ch] text-[14px] leading-[1.55] ${nocturno ? 'text-oscuro-meta' : 'text-tinta-50'}`}
          >
            Allá el cielo puede estar vacío, y si lo está es una afirmación: todavía no habló nadie.
            Acá nunca está vacío, y eso es porque acá no habló nadie tampoco — sólo que las frases
            las escribimos nosotros.
          </p>
        </nav>
      </div>
    </main>
  );
}

export default LaRadiografiaEjemplo;

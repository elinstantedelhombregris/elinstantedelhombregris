import { useLayoutEffect } from 'react';
import { Link } from 'wouter';

import { LasActasDeEjemplo } from './ElMandatoVivo/sections/LasActasDeEjemplo';

import { Kicker, RitoTinta } from '~/components/papel/primitives';

/**
 * El ejemplo del mandato — **su propia ruta, y no un pie de la página viva**.
 *
 * Enmienda: `docs/specs/2026-08-20-enmienda-los-ejemplos-ii-las-actas.md`.
 * Es el segundo ejemplo autorizado en el cliente, con la enmienda propia que
 * la cláusula del 16/8 exigía. Copia la disciplina de
 * `LaRadiografiaEjemplo.tsx`, que es donde estas decisiones ya se pelearon:
 *
 *  1. **La URL lo dice** — `/mandato-vivo/ejemplo`.
 *  2. **El `<title>` lo dice, y lo dice primero**, en un efecto de layout.
 *  3. **El encabezado lo dice** antes de que haya nada que capturar.
 *  4. Y como acá no hay lienzo sino tarjetas recortables, **cada acta lleva
 *     su propio sello visible** — eso es lo que sobrevive a un recorte.
 *
 * E5 (el modo excluyente): esta página no muestra ni un dato del documento
 * real, y `/mandato-vivo` no muestra ni un acta inventada. E1: ninguna línea
 * de esta página ni de su contenido pide nada a la red — el chrome papel pide
 * su contador en todas las páginas del sitio, no acá; la afirmación cierta
 * sigue siendo «el ejemplo no consulta la API».
 *
 * La página del mandato es oscura de punta a punta, y su ejemplo también:
 * sin interruptor de tema — acá el tema no es una opción, es el registro.
 */

/** «Ejemplo» primero: una pestaña angosta recorta el final, no el principio. */
const TITULO = 'Ejemplo — El mandato · ¡BASTA!';

function useTituloDelEjemplo(): void {
  useLayoutEffect(() => {
    const anterior = document.title;
    document.title = TITULO;
    return () => {
      document.title = anterior;
    };
  }, []);
}

export function ElMandatoVivoEjemplo() {
  useTituloDelEjemplo();

  return (
    <main className="bg-tinta text-oscuro-texto min-h-screen">
      <div className="mx-auto max-w-[1100px] px-10 pb-4 pt-[72px] max-[560px]:px-5">
        <Kicker className="anim-fadeup mb-4">Un ejemplo, no el país</Kicker>
        <h1
          aria-label="El mandato: un ejemplo."
          className="font-anton riso-hover mb-5 text-[clamp(40px,5.4vw,76px)] leading-[0.98]"
        >
          <RitoTinta lineas={['El mandato:', 'un ejemplo.']} />
        </h1>
        <p
          className="anim-fadeup text-oscuro-secundario max-w-[640px] text-pretty text-[18px] leading-[1.6]"
          style={{ animationDelay: '0.9s' }}
        >
          <strong className="text-oscuro-texto font-semibold">
            Nadie dijo ninguna de estas cosas.
          </strong>{' '}
          Las cinco actas de esta página las escribió una persona a mano para mostrar en qué
          termina el circuito. No salieron de la base, no las votó nadie y no las generó un
          modelo. El mandato de verdad se mira en{' '}
          <Link
            href="/mandato-vivo"
            className="underline decoration-1 underline-offset-4 hover:opacity-70"
          >
            El mandato
          </Link>
          , que está en otra pantalla a propósito: o mirás el ejemplo o mirás el documento del
          país, nunca los dos mezclados.
        </p>
      </div>

      <div className="pt-8">
        <LasActasDeEjemplo />
      </div>

      <nav
        aria-label="Volver al documento vivo"
        className="border-oscuro-borde mx-auto max-w-[1100px] border-t-2 px-10 pb-24 pt-8 max-[560px]:px-5"
      >
        <Link
          href="/mandato-vivo"
          className="font-space text-oscuro-texto text-[13px] font-bold uppercase tracking-[0.1em] underline decoration-1 underline-offset-4 hover:opacity-70"
        >
          ← Ir a El mandato, que lee lo que la gente carga
        </Link>
        <p className="text-oscuro-meta mt-3 max-w-[70ch] text-[14px] leading-[1.55]">
          Allá el documento puede decir cero, y si lo dice es una afirmación: todavía no habló
          nadie. Acá las actas están llenas, y eso es porque acá no habló nadie tampoco — sólo
          que las escribimos nosotros.
        </p>
      </nav>
    </main>
  );
}

export default ElMandatoVivoEjemplo;

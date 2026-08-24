import { ACTAS_DE_EJEMPLO, ADVERTENCIA_DE_LAS_ACTAS } from '../actas-de-ejemplo';

import { colorDeClase } from '~/components/mapa/pintor-senales';
import { Sello } from '~/components/papel/primitives';
import { NADIE_LO_DIJO } from '~/pages/LaSimulacion/simulacion-lectura';

/**
 * § Las cinco actas — el cuerpo del ejemplo del mandato.
 *
 * Enmienda: `docs/specs/2026-08-20-enmienda-los-ejemplos-ii-las-actas.md`.
 *
 * Tres decisiones de forma, cada una con su razón:
 *
 *  1. **El sello de arriba abre la sección**, con la misma frase de siempre
 *     (`NADIE_LO_DIJO`, importada — no copiada — de la Simulación) y en el
 *     mismo registro: no es un aviso legal, es la afirmación más importante
 *     de la pantalla.
 *  2. **Cada tarjeta lleva su propio «ejemplo inventado», visible.** Las
 *     actas son HTML recortable tarjeta por tarjeta; el sello tiene que
 *     sobrevivir al recorte (enmienda §2), así que viaja adentro del área
 *     que se captura, no en el encabezado de la página.
 *  3. **El color del borde es la clase**, vía `colorDeClase(clase,
 *     'nocturno')` — la misma tabla del mapa y de La Radiografía, ni un
 *     hexadecimal propio. La página del mandato es oscura de punta a punta,
 *     así que el tema no es una opción acá: es `nocturno` siempre.
 *
 * Esto es texto que enseña, no un instrumento: sin palancas, sin contadores,
 * sin nada que aparente medir (enmienda §3). La versión interactiva vive en
 * `docs/demos/2026-08-20-la-simulacion-completa.html`, fuera de la app.
 */

export function LasActasDeEjemplo() {
  return (
    <section aria-labelledby="las-actas-titulo" className="mx-auto max-w-[1100px] px-10 pb-16 max-[560px]:px-5">
      <div className="border-sello mb-10 border-y-2 border-dashed py-6">
        <div className="flex flex-wrap items-start gap-6">
          <Sello color="rojo" rotate={-3}>
            Ejemplo inventado
          </Sello>
          <div className="min-w-[260px] flex-1">
            <p className="font-anton text-oscuro-texto text-[22px] leading-[1.15]">
              {NADIE_LO_DIJO}
            </p>
            <p className="text-oscuro-secundario mt-2 max-w-[68ch] text-[15px] leading-[1.55]">
              {ADVERTENCIA_DE_LAS_ACTAS}
            </p>
          </div>
        </div>
      </div>

      <h2
        id="las-actas-titulo"
        className="font-anton text-oscuro-texto mb-4 text-[clamp(30px,3.8vw,48px)] leading-[1.02]"
      >
        Cada clase de señal habilita un mandato distinto.
      </h2>
      <p className="text-oscuro-secundario mb-8 max-w-[76ch] text-pretty text-[17px] leading-[1.6]">
        Es la regla 11 hecha instrumento: lo que se corrobora <em>repara</em>, lo que falta{' '}
        <em>se provee</em>, lo que se delibera <em>marca agenda</em>, lo que se promete{' '}
        <em>se sigue</em>, y lo que se pregunta <em>se contesta</em>. Cinco actas inventadas, una
        por camino.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {ACTAS_DE_EJEMPLO.map((acta) => (
          <article
            key={acta.id}
            aria-label={`${acta.tipoDeMandato} — ejemplo inventado`}
            className="border-oscuro-borde bg-oscuro-barra relative border p-5"
            style={{ borderLeft: `5px solid ${colorDeClase(acta.clase, 'nocturno')}` }}
          >
            <span
              aria-hidden
              className="border-sello text-sello font-space absolute right-3 top-3 rotate-2 border px-1.5 py-px text-[9.5px] font-bold uppercase tracking-[0.08em]"
            >
              ejemplo inventado
            </span>
            <p className="font-space text-oscuro-meta pr-28 text-[10.5px] font-bold uppercase tracking-[0.1em]">
              {acta.tipoDeMandato} · {acta.nace}
            </p>
            <h3 className="font-anton text-oscuro-texto mb-0.5 mt-1.5 text-[24px] leading-[1.05]">
              {acta.titulo}
            </h3>
            <p className="font-space text-oscuro-meta mb-3 text-[11px] uppercase tracking-[0.06em]">
              {acta.lugar}
            </p>
            <p className="text-oscuro-secundario mb-2 text-[13.5px] leading-[1.55]">
              <strong className="text-oscuro-texto font-semibold">Respaldo:</strong>{' '}
              {acta.respaldo}
            </p>
            <p className="text-oscuro-secundario mb-2 text-[13.5px] leading-[1.55]">
              <strong className="text-oscuro-texto font-semibold">La exigencia:</strong>{' '}
              {acta.exigencia}
            </p>
            <p className="text-oscuro-secundario mb-3 text-[13.5px] leading-[1.55]">
              <strong className="text-oscuro-texto font-semibold">Cómo se comprueba:</strong>{' '}
              {acta.comprobacion}
            </p>
            <p className="font-space text-oscuro-meta text-[10.5px] uppercase tracking-[0.06em]">
              Desde el diseño idealizado: {acta.planes}
            </p>
          </article>
        ))}
      </div>

      <p className="text-oscuro-meta mt-6 max-w-[76ch] text-[13.5px] leading-[1.55]">
        <strong className="text-oscuro-secundario font-semibold">Qué NO es un mandato:</strong> no
        es una orden judicial ni una ley, y no tiene más fuerza que la que tiene ser verificable y
        público — una exigencia con datos citables detrás, que queda en el registro cumplida o
        incumplida. Los conteos son de personas distintas y nunca de filas; ningún acta produce un
        ranking de personas; y un territorio por debajo del piso de supresión no publica acta
        alguna — el instrumento protege antes de exigir.
      </p>
    </section>
  );
}

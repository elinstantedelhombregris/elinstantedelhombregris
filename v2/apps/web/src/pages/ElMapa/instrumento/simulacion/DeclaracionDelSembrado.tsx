import { DECLARACION_DEL_SEMBRADO } from '@v2/civic-core';

import { NADIE_LO_DIJO } from '../../../LaSimulacion/simulacion-lectura';

/**
 * § Lo que la pantalla tiene que decir cuando el lado derecho se llena de
 * puntos — y dicho donde no lo tapa nada.
 *
 * ## El sello no se reescribe
 *
 * «Nadie dijo ninguna de estas cosas.» es la frase de
 * `pages/LaSimulacion/sections/SelloSintetico.tsx` y entra **por import**, de
 * `simulacion-lectura.ts`, que es donde vive. No se copia a mano: una copia se
 * desincroniza el día que alguien afine la frase, y esta frase es la afirmación
 * más importante de las dos pantallas. El componente de allá no se reusa entero
 * porque está escrito sobre papel —`text-tinta`, `border-sello`, un `Sello`
 * rotado— y acá el fondo es el chrome oscuro del instrumento; lo que se
 * comparte es el texto, que es lo que no se puede divergir.
 *
 * ## Por qué está en el panel y no sólo sobre el mapa
 *
 * `PintorDeSenales` declara lo suyo abajo del lienzo, y lo hace bien. Pero
 * arriba del mapa de la Simulación ese bloque vive **adentro de la cortina**:
 * `Cortina.tsx` recorta el mapa de la derecha con `clip-path`, así que con la
 * manija al medio la declaración del pintor queda del lado invisible. Una
 * declaración que se puede arrastrar fuera de la pantalla no es una
 * declaración. El panel no se recorta nunca, y por eso la misma frase vive acá
 * — la del pintor queda como la leyenda del dibujo, no como la garantía.
 */

/** El sello, en una sola definición, para el panel y para el hueco del pintor. */
export function SelloDeVoces() {
  return <p className="font-anton text-papel text-[15px] leading-[1.15]">{NADIE_LO_DIJO}</p>;
}

export function DeclaracionDelSembrado({ sinDibujo }: { sinDibujo: readonly string[] }) {
  return (
    <section
      aria-label="Qué es dato y qué es dibujo en el país simulado"
      className="border-oscuro-borde border-y py-3"
    >
      <SelloDeVoces />

      <p className="text-oscuro-secundario mt-2 text-[13px] leading-[1.5]">
        {DECLARACION_DEL_SEMBRADO}
      </p>

      <p className="text-oscuro-secundario mt-2 text-[13px] leading-[1.5]">
        Cada punto de la derecha es una voz que el modelo cuenta, y su color es la clase que declara
        la mezcla —hoy pareja entre las cuatro—. Ninguna cayó en una calle: acá no hay direcciones,
        hay provincias. Dónde cae adentro de la provincia es dibujo; que caiga adentro de la
        provincia, no: el rectángulo que las reparte está contenido en la figura del territorio.
      </p>

      {sinDibujo.length > 0 ? (
        <p className="text-oscuro-tenue mt-2 text-[11px] leading-snug">
          El mapa no tiene dónde dibujar estos territorios sin salirse de su propia figura, así que
          se cuentan y no se dibujan: {sinDibujo.join(' · ')}.
        </p>
      ) : null}
    </section>
  );
}

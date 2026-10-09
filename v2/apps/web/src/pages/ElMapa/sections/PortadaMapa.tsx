import { Kicker } from '~/components/papel/primitives';

/**
 * § 1 — Portada, en corto.
 *
 * Antes abría con el rito de la tinta y la cifra de aportes a 88px, y el mapa
 * quedaba debajo del pliegue: se pedía hablar antes de mostrar para qué
 * (análisis del 8/9, objeción 4). Ahora es kicker + titular + una bajada, y el
 * instrumento entra en la primera pantalla. La cifra se fue con el rito: con
 * cero aportes era un «0» gigante (D-080), y el contador del instrumento ya
 * dice cuántos hay, con su alcance.
 *
 * El titular dice qué es la pantalla (revisión del 9/10: «El país, dicho por su
 * gente» no decía nada que se pudiera comprobar) y la bajada, qué es un punto.
 */
export function PortadaMapa() {
  return (
    <header className="mx-auto max-w-[1440px] px-5 pb-3 pt-6 min-[961px]:px-10">
      <Kicker className="mb-2">El mapa de los aportes</Kicker>
      <h1 className="font-anton text-[clamp(30px,4vw,52px)] leading-tight">
        Qué dice la gente, dónde y cuándo
      </h1>
      <p className="text-tinta-75 mt-2 max-w-[62ch] text-[16px] leading-relaxed">
        Cada punto es un aporte: un problema, un deseo, algo que ya funciona. Buscá tu zona o sumá
        el tuyo.
      </p>
    </header>
  );
}

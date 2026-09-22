import { Kicker } from '~/components/papel/primitives';

/**
 * § 1 — Portada, en corto.
 *
 * Antes abría con el rito de la tinta y la cifra de voces a 88px, y el mapa
 * quedaba debajo del pliegue: se pedía hablar antes de mostrar para qué
 * (análisis del 8/9, objeción 4). Ahora es kicker + titular y el instrumento
 * entra en la primera pantalla. La cifra se fue con el rito: con cero voces
 * era un «0» gigante (D-080), y el contador del instrumento ya dice cuántos
 * registros hay, con su alcance.
 */
export function PortadaMapa() {
  return (
    <header className="mx-auto max-w-[1440px] px-5 pb-3 pt-6 min-[961px]:px-10">
      <Kicker className="mb-2">El mapa de las voces</Kicker>
      <h1 className="font-anton text-[clamp(30px,4vw,52px)] leading-tight">El país, dicho por su gente.</h1>
    </header>
  );
}

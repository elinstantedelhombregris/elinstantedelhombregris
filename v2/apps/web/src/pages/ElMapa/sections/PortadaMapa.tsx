import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { useVocesCount } from '~/lib/queries/analytics';

/**
 * § 1 — Portada: rito de la tinta + la cifra viva (sin asterisco: dato real).
 * Mientras carga o si falla, el bloque de la cifra no se renderiza — nunca
 * un número de reserva (regla de datos reales de la spec).
 */
export function PortadaMapa() {
  const voces = useVocesCount();

  return (
    <section className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6 px-5 pb-10 pt-16 min-[961px]:px-10">
      <div>
        <Kicker className="anim-fadeup mb-4">El mapa de las voces</Kicker>
        <h1
          aria-label="El país, dicho por su gente."
          className="font-anton riso-hover text-[clamp(44px,6vw,88px)] leading-[0.98]"
        >
          <RitoTinta lineas={['El país, dicho', 'por su gente.']} />
        </h1>
      </div>
      {voces.data ? (
        <div className="anim-fadeup text-right" style={{ animationDelay: '0.3s' }}>
          <div className="font-anton text-violeta text-[52px] leading-none">
            {voces.data.total.toLocaleString('es-AR')}
          </div>
          <div className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]">
            {voces.data.total === 1 ? 'voz en el mapa' : 'voces en el mapa'}
          </div>
        </div>
      ) : null}
    </section>
  );
}

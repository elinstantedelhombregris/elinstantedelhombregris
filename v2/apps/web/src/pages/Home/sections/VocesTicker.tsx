import { DEMO_VOCES } from '../landing-data';

import { cn } from '~/lib/utils';


/**
 * Ticker de voces: marquee continuo con las voces del país.
 * La lista se duplica para que el loop de -50% sea perfecto; la segunda
 * copia queda oculta para lectores de pantalla.
 */
export function VocesTicker() {
  return (
    <section className="border-tinta bg-papel-crudo overflow-hidden border-y">
      <div className="anim-marquee flex w-max py-[13px]">
        {[0, 1].map((copia) => (
          <div key={copia} aria-hidden={copia === 1} className="flex">
            {DEMO_VOCES.map((voz, i) => (
              <span
                key={`${copia}-${i}`}
                className={cn(
                  'font-space whitespace-nowrap px-[34px] text-[13px]',
                  voz.tipo === 'basta' ? 'text-sello' : 'text-tinta-75',
                )}
              >
                «{voz.texto}» <span className="text-tinta-30">— {voz.lugar}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

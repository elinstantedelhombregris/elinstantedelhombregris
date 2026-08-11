import { Link } from 'wouter';

import { CIERRE, FIRMA } from '../quien-data';

import { BandaCta, BotonPapel, FotoPapel } from '~/components/papel/primitives';
import { despertar } from '~/lib/despertar';

/**
 * § 7 — Cierre. La página no termina en la persona: termina devolviendo al
 * método. La firma manuscrita es lo último que se ve, y es lo único de toda
 * la página que dice «esto lo firma alguien» sin decir «mandá vos».
 */
export function CierreFirma() {
  return (
    <BandaCta fondo="violeta">
      <h2 className="font-anton mx-auto mb-6 max-w-[820px] text-[clamp(34px,4.6vw,64px)] leading-[1.02]">
        {CIERRE.titulo.map((linea) => (
          <span key={linea} className="block">
            {linea}
          </span>
        ))}
      </h2>

      <p className="text-papel/85 mx-auto mb-9 max-w-[560px] text-pretty text-[17px] leading-relaxed">
        {CIERRE.cuerpo}
      </p>

      <BotonPapel asChild variant="violeta" surface="oscuro">
        <Link href="/sembrar" onClick={despertar}>
          {CIERRE.cta} →
        </Link>
      </BotonPapel>

      <div className="mx-auto mt-14 w-full max-w-[300px]">
        <FotoPapel src={FIRMA.src} archivo={FIRMA.archivo} alt={FIRMA.alt} proporcion="firma" />
      </div>
    </BandaCta>
  );
}

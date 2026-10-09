import { Link } from 'wouter';

import { BandaCta, BotonPapel } from '~/components/papel/primitives';
import { APORTAR_HREF } from '~/lib/participacion/aportar';

/**
 * El índice (spec 3.4) — cierre. Misma banda de conversión que el resto del
 * sitio papel: leer termina en decir la propia en el mapa.
 */
export function CierreBitacora() {
  return (
    <BandaCta fondo="tinta">
      <div className="flex flex-wrap items-center justify-between gap-6 text-left">
        <h2 className="font-anton text-[clamp(30px,4vw,52px)] leading-none">¿Y vos qué ves?</h2>
        <BotonPapel asChild variant="violeta" surface="oscuro">
          <Link href={APORTAR_HREF}>Imaginar mi Argentina →</Link>
        </BotonPapel>
      </div>
    </BandaCta>
  );
}

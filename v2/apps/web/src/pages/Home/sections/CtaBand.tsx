import { Link } from 'wouter';

import { BandaCta, BotonPapel, Kicker } from '~/components/papel/primitives';
import { despertar } from '~/lib/despertar';

export function CtaBand() {
  return (
    <BandaCta fondo="violeta">
      <Kicker color="papel" className="mb-6">Tu lugar en este diseño</Kicker>
      <h2 className="font-anton text-[clamp(40px,6.4vw,88px)] leading-[.98]">El futuro necesita<br />tu letra.</h2>
      <p className="mx-auto mb-7 mt-6 max-w-[480px] text-pretty text-[18px] leading-relaxed">Lo que vos imaginás todavía no está escrito. Empecemos por ahí.</p>
      <BotonPapel asChild variant="violeta" surface="oscuro" className="motion-reduce:transform-none">
        <Link href="/el-mapa?participar=imaginar#instrumento" onClick={despertar}>Escribir mi primera posibilidad</Link>
      </BotonPapel>
    </BandaCta>
  );
}

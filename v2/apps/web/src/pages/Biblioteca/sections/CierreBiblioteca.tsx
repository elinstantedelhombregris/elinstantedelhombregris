import { Link } from 'wouter';

import { BandaCta, BotonPapel } from '~/components/papel/primitives';

/**
 * § 6 de la spec — cierre. La biblioteca no compite con el mapa: termina en
 * él. Leer es la entrada; la conversión primaria del sitio sigue siendo la
 * voz (§8).
 */
export function CierreBiblioteca() {
  return (
    <BandaCta fondo="tinta">
      <div className="flex flex-wrap items-center justify-between gap-6 text-left">
        <h2 className="font-anton text-[clamp(30px,4vw,52px)] leading-none">Leíste. Ahora decí.</h2>
        <BotonPapel asChild variant="violeta" surface="oscuro">
          <Link href="/el-mapa">Soltar mi voz en el mapa →</Link>
        </BotonPapel>
      </div>
    </BandaCta>
  );
}

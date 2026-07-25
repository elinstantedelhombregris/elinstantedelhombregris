import { Link } from 'wouter';

import { BandaCta, BotonPapel } from '~/components/papel/primitives';

/**
 * § 3 de la spec — cierre. El catálogo no compite con el mapa: entrenar
 * termina en usar la voz que se entrenó (patrón exacto de `CierreBiblioteca`
 * / `CierreBitacora`).
 */
export function CierreEntrenamientos() {
  return (
    <BandaCta fondo="tinta">
      <div className="flex flex-wrap items-center justify-between gap-6 text-left">
        <h2 className="font-anton text-[clamp(30px,4vw,52px)] leading-none">
          Entrenaste. Ahora usalo.
        </h2>
        <BotonPapel asChild variant="violeta" surface="oscuro">
          <Link href="/el-mapa">Soltar mi voz en el mapa →</Link>
        </BotonPapel>
      </div>
    </BandaCta>
  );
}

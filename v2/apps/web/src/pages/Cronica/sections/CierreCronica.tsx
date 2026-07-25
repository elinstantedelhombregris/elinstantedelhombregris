import { Link } from 'wouter';

import { BotonPapel } from '~/components/papel/primitives';

/** Cierre (spec 3.6) — mismo molde que Ensayo/Manifiesto/Bitácora: no compite con el mapa, termina en él. */
export function CierreCronica() {
  return (
    <div className="bg-tinta text-papel mt-11 flex flex-wrap items-center justify-between gap-5 px-8 py-7 print:hidden">
      <span className="font-anton text-[22px] leading-tight">Esto es ficción. Lo que sigue, no.</span>
      <BotonPapel asChild variant="violeta" surface="oscuro">
        <Link href="/el-mapa">Soltar mi voz en el mapa →</Link>
      </BotonPapel>
    </div>
  );
}

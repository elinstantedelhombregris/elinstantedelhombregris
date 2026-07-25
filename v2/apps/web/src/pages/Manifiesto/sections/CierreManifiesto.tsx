import { Link } from 'wouter';

import { BotonPapel } from '~/components/papel/primitives';

/**
 * Cierre del manifiesto (spec 3.3) — card oscura dentro de la columna,
 * mismo patrón que el cierre del lector de ensayo (3.2): el manifiesto no
 * compite con el mapa, termina en él. `print:hidden`: la edición impresa es
 * el documento, no la invitación a seguir.
 */
export function CierreManifiesto() {
  return (
    <div className="bg-tinta text-papel mt-11 flex flex-wrap items-center justify-between gap-5 px-8 py-7 print:hidden">
      <span className="font-anton text-[22px] leading-tight">
        El manifiesto no te pide que lo firmes. Te pide que lo hagas.
      </span>
      <BotonPapel asChild variant="violeta" surface="oscuro">
        <Link href="/el-mapa">Soltar mi voz en el mapa →</Link>
      </BotonPapel>
    </div>
  );
}

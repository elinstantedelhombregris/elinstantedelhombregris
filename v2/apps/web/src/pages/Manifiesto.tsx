import { Link } from 'wouter';

import { CierreManifiesto } from './Manifiesto/sections/CierreManifiesto';
import { DocumentoManifiesto } from './Manifiesto/sections/DocumentoManifiesto';

/**
 * El manifiesto — página 3.3 «Papel y Tinta»
 * (docs/specs/2026-07-24-manifiesto-y-bitacora-papel-y-tinta.md). Lector
 * editorial de 800px: texto keystone VERBATIM, sumario de partes ancladas,
 * edición impresa y el sello LEÍDO ENTERO al llegar a la firma (§10.5 —
 * el único documento al que la ley se lo reserva). El chrome lo pone
 * RootLayout.
 */
export function Manifiesto() {
  return (
    <main className="mx-auto max-w-[800px] px-10 pb-20 pt-12 max-[560px]:px-5 print:p-0">
      <Link
        href="/biblioteca"
        className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em] print:hidden"
      >
        ← La biblioteca
      </Link>
      <DocumentoManifiesto />
      <CierreManifiesto />
    </main>
  );
}

export default Manifiesto;

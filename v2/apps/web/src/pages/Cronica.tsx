import { Link } from 'wouter';

import { CierreCronica } from './Cronica/sections/CierreCronica';
import { DocumentoCronica } from './Cronica/sections/DocumentoCronica';

/**
 * La crónica del país que viene — página 3.6 «Papel y Tinta»
 * (docs/specs/2026-07-25-la-cronica-papel-y-tinta.md). Lector editorial de
 * 800px: los 5 capítulos VERBATIM en una sola ruta, sumario que salta por
 * ancla nativa, edición impresa reusada de 3.3. Sin sello al terminar —
 * leer ficción no es un acto que la plataforma pueda o deba verificar
 * (spec, Decisión 2). El chrome lo pone RootLayout.
 */
export function Cronica() {
  return (
    <main className="mx-auto max-w-[800px] px-10 pb-20 pt-12 max-[560px]:px-5 print:p-0">
      <Link
        href="/biblioteca"
        className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em] print:hidden"
      >
        ← La biblioteca
      </Link>
      <DocumentoCronica />
      <CierreCronica />
    </main>
  );
}

export default Cronica;

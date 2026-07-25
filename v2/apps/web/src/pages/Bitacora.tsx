import { Link } from 'wouter';

import { CierreBitacora } from './Bitacora/sections/CierreBitacora';
import { IndiceCronicas } from './Bitacora/sections/IndiceCronicas';
import { PortadaBitacora } from './Bitacora/sections/PortadaBitacora';

/**
 * La bitácora — página 3.4 «Papel y Tinta»
 * (docs/specs/2026-07-24-manifiesto-y-bitacora-papel-y-tinta.md). Índice de
 * crónicas agrupadas por año real, con pliegue de apertura única (patrón
 * `IndiceEnsayos`, 3.1). Sin cifras de post: no hay filas en `blog_posts` y
 * la API direcciona por `id` numérico (spec, decisión 12). El índice no se
 * imprime — la edición impresa es de los lectores (§10.8). El chrome lo
 * pone RootLayout.
 */
export function Bitacora() {
  return (
    <main>
      <div className="mx-auto max-w-[1100px] px-10 pt-10 max-[560px]:px-5">
        <Link
          href="/biblioteca"
          className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em]"
        >
          ← La biblioteca
        </Link>
      </div>
      <PortadaBitacora />
      <IndiceCronicas />
      <CierreBitacora />
    </main>
  );
}

export default Bitacora;

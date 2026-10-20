import { EnlaceVer } from './piezas';

import { aportarHref } from '~/lib/participacion/aportar';

/**
 * El paso siguiente de un aporte que ya encontró acuerdo (spec §6, las capas): cómo está
 * hoy, quién puede y cómo lo hacemos. La ficha nace vinculada al aporte con «inspira».
 */
export function SeguiConstruyendo({ aporteId }: { aporteId: string }) {
  return (
    <details className="group">
      <summary className="font-space text-violeta focus-visible:outline-violeta flex min-h-11 cursor-pointer list-none items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="group-open:rotate-90 motion-safe:transition-transform">
          ›
        </span>
        Seguí construyendo
      </summary>
      <ul className="border-violeta ml-1 flex flex-col border-l-2 pl-4">
        <li>
          <EnlaceVer href={aportarHref({ modo: 'directo' })}>
            Contá cómo está hoy en tu lugar
          </EnlaceVer>
        </li>
        <li>
          <EnlaceVer href={`/fichas/nueva?${new URLSearchParams({ senal: aporteId }).toString()}`}>
            Armá una propuesta con otras personas
          </EnlaceVer>
        </li>
        <li>
          <EnlaceVer href="/capacidades">¿Quién ya lo hace?</EnlaceVer>
        </li>
      </ul>
    </details>
  );
}

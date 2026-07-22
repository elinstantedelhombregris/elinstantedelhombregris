import { Link } from 'wouter';

import type { ReactNode } from 'react';

import { BotonPapel, Kicker } from '~/components/papel/primitives';

export interface MarcoAnexoProps {
  children: ReactNode;
}

/**
 * Marco compartido de los anexos del mandato (spec 2.3, «Los anexos»):
 * `/mandato-vivo/pulso/:id` y `/mandato-vivo/propuesta/:id` no son páginas
 * con identidad propia — son fichas del mismo expediente. Misma página
 * oscura, mismo backlink, misma ficha papel-sobre-oscuro (receta §5)
 * angosta (~720px) para las tres: cargando, no encontrado y éxito.
 */
export function MarcoAnexo({ children }: MarcoAnexoProps) {
  return (
    <main className="bg-tinta text-oscuro-texto min-h-screen">
      <div className="mx-auto max-w-[1100px] px-10 pb-[72px] pt-16 max-[560px]:px-5">
        <Kicker className="text-violeta-claro mb-6">El mandato · anexo</Kicker>
        <Link
          href="/mandato-vivo"
          className="font-space text-oscuro-meta hover:text-violeta-claro mb-10 inline-flex min-h-11 items-center text-[12px] uppercase tracking-[0.12em] underline underline-offset-4"
        >
          ← Volver al mandato
        </Link>
        <div className="bg-papel text-tinta relative mx-auto max-w-[720px] p-[52px_56px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-[560px]:p-6">
          {children}
        </div>
      </div>
    </main>
  );
}

/** Estado cargando de un anexo (§10.9): mismo skeleton + microcopy que el resto del documento. */
export function CargandoFicha() {
  return (
    <div>
      <div className="anim-pulso-papel bg-papel-presionado h-[220px]" />
      <p className="font-space text-tinta-50 mt-4 text-[11px] uppercase tracking-[0.12em]">
        Cargando — menos que un trámite.
      </p>
    </div>
  );
}

export interface FichaExtraviadaProps {
  /** Título Anton propio de cada anexo: «Esa señal no está.» / «Esa propuesta no está.» */
  titulo: string;
}

/**
 * El 404 de un anexo — patrón expediente §5 con el copy propio de cada ficha:
 * kicker + título Anton + CTA. Sin sello: el catálogo §10.5 es cerrado
 * (RECIBIDA/PLANTADA/LEÍDO ENTERO/VISTO) y no se inventan sellos por decoración.
 */
export function FichaExtraviada({ titulo }: FichaExtraviadaProps) {
  return (
    <div>
      <Kicker color="tinta" className="mb-4">
        expediente extraviado
      </Kicker>
      <h1 className="font-anton text-[clamp(28px,4vw,40px)] leading-none">{titulo}</h1>
      <BotonPapel asChild variant="fantasma" className="mt-8 inline-flex">
        <Link href="/mandato-vivo">Volver al mandato →</Link>
      </BotonPapel>
    </div>
  );
}

export interface FichaRotaProps {
  onReintentar: () => void;
}

/**
 * Cualquier rotura que NO sea 404 (§10.9): la misma frase de honestidad del
 * documento (Task 4) + reintento real. Extraviado y roto son estados distintos
 * y el expediente no los mezcla.
 */
export function FichaRota({ onReintentar }: FichaRotaProps) {
  return (
    <div>
      <p className="font-archivo text-tinta-75 text-[15px] leading-relaxed">
        Esto se rompió. Lo decimos porque publicamos todo.
      </p>
      <BotonPapel variant="fantasma" className="mt-6" onClick={onReintentar}>
        Probar de nuevo ↺
      </BotonPapel>
    </div>
  );
}

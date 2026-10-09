import { Link } from 'wouter';

import { Kicker } from '~/components/papel/primitives';

export function HombreGrisBand() {
  return (
    <section className="bg-tinta text-oscuro-texto">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 min-[961px]:grid-cols-[1fr_1.2fr] min-[961px]:gap-20 min-[961px]:px-10 min-[961px]:py-20">
        <div>
          <Kicker className="text-violeta-claro mb-6">§ 02 — El origen</Kicker>
          <h2 className="font-anton text-[clamp(36px,4.3vw,60px)] leading-[1.05]">¿Quién es el<br />hombre gris?</h2>
          <p className="text-oscuro-secundario mt-5 max-w-[480px] text-pretty text-[17px] leading-relaxed">Es quien se anima a dejar de esperar y a crear con otros. Puede ser tu vecino, tu maestra o vos, un martes cualquiera.</p>
          <Link href="/el-instante-del-hombre-gris" className="font-space text-violeta-claro mt-4 inline-flex min-h-11 items-center text-xs underline underline-offset-4">Leer el origen →</Link>
        </div>
        <div className="border-oscuro-borde flex min-w-0 flex-col gap-6 border-t pt-8 min-[961px]:border-l min-[961px]:border-t-0 min-[961px]:pl-12 min-[961px]:pt-0">
          <p aria-hidden className="font-anton text-[clamp(68px,10.5vw,150px)] leading-[.92]">Sos<br /><span className="text-violeta-claro">vos.</span></p>
          <p className="text-oscuro-secundario max-w-[420px] text-pretty text-[17px] leading-relaxed">La experiencia de una vida abre una pregunta. La escucha de otras vidas nos enseña a diseñarla mejor.</p>
        </div>
      </div>
    </section>
  );
}

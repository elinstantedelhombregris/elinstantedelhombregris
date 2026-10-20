import { diasHasta, fraseDeFecha, numero } from './formato';

import type { VisionCampana } from '@v2/shared';

import { Kicker } from '~/components/papel/primitives';

/** «Mi Argentina ideal · edición 1 · faltan 132 días», el título y las tres cifras. En cero, dice cero. */
export function Cabecera({
  campana,
  cifras,
  ahora,
}: Pick<VisionCampana, 'campana' | 'cifras'> & { ahora: number }) {
  const fecha = fraseDeFecha(diasHasta(campana.recibeHasta, ahora));
  return (
    <header className="flex flex-col gap-4">
      <Kicker color="tinta" className="font-bold tabular-nums">
        {[campana.titulo, `edición ${numero(campana.edicion)}`, fecha].filter(Boolean).join(' · ')}
      </Kicker>
      <h1 className="font-anton text-[clamp(34px,9vw,52px)] font-normal leading-[1.02] [text-wrap:balance]">
        La Argentina que estamos imaginando
      </h1>
      <dl className="border-t-tinta border-b-papel-borde grid grid-cols-3 border-b border-t-2">
        <Cifra valor={numero(cifras.personas)} rotulo="personas" />
        <Cifra valor={numero(cifras.opiniones)} rotulo="opiniones" />
        <Cifra valor={numero(cifras.provincias)} extra=" de 24" rotulo="provincias" />
      </dl>
    </header>
  );
}

function Cifra({ valor, extra, rotulo }: { valor: string; extra?: string; rotulo: string }) {
  return (
    <div className="flex flex-col-reverse py-3 pr-2">
      <dt className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.12em]">
        {rotulo}
      </dt>
      <dd className="font-anton text-[32px] tabular-nums leading-none">
        {valor}
        {extra ? <span className="text-[18px]">{extra}</span> : null}
      </dd>
    </div>
  );
}

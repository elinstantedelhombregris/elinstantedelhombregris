import { Link } from 'wouter';

import { BandaCta, BotonPapel, Kicker } from '~/components/papel/primitives';

export function CtaBand() {
  return (
    <BandaCta fondo="violeta">
      <Kicker color="papel" className="mb-[18px] tracking-[0.2em] opacity-75">
        La ciudadanía diseña el país que quiere vivir
      </Kicker>
      <h2 className="font-anton mb-8 text-[clamp(44px,6vw,88px)] leading-[0.98]">
        Una vida imaginada
        <br />
        puede abrir un país.
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        <BotonPapel asChild variant="violeta" surface="oscuro" className="px-[30px] duration-150">
          <Link href="/el-mapa">Ir al mapa</Link>
        </BotonPapel>
        <BotonPapel asChild variant="fantasma" surface="oscuro" className="px-[30px]">
          <Link href="/imaginar">Imaginar mi Argentina</Link>
        </BotonPapel>
      </div>
    </BandaCta>
  );
}

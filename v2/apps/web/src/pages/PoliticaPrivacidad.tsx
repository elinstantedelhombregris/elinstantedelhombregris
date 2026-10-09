import privacidadRaw from '../../../../content/legal/privacidad.mdx?raw';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { Kicker } from '~/components/papel/primitives';

export function PoliticaPrivacidad() {
  return (
    <main className="mx-auto w-full max-w-[860px] px-5 py-14 min-[961px]:px-10">
      <header className="mb-10">
        <Kicker>Legal</Kicker>
        <h1 className="font-anton text-tinta mt-4 text-[clamp(38px,6vw,64px)] leading-[1.05]">
          Política de Privacidad
        </h1>
      </header>
      <article>
        <MdxPapel raw={privacidadRaw} />
      </article>
    </main>
  );
}

export default PoliticaPrivacidad;

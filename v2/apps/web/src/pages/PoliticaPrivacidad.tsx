import privacidadRaw from '../../../../content/legal/privacidad.mdx?raw';

import { MdxContent } from '~/components/MdxContent';

export function PoliticaPrivacidad() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-20">
      <header className="mb-10">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Legal</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          Política de Privacidad
        </h1>
      </header>
      <article>
        <MdxContent raw={privacidadRaw} />
      </article>
    </main>
  );
}

export default PoliticaPrivacidad;

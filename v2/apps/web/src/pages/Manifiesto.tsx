// MDX content imported as raw text via Vite's `?raw` suffix. Bundled
// at build time so the page ships with its content already in JS.
import manifiestoRaw from '../../../../content/manifiesto/manifiesto.mdx?raw';

import { MdxContent } from '~/components/MdxContent';

export function Manifiesto() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <MdxContent raw={manifiestoRaw} />
    </main>
  );
}

export default Manifiesto;

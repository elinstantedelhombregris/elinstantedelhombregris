import { CapituloHombreGris } from './LaIdea/sections/CapituloHombreGris';
import { PortadaIdea } from './LaIdea/sections/PortadaIdea';

/**
 * La idea — página 2.1 «Papel y Tinta»
 * (docs/specs/2026-07-22-la-idea-papel-y-tinta.md). Fusiona las v1
 * /la-vision y /el-instante-del-hombre-gris en un recorrido de tres
 * capítulos. El chrome papel (header/footer/grano/velo) lo pone RootLayout.
 */
export function LaIdea() {
  return (
    <main>
      <PortadaIdea />
      <CapituloHombreGris />
    </main>
  );
}

export default LaIdea;

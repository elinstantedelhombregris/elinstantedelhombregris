import { CtaBand } from './Home/sections/CtaBand';
import { EntradaIdeal } from './Home/sections/EntradaIdeal';
import { HeroBasta } from './Home/sections/HeroBasta';
import { HombreGrisBand } from './Home/sections/HombreGrisBand';
import { PlanesTeaser } from './Home/sections/PlanesTeaser';
import { VocesTicker } from './Home/sections/VocesTicker';

/**
 * Landing «Papel y Tinta» — port del diseño BASTA v2
 * (docs/specs/2026-07-21-landing-papel-y-tinta.md). El chrome papel
 * (header/footer/grano/velo) lo pone RootLayout.
 */
export function Home() {
  return (
    <main>
      <HeroBasta />
      <VocesTicker />
      <EntradaIdeal />
      <HombreGrisBand />
      <PlanesTeaser />
      <CtaBand />
    </main>
  );
}

export default Home;

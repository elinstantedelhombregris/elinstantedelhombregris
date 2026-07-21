import { CifrasStrip } from './Home/sections/CifrasStrip';
import { CtaBand } from './Home/sections/CtaBand';
import { HeroBasta } from './Home/sections/HeroBasta';
import { HombreGrisBand } from './Home/sections/HombreGrisBand';
import { IdeaEnTresLineas } from './Home/sections/IdeaEnTresLineas';
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
      <IdeaEnTresLineas />
      <HombreGrisBand />
      <CifrasStrip />
      <PlanesTeaser />
      <CtaBand />
    </main>
  );
}

export default Home;

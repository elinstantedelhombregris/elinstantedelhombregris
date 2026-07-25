import { useLocation } from 'wouter';

import { esRutaPapel } from './papel-routes';

import type { ReactNode } from 'react';

import { Footer } from '~/components/Footer';
import { Header } from '~/components/Header';
import { DespertarVeil } from '~/components/papel/DespertarVeil';
import { PapelFooter } from '~/components/papel/PapelFooter';
import { PapelHeader } from '~/components/papel/PapelHeader';
import { PaperGrain } from '~/components/papel/PaperGrain';
import { useIrAlPrincipio } from '~/lib/ir-al-principio';

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Layout por defecto de toda página pública. Las rutas papel reciben el
 * chrome nuevo (grano + velo del despertar + header/footer papel); el
 * resto conserva el chrome v1 hasta que le toque el rediseño.
 *
 * Acá vive el scroll de toda navegación (`useIrAlPrincipio`): es el único
 * componente que envuelve a las dos superficies, papel y v1.
 */
export function RootLayout({ children }: RootLayoutProps) {
  const [location] = useLocation();
  useIrAlPrincipio();

  if (esRutaPapel(location)) {
    return (
      <div className="papel-root bg-papel font-archivo text-tinta flex min-h-screen flex-col antialiased">
        <PaperGrain />
        <DespertarVeil />
        <PapelHeader />
        <div className="flex-1">{children}</div>
        <PapelFooter />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

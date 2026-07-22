import { useLocation } from 'wouter';

import type { ReactNode } from 'react';

import { Footer } from '~/components/Footer';
import { Header } from '~/components/Header';
import { DespertarVeil } from '~/components/papel/DespertarVeil';
import { PapelFooter } from '~/components/papel/PapelFooter';
import { PapelHeader } from '~/components/papel/PapelHeader';
import { PaperGrain } from '~/components/papel/PaperGrain';


/**
 * Rutas ya migradas al sistema «Papel y Tinta». A medida que se rediseña
 * cada página se agrega acá; cuando estén todas, el chrome viejo se borra.
 */
const PAPEL_ROUTES = new Set(['/', '/la-idea', '/el-mapa']);

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Layout por defecto de toda página pública. Las rutas papel reciben el
 * chrome nuevo (grano + velo del despertar + header/footer papel); el
 * resto conserva el chrome v1 hasta que le toque el rediseño.
 */
export function RootLayout({ children }: RootLayoutProps) {
  const [location] = useLocation();

  if (PAPEL_ROUTES.has(location)) {
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

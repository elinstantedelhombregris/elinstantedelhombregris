import { useLocation } from 'wouter';

import { esRutaPapel } from './papel-routes';

import type { ReactNode } from 'react';

import { Footer } from '~/components/Footer';
import { Header } from '~/components/Header';
import { DespertarVeil } from '~/components/papel/DespertarVeil';
import { PapelFooter } from '~/components/papel/PapelFooter';
import { PapelHeader } from '~/components/papel/PapelHeader';
import { PaperGrain } from '~/components/papel/PaperGrain';
import { ID_DEL_CONTENIDO, SaltarAlContenido } from '~/components/papel/SaltarAlContenido';
import { useIrAlPrincipio } from '~/lib/ir-al-principio';
import { useRitoUnaVezPorSesion } from '~/lib/rito';

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Layout por defecto de toda página pública. Las rutas papel reciben el
 * chrome nuevo (grano + velo del despertar + header/footer papel); el
 * resto conserva el chrome v1 hasta que le toque el rediseño.
 *
 * Acá vive el enlace «Saltar al contenido» (primer elemento enfocable en las dos
 * superficies) y el contenedor `#contenido` al que salta. Las páginas traen su
 * propio `<main>`, así que el contenedor es un `div` y no un segundo landmark.
 *
 * Acá vive el scroll de toda navegación (`useIrAlPrincipio`): es el único
 * componente que envuelve a las dos superficies, papel y v1. Y acá se decide
 * si el rito de la tinta corre o no (`useRitoUnaVezPorSesion`): una vez por
 * pestaña, después la página llega leída.
 */
export function RootLayout({ children }: RootLayoutProps) {
  const [location] = useLocation();
  useIrAlPrincipio();
  useRitoUnaVezPorSesion();

  if (esRutaPapel(location)) {
    return (
      <div className="papel-root bg-papel font-archivo text-tinta flex min-h-screen flex-col antialiased">
        <SaltarAlContenido />
        <PaperGrain />
        {['/la-idea', '/cronica'].includes(location) ? <DespertarVeil /> : null}
        <PapelHeader />
        <div id={ID_DEL_CONTENIDO} tabIndex={-1} className="flex-1 scroll-mt-16 focus:outline-none">
          {children}
        </div>
        <PapelFooter />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SaltarAlContenido />
      <Header />
      <div id={ID_DEL_CONTENIDO} tabIndex={-1} className="flex-1 scroll-mt-16 focus:outline-none">
        {children}
      </div>
      <Footer />
    </div>
  );
}

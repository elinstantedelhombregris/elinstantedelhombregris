import type { ReactNode } from 'react';

import { Footer } from '~/components/Footer';
import { Header } from '~/components/Header';

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Default layout for every public page. Sticky header on top, footer
 * below the page outlet. The page itself owns its own padding and
 * background variations.
 */
export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

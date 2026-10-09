import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

import { cn } from '~/lib/utils';

/** La única miga de las fichas: un enlace, no dos. */
export function VolverALasFichas({ className }: { className?: string }) {
  return (
    <Link
      href="/fichas"
      className={cn(
        'text-tinta-75 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Todas las fichas
    </Link>
  );
}

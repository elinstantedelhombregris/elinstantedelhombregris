import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

export function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="font-serif text-3xl font-semibold">No encontramos esa página.</h1>
      <p className="text-muted-foreground">Puede que se haya mudado o que nunca existió.</p>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </main>
  );
}

export default NotFound;

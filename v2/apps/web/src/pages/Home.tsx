import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

export function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container relative mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">v2 · bootstrap</p>
        <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-7xl">
          <span className="gradient-text">El Instante</span>
          <br />
          <span className="gradient-text">del Hombre Gris</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
          Plataforma de gobernanza popular argentina. <span className="font-semibold text-foreground">¡BASTA!</span> —
          los ciudadanos diseñan, el Estado administra, la política ejecuta.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/manifiesto">Leer el manifiesto</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/registrarse">Crear cuenta</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

export default Home;

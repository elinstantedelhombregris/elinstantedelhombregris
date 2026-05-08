import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

export function Compromiso() {
  return (
    <section className="rounded-3xl border border-iris-violet/30 bg-iris-violet/5 p-10 text-center md:p-16">
      <h2 className="font-serif text-3xl font-semibold md:text-4xl">¿Y vos?</h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/90 md:text-lg">
        El movimiento ¡BASTA! nace cuando miles deciden, en silencio, no delegar su dignidad. No tendrás
        aplausos fáciles. Tendrás el privilegio de ver cómo tu entorno se ordena porque alguien se animó a
        sostener estándares más altos.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/registrarse">Empezar ahora</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/manifiesto">Leer el manifiesto</Link>
        </Button>
      </div>
    </section>
  );
}

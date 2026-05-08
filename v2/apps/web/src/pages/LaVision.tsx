import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

export function LaVision() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-20">
      <header className="mb-16 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">La visión</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Una Argentina diseñada,</span><br />
          <span className="gradient-text">no improvisada.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Imaginamos el país como si lo empezáramos hoy: sin las cadenas del pasado, sin la cultura del atajo,
          sin la espera de un salvador. <span className="font-semibold text-foreground">¡BASTA!</span> es esa
          imaginación volviéndose plano.
        </p>
      </header>

      <section className="space-y-12">
        <article className="glass rounded-2xl p-8 md:p-12">
          <h2 className="font-serif text-2xl font-semibold">Diseño idealizado, no parche</h2>
          <p className="mt-4 leading-relaxed text-foreground/85">
            Russell Ackoff lo dijo: cuando un sistema falla, no se arregla pieza por pieza. Se diseña de nuevo
            como si empezara hoy. Eso hacemos. No prometemos resolver lo viejo; prometemos un nuevo proceso
            tan bien diseñado que volver atrás resulte impráctico.
          </p>
        </article>

        <article className="glass rounded-2xl p-8 md:p-12">
          <h2 className="font-serif text-2xl font-semibold">Ciudadanos diseñan, Estado administra, política ejecuta</h2>
          <p className="mt-4 leading-relaxed text-foreground/85">
            La división del trabajo democrática es así: las personas viven, sienten, intuyen, diseñan. El
            Estado mide, registra, protege, garantiza la continuidad. La política — los representantes —
            ejecuta lo que el diseño popular pidió. No al revés.
          </p>
        </article>

        <article className="glass rounded-2xl p-8 md:p-12">
          <h2 className="font-serif text-2xl font-semibold">22 PLANs como arquitectura</h2>
          <p className="mt-4 leading-relaxed text-foreground/85">
            Cada PLAN es un sistema diseñado: educación, salud, soberanía monetaria, justicia, energía,
            cuidado del territorio. No promesas: planos. Y un plan adicional —{' '}
            <span className="font-mono text-iris-violet">PLANRUTA</span> — que enseña cómo arrancar la
            ejecución, cómo activar la red, cómo sostener el cambio en crisis.
          </p>
        </article>

        <article className="glass rounded-2xl p-8 md:p-12">
          <h2 className="font-serif text-2xl font-semibold">Indicadores nuevos: dignidad, confianza, belleza funcional</h2>
          <p className="mt-4 leading-relaxed text-foreground/85">
            El PBI no mide el cansancio. Las encuestas no miden la pertenencia. Necesitamos otros tableros:
            cuánta dignidad sostiene una persona, cuánta confianza circula entre vecinos, cuánta belleza
            funcional sale a la calle todos los días. Eso es lo que se diseña. Eso es lo que se mide.
          </p>
        </article>
      </section>

      <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/manifiesto">Leer el manifiesto</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/una-ruta-para-argentina">Conocer la ruta</Link>
        </Button>
      </div>
    </main>
  );
}

export default LaVision;

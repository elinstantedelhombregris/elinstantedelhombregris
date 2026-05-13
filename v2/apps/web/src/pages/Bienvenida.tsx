import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

export function Bienvenida() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Bienvenida</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          Bienvenido a <span className="gradient-text">¡BASTA!</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Acá empieza. Tres pasos para entender de qué se trata y qué podés hacer hoy.
        </p>
      </header>

      <ol className="space-y-8">
        <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-iris-violet">Paso 1</p>
          <h2 className="font-serif text-2xl">¿Qué es ¡BASTA!?</h2>
          <p className="mt-3 text-muted-foreground">
            Un marco de gobernanza popular: 22 PLANes que diseña la gente, ejecuta el Estado, y nadie
            administra como dueño. Leé el{' '}
            <Link href="/manifiesto" className="text-iris-violet underline">
              manifiesto
            </Link>{' '}
            para arrancar.
          </p>
        </li>
        <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-iris-violet">Paso 2</p>
          <h2 className="font-serif text-2xl">Auto-evaluá tu posición cívica</h2>
          <p className="mt-3 text-muted-foreground">
            Un cuestionario de ocho minutos te ubica entre observador, participante, organizador y
            arquitecto. Después podés volver a mirar cómo evolucionás.
          </p>
          <Link href="/auto-evaluacion-civica">
            <Button className="mt-4">Empezar la auto-evaluación</Button>
          </Link>
        </li>
        <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-iris-violet">Paso 3</p>
          <h2 className="font-serif text-2xl">Empezá por una área de tu vida</h2>
          <p className="mt-3 text-muted-foreground">
            Trabajar en uno mismo es trabajar en la república. Las doce áreas te muestran dónde estás y
            qué podés mover.
          </p>
          <Link href="/areas">
            <Button variant="secondary" className="mt-4">
              Ver áreas de vida
            </Button>
          </Link>
        </li>
      </ol>
    </main>
  );
}

export default Bienvenida;

import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

const CHANNELS: { title: string; body: string; cta: string; href: string }[] = [
  {
    title: 'Compartí',
    body:
      'Hacé llegar el manifiesto y los ensayos a tres personas que te importan. La distribución no es accesoria — es el trabajo.',
    cta: 'Ir al manifiesto',
    href: '/manifiesto',
  },
  {
    title: 'Sumá tu pulso',
    body:
      'Cada señal que registrás alimenta el mapa del Mandato Vivo. Lo que tu calle, tu escuela y tu hospital necesitan no aparece si no lo nombrás.',
    cta: 'Registrar un pulso',
    href: '/mandato-vivo',
  },
  {
    title: 'Aportá contenido',
    body:
      'Si escribís, dibujás, programás o filmás: hay lugar. Mandanos un ensayo, una idea o un PR a la plataforma.',
    cta: 'Ver ensayos',
    href: '/ensayos',
  },
];

export function ApoyaAlMovimiento() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Apoyá al movimiento
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          Tres formas concretas de <span className="gradient-text">empujar</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Sin plata, sin permiso, sin esperar a que alguien autorice. Lo que hagas hoy mueve el dial.
        </p>
      </header>

      <div className="space-y-6">
        {CHANNELS.map((c) => (
          <article key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-serif text-2xl">{c.title}</h2>
            <p className="mt-3 text-muted-foreground">{c.body}</p>
            <Link href={c.href}>
              <Button variant="secondary" className="mt-4">
                {c.cta}
              </Button>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export default ApoyaAlMovimiento;

import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

export function ElMapa() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">El mapa</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Quiénes son los grises,</span><br />
          <span className="gradient-text">dónde están construyendo.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          El mapa muestra los nodos despiertos del país. Cada punto es una persona, una iniciativa, un barrio
          que decidió no esperar a que llegue alguien a arreglar lo que les toca.
        </p>
      </header>

      <section className="glass mb-10 rounded-2xl p-12 text-center">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-iris-violet">Mapa interactivo — en construcción</p>
        <p className="mx-auto max-w-2xl text-foreground/85">
          La radiografía interactiva del movimiento se construye en la próxima fase. Mientras tanto, podés
          contribuir tu primer punto: registrarte, declarar tu provincia, y empezar a aparecer en el mapa
          cuando se prenda.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="sm">
            <Link href="/registrarse">Ser un punto del mapa</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {['Diseñadores', 'Ejecutores', 'Conectores'].map((rol) => (
          <article key={rol} className="glass rounded-xl p-6">
            <p className="font-serif text-xl font-semibold">{rol}</p>
            <p className="mt-3 text-sm text-foreground/80">
              {rol === 'Diseñadores' && 'Diseñan PLANs, escriben principios, modelan procesos.'}
              {rol === 'Ejecutores' && 'Llevan el diseño al barrio, al aula, al consultorio, a la oficina.'}
              {rol === 'Conectores' && 'Hacen que las redes se encuentren. Donde no había puente, lo construyen.'}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default ElMapa;

import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

const PRINCIPIOS = [
  {
    titulo: 'Verdad y palabra cumplida',
    cuerpo:
      'Una herida limpia es preferible a una mentira que supura. La palabra empeñada es el contrato más antiguo del país. Lo recuperamos.',
  },
  {
    titulo: 'Amabilidad radical',
    cuerpo:
      'Tratar bien no por debilidad: por fuerza. La cortesía es ingeniería social: reduce fricción, repara vínculos, multiplica confianza.',
  },
  {
    titulo: 'Diseño ultrathink',
    cuerpo:
      'No nos conformamos con lo primero que funciona. Pensamos hasta encontrar la solución elegante, justa y humana. Iteramos sobre el plano, no sobre las personas.',
  },
  {
    titulo: 'Liderazgo distribuido',
    cuerpo:
      'Sin altares, sin caudillos. Formamos personas capaces de liderar sin pedirnos permiso. La red gana cuando cada nodo es autónomo.',
  },
  {
    titulo: 'Medir lo que importa',
    cuerpo:
      'Dignidad, confianza, autonomía, belleza funcional. Si no se mide, no se mejora. Si se mide algo equivocado, se mejora algo equivocado.',
  },
  {
    titulo: 'Interdependencia consciente',
    cuerpo:
      'Somos libres, pero nos necesitamos. Defendemos derechos asumiendo responsabilidades equivalentes con la comunidad y la naturaleza.',
  },
];

export function LaSemillaDeBasta() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-20">
      <header className="mb-16 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">La semilla</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Seis principios.</span><br />
          <span className="gradient-text">Un país nuevo.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Estos son los seis principios que firmamos cuando decimos <span className="font-semibold text-foreground">¡BASTA!</span>.
          No son reglas: son acuerdos. No son promesas: son cómo decidimos vivir.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {PRINCIPIOS.map((p, idx) => (
          <article key={p.titulo} className="glass rounded-2xl p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-iris-violet">
              {String(idx + 1).padStart(2, '0')}
            </p>
            <h2 className="mt-2 font-serif text-xl font-semibold">{p.titulo}</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{p.cuerpo}</p>
          </article>
        ))}
      </section>

      <div className="mt-16 rounded-2xl border border-iris-violet/30 bg-iris-violet/5 p-8 text-center">
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground/90">
          <em>
            {'«Si este pacto resuena en vos, no necesitás autorización para firmarlo. Solo recordarte cada mañana: soy un pozo tallado en tiempo; hoy decido desbordarme.»'}
          </em>
        </p>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/registrarse">Sumarse al movimiento</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/manifiesto">Leer el manifiesto completo</Link>
        </Button>
      </div>
    </main>
  );
}

export default LaSemillaDeBasta;

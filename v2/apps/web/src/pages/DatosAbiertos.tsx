import { Download } from 'lucide-react';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

const DATASETS = [
  {
    id: 'sueños',
    title: 'Sueños ciudadanos por provincia',
    description: 'Cada sueño que la red registra, normalizado por provincia. Texto + categoría + fecha. Anonimizado.',
    format: 'JSON · CSV',
    licenseHint: 'CC0 — uso libre con atribución apreciada.',
  },
  {
    id: 'pulse',
    title: 'Señales de pulso (mandato vivo)',
    description: 'Statements espontáneos de la ciudadanía clasificados por sentimiento + tema (cuando aplica).',
    format: 'JSON',
    licenseHint: 'CC0',
  },
  {
    id: 'civic',
    title: 'Perfiles cívicos agregados',
    description: 'Distribución de arquetipos cívicos por provincia + cohorte temporal. Sin datos personales.',
    format: 'JSON',
    licenseHint: 'CC0',
  },
  {
    id: 'iniciativas',
    title: 'Iniciativas activas',
    description: 'Listado público de iniciativas, sus PLANs asociados y métricas de actividad.',
    format: 'JSON',
    licenseHint: 'CC0',
  },
];

export function DatosAbiertos() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-20">
      <header className="mb-12">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Datos abiertos</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          <span className="gradient-text">Lo que registra la red,</span><br />
          <span className="gradient-text">disponible para todos.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Si los datos cuentan algo importante sobre nosotros, deberían estar abiertos. Acá publicamos lo
          que la red genera — anonimizado, en formatos abiertos, bajo licencias claras.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="mb-2 font-serif text-2xl font-semibold">Datasets disponibles</h2>
        <ul className="space-y-3">
          {DATASETS.map((d) => (
            <li key={d.id} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-semibold">{d.title}</h3>
                  <p className="mt-2 text-sm text-foreground/80">{d.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full bg-iris-violet/10 px-3 py-0.5 text-iris-violet">{d.format}</span>
                    <span>{d.licenseHint}</span>
                  </div>
                </div>
                <Button asChild size="sm" variant="secondary" disabled>
                  <span>
                    <Download className="h-4 w-4" />
                    <span>Próximo</span>
                  </span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Las descargas se publican cuando los datasets alcanzan masa crítica (~1000 registros agregados).
          Mientras tanto, podés explorar la versión interactiva en{' '}
          <Link href="/explorar-datos" className="text-iris-violet hover:underline">
            /explorar-datos
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 glass rounded-2xl p-6">
        <h2 className="mb-3 font-serif text-xl font-semibold">Metodología</h2>
        <p className="text-sm text-foreground/80">
          Cada dataset ship con un changelog público + scripts de generación reproducibles. Si encontrás
          un error en los datos o la metodología, abrí un feedback público; cada corrección queda en el
          registro con tu nombre y fecha — los datos también necesitan curadores.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/detalles-calculo-costo-humano" className="text-iris-violet hover:underline">
            Ver metodología del cálculo del costo humano →
          </Link>
        </p>
      </section>
    </main>
  );
}

export default DatosAbiertos;

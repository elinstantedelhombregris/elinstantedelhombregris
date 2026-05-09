import { OPEN_DATASETS } from '@v2/shared';
import { Download } from 'lucide-react';
import { Link } from 'wouter';


import { Button } from '~/components/ui/button';

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
          {OPEN_DATASETS.map((d) => (
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
                {d.available && d.downloadUrl ? (
                  <Button asChild size="sm" variant="secondary">
                    <a href={d.downloadUrl} download>
                      <Download className="h-4 w-4" />
                      <span>Descargar</span>
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" disabled>
                    <Download className="h-4 w-4" />
                    <span>Próximo</span>
                  </Button>
                )}
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

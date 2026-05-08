import { Download, Mail } from 'lucide-react';

import { Button } from '~/components/ui/button';

const ASSETS = [
  { name: 'Logo (SVG)', file: '/assets/logo.svg', size: '4 KB' },
  { name: 'Logo (PNG, fondo oscuro)', file: '/assets/logo-dark.png', size: '120 KB' },
  { name: 'Logo (PNG, fondo claro)', file: '/assets/logo-light.png', size: '118 KB' },
  { name: 'Manifiesto (PDF)', file: '/assets/manifiesto.pdf', size: '380 KB' },
  { name: 'Ficha técnica del movimiento', file: '/assets/ficha.pdf', size: '210 KB' },
];

const QUOTES = [
  '"No vine a dirigir multitudes; vine a recordarles que pueden dirigirse a sí mismas."',
  '"Cada vez que esperamos un salvador externo, entregamos un pedazo de nuestra libertad."',
  '"No prometemos utopías; prometemos procesos tan bien diseñados que volver atrás sea impráctico."',
  '"El futuro no se predice. Se construye."',
];

export function KitDePrensa() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-20">
      <header className="mb-12">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Para periodistas</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          <span className="gradient-text">Kit de prensa.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Recursos públicos para cubrir el movimiento ¡BASTA!. Citas atribuibles, logos, ficha técnica,
          y un canal directo para entrevistas.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 font-serif text-2xl font-semibold">Descargas</h2>
        <ul className="space-y-2">
          {ASSETS.map((asset) => (
            <li key={asset.name} className="glass flex items-center justify-between rounded-xl px-5 py-4">
              <div>
                <p className="font-medium">{asset.name}</p>
                <p className="text-xs text-muted-foreground">{asset.size}</p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <a href={asset.file} download>
                  <Download className="h-4 w-4" />
                  <span>Descargar</span>
                </a>
              </Button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Los assets de marca se publican bajo licencia abierta. Atribución apreciada pero no obligatoria.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-serif text-2xl font-semibold">Citas atribuibles al movimiento</h2>
        <ul className="space-y-3">
          {QUOTES.map((q) => (
            <li key={q} className="glass rounded-xl p-5 italic text-foreground/85">
              {q}
            </li>
          ))}
        </ul>
      </section>

      <section className="glass rounded-2xl p-8 text-center">
        <Mail className="mx-auto mb-3 h-6 w-6 text-iris-violet" />
        <h2 className="font-serif text-2xl font-semibold">Contacto de prensa</h2>
        <p className="mt-3 text-foreground/85">
          Para entrevistas o consultas editoriales, escribí a{' '}
          <a href="mailto:prensa@elinstantedelhombregris.com" className="text-iris-violet hover:underline">
            prensa@elinstantedelhombregris.com
          </a>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Respondemos en 48 hs hábiles.</p>
      </section>
    </main>
  );
}

export default KitDePrensa;

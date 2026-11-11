import { ArrowRight, Download, Mail } from 'lucide-react';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';

/**
 * Lo que se baja. Cada archivo existe en `public/media/prensa/`, y el test de
 * esta página lo comprueba: antes se ofrecían cinco descargas en `/assets/` que
 * nunca se habían subido, con tamaños inventados al lado (D-157).
 *
 * ¡BASTA! no tiene logo: tiene una marca tipográfica. De dónde salen los
 * archivos está en `public/media/prensa/LEEME.md`.
 */
export const DESCARGAS = [
  {
    nombre: 'Marca (SVG)',
    detalle: 'Para fondos claros. Vectorial, con los contornos de las letras.',
    archivo: '/media/prensa/basta-marca.svg',
  },
  {
    nombre: 'Marca para fondo oscuro (SVG)',
    detalle: 'Letras claras y signos en violeta claro. Vectorial.',
    archivo: '/media/prensa/basta-marca-clara.svg',
  },
  {
    nombre: 'Marca sobre fondo claro (PNG)',
    detalle: '2000 × 1000 px.',
    archivo: '/media/prensa/basta-marca-fondo-claro.png',
  },
  {
    nombre: 'Marca sobre fondo oscuro (PNG)',
    detalle: '2000 × 1000 px.',
    archivo: '/media/prensa/basta-marca-fondo-oscuro.png',
  },
] as const;

/**
 * Lo que se lee en el sitio. El manifiesto no se ofrece como PDF aparte: una
 * copia suelta envejece sola, y su página ya trae la edición impresa. La ficha
 * técnica que figuraba acá nunca se escribió; mientras no exista, lo que hay
 * para decir sobre quién hace esto está en su propia página.
 */
export const PARA_LEER = [
  {
    nombre: 'El manifiesto',
    detalle: 'El texto entero. Se imprime o se guarda como PDF desde el navegador.',
    href: '/manifiesto',
  },
  {
    nombre: 'Quién está detrás',
    detalle: 'Quién escribe ¡BASTA!, con nombre y apellido.',
    href: '/quien-esta-detras',
  },
] as const;

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
          Recursos públicos para cubrir el movimiento ¡BASTA!. La marca, citas atribuibles, el
          manifiesto y un canal directo para entrevistas.
        </p>
      </header>

      <section className="mb-12" aria-labelledby="kit-descargas">
        <h2 id="kit-descargas" className="mb-4 font-serif text-2xl font-semibold">
          Descargas
        </h2>
        <ul className="space-y-2">
          {DESCARGAS.map((descarga) => (
            <li key={descarga.archivo} className="glass flex items-center justify-between gap-4 rounded-xl px-5 py-4">
              <div>
                <p className="font-medium">{descarga.nombre}</p>
                <p className="text-xs text-muted-foreground">{descarga.detalle}</p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <a href={descarga.archivo} download aria-label={`Descargar: ${descarga.nombre}`}>
                  <Download className="h-4 w-4" aria-hidden />
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

      <section className="mb-12" aria-labelledby="kit-para-leer">
        <h2 id="kit-para-leer" className="mb-4 font-serif text-2xl font-semibold">
          Para leer y citar
        </h2>
        <ul className="space-y-2">
          {PARA_LEER.map((pagina) => (
            <li key={pagina.href} className="glass flex items-center justify-between gap-4 rounded-xl px-5 py-4">
              <div>
                <p className="font-medium">{pagina.nombre}</p>
                <p className="text-xs text-muted-foreground">{pagina.detalle}</p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href={pagina.href} aria-label={`Abrir: ${pagina.nombre}`}>
                  <span>Abrir</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
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

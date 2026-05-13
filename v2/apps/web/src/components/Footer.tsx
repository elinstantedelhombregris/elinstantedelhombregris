import { Link } from 'wouter';

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: '¡BASTA!',
    links: [
      { href: '/manifiesto', label: 'Manifiesto' },
      { href: '/la-vision', label: 'La visión' },
      { href: '/la-semilla-de-basta', label: 'La semilla' },
      { href: '/una-ruta-para-argentina', label: 'Una ruta' },
    ],
  },
  {
    title: 'Explorar',
    links: [
      { href: '/el-mapa', label: 'El mapa' },
      { href: '/el-instante-del-hombre-gris', label: 'El Hombre Gris' },
      { href: '/detalles-calculo-costo-humano', label: 'Costo humano' },
      { href: '/kit-de-prensa', label: 'Kit de prensa' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { href: '/ingresar', label: 'Iniciar sesión' },
      { href: '/registrarse', label: 'Crear cuenta' },
      { href: '/recuperar-contrasena', label: 'Recuperar contraseña' },
      { href: '/apoyo', label: 'Apoyá al movimiento' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-white/5 bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <p className="font-serif text-lg font-semibold">El Instante del Hombre Gris</p>
            <p className="text-sm text-muted-foreground">
              Plataforma de gobernanza popular argentina. <span className="font-semibold">¡BASTA!</span>
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Los ciudadanos diseñan.<br />
              El Estado administra.<br />
              La política ejecuta.
            </p>
          </div>
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/5 pt-6 text-xs text-muted-foreground">
          <p>© {year} El Instante del Hombre Gris. Hecho con manos argentinas.</p>
        </div>
      </div>
    </footer>
  );
}

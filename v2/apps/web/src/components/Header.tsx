import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';

import { Button } from '~/components/ui/button';
import { useAuth } from '~/lib/auth';
import { cn } from '~/lib/utils';

const PRIMARY_LINKS: { href: string; label: string }[] = [
  { href: '/manifiesto', label: 'Manifiesto' },
  { href: '/la-vision', label: 'Visión' },
  { href: '/la-semilla-de-basta', label: 'La semilla' },
  { href: '/una-ruta-para-argentina', label: 'Una ruta' },
  { href: '/el-mapa', label: 'El mapa' },
];

interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, active, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'text-sm transition-colors',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-serif text-base font-semibold">
          <span aria-hidden className="text-iris-violet">¡</span>
          <span>El Instante</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {PRIMARY_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} active={location === link.href} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-xs text-muted-foreground">Hola, {user.name.split(' ')[0]}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  logout.mutate();
                }}
              >
                Salir
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/ingresar">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/registrarse">Crear cuenta</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          onClick={() => {
            setMobileOpen(!mobileOpen);
          }}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/5 bg-background/95 backdrop-blur-md md:hidden">
          <nav className="container mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
            {PRIMARY_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={location === link.href}
                onClick={() => {
                  setMobileOpen(false);
                }}
              />
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    logout.mutate();
                    setMobileOpen(false);
                  }}
                >
                  Salir
                </Button>
              ) : (
                <>
                  <Button asChild size="sm" variant="secondary" className="flex-1">
                    <Link href="/ingresar" onClick={() => { setMobileOpen(false); }}>Entrar</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/registrarse" onClick={() => { setMobileOpen(false); }}>Crear cuenta</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Instagram, Youtube, ArrowRight, Mail, Shield } from 'lucide-react';

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
  };

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/">
              <div className="cursor-pointer group">
                <h3 className="text-2xl font-serif font-bold leading-none tracking-tight text-white group-hover:text-blue-200 transition-colors">
                  El Instante del<br />
                  <span className="text-blue-500 group-hover:text-blue-400 transition-colors">Hombre Gris</span>
                </h3>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed font-light text-sm max-w-xs">
              Un movimiento de consciencia colectiva para rediseñar Argentina desde los valores, la visión y la acción.
            </p>
            <div className="flex gap-4 pt-2">
              {[
                { icon: <XIcon size={18} />, href: 'https://x.com/ElInstanteDelHG' },
                { icon: <Instagram size={18} />, href: 'https://www.instagram.com/elinstantedelhombregris' },
                { icon: <Facebook size={18} />, href: 'https://www.facebook.com/profile.php?id=61580779013855' },
                { icon: <Youtube size={18} />, href: 'https://www.youtube.com/@elinstantedelhombregris777' },
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Explorar</h4>
            <ul className="space-y-4">
              {[
                { label: 'La Visión', href: '/la-vision' },
                { label: 'El Hombre Gris', href: '/el-instante-del-hombre-gris' },
                { label: 'La Semilla', href: '/la-semilla-de-basta' },
                { label: 'El Mapa', href: '/el-mapa' },
                { label: 'El Mandato Vivo', href: '/el-mandato-vivo' },
                { label: 'Los Círculos', href: '/community' }
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-300 hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 text-sm font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Resources */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Recursos</h4>
            <ul className="space-y-4">
              {[
                { label: 'Blog & Artículos', href: '/recursos/blog' },
                { label: 'Rutas de Transformación', href: '/recursos/guias-estudio' },
                { label: 'Manifiesto', href: '/manifiesto' },
                { label: 'Kit de Prensa', href: '/kit-de-prensa' },
                { label: 'Apoyá al Movimiento', href: '/apoya-al-movimiento' }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-300 hover:text-purple-400 hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 text-sm font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Únete al cambio</h4>
            <p className="text-slate-400 text-sm mb-6">
              Recibe actualizaciones semanales sobre el avance del movimiento y nuevas herramientas.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <Input 
                  type="email" 
                  placeholder="tu@email.com" 
                  className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all"
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-lg shadow-lg shadow-blue-900/20 transition-all">
                Suscribirse <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} El Instante del Hombre Gris. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/politica-privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/politica-privacidad" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/politica-privacidad" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { UserContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Menu, Award, Star, Crown, Trophy, Target, Shield, X, LogOut, User, LayoutDashboard
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { NotificationBell } from '@/components/NotificationBell';
import { apiRequest } from '@/lib/queryClient';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userContext = useContext(UserContext);
  const [location] = useLocation();

  // Effect to handle scroll transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    userContext?.setUser(null);
  };

  // Fetch User Progress safely
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', userContext?.user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!userContext?.user?.id || !token) return null;
      try {
        const response = await apiRequest('GET', `/api/progress/${userContext.user.id}`);
        if (response.ok) return response.json();
        if (response.status === 401) clearAuth();
        return null;
      } catch (e) { return null; }
    },
    enabled: !!userContext?.user?.id && !!localStorage.getItem('authToken'),
    retry: false
  });

  const navItems = [
    { label: 'Visión', href: '/la-vision' },
    { label: 'Hombre Gris', href: '/el-instante-del-hombre-gris' },
    { label: 'Semilla', href: '/la-semilla-de-basta' },
    { label: 'Mapa', href: '/el-mapa' },
    { label: 'Tribu', href: '/community' },
    { label: 'Recursos', href: '/recursos' },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-md border-slate-200 shadow-sm py-3' 
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                HG
              </div>
              <div className={`font-serif font-bold text-lg md:text-xl leading-none transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                El Instante<br/>
                <span className="text-blue-500 font-sans text-sm tracking-widest uppercase">del Hombre Gris</span>
              </div>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  location === item.href 
                    ? 'bg-blue-500/10 text-blue-500' 
                    : scrolled ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50' : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {userContext?.isLoggedIn ? (
              <>
                <NotificationBell />
                
                <Link href="/dashboard">
                  <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    scrolled 
                      ? 'border-slate-200 bg-slate-50 hover:bg-white' 
                      : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}>
                    <Avatar className="h-6 w-6 border border-white/20">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userContext.user?.username}`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium pr-1">
                      {userProgress?.data?.points || 0} XP
                    </span>
                  </div>
                </Link>

                <Button 
                  onClick={() => {
                    userContext.setUser(null);
                    localStorage.removeItem('authToken');
                  }}
                  variant="ghost" 
                  size="icon"
                  className={scrolled ? 'text-slate-500 hover:text-red-500' : 'text-white/70 hover:text-white'}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className={scrolled ? 'text-slate-700' : 'text-white hover:bg-white/10'}>
                    Ingresar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                    Unirse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`lg:hidden ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-slate-950 border-l-slate-800 text-white p-0">
                <div className="p-6 border-b border-slate-800">
                  <h2 className="text-xl font-bold font-serif">Menú</h2>
                </div>
                <div className="flex flex-col p-4 space-y-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                        location === item.href ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="h-px bg-slate-800 my-4" />
                  
                  {userContext?.isLoggedIn ? (
                    <>
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white"
                      >
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                      </Link>
                      <Link 
                        href="/profile" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white"
                      >
                        <User className="w-5 h-5" /> Mi Perfil
                      </Link>
                      <button 
                        onClick={() => {
                          userContext.setUser(null);
                          localStorage.removeItem('authToken');
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 w-full text-left"
                      >
                        <LogOut className="w-5 h-5" /> Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">Ingresar</Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Unirse</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
      
      {/* Spacer for fixed header */}
      <div className={location === '/' ? '' : 'h-20'} />
    </>
  );
};

export default Header;

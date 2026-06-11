import { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Eye, EyeOff } from 'lucide-react';
import {
  GLASS_CARD,
  DISPLAY_GRADIENT,
  ACCENT_BUTTON,
  ACCENT_TEXT,
} from '@/lib/design-tokens';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();
  const userContext = useContext(UserContext);
  const [_, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (userContext?.isLoggedIn) {
      setLocation('/dashboard');
    }
  }, [userContext?.isLoggedIn, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/login', { username, password });
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Error al iniciar sesión';
        if (response.status === 429) {
          errorMessage = 'Demasiados intentos. Intenta más tarde.';
        } else if (response.status === 423) {
          errorMessage = 'Cuenta temporalmente bloqueada.';
        } else if (response.status === 401) {
          errorMessage = 'Credenciales inválidas';
        } else if (data?.message) {
          errorMessage = data.message;
        }

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      // Store tokens
      localStorage.setItem('authToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);

      if (userContext) {
        userContext.setUser(data.user);
      }

      toast({
        title: '¡Bienvenido!',
        description: `Has iniciado sesión como ${data.user.name}`,
      });

      // Redirect to dashboard
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);

      toast({
        title: 'Error',
        description: 'Error al iniciar sesión. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-md ${GLASS_CARD} p-8`}>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold font-serif mb-2">
              <span className={DISPLAY_GRADIENT}>Ingresar a tu espacio</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Continuá tu proceso en ¡BASTA! con tus avances, desafíos y comunidad.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre de usuario"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#7D5BDE] focus-visible:border-[#7D5BDE]/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                <button
                  type="button"
                  className={`text-sm ${ACCENT_TEXT} hover:text-[#B5A3EF] transition-colors duration-300`}
                  onClick={() => setShowForgotPassword(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#7D5BDE] focus-visible:border-[#7D5BDE]/50"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full ${ACCENT_BUTTON} font-bold transition-all duration-300`}
              disabled={isLoading}
            >
              {isLoading ? 'Ingresando...' : 'Entrar al panel'}
            </Button>
          </form>

          {showForgotPassword && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-slate-300">Email de recuperacion</Label>
                <p className="text-sm text-slate-500">Te enviaremos instrucciones para restablecer tu contrasena.</p>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#7D5BDE] focus-visible:border-[#7D5BDE]/50"
                />
              </div>
              {resetSent ? (
                <p className="text-sm text-emerald-400 font-medium">Si el email existe, recibiras instrucciones en tu casilla.</p>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!resetEmail) return;
                      try {
                        await apiRequest('POST', '/api/auth/forgot-password', { email: resetEmail });
                      } catch {}
                      setResetSent(true);
                    }}
                    className={`flex-1 ${ACCENT_BUTTON} font-bold transition-all duration-300`}
                  >
                    Enviar instrucciones
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-400 hover:text-slate-300 hover:bg-white/5"
                    onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(''); }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
            <div className="text-sm text-center text-slate-400">
              ¿No tenés una cuenta?{' '}
              <Link href="/register" className={`${ACCENT_TEXT} hover:text-[#B5A3EF] font-medium transition-colors duration-300`}>
                Crear cuenta
              </Link>
            </div>

            <div className="text-xs text-center text-slate-500">
              Al ingresar aceptas nuestros{' '}
              <Link href="/manifiesto" className={`underline ${ACCENT_TEXT} hover:text-[#B5A3EF] transition-colors duration-300`}>Terminos y Condiciones</Link>
              {' '}y nuestra{' '}
              <Link href="/manifiesto" className={`underline ${ACCENT_TEXT} hover:text-[#B5A3EF] transition-colors duration-300`}>Politica de Privacidad</Link>.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;

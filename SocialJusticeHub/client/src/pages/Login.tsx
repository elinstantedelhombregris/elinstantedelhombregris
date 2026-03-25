import { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[hsl(var(--argentina-white))]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Ingresar a tu espacio</CardTitle>
            <CardDescription className="text-center">
              Continuá tu proceso en ¡BASTA! con tus avances, desafíos y comunidad.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input 
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <button type="button" className="text-sm text-[hsl(var(--primary))] hover:underline" onClick={() => setShowForgotPassword(true)}>
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
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Entrar al panel'}
              </Button>
            </form>
            {showForgotPassword && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email de recuperacion</Label>
                  <p className="text-sm text-gray-500">Te enviaremos instrucciones para restablecer tu contrasena.</p>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>
                {resetSent ? (
                  <p className="text-sm text-emerald-600 font-medium">Si el email existe, recibiras instrucciones en tu casilla.</p>
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
                      className="flex-1"
                    >
                      Enviar instrucciones
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(''); }}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              ¿No tenés una cuenta? {' '}
              <Link href="/register" className="text-[hsl(var(--primary))] hover:underline font-medium">
                Crear cuenta
              </Link>
            </div>
            
            <div className="text-xs text-center text-gray-500">
              Al ingresar aceptas nuestros <Link href="/manifiesto" className="underline hover:text-blue-600">Terminos y Condiciones</Link> y nuestra <Link href="/manifiesto" className="underline hover:text-blue-600">Politica de Privacidad</Link>.
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;

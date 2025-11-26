import { useState, useContext } from 'react';
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

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const userContext = useContext(UserContext);
  const [_, setLocation] = useLocation();

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
      
      let errorMessage = 'Error al iniciar sesión';
      if (error.message.includes('429')) {
        errorMessage = 'Demasiados intentos. Intenta más tarde.';
      } else if (error.message.includes('423')) {
        errorMessage = 'Cuenta temporalmente bloqueada.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Credenciales inválidas';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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
            <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresá tus datos para acceder a tu cuenta de ¡BASTA!
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
                  <a href="#" className="text-sm text-[hsl(var(--primary))] hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              ¿No tenés una cuenta? {' '}
              <Link href="/register" className="text-[hsl(var(--primary))] hover:underline font-medium">
                Registrate
              </Link>
            </div>
            
            <div className="text-xs text-center text-gray-500">
              Al iniciar sesión, aceptás nuestros <span className="underline cursor-pointer hover:text-blue-600" onClick={() => {/* TODO: Open terms */}}>Términos y Condiciones</span> y nuestra <span className="underline cursor-pointer hover:text-blue-600" onClick={() => {/* TODO: Open privacy */}}>Política de Privacidad</span>.
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;

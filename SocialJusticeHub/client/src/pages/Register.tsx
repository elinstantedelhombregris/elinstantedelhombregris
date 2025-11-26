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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const userContext = useContext(UserContext);
  const [_, setLocation] = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.username || !formData.password) {
      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        location: formData.location
      };
      
      const response = await apiRequest('POST', '/api/register', userData);
      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('authToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      
      if (userContext) {
        userContext.setUser(data.user);
      }
      
      toast({
        title: '¡Registro exitoso!',
        description: `Bienvenido a ¡BASTA!, ${data.user.name}`,
      });
      
      // Redirect to dashboard
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'No se pudo completar el registro';
      if (error.message.includes('409')) {
        errorMessage = 'El usuario o email ya existe';
      } else if (error.message.includes('400')) {
        errorMessage = 'Datos de entrada inválidos';
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
            <CardTitle className="text-2xl font-bold text-center">Crear cuenta</CardTitle>
            <CardDescription className="text-center">
              Sumate al movimiento ¡BASTA! y empezá a construir la Argentina que soñamos
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input 
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario *</Label>
                <Input 
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Elige un nombre de usuario único"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Elige una contraseña segura"
                  required
                />
                <div className="text-xs text-gray-600 space-y-1">
                  <p>La contraseña debe contener:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li className={formData.password.match(/[a-z]/) ? 'text-green-600' : 'text-gray-500'}>
                      Al menos una letra minúscula
                    </li>
                    <li className={formData.password.match(/[A-Z]/) ? 'text-green-600' : 'text-gray-500'}>
                      Al menos una letra mayúscula
                    </li>
                    <li className={formData.password.match(/[0-9]/) ? 'text-green-600' : 'text-gray-500'}>
                      Al menos un número
                    </li>
                    <li className={formData.password.match(/[^a-zA-Z0-9]/) ? 'text-green-600' : 'text-gray-500'}>
                      Al menos un carácter especial
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación (opcional)</Label>
                <Input 
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ciudad, Provincia"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[hsl(var(--accent))]" 
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              ¿Ya tenés una cuenta? {' '}
              <Link href="/login">
                <a className="text-[hsl(var(--primary))] hover:underline font-medium">
                  Iniciá sesión
                </a>
              </Link>
            </div>
            
            <div className="text-xs text-center text-gray-500">
              Al registrarte, aceptás nuestros <span className="underline cursor-pointer hover:text-blue-600" onClick={() => {/* TODO: Open terms */}}>Términos y Condiciones</span> y nuestra <span className="underline cursor-pointer hover:text-blue-600" onClick={() => {/* TODO: Open privacy */}}>Política de Privacidad</span>.
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;

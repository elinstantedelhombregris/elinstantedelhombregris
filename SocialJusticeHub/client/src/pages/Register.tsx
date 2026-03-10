import { useState, useContext } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { toast } = useToast();
  const userContext = useContext(UserContext);
  const [_, setLocation] = useLocation();

  // Fetch provinces
  const { data: provinces = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['/api/geographic/provinces'],
    staleTime: 300000,
  });

  // Fetch cities when province is selected
  const selectedProvinceId = provinces.find(p => p.name === selectedProvince)?.id;
  const { data: cities = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: [`/api/geographic/provinces/${selectedProvinceId}/cities`],
    enabled: !!selectedProvinceId,
    staleTime: 300000,
  });

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
      
      // Redirect to onboarding
      setLocation('/bienvenida');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'No se pudo completar el registro';
      if (error.message?.includes('409')) {
        errorMessage = 'El nombre de usuario o email ya está en uso. Probá con otro.';
      } else if (error.message?.includes('400')) {
        errorMessage = 'Datos de entrada inválidos. Revisá los campos e intentá de nuevo.';
      } else if (error.message?.includes('429')) {
        errorMessage = 'Demasiados intentos. Esperá un momento e intentá de nuevo.';
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
            <CardTitle className="text-2xl font-bold text-center">Crear tu espacio</CardTitle>
            <CardDescription className="text-center">
              Sumate a ¡BASTA! para transformar intención en acción sostenida junto a la comunidad.
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
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Elige una contraseña segura"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Provincia (opcional)</Label>
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    const province = e.target.value;
                    setSelectedProvince(province);
                    setSelectedCity('');
                    setFormData(prev => ({ ...prev, location: province }));
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Seleccionar provincia...</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProvince && cities.length > 0 && (
                <div className="space-y-2">
                  <Label>Ciudad (opcional)</Label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      const city = e.target.value;
                      setSelectedCity(city);
                      setFormData(prev => ({
                        ...prev,
                        location: city ? `${city}, ${selectedProvince}` : selectedProvince
                      }));
                    }}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Seleccionar ciudad...</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-[hsl(var(--accent))]" 
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear y continuar'}
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
              Al registrarte, aceptas nuestros <Link href="/manifiesto" className="underline hover:text-blue-600">Terminos y Condiciones</Link> y nuestra <Link href="/manifiesto" className="underline hover:text-blue-600">Politica de Privacidad</Link>.
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;

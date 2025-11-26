import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Filter, 
  X, 
  Navigation,
  Globe
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

type GeographicLocation = {
  id: number;
  name: string;
  type: 'province' | 'city' | 'neighborhood';
  parentId?: number;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
  country: string;
  createdAt: string;
};

type GeographicFiltersProps = {
  onFiltersChange: (filters: {
    province?: string;
    city?: string;
    radiusKm?: number;
    userLat?: number;
    userLng?: number;
  }) => void;
  className?: string;
};

const GeographicFilters = ({ onFiltersChange, className }: GeographicFiltersProps) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch provinces
  const { data: provinces = [] } = useQuery({
    queryKey: ['/api/geographic/provinces'],
    staleTime: 300000, // 5 minutes
  }) as { data: GeographicLocation[] };

  // Fetch cities when province is selected
  const { data: cities = [] } = useQuery({
    queryKey: ['/api/geographic/provinces', selectedProvince, 'cities'],
    queryFn: async () => {
      if (!selectedProvince) return [];
      const province = provinces.find((p: GeographicLocation) => p.name === selectedProvince);
      if (!province) return [];
      
      const response = await apiRequest('GET', `/api/geographic/provinces/${province.id}/cities`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedProvince,
    staleTime: 300000,
  }) as { data: GeographicLocation[] };

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Apply filters
  const applyFilters = () => {
    const filters: any = {};
    
    if (selectedProvince) filters.province = selectedProvince;
    if (selectedCity) filters.city = selectedCity;
    if (showAdvanced && radiusKm > 0 && userLocation) {
      filters.radiusKm = radiusKm;
      filters.userLat = userLocation.lat;
      filters.userLng = userLocation.lng;
    }
    
    onFiltersChange(filters);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedProvince('');
    setSelectedCity('');
    setRadiusKm(50);
    setUserLocation(null);
    setShowAdvanced(false);
    onFiltersChange({});
  };

  // Auto-apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [selectedProvince, selectedCity, radiusKm, userLocation, showAdvanced]);

  const hasActiveFilters = selectedProvince || selectedCity || (showAdvanced && userLocation);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-blue-600" />
          Filtros Geográficos
        </CardTitle>
        <CardDescription>
          Busca publicaciones por ubicación geográfica
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Province Filter */}
        <div className="space-y-2">
          <Label htmlFor="province">Provincia</Label>
          <select
            id="province"
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setSelectedCity(''); // Reset city when province changes
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Todas las provincias</option>
            {provinces.map((province: GeographicLocation) => (
              <option key={province.id} value={province.name}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        {selectedProvince && (
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Todas las ciudades</option>
              {cities.map((city: GeographicLocation) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros Avanzados
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Búsqueda por proximidad</span>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="radius">Radio de búsqueda (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  min="1"
                  max="500"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value) || 50)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getUserLocation}
                  disabled={!!userLocation}
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  {userLocation ? 'Ubicación obtenida' : 'Obtener mi ubicación'}
                </Button>
                
                {userLocation && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Ubicación actual
                  </Badge>
                )}
              </div>
              
              {userLocation && (
                <div className="text-xs text-gray-600">
                  Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtros activos:</Label>
            <div className="flex flex-wrap gap-2">
              {selectedProvince && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedProvince}
                  <button
                    onClick={() => setSelectedProvince('')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {selectedCity && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedCity}
                  <button
                    onClick={() => setSelectedCity('')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {showAdvanced && userLocation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  {radiusKm}km desde aquí
                  <button
                    onClick={() => setUserLocation(null)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeographicFilters;

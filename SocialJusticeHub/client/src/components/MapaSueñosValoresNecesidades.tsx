import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Heart, AlertCircle, MapPin, Users, TrendingUp, Globe } from 'lucide-react';
import { cn } from "@/lib/utils";

// Import Leaflet dynamically to avoid SSR issues
import { useLoader } from '@/hooks/use-loader';

declare global {
  interface Window {
    L: any;
  }
}

// Importing Dream type from schema
import { Dream } from "@shared/schema";

// Local type for form data
type DreamFormData = {
  content: string;
  shareLocation: boolean;
};

const MapaSueñosValoresNecesidades = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'dream' | 'value' | 'need'>('dream');
  const [formData, setFormData] = useState<DreamFormData>({
    content: '',
    shareLocation: false
  });
  
  // Load Leaflet library dynamically
  const leafletLoaded = useLoader('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', 'L');
  
  // Add Leaflet CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  // Fetch dreams from API
  const { data: dreams = [] } = useQuery({
    queryKey: ['/api/dreams'],
    staleTime: 60000, // 1 minute
  });
  
  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (leafletLoaded && mapRef.current && !mapInstanceRef.current) {
      const L = window.L;
      
      // Center of Argentina
      const argentinaCenterLat = -38.416097;
      const argentinaCenterLng = -63.616672;
      
      const map = L.map(mapRef.current).setView([argentinaCenterLat, argentinaCenterLng], 4);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapInstanceRef.current = map;
    }
  }, [leafletLoaded]);
  
  // Add dream markers to map
  useEffect(() => {
    if (leafletLoaded && mapInstanceRef.current && dreams && Array.isArray(dreams) && dreams.length > 0) {
      const L = window.L;
      const map = mapInstanceRef.current;
      
      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      
      // Create custom icons for different types
      const dreamIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });
      
      const valueIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-full shadow-lg border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });
      
      const needIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full shadow-lg border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });
      
      // Add markers with custom icons based on type
      dreams.forEach((dream: Dream) => {
        if (dream.latitude && dream.longitude) {
          // Determine which icon to use based on type
          let markerIcon;
          let popupTitle;
          let popupContent = '';
          
          if (dream.type === 'dream') {
            markerIcon = dreamIcon;
            popupTitle = 'Sueño';
            if (dream.dream) {
              popupContent = `<div class="p-3"><p class="font-semibold text-blue-600 mb-2">${popupTitle}:</p><p class="text-gray-700">${dream.dream}</p></div>`;
            }
          } else if (dream.type === 'value') {
            markerIcon = valueIcon;
            popupTitle = 'Valor';
            if (dream.value) {
              popupContent = `<div class="p-3"><p class="font-semibold text-pink-600 mb-2">${popupTitle}:</p><p class="text-gray-700">${dream.value}</p></div>`;
            }
          } else if (dream.type === 'need') {
            markerIcon = needIcon;
            popupTitle = 'Necesidad';
            if (dream.need) {
              popupContent = `<div class="p-3"><p class="font-semibold text-amber-600 mb-2">${popupTitle}:</p><p class="text-gray-700">${dream.need}</p></div>`;
            }
          } else {
            // Fallback for items without type
            markerIcon = dreamIcon;
            popupTitle = 'Contenido';
            
            if (dream.dream) {
              popupContent = `<div class="p-3"><p class="font-semibold text-blue-600 mb-2">Sueño:</p><p class="text-gray-700">${dream.dream}</p></div>`;
            }
            if (dream.value) {
              popupContent += `<div class="p-3"><p class="font-semibold text-pink-600 mb-2">Valor:</p><p class="text-gray-700">${dream.value}</p></div>`;
            }
            if (dream.need) {
              popupContent += `<div class="p-3"><p class="font-semibold text-amber-600 mb-2">Necesidad:</p><p class="text-gray-700">${dream.need}</p></div>`;
            }
          }
          
          // Create the marker with the appropriate icon
          const marker = L.marker(
            [parseFloat(dream.latitude), parseFloat(dream.longitude)], 
            { icon: markerIcon }
          ).addTo(map);
          
          // Create the popup
          const finalPopupContent = `<div class="dream-popup">${popupContent}</div>`;
          marker.bindPopup(finalPopupContent);
        }
      });
    }
  }, [dreams, leafletLoaded]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, content: e.target.value }));
  };
  
  // Handle location checkbox
  const handleLocationChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, shareLocation: checked }));
  };

  // Get notification title and message based on active tab
  const getNotification = () => {
    switch (activeTab) {
      case 'dream':
        return {
          successTitle: "¡Sueño compartido!",
          successMsg: "Tu sueño ha sido agregado al mapa de transformación.",
          errorTitle: "Formulario incompleto",
          errorMsg: "Por favor, comparte qué sueñas para Argentina."
        };
      case 'value':
        return {
          successTitle: "¡Valor compartido!",
          successMsg: "Tu valor ha sido agregado al mapa de transformación.",
          errorTitle: "Formulario incompleto",
          errorMsg: "Por favor, comparte qué valores de tu comunidad o cultura."
        };
      case 'need':
        return {
          successTitle: "¡Necesidad compartida!",
          successMsg: "Tu necesidad ha sido agregada al mapa de transformación.",
          errorTitle: "Formulario incompleto",
          errorMsg: "Por favor, comparte qué necesitas para prosperar."
        };
    }
  };
  
  // Create dream mutation
  const createDreamMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/dreams', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });
      const notification = getNotification();
      toast({
        title: notification.successTitle,
        description: notification.successMsg,
      });
      
      // Reset form
      setFormData({
        content: '',
        shareLocation: false
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo compartir. Inténtalo de nuevo.`,
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      const notification = getNotification();
      toast({
        title: notification.errorTitle,
        description: notification.errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    // Create the data object based on the active tab
    const data: any = {
      type: activeTab,
      location: ''
    };

    // Add the content to the appropriate field based on tab
    if (activeTab === 'dream') {
      data.dream = formData.content;
    } else if (activeTab === 'value') {
      data.value = formData.content;
    } else if (activeTab === 'need') {
      data.need = formData.content;
    }
    
    // Add geolocation if user has opted in
    if (formData.shareLocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        data.latitude = position.coords.latitude.toString();
        data.longitude = position.coords.longitude.toString();
        data.location = 'Ubicación compartida';
      } catch (error) {
        console.error('Geolocation error:', error);
        toast({
          title: "Error de ubicación",
          description: "No pudimos obtener tu ubicación. Se compartirá sin ella.",
          variant: "destructive",
        });
      }
    }
    
    createDreamMutation.mutate(data);
  };

  // Get form title, description and button text based on active tab
  const getFormContent = () => {
    switch (activeTab) {
      case 'dream':
        return {
          title: "Sueños",
          description: "Compartí tus anhelos y esperanzas para un mejor futuro en Argentina. ¿Qué país soñás para vos y para las próximas generaciones?",
          placeholder: "Un país donde todos puedan desarrollar su potencial en plenitud, en gracia, con gloria...",
          btnText: "Compartir un sueño",
          icon: <Star className="h-5 w-5" />,
          bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
          iconColor: "text-blue-500"
        };
      case 'value':
        return {
          title: "Valores",
          description: "¿Qué es lo que más valorás de tu comunidad, tu cultura y tu país? Compartí los valores que creés que deberían guiar nuestro futuro.",
          placeholder: "La amabilidad radical que veo en...",
          btnText: "Compartir un valor",
          icon: <Heart className="h-5 w-5" />,
          bgColor: "bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200",
          iconColor: "text-pink-500"
        };
      case 'need':
        return {
          title: "Necesidades",
          description: "Expresá qué necesitás vos o tu comunidad para prosperar. Las necesidades identificadas nos ayudan a priorizar acciones.",
          placeholder: "Para avanzar necesitamos transparencia radical, educación para la autonomía...",
          btnText: "Compartir una necesidad",
          icon: <AlertCircle className="h-5 w-5" />,
          iconColor: "text-amber-500",
          bgColor: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
        };
      default:
        return {
          title: "Sueños",
          description: "Compartí tus anhelos y esperanzas para un mejor futuro en Argentina.",
          placeholder: "Un país donde todos...",
          btnText: "Compartir un sueño",
          icon: <Star className="h-5 w-5" />,
          bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
          iconColor: "text-blue-500"
        };
    }
  };

  // Filter dreams based on active tab
  const getFilteredDreams = () => {
    if (!Array.isArray(dreams)) return [];
    return dreams.filter((dream: Dream) => dream.type === activeTab);
  };

  // Get recent entries of the active tab
  const recentEntries = getFilteredDreams().slice(0, 2);
  
  // Get form content based on active tab
  const formContent = getFormContent();

  return (
    <section id="mapa-sueños" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-serif">
            ¡Participa en el Mapa!
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Agrega tu contribución al mapa de sueños, valores y necesidades de Argentina. 
            Tu voz es parte de la transformación que estamos construyendo juntos.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Argentina Map */}
          <div className="argentina-map-container bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl overflow-hidden order-2 lg:order-1 lg:w-2/3 h-[500px] border border-gray-200">
            <div ref={mapRef} id="argentina-map" className="h-full w-full"></div>
          </div>
          
          {/* Interactive Tabs */}
          <div className="order-1 lg:order-2 lg:w-1/3">
            <Tabs defaultValue="dream" value={activeTab} onValueChange={(value) => setActiveTab(value as 'dream' | 'value' | 'need')}>
              <TabsList className="grid grid-cols-3 mb-8 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="dream" 
                  className={cn("flex items-center gap-2 rounded-lg transition-all", 
                    activeTab === 'dream' ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-blue-600")}
                >
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Sueños</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="value" 
                  className={cn("flex items-center gap-2 rounded-lg transition-all", 
                    activeTab === 'value' ? "bg-pink-600 text-white shadow-md" : "text-gray-600 hover:text-pink-600")}
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Valores</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="need" 
                  className={cn("flex items-center gap-2 rounded-lg transition-all", 
                    activeTab === 'need' ? "bg-amber-600 text-white shadow-md" : "text-gray-600 hover:text-amber-600")}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Necesidades</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className={cn("rounded-2xl border-2 p-6 shadow-lg", formContent.bgColor)}>
                <div className="mb-6 flex items-start">
                  <div className={cn("p-3 rounded-full mr-4 shadow-md", formContent.iconColor, "bg-white")}>
                    {formContent.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{formContent.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{formContent.description}</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Textarea 
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={4} 
                      className="w-full text-base border-2 focus:border-blue-500 transition-colors"
                      placeholder={formContent.placeholder} 
                    />
                  </div>
                  
                  <div className="flex items-start">
                    <Checkbox 
                      id="location" 
                      checked={formData.shareLocation}
                      onCheckedChange={handleLocationChange}
                      className="mt-1 mr-3" 
                    />
                    <Label htmlFor="location" className="text-sm text-gray-600 leading-relaxed">
                      Compartir mi ubicación en el mapa (opcional)
                    </Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className={cn("w-full flex gap-2 items-center justify-center font-semibold py-3",
                      activeTab === 'dream' ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" : 
                      activeTab === 'value' ? "bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800" : 
                      "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800")} 
                    disabled={createDreamMutation.isPending}
                  >
                    <MapPin className="h-5 w-5" />
                    {createDreamMutation.isPending ? "Compartiendo..." : formContent.btnText}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Recent entries */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-gray-800">
                  {activeTab === 'dream' ? 'Sueños recientes' : 
                   activeTab === 'value' ? 'Valores recientes' : 
                   'Necesidades recientes'}
                </h4>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {recentEntries.map((entry: Dream) => (
                  <div key={entry.id} className={cn("p-4 bg-white rounded-xl shadow-sm border-2", 
                    activeTab === 'dream' ? "border-blue-100 bg-blue-50/50" :
                    activeTab === 'value' ? "border-pink-100 bg-pink-50/50" :
                    "border-amber-100 bg-amber-50/50"
                  )}>
                    {activeTab === 'dream' && entry.dream && (
                      <p className="text-sm italic text-gray-800 mb-2">"{entry.dream}"</p>
                    )}
                    {activeTab === 'value' && entry.value && (
                      <p className="text-sm italic text-gray-800 mb-2">"{entry.value}"</p>
                    )}
                    {activeTab === 'need' && entry.need && (
                      <p className="text-sm italic text-gray-800 mb-2">"{entry.need}"</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      {entry.location || 'Argentina'}
                    </p>
                  </div>
                ))}
                
                {recentEntries.length === 0 && (
                  <div className={cn("p-4 bg-white rounded-xl shadow-sm border-2",
                    activeTab === 'dream' ? "border-blue-100 bg-blue-50/50" :
                    activeTab === 'value' ? "border-pink-100 bg-pink-50/50" :
                    "border-amber-100 bg-amber-50/50"
                  )}>
                    <p className="text-sm text-gray-500 text-center">
                      {activeTab === 'dream' ? '¡Sé el primero en compartir tu sueño!' :
                       activeTab === 'value' ? '¡Sé el primero en compartir un valor!' :
                       '¡Sé el primero en compartir una necesidad!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl text-center shadow-lg">
            <div className="flex justify-center items-center mb-3">
              <Star className="w-6 h-6 text-blue-600 mr-2" />
              <p className="text-lg font-semibold text-gray-800">Sueños</p>
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-2">
              {Array.isArray(dreams) ? dreams.filter(d => d.type === 'dream').length : 0}
            </p>
            <p className="text-gray-600 text-sm">Aspiraciones compartidas</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-2xl text-center shadow-lg">
            <div className="flex justify-center items-center mb-3">
              <Heart className="w-6 h-6 text-pink-600 mr-2" />
              <p className="text-lg font-semibold text-gray-800">Valores</p>
            </div>
            <p className="text-4xl font-bold text-pink-600 mb-2">
              {Array.isArray(dreams) ? dreams.filter(d => d.type === 'value').length : 0}
            </p>
            <p className="text-gray-600 text-sm">Principios destacados</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl text-center shadow-lg">
            <div className="flex justify-center items-center mb-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mr-2" />
              <p className="text-lg font-semibold text-gray-800">Necesidades</p>
            </div>
            <p className="text-4xl font-bold text-amber-600 mb-2">
              {Array.isArray(dreams) ? dreams.filter(d => d.type === 'need').length : 0}
            </p>
            <p className="text-gray-600 text-sm">Prioridades identificadas</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl text-center shadow-lg">
            <div className="flex justify-center items-center mb-3">
              <Globe className="w-6 h-6 text-gray-600 mr-2" />
              <p className="text-lg font-semibold text-gray-800">Regiones</p>
            </div>
            <p className="text-4xl font-bold text-gray-600 mb-2">
              {Array.isArray(dreams) ? new Set(dreams.map(d => d.location).filter(Boolean)).size : 0}
            </p>
            <p className="text-gray-600 text-sm">Zonas representadas</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapaSueñosValoresNecesidades;

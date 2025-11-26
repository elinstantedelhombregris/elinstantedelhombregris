import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Heart, AlertCircle, MapPin } from 'lucide-react';
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

const DreamsMap = () => {
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
        html: `<div class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });
      
      const valueIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="flex items-center justify-center w-8 h-8 bg-pink-500 text-white rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });
      
      const needIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="flex items-center justify-center w-8 h-8 bg-amber-500 text-white rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
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
              popupContent = `<p><strong>${popupTitle}:</strong> ${dream.dream}</p>`;
            }
          } else if (dream.type === 'value') {
            markerIcon = valueIcon;
            popupTitle = 'Valor';
            if (dream.value) {
              popupContent = `<p><strong>${popupTitle}:</strong> ${dream.value}</p>`;
            }
          } else if (dream.type === 'need') {
            markerIcon = needIcon;
            popupTitle = 'Necesidad';
            if (dream.need) {
              popupContent = `<p><strong>${popupTitle}:</strong> ${dream.need}</p>`;
            }
          } else {
            // Fallback for items without type
            markerIcon = dreamIcon;
            popupTitle = 'Contenido';
            
            if (dream.dream) {
              popupContent = `<p><strong>Sueño:</strong> ${dream.dream}</p>`;
            }
            if (dream.value) {
              popupContent += `<p><strong>Valor:</strong> ${dream.value}</p>`;
            }
            if (dream.need) {
              popupContent += `<p><strong>Necesidad:</strong> ${dream.need}</p>`;
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
          successMsg: "Tu sueño ha sido agregado al mapa.",
          errorTitle: "Formulario incompleto",
          errorMsg: "Por favor, comparte qué sueñas para Argentina."
        };
      case 'value':
        return {
          successTitle: "¡Valor compartido!",
          successMsg: "Tu valor ha sido agregado al mapa.",
          errorTitle: "Formulario incompleto",
          errorMsg: "Por favor, comparte qué valores de tu comunidad o cultura."
        };
      case 'need':
        return {
          successTitle: "¡Necesidad compartida!",
          successMsg: "Tu necesidad ha sido agregada al mapa.",
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
          placeholder: "Un país donde todos...",
          btnText: "Compartir un sueño",
          icon: <Star className="h-5 w-5" />,
          bgColor: "bg-blue-50 border-blue-200",
          iconColor: "text-blue-500"
        };
      case 'value':
        return {
          title: "Valores",
          description: "¿Qué es lo que más valorás de tu comunidad, tu cultura y tu país? Compartí los valores que creés que deberían guiar nuestro futuro.",
          placeholder: "La solidaridad que veo en...",
          btnText: "Compartir un valor",
          icon: <Heart className="h-5 w-5" />,
          bgColor: "bg-pink-50 border-pink-200",
          iconColor: "text-pink-500"
        };
      case 'need':
        return {
          title: "Necesidades",
          description: "Expresá qué necesitás vos o tu comunidad para prosperar. Las necesidades identificadas nos ayudan a priorizar acciones.",
          placeholder: "Para avanzar necesitamos...",
          btnText: "Compartir una necesidad",
          icon: <AlertCircle className="h-5 w-5" />,
          iconColor: "text-amber-500",
          bgColor: "bg-amber-50 border-amber-200"
        };
      default:
        return {
          title: "Sueños",
          description: "Compartí tus anhelos y esperanzas para un mejor futuro en Argentina.",
          placeholder: "Un país donde todos...",
          btnText: "Compartir un sueño",
          icon: <Star className="h-5 w-5" />,
          bgColor: "bg-blue-50 border-blue-200",
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
    <section id="participa" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Mapa de Sueños y Necesidades</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Un espacio donde todos los argentinos pueden expresar lo que sueñan, lo que valoran y
            lo que necesitan para construir juntos un mejor país.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Argentina Map */}
          <div className="argentina-map-container bg-gray-100 rounded-xl shadow-md overflow-hidden order-2 lg:order-1 lg:w-2/3 h-[450px]">
            <div ref={mapRef} id="argentina-map" className="h-full w-full"></div>
          </div>
          
          {/* Interactive Tabs */}
          <div className="order-1 lg:order-2 lg:w-1/3">
            <Tabs defaultValue="dream" value={activeTab} onValueChange={(value) => setActiveTab(value as 'dream' | 'value' | 'need')}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger 
                  value="dream" 
                  className={cn("flex items-center gap-2", 
                    activeTab === 'dream' ? "text-blue-700" : "text-gray-600")}
                >
                  <Star className="h-4 w-4" />
                  <span>Sueños</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="value" 
                  className={cn("flex items-center gap-2", 
                    activeTab === 'value' ? "text-pink-700" : "text-gray-600")}
                >
                  <Heart className="h-4 w-4" />
                  <span>Valores</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="need" 
                  className={cn("flex items-center gap-2", 
                    activeTab === 'need' ? "text-amber-700" : "text-gray-600")}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Necesidades</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className={cn("rounded-lg border p-5", formContent.bgColor)}>
                <div className="mb-4 flex items-start">
                  <div className={cn("p-2 rounded-full mr-3", formContent.iconColor, "bg-white")}>
                    {formContent.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{formContent.title}</h3>
                    <p className="text-sm text-gray-600">{formContent.description}</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <Textarea 
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={3} 
                      className="w-full"
                      placeholder={formContent.placeholder} 
                    />
                  </div>
                  
                  <div className="flex items-start">
                    <Checkbox 
                      id="location" 
                      checked={formData.shareLocation}
                      onCheckedChange={handleLocationChange}
                      className="mt-1 mr-2" 
                    />
                    <Label htmlFor="location" className="text-sm text-gray-600">
                      Compartir mi ubicación en el mapa (opcional)
                    </Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className={cn("w-full flex gap-2 items-center justify-center",
                      activeTab === 'dream' ? "bg-blue-600 hover:bg-blue-700" : 
                      activeTab === 'value' ? "bg-pink-600 hover:bg-pink-700" : 
                      "bg-amber-600 hover:bg-amber-700")} 
                    disabled={createDreamMutation.isPending}
                  >
                    <MapPin className="h-4 w-4" />
                    {createDreamMutation.isPending ? "Compartiendo..." : formContent.btnText}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Recent entries */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700">
                  {activeTab === 'dream' ? 'Sueños recientes' : 
                   activeTab === 'value' ? 'Valores recientes' : 
                   'Necesidades recientes'}
                </h4>
              </div>
              
              <div className="space-y-4">
                {recentEntries.map((entry: Dream) => (
                  <div key={entry.id} className={cn("p-3 bg-white rounded-lg shadow-sm border", 
                    activeTab === 'dream' ? "border-blue-100" :
                    activeTab === 'value' ? "border-pink-100" :
                    "border-amber-100"
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
                    
                    <p className="text-xs text-gray-500 mt-2 pt-1 border-t border-gray-100">
                      {entry.location || 'Argentina'}
                    </p>
                  </div>
                ))}
                
                {recentEntries.length === 0 && (
                  <div className={cn("p-3 bg-white rounded-lg shadow-sm border",
                    activeTab === 'dream' ? "border-blue-100" :
                    activeTab === 'value' ? "border-pink-100" :
                    "border-amber-100"
                  )}>
                    <p className="text-sm text-gray-500">
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
        <div className="mt-12 flex flex-wrap justify-center gap-6 lg:gap-8 text-center">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg w-full md:w-60">
            <div className="flex justify-center items-center mb-2">
              <Star className="w-5 h-5 text-blue-500 mr-2" />
              <p className="text-xl font-medium text-gray-700">Sueños</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {Array.isArray(dreams) ? dreams.filter(d => d.type === 'dream').length : 0}
            </p>
            <p className="text-gray-600 text-sm">Aspiraciones compartidas</p>
          </div>
          
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-lg w-full md:w-60">
            <div className="flex justify-center items-center mb-2">
              <Heart className="w-5 h-5 text-pink-500 mr-2" />
              <p className="text-xl font-medium text-gray-700">Valores</p>
            </div>
            <p className="text-3xl font-bold text-pink-600">
              {Array.isArray(dreams) ? dreams.filter(d => d.type === 'value').length : 0}
            </p>
            <p className="text-gray-600 text-sm">Principios destacados</p>
          </div>
          
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg w-full md:w-60">
            <div className="flex justify-center items-center mb-2">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
              <p className="text-xl font-medium text-gray-700">Necesidades</p>
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {Array.isArray(dreams) ? dreams.filter(d => d.type === 'need').length : 0}
            </p>
            <p className="text-gray-600 text-sm">Prioridades identificadas</p>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg w-full md:w-60">
            <div className="flex justify-center items-center mb-2">
              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
              <p className="text-xl font-medium text-gray-700">Regiones</p>
            </div>
            <p className="text-3xl font-bold text-gray-600">
              {Array.isArray(dreams) ? new Set(dreams.map(d => d.location).filter(Boolean)).size : 0}
            </p>
            <p className="text-gray-600 text-sm">Zonas representadas</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DreamsMap;

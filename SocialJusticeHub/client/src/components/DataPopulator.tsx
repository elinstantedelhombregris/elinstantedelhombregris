import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Heart,
  AlertTriangle,
  Upload,
  BarChart3
} from 'lucide-react';

// Datos del Hombre Gris - 39 contribuciones auténticas
const HOMBRE_GRIS_DATA = {
  dreams: [
    {
      dream: "Una Argentina donde cada ciudadano tenga acceso a educación de calidad, sin importar su condición económica o social",
      location: "Buenos Aires, Argentina"
    },
    {
      dream: "Un sistema de salud público que funcione con eficiencia y humanidad, donde nadie tenga que elegir entre su salud y su economía",
      location: "Córdoba, Argentina"
    },
    {
      dream: "Una economía circular y sostenible que genere trabajo digno para todos los argentinos",
      location: "Rosario, Argentina"
    },
    {
      dream: "Un gobierno transparente y eficiente, donde la corrupción sea imposible por diseño sistémico",
      location: "Mendoza, Argentina"
    },
    {
      dream: "Una sociedad donde la amabilidad radical sea la norma, no la excepción",
      location: "La Plata, Argentina"
    },
    {
      dream: "Un país donde los jóvenes puedan desarrollar sus talentos sin tener que emigrar",
      location: "Tucumán, Argentina"
    },
    {
      dream: "Una Argentina que lidere la innovación tecnológica en América Latina",
      location: "Santa Fe, Argentina"
    },
    {
      dream: "Un sistema judicial que funcione con rapidez y justicia para todos por igual",
      location: "Salta, Argentina"
    },
    {
      dream: "Una cultura que valore el trabajo colaborativo sobre la competencia destructiva",
      location: "Neuquén, Argentina"
    },
    {
      dream: "Un país donde la ciencia y la investigación tengan el apoyo que merecen",
      location: "Bahía Blanca, Argentina"
    },
    {
      dream: "Una Argentina que proteja y preserve su medio ambiente para las futuras generaciones",
      location: "Bariloche, Argentina"
    },
    {
      dream: "Un sistema educativo que enseñe a pensar críticamente, no solo a memorizar",
      location: "Mar del Plata, Argentina"
    },
    {
      dream: "Una nación unida en su diversidad, donde cada región aporte su riqueza única",
      location: "Ushuaia, Argentina"
    }
  ],
  
  values: [
    {
      value: "La amabilidad radical como fuerza transformadora de la sociedad",
      location: "Buenos Aires, Argentina"
    },
    {
      value: "La transparencia total en todas las instituciones públicas y privadas",
      location: "Córdoba, Argentina"
    },
    {
      value: "El trabajo colaborativo sobre la competencia destructiva",
      location: "Rosario, Argentina"
    },
    {
      value: "La educación como derecho fundamental, no como privilegio",
      location: "Mendoza, Argentina"
    },
    {
      value: "La innovación constante para resolver problemas sistémicos",
      location: "La Plata, Argentina"
    },
    {
      value: "El respeto por la diversidad y la inclusión en todos los ámbitos",
      location: "Tucumán, Argentina"
    },
    {
      value: "La sostenibilidad ambiental como principio rector del desarrollo",
      location: "Santa Fe, Argentina"
    },
    {
      value: "La justicia social como base de una sociedad próspera",
      location: "Salta, Argentina"
    },
    {
      value: "La integridad personal como fundamento del liderazgo",
      location: "Neuquén, Argentina"
    },
    {
      value: "La excelencia en el servicio público, no la mediocridad",
      location: "Bahía Blanca, Argentina"
    },
    {
      value: "La solidaridad intergeneracional para construir el futuro",
      location: "Bariloche, Argentina"
    },
    {
      value: "La creatividad y el pensamiento crítico como herramientas de cambio",
      location: "Mar del Plata, Argentina"
    },
    {
      value: "La unidad en la diversidad como fuerza de la nación",
      location: "Ushuaia, Argentina"
    }
  ],
  
  needs: [
    {
      need: "Necesitamos un sistema educativo que prepare a los jóvenes para el futuro, no para el pasado",
      location: "Buenos Aires, Argentina"
    },
    {
      need: "Urge una reforma del sistema de salud que priorice la prevención sobre el tratamiento",
      location: "Córdoba, Argentina"
    },
    {
      need: "Requerimos una economía que genere empleo de calidad y reduzca la desigualdad",
      location: "Rosario, Argentina"
    },
    {
      need: "Necesitamos transparencia total en el gasto público y rendición de cuentas real",
      location: "Mendoza, Argentina"
    },
    {
      need: "Urge un sistema judicial que funcione con rapidez y sin corrupción",
      location: "La Plata, Argentina"
    },
    {
      need: "Requerimos políticas que retengan el talento joven en el país",
      location: "Tucumán, Argentina"
    },
    {
      need: "Necesitamos inversión masiva en investigación y desarrollo tecnológico",
      location: "Santa Fe, Argentina"
    },
    {
      need: "Urge una reforma del sistema político que elimine la corrupción estructural",
      location: "Salta, Argentina"
    },
    {
      need: "Requerimos una cultura organizacional que valore la colaboración",
      location: "Neuquén, Argentina"
    },
    {
      need: "Necesitamos un sistema de meritocracia real en el sector público",
      location: "Bahía Blanca, Argentina"
    },
    {
      need: "Urge protección real del medio ambiente y desarrollo sostenible",
      location: "Bariloche, Argentina"
    },
    {
      need: "Requerimos una educación que enseñe a pensar, no solo a repetir",
      location: "Mar del Plata, Argentina"
    },
    {
      need: "Necesitamos políticas que integren a todas las regiones del país",
      location: "Ushuaia, Argentina"
    }
  ],
  
  bastas: [
    {
      basta: "¡BASTA! de aceptar la corrupción como algo normal",
      location: "Buenos Aires, Argentina"
    },
    {
      basta: "¡BASTA! de postergar nuestros sueños por miedo al cambio",
      location: "Córdoba, Argentina"
    },
    {
      basta: "¡BASTA! de esperar que otros cambien primero",
      location: "Rosario, Argentina"
    },
    {
      basta: "¡BASTA! de naturalizar la violencia y la deshumanización",
      location: "Mendoza, Argentina"
    },
    {
      basta: "¡BASTA! de la indiferencia ante el sufrimiento ajeno",
      location: "La Plata, Argentina"
    },
    {
      basta: "¡BASTA! de resignarnos a la mediocridad",
      location: "Tucumán, Argentina"
    },
    {
      basta: "¡BASTA! de contaminar nuestro hogar común",
      location: "Santa Fe, Argentina"
    },
    {
      basta: "¡BASTA! de creer que solos no podemos",
      location: "Salta, Argentina"
    },
    {
      basta: "¡BASTA! de la trampa del sálvese quien pueda",
      location: "Neuquén, Argentina"
    },
    {
      basta: "¡BASTA! de normalizar que la justicia no llegue",
      location: "Bahía Blanca, Argentina"
    },
    {
      basta: "¡BASTA! de tratar la educación como un gasto y no una inversión",
      location: "Bariloche, Argentina"
    },
    {
      basta: "¡BASTA! de dividirnos entre argentinos",
      location: "Ushuaia, Argentina"
    }
  ]
};

const DataPopulator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentItem, setCurrentItem] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const populateData = async () => {
    setIsLoading(true);
    setStatus('loading');
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    
    const allData = [
      ...HOMBRE_GRIS_DATA.dreams.map(item => ({ ...item, type: 'dream' })),
      ...HOMBRE_GRIS_DATA.values.map(item => ({ ...item, type: 'value' })),
      ...HOMBRE_GRIS_DATA.needs.map(item => ({ ...item, type: 'need' })),
      ...HOMBRE_GRIS_DATA.bastas.map(item => ({ ...item, type: 'basta' }))
    ];
    
    for (let i = 0; i < allData.length; i++) {
      const item = allData[i];
      const progressPercent = Math.round(((i + 1) / allData.length) * 100);
      
      setProgress(progressPercent);
      setCurrentItem(`${item.type} ${i + 1}/${allData.length}`);
      
      try {
        const response = await fetch('/api/dreams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });
        
        if (response.ok) {
          setSuccessCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
          console.error(`Error agregando ${item.type}: ${response.statusText}`);
        }
      } catch (error) {
        setErrorCount(prev => prev + 1);
        console.error(`Error en ${item.type}:`, error);
      }
      
      // Pequeño delay para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsLoading(false);
    setStatus(errorCount === 0 ? 'success' : 'error');
    setCurrentItem('');
    
    // Reset status after 5 seconds
    setTimeout(() => {
      setStatus('idle');
      setProgress(0);
    }, 5000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dream': return <Sparkles className="w-4 h-4" />;
      case 'value': return <Heart className="w-4 h-4" />;
      case 'need': return <AlertTriangle className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dream': return 'text-blue-600';
      case 'value': return 'text-pink-600';
      case 'need': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="mb-8 border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-gray-800">
              Poblar con Datos del Hombre Gris
            </CardTitle>
            <CardDescription className="text-lg">
              Agrega 39 contribuciones auténticas para activar la nube de palabras
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Estadísticas por tipo */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-xl border shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-700">Sueños</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{HOMBRE_GRIS_DATA.dreams.length}</div>
              <div className="text-sm text-gray-500">Aspiraciones</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl border shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="font-semibold text-gray-700">Valores</span>
              </div>
              <div className="text-3xl font-bold text-pink-600">{HOMBRE_GRIS_DATA.values.length}</div>
              <div className="text-sm text-gray-500">Principios</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl border shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-gray-700">Necesidades</span>
              </div>
              <div className="text-3xl font-bold text-amber-600">{HOMBRE_GRIS_DATA.needs.length}</div>
              <div className="text-sm text-gray-500">Urgencias</div>
            </div>
          </div>
          
          {/* Botón de poblamiento */}
          <div className="text-center">
            <Button
              onClick={populateData}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Poblando datos...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mr-3" />
                  Poblar Sistema
                </>
              )}
            </Button>
          </div>
          
          {/* Barra de progreso */}
          {isLoading && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {currentItem && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">
                    {currentItem}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Estado final */}
          {status === 'success' && (
            <div className="flex items-center justify-center gap-3 p-6 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="text-center">
                <p className="text-green-800 font-semibold text-lg">
                  ¡Datos poblados exitosamente!
                </p>
                <p className="text-green-700">
                  {successCount} contribuciones agregadas. La nube de palabras se actualizará automáticamente.
                </p>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center justify-center gap-3 p-6 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div className="text-center">
                <p className="text-red-800 font-semibold text-lg">
                  Hubo algunos errores
                </p>
                <p className="text-red-700">
                  {successCount} exitosos, {errorCount} errores. Revisa la consola para más detalles.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataPopulator;

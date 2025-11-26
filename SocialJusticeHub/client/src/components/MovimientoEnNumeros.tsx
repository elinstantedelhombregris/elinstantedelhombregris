import { useQuery } from '@tanstack/react-query';
import { 
  Star, 
  Heart, 
  AlertCircle, 
  Users,
  Globe,
  MapPin
} from 'lucide-react';

interface Dream {
  id: number;
  userId: number | null;
  dream: string | null;
  value: string | null;
  need: string | null;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
  createdAt: Date;
  type: 'dream' | 'value' | 'need';
}

const MovimientoEnNumeros = () => {
  const { data: dreams = [], isLoading } = useQuery<Dream[]>({
    queryKey: ['/api/dreams'],
  });

  // Calcular estadísticas reales
  const stats = {
    dreams: dreams.filter(d => d.type === 'dream').length,
    values: dreams.filter(d => d.type === 'value').length,
    needs: dreams.filter(d => d.type === 'need').length,
    locations: new Set(dreams.filter(d => d.location).map(d => d.location)).size,
    totalParticipants: new Set(dreams.filter(d => d.userId).map(d => d.userId)).size,
    totalContributions: dreams.length
  };

  const statCards = [
    {
      number: isLoading ? '...' : stats.dreams.toString(),
      label: "Sueños Compartidos",
      icon: <Star className="w-6 h-6" />,
      description: "Cada sueño es una semilla de cambio",
      color: "from-blue-500 to-blue-600"
    },
    {
      number: isLoading ? '...' : stats.values.toString(),
      label: "Valores Expresados",
      icon: <Heart className="w-6 h-6" />,
      description: "Los principios que nos guían",
      color: "from-pink-500 to-pink-600"
    },
    {
      number: isLoading ? '...' : stats.needs.toString(),
      label: "Necesidades Identificadas",
      icon: <AlertCircle className="w-6 h-6" />,
      description: "Escuchamos lo que Argentina necesita",
      color: "from-amber-500 to-amber-600"
    },
    {
      number: isLoading ? '...' : stats.locations.toString(),
      label: "Localidades Representadas",
      icon: <MapPin className="w-6 h-6" />,
      description: "Desde toda Argentina",
      color: "from-green-500 to-green-600"
    },
    {
      number: isLoading ? '...' : stats.totalParticipants.toString(),
      label: "Argentinos Participando",
      icon: <Users className="w-6 h-6" />,
      description: "Cada voz cuenta",
      color: "from-purple-500 to-purple-600"
    },
    {
      number: isLoading ? '...' : stats.totalContributions.toString(),
      label: "Contribuciones Totales",
      icon: <Globe className="w-6 h-6" />,
      description: "Construyendo juntos el cambio",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="relative">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl opacity-50"></div>
      
      <div className="relative bg-gradient-to-br from-blue-600/95 via-indigo-600/95 to-purple-600/95 text-white rounded-3xl p-8 md:p-12 shadow-2xl border border-blue-400/20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <p className="text-sm font-semibold">📊 Datos en Tiempo Real</p>
          </div>
          <h3 className="text-3xl md:text-5xl font-bold mb-4 font-serif">
            El Movimiento en Números
          </h3>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Cada número representa una persona que decidió que <strong className="text-yellow-300">¡BASTA!</strong> y se comprometió con el cambio.
          </p>
          <p className="text-lg opacity-75 mt-2">
            Estos son los datos reales del mapa de sueños, valores y necesidades.
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {statCards.map((stat, index) => (
            <div
              key={index} 
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border-2 border-transparent hover:border-yellow-300"
            >
              {/* Top: Icon and Number */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                </div>
              </div>
              
              {/* Bottom: Label and Description */}
              <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {stat.label}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        {!isLoading && stats.totalContributions > 0 && (
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl animate-bounce">🌱</span>
              <p className="text-2xl md:text-3xl font-bold">
                El árbol del cambio está creciendo
              </p>
            </div>
            <p className="text-lg md:text-xl opacity-95 leading-relaxed max-w-3xl mx-auto">
              Cada contribución alimenta las raíces de un nuevo país. Juntos estamos construyendo 
              la Argentina que siempre supimos posible: <strong>próspera, justa y amable</strong>.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="mt-4 text-lg opacity-75">Cargando datos del movimiento...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovimientoEnNumeros;


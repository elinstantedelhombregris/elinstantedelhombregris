import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';

type CommunityPost = {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string;
  participants: number;
};

const postTypeColors = {
  'project': {
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  'employment': {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  'exchange': {
    bg: 'bg-purple-100',
    text: 'text-purple-800'
  },
  'volunteer': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800'
  },
  'donation': {
    bg: 'bg-pink-100',
    text: 'text-pink-800'
  }
};

const postTypeLabels: Record<string, string> = {
  'project': 'Proyecto',
  'employment': 'Empleo',
  'exchange': 'Trueque',
  'volunteer': 'Voluntariado',
  'donation': 'Donación'
};

const backgroundImages = [
  'https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560252829-804f1aedf1be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
];

const CommunityInAction = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Fetch community posts
  const { data: posts = [] } = useQuery<CommunityPost[]>({
    queryKey: ['/api/community', activeFilter],
    staleTime: 60000, // 1 minute
  });
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };
  
  const filterOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'employment', label: 'Empleo' },
    { id: 'exchange', label: 'Trueque' },
    { id: 'volunteer', label: 'Voluntariado' },
    { id: 'project', label: 'Proyectos' },
    { id: 'donation', label: 'Donaciones' }
  ];

  return (
    <section id="comunidad" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Comunidad en acción</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-['Lora']">
            Conectate con personas que comparten tus valores y visión. Ofrece tus habilidades, 
            encuentra oportunidades o crea iniciativas en tu comunidad.
          </p>
        </div>
        
        {/* Filter tabs */}
        <div className="flex overflow-x-auto mb-8 pb-2 scrollbar-hide">
          {filterOptions.map((option) => (
            <Button 
              key={option.id}
              onClick={() => handleFilterChange(option.id)}
              className={`flex-shrink-0 mr-3 ${
                activeFilter === option.id 
                  ? 'bg-[hsl(var(--primary))] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              variant={activeFilter === option.id ? 'default' : 'outline'}
            >
              {option.label}
            </Button>
          ))}
        </div>
        
        {/* Community listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length > 0 ? (
            posts.slice(0, 3).map((post: CommunityPost, index: number) => (
              <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div 
                  className="h-48 bg-cover bg-center" 
                  style={{ backgroundImage: `url('${backgroundImages[index % backgroundImages.length]}')` }}
                ></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-3 py-1 ${postTypeColors[post.type as keyof typeof postTypeColors].bg} ${postTypeColors[post.type as keyof typeof postTypeColors].text} rounded-full text-xs font-semibold`}>
                      {postTypeLabels[post.type] || post.type}
                    </span>
                    <span className="text-sm text-gray-500">{post.location}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{post.description}</p>
                  <div className="flex justify-between items-center">
                    <button className="text-[hsl(var(--primary))] hover:underline font-semibold">Ver detalles</button>
                    <span className="text-sm text-gray-500">{post.participants} {post.participants === 1 ? 'persona' : 'personas'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Sample placeholders when no data is available
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div 
                  className="h-48 bg-cover bg-center bg-gray-200"
                ></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                      {filterOptions[index + 1]?.label || 'Categoría'}
                    </span>
                    <span className="text-sm text-gray-500">Argentina</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Sé el primero en compartir</h3>
                  <p className="text-gray-600 mb-4 text-sm">Puedes crear una iniciativa para tu comunidad y conectar con otros.</p>
                  <div className="flex justify-between items-center">
                    <button className="text-[hsl(var(--primary))] hover:underline font-semibold">Crear iniciativa</button>
                    <span className="text-sm text-gray-500">0 personas</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Button className="bg-[hsl(var(--secondary))] hover:bg-brown-700 text-white font-semibold py-3 px-8 rounded-md transition mr-4">
            Ver más oportunidades
          </Button>
          <Button variant="outline" className="border border-[hsl(var(--secondary))] text-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))] hover:text-white font-semibold py-3 px-8 rounded-md transition">
            Crear una iniciativa
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityInAction;

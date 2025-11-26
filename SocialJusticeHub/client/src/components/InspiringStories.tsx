import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type Story = {
  id: number;
  name: string;
  location: string;
  story: string;
  imageUrl?: string;
};

const defaultImages = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
];

const InspiringStories = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Fetch stories from API
  const { data: stories = [] } = useQuery<Story[]>({
    queryKey: ['/api/stories'],
    staleTime: 60000, // 1 minute
  });
  
  const handleScrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Placeholder data if no stories are available
  const displayStories: Story[] = stories.length > 0 ? stories : [
    {
      id: 1,
      name: 'Laura Méndez',
      location: 'Rosario, Santa Fe',
      story: 'Empecé una red de apoyo escolar que conecta estudiantes universitarios con chicos de barrios vulnerables. Ya somos más de 50 voluntarios y ayudamos a 200 chicos.',
      imageUrl: defaultImages[0]
    },
    {
      id: 2,
      name: 'Martín Rodríguez',
      location: 'Bariloche, Río Negro',
      story: 'Transformamos un basural en una plaza comunitaria con juegos para niños. La clave fue organizar a los vecinos y trabajar con el municipio. Ahora es nuestro orgullo.',
      imageUrl: defaultImages[1]
    },
    {
      id: 3,
      name: 'Carolina Sánchez',
      location: 'San Salvador de Jujuy',
      story: 'Fundé una cooperativa textil que rescata técnicas ancestrales y da trabajo a 15 mujeres. Exportamos a Europa y cada prenda cuenta una historia de nuestra cultura.',
      imageUrl: defaultImages[2]
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Historias que inspiran</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-['Lora']">
            Conocé a las personas que ya están transformando sus comunidades con acciones concretas y decididas.
          </p>
        </div>
        
        {/* Navigation buttons for slider */}
        <div className="flex justify-end mb-4 gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            onClick={handleScrollLeft}
          >
            <ChevronRight className="h-4 w-4 transform rotate-180" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            onClick={handleScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Testimonial slider */}
        <div ref={sliderRef} className="slider-container py-4 -mx-4 px-4">
          <div className="flex space-x-6">
            {displayStories.map((story, index) => (
              <div 
                key={story.id} 
                className="flex-shrink-0 w-full md:w-96 bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9 relative">
                  <div 
                    className="h-56 bg-cover bg-center" 
                    style={{ backgroundImage: `url('${story.imageUrl || defaultImages[index % defaultImages.length]}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-xl">{story.name}</h3>
                    <p className="text-gray-200 text-sm">{story.location}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 italic mb-4">"{story.story}"</p>
                  <a href="#" className="text-[hsl(var(--primary))] hover:underline font-semibold flex items-center">
                    Ver su historia completa
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <Button className="bg-[hsl(var(--accent))] hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-md transition">
            Compartí tu historia
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InspiringStories;

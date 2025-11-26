import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

interface RelatedPage {
  title: string;
  description: string;
  href: string;
  color: string;
  icon?: React.ReactNode;
}

interface RelatedPagesProps {
  pages: RelatedPage[];
  title?: string;
}

const RelatedPages = ({ 
  pages, 
  title = "Páginas Relacionadas" 
}: RelatedPagesProps) => {
  return (
    <section className="section-spacing bg-white">
      <div className="container-content">
        <div className="max-content-width">
          <div className="text-center mb-12">
            <h2 className="heading-section text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto">
              Descubrí más contenido relacionado con esta temática
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page, index) => (
              <Link key={index} href={page.href}>
                <div className={`card-unified-light hover-lift cursor-pointer h-full flex flex-col ${page.color}`}>
                  <div className="p-6 flex flex-col h-full">
                    {page.icon && (
                      <div className="mb-4 text-gray-600">
                        {page.icon}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {page.title}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-grow text-sm">
                      {page.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-semibold mt-auto">
                      <span className="text-sm">Explorar</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RelatedPages;

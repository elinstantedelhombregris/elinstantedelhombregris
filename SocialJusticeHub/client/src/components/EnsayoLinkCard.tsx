import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { ensayos } from '@/content/ensayos.generated';

interface Props {
  slug: string;
}

const EnsayoLinkCard = ({ slug }: Props) => {
  const ensayo = ensayos.find((e) => e.slug === slug);
  if (!ensayo) return null;
  return (
    <Link href={`/recursos/ensayos/${ensayo.slug}`}>
      <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-5 hover:border-amber-300/30 transition-colors cursor-pointer group h-full">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-amber-300/70">Ensayo {String(ensayo.order).padStart(2, '0')}</p>
            <h4 className="font-serif text-lg leading-snug text-mist-white">{ensayo.title}</h4>
            <p className="text-sm text-mist-white/60 line-clamp-2">{ensayo.opening}</p>
          </div>
          <ArrowRight className="w-4 h-4 mt-2 text-amber-300/70 group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
};

export default EnsayoLinkCard;

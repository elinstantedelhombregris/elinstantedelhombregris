import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowUpRight, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { buildBlogPostPath, normalizeBlogReadTime } from '@shared/blog-seo';
import { getCategoryColorDark } from '@/lib/editorial';

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  type: 'blog' | 'vlog';
  imageUrl?: string;
  publishedAt: string;
}

interface RelatedPostsProps {
  category: string;
  currentPostId: number;
}

export default function RelatedPosts({ category, currentPostId }: RelatedPostsProps) {
  const { data } = useQuery<RelatedPost[]>({
    queryKey: ['related-posts', category, currentPostId],
    queryFn: async () => {
      const params = new URLSearchParams({ page: '1', limit: '6', category });
      const response = await apiRequest('GET', `/api/blog/posts?${params}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const related = (data || []).filter((p) => p.id !== currentPostId).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-center gap-4">
        <h2 className="font-serif text-2xl font-bold text-slate-100">Seguí leyendo</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-400/40 to-transparent" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <Link key={post.id} href={buildBlogPostPath(post)}>
            <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(125,91,222,0.10)]">
              {post.imageUrl && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <span className={`mb-3 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${getCategoryColorDark(post.category)}`}>
                  {post.category}
                </span>
                <h3 className="mb-2 font-serif text-lg font-bold leading-snug text-slate-100 transition-colors group-hover:text-white">
                  {post.title}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                    {normalizeBlogReadTime(post.content)} min lectura
                  </span>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:text-violet-400" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

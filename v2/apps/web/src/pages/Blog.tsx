import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

import { api } from '~/lib/api';

interface BlogListItem {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  likeCount: number;
  viewCount: number;
  commentCount: number;
}

type BlogResponse = BlogListItem[];

export function Blog() {
  const postsQuery = useQuery<BlogResponse>({
    queryKey: ['blog', 'posts'],
    queryFn: () => api.get<BlogResponse>('/api/blog/posts'),
  });

  const posts = postsQuery.data ?? [];

  return (
    <main className="container mx-auto max-w-4xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Blog · Vlog</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          <span className="gradient-text">Lo que vamos pensando juntos.</span>
        </h1>
      </header>

      {postsQuery.isLoading ? (
        <p className="text-center font-mono text-sm text-muted-foreground">cargando…</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Todavía no hay posts publicados. Pronto.
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="glass block rounded-2xl p-6 transition-colors hover:border-iris-violet/50"
              >
                <h2 className="font-serif text-2xl font-semibold">{post.title}</h2>
                {post.summary ? (
                  <p className="mt-2 line-clamp-3 text-foreground/80">{post.summary}</p>
                ) : null}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  {post.publishedAt ? (
                    <span>{new Date(post.publishedAt).toLocaleDateString('es-AR')}</span>
                  ) : null}
                  <span>♥ {post.likeCount}</span>
                  <span>👁 {post.viewCount}</span>
                  <span>💬 {post.commentCount}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default Blog;

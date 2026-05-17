import { Link } from 'wouter';

import { BLOG_POSTS } from '~/lib/blog-registry';

export function Blog() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Blog · Vlog</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          <span className="gradient-text">Lo que vamos pensando juntos.</span>
        </h1>
      </header>

      {BLOG_POSTS.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Todavía no hay posts publicados. Pronto.
        </p>
      ) : (
        <ul className="space-y-4">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="glass block rounded-2xl p-6 transition-colors hover:border-iris-violet/50"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-2xl font-semibold">{post.title}</h2>
                  {post.readingMinutes > 0 ? (
                    <p className="font-mono text-xs text-muted-foreground">
                      {post.readingMinutes} min
                    </p>
                  ) : null}
                </div>
                {post.summary ? (
                  <p className="mt-2 line-clamp-3 text-foreground/80">{post.summary}</p>
                ) : null}
                {post.publishedAt ? (
                  <p className="mt-4 font-mono text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default Blog;

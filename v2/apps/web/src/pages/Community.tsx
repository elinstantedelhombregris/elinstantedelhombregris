import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/lib/api';
import { readCsrfToken, useAuth } from '~/lib/auth';

interface CommunityPost {
  id: number;
  userId: number;
  title: string;
  content: string;
  kind: string;
  status: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  createdAt: string;
}

interface ListResponse {
  posts: CommunityPost[];
}

export function Community() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const postsQuery = useQuery<ListResponse>({
    queryKey: ['community', 'posts'],
    queryFn: () => api.get<ListResponse>('/api/community/posts'),
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post('/api/community/posts', { title, content, kind: 'discussion' }, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      setTitle('');
      setContent('');
      void queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (id: number) =>
      api.post(`/api/community/posts/${String(id)}/like`, undefined, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });

  const posts = postsQuery.data?.posts ?? [];

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Comunidad</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">El feed comunitario</h1>
        <p className="mt-3 text-muted-foreground">
          Discusiones, anuncios, eventos, preguntas. Lo que está pensando la red.
        </p>
      </header>

      {user ? (
        <section className="glass mb-10 rounded-2xl p-6">
          <h2 className="mb-4 font-serif text-xl font-semibold">Publicar algo</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim() && content.trim()) createMutation.mutate();
            }}
          >
            <div>
              <Label htmlFor="post-title">Título</Label>
              <Input
                id="post-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                required
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="post-content">Contenido</Label>
              <textarea
                id="post-content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
                placeholder="Lo que querés compartir con la red…"
                className="min-h-[100px] w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={10_000}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending || !title.trim() || !content.trim()}
              className="w-full"
            >
              {createMutation.isPending ? 'Publicando…' : 'Publicar'}
            </Button>
          </form>
        </section>
      ) : (
        <p className="mb-10 text-center text-sm text-muted-foreground">
          <Link href="/ingresar" className="text-iris-violet hover:underline">Ingresá</Link> para publicar y reaccionar.
        </p>
      )}

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">Feed ({posts.length})</h2>
        {postsQuery.isLoading ? (
          <p className="font-mono text-sm text-muted-foreground">cargando…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">El feed está callado por ahora. Empezá vos.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-mono text-xs uppercase tracking-widest text-iris-violet">{post.kind}</p>
                    <h3 className="mt-1 font-serif text-lg font-semibold">{post.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{post.content}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!user || likeMutation.isPending}
                    onClick={() => {
                      likeMutation.mutate(post.id);
                    }}
                  >
                    ♥ {post.likeCount}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Community;

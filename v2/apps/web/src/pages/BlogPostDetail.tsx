import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useRoute } from 'wouter';

import { MdxContent } from '~/components/MdxContent';
import { Button } from '~/components/ui/button';
import { api } from '~/lib/api';
import { readCsrfToken, useAuth } from '~/lib/auth';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  likeCount: number;
  commentCount: number;
}

interface PostResponse {
  post: BlogPost;
  tags: string[];
}

interface Comment {
  id: number;
  postId: number;
  userId: number;
  parentId: number | null;
  body: string;
  createdAt: string;
}

interface CommentsResponse {
  comments: Comment[];
}

export function BlogPostDetail() {
  const [match, params] = useRoute<{ slug: string }>('/blog/:slug');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [draft, setDraft] = useState('');

  const postQuery = useQuery<PostResponse>({
    queryKey: ['blog', 'post', params?.slug ?? ''],
    queryFn: () => api.get<PostResponse>(`/api/blog/posts/${params?.slug ?? ''}`),
    enabled: Boolean(params?.slug),
  });

  const postId = postQuery.data?.post.id;

  const commentsQuery = useQuery<CommentsResponse>({
    queryKey: ['blog', 'post', postId, 'comments'],
    queryFn: () => api.get<CommentsResponse>(`/api/blog/posts/${String(postId)}/comments`),
    enabled: postId !== undefined,
  });

  const likeMutation = useMutation({
    mutationFn: async () => api.post(`/api/blog/posts/${String(postId)}/like`, undefined, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog', 'post', params?.slug ?? ''] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => api.post(`/api/blog/posts/${String(postId)}/comments`, { body: draft }, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      setDraft('');
      void queryClient.invalidateQueries({ queryKey: ['blog', 'post', postId, 'comments'] });
    },
  });

  if (!match) return null;
  if (postQuery.isLoading) return <p className="container mx-auto max-w-md px-4 py-24 text-center font-mono text-sm text-muted-foreground">cargando…</p>;
  if (postQuery.isError || !postQuery.data) {
    return (
      <main className="container mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold">Post no encontrado.</h1>
        <Button asChild className="mt-6">
          <Link href="/blog">Volver al blog</Link>
        </Button>
      </main>
    );
  }

  const { post, tags } = postQuery.data;
  const comments = commentsQuery.data?.comments ?? [];

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold leading-tight">{post.title}</h1>
        {post.summary ? <p className="mt-3 text-lg text-muted-foreground">{post.summary}</p> : null}
        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-iris-violet/10 px-3 py-0.5 text-xs text-iris-violet">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <MdxContent raw={post.content} />

      <div className="mt-10 flex items-center gap-3 border-t border-white/5 pt-6">
        <Button
          size="sm"
          variant="secondary"
          disabled={likeMutation.isPending || !user}
          onClick={() => {
            likeMutation.mutate();
          }}
        >
          ♥ {post.likeCount}
        </Button>
        {!user ? (
          <p className="text-xs text-muted-foreground">
            <Link href="/ingresar" className="text-iris-violet hover:underline">Ingresá</Link> para reaccionar y comentar
          </p>
        ) : null}
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-xl font-semibold">Comentarios</h2>
        {user ? (
          <form
            className="mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) commentMutation.mutate();
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
              }}
              placeholder="Sumá tu comentario…"
              className="min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={4000}
            />
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={commentMutation.isPending || !draft.trim()}>
                {commentMutation.isPending ? 'Enviando…' : 'Enviar'}
              </Button>
            </div>
          </form>
        ) : null}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay comentarios. Sé el primero.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="glass rounded-xl p-4">
                <p className="text-sm text-foreground/85">{c.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString('es-AR')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default BlogPostDetail;

/**
 * BlogAuthor — admin-only page for drafting/publishing blog posts.
 * Mounted at /blog/escribir. The backend gates POST/PATCH to the
 * ADMIN_USERNAMES allow-list; this page just hands the form values
 * to the API and surfaces errors.
 */
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';

import type { ApiError } from '~/lib/api';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/lib/api';
import { readCsrfToken, useAuth } from '~/lib/auth';


interface CreatePostResponse {
  post: { id: number; slug: string };
}

export function BlogAuthor() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [publish, setPublish] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation<CreatePostResponse, ApiError>({
    mutationFn: async () =>
      api.post<CreatePostResponse>(
        '/api/blog/posts',
        {
          slug,
          title,
          summary: summary.trim() || undefined,
          content,
          status: publish ? 'published' : 'draft',
        },
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: (data) => {
      navigate(`/blog/${data.post.slug}`);
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-16">
        <p className="font-mono text-sm text-muted-foreground">cargando…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Necesitás iniciar sesión.</h1>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Editorial
        </p>
        <h1 className="font-serif text-3xl font-semibold">Escribir un post</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Si no sos administrador, el servidor te va a rechazar la publicación. Esta página
          siempre está accesible para no romper enlaces.
        </p>
      </header>

      <form
        className="glass space-y-5 rounded-2xl p-8"
        onSubmit={(e) => {
          e.preventDefault();
          setErrorMessage(null);
          createMutation.mutate();
        }}
      >
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            maxLength={200}
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            placeholder="mi-primer-post"
            pattern="[a-z0-9-]+"
            maxLength={140}
            required
          />
        </div>
        <div>
          <Label htmlFor="summary">Resumen (opcional)</Label>
          <Input
            id="summary"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
            }}
            maxLength={500}
          />
        </div>
        <div>
          <Label htmlFor="content">Contenido (Markdown)</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
            placeholder="# Título&#10;&#10;Texto del post…"
            className="min-h-[320px] w-full rounded-md border border-white/10 bg-white/5 p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => {
              setPublish(e.target.checked);
            }}
            className="h-4 w-4"
          />
          Publicar inmediatamente (sin marcar = borrador).
        </label>
        {errorMessage ? (
          <p role="alert" className="text-sm text-red-400">
            {errorMessage}
          </p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending} className="w-full">
          {createMutation.isPending ? 'Guardando…' : publish ? 'Publicar post' : 'Guardar borrador'}
        </Button>
      </form>
    </main>
  );
}

export default BlogAuthor;

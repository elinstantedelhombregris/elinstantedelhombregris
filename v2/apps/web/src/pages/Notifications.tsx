import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';
import { api } from '~/lib/api';
import { readCsrfToken, RequireAuth } from '~/lib/auth';

interface Notification {
  id: number;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

interface ListResponse {
  notifications: Notification[];
}

function NotificationsInner() {
  const queryClient = useQueryClient();
  const listQuery = useQuery<ListResponse>({
    queryKey: ['notifications'],
    queryFn: () => api.get<ListResponse>('/api/notifications'),
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => api.post(`/api/notifications/${String(id)}/read`, undefined, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => api.post('/api/notifications/read-all', undefined, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = listQuery.data?.notifications ?? [];
  const hasUnread = notifications.some((n) => n.readAt === null);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <header className="mb-8 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Notificaciones</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">Tu actividad reciente</h1>
        </div>
        {hasUnread ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={markAllMutation.isPending}
            onClick={() => {
              markAllMutation.mutate();
            }}
          >
            Marcar todas como leídas
          </Button>
        ) : null}
      </header>

      {listQuery.isLoading ? (
        <p className="font-mono text-sm text-muted-foreground">cargando…</p>
      ) : notifications.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Por ahora no tenés notificaciones. Cuando pase algo nuevo aparecerá acá.
        </p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`glass rounded-xl p-4 transition-colors ${
                n.readAt === null ? 'border-iris-violet/40 bg-iris-violet/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-mono text-xs uppercase tracking-widest text-iris-violet">{n.kind}</p>
                  {n.href ? (
                    <Link href={n.href} className="block">
                      <h3 className="mt-1 font-medium hover:underline">{n.title}</h3>
                    </Link>
                  ) : (
                    <h3 className="mt-1 font-medium">{n.title}</h3>
                  )}
                  {n.body ? <p className="mt-1 text-sm text-foreground/80">{n.body}</p> : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString('es-AR')}
                  </p>
                </div>
                {n.readAt === null ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      markReadMutation.mutate(n.id);
                    }}
                  >
                    Marcar leída
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export function Notifications() {
  return (
    <RequireAuth>
      <NotificationsInner />
    </RequireAuth>
  );
}

export default Notifications;

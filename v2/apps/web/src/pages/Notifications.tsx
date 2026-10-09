import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';

import { Kicker } from '~/components/papel/primitives';
import { BotonAccion } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { readCsrfToken, RequireAuth } from '~/lib/auth';
import { cn } from '~/lib/utils';

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
    mutationFn: async (id: number) =>
      api.post(`/api/notifications/${String(id)}/read`, undefined, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () =>
      api.post('/api/notifications/read-all', undefined, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = listQuery.data?.notifications ?? [];
  const hasUnread = notifications.some((n) => n.readAt === null);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>Notificaciones</Kicker>
          <h1 className="font-anton text-tinta mt-2 text-4xl">Tu actividad reciente</h1>
        </div>
        {hasUnread ? (
          <BotonAccion
            type="button"
            tono="papel"
            ocupado={markAllMutation.isPending}
            onClick={() => {
              markAllMutation.mutate();
            }}
          >
            Marcar todas como leídas
          </BotonAccion>
        ) : null}
      </header>

      {listQuery.isLoading ? (
        <p role="status" className="font-space text-tinta-75 text-sm">
          cargando…
        </p>
      ) : notifications.length === 0 ? (
        <p className="text-tinta-75">
          Por ahora no tenés notificaciones. Cuando pase algo nuevo aparecerá acá.
        </p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                'bg-papel-crudo border p-4',
                n.readAt === null ? 'border-violeta' : 'border-papel-borde',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Kicker>{n.kind}</Kicker>
                  {n.href ? (
                    <Link href={n.href} className="hover:text-violeta block">
                      <h2 className="mt-1 font-medium underline-offset-4 hover:underline">
                        {n.title}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className="mt-1 font-medium">{n.title}</h2>
                  )}
                  {n.body ? <p className="text-tinta-75 mt-1 text-sm">{n.body}</p> : null}
                  <p className="text-tinta-75 mt-2 text-xs">
                    {new Date(n.createdAt).toLocaleString('es-AR')}
                  </p>
                </div>
                {n.readAt === null ? (
                  <BotonAccion
                    type="button"
                    tono="papel"
                    className="px-4 py-2"
                    onClick={() => {
                      markReadMutation.mutate(n.id);
                    }}
                  >
                    Marcar leída
                  </BotonAccion>
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
    <RequireAuth superficie="papel">
      <NotificationsInner />
    </RequireAuth>
  );
}

export default Notifications;

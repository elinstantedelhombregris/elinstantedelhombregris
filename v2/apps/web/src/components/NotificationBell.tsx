/**
 * NotificationBell — header widget that polls /api/notifications/unread-count
 * every 30s when authenticated. The bell is always visible; the badge
 * only renders when count > 0.
 */
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Link } from 'wouter';

import { ApiError, api } from '~/lib/api';

interface UnreadCountResponse {
  count: number;
}

async function fetchUnreadCount(): Promise<number> {
  try {
    const result = await api.get<UnreadCountResponse>('/api/notifications/unread-count');
    return result.count;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return 0;
    throw err;
  }
}

interface NotificationBellProps {
  /** Pass false to hide entirely (e.g. when the user isn't authed). */
  enabled: boolean;
}

export function NotificationBell({ enabled }: NotificationBellProps) {
  const query = useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    retry: false,
    enabled,
  });

  if (!enabled) return null;
  const count = query.data ?? 0;

  return (
    <Link
      href="/notificaciones"
      aria-label={count > 0 ? `${String(count)} notificaciones sin leer` : 'Notificaciones'}
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
    >
      <Bell className="h-4 w-4" />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-iris-violet px-1 text-[10px] font-medium text-white"
        >
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  );
}

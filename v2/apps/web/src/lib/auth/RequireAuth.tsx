import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';

import { useAuth } from './use-auth';

interface RequireAuthProps {
  children: ReactNode;
  /** Where to redirect when not authenticated. Defaults to /ingresar. */
  redirectTo?: string;
}

/**
 * Wrap a route's element with this to require an authenticated user.
 *
 * While the auth status is loading, renders a quiet placeholder so
 * we don't flash a redirect.
 */
export function RequireAuth({ children, redirectTo = '/ingresar' }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(redirectTo, { replace: true });
    }
  }, [isLoading, user, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="font-mono text-sm text-muted-foreground">verificando sesión…</span>
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}

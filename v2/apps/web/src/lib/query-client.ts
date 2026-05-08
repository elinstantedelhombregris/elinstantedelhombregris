import { QueryClient } from '@tanstack/react-query';

/**
 * App-wide React Query client.
 *
 * Defaults match the v1 product (staleTime: Infinity, retry: false,
 * refetchOnWindowFocus: false) so reads are deterministic and we don't
 * burn the user's data refreshing on focus.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

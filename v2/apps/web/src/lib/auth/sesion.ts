import type { AuthenticatedUser } from './types';
import type { QueryClient } from '@tanstack/react-query';


const ME_KEY = ['auth', 'me'] as const;

/** Las cookies ya cambiaron; ninguna lectura de la sesión anterior debe sobrevivir. */
export async function adoptarSesion(client: QueryClient, user: AuthenticatedUser | null) {
  await client.cancelQueries();
  void client.resetQueries({
    predicate: (q) => !(q.queryKey[0] === 'auth' && q.queryKey[1] === 'me'),
  });
  client.getMutationCache().clear();
  client.setQueryData(ME_KEY, user);
}

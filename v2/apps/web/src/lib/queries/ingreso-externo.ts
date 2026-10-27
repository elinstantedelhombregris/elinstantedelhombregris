/**
 * Entrar con proveedores externos (ADR 0012): qué proveedores hay, el «Último paso» de quien
 * llega nuevo con Google y cómo entra la cuenta con sesión.
 *
 * La ida a Google es una navegación común (`hrefGoogle`), no un pedido: la API arma el estado
 * y redirige. Por eso no hay mutación para entrar.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  AltaConProveedorInput,
  AltaPendiente,
  ErrorDeIngresoExterno,
  IngresoDeLaCuenta,
  ProveedoresDeIngreso,
} from '@v2/shared';
import type { AuthenticatedUser } from '~/lib/auth/types';

import { api } from '~/lib/api';
import { adoptarSesion } from '~/lib/auth/sesion';
import { useAuth } from '~/lib/auth/use-auth';

/** El texto de cada `?error=` con el que la API devuelve a `/ingresar`. */
export const MENSAJES_DE_INGRESO_EXTERNO: Record<ErrorDeIngresoExterno, string> = {
  google_cancelado:
    'Cancelaste el ingreso con Google. Podés probar de nuevo o entrar con tu correo.',
  google_vencido: 'Pasó demasiado tiempo en la página de Google. Probá de nuevo.',
  google_sin_verificar:
    'Google no tiene verificado el correo de esa cuenta. Usá otra cuenta de Google o entrá con tu correo.',
  google_fallo:
    'No pudimos terminar el ingreso con Google. Probá de nuevo en un momento, o entrá con tu correo.',
  google_no_disponible: 'El ingreso con Google no está disponible ahora. Entrá con tu correo.',
  google_otra_cuenta:
    'En Google elegiste una cuenta que no es la de esta sesión. Probá de nuevo con la tuya.',
  cuenta_inactiva: 'Esa cuenta está desactivada.',
};

/** La ida a Google. Con `confirmar`, una cuenta con sesión vuelve a probar que es suya. */
export function hrefGoogle(volver: string, para?: 'confirmar'): string {
  const q = new URLSearchParams({ volver });
  if (para) q.set('para', para);
  return `/api/auth/google?${q.toString()}`;
}

export function useProveedores() {
  return useQuery({
    queryKey: ['auth', 'proveedores'],
    queryFn: () => api.get<ProveedoresDeIngreso>('/api/auth/proveedores'),
    retry: false,
  });
}

export function useAltaPendiente() {
  return useQuery({
    queryKey: ['auth', 'alta-pendiente'],
    queryFn: () => api.get<AltaPendiente>('/api/auth/google/alta'),
    retry: false,
    staleTime: 0,
  });
}

export function useCompletarAlta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: AltaConProveedorInput) =>
      api.post<{ user: AuthenticatedUser; csrfToken: string; volver: string }>(
        '/api/auth/google/alta',
        datos,
      ),
    onSuccess: async (r) => {
      await adoptarSesion(qc, r.user);
    },
  });
}

/** Cómo entra la cuenta con sesión: si tiene contraseña y con qué proveedores. */
export function useIngresoDeLaCuenta() {
  const auth = useAuth();
  return useQuery({
    queryKey: ['mi-espacio', 'ingreso', auth.user?.id ?? null],
    enabled: Boolean(auth.user),
    queryFn: () => api.get<IngresoDeLaCuenta>('/api/v1/mi-espacio/ingreso'),
  });
}

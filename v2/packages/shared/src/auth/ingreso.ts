/**
 * Lo que comparten la web y la API sobre entrar a una cuenta: adónde se vuelve después de
 * ingresar y el ingreso con proveedores externos (ADR 0012).
 */

/** Adónde se vuelve si el destino pedido no sirve. */
export const DESTINO_TRAS_INGRESAR = '/mi-espacio';

/** Pantallas a las que no tiene sentido volver después de ingresar. */
const PANTALLAS_DE_INGRESO = ['/ingresar', '/registrarse', '/registrarse/google', '/2fa-desafio'];

/**
 * El destino de vuelta, si es una ruta propia del sitio; si no, Mi espacio. Lo usan la web
 * (con el `volver` de la URL) y la API (que lo guarda antes de mandar a Google).
 */
export function rutaDeVuelta(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.length > 1500)
    return DESTINO_TRAS_INGRESAR;
  try {
    const url = new URL(raw, 'https://basta.invalid');
    if (url.origin !== 'https://basta.invalid' || PANTALLAS_DE_INGRESO.includes(url.pathname))
      return DESTINO_TRAS_INGRESAR;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DESTINO_TRAS_INGRESAR;
  }
}

/** `GET /api/auth/proveedores`: qué proveedores externos ofrece este despliegue. */
export interface ProveedoresDeIngreso {
  google: boolean;
}

/** `GET /api/auth/google/alta`: el alta que espera su «Último paso». */
export interface AltaPendiente {
  correo: string;
  /** Un nombre de usuario libre, armado con el correo. */
  sugerencia: string;
}

/** `GET /api/v1/mi-espacio/ingreso`: cómo entra esta cuenta. */
export interface IngresoDeLaCuenta {
  tieneContrasena: boolean;
  identidades: { proveedor: 'google'; correo: string; creadaEn: string }[];
}

/**
 * Por qué el ingreso con un proveedor volvió a `/ingresar` sin entrar (`?error=`). La web los
 * traduce a un mensaje; la API no manda texto en la URL.
 */
export const ERRORES_DE_INGRESO_EXTERNO = [
  'google_cancelado',
  'google_vencido',
  'google_sin_verificar',
  'google_fallo',
  'google_no_disponible',
  'google_otra_cuenta',
  'cuenta_inactiva',
] as const;
export type ErrorDeIngresoExterno = (typeof ERRORES_DE_INGRESO_EXTERNO)[number];

export function esErrorDeIngresoExterno(v: unknown): v is ErrorDeIngresoExterno {
  return typeof v === 'string' && (ERRORES_DE_INGRESO_EXTERNO as readonly string[]).includes(v);
}

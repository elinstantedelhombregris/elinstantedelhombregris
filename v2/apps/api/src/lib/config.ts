/**
 * Environment configuration parsed once at boot.
 *
 * All env access goes through this module. Direct `process.env.X` reads
 * elsewhere are an ESLint failure waiting to happen.
 */
import { z } from 'zod';

const truthy = z
  .union([z.boolean(), z.string()])
  .transform((v) =>
    typeof v === 'boolean' ? v : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase()),
  );

const ConfigSchema = z.object({
  env: z.enum(['development', 'test', 'production']).default('development'),
  api: z.object({
    port: z.coerce.number().int().positive().default(4000),
    publicUrl: z.string().url().default('http://localhost:4000'),
  }),
  web: z.object({
    publicUrl: z.string().url().default('http://localhost:5173'),
  }),
  database: z.object({
    url: z.string().min(1, 'DATABASE_URL is required'),
    urlUnpooled: z.string().optional(),
  }),
  auth: z.object({
    jwtSecret: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    sessionSecret: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
    cookieDomain: z.string().optional(),
    cookieSecure: truthy.default(false),
    accessTokenTtl: z.string().default('15m'),
    refreshTokenTtl: z.string().default('30d'),
  }),
  cors: z.object({
    origins: z
      .string()
      .default('http://localhost:5173')
      .transform((v) =>
        v
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ),
  }),
  rateLimit: z.object({
    windowMs: z.coerce.number().int().positive().default(60_000),
    maxRequests: z.coerce.number().int().positive().default(120),
    /**
     * Mirar (`/api/v1/pila`) y los aportes de Imaginar, por hora y por IP. Un aula o un club
     * salen a internet por una sola conexión (lanzamiento en persona, D1; D-138): estos dos
     * techos son altos a propósito, y el freno real es por persona y se cuenta en la base.
     */
    pilaPorHora: z.coerce.number().int().positive().default(6000),
    aportesPorHora: z.coerce.number().int().positive().default(150),
    /**
     * Cuántas faltas por hora y por IP acepta `/lo-que-falta`
     * (`docs/specs/2026-08-12-lo-que-falta.md` §2.6, freno 1).
     *
     * Es config y no una constante porque el canal publica **al instante y sin
     * cola de revisión**: es la única superficie del sistema donde el número
     * correcto se descubre viendo qué pasa, y bajarlo tiene que poder hacerse
     * sin desplegar. El default es el de la spec y la guarda de
     * `faltas-flows.test.ts` lo afirma; la suite de integración lo sube por
     * `FALTAS_POR_HORA` porque crea más de seis en la misma corrida.
     */
    faltasPorHora: z.coerce.number().int().positive().default(6),
  }),
  log: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),
  admin: z.object({
    /** Comma-separated usernames allowed to use admin-only endpoints
     *  (e.g. blog post creation/edit). Empty = no admins. */
    usernames: z
      .string()
      .default('')
      .transform((v) =>
        v
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ),
  }),
  /**
   * Si consultar un archivo en preparación (`GET /exportaciones/trabajos/:id`,
   * y el pedido que lo crea) avanza un tramo acotado del trabajo antes de
   * responder. Es lo que hace que el archivo se prepare mientras la persona
   * tiene la página abierta, sin depender de un cron por minuto que Vercel
   * Hobby no admite (`docs/operations/exportaciones-publicas.md`).
   *
   * Prendido por defecto; `EXPORTACIONES_EN_PEDIDO=0` lo apaga y deja la
   * preparación sólo al cron diario y al CLI `exportaciones:once`.
   */
  exportacionesEnPedido: truthy.default(true),
  /**
   * Ingresar con Google (ADR 0012). Sin client id o sin secreto, el proveedor no se ofrece.
   * Las tres direcciones de Google sólo se pueden cambiar fuera de producción: las pruebas
   * de integración las apuntan a un Google falso en un puerto local.
   */
  google: z.object({
    clientId: z.string().min(1).optional(),
    clientSecret: z.string().min(1).optional(),
    authUrl: z.string().url().default('https://accounts.google.com/o/oauth2/v2/auth'),
    tokenUrl: z.string().url().default('https://oauth2.googleapis.com/token'),
    jwksUrl: z.string().url().default('https://www.googleapis.com/oauth2/v3/certs'),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

let cached: Config | undefined;

/** Una variable puesta pero vacía (`GOOGLE_CLIENT_ID=`) cuenta como no puesta. */
function vacioComoAusente(v: string | undefined): string | undefined {
  const t = v?.trim();
  if (!t) return undefined;
  return t;
}

export function getConfig(): Config {
  if (cached) return cached;

  const enPedido = process.env.EXPORTACIONES_EN_PEDIDO?.trim();
  const parsed = ConfigSchema.safeParse({
    env: process.env.NODE_ENV,
    api: {
      port: process.env.API_PORT,
      publicUrl: process.env.PUBLIC_API_URL,
    },
    web: {
      publicUrl: process.env.PUBLIC_WEB_URL,
    },
    database: {
      url: process.env.DATABASE_URL,
      urlUnpooled: process.env.DATABASE_URL_UNPOOLED,
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      sessionSecret: process.env.SESSION_SECRET,
      cookieDomain: process.env.COOKIE_DOMAIN,
      cookieSecure: process.env.COOKIE_SECURE,
      accessTokenTtl: process.env.ACCESS_TOKEN_TTL,
      refreshTokenTtl: process.env.REFRESH_TOKEN_TTL,
    },
    cors: {
      origins: process.env.CORS_ORIGINS,
    },
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS,
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
      pilaPorHora: process.env.PILA_POR_HORA,
      aportesPorHora: process.env.APORTES_POR_HORA,
      faltasPorHora: process.env.FALTAS_POR_HORA,
    },
    log: {
      level: process.env.LOG_LEVEL,
    },
    admin: {
      usernames: process.env.ADMIN_USERNAMES,
    },
    // Vacío (`EXPORTACIONES_EN_PEDIDO=`) es «sin definir», no «apagado»:
    // sólo un valor explícito como `0` lo apaga.
    exportacionesEnPedido: enPedido === '' ? undefined : enPedido,
    google: {
      clientId: vacioComoAusente(process.env.GOOGLE_CLIENT_ID),
      clientSecret: vacioComoAusente(process.env.GOOGLE_CLIENT_SECRET),
      ...(process.env.NODE_ENV === 'production'
        ? {}
        : {
            authUrl: vacioComoAusente(process.env.GOOGLE_AUTH_URL),
            tokenUrl: vacioComoAusente(process.env.GOOGLE_TOKEN_URL),
            jwksUrl: vacioComoAusente(process.env.GOOGLE_JWKS_URL),
          }),
    },
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}

/**
 * Test-only: reset cached config. Production code must not call this.
 */
export function resetConfig(): void {
  cached = undefined;
}

/** Solo la configuración lee credenciales de proveedores. Nunca se incluyen en una respuesta pública. */
export function clavesIA() {
  return { groq: process.env.GROQ_API_KEY, anthropic: process.env.ANTHROPIC_API_KEY };
}

/** El ensayo no puede iniciarse con una conexión o integraciones heredadas. */
export function comprobarEntornoEscolar(env: NodeJS.ProcessEnv): void {
  const destino = 'postgresql://postgres@127.0.0.1:55441/basta_escuela_local';
  if (
    env.DATABASE_URL !== destino ||
    env.DATABASE_URL_UNPOOLED !== destino ||
    env.NODE_ENV !== 'development' ||
    env.API_PORT !== '4000' ||
    env.PUBLIC_WEB_URL !== 'http://127.0.0.1:4179'
  )
    throw new Error('Iniciá el ensayo con pnpm dev:escuela, sin credenciales externas.');
  const permitidas = new Set([
    'PATH',
    'HOME',
    'NODE_ENV',
    'DATABASE_URL',
    'DATABASE_URL_UNPOOLED',
    'API_PORT',
    'PUBLIC_API_URL',
    'PUBLIC_WEB_URL',
    'CORS_ORIGINS',
    'JWT_SECRET',
    'SESSION_SECRET',
    'ADMIN_USERNAMES',
    'COOKIE_SECURE',
    'EXPORTACIONES_EN_PEDIDO',
  ]);
  for (const clave of Object.keys(env)) {
    if (
      /(API_KEY|TOKEN|SECRET|DATABASE_URL|SMTP|RESEND|AWS_|VAPID|GROQ|ANTHROPIC)/.test(clave) &&
      !permitidas.has(clave)
    ) {
      throw new Error(`El ensayo no admite la variable externa ${clave}.`);
    }
  }
}

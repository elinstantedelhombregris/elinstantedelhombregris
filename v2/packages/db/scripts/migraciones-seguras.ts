import type { MigrationMeta } from 'drizzle-orm/migrator';

const HOST_V2 = 'ep-flat-art-ajjmw0zc.c-3.us-east-2.aws.neon.tech';
export function comprobarDestino(url: string | undefined, args: string[], ultima: string) {
  if (!url)
    throw new Error('Fijá DATABASE_URL_UNPOOLED o DATABASE_URL explícitamente. No se lee .env.');
  const destino = new URL(url);
  if (!['postgres:', 'postgresql:'].includes(destino.protocol))
    throw new Error('Se necesita una conexión PostgreSQL.');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(destino.hostname);
  const comprobar = args.includes('--comprobar');
  if (!local) {
    if (destino.hostname !== HOST_V2 || destino.pathname !== '/neondb')
      throw new Error('El destino remoto no es la base v2 autorizada.');
    if (!args.includes(`--remoto=${HOST_V2}`) || !args.includes(`--hasta=${ultima}`))
      throw new Error(
        'Indicá el host remoto y la última migración revisada con --remoto y --hasta.',
      );
    if (!comprobar && !args.includes('--aplicar'))
      throw new Error('La escritura remota necesita --aplicar.');
  }
  return { host: destino.hostname, base: destino.pathname.slice(1), comprobar };
}

export function comprobarDiario(
  filas: { hash: string; created_at: string }[],
  locales: MigrationMeta[],
) {
  for (const [i, local] of locales.entries()) {
    if (
      !Number.isSafeInteger(local.folderMillis) ||
      local.folderMillis <= (locales[i - 1]?.folderMillis ?? -1)
    )
      throw new Error('Las fechas del diario local deben ser únicas y crecientes.');
  }
  if (filas.length > locales.length)
    throw new Error('La base tiene migraciones que no están en este código.');
  for (const [i, fila] of filas.entries()) {
    const local = locales[i];
    if (
      !local ||
      local.hash !== fila.hash ||
      String(local.folderMillis) !== String(fila.created_at)
    )
      throw new Error(
        `El diario difiere de los archivos en la posición ${String(i)}. No se aplicó nada.`,
      );
  }
  return locales.slice(filas.length);
}

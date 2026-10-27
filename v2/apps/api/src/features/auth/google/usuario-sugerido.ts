/**
 * La sugerencia de nombre de usuario del «Último paso»: la parte del correo antes de la @,
 * con las reglas de siempre (3 a 32 caracteres: letras, números, `_` y `-`).
 */
const MAXIMO = 32;

/** La base: sin tildes ni signos, en minúsculas, y con al menos tres caracteres. */
function baseDe(correo: string): string {
  const local = (correo.split('@')[0] ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^[_-]+|[_-]+$/g, '')
    .toLowerCase()
    .slice(0, MAXIMO - 2);
  return local.length >= 3 ? local : `persona${local ? `_${local}` : ''}`;
}

/** Los candidatos en orden: la base y después la base con un número. */
export function candidatosDeUsuario(correo: string, cantidad = 8): string[] {
  const base = baseDe(correo);
  return [base, ...Array.from({ length: cantidad - 1 }, (_, i) => `${base}${String(i + 2)}`)];
}

/** El primer candidato libre; si están todos tomados, la base con cuatro cifras al azar. */
export function sugerirUsuario(
  candidatos: readonly string[],
  tomados: ReadonlySet<string>,
  azar: () => number = Math.random,
): string {
  const libre = candidatos.find((c) => !tomados.has(c.toLowerCase()));
  if (libre) return libre;
  const base = (candidatos[0] ?? 'persona').slice(0, MAXIMO - 4);
  return `${base}${String(Math.floor(1000 + azar() * 9000))}`;
}

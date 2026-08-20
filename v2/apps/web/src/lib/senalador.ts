/**
 * El señalador (spec 2026-08-20-el-catalogo-vivo-biblioteca.md §5): el slug
 * del último ensayo abierto, guardado en el dispositivo y en ningún otro
 * lado. No es un «leído» — la Decisión 2 de la spec 3.1/3.2 sigue firme:
 * leer no es un acto verificable. Esto solo recuerda dónde estabas; el que
 * lee valida el slug contra el registry (un ensayo retirado equivale a no
 * tener señalador).
 */
const STORAGE_KEY = 'basta_senalador';

export function guardarSenalador(slug: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // Sin storage (Safari privado, cuota llena) el señalador dura la sesión.
  }
}

export function leerSenalador(): string | null {
  try {
    const slug = window.localStorage.getItem(STORAGE_KEY);
    return slug === null || slug === '' ? null : slug;
  } catch {
    return null;
  }
}

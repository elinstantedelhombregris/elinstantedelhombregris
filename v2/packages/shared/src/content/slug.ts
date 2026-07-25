/**
 * Slug canónico de un título en castellano.
 *
 * v1 slugificaba con `.replace(/[^\w\s-]/g, '')`, que en castellano **borra**
 * los acentos en vez de transliterarlos: «soberanía» → `soberana`. Esta
 * función hace lo mismo que v1 salvo por un paso previo — normaliza a NFD y
 * saca las marcas diacríticas — así que devuelve el mismo slug de siempre
 * con las letras que faltaban.
 */
export function slugCanonico(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // las marcas diacríticas que NFD separó
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Stable per-browser anonymous id used to attribute likes/views to a
// returning visitor without requiring a login. Persisted in localStorage
// and reused across tabs and sessions; cleared when the user wipes
// browser storage. SSR/prerender-safe — returns '' off the browser.
const ANON_KEY = 'eihg_anon_id';

export function getAnonSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(ANON_KEY);
  if (!id) {
    id = window.crypto?.randomUUID?.()
      ?? `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

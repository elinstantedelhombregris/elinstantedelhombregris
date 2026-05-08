/**
 * Read the CSRF token cookie set by the API.
 *
 * The cookie name matches the server's COOKIE_CSRF constant.
 * Returns the empty string if not present (request will fail; callers
 * must handle).
 */
const COOKIE_NAME = 'eihg_csrf';

export function readCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${COOKIE_NAME}=`)) {
      return decodeURIComponent(trimmed.slice(COOKIE_NAME.length + 1));
    }
  }
  return '';
}

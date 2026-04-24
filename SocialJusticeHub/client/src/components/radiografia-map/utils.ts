// client/src/components/radiografia-map/utils.ts

/**
 * Accent-, case-, and whitespace-insensitive comparison key for place names.
 *
 * Used so that "Río Cuarto" (from a DB field) and "Rio Cuarto" (from the
 * provinces API) match each other in filters. We keep the original string
 * for display and compare only on the normalized form.
 *
 * Steps:
 *  1. Unicode NFD — decomposes accented chars ("á" → "a" + "́")
 *  2. Strip combining marks (\p{Mn}) — removes the accent
 *  3. Lowercase
 *  4. Trim + collapse internal whitespace
 */
export function normalizePlaceName(input: string | null | undefined): string | null {
  if (input == null) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  return trimmed
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

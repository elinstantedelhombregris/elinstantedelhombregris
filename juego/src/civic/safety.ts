const EMAIL_PATTERN = /[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+/gi;
const PHONE_PATTERN = /\+?\d[\d\s().-]{7,}\d/g;

export const redactPersonalContact = (value: string): string => {
  const withoutEmail = value.replace(EMAIL_PATTERN, '[dato protegido]');
  return withoutEmail.replace(PHONE_PATTERN, (candidate) => {
    const digits = candidate.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) return candidate;
    if (/^\d{4}-\d{2}-\d{2}$/.test(candidate.trim())) return candidate;
    return '[dato protegido]';
  });
};

/** Última barrera cliente: ningún texto libre sale del dispositivo con contacto. */
export const redactPublicValue = (value: unknown): unknown => {
  if (typeof value === 'string') return redactPersonalContact(value);
  if (Array.isArray(value)) return value.map(redactPublicValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .map(([key, child]) => [key, redactPublicValue(child)]));
  }
  return value;
};

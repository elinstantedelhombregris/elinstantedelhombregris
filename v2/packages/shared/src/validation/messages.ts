/**
 * Reusable Zod validation messages in rioplatense Spanish.
 *
 * These match the tone of the v1 product: direct, conversational, "vos"
 * not "tú". Keep them short — UI displays them inline.
 */
export const messages = {
  required: 'Este campo es obligatorio.',
  string: {
    min: (n: number): string => `Tiene que tener al menos ${String(n)} caracteres.`,
    max: (n: number): string => `No puede tener más de ${String(n)} caracteres.`,
  },
  email: 'Ingresá un email válido.',
  username: {
    min: 'El usuario tiene que tener al menos 3 caracteres.',
    max: 'El usuario no puede tener más de 32 caracteres.',
    format: 'Solo letras, números, guiones y guiones bajos.',
  },
  password: {
    min: 'La contraseña tiene que tener al menos 12 caracteres.',
    max: 'La contraseña no puede tener más de 128 caracteres.',
  },
  url: 'Ingresá una URL válida (debe empezar con http:// o https://).',
} as const;

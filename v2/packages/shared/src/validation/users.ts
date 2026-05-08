/**
 * User validation schemas.
 *
 * Two layers:
 *   - DB-shape schemas: mirror the Drizzle insert/select types. Used at
 *     the persistence boundary.
 *   - API-shape schemas: what the public HTTP routes accept. The
 *     password lands here (registration), then the API service hashes
 *     it and the DB never sees plaintext.
 *
 * Spanish error messages keep us honest with users (rioplatense, "vos").
 */
import { z } from 'zod';

import { messages } from './messages.js';

const usernameRegex = /^[a-zA-Z0-9_-]+$/;

/** A valid username candidate (still needs a uniqueness check). */
export const usernameSchema = z
  .string({ required_error: messages.required })
  .trim()
  .min(3, messages.username.min)
  .max(32, messages.username.max)
  .regex(usernameRegex, messages.username.format);

export const emailSchema = z
  .string({ required_error: messages.required })
  .trim()
  .toLowerCase()
  .email(messages.email)
  .max(254);

export const passwordSchema = z
  .string({ required_error: messages.required })
  .min(12, messages.password.min)
  .max(128, messages.password.max);

export const nameSchema = z
  .string({ required_error: messages.required })
  .trim()
  .min(1, messages.required)
  .max(100, messages.string.max(100));

/**
 * Public profile shape returned to clients.
 * Does NOT include password_hash, lastLoginAt, or any internal flags.
 */
export const userPublicSchema = z.object({
  id: z.number().int().positive(),
  username: usernameSchema,
  email: emailSchema,
  name: nameSchema,
  location: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().url(messages.url).nullable(),
  emailVerified: z.boolean(),
  onboardingCompleted: z.boolean(),
  createdAt: z.string().datetime().or(z.date()),
});
export type UserPublic = z.infer<typeof userPublicSchema>;

/** Body of POST /api/auth/register */
export const registerInputSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

/** Body of POST /api/auth/login — accepts username OR email */
export const loginInputSchema = z.object({
  identifier: z.string().min(1, messages.required),
  password: z.string().min(1, messages.required),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

/** Body of PATCH /api/auth/profile */
export const updateProfileInputSchema = z.object({
  name: nameSchema.optional(),
  location: z.string().trim().max(120).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatarUrl: z.string().url(messages.url).nullable().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

/** Body of POST /api/auth/change-password */
export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, messages.required),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;

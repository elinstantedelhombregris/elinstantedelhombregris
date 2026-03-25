import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';

// Enhanced user registration schema
export const registerUserSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z.string()
    .email('Formato de email inválido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .toLowerCase(),
  
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/,
      'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
  
  confirmPassword: z.string(),
  
  location: z.string()
    .max(255, 'La ubicación no puede exceder 255 caracteres')
    .optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Login schema
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'El nombre de usuario es requerido')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres'),
  
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
});

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'La contraseña actual es requerida'),
  
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(128, 'La nueva contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/,
      'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
  
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword']
});

// Profile update schema
export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .optional(),
  
  email: z.string()
    .email('Formato de email inválido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .toLowerCase()
    .optional(),
  
  location: z.string()
    .max(255, 'La ubicación no puede exceder 255 caracteres')
    .optional(),

  dataShareOptOut: z.boolean().optional()
});

// Dream creation schema
export const createDreamSchema = z.object({
  dream: z.string()
    .min(10, 'El sueño debe tener al menos 10 caracteres')
    .max(1000, 'El sueño no puede exceder 1000 caracteres')
    .optional(),
  
  value: z.string()
    .min(5, 'El valor debe tener al menos 5 caracteres')
    .max(500, 'El valor no puede exceder 500 caracteres')
    .optional(),
  
  need: z.string()
    .min(5, 'La necesidad debe tener al menos 5 caracteres')
    .max(500, 'La necesidad no puede exceder 500 caracteres')
    .optional(),
  
  basta: z.string()
    .min(5, 'El basta debe tener al menos 5 caracteres')
    .max(500, 'El basta no puede exceder 500 caracteres')
    .optional(),
  
  location: z.string()
    .max(255, 'La ubicación no puede exceder 255 caracteres')
    .optional(),
  
  latitude: z.string()
    .regex(/^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/, 'Latitud inválida')
    .optional(),
  
  longitude: z.string()
    .regex(/^-?((1[0-7][0-9])|([1-9]?[0-9]))(\.[0-9]+)?$/, 'Longitud inválida')
    .optional(),
  
  type: z.enum(['dream', 'value', 'need', 'basta'])
    .default('dream')
}).refine((data) => {
  // At least one of dream, value, need, or basta must be provided
  return data.dream || data.value || data.need || data.basta;
}, {
  message: 'Debe proporcionar al menos un contenido (sueño, valor, necesidad o basta)',
  path: ['dream']
});

// Community post schema
export const createCommunityPostSchema = z.object({
  title: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  description: z.string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),
  
  type: z.enum(['job', 'project', 'resource', 'volunteer', 'donation'])
    .default('project'),
  
  location: z.string()
    .min(2, 'La ubicación debe tener al menos 2 caracteres')
    .max(255, 'La ubicación no puede exceder 255 caracteres'),
  
  participants: z.number()
    .int('El número de participantes debe ser un entero')
    .min(1, 'Debe haber al menos 1 participante')
    .max(1000, 'No puede haber más de 1000 participantes')
    .optional()
});

// Story creation schema
export const createStorySchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  location: z.string()
    .min(2, 'La ubicación debe tener al menos 2 caracteres')
    .max(255, 'La ubicación no puede exceder 255 caracteres'),
  
  story: z.string()
    .min(50, 'La historia debe tener al menos 50 caracteres')
    .max(5000, 'La historia no puede exceder 5000 caracteres'),
  
  imageUrl: z.string()
    .url('URL de imagen inválida')
    .optional()
});

// Inspiring story creation schema
export const createInspiringStorySchema = z.object({
  title: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  excerpt: z.string()
    .min(20, 'El extracto debe tener al menos 20 caracteres')
    .max(500, 'El extracto no puede exceder 500 caracteres'),
  
  content: z.string()
    .min(100, 'El contenido debe tener al menos 100 caracteres')
    .max(5000, 'El contenido no puede exceder 5000 caracteres'),
  
  category: z.enum(['employment', 'volunteering', 'community_project', 'personal_growth', 'resource_sharing', 'connection'])
    .default('connection'),
  
  location: z.string()
    .min(2, 'La ubicación debe tener al menos 2 caracteres')
    .max(255, 'La ubicación no puede exceder 255 caracteres'),
  
  province: z.string()
    .max(100, 'La provincia no puede exceder 100 caracteres')
    .optional(),
  
  city: z.string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional(),
  
  impactType: z.enum(['job_created', 'lives_changed', 'hours_volunteered', 'people_helped', 'project_completed', 'resource_shared'])
    .default('lives_changed'),
  
  impactCount: z.number()
    .int('El número de impacto debe ser un entero')
    .min(1, 'El impacto debe ser al menos 1')
    .max(100000, 'El impacto no puede exceder 100,000'),
  
  impactDescription: z.string()
    .min(5, 'La descripción del impacto debe tener al menos 5 caracteres')
    .max(200, 'La descripción del impacto no puede exceder 200 caracteres'),
  
  imageUrl: z.string()
    .url('URL de imagen inválida')
    .optional(),
  
  videoUrl: z.string()
    .url('URL de video inválida')
    .optional(),
  
  tags: z.string()
    .max(500, 'Las etiquetas no pueden exceder 500 caracteres')
    .optional(),
  
  authorName: z.string()
    .min(2, 'El nombre del autor debe tener al menos 2 caracteres')
    .max(100, 'El nombre del autor no puede exceder 100 caracteres')
    .optional(),
  
  authorEmail: z.string()
    .email('Formato de email del autor inválido')
    .max(255, 'El email del autor no puede exceder 255 caracteres')
    .optional()
});

// Resource creation schema
export const createResourceSchema = z.object({
  title: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  description: z.string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  
  category: z.string()
    .min(2, 'La categoría debe tener al menos 2 caracteres')
    .max(50, 'La categoría no puede exceder 50 caracteres'),
  
  url: z.string()
    .url('URL inválida')
    .optional()
});

// Export types
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateDreamInput = z.infer<typeof createDreamSchema>;
export type CreateCommunityPostInput = z.infer<typeof createCommunityPostSchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type CreateInspiringStoryInput = z.infer<typeof createInspiringStorySchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;

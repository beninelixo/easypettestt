import { z } from 'zod';

/**
 * User and authentication validation schemas
 */

export const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .transform(val => val.toLowerCase().trim());

export const passwordSchema = z.string()
  .min(10, 'Senha deve ter no mínimo 10 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter ao menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter ao menos um caractere especial');

export const nameSchema = z.string()
  .min(2, 'Nome muito curto')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos')
  .transform(val => val.trim());

export const phoneSchema = z.string()
  .regex(/^(\+55\s?)?(\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}$/, 'Telefone inválido')
  .transform(val => val.replace(/\D/g, ''));

export const cpfSchema = z.string()
  .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos');

export const cnpjSchema = z.string()
  .regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: nameSchema,
  phone: phoneSchema.optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  full_name: nameSchema,
  phone: phoneSchema.optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  document: z.string().max(20).optional().nullable(),
  avatar_url: z.string().url('URL inválida').optional().nullable(),
  contact_preference: z.enum(['email', 'phone', 'whatsapp']).optional().nullable(),
});

export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type Profile = z.infer<typeof profileSchema>;

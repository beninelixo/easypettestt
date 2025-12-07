import { z } from 'zod';

/**
 * Pet validation schemas
 */

export const petSpeciesEnum = z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other']);

export const petSizeEnum = z.enum(['pequeno', 'medio', 'grande', 'gigante']);

export const petGenderEnum = z.enum(['macho', 'femea']);

export const petSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos'),
  species: z.string().min(1, 'Espécie é obrigatória'),
  breed: z.string().max(100, 'Raça muito longa').optional().nullable(),
  age: z.number().int().min(0).max(50).optional().nullable(),
  weight: z.number().positive('Peso deve ser positivo').max(500).optional().nullable(),
  size: petSizeEnum.optional().nullable(),
  gender: petGenderEnum.optional().nullable(),
  birth_date: z.string().optional().nullable(),
  coat_color: z.string().max(50).optional().nullable(),
  coat_type: z.string().max(50).optional().nullable(),
  neutered: z.boolean().optional().nullable(),
  allergies: z.string().max(500).optional().nullable(),
  chronic_diseases: z.string().max(500).optional().nullable(),
  observations: z.string().max(1000).optional().nullable(),
  temperament: z.string().max(100).optional().nullable(),
  grooming_preferences: z.string().max(500).optional().nullable(),
  restrictions: z.string().max(500).optional().nullable(),
  photo_url: z.string().url('URL inválida').optional().nullable(),
});

export const petCreateSchema = petSchema.extend({
  owner_id: z.string().uuid('ID do dono inválido'),
});

export const petUpdateSchema = petSchema.partial();

export type Pet = z.infer<typeof petSchema>;
export type PetCreate = z.infer<typeof petCreateSchema>;
export type PetUpdate = z.infer<typeof petUpdateSchema>;

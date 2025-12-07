import { z } from 'zod';

/**
 * Business-related validation schemas (Pet Shops, Services, Products)
 */

// Pet Shop
export const petShopSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo'),
  code: z.string()
    .min(3, 'Código deve ter no mínimo 3 caracteres')
    .max(20, 'Código muito longo')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Código contém caracteres inválidos'),
  description: z.string().max(1000).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email inválido').max(255).optional().nullable(),
  hours: z.string().max(500).optional().nullable(),
  logo_url: z.string().url('URL inválida').optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

// Service
export const serviceSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo'),
  description: z.string().max(1000).optional().nullable(),
  price: z.number()
    .positive('Preço deve ser positivo')
    .max(99999.99, 'Preço muito alto'),
  duration_minutes: z.number()
    .int('Duração deve ser um número inteiro')
    .min(5, 'Duração mínima de 5 minutos')
    .max(480, 'Duração máxima de 8 horas'),
  active: z.boolean().default(true),
  pet_shop_id: z.string().uuid('ID do pet shop inválido'),
});

// Product
export const productSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo'),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  sku: z.string().max(50).optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  cost_price: z.number().nonnegative('Preço de custo não pode ser negativo'),
  sale_price: z.number().positive('Preço de venda deve ser positivo'),
  stock_quantity: z.number().int().nonnegative('Quantidade não pode ser negativa').default(0),
  min_stock_quantity: z.number().int().nonnegative().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  active: z.boolean().default(true),
  pet_shop_id: z.string().uuid('ID do pet shop inválido'),
});

// Payment
export const paymentSchema = z.object({
  appointment_id: z.string().uuid('ID do agendamento inválido'),
  amount: z.number().positive('Valor deve ser positivo'),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'pix', 'transfer']),
  installments: z.number().int().min(1).max(24).optional().nullable(),
  status: z.enum(['pending', 'paid', 'cancelled', 'refunded']).default('pending'),
});

export type PetShop = z.infer<typeof petShopSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Product = z.infer<typeof productSchema>;
export type Payment = z.infer<typeof paymentSchema>;

import { z } from 'zod';

/**
 * Appointment validation schemas
 */

export const appointmentStatusEnum = z.enum([
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
]);

export const appointmentSchema = z.object({
  pet_id: z.string().uuid('ID do pet inválido'),
  client_id: z.string().uuid('ID do cliente inválido'),
  service_id: z.string().uuid('ID do serviço inválido'),
  pet_shop_id: z.string().uuid('ID do pet shop inválido'),
  scheduled_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  scheduled_time: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),
  status: appointmentStatusEnum.default('pending'),
  notes: z.string().max(1000, 'Notas muito longas').optional().nullable(),
});

export const appointmentCreateSchema = appointmentSchema;

export const appointmentUpdateSchema = appointmentSchema.partial().extend({
  id: z.string().uuid('ID do agendamento inválido'),
});

export const appointmentCancelSchema = z.object({
  id: z.string().uuid('ID do agendamento inválido'),
  reason: z.string().max(500).optional(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
export type AppointmentCreate = z.infer<typeof appointmentCreateSchema>;
export type AppointmentUpdate = z.infer<typeof appointmentUpdateSchema>;
export type AppointmentCancel = z.infer<typeof appointmentCancelSchema>;

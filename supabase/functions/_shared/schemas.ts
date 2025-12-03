/**
 * Centralized Zod Validation Schemas
 * Reusable validation patterns for edge functions
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// ============= COMMON PRIMITIVES =============

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .max(20, 'Phone number too long');

export const ipAddressSchema = z
  .string()
  .max(255, 'IP address or hostname too long')
  .optional();

export const userAgentSchema = z
  .string()
  .max(500, 'User agent too long')
  .optional();

// ============= DATE & TIME =============

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be in HH:MM or HH:MM:SS format');

export const isoDateTimeSchema = z
  .string()
  .datetime({ message: 'Must be valid ISO 8601 datetime' });

// ============= AUTHENTICATION =============

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

export const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Code must be exactly 6 digits');

export const resetCodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Reset code must be exactly 6 digits');

// ============= ENUMS =============

export const userRoleSchema = z.enum(['client', 'pet_shop', 'admin', 'professional']);

export const appointmentStatusSchema = z.enum([
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
]);

export const severitySchema = z.enum(['info', 'warning', 'critical', 'emergency']);

export const alertTypeSchema = z.enum([
  'system_error',
  'security_breach',
  'performance_degradation',
  'edge_function_failure',
  'database_issue',
  'api_timeout',
  'high_error_rate',
  'suspicious_activity',
  'backup_failure'
]);

export const reportTypeSchema = z.enum(['monthly', 'weekly', 'custom']);

export const timeframeSchema = z.enum(['last_hour', 'last_24h', 'last_week']);

// ============= COMPLEX OBJECTS =============

export const loginAttemptSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  ip_address: ipAddressSchema,
  user_agent: userAgentSchema
});

export const appointmentRecordSchema = z.object({
  id: uuidSchema,
  pet_shop_id: uuidSchema,
  client_id: uuidSchema,
  service_id: uuidSchema,
  scheduled_date: dateSchema,
  scheduled_time: timeSchema,
  status: appointmentStatusSchema
});

export const alertEmailSchema = z.object({
  severity: severitySchema,
  module: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  details: z.any().optional()
});

export const securityAlertSchema = z.object({
  alert_id: uuidSchema,
  alert_type: z.string().min(1).max(100),
  severity: z.string().min(1).max(50),
  description: z.string().min(1).max(1000),
  metadata: z.any().optional()
});

export const backupRequestSchema = z.object({
  backup_id: uuidSchema,
  tables: z.array(z.string()).optional()
});

export const notificationSchema = z.object({
  notificationId: uuidSchema
});

export const webhookTriggerSchema = z.object({
  alert: z.any(),
  event_type: z.string().min(1).max(100)
});

// ============= VALIDATION HELPERS =============

/**
 * Validates request body and returns typed data or error response
 * @param schema Zod schema to validate against
 * @param body Request body to validate
 * @param corsHeaders CORS headers for error response
 * @returns Object with success flag, data if valid, or error response
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  body: unknown,
  corsHeaders: Record<string, string>
): 
  | { success: true; data: z.infer<T> }
  | { success: false; response: Response }
{
  const validation = schema.safeParse(body);
  
  if (!validation.success) {
    console.error('Validation error:', validation.error);
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: 'Invalid input data',
          details: validation.error.errors[0].message
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    };
  }
  
  return { success: true, data: validation.data };
}

// ============= SANITIZATION =============

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param text Text containing potential HTML
 * @returns Escaped text safe for HTML rendering
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates and sanitizes email for safe use in queries
 * @param email Email to validate
 * @returns Validated and sanitized email
 */
export function sanitizeEmail(email: string): string {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    throw new Error('Invalid email format');
  }
  return result.data;
}

// ============= ADMIN ACCESS VERIFICATION =============

/**
 * Verifies if a user has admin access (admin, super_admin, or god user)
 * Works correctly with users who have multiple roles
 * @param supabase Supabase client instance
 * @param userId User ID to check
 * @returns Object with isAdmin and isGodUser flags
 */
export async function verifyAdminAccess(
  supabase: any,
  userId: string
): Promise<{ isAdmin: boolean; isGodUser: boolean; roles: string[] }> {
  // Check if is God User first
  const { data: godUserCheck } = await supabase
    .rpc('is_god_user', { _user_id: userId });
  
  if (godUserCheck === true) {
    return { isAdmin: true, isGodUser: true, roles: ['god_user'] };
  }

  // Fetch ALL roles for the user (no .single() - supports multiple roles)
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (rolesError) {
    console.error('Error fetching user roles:', rolesError);
    return { isAdmin: false, isGodUser: false, roles: [] };
  }

  const roleList = roles?.map((r: { role: string }) => r.role) || [];
  const isAdmin = roleList.includes('admin') || roleList.includes('super_admin');

  return { isAdmin, isGodUser: false, roles: roleList };
}

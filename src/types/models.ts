// Central type definitions for EasyPet system
// All application types should be defined here for consistency

import { Database } from '@/integrations/supabase/types';

// Database table types
type Tables = Database['public']['Tables'];

// ============================================
// Core Entity Types
// ============================================

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed?: string;
  birth_date?: string;
  weight?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PetWithOwner extends Pet {
  owner: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
  };
}

export interface Service {
  id: string;
  pet_shop_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  suggested_price: number;
  duration_minutes: number;
  icon?: string;
}

export interface Appointment {
  id: string;
  pet_shop_id: string;
  client_id: string;
  pet_id: string;
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface AppointmentWithRelations extends Appointment {
  pet: Pet;
  service: Service;
  client: Profile;
  pet_shop: PetShop;
}

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  payment_method: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia';
  status: 'pendente' | 'pago' | 'cancelado' | 'estornado';
  paid_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PaymentWithDetails extends Payment {
  appointment: AppointmentWithRelations;
}

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  user_code?: string;
  created_at: string;
  updated_at: string;
}

export interface PetShop {
  id: string;
  owner_id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PetShopWithOwner extends PetShop {
  owner: Profile;
}

// ============================================
// User & Role Types
// ============================================

export type AppRole = 'client' | 'pet_shop' | 'admin' | 'professional';

export interface UserRole {
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface UserWithRole extends Profile {
  role: AppRole;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  client_id: string;
  appointment_id?: string;
  notification_type: 'confirmacao' | 'lembrete' | 'cancelamento' | 'atualizacao';
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  message: string;
  status: 'pendente' | 'enviada' | 'falhou';
  sent_at?: string;
  created_at: string;
}

// ============================================
// Security & Audit Types
// ============================================

export interface LoginAttempt {
  id: string;
  user_id?: string;
  email: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  attempt_time: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id?: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  created_at: string;
}

export interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

// ============================================
// System Health & Maintenance Types
// ============================================

export interface HealthCheck {
  service_name: string;
  status: 'healthy' | 'degraded' | 'down' | 'critical';
  response_time_ms: number;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface SystemMetrics {
  total_users: number;
  new_users_today: number;
  total_appointments: number;
  appointments_today: number;
  revenue_today: number;
  errors_today: number;
  active_users_5min: number;
}

export interface DailyHealthReport {
  id: string;
  report_date: string;
  overall_status: 'healthy' | 'warning' | 'critical';
  health_score: number;
  report_data: {
    checks: Record<string, HealthCheck>;
    metrics: SystemMetrics;
    performance: {
      avg_api_latency_ms: number;
      avg_db_latency_ms: number;
      error_rate_percent: number;
      uptime_percent: number;
    };
  };
  checks: Record<string, HealthCheck>;
  metrics: SystemMetrics;
  actions_taken: string[];
  recommendations: string[];
  comparison_to_yesterday?: {
    performance_change: number;
    error_rate_change: number;
  };
  created_at: string;
}

export interface AutomaticAction {
  id: string;
  report_id?: string;
  action_type: string;
  action_description: string;
  action_data?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  error_message?: string;
  executed_at?: string;
  created_at: string;
}

// ============================================
// Alert Types
// ============================================

export interface AdminAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  context?: Record<string, any>;
  read: boolean;
  read_at?: string;
  read_by?: string;
  resolved?: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAlertHistory extends AdminAlert {
  notified_admins: string[];
  notification_channels: string[];
}

export interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  platform: 'slack' | 'discord' | 'teams' | 'custom';
  events: string[];
  active: boolean;
  created_by?: string;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Chart & Analytics Types
// ============================================

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface AppointmentStats {
  day: string;
  completed: number;
  pending: number;
  cancelled: number;
}

export interface ServiceBreakdown {
  service_name: string;
  service_count: number;
  revenue: number;
  avg_duration: number;
}

export interface PeakHoursData {
  hour: number;
  appointment_count: number;
}

export interface NoShowStats {
  total_appointments: number;
  no_shows: number;
  completed: number;
  no_show_rate: number;
  by_day_of_week: Record<string, number>;
}

// ============================================
// Form & Component Props Types
// ============================================

export interface AppointmentFormData {
  pet_shop_id: string;
  pet_id: string;
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  notes?: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  active: boolean;
}

export interface PetFormData {
  name: string;
  species: string;
  breed?: string;
  birth_date?: string;
  weight?: number;
  notes?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================
// Filter & Sort Types
// ============================================

export interface AppointmentFilters {
  status?: Appointment['status'][];
  date_start?: string;
  date_end?: string;
  pet_shop_id?: string;
  client_id?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<{ data: T | null; error: Error | null }>;

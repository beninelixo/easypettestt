// Temporary types until Supabase types are regenerated
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  created_at: string;
  updated_at: string;
  active: boolean;
  subscription_plan: string;
  settings: Record<string, any>;
}

export interface Franchise {
  id: string;
  tenant_id: string;
  owner_id: string;
  name: string;
  code: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  contract_start_date: string | null;
  contract_end_date: string | null;
  royalty_percentage: number;
  settings: Record<string, any>;
  units?: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  tenant_id: string | null;
  franchise_id: string | null;
  owner_id: string;
  address: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  description: string | null;
  hours: string | null;
  created_at: string;
  updated_at: string;
  alerts?: number;
}

export interface UserHierarchy {
  id: string;
  user_id: string;
  tenant_id: string | null;
  franchise_id: string | null;
  unit_id: string | null;
  role: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface ConsolidatedMetrics {
  total_revenue: number;
  total_appointments: number;
  active_units: number;
  total_clients: number;
}

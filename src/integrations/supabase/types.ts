export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_audit: {
        Row: {
          action: Database["public"]["Enums"]["app_action"]
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          module: Database["public"]["Enums"]["app_module"]
          pet_shop_id: string | null
          resource_id: string | null
          resource_type: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["app_action"]
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          module: Database["public"]["Enums"]["app_module"]
          pet_shop_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["app_action"]
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          module?: Database["public"]["Enums"]["app_module"]
          pet_shop_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_audit_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_alerts: {
        Row: {
          alert_type: string
          context: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          read_at: string | null
          read_by: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source_function: string | null
          source_module: string | null
          title: string
        }
        Insert: {
          alert_type: string
          context?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          read_by?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          source_function?: string | null
          source_module?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          context?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          read_by?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_function?: string | null
          source_module?: string | null
          title?: string
        }
        Relationships: []
      }
      admin_api_rate_limits: {
        Row: {
          admin_id: string
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      admin_invites: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          token: string
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          token: string
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          token?: string
        }
        Relationships: []
      }
      admin_notification_preferences: {
        Row: {
          admin_id: string
          backup_alerts: boolean
          created_at: string
          email_enabled: boolean
          id: string
          payment_alerts: boolean
          performance_alerts: boolean
          push_enabled: boolean
          security_alerts: boolean
          system_health_alerts: boolean
          updated_at: string
          user_activity_alerts: boolean
          whatsapp_enabled: boolean
          whatsapp_number: string | null
        }
        Insert: {
          admin_id: string
          backup_alerts?: boolean
          created_at?: string
          email_enabled?: boolean
          id?: string
          payment_alerts?: boolean
          performance_alerts?: boolean
          push_enabled?: boolean
          security_alerts?: boolean
          system_health_alerts?: boolean
          updated_at?: string
          user_activity_alerts?: boolean
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
        }
        Update: {
          admin_id?: string
          backup_alerts?: boolean
          created_at?: string
          email_enabled?: boolean
          id?: string
          payment_alerts?: boolean
          performance_alerts?: boolean
          push_enabled?: boolean
          security_alerts?: boolean
          system_health_alerts?: boolean
          updated_at?: string
          user_activity_alerts?: boolean
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          pet_id: string
          pet_shop_id: string
          scheduled_date: string
          scheduled_time: string
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          pet_shop_id: string
          scheduled_date: string
          scheduled_time: string
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          pet_shop_id?: string
          scheduled_date?: string
          scheduled_time?: string
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_events_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_status: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          role_source: string | null
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_status: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          role_source?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_status?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          role_source?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      backup_history: {
        Row: {
          backup_id: string
          backup_size_bytes: number | null
          backup_type: string
          completed_at: string | null
          compression_enabled: boolean | null
          encryption_enabled: boolean | null
          error_message: string | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string
          storage_path: string | null
          tables_backed_up: Json
          total_records: number
          triggered_by: string | null
        }
        Insert: {
          backup_id: string
          backup_size_bytes?: number | null
          backup_type: string
          completed_at?: string | null
          compression_enabled?: boolean | null
          encryption_enabled?: boolean | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status: string
          storage_path?: string | null
          tables_backed_up: Json
          total_records?: number
          triggered_by?: string | null
        }
        Update: {
          backup_id?: string
          backup_size_bytes?: number | null
          backup_type?: string
          completed_at?: string | null
          compression_enabled?: boolean | null
          encryption_enabled?: boolean | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          storage_path?: string | null
          tables_backed_up?: Json
          total_records?: number
          triggered_by?: string | null
        }
        Relationships: []
      }
      backup_verifications: {
        Row: {
          backup_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          integrity_checks_failed: number | null
          integrity_checks_passed: number | null
          records_verified: number | null
          started_at: string
          tables_verified: number | null
          verification_results: Json | null
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          backup_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          integrity_checks_failed?: number | null
          integrity_checks_passed?: number | null
          records_verified?: number | null
          started_at?: string
          tables_verified?: number | null
          verification_results?: Json | null
          verification_status: string
          verified_by?: string | null
        }
        Update: {
          backup_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          integrity_checks_failed?: number | null
          integrity_checks_passed?: number | null
          records_verified?: number | null
          started_at?: string
          tables_verified?: number | null
          verification_results?: Json | null
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_verifications_backup_id_fkey"
            columns: ["backup_id"]
            isOneToOne: false
            referencedRelation: "backup_history"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_ips: {
        Row: {
          auto_blocked: boolean | null
          blocked_at: string
          blocked_by: string | null
          blocked_until: string
          created_at: string
          id: string
          ip_address: string
          reason: string
        }
        Insert: {
          auto_blocked?: boolean | null
          blocked_at?: string
          blocked_by?: string | null
          blocked_until: string
          created_at?: string
          id?: string
          ip_address: string
          reason: string
        }
        Update: {
          auto_blocked?: boolean | null
          blocked_at?: string
          blocked_by?: string | null
          blocked_until?: string
          created_at?: string
          id?: string
          ip_address?: string
          reason?: string
        }
        Relationships: []
      }
      brand_standards: {
        Row: {
          active: boolean
          category: string
          checklist_items: Json | null
          created_at: string
          description: string | null
          id: string
          required: boolean
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          checklist_items?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          required?: boolean
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          checklist_items?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          required?: boolean
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_standards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount_earned: number
          appointment_id: string | null
          commission_type: string
          commission_value: number
          created_at: string | null
          employee_id: string
          id: string
          paid: boolean | null
          paid_at: string | null
          pet_shop_id: string
          reference_month: string
          service_id: string | null
        }
        Insert: {
          amount_earned: number
          appointment_id?: string | null
          commission_type: string
          commission_value: number
          created_at?: string | null
          employee_id: string
          id?: string
          paid?: boolean | null
          paid_at?: string | null
          pet_shop_id: string
          reference_month: string
          service_id?: string | null
        }
        Update: {
          amount_earned?: number
          appointment_id?: string | null
          commission_type?: string
          commission_value?: number
          created_at?: string | null
          employee_id?: string
          id?: string
          paid?: boolean | null
          paid_at?: string | null
          pet_shop_id?: string
          reference_month?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_audits: {
        Row: {
          audit_date: string
          auditor_id: string
          compliance_score: number
          created_at: string
          findings: Json | null
          id: string
          standard_id: string
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          audit_date: string
          auditor_id: string
          compliance_score: number
          created_at?: string
          findings?: Json | null
          id?: string
          standard_id: string
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          audit_date?: string
          auditor_id?: string
          compliance_score?: number
          created_at?: string
          findings?: Json | null
          id?: string
          standard_id?: string
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_audits_standard_id_fkey"
            columns: ["standard_id"]
            isOneToOne: false
            referencedRelation: "brand_standards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_audits_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_permissions: {
        Row: {
          employee_id: string
          granted_at: string | null
          granted_by: string
          id: string
          permission_id: string
        }
        Insert: {
          employee_id: string
          granted_at?: string | null
          granted_by: string
          id?: string
          permission_id: string
        }
        Update: {
          employee_id?: string
          granted_at?: string | null
          granted_by?: string
          id?: string
          permission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_permissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "petshop_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_jobs: {
        Row: {
          attempt_count: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          error_stack: string | null
          id: string
          job_name: string
          job_type: string
          last_attempted_at: string | null
          max_attempts: number | null
          metadata: Json | null
          next_retry_at: string | null
          payload: Json
          status: string | null
        }
        Insert: {
          attempt_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          job_name: string
          job_type: string
          last_attempted_at?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          payload: Json
          status?: string | null
        }
        Update: {
          attempt_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          job_name?: string
          job_type?: string
          last_attempted_at?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          payload?: Json
          status?: string | null
        }
        Relationships: []
      }
      franchises: {
        Row: {
          active: boolean
          address: string | null
          city: string | null
          cnpj: string | null
          code: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          owner_id: string
          phone: string | null
          royalty_percentage: number
          settings: Json | null
          state: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          city?: string | null
          cnpj?: string | null
          code: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          owner_id: string
          phone?: string | null
          royalty_percentage?: number
          settings?: Json | null
          state?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          city?: string | null
          cnpj?: string | null
          code?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          owner_id?: string
          phone?: string | null
          royalty_percentage?: number
          settings?: Json | null
          state?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      global_metrics: {
        Row: {
          description: string | null
          id: string
          last_calculated_at: string | null
          metric_name: string
          metric_type: string
          metric_value: number
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          last_calculated_at?: string | null
          metric_name: string
          metric_type: string
          metric_value: number
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          last_calculated_at?: string | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      impersonation_sessions: {
        Row: {
          active: boolean | null
          admin_user_id: string
          ended_at: string | null
          id: string
          ip_address: string | null
          reason: string | null
          started_at: string
          target_user_id: string
          user_agent: string | null
        }
        Insert: {
          active?: boolean | null
          admin_user_id: string
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          reason?: string | null
          started_at?: string
          target_user_id: string
          user_agent?: string | null
        }
        Update: {
          active?: boolean | null
          admin_user_id?: string
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          reason?: string | null
          started_at?: string
          target_user_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      ip_whitelist: {
        Row: {
          added_by: string | null
          created_at: string
          description: string | null
          id: string
          ip_address: string
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address: string
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: string
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_time: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          last_activity: string | null
          pet_shop_id: string
          points: number
          total_points_earned: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          last_activity?: string | null
          pet_shop_id: string
          points?: number
          total_points_earned?: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          last_activity?: string | null
          pet_shop_id?: string
          points?: number
          total_points_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          description: string | null
          id: string
          loyalty_points_id: string
          points: number
          transaction_type: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          loyalty_points_id: string
          points: number
          transaction_type: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          loyalty_points_id?: string
          points?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_loyalty_points_id_fkey"
            columns: ["loyalty_points_id"]
            isOneToOne: false
            referencedRelation: "loyalty_points"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          channel: string
          created_at: string | null
          id: string
          message: string
          name: string
          pet_shop_id: string
          recipients_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          target_audience: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          id?: string
          message: string
          name: string
          pet_shop_id: string
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          target_audience: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: string
          message?: string
          name?: string
          pet_shop_id?: string
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_backup_codes: {
        Row: {
          code_hash: string
          created_at: string | null
          id: string
          used: boolean | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mfa_secrets: {
        Row: {
          backup_codes_generated: boolean | null
          created_at: string | null
          enabled: boolean | null
          id: string
          secret_key: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes_generated?: boolean | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret_key: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes_generated?: boolean | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret_key?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      mfa_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          session_id: string
          user_agent: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          session_id: string
          user_agent?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      monitoramento_sistema: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          service_name: string
          status: string
          threshold_critical: number | null
          threshold_warning: number | null
          timestamp: string | null
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          service_name: string
          status?: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          timestamp?: string | null
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          service_name?: string
          status?: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          timestamp?: string | null
          value?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          appointment_id: string | null
          channel: string
          client_id: string
          created_at: string | null
          id: string
          message: string
          notification_type: string
          sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id?: string | null
          channel: string
          client_id: string
          created_at?: string | null
          id?: string
          message: string
          notification_type: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string | null
          channel?: string
          client_id?: string
          created_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          attempt_count: number | null
          channel: string
          created_at: string | null
          id: string
          last_error: string | null
          max_attempts: number | null
          message: string
          notification_id: string | null
          recipient: string
          scheduled_for: string | null
          sent_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          channel: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number | null
          message: string
          notification_id?: string | null
          recipient: string
          scheduled_for?: string | null
          sent_at?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          channel?: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number | null
          message?: string
          notification_id?: string | null
          recipient?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      password_resets: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string | null
          id: string
          installments: number | null
          paid_at: string | null
          payment_method: string
          status: string
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string | null
          id?: string
          installments?: number | null
          paid_at?: string | null
          payment_method: string
          status?: string
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string | null
          id?: string
          installments?: number | null
          paid_at?: string | null
          payment_method?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: Database["public"]["Enums"]["app_action"]
          created_at: string | null
          description: string | null
          id: string
          module: Database["public"]["Enums"]["app_module"]
          name: string
        }
        Insert: {
          action: Database["public"]["Enums"]["app_action"]
          created_at?: string | null
          description?: string | null
          id?: string
          module: Database["public"]["Enums"]["app_module"]
          name: string
        }
        Update: {
          action?: Database["public"]["Enums"]["app_action"]
          created_at?: string | null
          description?: string | null
          id?: string
          module?: Database["public"]["Enums"]["app_module"]
          name?: string
        }
        Relationships: []
      }
      pet_photos: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          description: string | null
          id: string
          pet_id: string
          photo_type: string
          photo_url: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          pet_id: string
          photo_type: string
          photo_url: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          pet_id?: string
          photo_type?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_photos_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_photos_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_shops: {
        Row: {
          address: string | null
          cakto_customer_id: string | null
          cakto_subscription_id: string | null
          city: string | null
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          email: string | null
          hours: string | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          owner_id: string
          phone: string | null
          state: string | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cakto_customer_id?: string | null
          cakto_subscription_id?: string | null
          city?: string | null
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          hours?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          owner_id: string
          phone?: string | null
          state?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cakto_customer_id?: string | null
          cakto_subscription_id?: string | null
          city?: string | null
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          hours?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          state?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          age: number | null
          allergies: string | null
          birth_date: string | null
          breed: string | null
          chronic_diseases: string | null
          coat_color: string | null
          coat_type: string | null
          created_at: string
          deleted_at: string | null
          gender: string | null
          grooming_preferences: string | null
          id: string
          name: string
          neutered: boolean | null
          observations: string | null
          owner_id: string
          photo_url: string | null
          restrictions: string | null
          size: string | null
          species: string | null
          temperament: string | null
          updated_at: string
          vaccination_history: Json | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          birth_date?: string | null
          breed?: string | null
          chronic_diseases?: string | null
          coat_color?: string | null
          coat_type?: string | null
          created_at?: string
          deleted_at?: string | null
          gender?: string | null
          grooming_preferences?: string | null
          id?: string
          name: string
          neutered?: boolean | null
          observations?: string | null
          owner_id: string
          photo_url?: string | null
          restrictions?: string | null
          size?: string | null
          species?: string | null
          temperament?: string | null
          updated_at?: string
          vaccination_history?: Json | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          birth_date?: string | null
          breed?: string | null
          chronic_diseases?: string | null
          coat_color?: string | null
          coat_type?: string | null
          created_at?: string
          deleted_at?: string | null
          gender?: string | null
          grooming_preferences?: string | null
          id?: string
          name?: string
          neutered?: boolean | null
          observations?: string | null
          owner_id?: string
          photo_url?: string | null
          restrictions?: string | null
          size?: string | null
          species?: string | null
          temperament?: string | null
          updated_at?: string
          vaccination_history?: Json | null
          weight?: number | null
        }
        Relationships: []
      }
      petshop_employees: {
        Row: {
          active: boolean | null
          created_at: string | null
          hired_at: string | null
          id: string
          pet_shop_id: string
          position: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          hired_at?: string | null
          id?: string
          pet_shop_id: string
          position?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          hired_at?: string | null
          id?: string
          pet_shop_id?: string
          position?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "petshop_employees_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_features: {
        Row: {
          created_at: string | null
          description: string | null
          feature_key: string
          feature_value: Json
          id: string
          plan_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_key: string
          feature_value?: Json
          id?: string
          plan_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_key?: string
          feature_value?: Json
          id?: string
          plan_name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          barcode: string | null
          category: string
          cost_price: number
          created_at: string | null
          deleted_at: string | null
          description: string | null
          expiry_date: string | null
          id: string
          min_stock_quantity: number | null
          name: string
          pet_shop_id: string
          sale_price: number
          sku: string | null
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          barcode?: string | null
          category: string
          cost_price: number
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          min_stock_quantity?: number | null
          name: string
          pet_shop_id: string
          sale_price: number
          sku?: string | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          barcode?: string | null
          category?: string
          cost_price?: number
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          min_stock_quantity?: number | null
          name?: string
          pet_shop_id?: string
          sale_price?: number
          sku?: string | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_backups: {
        Row: {
          backup_type: string
          created_at: string
          created_by: string
          date_range_end: string | null
          date_range_start: string | null
          error_message: string | null
          file_size_bytes: number | null
          format: string
          id: string
          metadata: Json | null
          pet_shop_id: string
          status: string
          storage_path: string | null
        }
        Insert: {
          backup_type: string
          created_at?: string
          created_by: string
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          format: string
          id?: string
          metadata?: Json | null
          pet_shop_id: string
          status?: string
          storage_path?: string | null
        }
        Update: {
          backup_type?: string
          created_at?: string
          created_by?: string
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          format?: string
          id?: string
          metadata?: Json | null
          pet_shop_id?: string
          status?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_backups_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          blocked_at: string | null
          blocked_by: string | null
          blocked_reason: string | null
          contact_preference: string | null
          created_at: string
          document: string | null
          full_name: string
          id: string
          is_blocked: boolean | null
          phone: string | null
          updated_at: string
          user_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          contact_preference?: string | null
          created_at?: string
          document?: string | null
          full_name: string
          id: string
          is_blocked?: boolean | null
          phone?: string | null
          updated_at?: string
          user_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          contact_preference?: string | null
          created_at?: string
          document?: string | null
          full_name?: string
          id?: string
          is_blocked?: boolean | null
          phone?: string | null
          updated_at?: string
          user_code?: string | null
        }
        Relationships: []
      }
      role_changes_audit: {
        Row: {
          action: string
          changed_by: string
          changed_user_id: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_role: Database["public"]["Enums"]["app_role"]
          old_role: Database["public"]["Enums"]["app_role"] | null
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_by: string
          changed_user_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_role: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_by?: string
          changed_user_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_role?: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          user_agent?: string | null
        }
        Relationships: []
      }
      royalties: {
        Row: {
          created_at: string
          franchise_id: string
          gross_revenue: number
          id: string
          notes: string | null
          paid_at: string | null
          reference_month: string
          royalty_amount: number
          royalty_percentage: number
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          franchise_id: string
          gross_revenue?: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          reference_month: string
          royalty_amount: number
          royalty_percentage: number
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          franchise_id?: string
          gross_revenue?: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          reference_month?: string
          royalty_amount?: number
          royalty_percentage?: number
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "royalties_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalties_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      satisfaction_surveys: {
        Row: {
          appointment_id: string
          client_id: string
          created_at: string | null
          feedback: string | null
          id: string
          rating: number
          would_recommend: boolean | null
        }
        Insert: {
          appointment_id: string
          client_id: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating: number
          would_recommend?: boolean | null
        }
        Update: {
          appointment_id?: string
          client_id?: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating?: number
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_surveys_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read: boolean | null
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read?: boolean | null
          severity: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read?: boolean | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      service_templates: {
        Row: {
          active: boolean | null
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          popularity_score: number | null
          suggested_duration_minutes: number
          suggested_price_max: number | null
          suggested_price_min: number | null
          times_used: number | null
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          popularity_score?: number | null
          suggested_duration_minutes: number
          suggested_price_max?: number | null
          suggested_price_min?: number | null
          times_used?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          popularity_score?: number | null
          suggested_duration_minutes?: number
          suggested_price_max?: number | null
          suggested_price_min?: number | null
          times_used?: number | null
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          name: string
          pet_shop_id: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          name: string
          pet_shop_id: string
          price: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          pet_shop_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      settings_passwords: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          pet_shop_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          pet_shop_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          pet_shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pet_shop"
            columns: ["pet_shop_id"]
            isOneToOne: true
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_schedule: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_blocked: boolean | null
          pet_shop_id: string
          reason: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_blocked?: boolean | null
          pet_shop_id: string
          reason?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_blocked?: boolean | null
          pet_shop_id?: string
          reason?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_schedule_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: string
          movement_type: string
          product_id: string
          quantity: number
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          movement_type: string
          product_id: string
          quantity: number
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          movement_type?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      structured_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          level: string
          message: string
          module: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          level: string
          message: string
          module: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          level?: string
          message?: string
          module?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          approved: boolean | null
          business_name: string
          created_at: string | null
          display_order: number | null
          featured: boolean | null
          highlight: string
          id: string
          image_url: string | null
          location: string
          owner_name: string
          pet_shop_id: string | null
          revenue_growth_percent: number | null
          satisfaction_rating: number | null
          segment: string
          testimonial: string
          total_clients: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          approved?: boolean | null
          business_name: string
          created_at?: string | null
          display_order?: number | null
          featured?: boolean | null
          highlight: string
          id?: string
          image_url?: string | null
          location: string
          owner_name: string
          pet_shop_id?: string | null
          revenue_growth_percent?: number | null
          satisfaction_rating?: number | null
          segment: string
          testimonial: string
          total_clients?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          approved?: boolean | null
          business_name?: string
          created_at?: string | null
          display_order?: number | null
          featured?: boolean | null
          highlight?: string
          id?: string
          image_url?: string | null
          location?: string
          owner_name?: string
          pet_shop_id?: string | null
          revenue_growth_percent?: number | null
          satisfaction_rating?: number | null
          segment?: string
          testimonial?: string
          total_clients?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "success_stories_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health: {
        Row: {
          error_message: string | null
          id: string
          last_check: string
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          status: string
          updated_at: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          last_check?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          status: string
          updated_at?: string
        }
        Update: {
          error_message?: string | null
          id?: string
          last_check?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          created_at: string | null
          id: string
          measured_at: string | null
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_unit: string | null
          metric_value: number
          status: string | null
          threshold_critical: number | null
          threshold_warning: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          measured_at?: string | null
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          measured_at?: string | null
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          log_type: string
          message: string
          module: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          log_type: string
          message: string
          module: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          log_type?: string
          message?: string
          module?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          avg_response_time_ms: number | null
          created_at: string
          errors_count: number | null
          failed_logins: number | null
          id: string
          metric_date: string
          successful_logins: number | null
          total_appointments: number | null
          total_pet_shops: number | null
          total_users: number | null
        }
        Insert: {
          avg_response_time_ms?: number | null
          created_at?: string
          errors_count?: number | null
          failed_logins?: number | null
          id?: string
          metric_date?: string
          successful_logins?: number | null
          total_appointments?: number | null
          total_pet_shops?: number | null
          total_users?: number | null
        }
        Update: {
          avg_response_time_ms?: number | null
          created_at?: string
          errors_count?: number | null
          failed_logins?: number | null
          id?: string
          metric_date?: string
          successful_logins?: number | null
          total_appointments?: number | null
          total_pet_shops?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          active: boolean
          created_at: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string
          settings: Json | null
          slug: string
          subscription_plan: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string
          settings?: Json | null
          slug: string
          subscription_plan?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string
          settings?: Json | null
          slug?: string
          subscription_plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_hierarchy: {
        Row: {
          active: boolean
          created_at: string
          franchise_id: string | null
          id: string
          permissions: string[] | null
          role: string
          tenant_id: string | null
          unit_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          franchise_id?: string | null
          id?: string
          permissions?: string[] | null
          role: string
          tenant_id?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          franchise_id?: string | null
          id?: string
          permissions?: string[] | null
          role?: string
          tenant_id?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_hierarchy_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_hierarchy_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_hierarchy_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean | null
          events: string[] | null
          id: string
          last_error: string | null
          last_status_code: number | null
          last_triggered_at: string | null
          metadata: Json | null
          name: string
          secret_token: string | null
          service_type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean | null
          events?: string[] | null
          id?: string
          last_error?: string | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          metadata?: Json | null
          name: string
          secret_token?: string | null
          service_type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean | null
          events?: string[] | null
          id?: string
          last_error?: string | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          metadata?: Json | null
          name?: string
          secret_token?: string | null
          service_type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      whatsapp_settings: {
        Row: {
          auto_confirmation: boolean
          auto_reminder: boolean
          business_phone: string | null
          created_at: string
          id: string
          pet_shop_id: string
          reminder_hours_before: number
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          auto_confirmation?: boolean
          auto_reminder?: boolean
          business_phone?: string | null
          created_at?: string
          id?: string
          pet_shop_id: string
          reminder_hours_before?: number
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          auto_confirmation?: boolean
          auto_reminder?: boolean
          business_phone?: string | null
          created_at?: string
          id?: string
          pet_shop_id?: string
          reminder_hours_before?: number
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_settings_pet_shop_id_fkey"
            columns: ["pet_shop_id"]
            isOneToOne: true
            referencedRelation: "pet_shops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_next_retry: { Args: { attempt_count: number }; Returns: string }
      calculate_pet_age: { Args: { birth_date: string }; Returns: number }
      check_admin_rate_limit: {
        Args: {
          p_admin_id: string
          p_endpoint: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_employee_limit: { Args: { _pet_shop_id: string }; Returns: boolean }
      cleanup_expired_blocks: { Args: never; Returns: number }
      cleanup_expired_invites: { Args: never; Returns: number }
      cleanup_expired_mfa_sessions: { Args: never; Returns: number }
      cleanup_expired_reset_codes: { Args: never; Returns: undefined }
      cleanup_old_login_attempts: { Args: never; Returns: undefined }
      cleanup_old_logs: { Args: never; Returns: number }
      create_critical_alert: {
        Args: {
          p_alert_type?: string
          p_context?: Json
          p_message: string
          p_title: string
        }
        Returns: string
      }
      find_nearby_pet_shops: {
        Args: {
          client_lat: number
          client_lng: number
          limit_results?: number
          radius_km?: number
        }
        Returns: {
          address: string
          city: string
          distance_km: number
          email: string
          id: string
          latitude: number
          logo_url: string
          longitude: number
          name: string
          phone: string
          state: string
        }[]
      }
      generate_pet_shop_code: { Args: never; Returns: string }
      generate_user_code: { Args: never; Returns: string }
      get_admin_notification_preferences: {
        Args: { _admin_id: string; _alert_type: string; _channel: string }
        Returns: boolean
      }
      get_appointments_by_period: {
        Args: {
          _end_date?: string
          _period?: string
          _pet_shop_id: string
          _start_date?: string
        }
        Returns: {
          cancelled: number
          completed: number
          day: string
          pending: number
        }[]
      }
      get_appointments_by_service: {
        Args: { _days_back?: number; _pet_shop_id: string }
        Returns: {
          avg_duration: number
          revenue: number
          service_count: number
          service_name: string
        }[]
      }
      get_consolidated_metrics: {
        Args: {
          _end_date: string
          _franchise_ids?: string[]
          _start_date: string
          _tenant_id: string
          _unit_ids?: string[]
        }
        Returns: Json
      }
      get_current_tenant: { Args: never; Returns: string }
      get_dashboard_stats: {
        Args: { _date?: string; _pet_shop_id: string }
        Returns: Json
      }
      get_employee_permissions: {
        Args: { _pet_shop_id: string; _user_id: string }
        Returns: {
          action: Database["public"]["Enums"]["app_action"]
          description: string
          module: Database["public"]["Enums"]["app_module"]
          permission_name: string
        }[]
      }
      get_monthly_revenue: {
        Args: { _months?: number; _pet_shop_id: string }
        Returns: {
          month: string
          revenue: number
        }[]
      }
      get_no_show_stats: {
        Args: { _date_end?: string; _date_start?: string; _pet_shop_id: string }
        Returns: Json
      }
      get_notification_queue_stats: { Args: never; Returns: Json }
      get_peak_hours: {
        Args: { _days_back?: number; _pet_shop_id: string }
        Returns: {
          appointment_count: number
          hour: number
        }[]
      }
      get_revenue_by_period: {
        Args: { _months?: number; _period?: string; _pet_shop_id: string }
        Returns: {
          period_label: string
          revenue: number
        }[]
      }
      get_security_stats: { Args: never; Returns: Json }
      get_system_health: { Args: never; Returns: Json }
      get_system_health_summary: { Args: never; Returns: Json }
      get_system_stats: { Args: never; Returns: Json }
      get_user_features: {
        Args: { _user_id: string }
        Returns: {
          description: string
          feature_key: string
          feature_value: Json
        }[]
      }
      get_weekly_appointments: {
        Args: { _pet_shop_id: string }
        Returns: {
          cancelled: number
          completed: number
          day: string
          pending: number
        }[]
      }
      has_feature: {
        Args: { _feature_key: string; _user_id: string }
        Returns: Json
      }
      has_permission: {
        Args: {
          _action: Database["public"]["Enums"]["app_action"]
          _module: Database["public"]["Enums"]["app_module"]
          _pet_shop_id: string
          _user_id: string
        }
        Returns: boolean
      }
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      has_role_safe: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      has_tenant_access: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_employee_of_petshop: {
        Args: { _pet_shop_id: string; _user_id: string }
        Returns: boolean
      }
      is_franchise_owner: {
        Args: { _franchise_id: string; _user_id: string }
        Returns: boolean
      }
      is_god_user:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      is_god_user_safe: { Args: never; Returns: boolean }
      is_ip_blocked: { Args: { _ip_address: string }; Returns: boolean }
      is_tenant_admin: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_blocked: { Args: { _user_id: string }; Returns: boolean }
      log_access: {
        Args: {
          _action: Database["public"]["Enums"]["app_action"]
          _metadata?: Json
          _module: Database["public"]["Enums"]["app_module"]
          _pet_shop_id: string
          _resource_id?: string
          _resource_type?: string
          _success?: boolean
          _user_id: string
        }
        Returns: string
      }
      mark_alert_read: { Args: { alert_id: string }; Returns: boolean }
      resolve_old_alerts: { Args: never; Returns: number }
      set_current_tenant: { Args: { _tenant_id: string }; Returns: undefined }
      update_global_metrics: { Args: never; Returns: undefined }
    }
    Enums: {
      app_action: "view" | "create" | "edit" | "delete" | "manage"
      app_module:
        | "dashboard"
        | "appointments"
        | "clients"
        | "pets"
        | "services"
        | "products"
        | "inventory"
        | "financial"
        | "reports"
        | "marketing"
        | "settings"
        | "employees"
      app_role:
        | "client"
        | "pet_shop"
        | "admin"
        | "professional"
        | "petshop_owner"
        | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_action: ["view", "create", "edit", "delete", "manage"],
      app_module: [
        "dashboard",
        "appointments",
        "clients",
        "pets",
        "services",
        "products",
        "inventory",
        "financial",
        "reports",
        "marketing",
        "settings",
        "employees",
      ],
      app_role: [
        "client",
        "pet_shop",
        "admin",
        "professional",
        "petshop_owner",
        "super_admin",
      ],
    },
  },
} as const

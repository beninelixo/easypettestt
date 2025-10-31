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
      appointments: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
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
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
          city: string | null
          code: string
          created_at: string
          description: string | null
          email: string | null
          hours: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          created_at?: string
          description?: string | null
          email?: string | null
          hours?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          created_at?: string
          description?: string | null
          email?: string | null
          hours?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          age: number | null
          allergies: string | null
          breed: string | null
          created_at: string
          id: string
          name: string
          observations: string | null
          owner_id: string
          photo_url: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          name: string
          observations?: string | null
          owner_id: string
          photo_url?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          name?: string
          observations?: string | null
          owner_id?: string
          photo_url?: string | null
          updated_at?: string
          weight?: number | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
          user_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_code?: string | null
        }
        Relationships: []
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
      service_templates: {
        Row: {
          active: boolean | null
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          suggested_duration_minutes: number
          suggested_price_max: number | null
          suggested_price_min: number | null
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          suggested_duration_minutes: number
          suggested_price_max?: number | null
          suggested_price_min?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          suggested_duration_minutes?: number
          suggested_price_max?: number | null
          suggested_price_min?: number | null
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_reset_codes: { Args: never; Returns: undefined }
      generate_pet_shop_code: { Args: never; Returns: string }
      generate_user_code: { Args: never; Returns: string }
      get_dashboard_stats: {
        Args: { _date?: string; _pet_shop_id: string }
        Returns: Json
      }
      get_monthly_revenue: {
        Args: { _months?: number; _pet_shop_id: string }
        Returns: {
          month: string
          revenue: number
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "pet_shop" | "admin"
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
      app_role: ["client", "pet_shop", "admin"],
    },
  },
} as const

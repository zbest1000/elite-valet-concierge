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
      apartments: {
        Row: {
          building: string
          complex_id: string | null
          created_at: string
          floor_number: number | null
          id: string
          is_active: boolean
          resident_id: string | null
          unit_number: string
          updated_at: string
        }
        Insert: {
          building: string
          complex_id?: string | null
          created_at?: string
          floor_number?: number | null
          id?: string
          is_active?: boolean
          resident_id?: string | null
          unit_number: string
          updated_at?: string
        }
        Update: {
          building?: string
          complex_id?: string | null
          created_at?: string
          floor_number?: number | null
          id?: string
          is_active?: boolean
          resident_id?: string | null
          unit_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apartments_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "complexes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartments_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          apartment_ids: string[] | null
          assignment_type: Database["public"]["Enums"]["assignment_type"]
          complex_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          start_date: string
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
          valet_id: string
        }
        Insert: {
          apartment_ids?: string[] | null
          assignment_type?: Database["public"]["Enums"]["assignment_type"]
          complex_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          valet_id: string
        }
        Update: {
          apartment_ids?: string[] | null
          assignment_type?: Database["public"]["Enums"]["assignment_type"]
          complex_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          valet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_complex_id_fkey"
            columns: ["complex_id"]
            isOneToOne: false
            referencedRelation: "complexes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_valet_id_fkey"
            columns: ["valet_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complexes: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complexes_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_schedules: {
        Row: {
          apartment_id: string | null
          building: string | null
          complex_id: string | null
          created_at: string
          created_by: string
          end_date: string | null
          floor_number: number | null
          id: string
          is_recurring_parent: boolean | null
          notes: string | null
          parent_schedule_id: string | null
          recurrence_days: number[] | null
          recurrence_end_date: string | null
          recurrence_type: string | null
          schedule_time_end: string | null
          schedule_time_start: string | null
          scheduled_date: string
          scheduled_time: string
          start_date: string | null
          status: string
          target_type: string | null
          updated_at: string
          valet_id: string | null
        }
        Insert: {
          apartment_id?: string | null
          building?: string | null
          complex_id?: string | null
          created_at?: string
          created_by: string
          end_date?: string | null
          floor_number?: number | null
          id?: string
          is_recurring_parent?: boolean | null
          notes?: string | null
          parent_schedule_id?: string | null
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          schedule_time_end?: string | null
          schedule_time_start?: string | null
          scheduled_date: string
          scheduled_time: string
          start_date?: string | null
          status?: string
          target_type?: string | null
          updated_at?: string
          valet_id?: string | null
        }
        Update: {
          apartment_id?: string | null
          building?: string | null
          complex_id?: string | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          floor_number?: number | null
          id?: string
          is_recurring_parent?: boolean | null
          notes?: string | null
          parent_schedule_id?: string | null
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          schedule_time_end?: string | null
          schedule_time_start?: string | null
          scheduled_date?: string
          scheduled_time?: string
          start_date?: string | null
          status?: string
          target_type?: string | null
          updated_at?: string
          valet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pickup_schedules_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_schedules_parent_schedule_id_fkey"
            columns: ["parent_schedule_id"]
            isOneToOne: false
            referencedRelation: "pickup_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_schedules_valet_id_fkey"
            columns: ["valet_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_dev_test_data: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { user_email: string }
        Returns: string
      }
    }
    Enums: {
      assignment_status: "pending" | "active" | "completed" | "cancelled"
      assignment_type: "weekly" | "monthly" | "one_time" | "recurring"
      user_role: "admin" | "elite_valet" | "resident"
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
      assignment_status: ["pending", "active", "completed", "cancelled"],
      assignment_type: ["weekly", "monthly", "one_time", "recurring"],
      user_role: ["admin", "elite_valet", "resident"],
    },
  },
} as const

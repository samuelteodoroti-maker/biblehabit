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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_updates: {
        Row: {
          accessibility_changes: string[] | null
          categories: string[] | null
          content: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          fixes: string[] | null
          highlights: string[] | null
          id: string
          improvements: string[] | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["update_status"]
          summary: string
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          accessibility_changes?: string[] | null
          categories?: string[] | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          fixes?: string[] | null
          highlights?: string[] | null
          id?: string
          improvements?: string[] | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["update_status"]
          summary: string
          title: string
          updated_at?: string | null
          version: string
        }
        Update: {
          accessibility_changes?: string[] | null
          categories?: string[] | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          fixes?: string[] | null
          highlights?: string[] | null
          id?: string
          improvements?: string[] | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["update_status"]
          summary?: string
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          created_at: string
          group_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number
          email: string | null
          id: string
          last_read_date: string | null
          longest_streak: number
          name: string | null
          total_chapters_read: number
          updated_at: string
          youversion_link: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          email?: string | null
          id: string
          last_read_date?: string | null
          longest_streak?: number
          name?: string | null
          total_chapters_read?: number
          updated_at?: string
          youversion_link?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          email?: string | null
          id?: string
          last_read_date?: string | null
          longest_streak?: number
          name?: string | null
          total_chapters_read?: number
          updated_at?: string
          youversion_link?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          log_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          log_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "reading_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_logs: {
        Row: {
          chapters_count: number
          chapters_text: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          plan_id: string | null
          reading_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chapters_count?: number
          chapters_text?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          reading_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chapters_count?: number
          chapters_text?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          reading_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reading_passages: {
        Row: {
          book_id: string
          created_at: string | null
          end_chapter: number | null
          end_verse: number | null
          id: string
          is_full_chapter: boolean | null
          reading_log_id: string
          start_chapter: number
          start_verse: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          end_chapter?: number | null
          end_verse?: number | null
          id?: string
          is_full_chapter?: boolean | null
          reading_log_id: string
          start_chapter: number
          start_verse?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          end_chapter?: number | null
          end_verse?: number | null
          id?: string
          is_full_chapter?: boolean | null
          reading_log_id?: string
          start_chapter?: number
          start_verse?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_passages_reading_log_id_fkey"
            columns: ["reading_log_id"]
            isOneToOne: false
            referencedRelation: "reading_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_plans: {
        Row: {
          books_today: string | null
          completed_days: number
          created_at: string
          description: string | null
          end_book: string | null
          goal_days: number
          id: string
          share_code: string | null
          start_book: string | null
          title: string
          total_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          books_today?: string | null
          completed_days?: number
          created_at?: string
          description?: string | null
          end_book?: string | null
          goal_days?: number
          id?: string
          share_code?: string | null
          start_book?: string | null
          title: string
          total_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          books_today?: string | null
          completed_days?: number
          created_at?: string
          description?: string | null
          end_book?: string | null
          goal_days?: number
          id?: string
          share_code?: string | null
          start_book?: string | null
          title?: string
          total_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          current_streak: number | null
          id: string | null
          longest_streak: number | null
          name: string | null
          total_chapters_read: number | null
        }
        Insert: {
          avatar_url?: string | null
          current_streak?: number | null
          id?: string | null
          longest_streak?: number | null
          name?: string | null
          total_chapters_read?: number | null
        }
        Update: {
          avatar_url?: string | null
          current_streak?: number | null
          id?: string | null
          longest_streak?: number | null
          name?: string | null
          total_chapters_read?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_user_streak: {
        Args: { _user_id: string }
        Returns: {
          current_streak: number
          longest_streak: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      join_group_by_code: { Args: { _code: string }; Returns: string }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "super_admin"
        | "support"
        | "analyst"
      update_status: "draft" | "scheduled" | "published" | "archived"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "super_admin",
        "support",
        "analyst",
      ],
      update_status: ["draft", "scheduled", "published", "archived"],
    },
  },
} as const
